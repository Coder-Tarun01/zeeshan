"""Upload endpoint for dish photos shown by the menu manager."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool

from ..config import settings
from ..deps import get_current_user
from ..media import ImageValidationError, store_image
from ..schemas import MediaOut

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


@router.post("", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(..., description="JPEG, PNG or WebP photo"),
    _: dict[str, Any] = Depends(get_current_user),
) -> MediaOut:
    """Staff only: stores a normalised copy and returns its public URL + dimensions."""
    if file.content_type and file.content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG, PNG or WebP photo.",
        )

    max_bytes = settings.max_upload_mb * 1024 * 1024
    # Read one byte past the limit so an oversized file is detected without buffering it all.
    data = await file.read(max_bytes + 1)

    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Photos must be {settings.max_upload_mb} MB or smaller.",
        )

    try:
        # Pillow is CPU-bound — keep it off the event loop.
        stored = await run_in_threadpool(store_image, data)
    except ImageValidationError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    return MediaOut(**stored)
