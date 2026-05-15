/**
 * Shared Tavily Search Client with Rate Limiting
 *
 * ALL Tavily API calls across the pipeline go through this module.
 * Rate limited to 1 call per 1.1 seconds with automatic retry on 429/timeout.
 *
 * Used by: research-runner, competitor-discovery, query-fanout, youtube-scoring
 */

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!TAVILY_API_KEY) {
  console.warn("[tavily-client] TAVILY_API_KEY not configured");
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  response_time: number;
}

let lastTavilyCall = 0;
const MIN_INTERVAL = 1100; // 1.1s between calls
const MAX_RETRIES = 3;

/**
 * Rate-limited Tavily search with automatic retry on 429 and timeouts.
 * Max ~1 request per second, 3 retries with exponential backoff.
 */
export async function tavilySearch(
  query: string,
  options?: { maxResults?: number; retryCount?: number }
): Promise<TavilySearchResult[]> {
  const maxResults = options?.maxResults ?? 5;
  const retryCount = options?.retryCount ?? 0;

  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY not configured");
  }

  // Rate limit: wait if called too recently
  const elapsed = Date.now() - lastTavilyCall;
  if (elapsed < MIN_INTERVAL) {
    const waitMs = MIN_INTERVAL - elapsed;
    console.info(`[tavily] Rate limiting: waiting ${waitMs}ms`);
    await new Promise(r => setTimeout(r, waitMs));
  }
  lastTavilyCall = Date.now();

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "basic",
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: maxResults,
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout per call
    });

    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const backoff = Math.pow(2, retryCount + 1) * 2000; // 4s, 8s, 16s
        console.warn(`[tavily] Rate limited (429). Retrying in ${backoff}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, backoff));
        return tavilySearch(query, { maxResults, retryCount: retryCount + 1 });
      }
      throw new Error(`Tavily rate limited after ${MAX_RETRIES} retries`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily search failed: ${response.status} ${errorText}`);
    }

    const data: TavilyResponse = await response.json();
    return data.results || [];
  } catch (error) {
    // Retry on timeout
    if (error instanceof Error && error.name === "TimeoutError" && retryCount < MAX_RETRIES) {
      console.warn(`[tavily] Timeout. Retrying (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, 2000));
      return tavilySearch(query, { maxResults, retryCount: retryCount + 1 });
    }
    throw error;
  }
}
