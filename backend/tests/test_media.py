"""
Photo upload tests — validation, storage, serving and access control.
"""

from __future__ import annotations

import io
import unittest

import _env  # noqa: F401  — must be imported before the app (settings are cached)
from _env import MEDIA_DIR  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app import repository  # noqa: E402
from app.db import connection  # noqa: E402
from app.main import app  # noqa: E402
from app.security import hash_password  # noqa: E402

PASSWORD = "MediaUploadPass!2026"


def image_bytes(size: tuple[int, int] = (800, 600), fmt: str = "PNG") -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, (198, 62, 38)).save(buffer, format=fmt)
    return buffer.getvalue()


class MediaUploadTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.client.__enter__()

        with connection() as conn:
            if repository.get_by_username(conn, "media-tester") is None:
                repository.create_user(
                    conn,
                    username="media-tester",
                    password_hash=hash_password(PASSWORD),
                    role="admin",
                )

        login = cls.client.post(
            "/api/auth/login",
            json={"username": "media-tester", "password": PASSWORD},
        )
        cls.token = login.json()["access_token"]

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client.__exit__(None, None, None)

    def auth(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}

    def upload(self, data: bytes, filename: str = "dish.png", content_type: str = "image/png"):
        return self.client.post(
            "/api/media",
            headers=self.auth(),
            files={"file": (filename, data, content_type)},
        )

    # ------------------------------------------------------------------ tests
    def test_upload_requires_a_valid_token(self) -> None:
        anonymous = self.client.post(
            "/api/media", files={"file": ("dish.png", image_bytes(), "image/png")}
        )
        self.assertEqual(anonymous.status_code, 401)

        bad_token = self.client.post(
            "/api/media",
            headers={"Authorization": "Bearer not-a-real-token"},
            files={"file": ("dish.png", image_bytes(), "image/png")},
        )
        self.assertEqual(bad_token.status_code, 401)

    def test_upload_is_normalised_to_a_sized_jpeg(self) -> None:
        response = self.upload(image_bytes((2400, 1800)))
        self.assertEqual(response.status_code, 201, response.text)

        body = response.json()
        self.assertTrue(body["url"].startswith("/media/"), body["url"])
        self.assertTrue(body["url"].endswith(".jpg"))
        self.assertEqual((body["width"], body["height"]), (1600, 1200))
        self.assertGreater(body["bytes"], 0)
        self.assertTrue((MEDIA_DIR / body["filename"]).is_file())

    def test_uploaded_photo_is_served_with_safe_headers(self) -> None:
        url = self.upload(image_bytes()).json()["url"]

        served = self.client.get(url)
        self.assertEqual(served.status_code, 200)
        self.assertEqual(served.headers["content-type"], "image/jpeg")
        self.assertEqual(served.headers["x-content-type-options"], "nosniff")

        # The stored file really is a JPEG.
        self.assertEqual(Image.open(io.BytesIO(served.content)).format, "JPEG")

    def test_filenames_are_random(self) -> None:
        first = self.upload(image_bytes()).json()["url"]
        second = self.upload(image_bytes()).json()["url"]
        self.assertNotEqual(first, second)

    def test_rejects_a_non_image_content_type(self) -> None:
        response = self.upload(b"just a text file", "notes.txt", "text/plain")
        self.assertEqual(response.status_code, 415)

    def test_rejects_a_file_that_only_claims_to_be_an_image(self) -> None:
        response = self.upload(b"\x89PNG\r\n\x1a\nthis is not really a png", "fake.png", "image/png")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "That file is not a readable JPEG, PNG or WebP image.")

    def test_rejects_svg_markup(self) -> None:
        svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
        response = self.upload(svg, "logo.svg", "image/svg+xml")
        self.assertEqual(response.status_code, 415)

    def test_rejects_files_over_the_limit(self) -> None:
        oversized = b"\xff\xd8\xff" + b"0" * (1024 * 1024 + 32)
        response = self.upload(oversized, "big.jpg", "image/jpeg")
        self.assertEqual(response.status_code, 413)
        self.assertIn("1 MB", response.json()["detail"])

    def test_webp_uploads_are_accepted(self) -> None:
        response = self.upload(image_bytes((640, 480), "WEBP"), "dish.webp", "image/webp")
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual((response.json()["width"], response.json()["height"]), (640, 480))


if __name__ == "__main__":
    unittest.main()
