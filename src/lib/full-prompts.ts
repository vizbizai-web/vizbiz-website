/**
 * Full Prompt Generator — 84 buyer-intent queries across 11 categories
 * 
 * Category structure from the original research engine, adapted for any niche.
 * Free tier: first 20 prompts (categories 1-2)
 * Paid tier: full 84 prompts across all 11 categories
 */

export interface PromptDef {
  id: string;
  category: number;
  categoryName: string;
  text: string;
}

export const CATEGORIES: Record<number, string> = {
  1: 'General Discovery',
  2: 'Service / Product Specific',
  3: 'Service & After-Sales',
  4: 'Location & Regional',
  5: 'Competitor Comparison',
  6: 'Voice / Casual Search',
  7: 'Review & Reputation Signals',
  8: 'Negative / Objection Handling',
  9: 'Inventory & Availability',
  10: 'Digital Experience',
  11: 'Cross-Competitor Visibility',
};

// Niche-specific template generators
// Each returns 84 prompts with proper placeholders replaced

interface NicheConfig {
  businessName: string;
  city: string;
  region: string;
  services: string[];       // e.g., ["oyster farm tours", "pearl grading", "oyster tasting"]
  productType: string;      // e.g., "tour", "experience", "service"
  competitor1: string;
  competitor2: string;
  competitor3: string;
  keywords: string[];       // e.g., ["oyster", "pearl", "farm", "tour", "cruise"]
}

