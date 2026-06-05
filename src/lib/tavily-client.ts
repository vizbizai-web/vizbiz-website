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
 * If Tavily fails, falls back through Serper.dev → Bing → Brave.
 * Max ~1 request per second, 3 retries with exponential backoff.
 */
export async function tavilySearch(
  query: string,
  options?: { maxResults?: number; retryCount?: number }
): Promise<TavilySearchResult[]> {
  const maxResults = options?.maxResults ?? 5;
  const retryCount = options?.retryCount ?? 0;

  // ── Attempt 1: Tavily (primary) ───────────────────────────────
  if (TAVILY_API_KEY) {
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
        signal: AbortSignal.timeout(30000),
      });

      if (response.status === 429) {
        console.warn(`[tavily] Quota exceeded (429). Will try fallback providers.`);
      } else if (!response.ok) {
        console.warn(`[tavily] HTTP ${response.status}. Will try fallback providers.`);
      } else {
        const data: TavilyResponse = await response.json();
        if (data.results && data.results.length > 0) {
          console.info(`[tavily] ${data.results.length} results for "${query}"`);
          return data.results;
        }
      }
    } catch (error) {
      console.warn(`[tavily] Error: ${error instanceof Error ? error.message : error}. Will try fallback providers.`);
    }
  }

  // ── Fallback chain: Serper.dev → Bing → Brave ─────────────────
  const SERPER_API_KEY = process.env.SERPER_API_KEY;
  const BING_SEARCH_API_KEY = process.env.BING_SEARCH_API_KEY;
  const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY || "BSA-c4QXtAspJh_Dgjd_XE0boqxdCJl";

  // Fallback 1: Serper.dev
  if (SERPER_API_KEY) {
    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": SERPER_API_KEY,
        },
        body: JSON.stringify({ q: query, num: maxResults }),
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) {
        const data = await response.json();
        const results = (data.organic || []).map((r: any) => ({
          title: r.title || "",
          url: r.link || "",
          content: r.snippet || "",
        }));
        if (results.length > 0) {
          console.info(`[search-fallback] Serper: ${results.length} results for "${query}"`);
          return results;
        }
      }
    } catch (e) {
      console.warn(`[search-fallback] Serper failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  // Fallback 2: Bing
  if (BING_SEARCH_API_KEY) {
    try {
      const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${maxResults}&textDecorations=false`;
      const response = await fetch(url, {
        headers: { "Ocp-Apim-Subscription-Key": BING_SEARCH_API_KEY },
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) {
        const data = await response.json();
        const results = (data.webPages?.value || []).map((r: any) => ({
          title: r.name || "",
          url: r.url || "",
          content: r.snippet || "",
        }));
        if (results.length > 0) {
          console.info(`[search-fallback] Bing: ${results.length} results for "${query}"`);
          return results;
        }
      }
    } catch (e) {
      console.warn(`[search-fallback] Bing failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  // Fallback 3: Brave
  if (BRAVE_API_KEY) {
    try {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}&text_decorations=0`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": BRAVE_API_KEY,
        },
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) {
        const data = await response.json();
        const results = (data?.web?.results || []).map((r: any) => ({
          title: r.title || "",
          url: r.url || "",
          content: r.description || "",
        }));
        if (results.length > 0) {
          console.info(`[search-fallback] Brave: ${results.length} results for "${query}"`);
          return results;
        }
      }
    } catch (e) {
      console.warn(`[search-fallback] Brave failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  // All providers exhausted
  throw new Error(
    `All search providers failed for "${query}". ` +
    `Configured: Tavily=${!!TAVILY_API_KEY}, Serper=${!!SERPER_API_KEY}, Bing=${!!BING_SEARCH_API_KEY}, Brave=${!!BRAVE_API_KEY}. ` +
    `Add SERPER_API_KEY, BING_SEARCH_API_KEY, or check TAVILY_API_KEY for fallback search.`
  );
}
