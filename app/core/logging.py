"""
Logging configuration using loguru.
Provides structured logging with rotation and formatting.
"""
import sys
from pathlib import Path

from loguru import logger

from app.core.config import get_settings


def setup_logging() -> None:
    """
    Configure application logging.
    Removes default handler and adds custom formatters.
    """
    settings = get_settings()

    # Remove default handler
    logger.remove()

    # Console handler with color formatting
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.log_level,
        colorize=True,
    )

    # File handler with rotation
    if not settings.is_development:
        log_path = Path("logs")
        log_path.mkdir(exist_ok=True)

        logger.add(
            log_path / "app_{time:YYYY-MM-DD}.log",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level=settings.log_level,
            rotation="00:00",  # Rotate at midnight
            retention="30 days",  # Keep logs for 30 days
            compression="zip",  # Compress rotated logs
            enqueue=True,  # Thread-safe logging
        )

    logger.info(f"Logging configured with level: {settings.log_level}")


def get_logger():
    """Get the configured logger instance."""
    return logger
