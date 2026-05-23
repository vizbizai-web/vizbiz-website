import type { ClientInput, CompetitorBenchmark, GooglePlaceCompetitorValidation, GooglePlaceProfile, GooglePlacesEnrichment, LocalEntityTrustScore } from "../types";

const GOOGLE_PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.types",
  "places.websiteUri",
  "places.googleMapsUri",
].join(",");

interface GooglePlaceApiPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  types?: string[];
  websiteUri?: string;
  googleMapsUri?: string;
}

export async function enrichWithGooglePlaces(input: ClientInput): Promise<GooglePlacesEnrichment> {
  if (!process.env.GOOGLE_PLACES_API_KEY) return unavailableEnrichment(input.competitors?.length ? "client_provided" : "client_only");

  try {
    const client = await findGooglePlace({ name: input.name, city: input.city, websiteUrl: input.websiteUrl });
    const competitors = await validateProvidedCompetitors(input.competitors ?? [], input.city, client);
    return {
      status: "completed",
      competitorMode: competitors.length ? "client_provided" : "client_only",
      client,
      competitors,
      suggestedCompetitorsInternalOnly: [],
      localEntityTrustScore: scoreLocalEntityTrust(client, competitors),
      notes: competitors.length
        ? ["Google Places validated client-provided competitors only; no silent competitor auto-fill was used."]
        : ["No client-provided competitors; Google Places enriched the client only and kept the report in client-only mode."],
    };
  } catch (error) {
    return {
      ...unavailableEnrichment(input.competitors?.length ? "client_provided" : "client_only"),
      status: "failed",
      notes: [`Google Places enrichment failed: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

export async function findGooglePlace(input: { name: string; city: string; websiteUrl?: string | null }): Promise<GooglePlaceProfile> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return emptyPlace();

  const query = [input.name, input.city, input.websiteUrl].filter(Boolean).join(" ");
  const response = await fetch(GOOGLE_PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
  });
  if (!response.ok) throw new Error(`Google Places ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as { places?: GooglePlaceApiPlace[] };
  return normalizePlace(data.places?.[0], input.city, input.websiteUrl ?? null);
}

async function validateProvidedCompetitors(competitors: CompetitorBenchmark[], city: string, client: GooglePlaceProfile): Promise<GooglePlaceCompetitorValidation[]> {
  const confirmed = competitors.slice(0, 2);
  const validations: GooglePlaceCompetitorValidation[] = [];
  for (const competitor of confirmed) {
    const googlePlace = await findGooglePlace({ name: competitor.name, city, websiteUrl: competitor.websiteUrl });
    const distanceFromClientKm = distanceKm(client.location, googlePlace.location);
    const categoryMatch = categoryOverlap(client.types, googlePlace.types);
    validations.push({
      name: competitor.name,
      source: "client_provided",
      validationStatus: validationStatus(googlePlace, distanceFromClientKm, categoryMatch),
      googlePlace: { ...googlePlace, distanceFromClientKm, categoryMatch },
    });
  }
  return validations;
}

function normalizePlace(place: GooglePlaceApiPlace | undefined, city: string, websiteUrl: string | null): GooglePlaceProfile {
  if (!place) return emptyPlace();
  const formattedAddress = place.formattedAddress ?? null;
  const websiteUri = place.websiteUri ?? null;
  return {
    placeId: place.id ?? null,
    displayName: place.displayName?.text ?? null,
    formattedAddress,
    cityMatch: formattedAddress ? formattedAddress.toLowerCase().includes(city.toLowerCase()) : null,
    websiteUri,
    websiteMatch: websiteUrl && websiteUri ? sameHostname(websiteUrl, websiteUri) : null,
    googleMapsUri: place.googleMapsUri ?? null,
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    businessStatus: place.businessStatus ?? null,
    types: place.types ?? [],
    location: { lat: place.location?.latitude ?? null, lng: place.location?.longitude ?? null },
  };
}

function scoreLocalEntityTrust(client: GooglePlaceProfile, competitors: GooglePlaceCompetitorValidation[]): LocalEntityTrustScore {
  if (!client.placeId) return { score: 0, band: "Unavailable", signals: [], opportunities: ["Verify and connect the Google Business Profile so AI/search systems can confirm the local entity."] };
  const signals: string[] = ["Google Business Profile found."];
  const opportunities: string[] = [];
  let score = 25;

  if (client.websiteMatch) {
    score += 15;
    signals.push("Google profile website matches the submitted website.");
  } else if (client.websiteUri) {
    score += 6;
    opportunities.push("Confirm the Google profile website matches the main business site.");
  } else {
    opportunities.push("Add the primary website URL to the Google Business Profile.");
  }

  if (client.cityMatch) {
    score += 10;
    signals.push("Google profile address matches the submitted local market.");
  } else {
    opportunities.push("Check name/address/city consistency across the site and Google profile.");
  }

  if (client.types.length) {
    score += 10;
    signals.push(`Google categories/types include ${client.types.slice(0, 3).join(", ")}.`);
  } else {
    opportunities.push("Clarify Google profile categories so AI systems know what service the business provides.");
  }

  if ((client.userRatingCount ?? 0) >= 100) {
    score += 20;
    signals.push(`${client.userRatingCount} Google reviews create strong local trust proof.`);
  } else if ((client.userRatingCount ?? 0) >= 25) {
    score += 12;
    signals.push(`${client.userRatingCount} Google reviews provide some local trust proof.`);
    opportunities.push("Build a review velocity plan to close the trust gap with stronger local competitors.");
  } else {
    opportunities.push("Grow Google review volume; AI/search systems need public proof before confidently recommending a local business.");
  }

  if ((client.rating ?? 0) >= 4.5) {
    score += 10;
    signals.push(`Google rating is strong at ${client.rating}.`);
  } else if (client.rating) {
    score += 4;
    opportunities.push("Improve review quality and response strategy to lift the public trust signal.");
  }

  const strongestCompetitorReviews = Math.max(0, ...competitors.map((competitor) => competitor.googlePlace.userRatingCount ?? 0));
  if (strongestCompetitorReviews > (client.userRatingCount ?? 0)) {
    opportunities.push(`A confirmed competitor has ${strongestCompetitorReviews} Google reviews; use monthly monitoring to close the review proof gap.`);
  }

  const capped = Math.min(100, score);
  return { score: capped, band: capped >= 75 ? "Strong" : capped >= 45 ? "Building" : "Thin", signals, opportunities: opportunities.slice(0, 4) };
}

function validationStatus(place: GooglePlaceProfile, distanceFromClientKm: number | null, categoryMatch: boolean | null): GooglePlaceCompetitorValidation["validationStatus"] {
  if (!place.placeId) return "not_found";
  if (distanceFromClientKm !== null && distanceFromClientKm > 50) return "needs_review";
  if (categoryMatch === false) return "needs_review";
  return "validated";
}

function emptyPlace(): GooglePlaceProfile {
  return {
    placeId: null,
    displayName: null,
    formattedAddress: null,
    cityMatch: null,
    websiteUri: null,
    websiteMatch: null,
    googleMapsUri: null,
    rating: null,
    userRatingCount: null,
    businessStatus: null,
    types: [],
    location: { lat: null, lng: null },
  };
}

function unavailableEnrichment(competitorMode: GooglePlacesEnrichment["competitorMode"]): GooglePlacesEnrichment {
  return {
    status: "unavailable",
    competitorMode,
    client: emptyPlace(),
    competitors: [],
    suggestedCompetitorsInternalOnly: [],
    localEntityTrustScore: { score: 0, band: "Unavailable", signals: [], opportunities: ["Google Places enrichment is not configured yet."] },
    notes: ["GOOGLE_PLACES_API_KEY is not configured; local entity trust scoring is unavailable."],
  };
}

function sameHostname(a: string, b: string) {
  const normalize = (value: string) => {
    try {
      return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return value.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0].toLowerCase();
    }
  };
  return normalize(a) === normalize(b);
}

function categoryOverlap(a: string[], b: string[]) {
  if (!a.length || !b.length) return null;
  const generic = new Set(["point_of_interest", "establishment", "health"]);
  const left = new Set(a.filter((type) => !generic.has(type)));
  return b.some((type) => left.has(type));
}

function distanceKm(a: GooglePlaceProfile["location"], b: GooglePlaceProfile["location"]) {
  if ([a.lat, a.lng, b.lat, b.lng].some((value) => typeof value !== "number")) return null;
  const radiusKm = 6371;
  const dLat = toRad((b.lat as number) - (a.lat as number));
  const dLng = toRad((b.lng as number) - (a.lng as number));
  const lat1 = toRad(a.lat as number);
  const lat2 = toRad(b.lat as number);
  const haversine = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(radiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)) * 10) / 10;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}
