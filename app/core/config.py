"""
Configuration management using pydantic-settings.
Loads configuration from environment variables and .env file.
"""
from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Valyu API Configuration
    valyu_api_key: str = Field(
        ...,
        description="Valyu API key for authentication"
    )

    # API Configuration
    api_host: str = Field(
        default="0.0.0.0",
        description="API host address"
    )
    api_port: int = Field(
        default=8000,
        description="API port number"
    )

    # Application Configuration
    app_name: str = Field(
        default="Home Service Finder API",
        description="Application name"
    )
    app_version: str = Field(
        default="1.0.0",
        description="Application version"
    )
    environment: str = Field(
        default="development",
        description="Environment: development, staging, production"
    )

    # Logging Configuration
    log_level: str = Field(
        default="INFO",
        description="Logging level"
    )

    # CORS Configuration
    cors_origins: list[str] = Field(
        default=["*"],
        description="Allowed CORS origins"
    )

    # Valyu Search Configuration
    max_results: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of results to return"
    )
    search_timeout: int = Field(
        default=30,
        ge=5,
        le=120,
        description="Search timeout in seconds"
    )

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment value."""
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"Environment must be one of {allowed}")
        return v.lower()

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level value."""
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in allowed:
            raise ValueError(f"Log level must be one of {allowed}")
        return v.upper()

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to ensure settings are loaded only once.
    """
    return Settings()
