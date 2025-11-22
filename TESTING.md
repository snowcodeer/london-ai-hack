# Testing Guide

Complete guide for testing the Home Service Finder API with latitude/longitude + search radius implementation.

## Prerequisites

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your VALYU_API_KEY
   ```

3. **Start the Server**
   ```bash
   # Option 1: Using uvicorn directly
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Option 2: Using Python
   python -m app.main

   # Option 3: In development mode
   ENVIRONMENT=development python -m app.main
   ```

## Test Methods

### Method 1: Automated Bash Script (Recommended)

Run all tests at once:
```bash
./test_api.sh
```

This script tests:
- ✓ Health check
- ✓ Service categories
- ✓ Default radius (2 miles)
- ✓ Custom radius (5 miles)
- ✓ Wide radius (15 miles)
- ✓ Minimum radius (0.5 miles)
- ✓ Error handling (invalid inputs)
- ✓ File-based requests

### Method 2: Python Client Examples

Run comprehensive Python examples:
```bash
python example_client.py
```

Or run individual examples:
```python
from example_client import ServiceFinderClient

client = ServiceFinderClient()

# Example: San Francisco, 2 mile radius
results = client.search_services(
    latitude=37.7749,
    longitude=-122.4194,
    problem_description="Kitchen sink is leaking water",
    search_radius_miles=2.0
)

client.print_search_results(results)
```

### Method 3: Manual cURL Commands

#### Test 1: Basic Search (Default 2 miles)
```bash
curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "problem_description": "Kitchen sink is leaking water from the pipe underneath"
  }' | python -m json.tool
```

#### Test 2: Custom Radius (5 miles)
```bash
curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.6782,
    "longitude": -73.9442,
    "problem_description": "Electrical outlet stopped working",
    "search_radius_miles": 5.0
  }' | python -m json.tool
```

#### Test 3: Wide Radius (15 miles)
```bash
curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 33.4484,
    "longitude": -112.0740,
    "problem_description": "Air conditioner completely stopped working",
    "search_radius_miles": 15.0
  }' | python -m json.tool
```

#### Test 4: Using JSON File
```bash
curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d @test_request.json | python -m json.tool
```

#### Test 5: Health Check
```bash
curl http://localhost:8000/api/v1/health | python -m json.tool
```

#### Test 6: Get Categories
```bash
curl http://localhost:8000/api/v1/services/categories | python -m json.tool
```

### Method 4: Interactive API Docs

Visit the auto-generated API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Try out the endpoints directly in the browser!

## Test Locations with Coordinates

Common cities for testing:

| City | Latitude | Longitude |
|------|----------|-----------|
| San Francisco, CA | 37.7749 | -122.4194 |
| Brooklyn, NY | 40.6782 | -73.9442 |
| Phoenix, AZ | 33.4484 | -112.0740 |
| Seattle, WA | 47.6062 | -122.3321 |
| London, UK | 51.5074 | -0.1278 |
| Toronto, ON | 43.6532 | -79.3832 |

## Expected Response Format

```json
{
  "problem_analysis": {
    "identified_issue": "Leaking kitchen sink pipe",
    "primary_service_category": "plumbing",
    "secondary_categories": [],
    "urgency_level": "moderate"
  },
  "user_location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "resolved_address": "San Francisco, CA"
  },
  "companies": [
    {
      "company_name": "ABC Plumbing Services",
      "service_categories": ["plumbing", "pipe repair"],
      "phone_number": "+1-555-0123",
      "website_url": "https://example.com",
      "address": "123 Main St, San Francisco, CA",
      "distance_from_user": "1.2 miles",
      "rating": 4.8,
      "rating_source": "Google",
      "total_reviews": 156,
      "description": "Family-owned plumbing business...",
      "specializations": ["residential plumbing", "emergency repairs"],
      "emergency_service": true,
      "same_day_service": true,
      "free_estimates": true,
      "years_in_business": 15,
      "relevance_score": 9.5
    }
  ],
  "metadata": {
    "total_companies_found": 12,
    "search_date": "2025-11-22T10:30:00Z",
    "search_radius_miles": 5.0,
    "recommendations": "Contact ABC Plumbing first for emergency service availability"
  }
}
```

## Testing Search Radius

The API accepts `search_radius_miles` parameter:

| Radius | Use Case |
|--------|----------|
| 0.5 - 1 mile | Very local, immediate neighborhood |
| 2 miles (default) | Local area, typical service radius |
| 5 miles | Moderate area, city district |
| 10 miles | Wide area, multiple neighborhoods |
| 15-25 miles | Extended area, suburban regions |
| 25-50 miles | Very wide area, rural or emergency |

## Error Testing

### Invalid Description (Too Short)
```bash
curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "problem_description": "help"
  }'
# Expected: 400 Bad Request
```

### Invalid Latitude (Out of Range)
```bash
curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 95.0,
    "longitude": -122.4194,
    "problem_description": "Need plumbing repair"
  }'
# Expected: 422 Validation Error
```

### Invalid Radius (Out of Range)
```bash
curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "problem_description": "Need plumbing repair",
    "search_radius_miles": 100.0
  }'
# Expected: 422 Validation Error (max is 50 miles)
```

## Validation Rules

**Request Parameters:**
- `latitude`: -90.0 to 90.0 (required)
- `longitude`: -180.0 to 180.0 (required)
- `problem_description`: 10-1000 characters, min 3 words (required)
- `search_radius_miles`: 0.5-50.0 miles (optional, default: 2.0)

## Troubleshooting

### Server won't start
```bash
# Check if port 8000 is already in use
lsof -ti:8000

# Kill existing process
kill -9 $(lsof -ti:8000)

# Try a different port
uvicorn app.main:app --port 8001
```

### Valyu API errors
```bash
# Check your API key in .env
cat .env | grep VALYU_API_KEY

# Test with a simple request first
curl -X POST http://localhost:8000/api/v1/health
```

### Module not found errors
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Make sure you're in the right directory
pwd  # Should be: /Users/Rohithn/AI/experiments/london-ai-hack
```

## Performance Testing

Test response times with different radii:

```bash
# Small radius (faster)
time curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{"latitude": 37.7749, "longitude": -122.4194, "problem_description": "plumbing repair", "search_radius_miles": 2.0}'

# Large radius (slower)
time curl -X POST http://localhost:8000/api/v1/services/search \
  -H "Content-Type: application/json" \
  -d '{"latitude": 37.7749, "longitude": -122.4194, "problem_description": "plumbing repair", "search_radius_miles": 25.0}'
```

## Next Steps

After successful testing:
1. Integrate with your main app's frontend
2. Add database storage for discovered businesses
3. Implement invitation workflow
4. Add analytics and tracking
5. Set up monitoring and logging

## Support

For issues or questions:
- Check logs: `tail -f logs/app.log` (if logging to file)
- View console output when running the server
- Check API docs: http://localhost:8000/docs
