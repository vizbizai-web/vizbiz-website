/**
 * Dynamic Prompt Curator
 * 
 * Maps detected niches to high-intent, buyer-specific prompt sets
 * and calculates estimated revenue loss from visibility gaps.
 * This moves the report from "generic visibility" to "lost revenue analysis."
 */

export type PromptSet = {
  niche: string;
  label: string;
  prompts: string[];
  avgLeadValue: number;
  estimatedMonthlyVolume: number; // Base volume for a top-3 player in a mid-size city
};

const NICHE_STRATEGIES: Record<string, PromptSet> = {
  car_dealership: {
    niche: "car_dealership",
    label: "Car Dealership",
    avgLeadValue: 500,
    estimatedMonthlyVolume: 120,
    prompts: [
      "best {make} dealer in {city}",
      "best {make} dealership in {city}",
      "top rated {make} dealer {city}",
      "{make} dealer near me in {city}",
      "best place to buy a {make} in {city}",
      "{make} service center in {city}",
      "best {make} certified pre-owned in {city}",
      "best {make} lease deals in {city}",
      "where to get the best trade-in value for a {make} in {city}",
      "who has the most {make} inventory in {city}",
      "most trusted {make} dealer in {city}",
      "best car dealership for financing in {city}",
      "top luxury car dealers in {city}",
      "best place for {make} car service and repair in {city}",
      "who is the highest rated car dealer in {city}",
      "best used car dealership in {city} with good reviews",
      "dealerships in {city} with best customer service",
      "most reliable {make} dealer in {city}",
      "best place to buy a used {make} in {city}",
      "top rated dealerships for first-time car buyers in {city}"
    ]
  },
  fine_jewelry: {
    niche: "fine_jewelry",
    label: "Fine Jewelry Store",
    avgLeadValue: 1200,
    estimatedMonthlyVolume: 60,
    prompts: [
      "best jewelry store in {city}",
      "best place to buy an engagement ring in {city}",
      "top rated jewelers in {city}",
      "best lab grown diamond jewelry in {city}",
      "fine jewelry stores near me in {city}",
      "where to buy engagement rings in {city}",
      "best diamond jewelry in {city}",
      "custom jewelry design in {city}",
      "wedding band shops in {city}",
      "affordable fine jewelry in {city}",
      "luxury jewelry stores in {city}",
      "gold jewelry stores in {city}",
      "best jewelry for gifts in {city}",
      "jewelry stores with lab diamonds in {city}",
      "necklace and bracelet stores in {city}",
      "jewelry stores with good reviews in {city}",
      "best place for jewelry repair in {city}",
      "earring stores in {city}",
      "sustainable jewelry brands in {city}",
      "best bridal jewelry in {city}"
    ]
  },
  spray_tanning: {
    niche: "spray_tanning",
    label: "Spray Tanning Salon",
    avgLeadValue: 80,
    estimatedMonthlyVolume: 200,
    prompts: [
      "best spray tan in {city}",
      "spray tanning near me {city}",
      "top rated tanning salon in {city}",
      "best place for a spray tan in {city}",
      "bridal spray tan in {city}",
      "mobile spray tanning in {city}",
      "sunless tanning in {city}",
      "airbrush tan near me in {city}",
      "best tanning salon for wedding in {city}",
      "natural looking spray tan in {city}",
      "custom spray tan in {city}",
      "tanning salon open on weekends in {city}",
      "walk-in spray tan in {city}",
      "best tanning deals in {city}",
      "tanning salon with good reviews in {city}",
      "spray tan party in {city}",
      "group spray tanning in {city}",
      "spray tan before wedding in {city}",
      "best sunless tan in {city}",
      "tanning membership in {city}"
    ]
  },
  beauty_salon: {
    niche: "beauty_salon",
    label: "Beauty Salon / Hair Salon",
    avgLeadValue: 150,
    estimatedMonthlyVolume: 300,
    prompts: [
      "best hair salon in {city}",
      "top rated beauty salon in {city}",
      "hair salon with best reviews in {city}",
      "nail salon near me in {city}",
      "best place for a facial in {city}",
      "best hair colorist in {city}",
      "affordable salon in {city}",
      "salon open on weekends in {city}",
      "bridal hair and makeup in {city}",
      "best waxing salon in {city}",
      "lash extensions near me in {city}",
      "keratin treatment in {city}",
      "best blowout bar in {city}",
      "walk-in salon in {city}",
      "best mens haircut in {city}",
      "barbershop with best reviews in {city}",
      "day spa in {city}",
      "med spa in {city}",
      "full service salon in {city}",
      "salon with nail services in {city}"
    ]
  },
  venue_wedding: {
    niche: "venue_wedding",
    label: "Wedding Venue",
    avgLeadValue: 2500,
    estimatedMonthlyVolume: 40,
    prompts: [
      "best wedding venue in {city}",
      "top rated wedding venues in {city}",
      "affordable wedding venues in {city}",
      "wedding venues with outdoor space in {city}",
      "wedding venues for large weddings in {city}",
      "wedding venues for small weddings in {city}",
      "wedding venues with catering in {city}",
      "wedding venues with accommodation in {city}",
      "wedding venues with parking in {city}",
      "wedding venues with waterfront views in {city}",
      "wedding venues with garden views in {city}",
      "wedding venues with historic charm in {city}",
      "wedding venues with modern design in {city}",
      "wedding venues for winter weddings in {city}",
      "wedding venues for summer weddings in {city}",
      "wedding venues with good reviews in {city}",
      "wedding venues available on short notice in {city}",
      "wedding venues with good photography spots in {city}",
      "wedding venues with good acoustics in {city}",
      "luxury wedding venues in {city}"
    ]
  },
  dance_studio: {
    niche: "dance_studio",
    label: "Dance Studio",
    avgLeadValue: 200,
    estimatedMonthlyVolume: 100,
    prompts: [
      "best dance studio in {city}",
      "top rated dance studios in {city}",
      "dance studios for adults in {city}",
      "dance studios for kids in {city}",
      "dance studios for beginners in {city}",
      "dance studios for advanced dancers in {city}",
      "dance studios with ballet classes in {city}",
      "dance studios with salsa classes in {city}",
      "dance studios with hip hop classes in {city}",
      "dance studios with jazz classes in {city}",
      "dance studios with tap classes in {city}",
      "dance studios with contemporary classes in {city}",
      "dance studios with ballroom classes in {city}",
      "dance studios with competitive programs in {city}",
      "dance studios with performance opportunities in {city}",
      "dance studios with flexible schedules in {city}",
      "dance studios with experienced instructors in {city}",
      "dance studios with good reviews in {city}",
      "dance studios with trial classes in {city}",
      "dance school near me in {city}"
    ]
  },
  real_estate: {
    niche: "real_estate",
    label: "Real Estate Agency",
    avgLeadValue: 1000,
    estimatedMonthlyVolume: 150,
    prompts: [
      "best real estate agent in {city}",
      "top rated real estate agents in {city}",
      "real estate agents with good reviews in {city}",
      "real estate agents specializing in {neighborhood} {city}",
      "real estate agents for first time home buyers in {city}",
      "real estate agents for luxury homes in {city}",
      "real estate agents for investment properties in {city}",
      "real estate agents for commercial properties in {city}",
      "real estate agents for condos in {city}",
      "real estate agents for townhomes in {city}",
      "real estate agents for single family homes in {city}",
      "real estate agents with good negotiation skills in {city}",
      "real estate agents with good market knowledge in {city}",
      "real estate agents with good communication skills in {city}",
      "real estate agents with good availability in {city}",
      "real estate agents with good marketing strategies in {city}",
      "real estate agents with good pricing strategies in {city}",
      "real estate agents with good staging advice in {city}",
      "real estate agents with good network in {city}",
      "top real estate broker {city}"
    ]
  },
  local_business: {
    niche: "local_business",
    label: "Local Business",
    avgLeadValue: 200,
    estimatedMonthlyVolume: 80,
    prompts: [
      "best {businessName} in {city}",
      "top rated {businessName} in {city}",
      "{businessName} reviews in {city}",
      "{businessName} services in {city}",
      "{businessName} location in {city}",
      "{businessName} hours in {city}",
      "{businessName} contact in {city}",
      "{businessName} pricing in {city}",
      "{businessName} deals in {city}",
      "{businessName} specials in {city}",
      "{businessName} events in {city}",
      "{businessName} classes in {city}",
      "{businessName} workshops in {city}",
      "{businessName} appointments in {city}",
      "{businessName} reservations in {city}",
      "{businessName} bookings in {city}",
      "{businessName} availability in {city}",
      "{businessName} schedule in {city}",
      "{businessName} menu in {city}",
      "top rated local businesses in {city}"
    ]
  },
  mobile_bar: {
    niche: "mobile_bar",
    label: "Mobile Cocktail Bar",
    avgLeadValue: 350,
    estimatedMonthlyVolume: 60,
    prompts: [
      "best mobile cocktail bar in {city}",
      "top rated cocktail catering in {city}",
      "mobile bar service for events in {city}",
      "cocktail catering near me in {city}",
      "best pre-bottled cocktails in {city}",
      "cocktail bar hire in {city}",
      "wedding cocktail bar in {city}",
      "event bartending services in {city}",
      "mobile bar for weddings in {city}",
      "professional bartender hire in {city}",
      "best cocktail delivery service in {city}",
      "premium cocktail delivery in {city}",
      "craft cocktail catering near me {city}",
      "hen party cocktail bar in {city}",
      "corporate event bartending in {city}",
      "mixology service for parties in {city}",
      "bespoke cocktail menu {city}",
      "mocktail service for events in {city}",
      "cocktail masterclass in {city}",
      "pop up cocktail bar in {city}"
    ]
  },
  auto_transport: {
    niche: "auto_transport",
    label: "Auto Transport & Car Hauling",
    avgLeadValue: 500,
    estimatedMonthlyVolume: 120,
    prompts: [
      "best auto transport company in {city}",
      "car shipping companies in {city}",
      "best car hauling service in {city}",
      "vehicle transport near {city}",
      "how to ship a car from {city}",
      "{businessName} in {city}",
      "{businessName} reviews",
      "{businessName} car shipping",
      "auto transport companies with best reviews in {city}",
      "reliable car shipping in {city}",
      "affordable car transport in {city}",
      "enclosed car transport in {city}",
      "open car carrier in {city}",
      "car delivery service in {city}",
      "vehicle relocation service in {city}",
      "car shipping cost from {city}",
      "auto transport quotes in {city}",
      "best car movers in {city}",
      "door to door car shipping in {city}",
      "vehicle logistics companies in {city}"
    ]
  },
  tourism_experience: {
    niche: "tourism_experience",
    label: "Tourism Experience",
    avgLeadValue: 150,
    estimatedMonthlyVolume: 80,
    prompts: [
      "{businessName} in {city}",
      "{businessName} tours",
      "{businessName} reviews",
      "{businessName} experience",
      "best tours in {city}",
      "things to do in {city}",
      "unique experiences in {city}",
      "best day trips from {city}",
      "tourist attractions {city}",
      "best guided tours {city}",
      "outdoor activities {city}",
      "adventure tours {city}",
      "boat tours {city}",
      "water activities {city}",
      "nature tours near {city}",
      "family friendly tours {city}",
      "eco tourism {city}",
      "farm tours near {city}",
      "food and wine tours {city}",
      "top rated tours {city}"
    ]
  },
  artisan_workshop: {
    niche: "artisan_workshop",
    label: "Artisan Workshop & Studio",
    avgLeadValue: 165,
    estimatedMonthlyVolume: 90,
    prompts: [
      "jewelry making class {city}",
      "silversmith workshop {city}",
      "metalsmithing class near me",
      "ring making workshop {city}",
      "artisan jewelry workshop {city}",
      "best craft workshops in {city}",
      "jewelry classes for beginners {city}",
      "metalworking class {city}",
      "stone setting workshop {city}",
      "hands on jewelry making {city}",
      "creative workshops {city}",
      "art classes {city}",
      "diy jewelry workshop near me",
      "silversmithing for beginners {city}",
      "jewelry studio {city}",
      "date night workshop {city}",
      "girls night out workshop {city}",
      "sip and craft {city}",
      "sip and silversmith {city}",
      "unique things to do in {city}",
      "best workshops in {city}",
      "jewelry making experience {city}",
      "local artisan classes {city}",
      "gift workshop {city}",
      "team building workshop {city}"
    ]
  }
};

