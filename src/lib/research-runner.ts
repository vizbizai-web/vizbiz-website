/**
 * Research Runner Module
 * 
 * Executes AI visibility research by running niche-specific prompts through
 * Tavily search and tracking whether the business and competitors appear
 * in the results.
 */

import { detectNiche, getNicheByName, generateDynamicNicheConfig } from "./niche-detector";
import { getPromptSetForNiche, calculateRevenueLoss } from "./prompt-curator";
import type { PromptSet } from "./prompt-curator";
import { isJunkCompetitor } from "./junk-filter";
import { collectSocialSignals } from "./social-signals";
import { extractFanoutQueries, scoreFanoutCoverage, generateFanoutReport } from "./query-fanout";
import { tavilySearch, type TavilySearchResult } from "./tavily-client";
import { validateCompetitor } from "./competitor-discovery";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY || "BSA-c4QXtAspJh_Dgjd_XE0boqxdCJl";

if (!TAVILY_API_KEY) {
  console.warn("[research-runner] TAVILY_API_KEY not configured");
}
if (!BRAVE_API_KEY) {
  console.warn("[research-runner] BRAVE_SEARCH_API_KEY not configured — no fallback available");
}

// TavilySearchResult imported from tavily-client.ts


// Tavily search imported from shared tavily-client.ts — single rate-limited instance
// Local TavilySearchResult type re-exported from tavily-client

/**
 * Brave Search API fallback
 * Returns results in the same TavilySearchResult format for compatibility.
 */
