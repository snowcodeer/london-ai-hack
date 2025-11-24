# Valyu Search Integration

This document explains how the Valyu AI-powered search integration works to find unverified local service vendors when no verified businesses are available in the database.

## Overview

The integration adds the ability to search the web for local small businesses (SMBs) when:
1. A user submits a service request
2. No verified providers are found in our database for their location/category
3. The system automatically searches Valyu for local, unverified vendors

## Files Created

### 1. **src/services/valyuSearch.ts**
Core service module that handles Valyu API integration.

**Key Functions:**
- `searchUnverifiedVendors(criteria)` - Main search function
- `getProblemDescriptionFromCategory()` - Converts category to search description

**Types:**
- `UnverifiedVendor` - Vendor data structure
- `ValyuSearchResult` - Complete search response
- `SearchCriteria` - Search parameters

### 2. **src/services/matchingWithValyu.ts**
Enhanced matching service that combines verified and unverified providers.

**Key Functions:**
- `findAllServiceProviders(criteria)` - Searches both verified DB and Valyu
- `shouldShowUnverifiedVendors()` - Determines if unverified results should display
- `getMatchingSummaryMessage()` - User-friendly result summary

**Returns:**
```typescript
{
  verifiedBusinesses: BusinessMatch[],
  unverifiedVendors: UnverifiedVendor[],
  valyuSearchResult: ValyuSearchResult | null
}
```

### 3. **src/components/UnverifiedVendorCard.tsx**
React Native component for displaying unverified vendor cards.

**Features:**
- Unverified badge to distinguish from verified providers
- Rating display (from Google, Yelp, etc.)
- Service categories
- Feature badges (24/7, Same Day, Free Estimates)
- Call and Website action buttons
- Distance/location information
- "Highly Recommended" badge for high relevance scores

### 4. **src/screens/customer/VendorListScreen.tsx**
Full screen component that displays search results.

**Features:**
- Loading state with spinner
- Error handling with retry
- Separate sections for verified vs unverified
- Info box explaining unverified vendors
- Recommendations from Valyu AI
- Empty state with search expansion option

## How It Works

### 1. User Flow
```
User takes photo → AI analyzes problem → Navigate to VendorListScreen
                                              ↓
                              findAllServiceProviders() is called
                                              ↓
                        Search verified businesses in database
                                              ↓
                              No verified businesses found?
                                              ↓
                              Search Valyu for unverified vendors
                                              ↓
                          Display results with unverified badge
```

### 2. Search Prompt
The Valyu search uses a detailed prompt that:
- Specifies GPS coordinates and search radius
- Requests only small/medium businesses (not franchises)
- Requires verified contact information
- Prioritizes businesses good for platform onboarding
- Returns structured JSON with detailed business info

### 3. Data Quality
Each unverified vendor includes:
- Company name, phone, website
- Service categories and specializations
- Ratings and reviews (from Google, Yelp, etc.)
- Distance from user
- Operating hours
- Features (emergency service, same-day, free estimates)
- Relevance score (1-10)
- Years in business
- License info (if available)

## Environment Setup

Add to `.env`:
```
EXPO_PUBLIC_VALYU_API_KEY=your-valyu-api-key-here
```

Current API key: `tNW28J5CBWjnhbFAdWUS56HcHp2dR63aHgxEYtI3`

## Usage Example

```typescript
import { findAllServiceProviders } from './services/matchingWithValyu';

// Example: Search for plumbers in London
const result = await findAllServiceProviders({
  latitude: 51.524064,
  longitude: -0.084578,
  category: 'plumbing',
  radiusMiles: 5,
  aiDescription: 'Kitchen sink is leaking and needs repair'
});

console.log('Verified businesses:', result.verifiedBusinesses.length);
console.log('Unverified vendors:', result.unverifiedVendors.length);

// Display results
result.unverifiedVendors.forEach(vendor => {
  console.log(`${vendor.company_name} - ${vendor.rating} stars`);
});
```

## Navigation Integration

To use the VendorListScreen, add it to your navigator:

```typescript
import VendorListScreen from './screens/customer/VendorListScreen';

// In your navigator
<Stack.Screen
  name="VendorList"
  component={VendorListScreen}
  options={{ title: 'Service Providers' }}
/>

// Navigate to it
navigation.navigate('VendorList', {
  latitude: 51.524064,
  longitude: -0.084578,
  category: 'plumbing',
  aiDescription: 'Kitchen sink leak',
  radiusMiles: 5
});
```

## Integration with Existing Flow

