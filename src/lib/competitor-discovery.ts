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

  // Try to extract business name from title
  const title = result.title;
  
  // Remove location suffixes
  const withoutLocation = title.replace(/\s+in\s+[^\s]+$/, "").replace(/\s+-\s+[^\s]+$/, "");
  
  // Remove common prefixes
  const withoutPrefix = withoutLocation
    .replace(/^(Best|Top|Top Rated|#\d+)\s+/i, "")
    .replace(/^(A|An|The)\s+/i, "");
  
  // Remove business type suffixes
  const withoutSuffix = withoutPrefix
    .replace(/\s+(Dealer|Dealership|Venue|Studio|Agency|Company|Business|Service|Center|Club)$/i, "");
  
  // Clean up
  const cleaned = withoutSuffix.trim();
  
  // Skip if too short or looks like a generic phrase
  if (cleaned.length < 3 || cleaned.toLowerCase().includes("best ")) {
    return null;
  }
  
  return cleaned;
}