function generatePrompts(config: NicheConfig): PromptDef[] {
  const { businessName, city, region, services, productType, competitor1, competitor2, competitor3, keywords } = config;
  const shortName = businessName.split(' ').slice(0, 3).join(' ');
  const mainService = services[0] || productType;
  const prompts: PromptDef[] = [];

  // CATEGORY 1: GENERAL DISCOVERY (10)
  const cat1 = [
    `What is the best ${mainService} in ${city}?`,
    `Can you recommend a good ${productType} in ${city}?`,
    `I'm looking for ${mainService} in ${city}. Where should I go?`,
    `What are the top 5 ${mainService} providers in ${city}?`,
    `Find me a good ${productType} near ${city}.`,
    `Which ${mainService} in ${region} have the best reviews and reputation?`,
    `Which ${productType} in ${city} has the best prices and deals right now?`,
    `I need to book ${mainService} this week in ${city}. Who can I trust for a good experience?`,
    `How do I choose a good ${productType} in ${city}?`,
    `My friend is looking for ${mainService} in ${city}. Can you recommend a reputable place?`,
  ];
  cat1.forEach((text, i) => prompts.push({ id: `1.${i + 1}`, category: 1, categoryName: CATEGORIES[1], text }));

  // CATEGORY 2: SERVICE / PRODUCT SPECIFIC (12)
  const cat2 = [];
  for (let s = 0; s < services.length && cat2.length < 12; s++) {
    cat2.push(`Where is the best place for ${services[s]} in ${city}?`);
  }
  // Fill remaining with keyword-based queries
  const fillers2 = [
    `Who offers the best ${keywords[0] || productType} experience in ${city}?`,
    `I'm looking for ${keywords.join(' or ')} in ${city}. Any recommendations?`,
    `Which ${productType} provider in ${city} has the best selection of options?`,
    `Where can I find the highest quality ${keywords[0] || productType} in ${region}?`,
    `What's the most popular ${productType} in ${city}?`,
    `Which ${mainService} in ${city} is best for families?`,
    `Where can I find affordable ${productType} in ${city}?`,
    `Which ${productType} provider in ${city} is best for beginners?`,
    `I want a premium ${keywords[0] || productType} experience in ${city}. Where should I go?`,
    `Who specializes in ${services[1] || mainService} in ${city}?`,
    `Which ${productType} in ${city} offers the best value for money?`,
  ];
  while (cat2.length < 12) cat2.push(fillers2.shift() || `Best ${productType} in ${city}?`);
  cat2.slice(0, 12).forEach((text, i) => prompts.push({ id: `2.${i + 1}`, category: 2, categoryName: CATEGORIES[2], text }));

  // CATEGORY 3: SERVICE & AFTER-SALES (10)
  const cat3 = [
    `Does ${businessName} in ${city} offer good customer support after booking?`,
    `Which ${productType} in ${city} has the best cancellation policy?`,
    `What happens if I'm not happy with my ${mainService} experience in ${city}? Do they offer refunds?`,
    `Which ${productType} provider in ${city} is most responsive to questions and concerns?`,
    `Does ${businessName} in ${city} offer any guarantees or warranties on their ${productType}?`,
    `Which ${mainService} in ${city} has the best follow-up service?`,
    `Where can I get support for ${services[0] || productType} in ${city} if something goes wrong?`,
    `Which ${productType} in ${city} offers the most flexible booking options?`,
    `Does ${businessName} in ${city} have good accessibility options for people with disabilities?`,
    `Which ${mainService} in ${city} is best for last-minute bookings?`,
  ];
  cat3.forEach((text, i) => prompts.push({ id: `3.${i + 1}`, category: 3, categoryName: CATEGORIES[3], text }));

  // CATEGORY 4: LOCATION & REGIONAL (8)
  const cat4 = [
    `Best ${productType} near ${city}?`,
    `What ${mainService} options are there in ${region}?`,
    `Is ${businessName} in ${city} worth visiting? How far is it from the city center?`,
    `Which ${productType} in ${region} is closest to tourist attractions?`,
    `What's the best ${productType} within driving distance of ${city}?`,
    `Are there any good ${mainService} providers near ${city} that locals recommend?`,
    `Which ${productType} in ${region} is best for a day trip?`,
    `What's the most convenient ${mainService} to get to from ${city}?`,
  ];
  cat4.forEach((text, i) => prompts.push({ id: `4.${i + 1}`, category: 4, categoryName: CATEGORIES[4], text }));

  // CATEGORY 5: COMPETITOR COMPARISON (6)
  const cat5 = [
    `Which is better in ${city}: ${businessName} or ${competitor1}?`,
    `Compare ${businessName}, ${competitor1}, and ${competitor2} for ${mainService} in ${region}. Which should I choose?`,
    `Which ${productType} in ${city} has the best reputation: ${businessName}, ${competitor1}, or ${competitor2}?`,
    `For ${services[0] || mainService} in ${city}, who is better: ${businessName} or ${competitor1}?`,
    `Tell me about ${businessName}. Are they a good ${productType} in ${city}? What do customers say?`,
    `Tell me about ${competitor1}. Are they a good ${productType} in ${city}? What do customers say?`,
  ];
  cat5.forEach((text, i) => prompts.push({ id: `5.${i + 1}`, category: 5, categoryName: CATEGORIES[5], text }));

  // CATEGORY 6: VOICE / CASUAL SEARCH (6)
  const cat6 = [
    `Hey, I need a ${productType}. ${city}. Who's good?`,
    `Looking for ${mainService} in ${city} fast. Where should I go?`,
    `What should I look for in a good ${productType} in ${city}?`,
    `Know any good ${keywords[0] || productType} places in ${city}? Looking for somewhere trustworthy.`,
    `You mentioned ${competitor1} for ${productType} in ${city}. Are there any others I should consider? What about ${businessName}?`,
    `What's the process for booking ${mainService} in ${city}? Can you recommend someone?`,
  ];
  cat6.forEach((text, i) => prompts.push({ id: `6.${i + 1}`, category: 6, categoryName: CATEGORIES[6], text }));

  // CATEGORY 7: REVIEW & REPUTATION SIGNALS (5)
  const cat7 = [
    `Which ${productType} in ${city} has the most 5-star reviews?`,
    `Which ${mainService} providers in ${region} have won awards or been recognized as the best?`,
    `Which ${productType} in ${city} has been around the longest? I want somewhere established.`,
    `Which ${mainService} in ${region} is the most popular? Who are the top performers?`,
    `Is there a ${productType} in ${city} that's particularly known for exceptional service?`,
  ];
  cat7.forEach((text, i) => prompts.push({ id: `7.${i + 1}`, category: 7, categoryName: CATEGORIES[7], text }));

  // CATEGORY 8: NEGATIVE / OBJECTION (5)
  const cat8 = [
    `Are there any complaints or bad reviews about ${businessName} in ${city}?`,
    `Is ${businessName} legitimate? Should I be worried about booking with them?`,
    `I've heard mixed things about ${businessName}. Who else offers ${mainService} in ${city}?`,
    `Does ${businessName} overcharge? Are there cheaper ${productType} options in ${city}?`,
    `Should I go with ${businessName} or a smaller ${productType} provider in ${city}?`,
  ];
  cat8.forEach((text, i) => prompts.push({ id: `8.${i + 1}`, category: 8, categoryName: CATEGORIES[8], text }));

  // CATEGORY 9: INVENTORY & AVAILABILITY (6)
  const cat9 = [
    `Does ${businessName} in ${city} have availability this weekend?`,
    `I'm looking for ${services[0] || mainService} in ${city} this month. Who has openings?`,
    `Which ${productType} in ${city} can accommodate a group of 6+ people?`,
    `Does ${businessName} in ${city} offer ${services[1] || 'private experiences'}?`,
    `Which ${mainService} in ${city} has the most flexible scheduling?`,
    `I want to book ${productType} in ${city} this weekend. Who is most likely to have availability?`,
  ];
  cat9.forEach((text, i) => prompts.push({ id: `9.${i + 1}`, category: 9, categoryName: CATEGORIES[9], text }));

  // CATEGORY 10: DIGITAL EXPERIENCE (4)
  const cat10 = [
    `Can I book ${productType} online in ${city}? Which providers offer online booking?`,
    `Which ${mainService} in ${city} has the best website with good photos and descriptions?`,
    `Which ${productType} in ${city} lets me get a quote or pricing online before visiting?`,
    `Which ${mainService} in ${city} is easiest to contact? I want to text or email, not call.`,
  ];
  cat10.forEach((text, i) => prompts.push({ id: `10.${i + 1}`, category: 10, categoryName: CATEGORIES[10], text }));

  // CATEGORY 11: CROSS-COMPETITOR VISIBILITY (12)
  const cat11 = [
    `What's the best ${productType} in ${city} overall?`,
    `I'm deciding between ${businessName} and ${competitor1}. Which should I choose in ${city}?`,
    `${businessName} vs ${competitor1} vs ${competitor2} — which is the best ${mainService} near ${city}?`,
    `Which ${productType} in ${city} has the best deals right now, regardless of who?`,
    `I want the best ${keywords[0] || productType} experience in ${city}. Should I go to ${businessName}, ${competitor1}, or ${competitor2}?`,
    `What's the most reliable ${productType} I can book in ${city}? Which provider is the best?`,
    `I have a budget of $200 for ${mainService} in ${city}. Which provider gives the best value?`,
    `Which ${productType} in ${city} has the best overall experience? I want something memorable.`,
    `Where can I find the best rated ${mainService} in ${city}? I'm open to any provider.`,
    `I'm new to ${city} and want to try ${productType}. Which provider is best for first-timers?`,
    `Which ${productType} in ${city} offers the most unique experience?`,
    `Between ${businessName}, ${competitor1}, ${competitor2}, and ${competitor3} — which has the best overall reputation?`,
  ];
  cat11.forEach((text, i) => prompts.push({ id: `11.${i + 1}`, category: 11, categoryName: CATEGORIES[11], text }));

  return prompts;
}

