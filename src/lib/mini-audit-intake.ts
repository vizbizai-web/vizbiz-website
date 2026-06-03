import type { ClientInput, CompetitorBenchmark } from "@/engines/research/types";

export type CompetitorSource = "user_supplied" | "auto_discovered" | "mixed" | "none";

export interface MiniAuditLead {
  email: string;
  competitorSource: CompetitorSource;
  auditInput: ClientInput;
}

type RawMiniAuditLead = Record<string, unknown>;

const DEFAULT_COMPETITOR_AVI_SCORE = 65;

export function parseMiniAuditLead(raw: RawMiniAuditLead): MiniAuditLead {
  const name = requiredString(raw.name, "name");
  const email = normalizeEmail(requiredString(raw.email, "email"));
  const city = requiredString(raw.city, "city");
  const websiteUrl = optionalWebsite(raw.websiteUrl);
  const primaryService = optionalString(raw.primaryService);
  const primaryMake = optionalString(raw.primaryMake) ?? inferVehicleMake([name, primaryService, websiteUrl].filter(Boolean).join(" "));
  const inferredBusinessType = optionalString(raw.businessType) ?? (primaryMake || looksLikeAutoDealer([name, primaryService, websiteUrl].filter(Boolean).join(" ")) ? "auto_dealer" : undefined);
  const competitors = parseCompetitors(raw);

  return {
    email,
    competitorSource: competitors.length ? "user_supplied" : "none",
    auditInput: {
      name,
      city,
      market: optionalString(raw.market) ?? city,
      ...(primaryMake ? { primaryMake } : {}),
      ...(primaryService ? { primaryService } : {}),
      ...(inferredBusinessType ? { businessType: inferredBusinessType } : {}),
      ...(websiteUrl ? { websiteUrl } : {}),
      ...(competitors.length ? { competitors } : {}),
    },
  };
}

function requiredString(value: unknown, field: string) {
  const normalized = optionalString(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}

function normalizeEmail(email: string) {
  const normalized = email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("email must be valid");
  return normalized;
}

function optionalWebsite(value: unknown) {
  const website = optionalString(value);
  if (!website) return undefined;
  if (/^https?:\/\//i.test(website)) return website;
  return `https://${website}`;
}

function inferVehicleMake(value: string) {
  const match = value.match(/\b(Kia|Toyota|Honda|Hyundai|Ford|Chevrolet|Chevy|Nissan|Mazda|Subaru|Volkswagen|VW|BMW|Mercedes|Audi|Lexus|Acura|Jeep|Dodge|Ram|Chrysler|GMC|Cadillac|Volvo|Porsche|Mitsubishi|Buick|Lincoln|Genesis|Infiniti|Mini|Tesla)\b/i);
  if (!match) return undefined;
  const normalized = match[1];
  if (normalized.toUpperCase() === "VW") return "Volkswagen";
  if (normalized.toLowerCase() === "chevy") return "Chevrolet";
  return normalized[0].toUpperCase() + normalized.slice(1).toLowerCase();
}

function looksLikeAutoDealer(value: string) {
  return /\b(dealer|dealership|auto dealer|car dealer|new cars|used cars|vehicle sales|service department|parts department)\b/i.test(value);
}

function parseCompetitors(raw: RawMiniAuditLead): CompetitorBenchmark[] {
  const separateCompetitors = [raw.competitorOne, raw.competitorTwo]
    .map((name) => (typeof name === "string" ? competitorFromName(name) : null))
    .filter((item): item is CompetitorBenchmark => Boolean(item));

  if (separateCompetitors.length) return separateCompetitors.slice(0, 2);

  const value = raw.competitors;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return competitorFromName(item);
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const name = optionalString(record.name) ?? optionalString(record.websiteUrl);
        if (!name) return null;
        const aviScore = typeof record.aviScore === "number" ? record.aviScore : DEFAULT_COMPETITOR_AVI_SCORE;
        const websiteUrl = optionalWebsite(record.websiteUrl ?? name);
        return { name, ...(websiteUrl && isLikelyUrl(name) ? { websiteUrl } : {}), aviScore };
      })
      .filter((item): item is CompetitorBenchmark => Boolean(item))
      .slice(0, 2);
  }

  const competitorText = optionalString(value);
  if (!competitorText) return [];
  return competitorText
    .split(/[\n,]+/)
    .map((name) => competitorFromName(name))
    .filter((item): item is CompetitorBenchmark => Boolean(item))
    .slice(0, 2);
}

function competitorFromName(name: string): CompetitorBenchmark | null {
  const normalized = optionalString(name);
  if (!normalized) return null;
  const websiteUrl = isLikelyUrl(normalized) ? optionalWebsite(normalized) : undefined;
  return { name: normalized, ...(websiteUrl ? { websiteUrl } : {}), aviScore: DEFAULT_COMPETITOR_AVI_SCORE };
}

function isLikelyUrl(value: string) {
  return /^https?:\/\//i.test(value) || /\.[a-z]{2,}(\/|$)/i.test(value);
}
