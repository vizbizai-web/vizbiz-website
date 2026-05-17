/**
 * Google Places API Client (New)
 *
 * Primary source for local competitor discovery.
 * Returns verified nearby businesses with addresses, ratings, and URLs.
 * Falls back gracefully if API key is not configured.
 */

const PLACES_API_BASE = "https://places.googleapis.com/v1";

interface PlaceResult {
  name: string;           // Resource name: "places/ChIJ..."
  displayName: { text: string };
  formattedAddress: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  primaryType?: string;
  types?: string[];
  googleMapsUri?: string;
}

interface NearbySearchResponse {
  places?: PlaceResult[];
}

/**
 * Search for nearby businesses of a specific type using Google Places API (New).
 *
 * @param query - Search query (e.g., "yoga studio")
 * @param location - Center point { latitude, longitude }
 * @param radiusMeters - Search radius in meters (default: 10000 = ~6 miles)
 * @param maxResults - Max results to return (default: 10)
 */
export async function placesNearbySearch(
  query: string,
  location: { latitude: number; longitude: number },
  radiusMeters: number = 10000,
  maxResults: number = 10
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.info("[places-client] No GOOGLE_PLACES_API_KEY configured, skipping Places search");
    return [];
  }

  try {
    const body = {
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: location.latitude, longitude: location.longitude },
          radius: radiusMeters,
        },
      },
      pageSize: maxResults,
      languageCode: "en",
    };

    const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.name",
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.websiteUri",
          "places.nationalPhoneNumber",
          "places.primaryType",
          "places.types",
          "places.googleMapsUri",
        ].join(","),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[places-client] Places API error (${response.status}): ${errorText}`);
      return [];
    }

    const data: NearbySearchResponse = await response.json();
    return data.places || [];
  } catch (error) {
    console.error("[places-client] Places API request failed:", error);
    return [];
  }
}

/**
 * Geocode an address or postal code to coordinates.
 * Falls back gracefully if API key is not configured.
 */
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    // Use Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch (error) {
    console.error("[places-client] Geocoding failed:", error);
    return null;
  }
}

/**
 * Check if Google Places API is configured.
 */
export function isPlacesConfigured(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

export type { PlaceResult };

/* ───────────────────────────────
   ENRICHMENT FUNCTIONS
   ─────────────────────────────── */

/** Result of enriching a business profile via Google Places */
export interface GooglePlaceEnrichment {
  placeId: string | null;
  displayName: string | null;
  formattedAddress: string | null;
  cityMatch: boolean | null;
  websiteUri: string | null;
  websiteMatch: boolean | null;
  googleMapsUri: string | null;
  rating: number | null;
  userReviewCount: number | null;
  businessStatus: string | null;
  types: string[];
  location: { lat: number | null; lng: number | null };
  // Validation metadata
  googleProfileFound: boolean;
  validationStatus: "validated" | "needs_review" | "not_found" | "unavailable";
  confidence: "high" | "medium" | "low" | "none";
  warnings: string[];
}

/** Competitor validation result */
export interface CompetitorValidation {
  name: string;
  source: "client_provided";
  validationStatus: "validated" | "needs_review" | "not_found";
  googlePlace: GooglePlaceEnrichment & {
    distanceFromClientKm: number | null;
  };
}

/** Internal competitor suggestion (never shown to client) */
export interface InternalCompetitorSuggestion {
  name: string;
  placeId: string;
  formattedAddress: string | null;
  websiteUri: string | null;
  googleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  types: string[];
  distanceFromClientKm: number | null;
  confidence: "high" | "medium" | "low";
  reason: string;
  clientFacingAllowed: false;
}

/** Simple in-memory cache with TTL */
const placesCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
  const entry = placesCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  if (entry) placesCache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  placesCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

/**
 * Look up a business in Google Places and return enrichment data.
 * Used for client business validation and trust scoring.
 */
export async function enrichBusinessProfile(
  businessName: string,
  city: string,
  website?: string
): Promise<GooglePlaceEnrichment> {
  const empty: GooglePlaceEnrichment = {
    placeId: null, displayName: null, formattedAddress: null, cityMatch: null,
    websiteUri: null, websiteMatch: null, googleMapsUri: null,
    rating: null, userReviewCount: null, businessStatus: null,
    types: [], location: { lat: null, lng: null },
    googleProfileFound: false, validationStatus: "unavailable", confidence: "none", warnings: [],
  };

  if (!isPlacesConfigured()) {
    empty.warnings = ["Google Places API not configured"];
    return empty;
  }

  // Check env flag
  if (process.env.ENABLE_GOOGLE_PLACES_ENRICHMENT === "false") return empty;

  const cacheKey = `enrich:${businessName}:${city}`;
  const cached = getCached<GooglePlaceEnrichment>(cacheKey);
  if (cached) return cached;

  try {
    const geoResult = await geocodeAddress(city);
    if (!geoResult) return empty;

    const places = await placesNearbySearch(businessName, geoResult, 15000, 3);
    if (!places.length) return empty;

    const best = places[0];
    const placeId = (best as unknown as Record<string, string>).id || best.name?.replace("places/", "") || null;
    const domainFromUrl = (u: string) => {
      try { return new URL(u.startsWith('http') ? u : `https://${u}`).hostname.replace(/^www\./, ''); } catch { return ''; }
    };
    const bizDomain = website ? domainFromUrl(website) : "";
    const placeDomain = best.websiteUri ? domainFromUrl(best.websiteUri) : "";
    const websiteMatch = !!(bizDomain && placeDomain && (bizDomain === placeDomain || placeDomain.includes(bizDomain) || bizDomain.includes(placeDomain)));

    const warnings: string[] = [];
    const cityMatchValue = best.formattedAddress?.toLowerCase().includes(city.toLowerCase().split(',')[0].trim().toLowerCase()) ?? null;
    if (!cityMatchValue && city) warnings.push("City mismatch between business address and provided city");
    if (!websiteMatch && website) warnings.push("Website domain does not match Google listing");

    // Determine validation status and confidence
    const googleProfileFound = !!placeId;
    const validationStatus: GooglePlaceEnrichment["validationStatus"] = placeId
      ? (websiteMatch && cityMatchValue) ? "validated" : "needs_review"
      : "not_found";
    const confidence: GooglePlaceEnrichment["confidence"] = placeId
      ? (websiteMatch && cityMatchValue) ? "high" : websiteMatch || cityMatchValue ? "medium" : "low"
      : "none";

    const result: GooglePlaceEnrichment = {
      placeId,
      displayName: best.displayName?.text || null,
      formattedAddress: best.formattedAddress || null,
      cityMatch: cityMatchValue,
      websiteUri: best.websiteUri || null,
      websiteMatch,
      googleMapsUri: best.googleMapsUri || null,
      rating: best.rating ?? null,
      userReviewCount: best.userRatingCount ?? null,
      businessStatus: null,
      types: best.types || [],
      location: best.location ? { lat: best.location.latitude, lng: best.location.longitude } : { lat: null, lng: null },
      googleProfileFound,
      validationStatus,
      confidence,
      warnings,
    };

    setCache(cacheKey, result);
    console.info(`[places-client] Enriched: "${businessName}" → placeId=${placeId}, rating=${result.rating}, reviews=${result.userReviewCount}, websiteMatch=${websiteMatch}`);
    return result;
  } catch (error) {
    console.warn(`[places-client] enrichBusinessProfile failed for "${businessName}":`, error instanceof Error ? error.message : error);
    return empty;
  }
}

