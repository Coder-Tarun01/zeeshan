"""
ZEESHAN Admin API — authentication for the `/admin` menu manager.

Run locally:
    uvicorn app.main:app --reload --port 8000

Endpoints (all JSON):
    POST /api/auth/login            → bearer token + user
    GET  /api/auth/me               → current user (needs `Authorization: Bearer …`)
    POST /api/auth/logout           → 204
    POST /api/auth/change-password  → 204
    GET  /api/health                → service + database status
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import repository
from .config import DEFAULT_JWT_SECRET, settings
from .db import connection, fetch_one, init_schema
from .routers import auth
from .schemas import password_policy_error
from .security import hash_password

logger = logging.getLogger("zeeshan.admin")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")


def _init_database(attempts: int = 5, delay_seconds: float = 2.0) -> None:
    """The database may still be starting up (docker compose, managed Postgres)."""
    last_error: Exception | None = None

    for attempt in range(1, attempts + 1):
        try:
            init_schema()
            logger.info("Database ready")
            return
        except Exception as error:  # noqa: BLE001 - retried below
            last_error = error
            logger.warning("Database not ready (attempt %s/%s): %s", attempt, attempts, error)
            time.sleep(delay_seconds)

    raise RuntimeError(f"Could not initialise the database: {last_error}")


def _bootstrap_admin() -> None:
    """Creates the very first admin from env vars — only when no user exists yet."""
    username = settings.bootstrap_username.strip()
    password = settings.bootstrap_password

    if not username or not password:
        return

    with connection() as conn:
        if repository.count_users(conn) > 0:
            return

        problem = password_policy_error(password, username=username)
        if problem:
            logger.error("BOOTSTRAP_PASSWORD rejected: %s", problem)
            return

        repository.create_user(
            conn,
            username=username,
            password_hash=hash_password(password),
            display_name=username,
            role="owner",
        )
        logger.info("Created the first admin account '%s'", username)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    if settings.is_production:
        if settings.jwt_secret == DEFAULT_JWT_SECRET:
            raise RuntimeError(
                "JWT_SECRET must be set to a long random value when ENVIRONMENT=production."
            )
        if len(settings.jwt_secret) < 32:
            raise RuntimeError("JWT_SECRET must be at least 32 characters in production.")

    _init_database()
    _bootstrap_admin()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Sign-in and session endpoints for the ZEESHAN menu manager.",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)

app.include_router(auth.router, prefix="/api")


@app.exception_handler(Exception)
async def unhandled_error(_: Request, error: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s", error)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong on our side."})


@app.get("/api/health", tags=["health"])
def health() -> dict[str, Any]:
    """Used by hosting health checks and by the admin UI when the API is unreachable."""
    database = "ok"
    try:
        with connection() as conn:
            fetch_one(conn, "SELECT 1 AS ok")
    except Exception as error:  # noqa: BLE001 - reported, not raised
        logger.warning("Health check database error: %s", error)
        database = "unavailable"

    return {
        "status": "ok" if database == "ok" else "degraded",
        "database": database,
        "environment": settings.environment,
    }
