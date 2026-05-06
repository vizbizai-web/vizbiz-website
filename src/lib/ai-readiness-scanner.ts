/**
 * AI Readiness Scanner
 * 
 * Analyzes a website to determine its niche and how well it is optimized for AI search.
 * Uses LLM reasoning from the research engine to understand what the business actually does,
 * then falls back to keyword matching for speed when the site is clearly scoped.
 */

// Extended niche keyword list — covers more business types than before
const NICHE_KEYWORDS: Record<string, string[]> = {
  car_dealership: ["dealer", "auto", "cars", "automotive", "honda", "toyota", "ford", "chevrolet", "inventory", "financing", "trade-in", "certified pre-owned", "test drive"],
  fine_jewelry: ["jewelry", "jeweller", "diamond", "engagement ring", "gold", "platinum", "lab grown", "gemstone", "bridal jewelry"],
  spray_tanning: ["spray tan", "tanning", "sunless", "bronze", "glow", "airbrush tan"],
  beauty_salon: ["salon", "beauty", "hair", "nails", "facial", "spa", "barber"],
  venue_wedding: ["venue", "wedding", "event", "banquet", "ballroom", "reception"],
  dance_studio: ["dance", "ballet", "salsa", "hip hop", "studio", "dance class"],
  real_estate: ["realty", "real estate", "realtor", "property", "homes"],
  mobile_bar: ["cocktail", "bar", "mixology", "mobile bar", "cocktail catering", "pre-bottled cocktail", "premix", "drinks catering"],
  restaurant: ["menu", "restaurant", "dining", "bistro", "cuisine", "reservations", "lunch", "dinner"],
  photography: ["photographer", "photography", "portrait", "headshot", "photo session"],
  cleaning_service: ["cleaning", "cleaning service", "maid", "janitorial", "house cleaning"],
  barbershop: ["barber", "barbershop", "haircut", "beard trim"],
  fitness_gym: ["gym", "fitness", "personal trainer", "workout", "yoga studio"],
  med_spa: ["botox", "filler", "laser", "microneedling", "med spa", "injectables"],
  nail_salon: ["nail art", "manicure", "pedicure", "gel nails", "acrylic nails"],
  tutoring: ["tutoring", "tutor", "lessons", "learning center", "academic"],
  pet_services: ["dog", "pet", "grooming", "pet sitting", "dog walking"],
  landscaping: ["landscaping", "lawn", "garden", "landscape design"],
  it_services: ["it services", "tech support", "managed services", "cybersecurity"],
  marketing_agency: ["marketing agency", "digital marketing", "social media management", "seo services"],
};

export type AIReadinessReport = {
  niche: string;
  isOptimized: boolean;
  score: number; // 0-100
  findings: {
    hasLlmsTxt: boolean;
    hasSchema: boolean;
    contentQuality: "high" | "medium" | "low";
    detectedNiche: string;
    pricingInfo: string | null;
  };
  rawContent: string;
};

export async function scanAIReadiness(url: string): Promise<AIReadinessReport> {
  console.info(`[ai-scanner] Scanning ${url} for AI readiness...`);
  
  let rawContent = "";
  let hasLlmsTxt = false;
  let hasSchema = false;
  
  try {
    // 1. Check for llms.txt (the new standard for AI visibility)
    const llmsUrl = `${url.replace(/\/$/, "")}/llms.txt`;
    try {
      const llmsRes = await fetch(llmsUrl);
      if (llmsRes.ok) {
        hasLlmsTxt = true;
        const text = await llmsRes.text();
        rawContent += `\\n[llms.txt]\\n${text}\\n`;
      }
    } catch (e) {
      console.warn(`[ai-scanner] No llms.txt found at ${llmsUrl}`);
    }

    // 2. Fetch main page content
    const res = await fetch(url, { 
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
      } 
    });
    
    if (!res.ok) throw new Error(`Failed to fetch website: ${res.status}`);
    
    const html = await res.text();
    rawContent += `\\n[main_html]\\n${html}\\n`;

    // Simple schema check (JSON-LD)
    if (html.includes('<script type="application/ld+json">')) {
      hasSchema = true;
    }
  } catch (error) {
    console.error(`[ai-scanner] Scan failed for ${url}:`, error);
    return {
      niche: "unknown",
      isOptimized: false,
      score: 0,
      findings: { hasLlmsTxt: false, hasSchema: false, contentQuality: "low", detectedNiche: "unknown", pricingInfo: null },
      rawContent: "",
    };
  }

  // 3. Determine Niche and Extract Pricing using LLM
  let detectedNiche = "local_business";
  let pricingInfo = null;
  let score = 0;

  try {
    const prompt = `Analyze the following website content and return a JSON object.
    1. Determine the business niche. Pick the most specific one from this list: ${Object.keys(NICHE_KEYWORDS).join(", ")}, or return "local_business" if none fit.
    2. Extract any pricing, fees, or service costs mentioned. If not found, return null.
    3. Rate the content quality as "high", "medium", or "low".

    Content:
    ${rawContent.substring(0, 15000)}

    Return ONLY JSON in this format:
    { "niche": "string", "pricing": "string or null", "quality": "high|medium|low" }`;

    const llmRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}` 
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (llmRes.ok) {
      const data = await llmRes.json();
      const result = JSON.parse(data.choices[0].message.content);
      detectedNiche = result.niche || "local_business";
      pricingInfo = result.pricing;
      
      if (result.quality === "high") score += 20;
    }
  } catch (e) {
    console.warn(`[ai-scanner] LLM analysis failed, falling back to keywords:`, e);
    
    const contentLower = rawContent.toLowerCase();
    let bestKeywordsScore = 0;
    for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
      const kwScore = keywords.filter(k => contentLower.includes(k)).length;
      if (kwScore > bestKeywordsScore) {
        bestKeywordsScore = kwScore;
        detectedNiche = niche;
      }
    }
  }

  // Scoring logic
  if (hasLlmsTxt) score += 50;
  if (hasSchema) score += 30;
  if (rawContent.length > 5000) score += 20;
  
  return {
    niche: detectedNiche,
    isOptimized: score >= 50,
    score,
    findings: {
      hasLlmsTxt,
      hasSchema,
      contentQuality: score > 70 ? "high" : score > 30 ? "medium" : "low",
      detectedNiche,
      pricingInfo,
    },
    rawContent: rawContent.substring(0, 10000), // Cap content size
  };
}
