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
    niche: "beauty_salon",
    keywords: [
      "salon", "spa", "beauty", "tanning", "tan", "glow", "nail",
      "hair", "barber", "cosmetology", "esthetician", "lashes", "brows",
      "waxing", "facial", "makeup", "bridal beauty", "skin care",
      "bronze", "sunless", "spray tan", "keratin", "blowout",
      "colorist", "stylist", "beautician"
    ],
    promptTemplates: [
      "best tanning salon in {city}",
      "top rated beauty salon in {city}",
      "hair salon with best reviews in {city}",
      "nail salon near me in {city}",
      "best place for a facial in {city}",
      "spray tan near me in {city}",
      "best hair colorist in {city}",
      "affordable salon in {city}",
      "salon open on weekends in {city}",
      "bridal hair and makeup in {city}",
      "best waxing salon in {city}",
      "lash extensions near me in {city}",
      "keratin treatment in {city}",
      "best blowout bar in {city}",
      "salon with good parking in {city}",
      "walk-in salon in {city}",
      "best mens haircut in {city}",
      "barbershop with best reviews in {city}",
      "day spa in {city}",
      "med spa in {city}"
    ],
    competitorSearchQueries: [
      "tanning salons in {city}",
      "best beauty salons {city}",
      "top rated salons {city}",
      "hair salons near me {city}",
      "nail salons {city}"
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
  }
];

export function detectNiche(businessName: string, website: string): NicheConfig {
  const combinedText = `${businessName} ${website}`.toLowerCase();
  
  // Check each niche for keyword matches
  for (const niche of NICHES) {
    if (niche.keywords.some(keyword => combinedText.includes(keyword))) {
      return niche;
    }
  }
  
  // Default to local business with generic templates
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