async function braveSearch(query: string): Promise<TavilySearchResult[]> {
  if (!BRAVE_API_KEY) {
    throw new Error("BRAVE_API_KEY not configured");
  }

  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&text_decorations=0`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brave search failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const results = data?.web?.results || [];
    
    // Map Brave results to Tavily format
    return results.map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      content: r.description || "",
    }));
  } catch (error) {
    console.error("[research-runner] Brave search error:", error);
    throw error;
  }
}

/**
 * Search with automatic fallback: Tavily → Brave
 * Tries Tavily first. On any failure (rate limit, timeout, error), falls back to Brave.
 */
async function searchWithFallback(query: string): Promise<{ results: TavilySearchResult[]; provider: string }> {
  // Try Tavily first
  if (TAVILY_API_KEY) {
    try {
      const results = await tavilySearch(query);
      return { results, provider: "tavily" };
    } catch (error) {
      console.warn(`[research-runner] Tavily failed for "${query}", falling back to Brave:`, error instanceof Error ? error.message : error);
    }
  }
  
  // Fallback to Brave
  if (BRAVE_API_KEY) {
    try {
      const results = await braveSearch(query);
      return { results, provider: "brave" };
    } catch (error) {
      console.error(`[research-runner] Brave also failed for "${query}":`, error instanceof Error ? error.message : error);
      throw error;
    }
  }
  
  throw new Error("No search provider available (both Tavily and Brave failed or not configured)");
}

export interface ResearchResult {
  prompts: string[];
  promptResults: { prompt: string; businessAppeared: boolean; competitorAppeared: boolean; competitorName?: string }[];
  resolvedName: string;
  appearedCount: number;
  totalPrompts: number;
  competitorAppearedCount: number;
  competitorTotalPrompts: number;
  statusBand: string;
  serviceVisibility: string;
  competitorMention: string;
  competitorLine: string;
  competitorCategories: string[];
  whyThisMatters: string;
  recommendedNextStep: string;
  niche: string;
  revenueLoss?: number;
  leadsLost?: number;
  recoveryPotential?: string;
  valueProposition?: string;
  pricingInfo?: string | null;
  estimatedRevenueGap?: { low: number; high: number; currency: string };
  socialPresence?: { instagram: number | null; facebook: number | null; googleReviews: number | null; googleRating: number | null; instagramUrl: string | null; facebookUrl: string | null };
  competitorSocial?: { name: string; instagram: number | null; facebook: number | null; googleReviews: number | null; googleRating: number | null }[];
  socialNarrative?: string;
  socialVsVisibility?: { hasStrongVisibilityLowSocial: boolean; hasWeakVisibilityHighSocial: boolean; socialGapMultiplier: number | null };
  // Edward Sturm query fan-out
  queryFanout?: {
    fanoutQueries: string[];
    summary: string;
    missedQueries: string[];
    competitorDominantQueries: string[];
  };
}

export async function runResearch(
  businessName: string,
  website: string,
  city: string,
  competitors: string[],
  preflightProfile?: {
    niche: string;
    valueProposition: string;
    pricingInfo: string | null;
    estimatedRevenueGap: { low: number; high: number; currency: string };
    aiReadinessScore: number;
    // v2 enriched fields
    businessType?: string;
    targetAudience?: string;
    services?: string[];
    siteLanguage?: string;
    searchLanguage?: string;
    market?: string;
    searchLangCode?: string;
    suggestedSearchQueries?: string[];
    competitorSearchQueries?: string[];
    // Scraper intelligence
    socialLinks?: {
      instagram: string | null;
      facebook: string | null;
      linkedin: string | null;
      twitter: string | null;
      tiktok: string | null;
      youtube: string | null;
    };
  },
  tier: 'free' | 'paid' = 'free'
): Promise<ResearchResult> {
  // Resolve the best business name to use for searches
  const resolvedName = resolveBusinessName(businessName, website);
  console.info(`[research-runner] Resolved business name: "${businessName}" → "${resolvedName}" (website: ${website})`);
  
  // STEP 1: Use PreFlight profile if available (no duplicate site fetch needed)
  let websiteInsight;
  let finalNiche;
  let enrichedPrompts: string[] | null = null; // v2: LLM-generated customer queries
  let enrichedCompQueries: string[] | null = null; // v2: LLM-generated competitor queries
  
  if (preflightProfile) {
    console.info(`[research-runner] Using PreFlight v2 profile: niche=${preflightProfile.niche}, businessType=${preflightProfile.businessType || 'N/A'}, market=${preflightProfile.market || 'N/A'}, searchLang=${preflightProfile.searchLanguage || 'N/A'}`);
    // Trust the LLM-classified niche even if not in our database
    const knownNicheConfig = getNicheByName(preflightProfile.niche);
    const dynamicConfig = knownNicheConfig ? null : generateDynamicNicheConfig(
      preflightProfile.niche,
      preflightProfile.businessType || undefined,
      preflightProfile.targetAudience || undefined,
      preflightProfile.searchLanguage || undefined
    );
    if (dynamicConfig) {
      console.info(`[research-runner] Generated dynamic niche config for: ${preflightProfile.businessType || preflightProfile.niche}`);
    }
    websiteInsight = {
      services: preflightProfile.services || (preflightProfile.valueProposition ? [preflightProfile.valueProposition] : []),
      keywords: [preflightProfile.businessType || preflightProfile.niche],
      niche: preflightProfile.niche,
      nicheConfig: knownNicheConfig || dynamicConfig,
    };
    finalNiche = preflightProfile.niche;

    // v2: Use LLM-generated queries if available
    if (preflightProfile.suggestedSearchQueries && preflightProfile.suggestedSearchQueries.length >= 5) {
      enrichedPrompts = preflightProfile.suggestedSearchQueries;
      console.info(`[research-runner] Using ${enrichedPrompts.length} LLM-generated customer search queries`);
    }
    if (preflightProfile.competitorSearchQueries && preflightProfile.competitorSearchQueries.length >= 2) {
      enrichedCompQueries = preflightProfile.competitorSearchQueries;
      console.info(`[research-runner] Using ${enrichedCompQueries.length} LLM-generated competitor search queries`);
    }
  } else {
    // Fallback: scan website ourselves
    websiteInsight = await scanWebsite(website);
    finalNiche = websiteInsight.niche || detectNiche(resolvedName, website).niche;
  }
  
  console.info(`[research-runner] Services: [${(websiteInsight.services || []).slice(0,5).join(', ')}]`);
  console.info(`[research-runner] Final niche: ${finalNiche}`);
  
  // STEP 3: Generate prompts based on niche + tier
  let prompts: string[];
  if (tier === 'paid') {
    // Full 84-prompt set for paid reports
    const { getPrompts } = await import('./full-prompts');
    const fullPromptDefs = getPrompts({
      businessName: resolvedName,
      city,
      niche: finalNiche,
      competitorMention: competitors[0] || '',
      websiteInsight,
    }, 'paid');
    prompts = fullPromptDefs.map(p => p.text);
    console.info(`[research-runner] Using FULL 84-prompt set (paid tier): ${prompts.length} prompts`);
  } else if (enrichedPrompts) {
    // v2: Use LLM-generated queries from preflight — these are already language+market specific
    // Pad to 20 if needed by generating variations
    prompts = buildPromptSetFromEnriched(enrichedPrompts, resolvedName, city, preflightProfile?.searchLanguage);
    console.info(`[research-runner] Using enriched prompt set: ${prompts.length} prompts (lang: ${preflightProfile?.searchLanguage || 'unknown'})`);
  } else {
    // Standard 20-prompt set for free reports
    const promptSet = getPromptSetForNiche(finalNiche);
    prompts = generatePrompts(promptSet, resolvedName, city, websiteInsight.services);
    console.info(`[research-runner] Using standard 20-prompt set (free tier)`);
  }
  
  // STEP 3.5: Prompt Quality Check — verify prompts match the business
  if (preflightProfile?.businessType) {
    try {
      const promptQuality = await verifyPromptQuality(prompts, preflightProfile.businessType, resolvedName);
      if (promptQuality.bad.length > 0) {
        console.warn(`[research-runner] ⚠️ ${promptQuality.bad.length} prompts don't match this business:`);
        for (const bad of promptQuality.bad) {
          console.warn(`[research-runner]   BAD: "${bad.prompt}" — ${bad.reason}`);
        }
        // Replace bad prompts with LLM-suggested alternatives
        if (promptQuality.replacements.length > 0) {
          let replaced = 0;
          for (const bad of promptQuality.bad) {
            const idx = prompts.indexOf(bad.prompt);
            if (idx >= 0 && promptQuality.replacements[replaced]) {
              console.info(`[research-runner]   FIX: "${bad.prompt}" → "${promptQuality.replacements[replaced]}"`);
              prompts[idx] = promptQuality.replacements[replaced];
              replaced++;
            }
          }
        }
      } else {
        console.info(`[research-runner] ✅ All ${prompts.length} prompts passed quality check`);
      }
    } catch (e) {
      console.warn(`[research-runner] Prompt quality check failed (non-blocking):`, e instanceof Error ? e.message : e);
    }
  }
  
  // STEP 4: Run searches and track appearances — check against BOTH names
  const { results, rawResults } = await runPromptSearches(prompts, resolvedName, website, competitors, businessName);
  
  // STEP 4.5: Discover competitors from search results
  // If no competitors were provided or the known competitors didn't show up,
  // scan ALL search results for recurring business names
  const discoveredCompetitors = discoverCompetitorsFromResults(rawResults, resolvedName, website, businessName, { businessType: preflightProfile?.businessType, services: preflightProfile?.services });
  if (discoveredCompetitors.length > 0) {
    console.info(`[research-runner] Discovered ${discoveredCompetitors.length} competitors from search results:`);
    for (const dc of discoveredCompetitors) {
      console.info(`[research-runner]   - ${dc.name} (appeared in ${dc.appearances} prompts)`);
    }
    
    // Re-check competitor appearances using discovered competitors
    const discoveredNames = discoveredCompetitors.map(dc => dc.name);
    for (let i = 0; i < results.length; i++) {
      if (!results[i].competitorAppeared) {
        const promptRaw = rawResults[i];
        if (promptRaw && promptRaw.results.length > 0) {
          const discResult = checkCompetitorAppearance(promptRaw.results, discoveredNames);
          if (discResult.appeared && discResult.name && validateCompetitor(discResult.name, { businessType: preflightProfile?.businessType, services: preflightProfile?.services }).valid) {
            results[i].competitorAppeared = true;
            results[i].competitorName = discResult.name;
          }
        }
      }
    }
  }
  
  // STEP 5: Calculate scores and bands
  const finalResult = calculateScores(results, resolvedName, competitors, finalNiche);

  // STEP 5.5: Post-research sanity check
  // If ALL prompts returned zero AND same competitor across all results,
  // that's a red flag — the prompts were probably wrong for this business.
  if (finalResult.appearedCount === 0 && finalResult.totalPrompts >= 10) {
    const compNames = finalResult.promptResults
      .filter(r => r.competitorName)
      .map(r => r.competitorName!);
    const uniqueComps = new Set(compNames);
    
    if (uniqueComps.size <= 1) {
      console.warn(`[research-runner] ⚠️ SANITY CHECK: 0 appearances, ${uniqueComps.size} competitor(s). Prompts may be wrong for this business.`);
      console.warn(`[research-runner] Business: ${resolvedName}, Niche: ${finalNiche}, BusinessType: ${preflightProfile?.businessType || 'N/A'}, SearchLang: ${preflightProfile?.searchLanguage || 'N/A'}`);
      console.warn(`[research-runner] Top competitor: ${[...uniqueComps][0] || 'none'}, Prompts sample: ${prompts.slice(0,3).join(' | ')}`);
      // Flag in the result for downstream review
      finalResult.recommendedNextStep = `⚠️ Research quality warning: Zero appearances with only ${uniqueComps.size} competitor found. Prompts may not match this business type (${preflightProfile?.businessType || finalNiche}). Consider rerunning with corrected niche or language settings.`;
    }
  }
  
  // STEP 6: Add revenue loss analysis
  const revLoss = calculateRevenueLoss(finalResult.appearedCount, finalResult.totalPrompts, finalNiche, preflightProfile?.pricingInfo || null);
  
  finalResult.resolvedName = resolvedName;
  finalResult.revenueLoss = revLoss.loss;
  finalResult.leadsLost = revLoss.leadsLost;
  finalResult.recoveryPotential = revLoss.recoveryPotential;
  
  // Attach PreFlight enhanced data
  if (preflightProfile) {
    finalResult.valueProposition = preflightProfile.valueProposition;
    finalResult.pricingInfo = preflightProfile.pricingInfo;
    finalResult.estimatedRevenueGap = preflightProfile.estimatedRevenueGap;
  }

  // STEP 7: Collect social signals (non-blocking — failures don't halt pipeline)
  try {
    const competitorNames = Object.entries(
      finalResult.promptResults
        .filter(r => r.competitorName)
        .reduce((acc, r) => { acc[r.competitorName!] = (acc[r.competitorName!] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);

    const socialData = await collectSocialSignals(
      businessName, city, website, competitorNames,
      { instagram: preflightProfile?.socialLinks?.instagram, facebook: preflightProfile?.socialLinks?.facebook }
    );
    finalResult.socialPresence = socialData.business;
    finalResult.competitorSocial = socialData.competitors;
    finalResult.socialNarrative = socialData.narrative;
    finalResult.socialVsVisibility = socialData.aiVisibilityVsSocial;
    console.info(`[research-runner] Social signals: IG=${socialData.business.instagram}, FB=${socialData.business.facebook}, Google=${socialData.business.googleReviews} reviews`);
  } catch (e) {
    console.warn(`[research-runner] Social signals failed (non-blocking):`, e instanceof Error ? e.message : e);
  }

  // STEP 8: Query fan-out extraction (Edward Sturm methodology)
  // Discovers the actual follow-up searches AI models perform when researching this business
  try {
    console.info(`[research-runner] Running query fan-out extraction...`);
    const fanout = await extractFanoutQueries(resolvedName, city, finalNiche);
    if (fanout.fanoutQueries.length >= 3) {
      const competitorNames = finalResult.promptResults
        .filter(r => r.competitorName)
        .map(r => r.competitorName!)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 3);
      const coverage = await scoreFanoutCoverage(fanout.fanoutQueries, resolvedName, competitorNames);
      const fanoutReport = generateFanoutReport(coverage);
      finalResult.queryFanout = {
        fanoutQueries: fanout.fanoutQueries,
        summary: fanoutReport.summary,
        missedQueries: fanoutReport.missedQueries,
        competitorDominantQueries: fanoutReport.competitorDominantQueries,
      };
      console.info(`[research-runner] Fan-out: ${fanout.fanoutQueries.length} queries, ${fanoutReport.missedQueries.length} missed, ${fanoutReport.competitorDominantQueries.length} competitor-dominated`);
    } else {
      console.info(`[research-runner] Fan-out extraction returned too few queries (${fanout.fanoutQueries.length}), skipping`);
    }
  } catch (e) {
    console.warn(`[research-runner] Query fan-out failed (non-blocking):`, e instanceof Error ? e.message : e);
  }

  return finalResult;
}

/**
 * Scan the business website to understand what they actually do.
 * This is the source of truth — not the business name, not our assumptions.
 */
async function scanWebsite(website: string): Promise<{
  keywords: string[];
  services: string[];
  niche: string | null;
  nicheConfig: ReturnType<typeof detectNiche> | null;
}> {
  const result = { keywords: [] as string[], services: [] as string[], niche: null as string | null, nicheConfig: null as ReturnType<typeof detectNiche> | null };
  
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10s timeout
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VizBizBot/1.0)' },
    });
    
    if (!response.ok) {
      console.warn(`[research-runner] Website scan failed: ${response.status} for ${url}`);
      return result;
    }
    
    const html = await response.text();
    
    // Extract text content (strip HTML tags)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();
    
    // Extract page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].toLowerCase() : '';
    
    // Scan for service-specific keywords to identify the actual niche
    const nicheSignals: Record<string, string[]> = {
      spray_tanning: ['spray tan', 'sunless tan', 'airbrush tan', 'mobile tan', 'bridal tan', 'tanning party', 'custom blend', 'bronze', 'contour tan'],
      beauty_salon: ['hair salon', 'haircut', 'hair color', 'blowout', 'keratin', 'balayage', 'highlights', 'barber', 'beauty salon'],
      nail_salon: ['nail art', 'manicure', 'pedicure', 'gel nails', 'acrylic nails', 'nail salon'],
      med_spa: ['botox', 'filler', 'laser', 'chemical peel', 'microneedling', 'med spa', 'injectables'],
      car_dealership: ['dealership', 'inventory', 'financing', 'lease', 'trade-in', 'service center', 'certified pre-owned', 'test drive'],
      venue_wedding: ['wedding venue', 'reception', 'ballroom', 'ceremony space', 'catering', 'event venue', 'banquet'],
      dance_studio: ['dance class', 'ballet', 'salsa', 'hip hop', 'choreography', 'dance studio', 'dance lessons'],
      real_estate: ['real estate', 'realtor', 'property', 'home sale', 'listing', 'buying a home', 'selling a home'],
      restaurant: ['menu', 'reservation', 'dining', 'restaurant', 'catering', 'takeout', 'delivery'],
      fitness: ['gym', 'personal training', 'group fitness', 'yoga', 'pilates', 'crossfit', 'membership'],
      photography: ['photography', 'photo session', 'portrait', 'wedding photographer', 'headshot'],
      cleaning: ['cleaning service', 'house cleaning', 'deep clean', 'maid service', 'janitorial'],
      fine_jewelry: ['jewelry', 'diamond', 'engagement ring', 'wedding band', 'fine jewelry', 'lab grown', 'lab-grown', '14k gold', '18k gold', 'gemstone', 'necklace', 'bracelet', 'earring', 'pendant', 'jewelry store', 'gold jewelry', 'custom jewelry', 'bespoke'],
      tourism_experience: ['pearl farm', 'oyster farm', 'aquaculture', 'farm tour', 'guided tour', 'scenic cruise', 'cellar door', 'winery tour', 'brewery tour', 'eco tour', 'wildlife tour', 'boat tour', 'adventure tour', 'day trip', 'day tour', 'tourist attraction', 'tourism', 'nature tour', 'cultural experience', 'outdoor experience', 'water activity', 'river cruise', 'seaplane', 'hot air balloon', 'helicopter tour', 'food tour', 'wine tasting', 'cooking class', 'kayak tour', 'snorkel', 'surf school'],
      mobile_bar: ['cocktail', 'mixology', 'mobile bar', 'cocktail catering', 'pre-bottled cocktail', 'premix', 'drinks catering', 'bartender', 'mocktail'],
      home_fragrance: ['home fragrance', 'scented candle', 'reed diffuser', 'room spray', 'wax melt', 'soy candle', 'hand poured', 'fragrance refill', 'candle shop', 'body fragrance', 'home scent', 'diffuser blend'],
    };
    
    // Score each niche by how many of its signals appear in the website text
    let bestNiche: string | null = null;
    let bestScore = 0;
    for (const [niche, signals] of Object.entries(nicheSignals)) {
      const score = signals.filter(s => text.includes(s) || title.includes(s)).length;
      if (score > bestScore) {
        bestScore = score;
        bestNiche = niche;
      }
    }
    
    // Only use website-detected niche if we found strong signals (2+ matches)
    if (bestScore >= 2 && bestNiche) {
      result.niche = bestNiche;
      // Get the niche config if it exists in our NICHES array
      const nicheConfig = getNicheByName(bestNiche);
      if (nicheConfig) {
        result.nicheConfig = nicheConfig;
      }
    }
    
    // Extract service-related phrases
    const servicePatterns = [
      /we (?:specialize|offer|provide|do) ([^.!?]+)/gi,
      /(?:specializing|offering|providing) ([^.!?]+)/gi,
      /our (?:services|products) (?:include|are) ([^.!?]+)/gi,
      /services?[:\-] ([^.!?]+)/gi,
    ];
    
    const foundServices: string[] = [];
    for (const pattern of servicePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null && foundServices.length < 10) {
        const service = match[1].trim().replace(/\s+/g, ' ').slice(0, 100);
        if (service.length > 5) foundServices.push(service);
      }
    }
    result.services = foundServices;
    
    // Extract top keywords (most frequent meaningful words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until', 'while', 'if', 'then', 'else', 'about', 'up', 'out', 'also', 'into', 'from', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'once', 'here', 'there', 'any', 'make', 'like', 'get', 'got', 'go', 'going', 'come', 'take', 'see', 'know', 'think', 'want', 'need', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try', 'leave', 'call', 'keep', 'let', 'begin', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'bring', 'happen', 'write', 'provide', 'include', 'your', 'you', 'we']);
    const words = text.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    const freq: Record<string, number> = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
    result.keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([w]) => w);
    
    console.info(`[research-runner] Website scanned: title="${title.slice(0, 80)}" text_length=${text.length} services=${foundServices.length} niche=${result.niche || 'not detected'}`);
    
  } catch (error) {
    console.warn(`[research-runner] Website scan failed for ${website}:`, error instanceof Error ? error.message : error);
    // Non-blocking — continue with keyword-based detection
  }
  
  return result;
}