/**
 * Build niche config from research data
 */
function buildNicheConfig(data: {
  businessName: string;
  city: string;
  niche: string;
  competitorMention?: string;
  websiteInsight?: any;
}): NicheConfig {
  const { businessName, city, niche, competitorMention, websiteInsight } = data;
  
  // Derive region from city (take the broader area)
  const region = city.includes(',') ? city.split(',').slice(1).join(',').trim() : city;
  
  // Niche-specific defaults
  const nicheDefaults: Record<string, Partial<NicheConfig>> = {
    car_dealership: {
      productType: 'car dealership',
      services: ['new car sales', 'used car sales', 'car service', 'car financing', 'trade-in appraisal'],
      keywords: ['car', 'dealership', 'auto', 'vehicle'],
    },
    tourism_experience: {
      productType: 'tour experience',
      services: ['guided tours', 'oyster tastings', 'pearl grading', 'farm tours', 'river cruises'],
      keywords: ['tour', 'experience', 'oyster', 'pearl', 'farm'],
    },
    auto_transport: {
      productType: 'auto transport service',
      services: ['vehicle shipping', 'car transport', 'enclosed transport', 'open transport', 'door-to-door delivery'],
      keywords: ['transport', 'shipping', 'auto', 'vehicle', 'delivery'],
    },
    fine_jewelry: {
      productType: 'jewelry store',
      services: ['engagement rings', 'custom jewelry', 'diamond jewelry', 'jewelry repair', 'gold jewelry'],
      keywords: ['jewelry', 'diamond', 'ring', 'gold'],
    },
    dance_studio: {
      productType: 'dance studio',
      services: ['dance classes', 'ballet', 'salsa', 'hip hop', 'wedding dance'],
      keywords: ['dance', 'class', 'studio', 'lesson'],
    },
    beauty_salon: {
      productType: 'beauty salon',
      services: ['hair styling', 'nail services', 'facials', 'waxing', 'lash extensions'],
      keywords: ['beauty', 'salon', 'hair', 'nail'],
    },
    spray_tanning: {
      productType: 'spray tan service',
      services: ['spray tanning', 'mobile tanning', 'sunless tanning', 'bridal tanning'],
      keywords: ['tan', 'tanning', 'spray', 'bronze'],
    },
    real_estate: {
      productType: 'real estate agent',
      services: ['home buying', 'home selling', 'property listings', 'market analysis', 'first-time buyer assistance'],
      keywords: ['real estate', 'home', 'property', 'agent'],
    },
    mobile_bar: {
      productType: 'mobile bar service',
      services: ['cocktail bar hire', 'wedding bar', 'event bartending', 'mixology classes'],
      keywords: ['bar', 'cocktail', 'bartender', 'event'],
    },
    local_business: {
      productType: 'local business',
      services: ['general services', 'consultations', 'bookings'],
      keywords: ['business', 'service', 'local'],
    },
  };

  const defaults = nicheDefaults[niche] || nicheDefaults.local_business;
  
  // Use website insights if available
  const webServices = websiteInsight?.services?.length > 0 ? websiteInsight.services : defaults.services || ['general services'];
  
  return {
    businessName,
    city,
    region,
    services: webServices,
    productType: defaults.productType || 'local business',
    competitor1: competitorMention?.split(',')[0]?.trim() || 'Competitor 1',
    competitor2: competitorMention?.split(',')[1]?.trim() || 'Competitor 2',
    competitor3: competitorMention?.split(',')[2]?.trim() || 'Competitor 3',
    keywords: defaults.keywords || ['business', 'service'],
  };
}

