"""
Example client demonstrating how to use the Home Service Finder API.

This script shows various ways to interact with the API:
1. Basic search for service providers
2. Handling different types of problems
3. Error handling
4. Processing responses
"""
import json
from typing import Dict, Any

import requests


class ServiceFinderClient:
    """Client for interacting with the Home Service Finder API."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        Initialize the client.

        Args:
            base_url: Base URL of the API (default: http://localhost:8000)
        """
        self.base_url = base_url.rstrip("/")
        self.search_endpoint = f"{self.base_url}/api/v1/services/search"
        self.categories_endpoint = f"{self.base_url}/api/v1/services/categories"
        self.health_endpoint = f"{self.base_url}/api/v1/health"

    def health_check(self) -> Dict[str, Any]:
        """
        Check if the API is healthy and running.

        Returns:
            dict: Health status information
        """
        try:
            response = requests.get(self.health_endpoint, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Health check failed: {e}")
            raise

    def get_categories(self) -> Dict[str, Any]:
        """
        Get available service categories.

        Returns:
            dict: Available service categories with descriptions
        """
        try:
            response = requests.get(self.categories_endpoint, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to get categories: {e}")
            raise

    def search_services(
        self,
        latitude: float,
        longitude: float,
        problem_description: str,
        search_radius_miles: float = 2.0,
    ) -> Dict[str, Any]:
        """
        Search for local service providers.

        Args:
            latitude: User's latitude coordinate
            longitude: User's longitude coordinate
            problem_description: Description of the household problem
            search_radius_miles: Search radius in miles (default: 2.0)

        Returns:
            dict: Search results with companies and metadata

        Raises:
            requests.exceptions.HTTPError: If the API returns an error
        """
        payload = {
            "latitude": latitude,
            "longitude": longitude,
            "problem_description": problem_description,
            "search_radius_miles": search_radius_miles,
        }

        try:
            response = requests.post(
                self.search_endpoint,
                json=payload,
                timeout=60,  # Longer timeout for search operations
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.HTTPError as e:
            # Handle API errors
            if response.status_code == 400:
                error_detail = response.json()
                print(f"Validation error: {error_detail.get('detail')}")
            elif response.status_code == 500:
                print("Server error occurred while searching")
            raise

        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    def print_search_results(self, results: Dict[str, Any]) -> None:
        """
        Print search results in a formatted way.

        Args:
            results: Search results from the API
        """
        print("\n" + "=" * 80)
        print("SEARCH RESULTS")
        print("=" * 80)

        # User location
        user_location = results.get("user_location", {})
        print(f"\nSearch Location: {user_location.get('resolved_address')}")
        print(f"Coordinates: ({user_location.get('latitude')}, {user_location.get('longitude')})")

        # Problem analysis
        analysis = results.get("problem_analysis", {})
        print(f"\nProblem Identified: {analysis.get('identified_issue')}")
        print(f"Service Category: {analysis.get('primary_service_category')}")
        print(f"Urgency Level: {analysis.get('urgency_level')}")

        # Companies
        companies = results.get("companies", [])
        print(f"\nFound {len(companies)} service providers:")
        print("-" * 80)

        for idx, company in enumerate(companies, 1):
            print(f"\n{idx}. {company.get('company_name')}")
            print(f"   Services: {', '.join(company.get('service_categories', []))}")
            print(f"   Phone: {company.get('phone_number', 'N/A')}")
            print(f"   Website: {company.get('website_url', 'N/A')}")
            print(f"   Address: {company.get('address', 'N/A')}")

            if company.get("rating"):
                print(
                    f"   Rating: {company['rating']}/5.0 "
                    f"({company.get('total_reviews', 0)} reviews on "
                    f"{company.get('rating_source', 'N/A')})"
                )

            if company.get("emergency_service"):
                print("   ⚡ 24/7 Emergency Service Available")
            if company.get("same_day_service"):
                print("   🚀 Same-Day Service Available")
            if company.get("free_estimates"):
                print("   💰 Free Estimates")

            print(f"   Relevance Score: {company.get('relevance_score')}/10")
            print(f"   Description: {company.get('description')}")

        # Metadata
        metadata = results.get("metadata", {})
        print("\n" + "-" * 80)
        print(f"Search Radius: {metadata.get('search_radius_miles')} miles")
        print(f"Recommendations: {metadata.get('recommendations')}")
        print(f"Search Date: {metadata.get('search_date')}")
        print("=" * 80 + "\n")


def example_1_basic_search():
    """Example 1: Basic search for a plumbing issue in San Francisco."""
    print("\n### EXAMPLE 1: Basic Plumbing Search (2 mile radius) ###\n")

    client = ServiceFinderClient()

    # Check if API is healthy
    health = client.health_check()
    print(f"API Status: {health['status']}")
    print(f"Version: {health['version']}")
    print(f"Environment: {health['environment']}\n")

    # Search for plumbing services in San Francisco
    # Coordinates: San Francisco, CA
    results = client.search_services(
        latitude=37.7749,
        longitude=-122.4194,
        problem_description="Kitchen sink is leaking water from the pipe underneath, "
        "water pooling on the floor",
        search_radius_miles=2.0,  # Default 2 mile radius
    )

    # Print results
    client.print_search_results(results)


def example_2_electrical_issue():
    """Example 2: Search for electrical services with wider radius."""
    print("\n### EXAMPLE 2: Electrical Issue (5 mile radius) ###\n")

    client = ServiceFinderClient()

    # Brooklyn, NY coordinates
    results = client.search_services(
        latitude=40.6782,
        longitude=-73.9442,
        problem_description="Electrical outlet in the living room stopped working, "
        "no power to any devices plugged in",
        search_radius_miles=5.0,  # Wider 5 mile radius
    )

    client.print_search_results(results)


def example_3_hvac_emergency():
    """Example 3: Search for HVAC emergency service with extended radius."""
    print("\n### EXAMPLE 3: HVAC Emergency (10 mile radius) ###\n")

    client = ServiceFinderClient()

    # Phoenix, AZ coordinates
    results = client.search_services(
        latitude=33.4484,
        longitude=-112.0740,
        problem_description="Air conditioner completely stopped working in 110 degree "
        "weather, blowing warm air only",
        search_radius_miles=10.0,  # Extended 10 mile radius for emergencies
    )

    client.print_search_results(results)


def example_4_get_categories():
    """Example 4: Get available service categories."""
    print("\n### EXAMPLE 4: Available Service Categories ###\n")

    client = ServiceFinderClient()

    categories = client.get_categories()

    print("Available Service Categories:")
    print("-" * 80)

    for category in categories.get("categories", []):
        print(f"\n{category['name'].upper()}")
        print(f"  Description: {category['description']}")
        print(f"  Examples: {', '.join(category['examples'])}")

    print("\n" + "-" * 80)


def example_5_error_handling():
    """Example 5: Demonstrate error handling."""
    print("\n### EXAMPLE 5: Error Handling ###\n")

    client = ServiceFinderClient()

    # Test with invalid input (problem too short)
    try:
        print("Attempting search with invalid input (description too short)...")
        results = client.search_services(
            latitude=40.7128,
            longitude=-74.0060,
            problem_description="help",  # Too short - should fail
        )
    except requests.exceptions.HTTPError as e:
        print(f"✓ Expected error occurred: {e}")
        print("✓ The API correctly rejected invalid input.\n")


def example_6_save_results():
    """Example 6: Search and save results to file."""
    print("\n### EXAMPLE 6: Save Results to File (15 mile radius) ###\n")

    client = ServiceFinderClient()

    # Seattle, WA coordinates
    results = client.search_services(
        latitude=47.6062,
        longitude=-122.3321,
        problem_description="Garage door opener making grinding noise and not closing "
        "completely",
        search_radius_miles=15.0,
    )

    # Save to JSON file
    filename = "search_results.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"✓ Results saved to {filename}")
    print(f"✓ Found {len(results.get('companies', []))} companies")
    print(f"✓ Search radius: {results.get('metadata', {}).get('search_radius_miles')} miles")

    # Print top 3 companies
    print("\nTop 3 Companies by Relevance:")
    for idx, company in enumerate(results.get("companies", [])[:3], 1):
        print(
            f"{idx}. {company['company_name']} - "
            f"Relevance: {company['relevance_score']}/10"
        )


def main():
    """Run all examples."""
    print("\n" + "=" * 80)
    print("HOME SERVICE FINDER API - CLIENT EXAMPLES")
    print("=" * 80)

    try:
        # Run examples
        example_1_basic_search()
        example_2_electrical_issue()
        example_3_hvac_emergency()
        example_4_get_categories()
        example_5_error_handling()
        example_6_save_results()

        print("\n" + "=" * 80)
        print("ALL EXAMPLES COMPLETED SUCCESSFULLY")
        print("=" * 80 + "\n")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the API.")
        print("Make sure the API server is running:")
        print("  python app/main.py")
        print("  or")
        print("  uvicorn app.main:app --reload\n")

    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        raise


if __name__ == "__main__":
    main()