/**
 * Resolve the best business name to use.
 * If the website domain contains more info than the provided name,
 * derive the name from the domain — it's the canonical identity.
 */
function resolveBusinessName(businessName: string, website: string): string {
  const domain = website.toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\.(com|ca|co\.uk|co|io|net|org|ai|biz|info|me).*$/, '')
    .trim();
  
  // Split domain on common word boundaries: 'and', 'by', 'the', 'of', 'for'
  // Only split if the keyword is at an actual boundary (not inside a word like 'water' containing 'at')
  const readable = domain
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .replace(/\b(and|by|the|of|for|in|at|360|news)\b/gi, ' ') // word boundaries only
    .replace(/[\-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const domainWords = readable.split(/\s+/).filter(w => w.length > 0);
  const domainName = domainWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // If domain has more words than the business name, it's likely more complete
  const nameWords = businessName.trim().split(/\s+/).filter(w => w.length > 0);
  if (domainWords.length > nameWords.length) {
    // Replace "And" with "&" if the original name uses it
    const ampersandName = businessName.includes('&') 
      ? domainName.replace(/\bAnd\b/g, '&')
      : domainName;
    console.info(`[research-runner] Domain "${domain}" is more descriptive than "${businessName}" → using "${ampersandName}"`);
    return ampersandName;
  }
  
  return businessName;
}

/**
 * Build a 20-prompt set from LLM-generated customer search queries.
 * These are already in the right language and market-specific.
 * If fewer than 20, generate variations to pad.
 */
function buildPromptSetFromEnriched(
  enrichedQueries: string[],
  businessName: string,
  city: string,
  searchLanguage?: string
): string[] {
  const prompts: string[] = [];

  // Use the LLM-generated queries directly — they're already specific
  for (const q of enrichedQueries) {
    if (prompts.length >= 20) break;
    // Replace placeholders if present
    const filled = q
      .replace(/{businessName}/gi, businessName)
      .replace(/{city}/gi, city);
    prompts.push(filled);
  }

  // Pad with variations if we have fewer than 20
  if (prompts.length < 20) {
    const shortName = businessName.split(' ').slice(0, 2).join(' ');
    const base = enrichedQueries[0] || `${businessName} in ${city}`;
    // Generate variations by rephrasing the top queries
    const variations = [
      `${shortName} reviews`,
      `${shortName} near me`,
      `${businessName} pricing`,
      `best ${businessTypeLabel(base)} in ${city}`,
      `${shortName} contact`,
      `${shortName} ${city}`,
      `${businessName} services`,
      `top ${businessTypeLabel(base)} ${city}`,
      `${businessName} recommendations`,
      `${shortName} booking`,
      `${businessName} consultation`,
      `trusted ${businessTypeLabel(base)} ${city}`,
    ];
    for (const v of variations) {
      if (prompts.length >= 20) break;
      if (!prompts.includes(v)) prompts.push(v);
    }
  }

  return prompts.slice(0, 20);
}

/** Extract a generic business type label from a search query for variation generation */
function businessTypeLabel(query: string): string {
  // Try to extract the business type from the query
  const cleaned = query.replace(/^(best|top|find|where|how|recommended|trusted)\s+/i, '')
    .replace(/\s+(in|near|for|at)\s+.*/i, '')
    .replace(/\s+(reviews|pricing|contact|services|booking|consultation)\s*$/i, '')
    .trim();
  return cleaned || 'business';
}

function generatePrompts(
  promptSet: PromptSet,
  businessName: string,
  city: string,
  websiteServices: string[] = []
): string[] {
  // Use niche-specific templates from the prompt set
  const templates = promptSet.prompts;
  // Generate prompts from templates — use up to 20 niche-specific prompts
  const generatedPrompts: string[] = [];
  
  for (let i = 0; i < 20 && i < templates.length; i++) {
    const template = templates[i];
    const prompt = template
      .replace("{make}", extractMakeFromBusiness(businessName))
      .replace("{businessName}", businessName)
      .replace("{city}", city)
      .replace("{neighborhood}", city);
    
    generatedPrompts.push(prompt);
  }
  
  // If fewer than 20 niche prompts, fill remaining with brand-specific queries
  if (generatedPrompts.length < 20) {
    const shortName = businessName.split(' ').slice(0, 2).join(' ');
    const brandPrompts = [
      `${shortName} in ${city}`,
      `${shortName} reviews`,
      `${shortName} near me`,
      `best ${shortName.replace(/^(the|a|an)\s+/i, '')} in ${city}`,
      `${shortName} hours and location`,
    ];
    for (const bp of brandPrompts) {
      if (generatedPrompts.length >= 20) break;
      generatedPrompts.push(bp);
    }
  }
  
  return generatedPrompts.slice(0, 20); // Ensure exactly 20 prompts
}

function extractMakeFromBusiness(businessName: string): string {
  // Simple extraction of common car makes for dealerships
  const makeKeywords = [
    "acura", "audi", "bmw", "buick", "cadillac", "chevrolet", "chevy",
    "chrysler", "dodge", "ford", "gmc", "honda", "hyundai", "infiniti",
    "jeep", "kia", "lexus", "mazda", "mercedes", "mini", "mitsubishi",
    "nissan", "porsche", "ram", "subaru", "tesla", "toyota", "volkswagen",
    "volvo", "jaguar", "land rover", "alfa romeo", "maserati", "ferrari"
  ];
  
  const lowerName = businessName.toLowerCase();
  for (const make of makeKeywords) {
    if (lowerName.includes(make)) {
      return make;
    }
  }
  
  return "car"; // Generic fallback
}

interface PromptResult {
  prompt: string;
  businessAppeared: boolean;
  competitorAppeared: boolean;
  competitorName?: string;
}

interface PromptSearchOutput {
  results: PromptResult[];
  rawResults: { prompt: string; results: TavilySearchResult[] }[];
}

async function runPromptSearches(
  prompts: string[],
  businessName: string,
  website: string,
  competitors: string[],
  originalName?: string
): Promise<PromptSearchOutput> {
  const results: PromptResult[] = [];
  const rawResults: { prompt: string; results: TavilySearchResult[] }[] = [];
  
  for (const prompt of prompts) {
    try {
      const { results: searchResults, provider } = await searchWithFallback(prompt);
      
      // Store raw results for competitor discovery
      rawResults.push({ prompt, results: searchResults });
      
      // Check if business appears — use resolved name AND original name
      let businessAppeared = checkBusinessAppearance(searchResults, businessName, website);
      if (!businessAppeared && originalName && originalName !== businessName) {
        businessAppeared = checkBusinessAppearance(searchResults, originalName, website);
      }
      
      // Check if any competitor appears
      const competitorResult = checkCompetitorAppearance(searchResults, competitors);
      
      results.push({
        prompt,
        businessAppeared,
        competitorAppeared: competitorResult.appeared,
        competitorName: competitorResult.name
      });
      
      // Be gentle with API - 500ms between requests (on top of Tavily rate limiter)
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`[research-runner] Failed prompt search for "${prompt}":`, error);
      results.push({
        prompt,
        businessAppeared: false,
        competitorAppeared: false
      });
      rawResults.push({ prompt, results: [] });
    }
  }
  
  return { results, rawResults };
}