/**
 * Get prompts for a lead
 * @param data - Research data about the business
 * @param tier - 'free' for 20 prompts, 'paid' for 84
 */
export function getPrompts(data: {
  businessName: string;
  city: string;
  niche: string;
  competitorMention?: string;
  websiteInsight?: any;
}, tier: 'free' | 'paid' = 'free'): PromptDef[] {
  const config = buildNicheConfig(data);
  const allPrompts = generatePrompts(config);
  
  if (tier === 'free') {
    return allPrompts.slice(0, 20); // First 20 = categories 1-2
  }
  
  return allPrompts; // All 84
}

/**
 * Get category summary for report display
 */
export function getCategorySummary(): { id: number; name: string; promptCount: number }[] {
  return [
    { id: 1, name: 'General Discovery', promptCount: 10 },
    { id: 2, name: 'Service / Product Specific', promptCount: 12 },
    { id: 3, name: 'Service & After-Sales', promptCount: 10 },
    { id: 4, name: 'Location & Regional', promptCount: 8 },
    { id: 5, name: 'Competitor Comparison', promptCount: 6 },
    { id: 6, name: 'Voice / Casual Search', promptCount: 6 },
    { id: 7, name: 'Review & Reputation', promptCount: 5 },
    { id: 8, name: 'Negative / Objection', promptCount: 5 },
    { id: 9, name: 'Inventory & Availability', promptCount: 6 },
    { id: 10, name: 'Digital Experience', promptCount: 4 },
    { id: 11, name: 'Cross-Competitor', promptCount: 12 },
  ];
}
