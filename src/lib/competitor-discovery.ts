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

  // Clean up — filter out directory/junk names from the final list
  const cleanedCompetitors = competitors.filter(c => {
    // Reject short acronym-style names with digits (F6S, F8, 3D, etc.)
    if (/^[A-Z0-9]{2,5}$/i.test(c) && c.toLowerCase() !== c.toUpperCase()) return false;
    // Reject single-word names shorter than 4 chars that aren't clear brand names
    if (!c.includes(' ') && c.length <= 3) return false;
    // Reject obvious junk
    if (/^f\d+s?$/i.test(c)) return false;
    if (/^(top|best|near|find|about|home|wikipedia|wiki|shop|store|list|page|homepage)$/i.test(c)) return false;
    return true;
  });

  // If we couldn't find any competitors, return a generic fallback
  if (cleanedCompetitors.length === 0) {
    return ["local competitors", "nearby businesses", "similar companies"];
  }

  return cleanedCompetitors.slice(0, 3); // Return top 3
}

function extractBusinessNameFromResult(result: TavilySearchResult, originalBusinessName: string): string | null {
  // Skip if this is the original business
  if (result.title.toLowerCase().includes(originalBusinessName.toLowerCase())) {
    return null;
  }

  const title = result.title;
  const url = result.url;
  
  // Strategy 1: Extract business name from URL path segments
  // e.g., "trabertgoldsmiths.com/collections/lab-grown-diamond" → "Trabert Goldsmiths"
  // e.g., "vrai.com/showrooms/san-francisco" → "VRAI"
  // e.g., "padisgems.com/collections/engagement-rings" → "Padis Jewelry"
  let urlnName = null;
  try {
    const urlPath = new URL(url).hostname.replace('www.', '').split('.')[0];
    // Convert kebab-case to Title Case
    urlnName = urlPath
      .split(/[-_]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    // Skip URL-based names that are obviously not brand names (generic words)
    const genericUrlWords = ['google', 'yelp', 'facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'yelpcdn', 'f6s', 'crunchbase', 'glassdoor', 'angel', 'indeed', 'wikipedia', 'wiki'];
    if (genericUrlWords.some(w => urlnName!.toLowerCase().includes(w))) {
      urlnName = null;
    }
  } catch { urlnName = null; }
  
  // Strategy 2: Try to find business name at the end of pipe/dash-separated title
  // "Engagement Rings San Francisco | Natural & Lab Diamonds | Yadav Jewelry" → "Yadav Jewelry"
  // "Lab Grown - Engagement Rings in San Francisco - Padis Jewelry" → "Padis Jewelry"
  const parts = title.split(/\s*[-–—|]\s*/).filter(p => p.trim().length > 0);
  let pipedName = null;
  
  if (parts.length >= 2) {
    // Try the last part first — often contains the actual business name
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts[i].trim()
        .replace(/\s+in\s+[A-Z][a-zA-Z\s]+,?\s*[A-Z]{0,2}$/, '')
        .replace(/\s*\(\d+\s*reviews?\)\s*/i, '')
        .replace(/\s*\d\.\d+\s*★?\s*/, '')
        .replace(/^(A|An|The)\s+/i, "")
        .trim();
      
      // Check if this looks like a business name (not a directory, not generic)
      if (candidate.length >= 3 && 
          !/^(best|top|top rated|#\d+|\d+\.)/i.test(candidate) &&
          !/^\d/.test(candidate)) {
        pipedName = candidate;
        break;
      }
    }
  }
  
  // Strategy 3: Fallback to full title with filters (old approach but improved)
  let cleanedName = null;
  if (!pipedName) {
    cleanedName = title
      .split(/\s*[-–—|]\s*/)[0]
      .replace(/\s+in\s+[A-Z][a-zA-Z\s]+,?\s*[A-Z]{0,2}$/, '')
      .replace(/\s*\(\d+\s*reviews?\)\s*/i, '')
      .replace(/\s+[-–—]+\s+Yelp$/i, '')
      .replace(/\s+[-–—]+\s+Google Reviews$/i, '')
      .replace(/^(Best |Top |Top Rated |#\d+ |\d+\.\s)/i, '')
      .replace(/^(A |An |The )/i, '')
      .trim();
  }
  
  // Choose the best strategy result
  let finalName = pipedName || cleanedName || urlnName;
  
  // Prefer actual name from pipe/end over URL-derived
  if (pipedName && pipedName.length >= 3 && !/^\d/.test(pipedName)) {
    finalName = pipedName;
  } else if (urlnName && !pipedName && urlnName.length >= 3) {
    finalName = urlnName;
  }
  
  if (!finalName || finalName.length < 3 || finalName.length > 60) return null;
  if (/^(best|top|find|near|about|home|welcome)/i.test(finalName)) return null;
  if (/\.(com|net|org|io)$/i.test(finalName)) return null;
  if (/top \d+|\d+ best|best \d+|top rated|companies? in|businesses? in|places? in|list of|directory|near me|yelp/i.test(finalName)) return null;
  if (/^\d/.test(finalName)) return null;
  
  // Reject names that look like short codes, acronyms, or directories (F6S, YC, SEO, F8, API-2, etc.)
  if (/^[A-Z]{1,5}\d+[A-Z0-9]*$/i.test(finalName) && finalName.length < 8) return null;
  if (/^[A-Z]{1,3}\d*$/i.test(finalName) && finalName.length < 6) return null;
  
  return finalName;
}