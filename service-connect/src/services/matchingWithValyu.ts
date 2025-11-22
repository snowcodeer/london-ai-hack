import { Business, ProblemCategory } from '../types';
import {
  searchUnverifiedVendors,
  getProblemDescriptionFromCategory,
  UnverifiedVendor,
  ValyuSearchResult
} from './valyuSearch';
import { findMatchingBusinessesFromSQLite } from './sqliteMatching';

export interface MatchingCriteria {
  latitude: number;
  longitude: number;
  category: ProblemCategory;
  radiusMiles?: number;
  aiDescription?: string;
}

export interface BusinessMatch {
  business: Business;
  distanceMiles: number;
}

export interface MatchingResult {
  verifiedBusinesses: BusinessMatch[];
  unverifiedVendors: UnverifiedVendor[];
  valyuSearchResult: ValyuSearchResult | null;
}

/**
 * Find both verified businesses in the SQLite database AND unverified vendors from Valyu search
 * This is the main function to use when looking for service providers
 */
export async function findAllServiceProviders(
  criteria: MatchingCriteria
): Promise<MatchingResult> {
  const { latitude, longitude, category, radiusMiles = 25, aiDescription } = criteria;

  try {
    // 1. First, search for ALL businesses in SQLite database (both verified and non-verified)
    // Note: findMatchingBusinessesFromSQLite is synchronous, but we keep async for Valyu
    const sqliteMatches = findMatchingBusinessesFromSQLite({
      latitude,
      longitude,
      category,
      radiusMiles,
    });

    // Separate verified and non-verified businesses from database
    const verifiedBusinesses: BusinessMatch[] = [];
    const nonVerifiedFromDatabase: UnverifiedVendor[] = [];

    sqliteMatches.forEach(match => {
      if (match.business.is_verified) {
        verifiedBusinesses.push({
          business: match.business,
          distanceMiles: match.distanceMiles,
        });
      } else {
        // Convert non-verified Business to UnverifiedVendor format
        nonVerifiedFromDatabase.push({
          company_name: match.business.name,
          service_categories: match.business.categories,
          website_url: match.business.website || '',
          phone_number: match.business.phone,
          contact_email: match.business.email,
          address: `${match.business.location.address}, ${match.business.location.city}`,
          distance_from_user: `${match.distanceMiles} miles away`,
          operating_hours: match.business.opening_hours || null,
          rating: null,
          rating_source: null,
          total_reviews: null,
          description: match.business.description || 'Local service provider',
          specializations: [],
          license_info: null,
          emergency_service: false,
          same_day_service: false,
          free_estimates: null,
          years_in_business: match.business.years_in_business || null,
          relevance_score: match.matchScore / 10, // Convert 0-100 to 0-10
        });
      }
    });

    console.log(`Found ${verifiedBusinesses.length} verified businesses in SQLite database`);
    console.log(`Found ${nonVerifiedFromDatabase.length} non-verified businesses in SQLite database`);

    // 2. If no verified businesses found, search for unverified vendors using Valyu
    let valyuSearchResult: ValyuSearchResult | null = null;
    let unverifiedVendors: UnverifiedVendor[] = [...nonVerifiedFromDatabase];

    if (verifiedBusinesses.length === 0) {
      console.log('No verified businesses found, searching Valyu for additional unverified vendors...');

      const problemDescription = getProblemDescriptionFromCategory(category, aiDescription);

      valyuSearchResult = await searchUnverifiedVendors({
        latitude,
        longitude,
        searchRadiusMiles: radiusMiles,
        problemDescription,
      });

      if (valyuSearchResult && valyuSearchResult.companies) {
        // Add Valyu results to our existing non-verified providers
        unverifiedVendors = [...nonVerifiedFromDatabase, ...valyuSearchResult.companies];
        console.log(`Found ${valyuSearchResult.companies.length} additional unverified vendors via Valyu`);
      }
    }

    console.log(`Total unverified vendors: ${unverifiedVendors.length}`);

    return {
      verifiedBusinesses,
      unverifiedVendors,
      valyuSearchResult,
    };
  } catch (error) {
    console.error('Error finding service providers:', error);
    // Return empty results rather than throwing, so the app can still function
    return {
      verifiedBusinesses: [],
      unverifiedVendors: [],
      valyuSearchResult: null,
    };
  }
}

/**
 * Check if we should show unverified vendors to the user
 */
export function shouldShowUnverifiedVendors(result: MatchingResult): boolean {
  return result.verifiedBusinesses.length === 0 && result.unverifiedVendors.length > 0;
}

/**
 * Get a summary message for the user based on the matching results
 */
export function getMatchingSummaryMessage(result: MatchingResult): string {
  const { verifiedBusinesses, unverifiedVendors } = result;

  if (verifiedBusinesses.length > 0) {
    return `We found ${verifiedBusinesses.length} verified service provider${verifiedBusinesses.length > 1 ? 's' : ''} in your area.`;
  }

  if (unverifiedVendors.length > 0) {
    return `We couldn't find verified providers on our platform, but we found ${unverifiedVendors.length} local service provider${unverifiedVendors.length > 1 ? 's' : ''} in your area that may be able to help.`;
  }

  return 'Unfortunately, we couldn\'t find any service providers in your area. Please try expanding your search radius or contact us for assistance.';
}