export function getPromptSetForNiche(niche: string): PromptSet {
  if (NICHE_STRATEGIES[niche]) return NICHE_STRATEGIES[niche];
  
  // Unknown niche — generate dynamic strategy from the niche name
  // so we NEVER fall back to generic local_business when we know the real niche
  const label = niche.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    niche,
    label,
    prompts: [
      `best {label} in {city}`,
      `top rated {label} in {city}`,
      `{label} near me in {city}`,
      `{label} with good reviews in {city}`,
      `best place for {label} in {city}`,
      `affordable {label} in {city}`,
      `{label} services in {city}`,
      `{label} recommendations in {city}`,
      `where to find {label} in {city}`,
      `{label} open on weekends in {city}`,
      `professional {label} in {city}`,
      `{label} for beginners in {city}`,
      `trusted {label} in {city}`,
      `{label} deals in {city}`,
      `{label} pricing in {city}`,
      `{label} appointments in {city}`,
      `{label} walk-in in {city}`,
      `{label} for families in {city}`,
      `{label} consultation in {city}`,
      `{label} booking in {city}`,
    ].map(p => p.replace(/\{label\}/g, label).replace(/\{city\}/g, '{city}')),
    avgLeadValue: 150,
    estimatedMonthlyVolume: 60,
  };
}

export function calculateRevenueLoss(
  appearedCount: number, 
  totalPrompts: number, 
  niche: string
): { loss: number; leadsLost: number; recoveryPotential: string } {
  const strategy = getPromptSetForNiche(niche);
  const visibilityGap = 1 - (appearedCount / Math.max(totalPrompts, 1));
  const monthlyLeadsLost = Math.round(strategy.estimatedMonthlyVolume * visibilityGap);
  const monthlyRevenueLoss = Math.round(monthlyLeadsLost * strategy.avgLeadValue);
  
  return {
    loss: monthlyRevenueLoss,
    leadsLost: monthlyLeadsLost,
    recoveryPotential: `By closing the visibility gap, you could recover roughly $${monthlyRevenueLoss.toLocaleString()} in monthly revenue.`
  };
}
