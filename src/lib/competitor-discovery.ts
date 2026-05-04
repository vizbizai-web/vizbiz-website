/**
 * Competitor Auto-Discovery Module
 * 
 * When no competitors are provided in the lead, this module uses Tavily
 * search to find relevant competitors based on the detected niche and location.
 */

import { detectNiche } from "./niche-detector";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!TAVILY_API_KEY) {
  console.warn("[competitor-discovery] TAVILY_API_KEY not configured");
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  response_time: number;
}

async function tavilySearch(query: string): Promise<TavilySearchResult[]> {
  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "basic",
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily search failed: ${response.status} ${errorText}`);
    }

    const data: TavilyResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("[competitor-discovery] Tavily search error:", error);
    throw error;
  }
}

export async function discoverCompetitors(
  businessName: string,
  website: string,
  city: string,
  providedCompetitor?: string
): Promise<string[]> {
  // If competitor is already provided, use it
  if (providedCompetitor && providedCompetitor.trim() !== "") {
    return [providedCompetitor.trim()];
  }

  // Detect the niche to determine search queries
  const nicheConfig = detectNiche(businessName, website);
  
  // Generate search queries based on niche
  const searchQueries = nicheConfig.competitorSearchQueries.map(query => 
    query.replace("{niche}", nicheConfig.niche.replace("_", " ")).replace("{city}", city)
  );

  // Run searches and extract business names
  const competitors: string[] = [];
  
  for (const query of searchQueries.slice(0, 3)) { // Limit to 3 searches
    try {
      const results = await tavilySearch(query);
      
      // Extract business names from search results
      for (const result of results) {
        // Parse business names from titles and URLs
        const businessNameMatch = extractBusinessNameFromResult(result, businessName);
        if (businessNameMatch && !competitors.includes(businessNameMatch)) {
          competitors.push(businessNameMatch);
          if (competitors.length >= 3) break; // We only need top 3
        }
      }
      
      if (competitors.length >= 3) break;
    } catch (error) {
      console.error(`[competitor-discovery] Search failed for query "${query}":`, error);
      continue; // Try next query
    }
  }

  // If we couldn't find any competitors, return a generic fallback
  if (competitors.length === 0) {
    return ["local competitors", "nearby businesses", "similar companies"];
  }

  return competitors.slice(0, 3); // Return top 3
}

function extractBusinessNameFromResult(result: TavilySearchResult, originalBusinessName: string): string | null {
  // Skip if this is the original business
  if (result.title.toLowerCase().includes(originalBusinessName.toLowerCase())) {
    return null;
  }

  const title = result.title;
  
  // Pattern 1: "Business Name - City | Yelp/Google" → extract before dash/pipe
  let name = title.split(/\s*[-–—|]\s*/)[0];
  
  // Pattern 2: Remove trailing location like "in City, State"
  name = name.replace(/\s+in\s+[A-Z][a-zA-Z\s]+,?\s*[A-Z]{0,2}$/, '');
  
  // Pattern 3: Remove review count like "(142 reviews)"
  name = name.replace(/\s*\(\d+\s*reviews?\)\s*/i, '');
  
  // Pattern 4: Remove rating like "4.8 ★"
  name = name.replace(/\s*\d\.\d+\s*★?\s*/, '');
  
  // Remove common prefixes
  name = name
    .replace(/^(Best|Top|Top Rated|#\d+|\d+\.\s)\s+/i, "")
    .replace(/^(A|An|The)\s+/i, "");
  
  // Remove common suffixes
  name = name
    .replace(/\s+-\s+ Yelp$/i, '')
    .replace(/\s+-\s+ Google Reviews$/i, '')
    .replace(/\s*\|\s*Facebook$/i, '')
    .replace(/\s*\|\s*Instagram$/i, '');
  
  // Clean up
  const cleaned = name.trim();
  
  // Skip if too short, too long, or looks like a generic/directory phrase
  if (cleaned.length < 3 || cleaned.length > 60) return null;
  if (/^(best|top|find|near|about|home|welcome)/i.test(cleaned)) return null;
  if (/\.(com|net|org|io)$/i.test(cleaned)) return null;
  
  // Skip directory-style results (lists, rankings, compilations)
  if (/top \d+|\d+ best|best \d+|top rated|companies? in|businesses? in|places? in|list of|directory|near me/i.test(cleaned)) return null;
  if (/^\d/.test(cleaned)) return null; // Skip results starting with numbers
  
  // Skip obvious directory/aggregator words
  const directoryWords = ['yelp', 'google maps', 'foursquare', 'facebook', 'instagram', 'yellow pages', 'brownbook', 'superpages', 'merchant circle', 'citysearch', 'kudzu', 'angies list', 'nextdoor', 'tripadvisor'];
  for (const word of directoryWords) {
    if (cleaned.toLowerCase().includes(word)) return null;
  }
  
  return cleaned;
}