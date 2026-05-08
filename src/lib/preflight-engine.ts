/**
 * PreFlight Engine — Single-pass Business Intelligence Extraction
 *
 * Consolidates what ai-readiness-scanner and niche-detector do separately
 * into one fetch + one LLM call. Returns a structured BusinessProfile
 * with niche, pricing, value prop, and quality assessment.
 *
 * This eliminates the duplicate-site-fetch problem and gives us
 * revenue signals we can show on the thank-you page instantly.
 *
 * Used by: intake route (instant scan + revenue gap)
 * Consumed by: research-runner (hyper-tailored prompts),
 *              report-content (competitor filtering),
 *              thank-you page (revenue gap hook)
 */

export type BusinessProfile = {
  niche: string;
  nicheLabel: string;
  pricingInfo: string | null;
  valueProposition: string;
  contentQuality: "high" | "medium" | "low";
  hasLlmsTxt: boolean;
  hasSchema: boolean;
  aiReadinessScore: number; // 0-100
  estimatedRevenueGap: {
    low: number;
    high: number;
    currency: string;
  };
};

// Weighted scoring for each niche — average lead value and monthly volume
const NICHE_ECONOMICS: Record<string, { label: string; avgLeadValue: number; monthlyVolume: number }> = {
  car_dealership: { label: "Car Dealership", avgLeadValue: 500, monthlyVolume: 200 },
  fine_jewelry: { label: "Fine Jewelry", avgLeadValue: 800, monthlyVolume: 50 },
  spray_tanning: { label: "Spray Tanning", avgLeadValue: 80, monthlyVolume: 100 },
  beauty_salon: { label: "Beauty Salon", avgLeadValue: 100, monthlyVolume: 150 },
  venue_wedding: { label: "Wedding Venue", avgLeadValue: 2000, monthlyVolume: 30 },
  dance_studio: { label: "Dance Studio", avgLeadValue: 150, monthlyVolume: 80 },
  real_estate: { label: "Real Estate", avgLeadValue: 3000, monthlyVolume: 20 },
  mobile_bar: { label: "Mobile Cocktail Bar", avgLeadValue: 350, monthlyVolume: 60 },
  auto_transport: { label: "Auto Transport & Car Hauling", avgLeadValue: 500, monthlyVolume: 120 },
  restaurant: { label: "Restaurant", avgLeadValue: 50, monthlyVolume: 500 },
  photography: { label: "Photography", avgLeadValue: 250, monthlyVolume: 40 },
  cleaning_service: { label: "Cleaning Service", avgLeadValue: 150, monthlyVolume: 60 },
  barbershop: { label: "Barbershop", avgLeadValue: 40, monthlyVolume: 200 },
  fitness_gym: { label: "Fitness / Gym", avgLeadValue: 100, monthlyVolume: 120 },
  med_spa: { label: "Med Spa", avgLeadValue: 400, monthlyVolume: 60 },
  nail_salon: { label: "Nail Salon", avgLeadValue: 60, monthlyVolume: 150 },
  tutoring: { label: "Tutoring", avgLeadValue: 100, monthlyVolume: 60 },
  pet_services: { label: "Pet Services", avgLeadValue: 80, monthlyVolume: 80 },
  landscaping: { label: "Landscaping", avgLeadValue: 500, monthlyVolume: 30 },
  it_services: { label: "IT Services", avgLeadValue: 500, monthlyVolume: 30 },
  marketing_agency: { label: "Marketing Agency", avgLeadValue: 1000, monthlyVolume: 20 },
  local_business: { label: "Local Business", avgLeadValue: 200, monthlyVolume: 60 },
  tourism_experience: { label: "Tourism Experience", avgLeadValue: 150, monthlyVolume: 80 },
  unknown: { label: "Unknown", avgLeadValue: 200, monthlyVolume: 40 },
};

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
  auto_transport: ["auto transport", "car shipping", "car hauling", "vehicle transport", "vehicle shipping", "auto shipping", "car carrier", "vehicle logistics", "car delivery", "auto logistics", "car mover", "vehicle relocation", "transport group", "logistics group", "enclosed carrier", "car carrier service", "ship my car", "car hauling company"],
  tourism_experience: ["pearl farm", "oyster farm", "aquaculture", "farm tour", "guided tour", "scenic cruise", "cellar door", "winery tour", "brewery tour", "eco tour", "wildlife tour", "boat tour", "adventure tour", "day trip", "day tour", "tourist attraction", "tourism", "nature tour", "cultural experience", "outdoor experience", "water activity", "river cruise", "seaplane", "food tour", "wine tasting", "cooking class", "kayak tour"],
};

/**
 * Calculate the revenue gap estimate for a business based on niche and AI readiness score.
 * The gap is proportional to visibility: low score = high gap (more unseen leads).
 */
function calcRevenueGap(niche: string, score: number): { low: number; high: number; currency: string } {
  const eco = NICHE_ECONOMICS[niche] || NICHE_ECONOMICS.local_business;
  const visibilityGap = 1 - (score / 100);
  const low = Math.round(eco.monthlyVolume * visibilityGap * eco.avgLeadValue * 0.5);
  const high = Math.round(eco.monthlyVolume * visibilityGap * eco.avgLeadValue * 1.5);
  return { low: Math.max(low, 0), high: Math.max(high, 0), currency: "USD" };
}

/**
 * Extract plain text from HTML — strips tags, scripts, styles
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keyword-based niche detection fallback
 */
