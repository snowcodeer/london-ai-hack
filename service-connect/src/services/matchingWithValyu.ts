import { supabase } from './supabase';
import { Business, ProblemCategory } from '../types';
import {
  searchUnverifiedVendors,
  getProblemDescriptionFromCategory,
  UnverifiedVendor,
  ValyuSearchResult
} from './valyuSearch';
import { findMatchingBusinesses, BusinessMatch } from './matching';

export interface MatchingCriteria {
  latitude: number;
  longitude: number;
  category: ProblemCategory;
  radiusMiles?: number;
  aiDescription?: string;
}

export interface MatchingResult {
  verifiedBusinesses: BusinessMatch[];
  unverifiedVendors: UnverifiedVendor[];
  valyuSearchResult: ValyuSearchResult | null;
}

/**
 * Find both verified businesses in the database AND unverified vendors from Valyu search
 * This is the main function to use when looking for service providers
 */
export async function findAllServiceProviders(
  criteria: MatchingCriteria
): Promise<MatchingResult> {
  const { latitude, longitude, category, radiusMiles = 25, aiDescription } = criteria;

  try {
    // 1. First, search for verified businesses in our database
    const verifiedBusinesses = await findMatchingBusinesses({
      latitude,
      longitude,
      category,
      radiusMiles,
    });

    // 2. If no verified businesses found, search for unverified vendors using Valyu
    let valyuSearchResult: ValyuSearchResult | null = null;
    let unverifiedVendors: UnverifiedVendor[] = [];

    if (verifiedBusinesses.length === 0) {
      console.log('No verified businesses found, searching Valyu for unverified vendors...');

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
      }
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
