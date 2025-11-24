import { getBusinesses } from './database';
import { Business, ProblemCategory } from '../types';

export interface SQLiteMatchingCriteria {
  latitude: number;
  longitude: number;
  category?: ProblemCategory;
  radiusMiles?: number;
  searchQuery?: string; // For name-based search
}

export interface SQLiteBusinessMatch {
  business: Business;
  distanceMiles: number;
  matchScore: number; // 0-100, higher is better
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate match score based on name similarity and location
 */
function calculateMatchScore(
  business: Business,
  searchQuery: string | undefined,
  distance: number,
  category: ProblemCategory | undefined
): number {
  let score = 0;

  // Location score (50 points max)
  // Closer = higher score
  if (distance <= 1) {
    score += 50;
  } else if (distance <= 5) {
    score += 40;
  } else if (distance <= 10) {
    score += 30;
  } else if (distance <= 15) {
    score += 20;
  } else if (distance <= 25) {
    score += 10;
  }

  // Name match score (30 points max)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    const name = business.name.toLowerCase();
    const city = business.location.city.toLowerCase();

    // Exact name match
    if (name === query) {
      score += 30;
    }
    // Name contains query
    else if (name.includes(query)) {
      score += 20;
    }
    // City match
    else if (city.includes(query) || query.includes(city)) {
      score += 15;
    }
    // Partial word match
    else {
      const queryWords = query.split(' ');
      const nameWords = name.split(' ');
      const matches = queryWords.filter(qw =>
        nameWords.some(nw => nw.includes(qw) || qw.includes(nw))
      );
      score += matches.length * 5;
    }
  } else {
    score += 15; // Default score if no search query
  }

  // Category match score (20 points max)
  if (category && business.categories.includes(category)) {
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Find matching businesses from SQLite database based on name and location
 */
export function findMatchingBusinessesFromSQLite(
  criteria: SQLiteMatchingCriteria
): SQLiteBusinessMatch[] {
  const { latitude, longitude, category, radiusMiles = 25, searchQuery } = criteria;

  // Get businesses - filter by category if provided
  const businesses = category
    ? getBusinesses({ categories: [category] })
    : getBusinesses();

  // Calculate distance and match score for each business
  const matches: SQLiteBusinessMatch[] = businesses
    .map((business) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        business.location.coordinates.latitude,
        business.location.coordinates.longitude
      );

      const matchScore = calculateMatchScore(
        business,
        searchQuery,
        distance,
        category
      );

      return {
        business,
        distanceMiles: Math.round(distance * 10) / 10,
        matchScore,
      };
    })
    .filter((match) => match.distanceMiles <= radiusMiles)
    .filter((match) => match.business.accepts_new_requests)
    .filter((match) => {
      // If search query provided, only show businesses with decent match score
      if (searchQuery) {
        return match.matchScore >= 10;
      }
      return true;
    });

  // Sort by match score (highest first), then by distance
  return matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.distanceMiles - b.distanceMiles;
  });
}

/**
 * Check if any businesses are available in the SQLite database for the given criteria
 */
export function hasBusinessesInSQLite(
  criteria: SQLiteMatchingCriteria
): boolean {
  const matches = findMatchingBusinessesFromSQLite(criteria);
  return matches.length > 0;
}
