"""
Response schemas for API endpoints.
Defines the structure of API responses based on Valyu search results.
"""
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class ProblemAnalysis(BaseModel):
    """Analysis of the user's problem."""

    identified_issue: str = Field(
        ...,
        description="Brief description of the identified problem"
    )
    primary_service_category: str = Field(
        ...,
        description="Main service type needed"
    )
    secondary_categories: list[str] = Field(
        default_factory=list,
        description="Additional relevant service categories"
    )
    urgency_level: str = Field(
        ...,
        description="Estimated urgency level"
    )


class Company(BaseModel):
    """Information about a service provider company."""

    company_name: str = Field(
        ...,
        description="Official business name"
    )
    service_categories: list[str] = Field(
        ...,
        description="Services offered relevant to the problem"
    )
    website_url: Optional[str] = Field(
        None,
        description="Company website URL"
    )
    phone_number: Optional[str] = Field(
        None,
        description="Primary contact number"
    )
    address: Optional[str] = Field(
        None,
        description="Physical business address"
    )
    distance_from_user: Optional[str] = Field(
        None,
        description="Approximate distance from user's location"
    )
    operating_hours: Optional[str] = Field(
        None,
        description="Business operating hours"
    )
    rating: Optional[float] = Field(
        None,
        ge=0.0,
        le=5.0,
        description="Average customer rating (0-5)"
    )
    rating_source: Optional[str] = Field(
        None,
        description="Source of the rating"
    )
    total_reviews: Optional[int] = Field(
        None,
        ge=0,
        description="Total number of reviews"
    )
    description: str = Field(
        ...,
        description="Brief description of services"
    )
    specializations: list[str] = Field(
        default_factory=list,
        description="Specific areas of expertise"
    )
    license_info: Optional[str] = Field(
        None,
        description="License or certification information"
    )
    emergency_service: bool = Field(
        default=False,
        description="Offers 24/7 or emergency service"
    )
    same_day_service: bool = Field(
        default=False,
        description="Offers same-day appointments"
    )
    free_estimates: Optional[bool] = Field(
        None,
        description="Offers free estimates or quotes"
    )
    years_in_business: Optional[int] = Field(
        None,
        ge=0,
        description="Years of operation"
    )
    relevance_score: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="How well this company matches the problem (1-10)"
    )


class SearchMetadata(BaseModel):
    """Metadata about the search results."""

    total_companies_found: int = Field(
        ...,
        ge=0,
        description="Total number of companies found"
    )
    search_date: str = Field(
        ...,
        description="ISO 8601 date when search was performed"
    )
    search_radius_miles: float = Field(
        ...,
        description="The search radius in miles that was used"
    )
    recommendations: str = Field(
        ...,
        description="Brief advice on which companies are the best candidates for platform onboarding"
    )


class UserLocation(BaseModel):
    """User's location information."""

    latitude: float = Field(
        ...,
        description="The latitude coordinate provided"
    )
    longitude: float = Field(
        ...,
        description="The longitude coordinate provided"
    )
    resolved_address: str = Field(
        ...,
        description="Human-readable address/city name derived from coordinates"
    )


class ServiceSearchResponse(BaseModel):
    """Complete response for service search request."""

    problem_analysis: ProblemAnalysis = Field(
        ...,
        description="Analysis of the user's problem"
    )
    user_location: UserLocation = Field(
        ...,
        description="The location that was searched"
    )
    companies: list[Company] = Field(
        ...,
        description="List of matching service providers"
    )
    metadata: SearchMetadata = Field(
        ...,
        description="Search metadata and recommendations"
    )


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str = Field(
        ...,
        description="Error type or code"
    )
    message: str = Field(
        ...,
        description="Human-readable error message"
    )
    details: Optional[dict] = Field(
        None,
        description="Additional error details"
    )


class RawSearchMetadata(BaseModel):
    """Metadata for raw search results."""

    total_results: int = Field(
        ...,
        ge=0,
        description="Total number of raw search results"
    )
    search_date: str = Field(
        ...,
        description="ISO 8601 date when search was performed"
    )
    search_radius_miles: float = Field(
        ...,
        description="The search radius in miles that was used"
    )
    user_location: dict = Field(
        ...,
        description="User's latitude and longitude"
    )
    problem_description: str = Field(
        ...,
        description="The user's original problem description"
    )


class RawServiceSearchResponse(BaseModel):
    """Response containing raw search results as JSON."""

    raw_search_results: list[dict] = Field(
        ...,
        description="Raw search results from Valyu API"
    )
    metadata: RawSearchMetadata = Field(
        ...,
        description="Search metadata"
    )


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(
        ...,
        description="Service status"
    )
    version: str = Field(
        ...,
        description="API version"
    )
    environment: str = Field(
        ...,
        description="Current environment"
    )
