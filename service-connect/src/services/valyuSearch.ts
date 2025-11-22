import { Valyu } from 'valyu-js';
import { ProblemCategory } from '../types';
import { OPENAI_API_KEY } from '@env';

// Lazy initialize Valyu instance
let valyuInstance: Valyu | null = null;

function getValyu(): Valyu {
  if (!valyuInstance) {
    // Valyu expects VALYU_API_KEY in environment
    // Create instance without modifying process.env
    valyuInstance = new Valyu(); // Uses VALYU_API_KEY from env
  }
  return valyuInstance;
}

export interface UnverifiedVendor {
  company_name: string;
  service_categories: string[];
  website_url: string;
  phone_number: string;
  contact_email?: string; // Added: critical for business outreach
  address: string;
  distance_from_user: string | null;
  operating_hours: string | null;
  rating: number | null;
  rating_source: string | null;
  total_reviews: number | null;
  description: string;
  specializations: string[];
  license_info: string | null;
  emergency_service: boolean;
  same_day_service: boolean;
  free_estimates: boolean | null;
  years_in_business: number | null;
  relevance_score: number;
}

export interface ProblemAnalysis {
  identified_issue: string;
  primary_service_category: string;
  secondary_categories: string[];
  urgency_level: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  resolved_address: string;
}

export interface ValyuSearchResult {
  problem_analysis: ProblemAnalysis;
  user_location: UserLocation;
  companies: UnverifiedVendor[];
  metadata: {
    total_companies_found: number;
    search_date: string;
    search_radius_miles: number;
    recommendations: string;
  };
}

export interface SearchCriteria {
  latitude: number;
  longitude: number;
  searchRadiusMiles: number;
  problemDescription: string;
  category: ProblemCategory; // Added: needed for search term generation
  aiDescription?: string; // Added: optional AI-generated description
}

/**
 * Helper function to detect non-business content (blog posts, articles, guides)
 */
function isNonBusinessContent(url: string, title: string, content: string): boolean {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();

  // Check URL patterns for blog/article indicators
  const blogUrlPatterns = [
    '/blog/',
    '/article/',
    '/post/',
    '/news/',
    '/guide/',
    '/how-to/',
    '/tips/',
    '/advice/',
    'reddit.com',
    'quora.com',
    'stackoverflow.com',
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'pinterest.com',
    'medium.com',
    'wikipedia.org',
    'wikihow.com',
  ];

  if (blogUrlPatterns.some(pattern => lowerUrl.includes(pattern))) {
    return true;
  }

  // Check title patterns for non-business content
  const nonBusinessTitlePatterns = [
    /^why (is|are|do|does|did|can|should)/i,
    /^how to/i,
    /^what (is|are|causes|makes)/i,
    /^when (to|should|is)/i,
    /^top \d+/i,
    /^best \d+/i,
    /^\d+ (ways|reasons|tips|tricks|steps)/i,
    /complete guide/i,
    /ultimate guide/i,
    /beginners? guide/i,
    /\[.*\]/,  // Titles with brackets like "[5 Reasons Why & How To Fix It]"
    /\d+ (reasons|ways|tips|methods) (why|to|for)/i,
  ];

  if (nonBusinessTitlePatterns.some(pattern => pattern.test(lowerTitle))) {
    return true;
  }

  // Check content for article/guide indicators
  const articleIndicators = [
    'written by',
    'posted by',
    'published on',
    'share this article',
    'related articles',
    'read more:',
    'table of contents',
    'in this article',
    'subscribe to our newsletter',
  ];

  const articleIndicatorCount = articleIndicators.filter(indicator =>
    lowerContent.includes(indicator)
  ).length;

  // If multiple article indicators found, likely a blog/article
  if (articleIndicatorCount >= 2) {
    return true;
  }

  return false;
}

/**
 * Extract clean business name from title
 */
