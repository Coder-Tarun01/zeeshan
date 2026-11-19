"""Shared FastAPI dependencies: database handle and the signed-in admin."""

from __future__ import annotations

from typing import Any, Iterator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from . import repository
from .db import Connection, connection
from .security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False, description="Admin access token")

UNAUTHORISED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Your session has expired — please sign in again.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_db() -> Iterator[Connection]:
    with connection() as conn:
        yield conn


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    conn: Connection = Depends(get_db),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise UNAUTHORISED

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError as error:
        raise UNAUTHORISED from error

    user = repository.get_by_id(conn, str(payload.get("sub", "")))
    if user is None or not bool(user.get("is_active", False)):
        raise UNAUTHORISED

    return user
