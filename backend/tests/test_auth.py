"""
Auth API tests — stdlib unittest + FastAPI's TestClient.

Run from `backend/`:
    .venv/Scripts/python -m unittest discover -s tests -v      (Windows)
    .venv/bin/python -m unittest discover -s tests -v          (macOS/Linux)

Uses a throwaway SQLite database so no Postgres server is required.
"""

from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path

# Must be set before importing the app: settings are read once at import time.
_TEMP_DIR = tempfile.mkdtemp(prefix="zeeshan-admin-tests-")
_DB_PATH = Path(_TEMP_DIR) / "test-admin.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_PATH.as_posix()}"
os.environ["JWT_SECRET"] = "test-secret-please-do-not-use-in-production"
os.environ["ENVIRONMENT"] = "test"
os.environ["CORS_ORIGINS"] = "http://localhost:5175"
os.environ["BOOTSTRAP_USERNAME"] = ""
os.environ["BOOTSTRAP_PASSWORD"] = ""

from fastapi.testclient import TestClient  # noqa: E402

from app import repository  # noqa: E402
from app.db import connection  # noqa: E402
from app.main import app  # noqa: E402
from app.security import hash_password  # noqa: E402

PASSWORD = "ZeeshanBiryani2026!"
NEW_PASSWORD = "KakinadaFryer#77"


class AuthApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.client.__enter__()  # runs the lifespan (schema + bootstrap)

        with connection() as conn:
            repository.create_user(
                conn,
                username="owner",
                password_hash=hash_password(PASSWORD),
                display_name="Shop Owner",
                role="owner",
            )
            repository.create_user(
                conn,
                username="closed",
                password_hash=hash_password(PASSWORD),
                role="admin",
            )
            closed = repository.get_by_username(conn, "closed")
            repository.set_active(conn, closed["id"], False)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client.__exit__(None, None, None)

    # ---------------------------------------------------------------- helpers
    def login(self, username: str = "owner", password: str = PASSWORD):
        return self.client.post("/api/auth/login", json={"username": username, "password": password})

    def auth_header(self, token: str) -> dict[str, str]:
        return {"Authorization": f"Bearer {token}"}

    # ------------------------------------------------------------------ tests
    def test_health_reports_database(self) -> None:
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["database"], "ok")

    def test_login_success_returns_token_and_safe_user(self) -> None:
        response = self.login()
        self.assertEqual(response.status_code, 200)

        body = response.json()
        self.assertTrue(body["access_token"])
        self.assertEqual(body["token_type"], "bearer")
        self.assertGreater(body["expires_in"], 0)
        self.assertEqual(body["user"]["username"], "owner")
        self.assertEqual(body["user"]["role"], "owner")
        self.assertNotIn("password_hash", body["user"])
        self.assertNotIn("password", body)

    def test_login_is_case_insensitive_on_username(self) -> None:
        self.assertEqual(self.login("  OWNER  ").status_code, 200)

    def test_login_wrong_password_and_unknown_user_look_identical(self) -> None:
        wrong = self.login(password="not-the-password")
        missing = self.login(username="nobody-here")

        self.assertEqual(wrong.status_code, 401)
        self.assertEqual(missing.status_code, 401)
        self.assertEqual(wrong.json()["detail"], missing.json()["detail"])
        self.assertEqual(wrong.json()["detail"], "Incorrect username or password.")

    def test_inactive_account_cannot_sign_in(self) -> None:
        self.assertEqual(self.login(username="closed").status_code, 401)

    def test_me_requires_a_valid_bearer_token(self) -> None:
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)

        bad = self.client.get("/api/auth/me", headers=self.auth_header("not-a-real-token"))
        self.assertEqual(bad.status_code, 401)

        token = self.login().json()["access_token"]
        good = self.client.get("/api/auth/me", headers=self.auth_header(token))
        self.assertEqual(good.status_code, 200)
        self.assertEqual(good.json()["username"], "owner")

    def test_token_signed_with_another_secret_is_rejected(self) -> None:
        import jwt as pyjwt

        forged = pyjwt.encode(
            {"sub": "someone", "iat": 1, "exp": 9999999999, "iss": "zeeshan-admin"},
            "a-different-secret",
            algorithm="HS256",
        )
        response = self.client.get("/api/auth/me", headers=self.auth_header(forged))
        self.assertEqual(response.status_code, 401)

    def test_change_password_flow(self) -> None:
        token = self.login().json()["access_token"]

        wrong = self.client.post(
            "/api/auth/change-password",
            headers=self.auth_header(token),
            json={"current_password": "nope", "new_password": NEW_PASSWORD},
        )
        self.assertEqual(wrong.status_code, 400)

        too_short = self.client.post(
            "/api/auth/change-password",
            headers=self.auth_header(token),
            json={"current_password": PASSWORD, "new_password": "short"},
        )
        self.assertEqual(too_short.status_code, 422)

        changed = self.client.post(
            "/api/auth/change-password",
            headers=self.auth_header(token),
            json={"current_password": PASSWORD, "new_password": NEW_PASSWORD},
        )
        self.assertEqual(changed.status_code, 204)

        self.assertEqual(self.login(password=PASSWORD).status_code, 401)
        self.assertEqual(self.login(password=NEW_PASSWORD).status_code, 200)

        # Put it back so the shared fixture keeps working.
        token = self.login(password=NEW_PASSWORD).json()["access_token"]
        restore = self.client.post(
            "/api/auth/change-password",
            headers=self.auth_header(token),
            json={"current_password": NEW_PASSWORD, "new_password": PASSWORD},
        )
        self.assertEqual(restore.status_code, 204)

    def test_logout_is_accepted_with_a_token(self) -> None:
        token = self.login().json()["access_token"]
        self.assertEqual(
            self.client.post("/api/auth/logout", headers=self.auth_header(token)).status_code,
            204,
        )

    def test_repeated_failures_are_throttled(self) -> None:
        username = "throttle-target"
        statuses = [
            self.login(username=username, password="wrong-again").status_code for _ in range(6)
        ]

        self.assertEqual(statuses[:5], [401] * 5)
        self.assertEqual(statuses[5], 429)

        response = self.login(username=username, password="wrong-again")
        self.assertIn("Retry-After", response.headers)

    def test_validation_rejects_empty_payload(self) -> None:
        self.assertEqual(self.client.post("/api/auth/login", json={}).status_code, 422)
        self.assertEqual(
            self.client.post("/api/auth/login", json={"username": "", "password": ""}).status_code,
            422,
        )

    def test_me_survives_repeated_requests(self) -> None:
        """Regression: the DB dependency is opened and closed on threadpool workers."""
        token = self.login().json()["access_token"]

        statuses = [
            self.client.get("/api/auth/me", headers=self.auth_header(token)).status_code
            for _ in range(5)
        ]
        self.assertEqual(statuses, [200] * 5)

    def test_connection_can_be_closed_from_another_thread(self) -> None:
        """Regression: sqlite3 objects are thread-affine unless opened with check_same_thread=False."""
        import threading

        from app.config import settings

        if not settings.uses_sqlite:
            self.skipTest("only applies to the SQLite development driver")

        manager = connection()
        conn = manager.__enter__()
        self.assertIsNotNone(conn.execute("SELECT 1 AS ok").fetchone())

        outcome: list[str] = []

        def close_elsewhere() -> None:
            try:
                manager.__exit__(None, None, None)
                outcome.append("closed")
            except Exception as error:  # noqa: BLE001 - reported through the assertion
                outcome.append(repr(error))

        worker = threading.Thread(target=close_elsewhere)
        worker.start()
        worker.join()

        self.assertEqual(outcome, ["closed"])


if __name__ == "__main__":
    unittest.main()