function extractBusinessName(title: string): string | null {
  // Remove common separators and take the first part
  let name = title.split('|')[0].split('-')[0].split('–')[0].trim();

  // If title looks like an article, return null
  const articlePatterns = [
    /^why /i,
    /^how to/i,
    /^what /i,
    /^when /i,
    /^top \d+/i,
    /^\d+ (ways|reasons|tips)/i,
  ];

  if (articlePatterns.some(pattern => pattern.test(name))) {
    return null;
  }

  // Remove common suffixes like "- Google Maps", "- Yelp", etc.
  name = name
    .replace(/\s*-\s*(google maps?|yelp|reviews?|home|official site).*$/i, '')
    .replace(/\s*\|\s*(google maps?|yelp|reviews?|home|official site).*$/i, '')
    .trim();

  return name;
}

/**
 * Calculate relevance score based on available contact information
 *
 * Email is CRITICAL for business outreach - vendors without email are heavily penalized
 */
function calculateRelevanceScore(emailCount: number, phoneCount: number, addressCount: number): number {
  // Without email, vendor is much less valuable (max score of 4)
  if (emailCount === 0) {
    let score = 2; // Low base score without email
    if (phoneCount > 0) score += 1;
    if (addressCount > 0) score += 1;
    return score; // Max 4 without email (never "highly recommended")
  }

  // With email, vendor is valuable
  let score = 5; // Base score
  score += 4; // Email is CRITICAL (+4 points)

  // Phone and address add additional value
  if (phoneCount > 0) score += 1;
  if (addressCount > 0) score += 1;

  return Math.min(score, 10); // Cap at 10
}

/**
 * Interface for search query terms
 */
export interface SearchQueryTerms {
  primaryTerm: string;
  alternativeTerms: string[];
}

/**
 * Generate optimized search query terms using OpenAI
 * Transforms vague problem descriptions into professional search terms
 *
 * Example:
 * - Input: "there is a leaking problem on the floor"
 * - Output: { primaryTerm: "plumbing leak repair", alternativeTerms: ["emergency plumber", "water leak contractor"] }
 */
