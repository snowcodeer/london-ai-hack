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
 * ALWAYS calls Valyu to supplement results. Valyu is only skipped if API fails.
 * This is the main function to use when looking for service providers
 */
export async function findAllServiceProviders(
  criteria: MatchingCriteria
): Promise<MatchingResult> {
  const { latitude, longitude, category, radiusMiles = 25, aiDescription } = criteria;

  try {
    // 1. First, search for verified businesses in SQLite database
    const sqliteMatches = findMatchingBusinessesFromSQLite({
      latitude,
      longitude,
      category,
      radiusMiles,
    });

    const verifiedBusinesses: BusinessMatch[] = sqliteMatches.map(match => ({
      business: match.business,
      distanceMiles: match.distanceMiles,
    }));

    console.log(`Found ${verifiedBusinesses.length} verified businesses in SQLite database`);

    // 2. ALWAYS search Valyu for additional unverified vendors to supplement results
    // This runs in parallel with SQLite search to provide comprehensive results
    let valyuSearchResult: ValyuSearchResult | null = null;
    let unverifiedVendors: UnverifiedVendor[] = [];

    console.log('Searching Valyu for unverified vendors to supplement results...');

    try {
      const problemDescription = getProblemDescriptionFromCategory(category, aiDescription);

      valyuSearchResult = await searchUnverifiedVendors({
        latitude,
        longitude,
        searchRadiusMiles: radiusMiles,
        problemDescription,
      });

      if (valyuSearchResult && valyuSearchResult.companies) {
        unverifiedVendors = valyuSearchResult.companies;
        console.log(`Found ${unverifiedVendors.length} unverified vendors via Valyu`);
      } else {
        console.log('Valyu returned no results');
      }
    } catch (valyuError) {
      console.error('Valyu search failed, continuing with SQLite results only:', valyuError);
      // Continue with SQLite results even if Valyu fails
    }

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
