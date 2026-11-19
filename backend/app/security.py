"""
Password hashing and access tokens.

* Passwords: `hashlib.scrypt` (N=2^14, r=8, p=1) with a 16-byte random salt, stored as
  `scrypt$n$r$p$salt$hash`. Standard-library only — nothing to compile, and it stays
  strong on any platform.
* Tokens: signed JWTs (HS256, PyJWT) with `sub`, `username`, `role`, `iat`, `exp`, `iss`.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from .config import settings

SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_KEYLEN = 32
SALT_BYTES = 16


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(SALT_BYTES)
    derived = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_KEYLEN,
        maxmem=64 * 1024 * 1024,
    )
    return f"scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${_b64(salt)}${_b64(derived)}"


def verify_password(password: str, stored: str | None) -> bool:
    """Constant-time verification; unknown/corrupt hashes simply fail."""
    if not stored or not stored.startswith("scrypt$"):
        return False

    try:
        _, n_raw, r_raw, p_raw, salt_raw, hash_raw = stored.split("$")
        salt = base64.b64decode(salt_raw)
        expected = base64.b64decode(hash_raw)
        derived = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=int(n_raw),
            r=int(r_raw),
            p=int(p_raw),
            dklen=len(expected),
            maxmem=64 * 1024 * 1024,
        )
    except (ValueError, TypeError):
        return False

    return hmac.compare_digest(derived, expected)


# A real hash of an unguessable throwaway password: verifying against it when the
# username does not exist keeps failed-login timing (and therefore the response)
# indistinguishable from a wrong password.
DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(24))


def create_access_token(user: dict[str, Any]) -> tuple[str, int]:
    """Returns the signed token and its lifetime in seconds."""
    expires_in = settings.access_token_expire_minutes * 60
    issued_at = datetime.now(timezone.utc)

    payload = {
        "sub": user["id"],
        "username": user["username"],
        "role": user.get("role", "admin"),
        "iss": settings.jwt_issuer,
        "iat": int(issued_at.timestamp()),
        "exp": int((issued_at + timedelta(seconds=expires_in)).timestamp()),
    }

    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, expires_in


def decode_access_token(token: str) -> dict[str, Any]:
    """Raises `jwt.PyJWTError` when the token is invalid, expired or unsigned by us."""
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
        issuer=settings.jwt_issuer,
        options={"require": ["exp", "iat", "sub"]},
    )
