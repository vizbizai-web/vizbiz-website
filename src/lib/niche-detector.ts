/**
 * Niche Detection Module
 * 
 * Detects business type from name and website to determine appropriate
 * research prompts and competitor discovery strategies.
 */

type NicheConfig = {
  niche: string;
  keywords: string[];
  promptTemplates: string[];
  competitorSearchQueries: string[];
};

const NICHES: NicheConfig[] = [
  {
    niche: "car_dealership",
    keywords: [
      "dealer", "motors", "auto", "automotive", "car", "cars",
      "honda", "toyota", "kia", "ford", "chevrolet", "chevy",
      "bmw", "mercedes", "audi", "lexus", "nissan", "hyundai",
      "subaru", "mazda", "volkswagen", "volvo", "porsche", "tesla",
      "jeep", "ram", "gmc", "cadillac", "buick", "chrysler", "dodge",
      "infiniti", "acura", "lincoln", "jaguar", "land rover", "mini",
      "mitsubishi", "fiat", "alfa romeo", "maserati", "ferrari"
    ],
    promptTemplates: [
      "best {make} dealer in {city}",
      "best {make} dealership in {city}",
      "top rated {make} dealer {city}",
      "{make} dealer near me in {city}",
      "best place to buy a {make} in {city}",
      "{make} service center in {city}",
      "{make} inventory in {city}",
      "{make} financing in {city}",
      "{make} lease deals in {city}",
      "{make} certified pre-owned in {city}",
      "best used car dealership in {city}",
      "best place for car service in {city}",
      "car dealerships with best reviews in {city}",
      "luxury car dealers in {city}",
      "affordable car dealers in {city}",
      "car dealers open on weekends in {city}",
      "car dealers with test drives in {city}",
      "car dealers with financing options in {city}",
      "car dealers with trade-in programs in {city}",
      "best car buying experience in {city}"
    ],
    competitorSearchQueries: [
      "{niche} in {city}",
      "best {niche} {city}",
      "top rated {niche} {city}",
      "{niche} near me {city}",
      "best {niche} deals {city}"
    ]
  },
  {
    niche: "spray_tanning",
    keywords: [
      "spray tan", "sunless", "tanning", "tan", "glow", "bronze",
      "mobile tan", "bridal tan", "airbrush tan", "custom tan",
      "tanning salon", "tanning studio", "fake tan", "self tan"
    ],
    promptTemplates: [
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
    ],
    competitorSearchQueries: [
      "spray tan salons in {city}",
      "best tanning salons {city}",
      "sunless tanning {city}",
      "tanning salons near me {city}",
      "mobile spray tan {city}"
    ]
  },
  {
    niche: "beauty_salon",
    keywords: [
      "salon", "spa", "beauty", "nail", "hair", "barber",
      "cosmetology", "esthetician", "lashes", "brows",
      "waxing", "facial", "makeup", "bridal beauty",
      "keratin", "blowout", "colorist", "stylist", "beautician"
    ],
    promptTemplates: [
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
    ],
    competitorSearchQueries: [
      "best beauty salons in {city}",
      "top rated salons {city}",
      "hair salons near me {city}",
      "nail salons {city}",
      "day spas {city}"
    ]
  },
  {
    niche: "venue_wedding",
    keywords: [
      "venue", "wedding", "event", "celebration", "banquet", "hall",
      "reception", "ceremony", "ballroom", "garden", "estate", "manor",
      "country club", "winery", "brewery", "rooftop", "loft", "museum"
    ],
    promptTemplates: [
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
      "wedding venues with good acoustics in {city}"
    ],
    competitorSearchQueries: [
      "wedding venues in {city}",
      "best wedding venues {city}",
      "top rated wedding venues {city}",
      "affordable wedding venues {city}",
      "wedding venues near me {city}"
    ]
  },
  {
    niche: "dance_studio",
    keywords: [
      "dance", "studio", "ballet", "salsa", "ballroom", "hip hop",
      "jazz", "tap", "contemporary", "dancing", "dance school",
      "dance academy", "dance lessons", "dance classes", "dance company"
    ],
    promptTemplates: [
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
      "dance studios with trial classes in {city}"
    ],
    competitorSearchQueries: [
      "dance studios in {city}",
      "best dance studios {city}",
      "top rated dance studios {city}",
      "dance studios near me {city}",
      "dance classes {city}"
    ]
  },
  {
    niche: "real_estate",
    keywords: [
      "realty", "real estate", "property", "homes", "realtor",
      "real estate agent", "real estate broker", "real estate company",
      "home sales", "property sales", "real estate services",
      "real estate agency", "real estate office", "real estate team"
    ],
    promptTemplates: [
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
      "real estate agents with good network in {city}"
    ],
    competitorSearchQueries: [
      "real estate agents in {city}",
      "best real estate agents {city}",
      "top rated real estate agents {city}",
      "real estate agents near me {city}",
      "real estate agencies {city}"
    ]
  },
  {
    niche: "tourism_experience",
    keywords: [
      "pearl farm", "oyster farm", "aquaculture", "farm tour", "winery tour",
      "brewery tour", "distillery", "eco tour", "wildlife tour", "boat tour",
      "cruise", "kayak tour", "snorkel", "dive tour", "surf school",
      "horse riding", "adventure tour", "guided tour", "experience",
      "scenic cruise", "farm experience", "cellar door", "vineyard",
      "orchard", "truffle farm", "cheese farm", "cooking class",
      "food tour", "wine tasting", "whale watching", "safari",
      "zip line", "hot air balloon", "helicopter tour", "seaplane",
      "day trip", "day tour", "tourist attraction", "tourism",
      "nature tour", "cultural experience", "indigenous tour",
      "outdoor experience", "water activity", "river cruise"
    ],
    promptTemplates: [
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
    ],
    competitorSearchQueries: [
      "best tours in {city}",
      "things to do in {city}",
      "tourist attractions near {city}",
      "day trips from {city}",
      "unique experiences near {city}"
    ]
  },
  {
    niche: "restaurant",
    keywords: [
      "restaurant", "bistro", "cafe", "dining", "eatery", "brasserie",
      "trattoria", "steakhouse", "bar and grill", "pub", "tavern",
      "diner", "canteen", "brunch", "lunch", "dinner menu",
      "takeaway", "takeout", "delivery", "catering"
    ],
    promptTemplates: [
      "best restaurant in {city}",
      "top rated restaurants in {city}",
      "best place to eat in {city}",
      "restaurants with good reviews in {city}",
      "fine dining in {city}",
      "best dinner spots in {city}",
      "romantic restaurants in {city}",
      "family restaurants in {city}",
      "restaurants open late in {city}",
      "best brunch in {city}",
      "outdoor dining in {city}",
      "best lunch spots in {city}",
      "waterfront restaurants in {city}",
      "new restaurants in {city}",
      "best places for dinner in {city}",
      "restaurants with a view in {city}",
      "best takeaway in {city}",
      "food delivery {city}",
      "best burgers in {city}",
      "best pizza in {city}"
    ],
    competitorSearchQueries: [
      "best restaurants in {city}",
      "top rated restaurants {city}",
      "fine dining {city}",
      "places to eat {city}",
      "restaurant reviews {city}"
    ]
  },
  {
    niche: "auto_transport",
    keywords: [
      "auto transport", "car shipping", "car hauling", "vehicle transport",
      "vehicle shipping", "auto shipping", "car carrier", "car transport",
      "vehicle logistics", "car delivery", "auto logistics", "car mover",
      "vehicle mover", "car relocation", "vehicle relocation",
      "transport group", "logistics group", "enclosed carrier",
      "open carrier", "car carrier service", "vehicle shipping company",
      "auto transport company", "car transport service",
      "ship my car", "move my car", "transport my car",
      "car hauling company", "vehicle hauling"
    ],
    promptTemplates: [
      "best auto transport company in {city}",
      "car shipping companies in {city}",
      "best car hauling service in {city}",
      "vehicle transport near {city}",
      "how to ship a car from {city}",
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
      "car transport for dealerships in {city}",
      "cross country car shipping from {city}",
      "car carrier service near me in {city}",
      "vehicle logistics companies in {city}"
    ],
    competitorSearchQueries: [
      "auto transport companies in {city}",
      "car shipping companies {city}",
      "best car hauling {city}",
      "vehicle transport services {city}",
      "car transport near me {city}"
    ]
  },
  {
    niche: "fine_jewelry",
    keywords: [
      "jewelry", "jeweller", "jeweler", "jewellery", "diamond",
      "engagement ring", "wedding band", "gold", "silver", "platinum",
      "gemstone", "bracelet", "necklace", "earring", "pendant",
      "fine jewelry", "lab grown", "lab-grown", "lab created",
      "jewelry store", "jewelry shop", "ring", "rings",
      "14k", "18k", "carat", "karat", "ct", "tw",
      "sapphire", "ruby", "emerald", "moissanite",
      "bridal jewelry", "anniversary ring", "promise ring",
      "custom jewelry", "bespoke jewelry", "handcrafted jewelry",
      "jewelry designer", "goldsmith", "silversmith"
    ],
    promptTemplates: [
      "best jewelry store in {city}",
      "best place to buy an engagement ring in {city}",
      "top rated jewelers in {city}",
      "lab grown diamond jewelry in {city}",
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
      "jewelry stores open on weekends in {city}",
      "jewelry stores with good reviews in {city}",
      "best place for jewelry repair in {city}",
      "earring stores in {city}",
      "sustainable jewelry brands in {city}"
    ],
    competitorSearchQueries: [
      "Brilliant Earth lab grown diamonds San Francisco",
      "VRAI jewelry San Francisco showroom",
      "Blue Nile engagement rings San Francisco",
      "James Allen diamonds online jewelry",
      "jewelry brands similar to Brilliant Earth Vrai"
    ]
  },
  {
    niche: "plant_shop",
    keywords: [
      "plant shop", "plant care", "plant sitting", "houseplant", "house plant",
      "indoor plant", "plant rental", "repotting", "greenhouse", "nursery",
      "garden center", "plant store", "plant delivery", "plant maintenance",
      "botanical", "plant nursery", "succulent", "tropical plant", "plant service",
      "potting", "plant babysitting", "plant consultant", "fleurish"
    ],
    promptTemplates: [
      "best plant shop in {city}",
      "where to buy indoor plants in {city}",
      "plant store near me in {city}",
      "best place for houseplants in {city}",
      "plant care service in {city}",
      "plant sitting service in {city}",
      "plant nursery in {city}",
      "best greenhouse in {city}",
      "where to buy succulents in {city}",
      "tropical plants for sale in {city}",
      "plant delivery in {city}",
      "plant repotting service in {city}",
      "best garden center in {city}",
      "indoor plant rental in {city}",
      "plant store with good reviews in {city}",
      "plant shop open on weekends in {city}",
      "rare plants for sale in {city}",
      "pet friendly plants in {city}",
      "plant maintenance service in {city}",
      "best plant store for beginners in {city}"
    ],
    competitorSearchQueries: [
      "plant shops in {city}",
      "best plant stores {city}",
      "indoor plant shop {city}",
      "plant nursery near me {city}",
      "houseplant store {city}"
    ]
  }
];

