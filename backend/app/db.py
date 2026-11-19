"""
Database access.

Production uses **PostgreSQL** through psycopg 3. `sqlite:///...` URLs are accepted
so the API can be run (and tested) without a Postgres server — the SQL used here is
deliberately portable, and the only difference is the placeholder style.
"""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Iterator, Sequence

from .config import settings

# Keep SQLite's date handling explicit (Python 3.12+ deprecates the implicit adapter)
# so values round-trip as datetimes, matching what Postgres returns.
sqlite3.register_adapter(datetime, lambda value: value.replace(tzinfo=None).isoformat(sep=" "))
sqlite3.register_converter("TIMESTAMP", lambda raw: datetime.fromisoformat(raw.decode()))


class Connection:
    """Tiny adapter so callers can always write `%s` placeholders and get dict rows."""

    def __init__(self, raw: Any, *, sqlite: bool) -> None:
        self._raw = raw
        self._sqlite = sqlite

    def execute(self, sql: str, params: Sequence[Any] = ()) -> Any:
        if self._sqlite:
            sql = sql.replace("%s", "?")
        cursor = self._raw.cursor()
        cursor.execute(sql, tuple(params))
        return cursor

    def execute_script(self, statements: Sequence[str]) -> None:
        for statement in statements:
            self.execute(statement)

    def commit(self) -> None:
        self._raw.commit()

    def rollback(self) -> None:
        self._raw.rollback()


@contextmanager
def connection() -> Iterator[Connection]:
    """One connection per request/command, committed on success."""
    if settings.uses_sqlite:
        path = settings.database_url.split("sqlite:///", 1)[-1] or ":memory:"
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        # `check_same_thread=False`: FastAPI may close the dependency on a different
        # threadpool worker than the one that opened it. Each request has its own
        # connection, so nothing is shared concurrently.
        raw = sqlite3.connect(
            path,
            timeout=10,
            detect_types=sqlite3.PARSE_DECLTYPES,
            check_same_thread=False,
        )
        raw.row_factory = sqlite3.Row
        raw.execute("PRAGMA journal_mode = WAL")
    else:
        import psycopg  # imported lazily: not needed for the SQLite dev path
        from psycopg.rows import dict_row

        raw = psycopg.connect(settings.database_url, row_factory=dict_row)

    conn = Connection(raw, sqlite=settings.uses_sqlite)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        raw.close()


def fetch_one(conn: Connection, sql: str, params: Sequence[Any] = ()) -> dict[str, Any] | None:
    row = conn.execute(sql, params).fetchone()
    return dict(row) if row is not None else None


def fetch_all(conn: Connection, sql: str, params: Sequence[Any] = ()) -> list[dict[str, Any]]:
    return [dict(row) for row in conn.execute(sql, params).fetchall()]


# Portable DDL: TEXT ids (generated in Python), no sequences, no Postgres-only types.
SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS admin_users (
        id              TEXT PRIMARY KEY,
        username        TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL,
        display_name    TEXT,
        role            TEXT NOT NULL DEFAULT 'admin',
        is_active       BOOLEAN NOT NULL DEFAULT TRUE,
        created_at      TIMESTAMP NOT NULL,
        last_login_at   TIMESTAMP
    )
    """,
    "CREATE UNIQUE INDEX IF NOT EXISTS admin_users_username_key ON admin_users (username)",
]


def init_schema() -> None:
    with connection() as conn:
        conn.execute_script(SCHEMA_STATEMENTS)
