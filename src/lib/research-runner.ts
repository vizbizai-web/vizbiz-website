/**
 * Research Runner Module
 * 
 * Executes AI visibility research by running niche-specific prompts through
 * Tavily search and tracking whether the business and competitors appear
 * in the results.
 */

import { detectNiche } from "./niche-detector";

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
  
  // Detect niche for prompt templates — use both name and website
  const nicheConfig = detectNiche(resolvedName, website);
  
  // Generate prompts based on niche
  const prompts = generatePrompts(nicheConfig, resolvedName, city);
  
  // Run searches and track appearances — check against BOTH names
  const results = await runPromptSearches(prompts, resolvedName, website, competitors, businessName);
  
  // Calculate scores and bands
  const finalResult = calculateScores(results, resolvedName, competitors, nicheConfig.niche);
  
  finalResult.resolvedName = resolvedName;
  return finalResult;
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
  city: string
): string[] {
  // Use niche-specific templates
  const templates = nicheConfig.promptTemplates;
  
  // Generate 15-20 prompts (use first 15 templates or cycle through them)
  const generatedPrompts: string[] = [];
  
  for (let i = 0; i < 15 && i < templates.length; i++) {
    const template = templates[i];
    const prompt = template
      .replace("{make}", extractMakeFromBusiness(businessName))
      .replace("{businessName}", businessName)
      .replace("{city}", city)
      .replace("{neighborhood}", city); // Simple fallback
    
    generatedPrompts.push(prompt);
  }
  
  // Always add business-name-specific prompts to check brand visibility
  const shortName = businessName.split(' ').slice(0, 2).join(' '); // First 2 words
  generatedPrompts.push(
    `${shortName} in ${city}`,
    `${shortName} reviews`,
    `${shortName} near me`,
    `best ${shortName.replace(/^(the|a|an)\s+/i, '')} in ${city}`,
    `${shortName} hours and location`,
  );
  
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
  const lowerCompetitors = competitors.map(c => c.toLowerCase());
  
  for (const result of searchResults) {
    const lowerTitle = result.title.toLowerCase();
    const lowerContent = result.content.toLowerCase();
    
    for (const competitor of lowerCompetitors) {
      if (lowerTitle.includes(competitor) || lowerContent.includes(competitor)) {
        return { appeared: true, name: competitors.find(c => c.toLowerCase() === competitor) };
      }
    }
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
  
  // Competitor mention
  const competitorMention = competitors.length > 0 ? competitors[0] : "nearby competitors";
  
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
  
  return {
    prompts: results.map(r => r.prompt),
    promptResults: results.map(r => ({
      prompt: r.prompt,
      businessAppeared: r.businessAppeared,
      competitorAppeared: r.competitorAppeared,
      competitorName: r.competitorName,
    })),
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
    case "beauty_salon":
      return ["stronger local review presence", "clearer service and booking pages"];
    case "venue_wedding":
      return ["stronger content targeting venue search queries", "clearer pricing and availability signals"];
    case "dance_studio":
      return ["stronger presence on class-style queries", "clearer schedule and booking information"];
    case "real_estate":
      return ["stronger local market content", "clearer neighborhood expertise signals"];
    default:
      return ["stronger local online presence", "clearer service information"];
  }
}

function getWhyThisMatters(niche: string): string {
  switch (niche) {
    case "car_dealership":
      return "AI can shape the shortlist before a buyer visits your lot, compares inventory, or books service.";
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