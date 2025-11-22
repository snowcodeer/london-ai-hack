import { supabase } from './supabase';
import { Business, ProblemCategory } from '../types';

export interface MatchingCriteria {
  latitude: number;
  longitude: number;
  category: ProblemCategory;
  radiusMiles?: number;
}

export interface BusinessMatch {
  business: Business;
  distanceMiles: number;
}

/**
 * Find businesses that match the service request criteria
 * Uses Supabase function for geographic proximity search
 */
export async function findMatchingBusinesses(
  criteria: MatchingCriteria
): Promise<BusinessMatch[]> {
  const { latitude, longitude, category, radiusMiles = 25 } = criteria;

  try {
    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('find_businesses_in_radius', {
      request_lat: latitude,
      request_lon: longitude,
      category: category,
      radius_miles: radiusMiles,
    });

    if (error) throw error;

    // Fetch full business details
    const businessIds = data.map((row: any) => row.business_id);

    if (businessIds.length === 0) {
      return [];
    }

    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', businessIds);

    if (businessError) throw businessError;

    // Combine business data with distance
    const matches: BusinessMatch[] = businesses.map((business) => {
      const distanceData = data.find(
        (row: any) => row.business_id === business.id
      );
      return {
        business,
        distanceMiles: distanceData?.distance_miles || 0,
      };
    });

    // Sort by distance (closest first)
    return matches.sort((a, b) => a.distanceMiles - b.distanceMiles);
  } catch (error) {
    console.error('Error finding matching businesses:', error);
    throw error;
  }
}

/**
 * Simple fallback matching without geolocation
 * Just matches by category for development/testing
 */
export async function findBusinessesByCategory(
  category: ProblemCategory
): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .contains('categories', [category])
      .eq('accepts_new_requests', true)
      .limit(10);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error finding businesses by category:', error);
    throw error;
  }
}

/**
 * Check if any businesses are available in the area
 * Returns true if at least one business is found
 */
export async function hasBusinessesInArea(
  latitude: number,
  longitude: number,
  category: ProblemCategory,
  radiusMiles: number = 25
): Promise<boolean> {
  try {
    const matches = await findMatchingBusinesses({
      latitude,
      longitude,
      category,
      radiusMiles,
    });

    return matches.length > 0;
  } catch (error) {
    console.error('Error checking business availability:', error);
    return false;
  }
}

/**
 * Calculate the expansion radius needed to find businesses
 * Useful for determining if we should trigger outreach emails
 */
export async function calculateNeededRadius(
  latitude: number,
  longitude: number,
  category: ProblemCategory,
  maxRadius: number = 100
): Promise<number | null> {
  // Try increasing radii until we find a business
  const radii = [10, 25, 50, 75, 100];

  for (const radius of radii) {
    if (radius > maxRadius) break;

    const hasBusinesses = await hasBusinessesInArea(
      latitude,
      longitude,
      category,
      radius
    );

    if (hasBusinesses) {
      return radius;
    }
  }

  // No businesses found within max radius
  return null;
}