function checkBusinessAppearance(
  searchResults: TavilySearchResult[],
  businessName: string,
  website: string
): boolean {
  const lowerBusinessName = businessName.toLowerCase();
  const lowerWebsite = website.toLowerCase().replace(/^https?:\/\//, "");
  
  for (const result of searchResults) {
    const lowerTitle = result.title.toLowerCase();
    const lowerUrl = result.url.toLowerCase();
    const lowerContent = result.content.toLowerCase();
    
      // Check if business name appears in title, URL, or content
      if (lowerTitle.includes(lowerBusinessName) ||
          lowerUrl.includes(lowerBusinessName) ||
          lowerContent.includes(lowerBusinessName)) {
        return true;
      }
      
      // Check if website appears in URL or content
      if (lowerUrl.includes(lowerWebsite) ||
          lowerContent.includes(lowerWebsite)) {
        return true;
      }
  }
  
  return false;
}

interface CompetitorCheckResult {
  appeared: boolean;
  name?: string;
}

function checkCompetitorAppearance(
  searchResults: TavilySearchResult[],
  competitors: string[]
): CompetitorCheckResult {
  // HARD BLOCK LIST — these are directories, platforms, or non-business entities
  // even if a competitor name happens to contain these words, the competitor is noise
  const HARD_BLOCK_RX = /^(mapquest|google maps|yelp|tripadvisor|yellow pages|white pages|foursquare|bbb\.org|wikipedia|medium|facebook|instagram|linkedin|pinterest|reddit|youtube|google|bing|apple maps|waze|gasbuddy|angi|homeadvisor|thumbtack|booking\.com|airbnb|expedia|zillow|trulia|cars\.com|autotrader|edmunds|cargurus|truecar|kbb|kelly blue book|car gurus|car guru|car and driver|motortrend|roadshow|the drive|jalopnik|top rated|best in|nearby|local options|recommended by|others in|featuring|featured|compare|vs\.|versus)$/i;
  const GENERIC_BLOCK = ['the best', 'top rated', 'best in', 'nearby', 'local', 'recommended', 'featured', 'compare', 'vs', 'versus', 'reviews of'];
  
  // Build search keys: the full name AND the first significant word
  // e.g. "VRAI San Francisco Showroom" → "vrai san francisco showroom" AND "vrai"
  // e.g. "Brilliant Earth" → "brilliant earth" AND "brilliant"
  // e.g. "Padis Jewelry" → "padis jewelry" AND "padis"
  const lowerCompetitors = competitors.map(c => c.toLowerCase());
  
  // Also extract the first word of each competitor as a fallback key
  const firstWordSet = new Set<string>();
  const fullMatchSet = new Set<string>(lowerCompetitors);
  for (const c of lowerCompetitors) {
    const firstWord = c.split(/\s+/)[0];
    if (firstWord && firstWord.length >= 3 && !['the', 'a', 'an', 'and', 'or', 'for'].includes(firstWord)) {
      firstWordSet.add(firstWord);
    }
  }
  
  const seenNames = new Set<string>();
  
  for (const result of searchResults) {
    const lowerTitle = result.title.toLowerCase();
    const lowerContent = result.content.toLowerCase();
    const combined = lowerTitle + " " + lowerContent;
    
    // Try full name match first
    for (const competitor of fullMatchSet) {
      if (combined.includes(competitor)) {
        const originalName = competitors.find(c => c.toLowerCase() === competitor);
        if (originalName && !seenNames.has(originalName)) {
          seenNames.add(originalName);
        }
      }
    }
    
    // Try first-word match as fallback (catches "VRAI" appearing as just "VRAI")
    for (const firstWord of firstWordSet) {
      if (combined.includes(firstWord)) {
        // Find the original competitor whose first word matches
        const matchingOriginal = competitors.find(c => c.toLowerCase().split(/\s+/)[0] === firstWord);
        if (matchingOriginal && !seenNames.has(matchingOriginal)) {
          seenNames.add(matchingOriginal);
        }
      }
    }
  }
  
  // Return the found competitor (if any) — with verification
  if (seenNames.size > 0) {
    const rawName = Array.from(seenNames)[0];
    
    // Verify: reject names that are directories, platform names, or generic phrases
    if (HARD_BLOCK_RX.test(rawName)) return { appeared: false };
    
    // Reject generic non-business phrases
    const lowerName = rawName.toLowerCase();
    if (GENERIC_BLOCK.some(b => lowerName.includes(b))) return { appeared: false };
    
    // Reject single-word names unless they look like proper nouns (capitalized)
    const words = rawName.split(/\s+/);
    if (words.length === 1 && rawName.length < 4) return { appeared: false };
    if (words.length === 1 && /^[a-z]/.test(rawName)) return { appeared: false };
    
    // Reject names that are clearly URLs or email addresses
    if (/\.[a-z]{2,}(\/|$)/i.test(rawName)) return { appeared: false };
    
    // Reject aggregator/platform names (Getyourguide, Viator, etc.)
    if (!validateCompetitor(rawName).valid) return { appeared: false };

    return { appeared: true, name: rawName };
  }
  
  return { appeared: false };
}

/**
 * Competitor Discovery from Search Results
 * 
 * After research runs, scan ALL search results for recurring business names.
 * This discovers competitors that weren't known upfront.
 * 
 * How it works:
 * 1. Collect all raw search results from the 20 prompts
 * 2. Extract candidate business names from titles + URLs
 * 3. Filter out the target business, directories, and generic names
 * 4. Score by frequency of appearance across different prompts
 * 5. Return top discovered competitors
 */
interface DiscoveredCompetitor {
  name: string;
  appearances: number; // Number of distinct prompts where they appeared
  urls: string[]; // Their URLs for verification
}

// Directory/platform domains that should NEVER be listed as competitors
const DIRECTORY_DOMAINS = [
  'mapquest.com', 'google.com', 'maps.google', 'yelp.com', 'tripadvisor.com',
  'yellowpages.com', 'whitepages.com', 'foursquare.com', 'bbb.org',
  'wikipedia.org', 'medium.com', 'facebook.com', 'instagram.com',
  'linkedin.com', 'pinterest.com', 'reddit.com', 'youtube.com',
  'bing.com', 'apple.com', 'waze.com', 'angi.com', 'homeadvisor.com',
  'thumbtack.com', 'booking.com', 'airbnb.com', 'expedia.com',
  'zillow.com', 'trulia.com', 'cars.com', 'autotrader.com', 'edmunds.com',
  'cargurus.com', 'truecar.com', 'kbb.com', 'whereis.com',
  'f6s.com', 'crunchbase.com', 'glassdoor.com', 'indeed.com',
  'timeout.com', 'visitnsw.com', 'sydney.com', 'australia.com',
  'lovecentralcoast.com', 'nationalparks.nsw.gov.au',
  'expedia.com.au', 'getyourguide.com', 'hawkesburyriver.com',
  'googleusercontent.com', 'gstatic.com',
];

// Generic phrases that aren't business names
const GENERIC_PHRASES = [
  'top rated', 'best in', 'nearby', 'local options', 'recommended by',
  'featured', 'compare', 'vs', 'versus', 'reviews of', 'the best',
  'local competitors', 'nearby businesses', 'similar companies',
  'others in the area', 'local options', 'see all', 'view all',
  'learn more', 'read more', 'click here', 'find out more',
];

// Aggregator/platform names that should NEVER be listed as competitors
// These are booking platforms, directories, review sites, and generic listings
const AGGREGATOR_NAMES = [
  'getyourguide', 'viator', 'klook', 'tripadvisor', 'airbnb experience',
  'booking.com', 'expedia', 'hotels.com', 'agoda', 'hostelworld',
  'what\'s on', 'whats on', 'timeout', 'time out', 'visit ', 'discover ',
  'things to do', 'book now', 'book online',
  'justdial', 'indiamart', 'yelp', 'google maps', 'google reviews',
  'yellow pages', 'white pages', 'bbb', 'better business',
  'eventbrite', 'meetup', 'stubhub', 'ticketmaster',
  'wikipedia', 'wikitravel', 'lonely planet', 'rough guides',
  'trip ', 'tours and ', 'best tours', 'top tours',
  'car & truck', 'car and truck', 'transporting companies near',
  'carriers in ', 'near ', 'local ',
];

/**
 * Expanded junk patterns for competitor validation
 */
const JUNK_BUSINESS_PATTERNS: RegExp[] = [
  /chamber\s+of\s+commerce/i,
  /better\s+business\s+bureau/i,
  /council$/i,
  /association$/i,
  /federation$/i,
  /authority$/i,
  /department\s+of/i,
  /government/i,
  /\.gov/i,
  /^news$/i,
  /^weather$/i,
  /^events?$/i,
  /^jobs?$/i,
  /^classes?$/i,
  /^courses?$/i,
  /^training$/i,
];

// NOTE: isRealBusiness removed — use validateCompetitor() from ./competitor-discovery instead
// which provides the same checks plus additional geo + niche validation.

function extractDomainName(url: string): { name: string; domain: string } | null {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(fullUrl);
    const domain = parsed.hostname.replace(/^www\./, '');
    
    // Skip directory domains
    if (DIRECTORY_DOMAINS.some(d => domain.includes(d))) return null;
    
    // Extract readable name from domain
    const parts = domain.split('.')[0];
    const name = parts
      .replace(/[-_.]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
    
    if (name.length < 3) return null;
    
    return { name, domain };
  } catch {
    return null;
  }
}

function extractTitleBusiness(title: string): string | null {
  // Clean up title — remove common suffixes
  const cleaned = title
    .replace(/\s*[|–—-]\s*(home|official|reviews|menu|prices|book|book now).*$/i, '')
    .replace(/\s*\|\s*.*$/g, '') // Remove everything after pipe
    .replace(/\s*-\s*.*$/g, '') // Remove everything after dash (if long suffix)
    .trim();
  
  if (cleaned.length < 3 || cleaned.length > 80) return null;
  if (GENERIC_PHRASES.some(p => cleaned.toLowerCase().includes(p))) return null;
  
  return cleaned;
}

function discoverCompetitorsFromResults(
  allSearchResults: { prompt: string; results: TavilySearchResult[] }[],
  businessName: string,
  businessWebsite: string,
  originalName?: string,
  preflightContext?: { businessType?: string; services?: string[] }
): DiscoveredCompetitor[] {
  const candidateScores: Map<string, { appearances: number; urls: Set<string>; names: Set<string> }> = new Map();
  
  const lowerBizName = businessName.toLowerCase();
  const lowerOrigName = (originalName || '').toLowerCase();
  const lowerBizWebsite = businessWebsite.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Key business name parts to exclude (e.g. "broken bay" from "Broken Bay Pearl Farm")
  const bizNameParts = lowerBizName.split(/\s+/).filter(w => w.length >= 4);
  
  for (const { prompt, results } of allSearchResults) {
    // Track which candidates appeared in THIS prompt (avoid double-counting)
    const promptCandidates = new Set<string>();
    
    for (const result of results) {
      const lowerTitle = result.title.toLowerCase();
      const lowerUrl = result.url.toLowerCase();
      const lowerContent = result.content.toLowerCase();
      
      // Skip if this is the target business
      if (lowerTitle.includes(lowerBizName) || lowerUrl.includes(lowerBizWebsite)) continue;
      if (originalName && lowerTitle.includes(lowerOrigName)) continue;
      
      // Skip directory results
      if (DIRECTORY_DOMAINS.some(d => lowerUrl.includes(d))) continue;
      
      // Extract candidate from URL domain
      const domainInfo = extractDomainName(result.url);
      if (domainInfo) {
        // Skip if the domain looks like the target business
        const lowerDomainName = domainInfo.name.toLowerCase();
        if (lowerDomainName.includes(lowerBizName.split(' ')[0]) && bizNameParts.length > 1) {
          // Might be a subdomain or related page — skip if it contains 2+ business name parts
          const matchCount = bizNameParts.filter(p => lowerDomainName.includes(p)).length;
          if (matchCount >= 2) continue;
        }
        
        // Use domain as candidate key
        const key = domainInfo.domain;
        if (!promptCandidates.has(key)) {
          promptCandidates.add(key);
          if (!candidateScores.has(key)) {
            candidateScores.set(key, { appearances: 0, urls: new Set(), names: new Set() });
          }
          const entry = candidateScores.get(key)!;
          entry.appearances++;
          entry.urls.add(result.url);
          // Also track the title as a display name
          const titleBiz = extractTitleBusiness(result.title);
          if (titleBiz && titleBiz.length > 3) {
            entry.names.add(titleBiz);
          }
        }
      }
    }
  }
  
  // Convert to array and sort by appearances
  const sorted: DiscoveredCompetitor[] = [];
  for (const [domain, data] of candidateScores) {
    // Only consider candidates that appeared in 2+ distinct prompts
    if (data.appearances < 2) continue;
    
    // Pick the best display name: prefer title-based name over domain name
    const names = Array.from(data.names);
    let displayName: string;
    
    if (names.length > 0) {
      // Use the most common title name, or the longest one that's still reasonable
      const nameFreq: Map<string, number> = new Map();
      for (const n of names) nameFreq.set(n, (nameFreq.get(n) || 0) + 1);
      displayName = Array.from(nameFreq.entries()).sort((a, b) => b[1] - a[1])[0][0];
    } else {
      // Fallback: use domain name with title casing
      displayName = domain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    
    sorted.push({
      name: displayName,
      appearances: data.appearances,
      urls: Array.from(data.urls).slice(0, 3),
    });
  }
  
  return sorted.sort((a, b) => b.appearances - a.appearances)
    .filter(dc => validateCompetitor(dc.name, { businessType: preflightContext?.businessType, services: preflightContext?.services }).valid)
    .slice(0, 5);
}

function calculateScores(
  results: PromptResult[],
  businessName: string,
  competitors: string[],
  niche: string
): ResearchResult {
  // Count appearances
  const appearedCount = results.filter(r => r.businessAppeared).length;
  const totalPrompts = results.length;
  
  const competitorAppearedCount = results.filter(r => r.competitorAppeared).length;
  const competitorTotalPrompts = results.length;
  
  // Calculate appearance rate
  const appearanceRate = appearedCount / totalPrompts;
  
  // Determine status band
  let statusBand = "Weak";
  if (appearanceRate >= 0.7) {
    statusBand = "Strong";
  } else if (appearanceRate >= 0.4) {
    statusBand = "Moderate";
  }
  
  // Niche-adaptive: dealerships get "Service Visibility", others get "Booking & Inquiry Visibility"
  let serviceVisibility = "Not surfaced";
  if (appearanceRate >= 0.5) {
    serviceVisibility = "Strong";
  } else if (appearanceRate >= 0.2) {
    serviceVisibility = "Moderate";
  }
  
  // Filter junk competitors from ALL results before storing
  for (const r of results) {
    if (r.competitorName && isJunkCompetitor(r.competitorName.trim())) {
      r.competitorName = undefined;
      r.competitorAppeared = false;
    }
  }

  // Competitor mention — find the most frequently appearing competitor
  const filteredResults = results.filter(r => r.competitorName);
  const competitorNameCounts = new Map<string, number>();
  for (const r of filteredResults) {
    if (r.competitorAppeared && r.competitorName) {
      const count = competitorNameCounts.get(r.competitorName) || 0;
      competitorNameCounts.set(r.competitorName, count + 1);
    }
  }
  let topCompetitorName = "nearby competitors";
  let topCompetitorCount = 0;
  for (const [name, count] of competitorNameCounts) {
    if (count > topCompetitorCount) {
      topCompetitorCount = count;
      topCompetitorName = name;
    }
  }
  
  // Fallback: if no competitor appeared in results but we have competitor names from discovery, use the first one
  if (topCompetitorName === "nearby competitors" && competitors.length > 0) {
    topCompetitorName = competitors[0];
  }
  
  const competitorMention = topCompetitorName;
  
  // Competitor line
  const competitorRate = competitorAppearedCount / competitorTotalPrompts;
  let competitorLine = "Your competitors appear more frequently in AI-driven searches.";
  if (competitorRate < appearanceRate) {
    competitorLine = "You appear more frequently than your competitors in AI-driven searches.";
  } else if (competitorRate === appearanceRate) {
    competitorLine = "You and your competitors appear equally in AI-driven searches.";
  }
  
  // Niche-specific competitor categories and messaging
  const competitorCategories = getCompetitorCategories(niche);
  const whyThisMatters = getWhyThisMatters(niche);

  // Directory/platform names that AI models mention but aren't real business competitors
  const NOT_A_COMPETITOR = /^(mapquest|google maps|yelp|tripadvisor|yellow pages|white pages|foursquare|bbb\.org|wikipedia|medium|facebook|instagram|linkedin|pinterest|reddit|youtube|google|bing|apple maps|waze|gasbuddy|angi|homeadvisor|thumbtack|booking\.com|airbnb|expedia|zillow|trulia|cars\.com|autotrader|edmunds|cargurus|truecar|kbb|kelly blue book|whereis)$/i;

  return {
    prompts: results.map(r => r.prompt),
    promptResults: results.map(r => {
      const cleanCompetitorName = r.competitorName && NOT_A_COMPETITOR.test(r.competitorName.trim()) ? undefined : r.competitorName;
      const isCompetitorAppeared = cleanCompetitorName ? r.competitorAppeared : false;
      return {
        prompt: r.prompt,
        businessAppeared: r.businessAppeared,
        competitorAppeared: isCompetitorAppeared,
        competitorName: cleanCompetitorName,
      };
    }),
    resolvedName: '', // Will be set by caller
    appearedCount,
    totalPrompts,
    competitorAppearedCount,
    competitorTotalPrompts,
    statusBand,
    serviceVisibility,
    competitorMention,
    competitorLine,
    competitorCategories,
    whyThisMatters,
    recommendedNextStep: "Use the full audit to see the hidden prompt-by-prompt breakdown and what to fix first.",
    niche
  };
}

function getCompetitorCategories(niche: string): string[] {
  switch (niche) {
    case "car_dealership":
      return ["stronger local review presence", "clearer service and fixed ops pages"];
    case "spray_tanning":
      return ["stronger local review presence", "clearer service and booking pages"];
    case "beauty_salon":
      return ["stronger local review presence", "clearer service and booking pages"];
    case "venue_wedding":
      return ["stronger content targeting venue search queries", "clearer pricing and availability signals"];
    case "dance_studio":
      return ["stronger presence on class-style queries", "clearer schedule and booking information"];
    case "real_estate":
      return ["stronger local market content", "clearer neighborhood expertise signals"];
    case "fine_jewelry":
      return ["stronger online presence in diamond and jewelry searches", "clearer brand positioning against major lab-grown diamond retailers"];
    case "tourism_experience":
      return ["stronger presence on broad tourism and day-trip queries", "well-established review presence on travel platforms"];
    case "restaurant":
      return ["stronger presence on dining and reservation platforms", "better review visibility on food-focused searches"];
    case "home_fragrance":
      return ["stronger online presence in home scent and candle searches", "clearer brand positioning against established fragrance brands"];
    case "auto_transport":
      return ["stronger local online presence", "clearer service information"];
    default:
      return ["stronger local online presence", "clearer service information"];
  }
}

function getWhyThisMatters(niche: string): string {
  switch (niche) {
    case "car_dealership":
      return "AI can shape the shortlist before a buyer visits your lot, compares inventory, or books service.";
    case "spray_tanning":
      return "AI can shape the shortlist before someone books a tan, compares tanning salons, or reads reviews.";
    case "beauty_salon":
      return "AI can shape the shortlist before someone books an appointment, compares salons, or reads reviews.";
    case "venue_wedding":
      return "AI can shape the shortlist before a couple visits your venue, checks availability, or requests a quote.";
    case "dance_studio":
      return "AI can shape the shortlist before someone tries a class, compares studios, or signs up for lessons.";
    case "real_estate":
      return "AI can shape the shortlist before a buyer picks an agent, schedules viewings, or lists their home.";
    case "tourism_experience":
      return "AI shapes the shortlist before a visitor plans a day trip, looks for unique experiences, or searches for things to do. If you don't appear, tourists book someone else.";
    case "restaurant":
      return "AI shapes the shortlist before someone picks where to eat, checks reviews, or makes a reservation.";
    case "home_fragrance":
      return "AI shapes the shortlist before someone buys candles, diffusers, or home scent products online. If you don't appear, customers buy from brands that do.";
    case "auto_transport":
      return "AI can shape the shortlist before a customer finds you, compares options, or makes contact.";
    default:
      return "AI can shape the shortlist before a customer finds you, compares options, or makes contact.";
  }
}
/**
 * STEP 3.5: Prompt Quality Verification
 * 
 * Uses a quick LLM call to verify that generated prompts are actually
 * relevant to the business type. Catches mismatches like "water polo news"
 * for a water polo training platform, or "best dealership" for a restaurant.
 */
async function verifyPromptQuality(
  prompts: string[],
  businessType: string,
  businessName: string,
): Promise<{ bad: { prompt: string; reason: string }[]; replacements: string[] }> {
  const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
  if (!OLLAMA_API_KEY) return { bad: [], replacements: [] };

  // Sample up to 10 prompts to check (don't check all 20 to save time)
  const samplePrompts = prompts.slice(0, 10);

  const verifyPrompt = `You are checking if search queries are appropriate for a specific business.

Business: "${businessName}"
Business type: "${businessType}"

For each search query below, determine if it's a realistic query that a CUSTOMER would type to find THIS specific type of business. 

A BAD query is one that:
- Is about a different industry/service entirely
- Is a news/information query, not a buyer-intent query
- Uses the wrong language or market
- Is too generic (e.g., "best X near me" when the business is a specific niche)
- Would never lead someone to hire or buy from this business

Return ONLY valid JSON. No markdown. No code fences.
{
  "bad": [
    {"prompt": "exact prompt text", "reason": "why it's bad"}
  ],
  "replacements": [
    "better prompt to replace the first bad one",
    "better prompt to replace the second bad one"
  ]
}

If all prompts are good, return: {"bad": [], "replacements": []}

QUERIES TO CHECK:
${samplePrompts.map((p, i) => `${i + 1}. "${p}"`).join('\n')}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch("https://ollama.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemma3:4b",
        messages: [{ role: "user", content: verifyPrompt }],
        stream: false,
        options: { temperature: 0.1 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Ollama returned ${res.status}`);
    }

    const data = await res.json();
    const content = data?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { bad: [], replacements: [] };
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      bad: Array.isArray(parsed.bad) ? parsed.bad : [],
      replacements: Array.isArray(parsed.replacements) ? parsed.replacements : [],
    };
  } catch (e) {
    console.warn("[research-runner] Prompt quality LLM call failed:", e instanceof Error ? e.message : e);
    return { bad: [], replacements: [] };
  }
}
