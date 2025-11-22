"""
Health check and system status routes.
"""
from fastapi import APIRouter, status

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.response import HealthResponse

logger = get_logger()

router = APIRouter(
    prefix="/api/v1",
    tags=["health"],
)


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Returns the current health status of the API service",
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns basic information about the service status,
    version, and environment configuration.

    Returns:
        HealthResponse: Service health information
    """
    settings = get_settings()

    response = HealthResponse(
        status="healthy",
        version=settings.app_version,
        environment=settings.environment,
    )

    logger.debug("Health check successful")
    return response


@router.get(
    "/",
    include_in_schema=False,
)
async def root() -> dict:
    """
    Root endpoint redirect.

    Returns basic API information.
    """
    settings = get_settings()

    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs_url": "/docs",
        "health_url": "/api/v1/health",
    }