### Option 1: From ProblemAnalysisScreen
After AI analysis, navigate to VendorListScreen instead of AppointmentDetails:

```typescript
// In ProblemAnalysisScreen.tsx
const handleContinue = () => {
  navigation.navigate('VendorList', {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    category: analysis.category,
    aiDescription: analysis.description,
    radiusMiles: 25
  });
};
```

### Option 2: After Appointment Details
Search for vendors after user provides appointment preferences:

```typescript
// In AppointmentDetailsScreen.tsx
const handleSubmit = async () => {
  // First search for providers
  const providers = await findAllServiceProviders({
    latitude,
    longitude,
    category,
    aiDescription
  });

  // Navigate to results
  navigation.navigate('VendorList', {
    /* ... */
  });
};
```

## Key Features

### 1. Smart Fallback
- Only searches Valyu when NO verified businesses found
- Reduces API costs and search time
- Prioritizes verified providers

### 2. Quality Filtering
The Valyu prompt explicitly excludes:
- Large franchises and national chains
- Lead generation services
- Aggregator platforms (Thumbtack, Angi, etc.)

The prompt prioritizes:
- Independent contractors
- Family-owned businesses
- Local businesses with good online presence
- Businesses actively seeking customers

### 3. User Clarity
- Clear "Unverified" badges
- Info box explaining what unverified means
- Recommendations from Valyu AI
- Separate sections for verified vs unverified

### 4. Contact Options
- Direct "Call" button with tel: link
- "Website" button to open in browser
- All vendors have verified contact info

## API Response Structure

```json
{
  "problem_analysis": {
    "identified_issue": "Kitchen sink leak requiring plumbing repair",
    "primary_service_category": "plumbing",
    "secondary_categories": ["general_handyman"],
    "urgency_level": "moderate"
  },
  "user_location": {
    "latitude": 51.524064,
    "longitude": -0.084578,
    "resolved_address": "Shoreditch, London, UK"
  },
  "companies": [
    {
      "company_name": "Quick Fix Plumbing Ltd",
      "service_categories": ["plumbing", "emergency_plumbing"],
      "website_url": "https://example.com",
      "phone_number": "+44 20 1234 5678",
      "address": "123 High Street, London E2 8AA",
      "distance_from_user": "0.8 miles",
      "rating": 4.7,
      "rating_source": "Google",
      "total_reviews": 156,
      "emergency_service": true,
      "same_day_service": true,
      "free_estimates": true,
      "relevance_score": 9
    }
  ],
  "metadata": {
    "total_companies_found": 12,
    "search_date": "2025-11-22T15:30:00Z",
    "search_radius_miles": 5,
    "recommendations": "Quick Fix Plumbing and ABC Plumbers are highly recommended..."
  }
}
```

## Error Handling

The integration includes robust error handling:

1. **API Failures**: Returns empty results instead of crashing
2. **JSON Parse Errors**: Logs error and returns null
3. **Network Issues**: Shows retry UI to user
4. **Empty Results**: Shows "expand search area" option

## Testing

### Manual Test
1. Set up `.env` with Valyu API key
2. Navigate to VendorListScreen with test coordinates
3. Verify unverified vendors display correctly
4. Test call/website buttons
5. Verify info box and recommendations display

### Test Coordinates
- **London, UK**: `51.524064, -0.084578`
- **New York, US**: `40.7128, -74.0060`
- **Los Angeles, US**: `34.0522, -118.2437`

### Test Categories
- `plumbing` - Kitchen sink leak
- `electrical` - Light fixture installation
- `hvac` - AC unit not cooling
- `landscaping` - Lawn mowing service

## Future Enhancements

1. **Email Outreach**: When unverified vendors found, send them invitation emails
2. **Vendor Detail Screen**: Full details page for each unverified vendor
3. **Save Vendors**: Allow users to save/favorite vendors
4. **Direct Booking**: Enable users to request quotes from unverified vendors
5. **Vendor Verification**: Process to verify and onboard vendors found via Valyu
6. **Analytics**: Track which vendors users contact most
7. **Caching**: Cache Valyu results to reduce API calls

## Costs & Limits

- Valyu API key included in environment
- Consider implementing result caching for frequently searched areas
- Only searches when NO verified businesses found (reduces API calls)

## Support

For issues or questions:
1. Check console logs for error details
2. Verify `.env` has correct API key
3. Test with known coordinates
4. Check Valyu API status

---

**Integration Complete!** 🎉

The system will now automatically search for local unverified vendors when no verified providers are available, helping users find service providers in underserved areas.
