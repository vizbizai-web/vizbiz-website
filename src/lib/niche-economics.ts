/**
 * Niche Economics — Single Source of Truth
 *
 * ALL revenue calculations across the pipeline use this file.
 * No other module should define its own avgLeadValue or monthlyVolume.
 *
 * Used by:
 *   - preflight-engine.ts (calcRevenueGap)
 *   - prompt-curator.ts (calculateRevenueLoss)
 *   - report-content.tsx (display brackets)
 *   - competitor-discovery.ts (validation context)
 */

export type NicheEconomics = {
  label: string;
  avgLeadValue: number;
  monthlyVolume: number;
  currency: string;
  /** Hard ceiling for monthly revenue gap — prevents scrape errors from producing absurd numbers */
  maxMonthlyGap: number;
};

export const NICHE_ECONOMICS: Record<string, NicheEconomics> = {
  car_dealership: { label: "Car Dealership", avgLeadValue: 500, monthlyVolume: 150, currency: "USD", maxMonthlyGap: 150000 },
  endermologie_clinic: { label: "Endermologie / Body Contouring Clinic", avgLeadValue: 180, monthlyVolume: 120, currency: "AUD", maxMonthlyGap: 40000 },
  fine_jewelry: { label: "Fine Jewelry", avgLeadValue: 1000, monthlyVolume: 50, currency: "USD", maxMonthlyGap: 80000 },
  spray_tanning: { label: "Spray Tanning", avgLeadValue: 80, monthlyVolume: 150, currency: "USD", maxMonthlyGap: 15000 },
  beauty_salon: { label: "Beauty Salon", avgLeadValue: 120, monthlyVolume: 200, currency: "USD", maxMonthlyGap: 30000 },
  venue_wedding: { label: "Wedding Venue", avgLeadValue: 2000, monthlyVolume: 30, currency: "USD", maxMonthlyGap: 100000 },
  dance_studio: { label: "Dance Studio", avgLeadValue: 150, monthlyVolume: 80, currency: "USD", maxMonthlyGap: 20000 },
  real_estate: { label: "Real Estate", avgLeadValue: 3000, monthlyVolume: 20, currency: "USD", maxMonthlyGap: 200000 },
  mobile_bar: { label: "Mobile Cocktail Bar", avgLeadValue: 350, monthlyVolume: 60, currency: "USD", maxMonthlyGap: 40000 },
  auto_transport: { label: "Auto Transport & Car Hauling", avgLeadValue: 500, monthlyVolume: 100, currency: "USD", maxMonthlyGap: 80000 },
  restaurant: { label: "Restaurant", avgLeadValue: 50, monthlyVolume: 400, currency: "USD", maxMonthlyGap: 50000 },
  photography: { label: "Photography", avgLeadValue: 250, monthlyVolume: 40, currency: "USD", maxMonthlyGap: 20000 },
  cleaning_service: { label: "Cleaning Service", avgLeadValue: 150, monthlyVolume: 80, currency: "USD", maxMonthlyGap: 30000 },
  barbershop: { label: "Barbershop", avgLeadValue: 40, monthlyVolume: 200, currency: "USD", maxMonthlyGap: 10000 },
  fitness_gym: { label: "Fitness / Gym", avgLeadValue: 100, monthlyVolume: 120, currency: "USD", maxMonthlyGap: 25000 },
  med_spa: { label: "Med Spa", avgLeadValue: 400, monthlyVolume: 60, currency: "USD", maxMonthlyGap: 50000 },
  nail_salon: { label: "Nail Salon", avgLeadValue: 60, monthlyVolume: 150, currency: "USD", maxMonthlyGap: 15000 },
  tutoring: { label: "Tutoring", avgLeadValue: 100, monthlyVolume: 60, currency: "USD", maxMonthlyGap: 15000 },
  pet_services: { label: "Pet Services", avgLeadValue: 80, monthlyVolume: 80, currency: "USD", maxMonthlyGap: 12000 },
  landscaping: { label: "Landscaping", avgLeadValue: 500, monthlyVolume: 30, currency: "USD", maxMonthlyGap: 30000 },
  it_services: { label: "IT Services", avgLeadValue: 500, monthlyVolume: 30, currency: "USD", maxMonthlyGap: 50000 },
  marketing_agency: { label: "Marketing Agency", avgLeadValue: 1000, monthlyVolume: 20, currency: "USD", maxMonthlyGap: 50000 },
  plant_shop: { label: "Plant Shop & Plant Care", avgLeadValue: 120, monthlyVolume: 80, currency: "USD", maxMonthlyGap: 15000 },
  tourism_experience: { label: "Tourism Experience", avgLeadValue: 150, monthlyVolume: 80, currency: "USD", maxMonthlyGap: 25000 },
  artisan_workshop: { label: "Artisan Workshop & Studio", avgLeadValue: 200, monthlyVolume: 40, currency: "USD", maxMonthlyGap: 20000 },
  // Fallbacks
  local_business: { label: "Local Business", avgLeadValue: 200, monthlyVolume: 60, currency: "USD", maxMonthlyGap: 50000 },
  unknown: { label: "Unknown", avgLeadValue: 200, monthlyVolume: 40, currency: "USD", maxMonthlyGap: 50000 },
};