function keywordMatches(text: string, keyword: string): boolean {
  const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\s+/g, '\\s+');
  // Match terms on word boundaries so "car" does not fire inside "care",
  // "scarborough", or other unrelated words. That old behavior let the
  // dealership branch steal arbitrary new niches.
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
}

export function detectNiche(businessName: string, website: string, scrapedContent?: string): NicheConfig {
  const combinedText = `${businessName} ${website} ${scrapedContent || ""}`.toLowerCase();
  
  let best: { niche: NicheConfig; score: number } | null = null;
  for (const niche of NICHES) {
    const score = niche.keywords.filter(keyword => keywordMatches(combinedText, keyword)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { niche, score };
    }
  }

  if (best) {
    return best.niche;
  }
  
  // Unknown/new niches must degrade to a generic evidence-based local-business
  // profile, never to a stale car-dealership default.
  return {
    niche: "local_business",
    keywords: [],
    promptTemplates: [
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
      "{businessName} menu in {city}"
    ],
    competitorSearchQueries: [
      "{businessName} competitors in {city}",
      "businesses like {businessName} in {city}",
      "alternatives to {businessName} in {city}",
      "similar businesses to {businessName} in {city}",
      "{businessName} vs competitors in {city}"
    ]
  };
}

export function getNicheByName(nicheName: string): NicheConfig | null {
  return NICHES.find(n => n.niche === nicheName) || null;
}

