# Home Service Finder API

A production-ready FastAPI application that helps users find local home service providers based on their location and household problems. Powered by Valyu AI search.

## Features

- **Intelligent Problem Analysis**: Automatically identifies service category from problem description
- **Location-Based Search**: Finds local service providers in user's area
- **Comprehensive Results**: Returns company details, ratings, contact info, and availability
- **Production-Ready**: Includes logging, error handling, validation, and configuration management
- **Well-Documented**: OpenAPI/Swagger documentation at `/docs`
- **Type-Safe**: Full Pydantic validation for requests and responses

## Project Structure

```
london-ai-hack/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── health.py          # Health check endpoints
│   │       └── service.py         # Service search endpoints
│   ├── core/
│   │   ├── config.py              # Configuration management
│   │   └── logging.py             # Logging setup
│   ├── models/
│   ├── schemas/
│   │   ├── request.py             # Request models
│   │   └── response.py            # Response models
│   ├── services/
│   │   └── valyu_service.py       # Valyu API integration
│   └── main.py                    # Application entry point
├── valyu_prompt.md                # Valyu search prompt template
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## Installation

### Prerequisites

- Python 3.11+
- pip or poetry
- Valyu API key

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd london-ai-hack
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Valyu API key:
```
VALYU_API_KEY=your-actual-api-key-here
ENVIRONMENT=development
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000
```

## Running the Application

### Development Mode

```bash
# Run with auto-reload
python app/main.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# Set environment to production in .env
ENVIRONMENT=production

# Run with production settings
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Usage

### Search for Service Providers

**Endpoint**: `POST /api/v1/services/search`

**Request Body**:
```json
{
  "location": "San Francisco, CA",
  "problem_description": "Water heater making loud banging noises and leaking water from the bottom"
}
```

**Example using curl**:
```bash
curl -X POST "http://localhost:8000/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Brooklyn, NY",
    "problem_description": "Leaking pipe under kitchen sink, water pooling on floor"
  }'
```

**Example using Python**:
```python
import requests

url = "http://localhost:8000/api/v1/services/search"
payload = {
    "location": "Toronto, ON",
    "problem_description": "Electrical outlet in bedroom stopped working completely"
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Found {len(data['companies'])} companies")
for company in data['companies']:
    print(f"- {company['company_name']}: {company['phone_number']}")
```

**Response Structure**:
```json
{
  "problem_analysis": {
    "identified_issue": "Water heater malfunction with noise and leak",
    "primary_service_category": "plumbing",
    "secondary_categories": ["appliance_repair"],
    "urgency_level": "urgent"
  },
  "user_location": "San Francisco, CA",
  "companies": [
    {
      "company_name": "ABC Plumbing Services",
      "service_categories": ["plumbing", "water_heater_repair"],
      "website_url": "https://abcplumbing.com",
      "phone_number": "+1-415-555-0123",
      "address": "123 Main St, San Francisco, CA 94102",
      "rating": 4.8,
      "rating_source": "Google",
      "total_reviews": 247,
      "description": "Licensed plumber specializing in emergency repairs",
      "emergency_service": true,
      "same_day_service": true,
      "relevance_score": 9.5
    }
  ],
  "metadata": {
    "total_companies_found": 15,
    "search_date": "2025-01-15T10:30:00Z",
    "search_radius": "San Francisco Bay Area",
    "recommendations": "Contact plumbing specialists first for water heater issues"
  }
}
```

### Get Service Categories

**Endpoint**: `GET /api/v1/services/categories`

```bash
curl http://localhost:8000/api/v1/services/categories
```

Returns all available service categories with descriptions and examples.

### Health Check

**Endpoint**: `GET /api/v1/health`

```bash
curl http://localhost:8000/api/v1/health
```

## Development

### Code Structure

The application follows a clean architecture pattern:

- **Routes** (`app/api/routes/`): HTTP endpoints and request handling
- **Services** (`app/services/`): Business logic and external API integration
- **Schemas** (`app/schemas/`): Pydantic models for validation
- **Core** (`app/core/`): Configuration, logging, and shared utilities

### Adding New Features

1. Define request/response schemas in `app/schemas/`
2. Implement business logic in `app/services/`
3. Create API routes in `app/api/routes/`
4. Register routes in `app/main.py`

### Logging

The application uses `loguru` for structured logging:

```python
from app.core.logging import get_logger

logger = get_logger()
logger.info("Something happened")
logger.error("An error occurred", exc_info=True)
```

Logs are output to:
- Console (always)
- `logs/app_YYYY-MM-DD.log` (production only, rotated daily)

## Configuration

All configuration is managed through environment variables and `app/core/config.py`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VALYU_API_KEY` | (required) | Your Valyu API key |
| `ENVIRONMENT` | `development` | Environment: development/staging/production |
| `LOG_LEVEL` | `INFO` | Logging level: DEBUG/INFO/WARNING/ERROR/CRITICAL |
| `API_HOST` | `0.0.0.0` | API host address |
| `API_PORT` | `8000` | API port number |
| `MAX_RESULTS` | `20` | Maximum search results to return |
| `SEARCH_TIMEOUT` | `30` | Search timeout in seconds |

## Error Handling

The API provides detailed error responses:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Problem description must contain at least 3 words",
  "details": {
    "location": "Brooklyn, NY"
  }
}
```

Error codes:
- `VALIDATION_ERROR` (400): Invalid request data
- `RESPONSE_PARSING_ERROR` (500): Failed to parse Valyu response
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

## Testing

### Manual Testing

Use the interactive API documentation:
1. Open http://localhost:8000/docs
2. Try out the `/api/v1/services/search` endpoint
3. View request/response schemas

### Example Test Cases

```python
# Test 1: Plumbing issue
{
  "location": "Los Angeles, CA",
  "problem_description": "Toilet keeps running and won't stop filling"
}

# Test 2: Electrical issue
{
  "location": "Chicago, IL",
  "problem_description": "Circuit breaker keeps tripping when using microwave"
}

# Test 3: HVAC issue
{
  "location": "Miami, FL",
  "problem_description": "Air conditioner blowing warm air and making grinding noise"
}
```

## Deployment

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t home-service-api .
docker run -p 8000:8000 --env-file .env home-service-api
```

### Production Considerations

1. Use a process manager (e.g., gunicorn with uvicorn workers)
2. Set up reverse proxy (nginx)
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up monitoring and alerts
6. Implement rate limiting
7. Use a secrets manager for API keys

## Troubleshooting

### Common Issues

**Issue**: `FileNotFoundError: Prompt template not found`
- **Solution**: Ensure `valyu_prompt.md` exists in the project root

**Issue**: `ValidationError: VALYU_API_KEY field required`
- **Solution**: Set `VALYU_API_KEY` in your `.env` file

**Issue**: `Connection refused` when calling API
- **Solution**: Check if the server is running and the port is correct

**Issue**: `Valyu API timeout`
- **Solution**: Increase `SEARCH_TIMEOUT` in environment variables

## License

MIT License

## Support

For issues and questions:
- Check the API documentation at `/docs`
- Review logs in `logs/` directory (production)
- Enable DEBUG logging for detailed troubleshooting
