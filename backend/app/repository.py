"""Admin-user queries. Plain SQL on purpose — small surface, portable across drivers."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from .db import Connection, fetch_all, fetch_one


def normalise_username(username: str) -> str:
    return username.strip().lower()


def count_users(conn: Connection) -> int:
    row = fetch_one(conn, "SELECT COUNT(*) AS total FROM admin_users")
    return int(row["total"]) if row else 0


def get_by_username(conn: Connection, username: str) -> dict[str, Any] | None:
    return fetch_one(
        conn,
        "SELECT * FROM admin_users WHERE username = %s",
        (normalise_username(username),),
    )


def get_by_id(conn: Connection, user_id: str) -> dict[str, Any] | None:
    return fetch_one(conn, "SELECT * FROM admin_users WHERE id = %s", (user_id,))


def list_users(conn: Connection) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        "SELECT id, username, display_name, role, is_active, created_at, last_login_at"
        " FROM admin_users ORDER BY created_at",
    )


def create_user(
    conn: Connection,
    *,
    username: str,
    password_hash: str,
    display_name: str | None = None,
    role: str = "admin",
) -> dict[str, Any]:
    user = {
        "id": uuid.uuid4().hex,
        "username": normalise_username(username),
        "password_hash": password_hash,
        "display_name": (display_name or "").strip() or None,
        "role": role,
        "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
    }

    conn.execute(
        "INSERT INTO admin_users (id, username, password_hash, display_name, role, is_active, created_at)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (
            user["id"],
            user["username"],
            user["password_hash"],
            user["display_name"],
            user["role"],
            True,
            user["created_at"],
        ),
    )
    return user


def touch_last_login(conn: Connection, user_id: str) -> None:
    conn.execute(
        "UPDATE admin_users SET last_login_at = %s WHERE id = %s",
        (datetime.now(timezone.utc).replace(tzinfo=None), user_id),
    )


def set_password_hash(conn: Connection, user_id: str, password_hash: str) -> None:
    conn.execute(
        "UPDATE admin_users SET password_hash = %s WHERE id = %s",
        (password_hash, user_id),
    )


def set_active(conn: Connection, user_id: str, is_active: bool) -> None:
    conn.execute(
        "UPDATE admin_users SET is_active = %s WHERE id = %s",
        (is_active, user_id),
    )


def to_public(user: dict[str, Any]) -> dict[str, Any]:
    """The fields safe to return to the browser (never the hash)."""
    return {
        "id": user["id"],
        "username": user["username"],
        "display_name": user.get("display_name"),
        "role": user.get("role", "admin"),
        "is_active": bool(user.get("is_active", True)),
    }
