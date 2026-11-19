"""Application settings, read from environment variables (and `backend/.env`)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# Shipped default — refused in production by `app.main` so a deployment can never
# run with a known secret.
DEFAULT_JWT_SECRET = "dev-only-change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "ZEESHAN Admin API"
    environment: str = "development"

    # PostgreSQL in production: postgresql://user:password@host:5432/database
    # `sqlite:///./dev-admin.db` is supported for local development and tests only.
    database_url: str = "postgresql://zeeshan:zeeshan@localhost:5432/zeeshan"

    jwt_secret: str = DEFAULT_JWT_SECRET
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "zeeshan-admin"
    access_token_expire_minutes: int = 480

    # Comma-separated list of allowed browser origins.
    cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,http://localhost:5175,"
        "http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
    )

    # Brute-force protection for the login endpoint.
    login_max_attempts: int = 5
    login_window_seconds: int = 300

    # Optional first-run admin, created only when the table is empty.
    bootstrap_username: str = ""
    bootstrap_password: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.strip().lower() == "production"

    @property
    def uses_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
