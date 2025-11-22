"""
FastAPI application entry point.
Main application configuration and route registration.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import health, service
from app.core.config import get_settings
from app.core.logging import get_logger, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    setup_logging()
    logger = get_logger()
    settings = get_settings()

    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Log level: {settings.log_level}")

    yield

    # Shutdown
    logger.info(f"Shutting down {settings.app_name}")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        FastAPI: Configured application instance
    """
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "API for finding local home service providers based on user location "
            "and problem description. Powered by Valyu AI search."
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(health.router)
    app.include_router(service.router)

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        logger = get_logger()
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "details": {"error_type": type(exc).__name__},
            },
        )

    return app


# Create application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.is_development,
        log_level=settings.log_level.lower(),
    )