/**
 * Get economics for a niche, with fallback to local_business.
 */
export function getNicheEconomics(niche: string): NicheEconomics {
  return NICHE_ECONOMICS[niche] || NICHE_ECONOMICS.local_business;
}

/**
 * Calculate revenue gap from AI readiness score.
 * Uses scraped pricing when available to override niche defaults.
 */
export function calcRevenueGap(
  niche: string,
  score: number,
  scrapedPricing: string | null = null
): { low: number; high: number; currency: string } {
  const eco = getNicheEconomics(niche);
  const visibilityGap = 1 - (score / 100);

  // Try to extract real pricing from scraped data
  let avgLeadValue = eco.avgLeadValue;

  if (scrapedPricing) {
    const priceMatches = scrapedPricing.match(
      /[$€£]\s*[\d,]+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|usd|gbp|eur|cad|per\s+(?:month|session|visit|hour|night|week|class))/gi
    );
    if (priceMatches && priceMatches.length > 0) {
      const prices = priceMatches
        .map(p => parseFloat(p.replace(/[^\d.]/g, "")))
        .filter(p => p > 0 && p < 100000);
      if (prices.length > 0) {
        const scrapedAvg = prices.reduce((a, b) => a + b, 0) / prices.length;
        if (scrapedAvg > 10) {
          avgLeadValue = scrapedAvg;
          console.info(
            `[niche-economics] Revenue gap adjusted with scraped pricing: $${Math.round(scrapedAvg)} avg (${prices.length} prices found, niche default: $${eco.avgLeadValue})`
          );
        }
      }
    } else if (scrapedPricing) {
      console.info(
        `[niche-economics] Could not parse pricing from "${scrapedPricing.substring(0, 50)}", using niche default $${eco.avgLeadValue}`
      );
    }
  }

  const low = Math.round(eco.monthlyVolume * visibilityGap * avgLeadValue * 0.5);
  const high = Math.round(eco.monthlyVolume * visibilityGap * avgLeadValue * 1.5);

  // Clamp to hard ceiling — prevents scrape errors from producing absurd revenue gaps
  const maxGap = eco.maxMonthlyGap || 50000;
  const clampedHigh = Math.min(high, maxGap);
  const clampedLow = Math.min(low, maxGap);

  return { low: Math.max(clampedLow, 0), high: Math.max(clampedHigh, 0), currency: eco.currency };
}

/**
 * Calculate monthly revenue loss from research results.
 * Also accepts scraped pricing for accuracy.
 */
export function calculateRevenueLoss(
  appearedCount: number,
  totalPrompts: number,
  niche: string,
  scrapedPricing: string | null = null
): { loss: number; leadsLost: number; recoveryPotential: string; currency: string } {
  const eco = getNicheEconomics(niche);
  const visibilityGap = 1 - (appearedCount / Math.max(totalPrompts, 1));

  let avgLeadValue = eco.avgLeadValue;

  // Try scraped pricing override
  if (scrapedPricing) {
    const priceMatches = scrapedPricing.match(
      /[$€£]\s*[\d,]+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|usd|gbp|eur|cad|per\s+(?:month|session|visit|hour|night|week|class))/gi
    );
    if (priceMatches && priceMatches.length > 0) {
      const prices = priceMatches
        .map(p => parseFloat(p.replace(/[^\d.]/g, "")))
        .filter(p => p > 0 && p < 100000);
      if (prices.length > 0) {
        const scrapedAvg = prices.reduce((a, b) => a + b, 0) / prices.length;
        if (scrapedAvg > 10) avgLeadValue = scrapedAvg;
      }
    }
  }

  const leadsLost = Math.round(eco.monthlyVolume * visibilityGap);
  const loss = Math.round(leadsLost * avgLeadValue);

  // Clamp to hard ceiling
  const maxGap = eco.maxMonthlyGap || 50000;
  const clampedLoss = Math.min(loss, maxGap);

  return {
    loss: clampedLoss,
    leadsLost,
    currency: eco.currency,
    recoveryPotential: `By closing the visibility gap, you could recover roughly $${clampedLoss.toLocaleString()} in monthly revenue.`,
  };
}
