"""
Request schemas for API endpoints.
Defines the structure of incoming requests.
"""
from pydantic import BaseModel, Field, field_validator


class ServiceSearchRequest(BaseModel):
    """Request schema for searching home service providers."""

    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="User's latitude coordinate",
        examples=[51.5074, 40.7128, 43.6532]
    )

    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="User's longitude coordinate",
        examples=[-0.1278, -74.0060, -79.3832]
    )

    problem_description: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Detailed description of the household problem or service needed",
        examples=[
            "Leaking pipe under kitchen sink, water pooling on floor",
            "Electrical outlet in bedroom stopped working",
            "Air conditioner making loud grinding noise",
            "Need lawn maintenance and landscaping"
        ]
    )

    search_radius_miles: float = Field(
        default=2.0,
        ge=0.5,
        le=50.0,
        description="Search radius in miles (0.5-50 miles). Default is 2 miles.",
        examples=[1.0, 2.0, 5.0, 10.0, 15.0]
    )

    @field_validator("problem_description")
    @classmethod
    def validate_problem(cls, v: str) -> str:
        """Validate and clean problem description."""
        v = v.strip()
        if not v:
            raise ValueError("Problem description cannot be empty")
        if len(v.split()) < 3:
            raise ValueError("Problem description must contain at least 3 words")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 37.7749,
                "longitude": -122.4194,
                "problem_description": "Water heater making loud banging noises and leaking water from the bottom",
                "search_radius_miles": 5.0
            }
        }
