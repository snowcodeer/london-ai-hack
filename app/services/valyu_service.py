"""
Valyu API integration service.
Handles all interactions with the Valyu API for searching home service providers.
"""
from pathlib import Path
from typing import Any, Dict

from valyu import Valyu

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.request import ServiceSearchRequest
from app.schemas.response import ServiceSearchResponse, RawServiceSearchResponse

logger = get_logger()


class ValyuService:
    """Service class for Valyu API integration."""

    def __init__(self):
        """Initialize Valyu service with API key from settings."""
        settings = get_settings()
        self.valyu_client = Valyu(api_key=settings.valyu_api_key)
        self.prompt_template = self._load_prompt_template()
        logger.info("ValyuService initialized successfully")

    def _load_prompt_template(self) -> str:
        """
        Load the prompt template from file.

        Returns:
            str: The prompt template with placeholders

        Raises:
            FileNotFoundError: If prompt file doesn't exist
        """
        prompt_path = Path(__file__).parent.parent.parent / "valyu_prompt.md"

        if not prompt_path.exists():
            logger.error(f"Prompt template not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt template not found: {prompt_path}")

        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()

        logger.debug(f"Loaded prompt template from {prompt_path}")
        return template

    def _format_prompt(self, request: ServiceSearchRequest) -> str:
        """
        Format the prompt template with user input.

        Args:
            request: Service search request with coordinates and problem

        Returns:
            str: Formatted prompt ready for Valyu API
        """
        prompt = self.prompt_template.replace(
            "{USER_LATITUDE}", str(request.latitude)
        ).replace(
            "{USER_LONGITUDE}", str(request.longitude)
        ).replace(
            "{SEARCH_RADIUS_MILES}", str(request.search_radius_miles)
        ).replace(
            "{USER_PROBLEM_DESCRIPTION}", request.problem_description
        )

        logger.debug(
            f"Formatted prompt for coordinates: ({request.latitude}, {request.longitude}), "
            f"radius: {request.search_radius_miles} miles"
        )
        return prompt

    def _convert_search_results_to_companies(self, search_results: list, request: ServiceSearchRequest) -> Dict[str, Any]:
        """
        Convert Valyu SearchResult dicts to our company format.

        Args:
            search_results: List of SearchResult dicts from Valyu
            request: Original search request

        Returns:
            Dict in our expected format
        """
        from datetime import datetime

        companies = []
        for idx, result in enumerate(search_results[:20], 1):  # Limit to top 20
            # Results are dicts after model_dump()
            title = result.get('title', '')
            url = result.get('url', '')
            content = result.get('content', '')
            description_text = result.get('description', '')
            relevance = result.get('relevance_score', 0.8)

            # Extract company name from title
            company_name = title.split('|')[0].strip() if '|' in title else title

            # Parse description for service info
            description = description_text or (content[:200] if content else "Professional service provider")

            company = {
                "company_name": company_name,
                "service_categories": ["plumbing", "home maintenance"],
                "website_url": url,
                "phone_number": None,  # Not available in search results
                "address": None,
                "distance_from_user": None,
                "operating_hours": None,
                "rating": None,
                "rating_source": None,
                "total_reviews": None,
                "description": description,
                "specializations": [],
                "license_info": None,
                "emergency_service": "emergency" in content.lower() if content else False,
                "same_day_service": "same day" in content.lower() or "same-day" in content.lower() if content else False,
                "free_estimates": "free estimate" in content.lower() if content else None,
                "years_in_business": None,
                "relevance_score": round(relevance * 10, 1) if relevance else 8.0
            }
            companies.append(company)

        # Create response structure
        return {
            "problem_analysis": {
                "identified_issue": request.problem_description,
                "primary_service_category": "home maintenance",
                "secondary_categories": [],
                "urgency_level": "moderate"
            },
            "user_location": {
                "latitude": request.latitude,
                "longitude": request.longitude,
                "resolved_address": f"Location ({request.latitude}, {request.longitude})"
            },
            "companies": companies,
            "metadata": {
                "total_companies_found": len(companies),
                "search_date": datetime.utcnow().isoformat() + "Z",
                "search_radius_miles": request.search_radius_miles,
                "recommendations": f"Found {len(companies)} potential service providers. Contact top-rated companies first."
            }
        }

    def _parse_valyu_response(self, response: Any, request: ServiceSearchRequest) -> Dict[str, Any]:
        """
        Parse and validate Valyu API response.

        MODIFIED: Now returns raw search results as JSON instead of parsing to company format.

        Args:
            response: Raw response from Valyu API
            request: Original request for context

        Returns:
            Dict containing raw search results as JSON

        Raises:
            ValueError: If response cannot be parsed
        """
        from datetime import datetime

        try:
            # Handle Valyu SearchResponse object
            if hasattr(response, 'model_dump'):
                response_dict = response.model_dump()

                # Check if the search was successful
                if not response_dict.get('success'):
                    error_msg = response_dict.get('error', 'Unknown error from Valyu API')
                    logger.error(f"Valyu search failed: {error_msg}")
                    raise ValueError(f"Valyu search failed: {error_msg}")

                # Extract the results - these are SearchResult objects
                results = response_dict.get('results', [])

                if isinstance(results, list) and len(results) > 0:
                    # Store raw search results as JSON (skip parsing/conversion)
                    logger.info(f"Storing {len(results)} raw search results as JSON")

                    # Return raw results with minimal metadata
                    data = {
                        "raw_search_results": results,
                        "metadata": {
                            "total_results": len(results),
                            "search_date": datetime.utcnow().isoformat() + "Z",
                            "search_radius_miles": request.search_radius_miles,
                            "user_location": {
                                "latitude": request.latitude,
                                "longitude": request.longitude
                            },
                            "problem_description": request.problem_description
                        }
                    }

                    logger.info(f"Successfully stored {len(results)} raw search results")
                    return data
                else:
                    raise ValueError(f"No search results returned from Valyu")

            else:
                raise ValueError(f"Unexpected response type: {type(response)}")

        except Exception as e:
            logger.error(f"Error parsing Valyu response: {e}", exc_info=True)
            raise

    async def search_service_providers(
        self, request: ServiceSearchRequest
    ) -> RawServiceSearchResponse:
        """
        Search for local service providers using Valyu API.

        MODIFIED: Now returns raw search results as JSON instead of parsed company data.

        Args:
            request: Service search request with coordinates and problem description

        Returns:
            RawServiceSearchResponse: Raw search results as JSON with metadata

        Raises:
            Exception: If Valyu API call fails or response is invalid
        """
        logger.info(
            f"Searching for service providers - Coordinates: ({request.latitude}, {request.longitude}), "
            f"Radius: {request.search_radius_miles} miles, "
            f"Problem: {request.problem_description[:50]}..."
        )

        try:
            # Format the prompt with user input
            formatted_prompt = self._format_prompt(request)

            # Call Valyu API (synchronous call in async context)
            logger.debug("Calling Valyu API...")
            import asyncio
            loop = asyncio.get_event_loop()
            raw_response = await loop.run_in_executor(
                None,
                self.valyu_client.search,
                formatted_prompt
            )

            # Parse response (now returns raw results as JSON)
            parsed_data = self._parse_valyu_response(raw_response, request)

            # Convert to Pydantic model for validation
            response = RawServiceSearchResponse(**parsed_data)

            logger.info(
                f"Search completed successfully - Stored {len(response.raw_search_results)} raw results"
            )
            return response

        except Exception as e:
            logger.error(f"Error in search_service_providers: {str(e)}", exc_info=True)
            raise


# Singleton instance for dependency injection
_valyu_service: ValyuService | None = None


def get_valyu_service() -> ValyuService:
    """
    Get or create ValyuService singleton instance.
    Used for FastAPI dependency injection.

    Returns:
        ValyuService: Singleton service instance
    """
    global _valyu_service
    if _valyu_service is None:
        _valyu_service = ValyuService()
    return _valyu_service
