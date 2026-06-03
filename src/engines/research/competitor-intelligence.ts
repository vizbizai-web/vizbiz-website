import type { GooglePlaceProfile } from "./types";
import type { CompetitorEvidence, EvidenceTerm, GoogleBusinessEvidence, WebsiteCrawlEvidence } from "./business-intelligence-types";
import { findGooglePlace } from "./platforms/google-places";
import { crawlWebsiteEvidence } from "./site-crawler";

export interface CompetitorIntelligenceInput {
  name: string;
  city: string;
  websiteUrl?: string | null;
}

export async function buildCompetitorEvidence(
  competitors: CompetitorIntelligenceInput[],
  clientServices: EvidenceTerm[],
  options: { maxCompetitors?: number; crawl?: (url: string) => Promise<WebsiteCrawlEvidence>; findPlace?: typeof findGooglePlace } = {},
): Promise<CompetitorEvidence[]> {
  const maxCompetitors = options.maxCompetitors ?? 2;
  const crawl = options.crawl ?? ((url: string) => crawlWebsiteEvidence(url, { maxPages: 5 }));
  const findPlace = options.findPlace ?? findGooglePlace;
  const results: CompetitorEvidence[] = [];

  for (const competitor of competitors.slice(0, maxCompetitors)) {
    const place = await findPlace({ name: competitor.name, city: competitor.city, websiteUrl: competitor.websiteUrl });
    const websiteUrl = competitor.websiteUrl ?? place.websiteUri;
    const crawlEvidence = websiteUrl ? await crawl(websiteUrl) : null;
    const extractedServices = crawlEvidence?.extractedServices ?? [];
    const clientTerms = new Set(clientServices.map((term) => term.term.toLowerCase()));
    const competitorTerms = new Set(extractedServices.map((term) => term.term.toLowerCase()));
    const overlappingTermsWithClient = Array.from(competitorTerms).filter((term) => clientTerms.has(term)).slice(0, 10);
    const differentiatingTerms = Array.from(competitorTerms).filter((term) => !clientTerms.has(term)).slice(0, 10);
    const websiteMatchConfidence = websiteUrl ? (place.websiteMatch ? 1 : place.websiteUri ? 0.45 : 0.65) : 0;
    const confidence = Math.min(100, Math.round(
      (place.placeId ? 25 : 0) +
      websiteMatchConfidence * 20 +
      Math.min(35, extractedServices.length * 7) +
      Math.min(20, overlappingTermsWithClient.length * 5),
    ));

    results.push({
      submittedName: competitor.name,
      resolvedName: place.displayName,
      googleTypes: place.types,
      websiteUrl,
      websiteMatchConfidence,
      extractedServices,
      overlappingTermsWithClient,
      differentiatingTerms,
      confidence,
      reviewCount: place.userRatingCount,
      rating: place.rating,
    });
  }
  return results;
}

export function googlePlaceToBusinessEvidence(place: GooglePlaceProfile, submittedWebsiteUrl?: string | null): GoogleBusinessEvidence {
  const websiteMatch = classifyWebsiteMatch(submittedWebsiteUrl, place.websiteUri);
  const evidence: string[] = [];
  if (place.placeId) evidence.push("Google Business Profile found.");
  if (place.displayName) evidence.push(`Google canonical name: ${place.displayName}.`);
  if (place.types.length) evidence.push(`Google categories/types: ${place.types.slice(0, 5).join(", ")}.`);
  if (websiteMatch === "exact" || websiteMatch === "same_domain") evidence.push("Google website matches the submitted business website.");
  if (websiteMatch === "mismatch") evidence.push("Google website does not match the submitted website.");
  if (typeof place.userRatingCount === "number") evidence.push(`${place.userRatingCount} Google reviews detected.`);
  const confidence = Math.min(100, Math.round((place.placeId ? 30 : 0) + (place.types.length ? 20 : 0) + (websiteMatch === "exact" ? 25 : websiteMatch === "same_domain" ? 20 : websiteMatch === "missing" ? 0 : -20) + (place.cityMatch ? 10 : 0) + Math.min(15, (place.userRatingCount ?? 0) / 10)));
  return {
    placeId: place.placeId,
    canonicalName: place.displayName,
    primaryType: place.types.find((type) => !["point_of_interest", "establishment"].includes(type)) ?? place.types[0] ?? null,
    types: place.types,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    websiteUrl: place.websiteUri,
    websiteMatch,
    address: place.formattedAddress,
    mapsUrl: place.googleMapsUri,
    confidence,
    evidence,
  };
}

function classifyWebsiteMatch(submittedWebsiteUrl?: string | null, googleWebsiteUrl?: string | null): GoogleBusinessEvidence["websiteMatch"] {
  if (!submittedWebsiteUrl || !googleWebsiteUrl) return "missing";
  const submitted = normalizeUrlParts(submittedWebsiteUrl);
  const google = normalizeUrlParts(googleWebsiteUrl);
  if (!submitted || !google) return "mismatch";
  if (submitted.href === google.href) return "exact";
  if (submitted.hostname === google.hostname) return "same_domain";
  return "mismatch";
}

function normalizeUrlParts(value: string) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    url.hash = "";
    url.search = "";
    if (url.pathname === "/") url.pathname = "";
    return { href: `${url.protocol}//${url.hostname.replace(/^www\./, "").toLowerCase()}${url.pathname.replace(/\/$/, "")}`, hostname: url.hostname.replace(/^www\./, "").toLowerCase() };
  } catch {
    return null;
  }
}
