"""
Uploaded dish photos.

Every upload is decoded, checked to be a real JPEG/PNG/WebP, rotated upright, stripped
of metadata, capped to `MEDIA_MAX_DIMENSION` and re-encoded as an optimised JPEG. The
stored filename is random, so a client can never choose a path.
"""

from __future__ import annotations

import io
import uuid
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps, UnidentifiedImageError

from .config import settings

# Pillow's detected format — the allow-list that keeps SVG/GIF/HTML out.
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}

JPEG_QUALITY = 82


class ImageValidationError(ValueError):
    """The upload is not an acceptable image (message is safe to show to the admin)."""


def media_root() -> Path:
    root = Path(settings.media_dir).expanduser()
    if not root.is_absolute():
        root = Path.cwd() / root
    root.mkdir(parents=True, exist_ok=True)
    return root


def store_image(data: bytes) -> dict[str, Any]:
    """Validates + normalises the bytes and writes them to the media directory."""
    if not data:
        raise ImageValidationError("The file is empty.")

    try:
        with Image.open(io.BytesIO(data)) as source:
            detected = (source.format or "").upper()
            if detected not in ALLOWED_FORMATS:
                raise ImageValidationError("Upload a JPEG, PNG or WebP photo.")

            source.load()  # decode now: rejects truncated or disguised files

            image = ImageOps.exif_transpose(source)
            image = image.convert("RGB")

            limit = settings.media_max_dimension
            if max(image.size) > limit:
                image.thumbnail((limit, limit), Image.LANCZOS)

            buffer = io.BytesIO()
            image.save(
                buffer,
                format="JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )
            width, height = image.size

    except ImageValidationError:
        raise
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise ImageValidationError("That file is not a readable JPEG, PNG or WebP image.") from error

    filename = f"{uuid.uuid4().hex}.jpg"
    (media_root() / filename).write_bytes(buffer.getvalue())

    return {
        "url": f"{settings.media_url_prefix}/{filename}",
        "filename": filename,
        "width": width,
        "height": height,
        "bytes": buffer.tell(),
    }