/**
 * Generate a dynamic niche config for niches not in our database.
 * v2: Uses enriched business data from preflight for better prompts + competitor queries.
 */
export function generateDynamicNicheConfig(
  nicheName: string,
  businessType?: string,
  targetAudience?: string,
  searchLanguage?: string,
): NicheConfig {
  // Use businessType (specific) over nicheName (generic)
  const label = businessType || nicheName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const audience = targetAudience || label;

  // Build prompts that are specific to this business type + audience
  // If we know the search language, we can't translate here but we can
  // make the English prompts much more specific
  const audienceKeywords = audience.toLowerCase().split(/[,.\s]+/).filter(w => w.length > 3 && !['with','that','this','their','them','they','from','near','also','have','been','were','will','would','could','should','about','other','into','over','only','than','most','some','such'].includes(w));
  const specificityPhrase = audienceKeywords.slice(0, 3).join(' ');

  return {
    niche: nicheName,
    keywords: [nicheName.replace(/_/g, ' '), ...(businessType ? [businessType.toLowerCase()] : [])],
    promptTemplates: [
      `best ${label} in {city}`,
      `top rated ${label} in {city}`,
      `${specificityPhrase} in {city}`,
      `${label} with good reviews in {city}`,
      `${label} open on weekends in {city}`,
      `best place for ${specificityPhrase} in {city}`,
      `affordable ${label} in {city}`,
      `${label} services in {city}`,
      `${label} recommendations in {city}`,
      `where to find ${label} in {city}`,
      `${label} pricing in {city}`,
      `professional ${label} in {city}`,
      `${label} deals in {city}`,
      `${label} appointments in {city}`,
      `${label} consultation in {city}`,
      `${label} booking in {city}`,
      `${label} walk-in in {city}`,
      `best ${specificityPhrase} for families in {city}`,
      `trusted ${label} in {city}`,
      `${label} for ${audienceKeywords[0] || 'businesses'} in {city}`,
    ],
    competitorSearchQueries: [
      `${label} in {city}`,
      `best ${label} {city}`,
      `${specificityPhrase} {city}`,
      `${label} near me {city}`,
      `${label} alternatives {city}`,
    ],
  };
}