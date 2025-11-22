# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A FastAPI application that helps users find local home service providers using GPS coordinates and problem descriptions. The service integrates with Valyu AI to search for small businesses that could be onboarded to the platform. This is a business discovery tool for a home maintenance marketplace (similar to Uber for home services).

## Development Commands

### Environment Setup
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your VALYU_API_KEY
```

### Running the Application
```bash
# Development mode (with auto-reload)
python app/main.py
# OR
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
ENVIRONMENT=production uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Using the start script
./start_server.sh
```

### Testing
```bash
# Run comprehensive test suite (bash script)
./test_api.sh

# Test with Python client examples
python example_client.py

# Manual testing via Swagger UI
# Start server and visit: http://localhost:8000/docs
```

## Architecture

### Application Structure
The application follows a clean layered architecture pattern:

- **Routes** (`app/api/routes/`): HTTP endpoint definitions and request handling
- **Services** (`app/services/`): Business logic and external API integration (Valyu)
- **Schemas** (`app/schemas/`): Pydantic models for request/response validation
- **Core** (`app/core/`): Configuration management and logging setup

### Request Flow
1. User submits coordinates (latitude, longitude), search radius, and problem description
2. `app/api/routes/service.py`: Validates incoming request via Pydantic schemas
3. `app/services/valyu_service.py`: Formats prompt using `valyu_prompt.md` template
4. Valyu API integration: Makes synchronous search call in async executor
5. Response parsing: Returns raw search results as JSON (no parsing/conversion)
6. Response validation: Converts to `RawServiceSearchResponse` Pydantic model
7. Returns structured JSON response to client

### Key Components

**ValyuService** (`app/services/valyu_service.py`):
- Singleton service managing Valyu API integration
- Loads prompt template from `valyu_prompt.md` on initialization
- Templates user coordinates and problem description into search prompt
- Returns raw search results without parsing to company format (as of latest changes)
- Uses `asyncio.run_in_executor` to run synchronous Valyu client in async context

**Configuration** (`app/core/config.py`):
- All settings loaded from environment variables via `pydantic-settings`
- Settings cached using `@lru_cache` for performance
- Key settings: `VALYU_API_KEY`, `ENVIRONMENT`, `LOG_LEVEL`, `API_HOST`, `API_PORT`
- Validates environment (development/staging/production) and log levels

**Logging** (`app/core/logging.py`):
- Uses `loguru` for structured logging
- Console output in all environments
- File logging (`logs/app_YYYY-MM-DD.log`) in production with daily rotation
- Get logger with: `from app.core.logging import get_logger; logger = get_logger()`

**Prompt Template** (`valyu_prompt.md`):
- Large structured prompt for Valyu AI search
- Placeholders: `{USER_LATITUDE}`, `{USER_LONGITUDE}`, `{SEARCH_RADIUS_MILES}`, `{USER_PROBLEM_DESCRIPTION}`
- Specifies search for small/medium local businesses for platform onboarding
- Detailed output format requirements (JSON structure)
- Located at project root, loaded by `ValyuService._load_prompt_template()`

### Response Format Evolution
The API originally returned parsed company data but now returns raw search results:
- `RawServiceSearchResponse`: Contains `raw_search_results` (list of dicts) and `metadata`
- `ServiceSearchResponse`: Legacy parsed format (still in schemas but not actively used)
- Check `app/services/valyu_service.py:148-210` for raw response parsing logic

## Configuration Variables

Required environment variables in `.env`:
- `VALYU_API_KEY` (required): Valyu API authentication key
- `ENVIRONMENT` (default: development): development, staging, or production
- `LOG_LEVEL` (default: INFO): DEBUG, INFO, WARNING, ERROR, CRITICAL
- `API_HOST` (default: 0.0.0.0): Server host binding
- `API_PORT` (default: 8000): Server port
- `MAX_RESULTS` (default: 20): Maximum search results
- `SEARCH_TIMEOUT` (default: 60): Search timeout in seconds (range: 5-300)
  - **Important**: The Valyu API can take 30-60+ seconds for complex searches
  - If getting timeout errors, increase this value in production: `SEARCH_TIMEOUT=120`

## API Endpoints

**POST /api/v1/services/search**
- Main search endpoint for finding service providers
- Request: `latitude`, `longitude`, `problem_description`, `search_radius_miles` (default: 2.0)
- Radius range: 0.5-50 miles
- Response: Raw search results as JSON with metadata

**GET /api/v1/services/categories**
- Returns available service categories (plumbing, electrical, hvac, etc.)

**GET /api/v1/health**
- Health check endpoint returning status, version, environment

## Important Files

- `valyu_prompt.md`: Prompt template for Valyu search (project root) - critical for search quality
- `app/main.py`: FastAPI application entry point with lifespan manager
- `example_client.py`: Comprehensive Python client examples with 6 usage scenarios
- `test_api.sh`: Bash script with 9 test cases covering various scenarios
- `test_request.json`: Sample request payload for testing

## Development Notes

### Adding New Features
1. Define schemas in `app/schemas/request.py` and `app/schemas/response.py`
2. Implement business logic in `app/services/`
3. Create routes in `app/api/routes/`
4. Register router in `app/main.py` via `app.include_router()`

### Modifying Search Behavior
- Edit `valyu_prompt.md` to change search criteria or output format
- Modify `app/services/valyu_service.py:_format_prompt()` if changing placeholders
- Update `app/services/valyu_service.py:_parse_valyu_response()` if changing response format
- Adjust `RawServiceSearchResponse` schema if adding metadata fields

### Error Handling
- Client errors (400): Validation failures, invalid coordinates, bad descriptions
- Server errors (500): Valyu API failures, parsing errors, unexpected exceptions
- All exceptions logged with full traceback via `loguru`
- Global exception handler in `app/main.py` catches unhandled errors

### Testing Locations
The codebase includes test data for these cities (with coordinates):
- San Francisco, CA: (37.7749, -122.4194)
- Brooklyn, NY: (40.6782, -73.9442)
- Phoenix, AZ: (33.4484, -112.0740)
- London, UK: (51.5074, -0.1278)
- Toronto, ON: (43.6532, -79.3832)
- Seattle, WA: (47.6062, -122.3321)

## Common Issues

### Valyu API Timeout Errors
**Symptom**: Getting "No search results returned from Valyu" or timeout errors in production

**Cause**: The Valyu API search can take 30-60+ seconds, especially with the large prompt template (6,479 characters). The default timeout may be too short.

**Solutions**:
1. Increase `SEARCH_TIMEOUT` environment variable: `SEARCH_TIMEOUT=120` (or higher)
2. Check Valyu API key is valid and has proper rate limits
3. Test Valyu directly: `python test_valyu_direct.py`
4. Monitor logs for "Using search timeout: X seconds" message
5. The timeout is now properly enforced via `asyncio.wait_for()` in `valyu_service.py:250-263`
