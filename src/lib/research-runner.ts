/**
 * Research Runner Module
 * 
 * Executes AI visibility research by running niche-specific prompts through
 * Tavily search and tracking whether the business and competitors appear
 * in the results.
 */

import { detectNiche, getNicheByName } from "./niche-detector";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!TAVILY_API_KEY) {
  console.warn("[research-runner] TAVILY_API_KEY not configured");
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
    console.error("[research-runner] Tavily search error:", error);
    throw error;
  }
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
}

export async function runResearch(
  businessName: string,
  website: string,
  city: string,
  competitors: string[]
): Promise<ResearchResult> {
  // Resolve the best business name to use for searches
  const resolvedName = resolveBusinessName(businessName, website);
  console.info(`[research-runner] Resolved business name: "${businessName}" → "${resolvedName}" (website: ${website})`);
  
  // STEP 1: Scan the website to understand what the business actually does
  const websiteInsight = await scanWebsite(website);
  console.info(`[research-runner] Website scan: services=[${websiteInsight.services.slice(0,5).join(', ')}] keywords=[${websiteInsight.keywords.slice(0,5).join(', ')}]`);
  
  // STEP 2: Detect niche using BOTH the website content and business name
  const nicheConfig = detectNiche(resolvedName, website);
  const finalNiche = websiteInsight.niche || nicheConfig.niche;
  console.info(`[research-runner] Detected niche: ${nicheConfig.niche}, website-inferred: ${websiteInsight.niche || 'none'}, final: ${finalNiche}`);
  
  // Use the website-informed niche config if available, otherwise fallback
  const activeNicheConfig = websiteInsight.nicheConfig || nicheConfig;
  
  // STEP 3: Generate prompts based on niche + actual services from website
  const prompts = generatePrompts(activeNicheConfig, resolvedName, city, websiteInsight.services);
  
  // STEP 4: Run searches and track appearances — check against BOTH names
  const results = await runPromptSearches(prompts, resolvedName, website, competitors, businessName);
  
  // STEP 5: Calculate scores and bands
  const finalResult = calculateScores(results, resolvedName, competitors, finalNiche);
  
  finalResult.resolvedName = resolvedName;
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
  // Also split camelCase-like patterns
  const readable = domain
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .replace(/([a-z])(and|by|the|of|for|in|at)([a-z])/gi, '$1 $2 $3') // word boundaries
    .replace(/[\-_.]/g, ' ')
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

function generatePrompts(
  nicheConfig: ReturnType<typeof detectNiche>,
  businessName: string,
  city: string,
  websiteServices: string[] = []
): string[] {
  // Use niche-specific templates
  const templates = nicheConfig.promptTemplates;
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

async function runPromptSearches(
  prompts: string[],
  businessName: string,
  website: string,
  competitors: string[],
  originalName?: string
): Promise<PromptResult[]> {
  const results: PromptResult[] = [];
  
  for (const prompt of prompts) {
    try {
      const searchResults = await tavilySearch(prompt);
      
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
      
      // Be gentle with API - small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`[research-runner] Failed prompt search for "${prompt}":`, error);
      results.push({
        prompt,
        businessAppeared: false,
        competitorAppeared: false
      });
    }
  }
  
  return results;
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
  
  // Return the found competitor (if any)
  if (seenNames.size > 0) {
    return { appeared: true, name: Array.from(seenNames)[0] };
  }
  
  return { appeared: false };
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
  
  // Competitor mention — find the most frequently appearing competitor
  const filteredResults = results.filter(r => r.competitorName && !/^(mapquest|google maps|yelp|tripadvisor|yellow pages|white pages|foursquare|bbb\.org|wikipedia|medium|facebook|instagram|linkedin|pinterest|reddit|youtube|google|bing|apple maps|waze|gasbuddy|angi|homeadvisor|thumbtack|booking\.com|airbnb|expedia|zillow|trulia|cars\.com|autotrader|edmunds|cargurus|truecar|kbb|kelly blue book)$/i.test(r.competitorName.trim()));
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
  const NOT_A_COMPETITOR = /^(mapquest|google maps|yelp|tripadvisor|yellow pages|white pages|foursquare|bbb\.org|wikipedia|medium|facebook|instagram|linkedin|pinterest|reddit|youtube|google|bing|apple maps|waze|gasbuddy|angi|homeadvisor|thumbtack|booking\.com|airbnb|expedia|zillow|trulia|cars\.com|autotrader|edmunds|cargurus|truecar|kbb|kelly blue book)$/i;

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
    default:
      return "AI can shape the shortlist before a customer finds you, compares options, or makes contact.";
  }
}