/**
 * Unified Search Fallback Module
 *
 * Chains through multiple search providers transparently:
 *   1. Tavily (primary)
 *   2. Serper.dev (fallback 1 — Google Search API)
 *   3. Bing Web Search API (fallback 2)
 *   4. Brave Search (fallback 3 — already configured)
 *
 * All callers use the same TavilySearchResult interface regardless of provider.
 * Rate limiting is applied per-provider to respect each API's limits.
 */

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

/* ───────────────────────────────
   Provider Keys
   ─────────────────────────────── */

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const BING_SEARCH_API_KEY = process.env.BING_SEARCH_API_KEY;
const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY;

/* ───────────────────────────────
   Rate Limit State (per provider)
   ─────────────────────────────── */

const lastCallMs: Record<string, number> = {
  tavily: 0,
  serper: 0,
  bing: 0,
  brave: 0,
};

const MIN_INTERVAL_MS: Record<string, number> = {
  tavily: 1100,   // 1.1s — Tavily's limit
  serper: 500,    // 0.5s — Serper is fast
  bing: 1000,     // 1s — Bing standard
  brave: 1100,    // 1.1s — Brave's limit
};

async function rateLimit(provider: string): Promise<void> {
  const elapsed = Date.now() - (lastCallMs[provider] || 0);
  const minInterval = MIN_INTERVAL_MS[provider] || 1000;
  if (elapsed < minInterval) {
    const waitMs = minInterval - elapsed;
    console.info(`[search-fallback] ${provider} rate limit: waiting ${waitMs}ms`);
    await new Promise(r => setTimeout(r, waitMs));
  }
  lastCallMs[provider] = Date.now();
}

/* ───────────────────────────────
   Provider 1: Tavily
   ─────────────────────────────── */

interface TavilyResponse {
  results: TavilySearchResult[];
  response_time: number;
}