/**
 * Validate and enrich a client-provided competitor via Google Places.
 */
export async function enrichCompetitor(
  competitorName: string,
  clientCity: string,
  clientLocation?: { lat: number; lng: number }
): Promise<CompetitorValidation> {
  const emptyPlace: GooglePlaceEnrichment & { distanceFromClientKm: number | null } = {
    placeId: null, displayName: null, formattedAddress: null, cityMatch: null,
    websiteUri: null, websiteMatch: null, googleMapsUri: null,
    rating: null, userReviewCount: null, businessStatus: null,
    types: [], location: { lat: null, lng: null }, distanceFromClientKm: null,
    googleProfileFound: false, validationStatus: "unavailable", confidence: "none", warnings: ["Google Places not available"],
  };

  if (!isPlacesConfigured() || process.env.ENABLE_GOOGLE_PLACES_ENRICHMENT === "false") {
    return { name: competitorName, source: "client_provided", validationStatus: "needs_review", googlePlace: emptyPlace };
  }

  const cacheKey = `competitor:${competitorName}:${clientCity}`;
  const cached = getCached<CompetitorValidation>(cacheKey);
  if (cached) return cached;

  try {
    const geoResult = await geocodeAddress(clientCity);
    if (!geoResult) {
      return { name: competitorName, source: "client_provided", validationStatus: "needs_review", googlePlace: emptyPlace };
    }

    const places = await placesNearbySearch(competitorName, geoResult, 25000, 5);
    if (!places.length) {
      console.info(`[places-client] Competitor "${competitorName}" not found in Places near ${clientCity}`);
      return { name: competitorName, source: "client_provided", validationStatus: "not_found", googlePlace: emptyPlace };
    }

    const best = places[0];
    const placeId = (best as unknown as Record<string, string>).id || best.name?.replace("places/", "") || null;

    // Calculate distance if client location available
    let distanceKm: number | null = null;
    if (clientLocation && best.location) {
      const R = 6371;
      const dLat = (best.location.latitude - clientLocation.lat) * Math.PI / 180;
      const dLon = (best.location.longitude - clientLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(clientLocation.lat * Math.PI / 180) * Math.cos(best.location.latitude * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
    }

    const validation: CompetitorValidation = {
      name: best.displayName?.text || competitorName,
      source: "client_provided",
      validationStatus: "validated",
      googlePlace: {
        placeId,
        displayName: best.displayName?.text || null,
        formattedAddress: best.formattedAddress || null,
        cityMatch: best.formattedAddress?.toLowerCase().includes(clientCity.toLowerCase().split(',')[0].trim().toLowerCase()) ?? null,
        websiteUri: best.websiteUri || null,
        websiteMatch: null,
        googleMapsUri: best.googleMapsUri || null,
        rating: best.rating ?? null,
        userReviewCount: best.userRatingCount ?? null,
        businessStatus: null,
        types: best.types || [],
        location: best.location ? { lat: best.location.latitude, lng: best.location.longitude } : { lat: null, lng: null },
        distanceFromClientKm: distanceKm,
        googleProfileFound: true,
        validationStatus: "validated" as const,
        confidence: "medium" as const,
        warnings: [],
      },
    };

    setCache(cacheKey, validation);
    console.info(`[places-client] Competitor validated: "${competitorName}" → "${validation.googlePlace.displayName}", rating=${validation.googlePlace.rating}, distance=${distanceKm}km`);
    return validation;
  } catch (error) {
    console.warn(`[places-client] enrichCompetitor failed for "${competitorName}":`, error instanceof Error ? error.message : error);
    return { name: competitorName, source: "client_provided", validationStatus: "needs_review", googlePlace: emptyPlace };
  }
}

/**
 * Calculate a local entity trust score (0-100) from Google Places enrichment data.
 *
 * Factors:
 * - Google profile found (yes/no)
 * - Website matches submitted website
 * - City/location match
 * - Rating (normalized to 0-25)
 * - Review count (logarithmic scale, 0-20)
 * - Business category clarity
 */
export function calculateLocalEntityTrustScore(enrichment: GooglePlaceEnrichment): number {
  let score = 0;

  // Profile exists (0 or 15)
  if (enrichment.placeId) score += 15;

  // Website match (0 or 20)
  if (enrichment.websiteMatch === true) score += 20;
  else if (enrichment.websiteMatch === null) score += 5; // Unknown

  // City match (0 or 15)
  if (enrichment.cityMatch === true) score += 15;
  else if (enrichment.cityMatch === null) score += 5;

  // Rating (0-25, normalized from 1-5)
  if (enrichment.rating !== null) {
    score += Math.round((enrichment.rating / 5) * 25);
  }

  // Review count (logarithmic, 0-15)
  if (enrichment.userReviewCount !== null) {
    const logReviews = Math.log10(enrichment.userReviewCount + 1);
    score += Math.min(Math.round(logReviews * 5), 15); // log10(100)=2 → 10pts, log10(1000)=3 → 15pts
  }

  // Category clarity (0-10)
  if (enrichment.types.length > 0) score += 5;
  if (enrichment.types.length >= 3) score += 5;

  return Math.min(score, 100);
}