function detectNicheByKeywords(text: string): string {
  const lower = text.toLowerCase();
  let bestNiche = "local_business";
  let bestScore = 0;
  for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }
  return bestNiche;
}

/**
 * PreFlight — Single-pass Business Intelligence
 * 
 * @param url — The business website URL
 * @returns BusinessProfile — structured, with estimated revenue gap
 */
export async function preflightScan(url: string): Promise<BusinessProfile> {
  console.info(`[preflight] Scanning ${url}...`);

  let rawText = "";
  let hasLlmsTxt = false;
  let hasSchema = false;

  // -- Stage 1: Fetch site content (single pass) --
  try {
    // Check llms.txt
    const llmsUrl = `${url.replace(/\/$/, "")}/llms.txt`;
    try {
      const llmsRes = await fetch(llmsUrl);
      if (llmsRes.ok) {
        hasLlmsTxt = true;
        rawText += await llmsRes.text() + "\n";
      }
    } catch {
      // no llms.txt, fine
    }

    // Main page
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    rawText += stripHtml(html);

    if (html.includes('<script type="application/ld+json">')) {
      hasSchema = true;
    }
  } catch (error) {
    console.error(`[preflight] Fetch failed for ${url}:`, error);
    const fallbackEconomic = NICHE_ECONOMICS.unknown;
    return {
      niche: "unknown",
      nicheLabel: "Unknown",
      pricingInfo: null,
      valueProposition: "",
      contentQuality: "low",
      hasLlmsTxt: false,
      hasSchema: false,
      aiReadinessScore: 0,
      estimatedRevenueGap: {
        low: Math.round(fallbackEconomic.monthlyVolume * fallbackEconomic.avgLeadValue * 0.5),
        high: Math.round(fallbackEconomic.monthlyVolume * fallbackEconomic.avgLeadValue * 1.5),
        currency: "USD",
      },
    };
  }

  // -- Stage 2: LLM extraction using Ollama Cloud (free, already configured) --
  let niche = "local_business";
  let pricingInfo: string | null = null;
  let valueProposition = "";
  let contentQuality: "high" | "medium" | "low" = "low";
  let llmUsed = false;

  const contentSample = rawText.substring(0, 10000);

  const OLLAMA_API_KEY = "ca4b7a95dec24d5f8b310f94c277196b.4h7qtSbi4UUX8UZeEk_-kGIg";
  const OLLAMA_BASE_URL = "https://ollama.com/api"; // Ollama Cloud API endpoint

  try {
    const prompt = `Analyze this business website content. Return ONLY valid JSON with no markdown formatting, no code blocks.

1. Niche: Pick the single most specific business niche from this list: ${Object.keys(NICHE_KEYWORDS).join(", ")}. Return "local_business" if none fit perfectly.
2. Pricing: Extract any pricing, fees, service costs mentioned. Return the raw text found. If no pricing found, return null.
3. Value Proposition: In one short sentence, what does this business do? Who do they serve?
4. Content Quality: "high" if well-written with original content, "medium" if decent but generic, "low" if thin/scraped.

Content:
${contentSample.substring(0, 8000)}

{"niche": "string", "pricing": "string or null", "valueProposition": "string", "quality": "high|medium|low"}`;

    const llmRes = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "You are a business analyst specializing in niche detection. Return ONLY valid JSON. No markdown. No code fences. No explanation." },
          { role: "user", content: prompt }
        ],
        stream: false,
        options: { temperature: 0.1 }
      }),
    });

    if (llmRes.ok) {
      const data = await llmRes.json();
      const rawContent = data.choices?.[0]?.message?.content || data.message?.content || "";
      const clean = rawContent.replace(/```json?/gi, "").replace(/```/g, "").trim();
      const result = JSON.parse(clean);
      niche = result.niche || "local_business";
      pricingInfo = result.pricing || null;
      valueProposition = result.valueProposition || "";
      contentQuality = result.quality || "low";
      llmUsed = true;
      console.info(`[preflight] LLM result: niche=${niche}, pricing=${pricingInfo ? "found" : "none"}, quality=${contentQuality}`);
    } else {
      const errText = await llmRes.text().catch(() => "");
      console.warn(`[preflight] Ollama API returned ${llmRes.status}: ${errText.substring(0, 200)}`);
    }
  } catch (e) {
    console.warn(`[preflight] LLM call failed:`, e instanceof Error ? e.message : e);
  }

  // -- Fallback: keyword detection if LLM didn't run --
  if (!llmUsed) {
    niche = detectNicheByKeywords(rawText);
    contentQuality = rawText.length > 3000 ? "medium" : "low";
  }

  // -- Stage 3: Score and revenue gap --
  let score = 0;
  if (hasLlmsTxt) score += 40;
  if (hasSchema) score += 30;
  if (contentQuality === "high") score += 30;
  else if (contentQuality === "medium") score += 15;
  if (rawText.length > 3000) score += 10;

  const economic = NICHE_ECONOMICS[niche] || NICHE_ECONOMICS.local_business;
  const revenueGap = calcRevenueGap(niche, score);

  console.info(`[preflight] Result: niche=${niche}, score=${score}, revGap=$${revenueGap.low}-$${revenueGap.high}/mo (llm=${llmUsed})`);

  return {
    niche,
    nicheLabel: economic.label,
    pricingInfo,
    valueProposition,
    contentQuality,
    hasLlmsTxt,
    hasSchema,
    aiReadinessScore: score,
    estimatedRevenueGap: revenueGap,
  };
}