async function searchTavily(
  query: string,
  maxResults: number,
  retryCount = 0
): Promise<TavilySearchResult[] | null> {
  if (!TAVILY_API_KEY) return null;

  await rateLimit("tavily");

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

    // 429 = rate limit / quota exceeded — try fallback immediately
    if (response.status === 429) {
      console.warn(`[search-fallback] Tavily quota exceeded (429), triggering fallback chain`);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      // Check for quota-related errors in body
      if (errorText.toLowerCase().includes("quota") ||
          errorText.toLowerCase().includes("limit") ||
          errorText.toLowerCase().includes("exceeded")) {
        console.warn(`[search-fallback] Tavily quota error: ${errorText.substring(0, 200)}`);
        return null;
      }
      throw new Error(`Tavily search failed: ${response.status} ${errorText}`);
    }

    const data: TavilyResponse = await response.json();
    return data.results || [];
  } catch (error) {
    // Timeout — retry once
    if (error instanceof Error && error.name === "TimeoutError" && retryCount < 1) {
      console.warn(`[search-fallback] Tavily timeout, retrying once`);
      await new Promise(r => setTimeout(r, 2000));
      return searchTavily(query, maxResults, retryCount + 1);
    }

    // Network or other error — try fallback
    console.warn(`[search-fallback] Tavily error: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

/* ───────────────────────────────
   Provider 2: Serper.dev (Google Search API)
   ─────────────────────────────── */

interface SerperResponse {
  organic?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  error?: string;
}

async function searchSerper(query: string, maxResults: number): Promise<TavilySearchResult[] | null> {
  if (!SERPER_API_KEY) return null;

  await rateLimit("serper");

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": SERPER_API_KEY,
      },
      body: JSON.stringify({
        q: query,
        num: maxResults,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[search-fallback] Serper error: ${response.status} ${errorText.substring(0, 200)}`);
      return null;
    }

    const data: SerperResponse = await response.json();

    if (data.error) {
      console.warn(`[search-fallback] Serper API error: ${data.error}`);
      return null;
    }

    const results = (data.organic || []).map((r) => ({
      title: r.title || "",
      url: r.link || "",
      content: r.snippet || "",
    }));

    if (results.length === 0) {
      console.warn(`[search-fallback] Serper returned 0 results for "${query}"`);
      return null;
    }

    console.info(`[search-fallback] Serper: ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.warn(`[search-fallback] Serper error: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

/* ───────────────────────────────
   Provider 3: Bing Web Search API
   ─────────────────────────────── */

interface BingResponse {
  webPages?: {
    value: Array<{
      name: string;
      url: string;
      snippet: string;
    }>;
  };
}

async function searchBing(query: string, maxResults: number): Promise<TavilySearchResult[] | null> {
  if (!BING_SEARCH_API_KEY) return null;

  await rateLimit("bing");

  try {
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${maxResults}&textDecorations=false&promote=WebPages`;
    const response = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": BING_SEARCH_API_KEY,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[search-fallback] Bing error: ${response.status} ${errorText.substring(0, 200)}`);
      return null;
    }

    const data: BingResponse = await response.json();
    const results = (data.webPages?.value || []).map((r) => ({
      title: r.name || "",
      url: r.url || "",
      content: r.snippet || "",
    }));

    if (results.length === 0) {
      console.warn(`[search-fallback] Bing returned 0 results for "${query}"`);
      return null;
    }

    console.info(`[search-fallback] Bing: ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.warn(`[search-fallback] Bing error: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

/* ───────────────────────────────
   Provider 4: Brave Search API
   ─────────────────────────────── */

interface BraveResponse {
  web?: {
    results?: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  };
}

async function searchBrave(query: string, maxResults: number): Promise<TavilySearchResult[] | null> {
  if (!BRAVE_API_KEY) return null;

  await rateLimit("brave");

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

    if (!response.ok) {
      const errorText = await response.text();
      // 402 = payment required / quota exceeded
      if (response.status === 402) {
        console.warn(`[search-fallback] Brave quota exceeded (402)`);
      } else {
        console.warn(`[search-fallback] Brave error: ${response.status} ${errorText.substring(0, 200)}`);
      }
      return null;
    }

    const data: BraveResponse = await response.json();
    const results = (data?.web?.results || []).map((r) => ({
      title: r.title || "",
      url: r.url || "",
      content: r.description || "",
    }));

    if (results.length === 0) {
      console.warn(`[search-fallback] Brave returned 0 results for "${query}"`);
      return null;
    }

    console.info(`[search-fallback] Brave: ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.warn(`[search-fallback] Brave error: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

/* ───────────────────────────────
   Unified Search: Chain all providers
   ─────────────────────────────── */

export async function unifiedSearch(
  query: string,
  options?: { maxResults?: number }
): Promise<{ results: TavilySearchResult[]; provider: string }> {
  const maxResults = options?.maxResults ?? 5;

  // Try Tavily first
  const tavilyResults = await searchTavily(query, maxResults);
  if (tavilyResults) {
    return { results: tavilyResults, provider: "tavily" };
  }

  // Fallback 1: Serper.dev
  const serperResults = await searchSerper(query, maxResults);
  if (serperResults) {
    return { results: serperResults, provider: "serper" };
  }

  // Fallback 2: Bing
  const bingResults = await searchBing(query, maxResults);
  if (bingResults) {
    return { results: bingResults, provider: "bing" };
  }

  // Fallback 3: Brave
  const braveResults = await searchBrave(query, maxResults);
  if (braveResults) {
    return { results: braveResults, provider: "brave" };
  }

  // All providers exhausted
  throw new Error(
    `All search providers failed for query "${query}". ` +
    `Configured: Tavily=${!!TAVILY_API_KEY}, Serper=${!!SERPER_API_KEY}, Bing=${!!BING_SEARCH_API_KEY}, Brave=${!!BRAVE_API_KEY}. ` +
    `Add SERPER_API_KEY or BING_SEARCH_API_KEY for fallback search.`
  );
}

/**
 * Backward-compatible wrapper — returns just the results array.
 * Used by modules that expect the old tavilySearch interface.
 */
export async function searchWithAnyProvider(
  query: string,
  options?: { maxResults?: number }
): Promise<TavilySearchResult[]> {
  const { results } = await unifiedSearch(query, options);
  return results;
}

/**
 * Check which search providers are currently available.
 */
export function getAvailableProviders(): { name: string; available: boolean }[] {
  return [
    { name: "tavily", available: !!TAVILY_API_KEY },
    { name: "serper", available: !!SERPER_API_KEY },
    { name: "bing", available: !!BING_SEARCH_API_KEY },
    { name: "brave", available: !!BRAVE_API_KEY },
  ];
}
