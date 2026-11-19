"""
Test environment.

Everything here must run *before* `app.config` is imported, because settings are read
once at import time. `test_auth` and `test_media` both import this module first.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

TEMP_ROOT = Path(tempfile.mkdtemp(prefix="zeeshan-tests-"))
DB_PATH = TEMP_ROOT / "test-admin.db"
MEDIA_DIR = TEMP_ROOT / "uploads"

os.environ["DATABASE_URL"] = f"sqlite:///{DB_PATH.as_posix()}"
os.environ["JWT_SECRET"] = "test-secret-please-do-not-use-in-production"
os.environ["ENVIRONMENT"] = "test"
os.environ["CORS_ORIGINS"] = "http://localhost:5175"
os.environ["BOOTSTRAP_USERNAME"] = ""
os.environ["BOOTSTRAP_PASSWORD"] = ""
os.environ["MEDIA_DIR"] = str(MEDIA_DIR)
# A small cap keeps the "too big" test cheap.
os.environ["MAX_UPLOAD_MB"] = "1"
