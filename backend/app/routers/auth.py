"""Authentication endpoints: sign in, current session, sign out, change password."""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from .. import repository
from ..config import settings
from ..db import Connection
from ..deps import get_current_user, get_db
from ..schemas import (
    AdminUserOut,
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    password_policy_error,
)
from ..security import (
    DUMMY_PASSWORD_HASH,
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Simple in-process throttle: fine for a single admin API instance. If the API is
# scaled to several workers, move this to Redis or a `login_attempts` table.
_attempts: dict[str, list[float]] = {}


def _client_key(request: Request, username: str) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded.split(",")[0].strip() or (request.client.host if request.client else "unknown")
    return f"{client_ip}:{username.lower()}"


def _check_rate_limit(key: str) -> None:
    now = time.monotonic()
    window = settings.login_window_seconds
    recent = [stamp for stamp in _attempts.get(key, []) if now - stamp < window]

    if len(recent) >= settings.login_max_attempts:
        retry_after = max(1, int(window - (now - recent[0])))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please wait a few minutes and try again.",
            headers={"Retry-After": str(retry_after)},
        )

    _attempts[key] = recent


def _record_failure(key: str) -> None:
    _attempts.setdefault(key, []).append(time.monotonic())


def _clear(key: str) -> None:
    _attempts.pop(key, None)


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    request: Request,
    conn: Connection = Depends(get_db),
) -> LoginResponse:
    username = repository.normalise_username(payload.username)
    key = _client_key(request, username)
    _check_rate_limit(key)

    user = repository.get_by_username(conn, username)

    # Always run the KDF so a missing username and a wrong password look identical.
    password_ok = verify_password(payload.password, (user or {}).get("password_hash") or DUMMY_PASSWORD_HASH)

    if user is None or not password_ok or not bool(user.get("is_active", False)):
        _record_failure(key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    _clear(key)
    repository.touch_last_login(conn, user["id"])

    token, expires_in = create_access_token(user)
    return LoginResponse(
        access_token=token,
        expires_in=expires_in,
        user=AdminUserOut(**repository.to_public(user)),
    )


@router.get("/me", response_model=AdminUserOut)
def read_current_user(user: dict[str, Any] = Depends(get_current_user)) -> AdminUserOut:
    return AdminUserOut(**repository.to_public(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_: dict[str, Any] = Depends(get_current_user)) -> Response:
    """Stateless tokens: the client drops it. Kept so the UI has a real endpoint."""
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    user: dict[str, Any] = Depends(get_current_user),
    conn: Connection = Depends(get_db),
) -> Response:
    if not verify_password(payload.current_password, user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your current password is not correct.",
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Choose a password you have not used here before.",
        )

    problem = password_policy_error(payload.new_password, username=user["username"])
    if problem:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=problem)

    repository.set_password_hash(conn, user["id"], hash_password(payload.new_password))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
