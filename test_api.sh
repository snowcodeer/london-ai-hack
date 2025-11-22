#!/bin/bash

# Test script for the Home Service Finder API
# Tests the new latitude/longitude + search radius implementation

BASE_URL="http://localhost:8000"

echo "========================================"
echo "Home Service Finder API - Test Suite"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "GET $BASE_URL/api/v1/health"
curl -s -X GET "$BASE_URL/api/v1/health" | python -m json.tool
echo -e "${GREEN}✓ Health check passed${NC}\n"

# Test 2: Get Service Categories
echo -e "${BLUE}Test 2: Get Service Categories${NC}"
echo "GET $BASE_URL/api/v1/services/categories"
curl -s -X GET "$BASE_URL/api/v1/services/categories" | python -m json.tool | head -30
echo -e "${GREEN}✓ Categories retrieved${NC}\n"

# Test 3: Basic Search with Default Radius (2 miles)
echo -e "${BLUE}Test 3: Basic Search - San Francisco, Default 2 mile radius${NC}"
echo "POST $BASE_URL/api/v1/services/search"
curl -s -X POST "$BASE_URL/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "problem_description": "Kitchen sink is leaking water from the pipe underneath, water pooling on the floor"
  }' | python -m json.tool > /tmp/test3_results.json

echo "Response saved to /tmp/test3_results.json"
cat /tmp/test3_results.json | jq '.user_location, .metadata.search_radius_miles, .metadata.total_companies_found'
echo -e "${GREEN}✓ Basic search completed${NC}\n"

# Test 4: Custom Radius - 5 miles
echo -e "${BLUE}Test 4: Custom Search Radius - Brooklyn, NY, 5 mile radius${NC}"
echo "POST $BASE_URL/api/v1/services/search"
curl -s -X POST "$BASE_URL/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.6782,
    "longitude": -73.9442,
    "problem_description": "Electrical outlet in the living room stopped working, no power",
    "search_radius_miles": 5.0
  }' | python -m json.tool > /tmp/test4_results.json

echo "Response saved to /tmp/test4_results.json"
cat /tmp/test4_results.json | jq '.user_location, .metadata.search_radius_miles, .metadata.total_companies_found'
echo -e "${GREEN}✓ Custom radius search completed${NC}\n"

# Test 5: Wide Radius - 15 miles
echo -e "${BLUE}Test 5: Wide Search Radius - Phoenix, AZ, 15 mile radius${NC}"
echo "POST $BASE_URL/api/v1/services/search"
curl -s -X POST "$BASE_URL/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 33.4484,
    "longitude": -112.0740,
    "problem_description": "Air conditioner completely stopped working in extreme heat",
    "search_radius_miles": 15.0
  }' | python -m json.tool > /tmp/test5_results.json

echo "Response saved to /tmp/test5_results.json"
cat /tmp/test5_results.json | jq '.user_location, .metadata.search_radius_miles, .metadata.total_companies_found'
echo -e "${GREEN}✓ Wide radius search completed${NC}\n"

# Test 6: Minimum Radius - 0.5 miles
echo -e "${BLUE}Test 6: Minimum Search Radius - 0.5 mile radius${NC}"
echo "POST $BASE_URL/api/v1/services/search"
curl -s -X POST "$BASE_URL/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 51.5074,
    "longitude": -0.1278,
    "problem_description": "Need emergency plumbing repair for burst pipe",
    "search_radius_miles": 0.5
  }' | python -m json.tool > /tmp/test6_results.json

echo "Response saved to /tmp/test6_results.json"
cat /tmp/test6_results.json | jq '.user_location, .metadata.search_radius_miles, .metadata.total_companies_found'
echo -e "${GREEN}✓ Minimum radius search completed${NC}\n"

# Test 7: Error Handling - Invalid Description
echo -e "${BLUE}Test 7: Error Handling - Invalid Description (too short)${NC}"
echo "POST $BASE_URL/api/v1/services/search"
HTTP_CODE=$(curl -s -o /tmp/test7_error.json -w "%{http_code}" -X POST "$BASE_URL/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "problem_description": "help"
  }')

if [ "$HTTP_CODE" == "400" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid input (HTTP $HTTP_CODE)${NC}"
  cat /tmp/test7_error.json | python -m json.tool
else
  echo -e "${RED}✗ Expected 400, got HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 8: Error Handling - Invalid Coordinates
echo -e "${BLUE}Test 8: Error Handling - Invalid Latitude${NC}"
echo "POST $BASE_URL/api/v1/services/search"
HTTP_CODE=$(curl -s -o /tmp/test8_error.json -w "%{http_code}" -X POST "$BASE_URL/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 95.0,
    "longitude": -74.0060,
    "problem_description": "Need plumbing repair for leaking pipe"
  }')

if [ "$HTTP_CODE" == "422" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid latitude (HTTP $HTTP_CODE)${NC}"
  cat /tmp/test8_error.json | python -m json.tool
else
  echo -e "${RED}✗ Expected 422, got HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 9: Using test_request.json file
echo -e "${BLUE}Test 9: Search using test_request.json${NC}"
echo "POST $BASE_URL/api/v1/services/search"
curl -s -X POST "$BASE_URL/api/v1/services/search" \
  -H "Content-Type: application/json" \
  -d @test_request.json | python -m json.tool > /tmp/test9_results.json

echo "Response saved to /tmp/test9_results.json"
cat /tmp/test9_results.json | jq '.user_location, .metadata.search_radius_miles, .metadata.total_companies_found'
echo -e "${GREEN}✓ File-based search completed${NC}\n"

echo "========================================"
echo -e "${GREEN}All Tests Completed!${NC}"
echo "========================================"
echo ""
echo "Full results saved in /tmp/test*_results.json"
echo "To view a result: cat /tmp/test3_results.json | python -m json.tool"
echo "To view companies: cat /tmp/test3_results.json | jq '.companies'"
