"""Request/response models and the shared password policy."""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

MIN_PASSWORD_LENGTH = 10


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=200)


class AdminUserOut(BaseModel):
    id: str
    username: str
    display_name: str | None = None
    role: str = "admin"
    is_active: bool = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: AdminUserOut


class MediaOut(BaseModel):
    """Result of an upload — a relative URL the site resolves against the API host."""

    url: str
    filename: str
    width: int
    height: int
    bytes: int


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=200)

    @field_validator("new_password")
    @classmethod
    def not_too_simple(cls, value: str) -> str:
        if value.strip() != value:
            raise ValueError("Password cannot start or end with a space")
        if len(set(value)) < 5:
            raise ValueError("Password is too repetitive")
        return value


def password_policy_error(password: str, *, username: str = "") -> str | None:
    """Shared by the API, the CLI and the bootstrap step."""
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Use at least {MIN_PASSWORD_LENGTH} characters."
    if password.lower() == username.lower() and username:
        return "The password cannot be the same as the username."
    if len(set(password)) < 5:
        return "That password is too repetitive — mix in a few different characters."
    return None
