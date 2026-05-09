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
];

export function isJunkCompetitor(name: string): boolean {
  const lower = name.toLowerCase();
  return JUNK_COMPETITOR_PATTERNS.some(pattern => lower.includes(pattern));
}

export function filterJunkCompetitors(names: string[]): string[] {
  return names.filter(name => !isJunkCompetitor(name));
}
