Search the web for local home maintenance service companies near the coordinates (latitude: {USER_LATITUDE}, longitude: {USER_LONGITUDE}) within a {SEARCH_RADIUS_MILES} mile radius that can provide services for: {USER_PROBLEM_DESCRIPTION}

CONTEXT:
This is a business discovery tool for a home maintenance service platform (similar to Uber for home services). A user has submitted a service request with their GPS coordinates, but there are currently NO providers available on our platform for this type of service in their area. We need to find qualified local small businesses that we can invite to join our platform, so they can be matched with customers who need their services.

SEARCH REQUIREMENTS:
1. **Small to Medium Businesses**: Focus on independent contractors and small businesses (not large franchises or corporations) who would benefit from joining a service marketplace platform
2. **Location-specific**: Only return companies that actively service the area around coordinates {USER_LATITUDE}, {USER_LONGITUDE}. Convert these coordinates to a city/region name and search for businesses serving that area within EXACTLY {SEARCH_RADIUS_MILES} miles. DO NOT include businesses outside this radius.
3. **Service-relevant**: Only include companies whose services directly match the user's requested service type
4. **Verified contact information**: Each company MUST have at least one verified contact method (phone, email, or website with contact form)
5. **Currently operating**: Only real, active businesses (not closed, out of business, or seasonal operations that are currently inactive)
6. **Onboarding potential**: Prioritize businesses with:
   - Good ratings and established reputation (more likely to be quality partners)
   - Active online presence (indicates they're tech-friendly)
   - Local ownership (more invested in the community)
   - Evidence of seeking more customers (recent advertising, active social media, etc.)

OUTPUT FORMAT:
Return results as valid JSON with the following structure:

{
  "problem_analysis": {
    "identified_issue": "string - Brief description of the problem",
    "primary_service_category": "string - Main service type needed (e.g., plumbing, electrical)",
    "secondary_categories": ["array of strings - Additional relevant services if applicable"],
    "urgency_level": "string - estimated urgency: routine, moderate, urgent, emergency"
  },
  "user_location": {
    "latitude": "number - The latitude coordinate provided",
    "longitude": "number - The longitude coordinate provided",
    "resolved_address": "string - Human-readable address/city name derived from coordinates (e.g., 'Brooklyn, NY', 'London, UK')"
  },
  "companies": [
    {
      "company_name": "string - Official business name",
      "service_categories": ["array of strings - Services offered relevant to the problem"],
      "website_url": "string - Company website URL",
      "phone_number": "string - Primary contact number",
      "address": "string - Physical business address if available",
      "distance_from_user": "string or null - Approximate distance if determinable",
      "operating_hours": "string or null - Business hours, especially if offering emergency service",
      "rating": "number or null - Average rating (0-5 scale)",
      "rating_source": "string or null - Source of rating (Google, Yelp, etc.)",
      "total_reviews": "number or null - Number of reviews",
      "description": "string - Brief description of services and specializations",
      "specializations": ["array of strings - Specific expertise relevant to the problem"],
      "license_info": "string or null - License/certification information if publicly available",
      "emergency_service": "boolean - true if offers 24/7 or emergency service",
      "same_day_service": "boolean - true if offers same-day appointments",
      "free_estimates": "boolean or null - true if company offers free estimates/quotes",
      "years_in_business": "number or null - Years of operation if available",
      "relevance_score": "number - How well this company matches the specific problem (1-10 scale)"
    }
  ],
  "metadata": {
    "total_companies_found": "number - Count of companies returned",
    "search_date": "string - ISO 8601 date of search",
    "search_radius_miles": "number - The search radius in miles that was used",
    "recommendations": "string - Brief advice on which companies are the best candidates for platform onboarding and why"
  }
}

DATA QUALITY REQUIREMENTS:
- Each company MUST have: company_name, phone_number or website_url, and confirmation they service the specified location
- Verify companies are currently operating (not closed/out of business)
- Only include companies with public contact information (phone, email, or contact form)
- **EXCLUDE**: Large franchises, national chains, lead generation services, aggregators, referral platforms, and companies already on major service marketplaces (Thumbtack, Angi, HomeAdvisor, TaskRabbit)
- **PRIORITIZE**: Independent contractors, family-owned businesses, and local small businesses that would benefit from additional customer leads
- Return companies sorted by relevance_score and onboarding potential (highest first)
- Cross-verify information from multiple sources when possible

INTEGRATION CONTEXT:
This prompt will be used programmatically via FastAPI to discover businesses for platform onboarding:

from valyu import Valyu

valyu = Valyu(api_key="your-api-key-here")

# Variables will be injected:
# {USER_LATITUDE} - e.g., "51.5074", "40.7128", "43.6532"
# {USER_LONGITUDE} - e.g., "-0.1278", "-74.0060", "-79.3832"
# {SEARCH_RADIUS_MILES} - e.g., "2.0", "5.0", "10.0"
# {USER_PROBLEM_DESCRIPTION} - User's service request, e.g., "plumbing repair", "electrical work", "lawn maintenance"

response = valyu.search(prompt)

The response MUST be:
- Strictly valid JSON (no markdown, no code blocks, no extra formatting)
- Properly escaped strings
- Parseable by Python's json.loads()
- Complete and not truncated

TARGET: Return 10-20 highly relevant local small businesses that are good candidates for platform onboarding. These companies should:
1. Be able to fulfill the requested service type
2. Have a strong local presence and good reputation
3. Be small enough to benefit from additional leads through our platform
4. Have verifiable contact information for outreach
5. Show signs of being receptive to business growth opportunities

Focus on quality over quantity - we want businesses that will actually join the platform and provide excellent service to our users.