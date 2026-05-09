/**
 * Shared junk competitor filter list
 * 
 * Used by process-lead, vlad-review, competitor-analyzer, and competitor-discovery
 * to filter out directory listings, platforms, and generic terms that aren't real competitors.
 */

export const JUNK_COMPETITOR_PATTERNS: string[] = [
  // Directories and review platforms
  'bbb', 'better business', 'yellow page', 'yelp', 'tripadvisor', 'google map',
  'justdial', 'indiamart', 'foursquare', 'angi', 'angies list', 'homeadvisor',
  'thumbtack', 'houzz', 'porch',
  // Generic local terms
  'nearby', 'local option', 'top rated', 'best in', 'local competitors',
  'nearby businesses', 'similar companies', 'local dealerships', 'other dealers',
  'local salons', 'local gyms', 'other tanning', 'other beauty', 'other dental',
  'other agencies', 'other fitness', 'local cocktail', 'event bartending',
  // Automotive marketplaces
  'cars.com', 'autotrader', 'cargurus', 'truecar', 'edmunds', 'kelly blue book',
  'kbb', 'carfax', 'auto.com',
  // Real estate portals
  'zillow', 'trulia', 'realtor.com', 'redfin',
  // Social and media
  'facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'youtube',
  'tiktok', 'reddit', 'medium', 'wikipedia', 'crunchbase', 'glassdoor',
  // Booking and travel platforms
  'booking.com', 'airbnb', 'expedia', 'hotels.com', 'orbitz', 'priceline',
  'viator', 'getyourguide',
  // Job and classified sites
  'indeed', 'monster', 'ziprecruiter', 'craigslist', 'kijiji', 'gumtree',
  // Generic web
  'google', 'bing', 'yahoo', 'amazon', 'ebay', 'etsy', 'walmart', 'target',
  'shopify', 'wordpress', 'squarespace', 'wix',
  // Article/news leak patterns
  'and they', 'but they', 'how to', 'why you', 'what to',
  // LLM generic category responses — not real business names
  'jewelry store', 'jeweller', 'jeweler in', 'the best', 'top 10', 'the 10 best',
  'best wedding', 'top rated', 'in tampa', 'in my area', 'near me',
  'in florida', 'in london', 'in auckland', 'in your area',
  'near you', 'around me', 'closest', 'recommended',
  'list of', 'guide to', 'directory of',
];

/**
 * Additional check: competitor names that are just generic category labels
 * These are common LLM outputs that aren't real businesses
 */
const GENERIC_CATEGORY_PATTERNS: RegExp[] = [
  /^\d+\s+(best|top|finest|leading|great)/i,            // "10 Best Wedding Jewelers..."
  /^(the )?\d+\s+(best|top|most)/i,                     // "The 10 Best..."
  /^(best|top|leading|premier)\s+\w+\s+(in|near|around|of)/i, // "Best jewelry store in Tampa"
  /^(your )?local \w+/i,                                  // "Your local jewelry store"
  /^\w+ store$/i,                                          // "Jewelry Store" (just the category)
  /^\w+ store in /i,                                       // "Jewelry Store in Tampa, FL"
  /^\w+ shop$/i,                                           // "Jewelry Shop"
  /^\w+ shop in /i,                                        // "Jewelry Shop in..."
  /^\w+ studio$/i,                                         // generic "Dance Studio" etc
  /^\w+ service$/i,                                        // "Cleaning Service"
  /^\w+ near (me|you|\w+ city)/i,                          // "Jewelry near me"
  /wedding \w+ in \w+/i,                                   // "Wedding jewelers in Tampa"
];

export function isJunkCompetitor(name: string): boolean {
  const lower = name.toLowerCase();
  // Check pattern list
  if (JUNK_COMPETITOR_PATTERNS.some(pattern => lower.includes(pattern))) return true;
  // Check generic category patterns
  if (GENERIC_CATEGORY_PATTERNS.some(regex => regex.test(name))) return true;
  // Very short names (< 4 chars) are likely not real businesses
  if (name.trim().length < 4) return true;
  return false;
}

export function filterJunkCompetitors(names: string[]): string[] {
  return names.filter(name => !isJunkCompetitor(name));
}