async function generateSearchQueryTerms(
  problemDescription: string,
  category: ProblemCategory,
  aiDescription?: string
): Promise<SearchQueryTerms> {
  // Prepare the description for OpenAI
  const description = aiDescription || problemDescription;

  try {
    console.log('🤖 Generating optimized search terms with OpenAI...');

    if (!OPENAI_API_KEY) {
      console.warn('⚠️  OpenAI API key not configured, using fallback search terms');
      return generateFallbackSearchTerms(category, description);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using mini for faster/cheaper responses
        messages: [
          {
            role: 'system',
            content: `You are an expert at converting home maintenance problem descriptions into professional search terms for finding service contractors.

Your task: Transform vague customer problem descriptions into 2-3 professional search terms that would find the right type of contractor/business.

Rules:
1. Use professional industry terms (e.g., "plumbing contractor", "leak repair service", "emergency plumber")
2. Focus on the service provider type, not the problem itself
3. Include relevant qualifications/specializations if applicable
4. Keep terms concise (2-4 words each)
5. Avoid customer language like "broken", "not working", "problem"

Examples:
- "water leaking on floor" → "plumbing leak repair", "emergency plumber", "water damage contractor"
- "fridge not cooling" → "appliance repair", "refrigeration service", "fridge repair specialist"
- "broken light switch" → "electrician", "electrical repair", "lighting contractor"

Return JSON only: { "primaryTerm": "...", "alternativeTerms": ["...", "..."] }`,
          },
          {
            role: 'user',
            content: `Problem category: ${category}
Problem description: ${description}

Generate 1 primary search term and 2 alternative search terms for finding the right type of contractor/business.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.3, // Lower temperature for more consistent results
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    if (!result.primaryTerm || !result.alternativeTerms) {
      throw new Error('Invalid OpenAI response format');
    }

    console.log(`✅ Generated search terms: "${result.primaryTerm}"`);
    console.log(`   Alternatives: ${result.alternativeTerms.join(', ')}`);

    return {
      primaryTerm: result.primaryTerm,
      alternativeTerms: result.alternativeTerms || [],
    };
  } catch (error) {
    console.error('❌ Error generating search terms with OpenAI:', error);
    console.log('⚠️  Falling back to category-based search terms');
    return generateFallbackSearchTerms(category, description);
  }
}

/**
 * Fallback search term generation when OpenAI is unavailable
 */
function generateFallbackSearchTerms(
  category: ProblemCategory,
  description: string
): SearchQueryTerms {
  const categoryTerms: Record<ProblemCategory, SearchQueryTerms> = {
    plumbing: {
      primaryTerm: 'plumbing contractor',
      alternativeTerms: ['plumber', 'leak repair service'],
    },
    electrical: {
      primaryTerm: 'electrician',
      alternativeTerms: ['electrical contractor', 'electrical repair'],
    },
    hvac: {
      primaryTerm: 'HVAC contractor',
      alternativeTerms: ['heating cooling service', 'air conditioning repair'],
    },
    carpentry: {
      primaryTerm: 'carpenter',
      alternativeTerms: ['carpentry contractor', 'woodwork repair'],
    },
    painting: {
      primaryTerm: 'painting contractor',
      alternativeTerms: ['painter', 'decorating service'],
    },
    landscaping: {
      primaryTerm: 'landscaping contractor',
      alternativeTerms: ['landscaper', 'garden service'],
    },
    appliance_repair: {
      primaryTerm: 'appliance repair',
      alternativeTerms: ['appliance technician', 'home appliance service'],
    },
    general_handyman: {
      primaryTerm: 'handyman',
      alternativeTerms: ['general contractor', 'home repair service'],
    },
    other: {
      primaryTerm: 'home maintenance contractor',
      alternativeTerms: ['general contractor', 'home repair service'],
    },
  };

  const terms = categoryTerms[category];
  console.log(`📋 Using fallback search terms: "${terms.primaryTerm}"`);

  return terms;
}

/**
 * Search for unverified local vendors using Valyu AI-powered search
 */
export async function searchUnverifiedVendors(
  criteria: SearchCriteria
): Promise<ValyuSearchResult | null> {
  const { latitude, longitude, searchRadiusMiles, problemDescription, category, aiDescription } = criteria;

  const prompt = `BUSINESS DIRECTORY SEARCH - Find ONLY actual companies with contact details

LOCATION: Coordinates (${latitude}, ${longitude}) within ${searchRadiusMiles} miles
SERVICE NEEDED: ${problemDescription}

🚨 CRITICAL FILTERING RULES:
You are searching for REAL BUSINESSES to invite to our platform. Return ONLY:
✅ Company websites with contact pages
✅ Google My Business listings
✅ Yelp/business directory profiles
✅ Local contractor company pages

NEVER return:
❌ Blog posts (titles like "Why is my...", "How to fix...", "Top 10...")
❌ DIY guides or troubleshooting articles
❌ Forum posts or Q&A sites (Reddit, Quora, etc.)
❌ Generic informational pages
❌ News articles or reviews without business details

🎯 SEARCH STRATEGY:
1. Search queries to use:
   - "${problemDescription} contractors ${latitude},${longitude}"
   - "${problemDescription} companies [city name] contact"
   - "${problemDescription} business directory [city name]"
   - "local ${problemDescription} services near me [city name]"

2. Target websites:
   - Google Maps/Business listings
   - Yelp.com business pages
   - Local business directories (Yell, Thomson Local, etc.)
   - Company official websites

3. Information to extract:
   - Company name (from business listing, NOT article title)
   - Email addresses (look for: contact@, info@, hello@, [businessname]@)
   - Phone numbers (format: +44... or local)
   - Physical address
   - Website URL

📧 EMAIL EXTRACTION PRIORITY (CRITICAL):
1. Check company "Contact Us" pages first
2. Look for contact@, info@, hello@, enquiries@ in page source
3. Extract from business directory listings
4. Parse from footer/header sections
⚠️  If NO email found, phone + website are MANDATORY

MANDATORY DATA QUALITY:
Every result MUST have ALL of these:
1. ✓ Company name (actual business, not article title)
2. ✓ At least ONE contact method: email (preferred), phone, or website
3. ✓ Confirmation business provides this service type
4. ✓ Evidence business serves this location

OUTPUT FORMAT:
Return results as valid JSON with the following structure:

{
  "problem_analysis": {
    "identified_issue": "string - Brief description of the problem",
    "primary_service_category": "string - Main service type needed (e.g., plumbing, electrical)",
    "secondary_categories": ["array of strings - Additional relevant services if applicable"],
    "urgency_level": "string - estimated urgency: routine, moderate, urgent, emergency"
  },
  "user_location": {
    "latitude": "number - The latitude coordinate provided",
    "longitude": "number - The longitude coordinate provided",
    "resolved_address": "string - Human-readable address/city name derived from coordinates (e.g., 'Brooklyn, NY', 'London, UK')"
  },
  "companies": [
    {
      "company_name": "string - REQUIRED - Official business name from listing (NOT article title)",
      "service_categories": ["array of strings - Services offered relevant to the problem"],
      "website_url": "string - Company website URL (REQUIRED if no contact_email)",
      "phone_number": "string - Primary contact number (REQUIRED - format: +44... or local)",
      "contact_email": "string - CRITICAL REQUIRED - Business email (contact@, info@, hello@company.com)",
      "address": "string - Physical business address if available",
      "distance_from_user": "string or null - Approximate distance if determinable",
      "operating_hours": "string or null - Business hours, especially if offering emergency service",
      "rating": "number or null - Average rating (0-5 scale)",
      "rating_source": "string or null - Source of rating (Google, Yelp, etc.)",
      "total_reviews": "number or null - Number of reviews",
      "description": "string - Brief description of services and specializations",
      "specializations": ["array of strings - Specific expertise relevant to the problem"],
      "license_info": "string or null - License/certification information if publicly available",
      "emergency_service": "boolean - true if offers 24/7 or emergency service",
      "same_day_service": "boolean - true if offers same-day appointments",
      "free_estimates": "boolean or null - true if company offers free estimates/quotes",
      "years_in_business": "number or null - Years of operation if available",
      "relevance_score": "number - How well this company matches the specific problem (1-10 scale)"
    }
  ],
  "metadata": {
    "total_companies_found": "number - Count of companies returned",
    "search_date": "string - ISO 8601 date of search",
    "search_radius_miles": "number - The search radius in miles that was used",
    "recommendations": "string - Brief advice on which companies are the best candidates for platform onboarding and why"
  }
}

🔒 DATA QUALITY REQUIREMENTS (STRICT):
EVERY SINGLE RESULT MUST HAVE:
1. ✓ company_name = Real business name from a business listing (NOT article/blog title)
2. ✓ contact_email = Business email address (contact@, info@, hello@, etc.) - TOP PRIORITY
3. ✓ phone_number = Valid phone number if email not available
4. ✓ website_url = Company website if email not available
5. ✓ Service confirmation = Business actually provides this service type
6. ✓ Location confirmation = Business serves this geographic area

🚫 ABSOLUTE FILTERING RULES:
INCLUDE ONLY:
✅ Google My Business listings with contact info
✅ Company official websites with contact pages
✅ Yelp/business directory profiles
✅ Local contractor business pages
✅ Chamber of commerce business listings

NEVER INCLUDE:
❌ ANY blog post (check URL for /blog/, /article/, /post/)
❌ ANY "How to..." or "Why is my..." content
❌ ANY DIY guides or troubleshooting pages
❌ ANY forums (Reddit, Quora, StackExchange, etc.)
❌ ANY Wikipedia or informational pages
❌ ANY review aggregators without actual business details
❌ ANY article titles used as company names
❌ ANY results without contact information

🎯 EMAIL EXTRACTION (HIGHEST PRIORITY):
Your PRIMARY GOAL is to find business email addresses. Follow this sequence:
1. Visit company "Contact Us" or "Contact" page → extract contact@, info@, hello@, enquiries@
2. Parse business directory listings → look for email field
3. Check website footer/header → find email links
4. Search page source for email patterns (xxx@businessname.com)
5. If ABSOLUTELY no email found: phone_number + website_url are MANDATORY

⚠️  RESULT VALIDATION:
Before including ANY result, verify:
- [ ] Is company_name from a business listing? (not article title)
- [ ] Do we have contact_email OR (phone_number AND website_url)?
- [ ] Is this a real business page? (not blog/article/forum)
- [ ] Does business provide the requested service?
- [ ] Does business serve this location?

If answer is NO to any question → EXCLUDE this result

The response MUST be:
- Strictly valid JSON (no markdown, no code blocks, no extra formatting)
- Properly escaped strings
- Parseable by JSON.parse()
- Complete and not truncated

🎯 TARGET OUTPUT:
Return 10-20 highly relevant local small businesses with VERIFIED CONTACT INFORMATION.

MINIMUM REQUIREMENTS FOR EACH BUSINESS:
1. ✓ Real company name (from business listing, not article title)
2. ✓ Contact email address (contact@, info@, hello@, etc.) - CRITICAL
3. ✓ Phone number (required if no email)
4. ✓ Website URL (required if no email)
5. ✓ Service type matches request
6. ✓ Location matches search area

IDEAL CANDIDATES:
- Local small businesses and independent contractors
- Strong local presence with good ratings/reviews
- Active online presence (recent activity on Google/Yelp)
- Clear contact information visible on their website
- Appear receptive to business growth opportunities

🚨 FINAL REMINDER:
- If a result looks like a blog post, article, or "How to" guide → EXCLUDE IT
- If company_name is an article title ("Why is my fridge...") → EXCLUDE IT
- If there's NO contact_email AND NO (phone + website) → EXCLUDE IT
- Focus on QUALITY over quantity → Only return businesses you can actually contact

Your success metric: How many businesses have valid email addresses we can use for outreach.`;

  try {
    console.log('🔍 Starting Valyu search...');
    console.log(`   VALYU_API_KEY configured: ${process.env.VALYU_API_KEY ? 'Yes' : 'No'}`);

    const valyu = getValyu();

    // First get the city name from coordinates
    const cityQuery = `What city is at latitude ${latitude} longitude ${longitude}?`;
    const cityResponse = await valyu.search(cityQuery, {
      maxNumResults: 1,
      searchType: 'web',
    });

    let cityName = 'London'; // Default
    if (cityResponse?.results?.[0]?.content) {
      const content = cityResponse.results[0].content;
      const match = content.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*,?\s*(UK|United Kingdom|England)\b/i);
      if (match) {
        cityName = match[1];
      }
    }

    console.log(`\nSearching for businesses in: ${cityName}`);

    // Generate optimized search terms using OpenAI
    const searchTerms = await generateSearchQueryTerms(problemDescription, category, aiDescription);

    // Search for business listings using professional terms
    const searchQuery = `${searchTerms.primaryTerm} companies contractors in ${cityName} UK business directory contact details`;

    console.log(`🔍 Search query: "${searchQuery}"`);

    const response = await valyu.search(searchQuery, {
      maxNumResults: 20,
      searchType: 'all',
    });

    if (!response || !response.results || response.results.length === 0) {
      console.error('No results from Valyu search');
      return null;
    }

    console.log(`\nFound ${response.results.length} web results`);
    console.log('First result content preview:');
    console.log(response.results[0].content.substring(0, 500));
    console.log('\n---\n');

    // Extract business information from the combined search results
    const businessData: UnverifiedVendor[] = [];
    let resolvedAddress = `${latitude}, ${longitude}`;

    // Filter and extract business information from the search results
    response.results.forEach((result) => {
      const content = result.content;
      const url = result.url;
      const title = result.title;

      // Extract city/location from content
      const cityMatch = content.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|UK|United Kingdom)/);
      if (cityMatch && !resolvedAddress.includes(',')) {
        resolvedAddress = cityMatch[0];
      }

      // 🚫 FILTER OUT: Blog posts, articles, guides, and non-business content
      if (isNonBusinessContent(url, title, content)) {
        console.log(`⚠️  Filtered out non-business content: "${title}"`);
        return; // Skip this result
      }

      // Look for phone numbers in content
      const phoneRegex = /(\+?[\d\s\(\)-]{10,})/g;
      const phones = content.match(phoneRegex) || [];

      // Look for email addresses in content
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = content.match(emailRegex) || [];

      // Filter for business emails (exclude generic domains like gmail, yahoo, etc.)
      const businessEmails = emails.filter(email => {
        const domain = email.split('@')[1].toLowerCase();
        return !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'].includes(domain);
      });

      // Look for physical addresses
      const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Boulevard|Blvd|Way|Court|Ct|Place|Pl)[^\n]*/gi;
      const addresses = content.match(addressRegex) || [];

      // Determine if this is a valid business listing
      const isBusinessListing = (
        // Has contact information
        (phones.length > 0 || businessEmails.length > 0) &&
        // Is from a business directory or map service
        (url.includes('maps') ||
         url.includes('yelp') ||
         url.includes('google.com/maps') ||
         url.includes('yell.com') ||
         url.includes('checkatrade') ||
         url.includes('trustatrader') ||
         url.includes('mybuilder') ||
         url.includes('bark.com') ||
         addresses.length > 0)
      );

      if (isBusinessListing) {
        const businessName = extractBusinessName(title);

        // Final validation: ensure business name is valid
        if (businessName && businessName.length > 3 && businessName.length < 100) {
          const vendor: UnverifiedVendor = {
            company_name: businessName,
            service_categories: [problemDescription.split(' ')[0]],
            website_url: url,
            phone_number: phones[0] || '',
            contact_email: businessEmails[0] || undefined,
            address: addresses[0] || '',
            distance_from_user: null,
            operating_hours: null,
            rating: null,
            rating_source: null,
            total_reviews: null,
            description: content.substring(0, 150).replace(/\s+/g, ' ').trim(),
            specializations: [],
            license_info: null,
            emergency_service: false,
            same_day_service: false,
            free_estimates: null,
            years_in_business: null,
            relevance_score: calculateRelevanceScore(businessEmails.length, phones.length, addresses.length),
          };

          console.log(`✅ Found business: ${businessName}${businessEmails[0] ? ` (${businessEmails[0]})` : ''}`);
          businessData.push(vendor);
        }
      }
    });

    console.log(`Extracted ${businessData.length} potential businesses`);

    const parsedResult: ValyuSearchResult = {
      problem_analysis: {
        identified_issue: problemDescription,
        primary_service_category: problemDescription.split(' ')[0],
        secondary_categories: [],
        urgency_level: 'moderate',
      },
      user_location: {
        latitude,
        longitude,
        resolved_address: resolvedAddress,
      },
      companies: businessData,
      metadata: {
        total_companies_found: businessData.length,
        search_date: new Date().toISOString(),
        search_radius_miles: searchRadiusMiles,
        recommendations: `Found ${businessData.length} ${problemDescription} companies in ${resolvedAddress}`,
      },
    };

    return parsedResult;
  } catch (error) {
    console.error('Error searching for unverified vendors:', error);
    throw error;
  }
}

/**
 * Map problem category to a more descriptive problem description
 */
export function getProblemDescriptionFromCategory(
  category: ProblemCategory,
  aiDescription?: string
): string {
  if (aiDescription) {
    return aiDescription;
  }

  const categoryDescriptions: Record<ProblemCategory, string> = {
    plumbing: 'plumbing repair and maintenance services',
    electrical: 'electrical repair and installation services',
    hvac: 'heating, ventilation, and air conditioning services',
    carpentry: 'carpentry and woodworking services',
    painting: 'painting and decorating services',
    landscaping: 'landscaping and lawn care services',
    appliance_repair: 'appliance repair services',
    general_handyman: 'general handyman and home repair services',
    other: 'general home maintenance and repair services',
  };

  return categoryDescriptions[category];
}
