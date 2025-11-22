"""
API routes for home service provider search.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.logging import get_logger
from app.schemas.request import ServiceSearchRequest
from app.schemas.response import ServiceSearchResponse, RawServiceSearchResponse, ErrorResponse
from app.services.valyu_service import ValyuService, get_valyu_service

logger = get_logger()

router = APIRouter(
    prefix="/api/v1/services",
    tags=["services"],
    responses={
        500: {"model": ErrorResponse, "description": "Internal server error"},
        400: {"model": ErrorResponse, "description": "Bad request"},
    },
)


@router.post(
    "/search",
    response_model=RawServiceSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Search for local service providers",
    description=(
        "Search for local home service providers based on user location and problem description. "
        "Returns raw search results as JSON (parsing step skipped)."
    ),
    response_description="Raw search results from Valyu API",
)
async def search_services(
    request: ServiceSearchRequest,
    valyu_service: ValyuService = Depends(get_valyu_service),
) -> RawServiceSearchResponse:
    """
    Search for local home service providers.

    MODIFIED: Now returns raw search results as JSON instead of parsed company data.

    This endpoint takes a user's location and problem description, then uses the Valyu API
    to find relevant local service providers. The results are returned as raw JSON without
    parsing to company format.

    Args:
        request: Service search request containing location and problem description
        valyu_service: Injected Valyu service instance

    Returns:
        RawServiceSearchResponse with raw search results as JSON

    Raises:
        HTTPException: 400 for invalid input, 500 for server errors
    """
    try:
        logger.info(f"Received search request for coordinates: ({request.latitude}, {request.longitude})")

        # Call Valyu service
        response = await valyu_service.search_service_providers(request)

        # Log success
        logger.info(
            f"Search completed - Stored {len(response.raw_search_results)} raw results "
            f"for coordinates ({request.latitude}, {request.longitude})"
        )

        return response

    except ValueError as e:
        # Client errors (validation, parsing, etc.)
        logger.warning(f"Validation error in search request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "VALIDATION_ERROR",
                "message": str(e),
                "details": {"latitude": request.latitude, "longitude": request.longitude},
            },
        )

    except KeyError as e:
        # Response parsing errors
        logger.error(f"Response parsing error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "RESPONSE_PARSING_ERROR",
                "message": "Failed to parse service provider data",
                "details": {"missing_field": str(e)},
            },
        )

    except Exception as e:
        # General server errors
        logger.error(f"Unexpected error in search endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while searching for service providers",
                "details": {"error_type": type(e).__name__},
            },
        )


@router.get(
    "/categories",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get available service categories",
    description="Returns a list of all available home service categories",
)
async def get_service_categories() -> dict:
    """
    Get list of available service categories.

    Returns:
        Dictionary with available service categories and their descriptions
    """
    categories = {
        "categories": [
            {
                "name": "plumbing",
                "description": "Pipe repairs, leaks, drain cleaning, water heater installation",
                "examples": ["leaking pipe", "clogged drain", "water heater repair"],
            },
            {
                "name": "electrical",
                "description": "Wiring, outlet installation, circuit breaker repairs, lighting",
                "examples": ["outlet not working", "circuit breaker tripping", "light fixture installation"],
            },
            {
                "name": "hvac",
                "description": "Heating, ventilation, air conditioning repair and maintenance",
                "examples": ["AC not cooling", "furnace not heating", "strange noises from HVAC"],
            },
            {
                "name": "appliance_repair",
                "description": "Repair of household appliances",
                "examples": ["refrigerator not cooling", "dishwasher not draining", "washing machine broken"],
            },
            {
                "name": "carpentry",
                "description": "Wood repairs, cabinet installation, deck building",
                "examples": ["damaged cabinet", "deck repair", "custom shelving"],
            },
            {
                "name": "landscaping",
                "description": "Lawn care, tree trimming, garden design",
                "examples": ["lawn maintenance", "tree removal", "garden design"],
            },
            {
                "name": "pest_control",
                "description": "Removal and prevention of pests",
                "examples": ["termite inspection", "rodent removal", "bed bug treatment"],
            },
            {
                "name": "general_contracting",
                "description": "Home renovations, remodeling, construction",
                "examples": ["bathroom remodel", "kitchen renovation", "home addition"],
            },
            {
                "name": "automotive_repair",
                "description": "Car and vehicle maintenance and repairs",
                "examples": ["oil change", "brake repair", "engine diagnostics"],
            },
        ]
    }

    logger.debug("Returning service categories")
    return categories
