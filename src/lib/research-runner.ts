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
}

export async function runResearch(
  businessName: string,
  website: string,
  city: string,
  competitors: string[]
): Promise<ResearchResult> {
  // Detect niche for prompt templates
  const nicheConfig = detectNiche(businessName, website);
  
  // Generate prompts based on niche
  const prompts = generatePrompts(nicheConfig, businessName, city);
  
  // Run searches and track appearances
  const results = await runPromptSearches(prompts, businessName, website, competitors);
  
  // Calculate scores and bands
  const finalResult = calculateScores(results, businessName, competitors);
  
  return finalResult;
}

function generatePrompts(
  nicheConfig: ReturnType<typeof detectNiche>,
  businessName: string,
  city: string
): string[] {
  // Use niche-specific templates
  const templates = nicheConfig.promptTemplates;
  
  // Generate 15-20 prompts (use first 20 templates or cycle through them)
  const generatedPrompts: string[] = [];
  
  for (let i = 0; i < 20 && i < templates.length; i++) {
    const template = templates[i];
    const prompt = template
      .replace("{make}", extractMakeFromBusiness(businessName))
      .replace("{businessName}", businessName)
      .replace("{city}", city)
      .replace("{neighborhood}", city); // Simple fallback
    
    generatedPrompts.push(prompt);
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
  competitors: string[]
): Promise<PromptResult[]> {
  const results: PromptResult[] = [];
  
  for (const prompt of prompts) {
    try {
      const searchResults = await tavilySearch(prompt);
      
      // Check if business appears
      const businessAppeared = checkBusinessAppearance(searchResults, businessName, website);
      
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
  competitors: string[]
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
  
  // Determine service visibility (simplified for v1)
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
  
  // Competitor categories (simplified for v1)
  const competitorCategories = ["stronger local review presence", "clearer service pages"];
  
  return {
    prompts: results.map(r => r.prompt),
    appearedCount,
    totalPrompts,
    competitorAppearedCount,
    competitorTotalPrompts,
    statusBand,
    serviceVisibility,
    competitorMention,
    competitorLine,
    competitorCategories,
    whyThisMatters: "AI can shape the shortlist before a buyer visits your site, compares inventory, or books service.",
    recommendedNextStep: "Use the full audit to see the hidden prompt-by-prompt breakdown and what to fix first."
  };
}