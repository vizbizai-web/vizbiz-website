import { NextResponse } from "next/server";

type IntakePayload = {
  name: string;
  dealershipName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  cityMarket: string;
  numberOfLocations?: string;
  mainConcern?: string;
  competitor?: string;
  selectedPlan?: string;
  source: string;
  originalCta?: string;
  originalPage?: string;
};

type HubSpotSearchResponse = {
  results?: Array<{ id: string }>;
};

const requiredFields = [
  "name",
  "dealershipName",
  "email",
  "phone",
  "websiteUrl",
  "cityMarket",
] as const;

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_PIPELINE_ID = process.env.HUBSPOT_PIPELINE_ID;
const HUBSPOT_STAGE_INTAKE_SUBMITTED = process.env.HUBSPOT_STAGE_INTAKE_SUBMITTED;

const optionalHubSpotProperties = {
  contactSource: process.env.HUBSPOT_CONTACT_SOURCE_PROPERTY,
  contactOriginalCta: process.env.HUBSPOT_CONTACT_ORIGINAL_CTA_PROPERTY,
  contactOriginalPage: process.env.HUBSPOT_CONTACT_ORIGINAL_PAGE_PROPERTY,
  companyCityMarket: process.env.HUBSPOT_COMPANY_CITY_MARKET_PROPERTY,
  companyNumberOfLocations: process.env.HUBSPOT_COMPANY_NUMBER_OF_LOCATIONS_PROPERTY,
  companyCompetitor: process.env.HUBSPOT_COMPANY_COMPETITOR_PROPERTY,
  dealSelectedPlan: process.env.HUBSPOT_DEAL_SELECTED_PLAN_PROPERTY,
  dealSource: process.env.HUBSPOT_DEAL_SOURCE_PROPERTY,
  dealSubmittedAt: process.env.HUBSPOT_DEAL_INTAKE_SUBMITTED_AT_PROPERTY,
  dealMainConcern: process.env.HUBSPOT_DEAL_MAIN_CONCERN_PROPERTY,
  dealOriginalCta: process.env.HUBSPOT_DEAL_ORIGINAL_CTA_PROPERTY,
  dealOriginalPage: process.env.HUBSPOT_DEAL_ORIGINAL_PAGE_PROPERTY,
} as const;

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstname: parts[0] ?? fullName,
    lastname: parts.slice(1).join(" ") || "Lead",
  };
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function extractDomain(websiteUrl: string) {
  try {
    const url = new URL(normalizeWebsiteUrl(websiteUrl));
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function getOptionalProperty(propertyName: string | undefined, value: string | undefined) {
  if (!propertyName || !value) {
    return {};
  }

  return { [propertyName]: value };
}

function buildNoteBody(payload: IntakePayload, submittedAtIso: string) {
  const rows: Array<[string, string]> = [
    ["Website intake submitted", submittedAtIso],
    ["Name", payload.name],
    ["Dealership", payload.dealershipName],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Website", payload.websiteUrl],
    ["Domain", extractDomain(payload.websiteUrl) || "Not parsed"],
    ["City / Market", payload.cityMarket],
    ["Number of locations", payload.numberOfLocations || "Not provided"],
    ["Main concern or goal", payload.mainConcern || "Not provided"],
    ["Competitor", payload.competitor || "Not provided"],
    ["Selected plan", payload.selectedPlan || "Not provided"],
    ["Source", payload.source],
    ["Original CTA", payload.originalCta || "Not provided"],
    ["Original page", payload.originalPage || "Not provided"],
  ];

  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

async function hubspotFetch<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HubSpot ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function searchObject(objectType: "contacts" | "companies", propertyName: string, value: string) {
  if (!value) {
    return undefined;
  }

  const response = await hubspotFetch<HubSpotSearchResponse>(`/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName,
              operator: "EQ",
              value,
            },
          ],
        },
      ],
      properties: [propertyName],
      limit: 1,
    }),
  });

  return response.results?.[0]?.id;
}

async function createOrUpdateContact(payload: IntakePayload) {
  const { firstname, lastname } = splitName(payload.name);
  const properties = {
    firstname,
    lastname,
    email: payload.email,
    phone: payload.phone,
    ...getOptionalProperty(optionalHubSpotProperties.contactSource, payload.source),
    ...getOptionalProperty(optionalHubSpotProperties.contactOriginalCta, payload.originalCta),
    ...getOptionalProperty(optionalHubSpotProperties.contactOriginalPage, payload.originalPage),
  };

  const existingId = await searchObject("contacts", "email", payload.email);

  if (existingId) {
    await hubspotFetch(`/crm/v3/objects/contacts/${existingId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });

    return existingId;
  }

  const created = await hubspotFetch<{ id: string }>("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return created.id;
}

async function findExistingCompanyId(payload: IntakePayload) {
  const domain = extractDomain(payload.websiteUrl);

  if (domain) {
    const byDomain = await searchObject("companies", "domain", domain);
    if (byDomain) {
      return byDomain;
    }
  }

  return searchObject("companies", "name", payload.dealershipName);
}

async function createOrUpdateCompany(payload: IntakePayload) {
  const domain = extractDomain(payload.websiteUrl);
  const properties = {
    name: payload.dealershipName,
    website: normalizeWebsiteUrl(payload.websiteUrl),
    ...(domain ? { domain } : {}),
    city: payload.cityMarket,
    ...getOptionalProperty(optionalHubSpotProperties.companyCityMarket, payload.cityMarket),
    ...getOptionalProperty(optionalHubSpotProperties.companyNumberOfLocations, payload.numberOfLocations),
    ...getOptionalProperty(optionalHubSpotProperties.companyCompetitor, payload.competitor),
  };

  const existingId = await findExistingCompanyId(payload);

  if (existingId) {
    await hubspotFetch(`/crm/v3/objects/companies/${existingId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });

    return existingId;
  }

  const created = await hubspotFetch<{ id: string }>("/crm/v3/objects/companies", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return created.id;
}

async function createDeal(payload: IntakePayload, submittedAtIso: string) {
  const properties = {
    dealname: `${payload.dealershipName} - AI Visibility Snapshot`,
    pipeline: HUBSPOT_PIPELINE_ID,
    dealstage: HUBSPOT_STAGE_INTAKE_SUBMITTED,
    ...getOptionalProperty(optionalHubSpotProperties.dealSelectedPlan, payload.selectedPlan),
    ...getOptionalProperty(optionalHubSpotProperties.dealSource, payload.source),
    ...getOptionalProperty(optionalHubSpotProperties.dealSubmittedAt, submittedAtIso),
    ...getOptionalProperty(optionalHubSpotProperties.dealMainConcern, payload.mainConcern),
    ...getOptionalProperty(optionalHubSpotProperties.dealOriginalCta, payload.originalCta),
    ...getOptionalProperty(optionalHubSpotProperties.dealOriginalPage, payload.originalPage),
  };

  const created = await hubspotFetch<{ id: string }>("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return created.id;
}

async function createNote(payload: IntakePayload, submittedAtIso: string) {
  const created = await hubspotFetch<{ id: string }>("/crm/v3/objects/notes", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        hs_note_body: buildNoteBody(payload, submittedAtIso),
        hs_timestamp: submittedAtIso,
      },
    }),
  });

  return created.id;
}

async function associate(fromObjectType: string, fromId: string, toObjectType: string, toId: string) {
  await hubspotFetch(
    `/crm/v4/objects/${fromObjectType}/${fromId}/associations/default/${toObjectType}/${toId}`,
    {
      method: "PUT",
      body: JSON.stringify([]),
    },
  );
}

async function sendToHubSpot(payload: IntakePayload) {
  if (!HUBSPOT_ACCESS_TOKEN || !HUBSPOT_PIPELINE_ID || !HUBSPOT_STAGE_INTAKE_SUBMITTED) {
    throw new Error(
      "Missing HubSpot configuration: HUBSPOT_ACCESS_TOKEN, HUBSPOT_PIPELINE_ID, or HUBSPOT_STAGE_INTAKE_SUBMITTED",
    );
  }

  const submittedAtIso = new Date().toISOString();
  const contactId = await createOrUpdateContact(payload);
  const companyId = await createOrUpdateCompany(payload);
  const dealId = await createDeal(payload, submittedAtIso);
  const noteId = await createNote(payload, submittedAtIso);

  await Promise.allSettled([
    associate("contacts", contactId, "companies", companyId),
    associate("contacts", contactId, "deals", dealId),
    associate("companies", companyId, "deals", dealId),
    associate("contacts", contactId, "notes", noteId),
    associate("companies", companyId, "notes", noteId),
    associate("deals", dealId, "notes", noteId),
  ]);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries()) as Record<string, string>;

  const missingField = requiredFields.find((field) => {
    const value = payload[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingField) {
    return NextResponse.redirect(new URL("/intake?error=missing-field", request.url), 303);
  }

  const cleanPayload: IntakePayload = {
    name: payload.name.trim(),
    dealershipName: payload.dealershipName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    websiteUrl: normalizeWebsiteUrl(payload.websiteUrl),
    cityMarket: payload.cityMarket.trim(),
    numberOfLocations: payload.numberOfLocations?.trim() || undefined,
    mainConcern: payload.mainConcern?.trim() || undefined,
    competitor: payload.competitor?.trim() || undefined,
    selectedPlan: payload.selectedPlan?.trim() || undefined,
    source: payload.source?.trim() || "website intake",
    originalCta: payload.originalCta?.trim() || undefined,
    originalPage: payload.originalPage?.trim() || undefined,
  };

  try {
    await sendToHubSpot(cleanPayload);
    return NextResponse.redirect(new URL("/thank-you?submitted=1&hubspot=ok", request.url), 303);
  } catch (error) {
    console.error("[intake] HubSpot sync failed", error);
    return NextResponse.redirect(new URL("/thank-you?submitted=1&hubspot=pending", request.url), 303);
  }
}
