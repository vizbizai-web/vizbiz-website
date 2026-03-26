import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildMiniSnapshot } from "@/lib/mini-snapshot";
import { buildResearchBrief } from "@/lib/research-brief";
import { buildSnapshotEmailHtml, type SnapshotEmailData } from "@/lib/snapshot-email";

export type LeadInput = {
  timestamp: string;
  dealershipName: string;
  website: string;
  city: string;
  name: string;
  email: string;
  competitors?: string;
  phone?: string;
  source?: string;
  originalCta?: string;
  originalPage?: string;
};

export type StructuredSnapshotSummary = {
  appeared_in_prompts: string;
  visibility_status: string;
  service_visibility: string;
  competitor_summary: string;
  competitor_categories: string;
  why_it_matters: string;
  next_step: string;
};

export type StoredLead = {
  timestamp: string;
  dealership_name: string;
  website: string;
  city: string;
  name: string;
  email: string;
  competitors: string;
  booking_link_clicked: boolean;
  snapshot_summary?: StructuredSnapshotSummary;
};

type HubSpotObjectType = "contacts" | "companies" | "deals" | "notes";

type HubSpotSearchResponse<TProperties extends Record<string, string> = Record<string, string>> = {
  results?: Array<{
    id: string;
    properties?: TProperties;
    createdAt?: string;
    updatedAt?: string;
  }>;
};

type HubSpotPipeline = {
  id: string;
  label: string;
  stages?: Array<{ id: string; label: string }>;
};

const dataDirectory = path.join(process.cwd(), "..", "data");
const leadsFilePath = path.join(dataDirectory, "leads.json");
const leadsReviewFilePath = path.join(dataDirectory, "leads-review.md");
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY;
const HUBSPOT_PIPELINE_ID = process.env.HUBSPOT_PIPELINE_ID;
const HUBSPOT_STAGE_ID = process.env.HUBSPOT_STAGE_NEW_LEAD || process.env.HUBSPOT_STAGE_INTAKE_SUBMITTED;
const HUBSPOT_PIPELINE_LABEL = process.env.HUBSPOT_PIPELINE_LABEL || "VizBiz Pipeline";
const HUBSPOT_STAGE_LABEL = process.env.HUBSPOT_STAGE_LABEL || "New Lead";
const HUBSPOT_DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SEND_FROM = "vizbiz.ai@gmail.com";

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function extractDomain(value: string) {
  try {
    return new URL(normalizeWebsiteUrl(value)).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function compactProperties<T extends Record<string, string | undefined>>(properties: T) {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined && value !== "")) as Record<string, string>;
}

function buildSnapshotSummary(input: LeadInput): StructuredSnapshotSummary {
  const snapshot = buildMiniSnapshot({
    dealershipName: input.dealershipName,
    websiteUrl: input.website,
    cityMarket: input.city,
    competitor: input.competitors,
  });

  return {
    appeared_in_prompts: `${snapshot.appearedCount} of 7 prompts`,
    visibility_status: snapshot.statusBand,
    service_visibility: snapshot.serviceVisibility,
    competitor_summary: snapshot.competitorLine,
    competitor_categories: snapshot.competitorCategories.join(", "),
    why_it_matters: snapshot.whyThisMatters,
    next_step: snapshot.recommendedNextStep,
  };
}

function buildResearchBriefText(input: LeadInput) {
  const brief = buildResearchBrief(input);

  return [
    `Status: ${brief.status}`,
    `Note: ${brief.note}`,
  ].join("\n");
}

function buildPlainTextEmailDraft(input: LeadInput, snapshotSummary: StructuredSnapshotSummary) {
  const bookingUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    "https://calendly.com/vizbiz-ai/avi-assessment";

  const greetingName = input.name.split(" ")[0] || input.name;
  const competitorName = input.competitors?.split(",")[0]?.trim() || "Nearby competitors";

  return {
    subject: `Your AI Visibility Mini Snapshot — ${input.dealershipName}`,
    sendFrom: DEFAULT_SEND_FROM,
    body: [
      `Hi ${greetingName},`,
      "",
      `Here's your AI Visibility Mini Snapshot for ${input.dealershipName} in ${input.city}.`,
      "",
      "---",
      "WHAT WE FOUND",
      "---",
      "",
      `Appeared in: ${snapshotSummary.appeared_in_prompts}`,
      `Overall AI Visibility: ${snapshotSummary.visibility_status}`,
      `Service Department Visibility: ${snapshotSummary.service_visibility}`,
      "",
      `${competitorName} may be appearing more often in AI-driven search for your market.`,
      "",
      `Likely signals: ${snapshotSummary.competitor_categories}.`,
      "",
      "---",
      "WHAT'S NEXT",
      "---",
      "",
      "On a short review call, we'll walk through:",
      `- where ${input.dealershipName} is showing up well`,
      "- where competitors may be ahead",
      "- the 2-3 fastest moves to improve visibility",
      "",
      `Book your free 15-minute review: ${bookingUrl}`,
      "",
      "Best,",
      "Alex",
      "VizBiz.ai | vizbiz.ai@gmail.com",
    ].join("\n"),
  };
}

function buildSnapshotNoteBody(input: LeadInput, snapshotSummary?: StructuredSnapshotSummary) {
  if (!snapshotSummary) return undefined;

  const emailDraft = buildPlainTextEmailDraft(input, snapshotSummary);
  const researchBrief = buildResearchBriefText(input);
  const snapshotDate = new Date(input.timestamp || Date.now()).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const competitorName = input.competitors?.split(",")[0]?.trim() || "Nearby competitors";
  const emailHtmlData: SnapshotEmailData = {
    dealershipName: input.dealershipName,
    contactName: input.name,
    city: input.city,
    snapshotDate,
    appearedIn: snapshotSummary.appeared_in_prompts,
    overallVisibility: snapshotSummary.visibility_status,
    serviceDeptVisibility: snapshotSummary.service_visibility,
    competitorName,
    competitorCategories: snapshotSummary.competitor_categories,
    bookingUrl:
      process.env.NEXT_PUBLIC_CALENDLY_URL ||
      "https://calendly.com/vizbiz-ai/avi-assessment",
  };
  const emailHtml = buildSnapshotEmailHtml(emailHtmlData).slice(0, 10000);

  return [
    `Intake submission for ${input.dealershipName}`,
    "",
    `Contact: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Website: ${normalizeWebsiteUrl(input.website) || "Not provided"}`,
    `City: ${input.city}`,
    `Competitors: ${input.competitors || "Not provided"}`,
    "",
    "Snapshot summary:",
    `- Appeared in prompts: ${snapshotSummary.appeared_in_prompts}`,
    `- Visibility status: ${snapshotSummary.visibility_status}`,
    `- Service visibility: ${snapshotSummary.service_visibility}`,
    `- Competitor summary: ${snapshotSummary.competitor_summary}`,
    `- Competitor categories: ${snapshotSummary.competitor_categories}`,
    `- Why it matters: ${snapshotSummary.why_it_matters}`,
    `- Next step: ${snapshotSummary.next_step}`,
    "",
    `Lead source: ${input.source || "snapshot funnel"}`,
    `Original CTA: ${input.originalCta || "Not provided"}`,
    `Original page: ${input.originalPage || "Not provided"}`,
    `Intake timestamp: ${input.timestamp}`,
    "",
    "[EMAIL DRAFT]",
    `Subject: ${emailDraft.subject}`,
    `Send from: ${emailDraft.sendFrom}`,
    "Body:",
    emailDraft.body,
    "",
    "[EMAIL HTML]",
    emailHtml,
    "",
    "[RESEARCH BRIEF]",
    researchBrief,
  ].join("\n");
}

async function readExistingLeads(): Promise<StoredLead[]> {
  try {
    const raw = await readFile(leadsFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildLeadReviewMarkdown(leads: StoredLead[]) {
  const blocks = leads
    .slice()
    .reverse()
    .map((lead, index) => {
      const snapshot = lead.snapshot_summary;
      return [
        `## ${index + 1}. ${lead.dealership_name}`,
        `- Timestamp: ${lead.timestamp}`,
        `- Website: ${lead.website}`,
        `- City: ${lead.city}`,
        `- Contact: ${lead.name}`,
        `- Email: ${lead.email}`,
        `- Competitors: ${lead.competitors || "Not provided"}`,
        `- Booking link clicked: ${lead.booking_link_clicked ? "Yes" : "Not tracked yet"}`,
        `- Snapshot summary:`,
        `  - Appeared in prompts: ${snapshot?.appeared_in_prompts || "Not available"}`,
        `  - Visibility status: ${snapshot?.visibility_status || "Not available"}`,
        `  - Service visibility: ${snapshot?.service_visibility || "Not available"}`,
        `  - Competitor summary: ${snapshot?.competitor_summary || "Not available"}`,
        `  - Competitor categories: ${snapshot?.competitor_categories || "Not available"}`,
        `  - Why it matters: ${snapshot?.why_it_matters || "Not available"}`,
        `  - Next step: ${snapshot?.next_step || "Not available"}`,
      ].join("\n");
    });

  return [`# VizBiz Lead Review`, "", ...blocks].join("\n\n") + "\n";
}

async function storeLeadLocally(lead: StoredLead) {
  if (process.env.NODE_ENV === "production") {
    console.info("[lead] skipping local file backup in production");
    return;
  }

  await mkdir(dataDirectory, { recursive: true });
  const existing = await readExistingLeads();
  existing.push(lead);
  await writeFile(leadsFilePath, JSON.stringify(existing, null, 2) + "\n", "utf8");
  await writeFile(leadsReviewFilePath, buildLeadReviewMarkdown(existing), "utf8");
}

function buildHubSpotContactProperties(input: LeadInput, _snapshotSummary?: StructuredSnapshotSummary) {
  return compactProperties({
    firstname: input.name.split(" ")[0] || input.name,
    lastname: input.name.split(" ").slice(1).join(" ") || "Lead",
    email: input.email,
    phone: input.phone || undefined,
    company: input.dealershipName,
    website: normalizeWebsiteUrl(input.website) || undefined,
    city: input.city,
  });
}

function buildHubSpotCompanyProperties(input: LeadInput) {
  const domain = extractDomain(input.website);

  return compactProperties({
    name: input.dealershipName,
    domain: domain || undefined,
    website: normalizeWebsiteUrl(input.website) || undefined,
    city: input.city,
  });
}

function buildHubSpotDealProperties(input: LeadInput, pipelineId: string, stageId: string) {
  const closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    dealname: `${input.dealershipName} - AI Visibility`,
    pipeline: pipelineId,
    dealstage: stageId,
    closedate: closeDate,
  };
}

async function hubspotFetch<T>(pathName: string, init: RequestInit): Promise<T> {
  const response = await fetch(`https://api.hubapi.com${pathName}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${HUBSPOT_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HubSpot ${pathName} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function searchHubSpotObject<TProperties extends Record<string, string> = Record<string, string>>(
  objectType: Exclude<HubSpotObjectType, "notes">,
  body: Record<string, unknown>,
) {
  return hubspotFetch<HubSpotSearchResponse<TProperties>>(`/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function associateHubSpotObjects(
  fromObjectType: Exclude<HubSpotObjectType, "notes">,
  fromObjectId: string,
  toObjectType: HubSpotObjectType,
  toObjectId: string,
) {
  await hubspotFetch(`/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/default/${toObjectType}/${toObjectId}`, {
    method: "PUT",
    body: JSON.stringify([]),
  });
}

async function getDealPipelineConfig() {
  if (HUBSPOT_PIPELINE_ID && HUBSPOT_STAGE_ID) {
    return { pipelineId: HUBSPOT_PIPELINE_ID, stageId: HUBSPOT_STAGE_ID };
  }

  const pipelines = await hubspotFetch<{ results?: HubSpotPipeline[] }>("/crm/v3/pipelines/deals", {
    method: "GET",
  });

  const pipeline = pipelines.results?.find((item) => item.label === HUBSPOT_PIPELINE_LABEL);
  if (!pipeline) {
    throw new Error(`HubSpot deal pipeline not found: ${HUBSPOT_PIPELINE_LABEL}`);
  }

  const stage = pipeline.stages?.find((item) => item.label === HUBSPOT_STAGE_LABEL);
  if (!stage) {
    throw new Error(`HubSpot deal stage not found: ${HUBSPOT_STAGE_LABEL}`);
  }

  return { pipelineId: pipeline.id, stageId: stage.id };
}

async function upsertHubSpotContact(input: LeadInput, snapshotSummary?: StructuredSnapshotSummary) {
  const properties = buildHubSpotContactProperties(input, snapshotSummary);

  const existing = await searchHubSpotObject("contacts", {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "email",
            operator: "EQ",
            value: input.email,
          },
        ],
      },
    ],
    limit: 1,
  });

  const existingId = existing.results?.[0]?.id;

  if (existingId) {
    await hubspotFetch(`/crm/v3/objects/contacts/${existingId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return { contactId: existingId, created: false };
  }

  const created = await hubspotFetch<{ id: string }>("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return { contactId: created.id, created: true };
}

async function upsertHubSpotCompany(input: LeadInput) {
  const properties = buildHubSpotCompanyProperties(input);
  const domain = extractDomain(input.website);

  const existingByDomain = domain
    ? await searchHubSpotObject("companies", {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "domain",
                operator: "EQ",
                value: domain,
              },
            ],
          },
        ],
        limit: 1,
      })
    : undefined;

  const existingDomainId = existingByDomain?.results?.[0]?.id;
  if (existingDomainId) {
    await hubspotFetch(`/crm/v3/objects/companies/${existingDomainId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return { companyId: existingDomainId, created: false };
  }

  const existingByName = await searchHubSpotObject("companies", {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "name",
            operator: "EQ",
            value: input.dealershipName,
          },
        ],
      },
    ],
    limit: 1,
  });

  const existingNameId = existingByName.results?.[0]?.id;
  if (existingNameId) {
    await hubspotFetch(`/crm/v3/objects/companies/${existingNameId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return { companyId: existingNameId, created: false };
  }

  const created = await hubspotFetch<{ id: string }>("/crm/v3/objects/companies", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return { companyId: created.id, created: true };
}

async function findRecentExistingDeal(input: LeadInput) {
  const duplicateThreshold = new Date(Date.now() - HUBSPOT_DUPLICATE_WINDOW_MS).toISOString();
  const dealName = `${input.dealershipName} - AI Visibility`;

  const existing = await searchHubSpotObject<{ dealname?: string; createdate?: string }>("deals", {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "dealname",
            operator: "EQ",
            value: dealName,
          },
          {
            propertyName: "createdate",
            operator: "GTE",
            value: duplicateThreshold,
          },
        ],
      },
    ],
    properties: ["dealname", "createdate"],
    limit: 5,
    sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
  });

  return existing.results?.[0]?.id;
}

async function createHubSpotDeal(
  input: LeadInput,
  _snapshotSummary: StructuredSnapshotSummary | undefined,
  pipelineId: string,
  stageId: string,
) {
  const duplicateId = await findRecentExistingDeal(input);
  if (duplicateId) {
    console.info("[lead] HubSpot deal already exists for recent submission", {
      dealId: duplicateId,
      email: input.email,
      dealership: input.dealershipName,
    });
    return { dealId: duplicateId, created: false };
  }

  const properties = buildHubSpotDealProperties(input, pipelineId, stageId);
  const created = await hubspotFetch<{ id: string }>("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return { dealId: created.id, created: true };
}

async function createHubSpotNote(noteBody: string | undefined) {
  if (!noteBody) return undefined;

  return hubspotFetch<{ id: string }>("/crm/v3/objects/notes", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString(),
      },
    }),
  });
}

async function sendToHubSpot(input: LeadInput, snapshotSummary?: StructuredSnapshotSummary) {
  const { pipelineId, stageId } = await getDealPipelineConfig();
  const noteBody = buildSnapshotNoteBody(input, snapshotSummary);

  const contactProperties = buildHubSpotContactProperties(input, snapshotSummary);
  const { contactId, created: contactCreated } = await upsertHubSpotContact(input, snapshotSummary);
  console.info("[lead] HubSpot contact linked", {
    contactId,
    email: input.email,
    created: contactCreated,
    storedFields: Object.keys(contactProperties),
  });

  const companyProperties = buildHubSpotCompanyProperties(input);
  const { companyId, created: companyCreated } = await upsertHubSpotCompany(input);
  console.info("[lead] HubSpot company linked", {
    companyId,
    dealership: input.dealershipName,
    created: companyCreated,
    storedFields: Object.keys(companyProperties),
  });

  const dealProperties = buildHubSpotDealProperties(input, pipelineId, stageId);
  const { dealId, created: dealCreated } = await createHubSpotDeal(input, snapshotSummary, pipelineId, stageId);
  console.info("[lead] HubSpot deal created", {
    dealId,
    dealership: input.dealershipName,
    created: dealCreated,
    storedFields: Object.keys(dealProperties),
    pipelineId,
    stageId,
  });

  await associateHubSpotObjects("contacts", contactId, "companies", companyId);
  await associateHubSpotObjects("contacts", contactId, "deals", dealId);
  await associateHubSpotObjects("companies", companyId, "deals", dealId);

  const note = await createHubSpotNote(noteBody);
  if (note?.id) {
    await associateHubSpotObjects("deals", dealId, "notes", note.id);
    await associateHubSpotObjects("contacts", contactId, "notes", note.id);
    await associateHubSpotObjects("companies", companyId, "notes", note.id);
    console.info("[lead] HubSpot note attached", {
      noteId: note.id,
      attachedTo: ["deal", "contact", "company"],
      bodyLength: noteBody?.length || 0,
    });
  }

  console.info("[lead] stored in HubSpot", {
    contactId,
    companyId,
    dealId,
    noteId: note?.id,
    email: input.email,
  });
}

export async function handleNewLead(data: LeadInput) {
  console.info("[lead] lead received", {
    dealership: data.dealershipName,
    email: data.email,
    city: data.city,
  });

  const snapshotSummary = buildSnapshotSummary(data);
  console.info("[lead] snapshot generated", snapshotSummary);

  try {
    await storeLeadLocally({
      timestamp: data.timestamp,
      dealership_name: data.dealershipName,
      website: normalizeWebsiteUrl(data.website),
      city: data.city,
      name: data.name,
      email: data.email,
      competitors: data.competitors || "",
      booking_link_clicked: false,
      snapshot_summary: snapshotSummary,
    });
    console.info("[lead] stored locally", { file: leadsFilePath });
  } catch (localError) {
    console.warn("[lead] local backup failed (non-fatal)", localError);
  }

  if (HUBSPOT_TOKEN) {
    try {
      await sendToHubSpot(data, snapshotSummary);
    } catch (error) {
      console.error("[lead] HubSpot sync failed", error);
      throw error;
    }
  }

  try {
    const bookingUrl =
      process.env.NEXT_PUBLIC_CALENDLY_URL ||
      "https://calendly.com/vizbiz-ai/avi-assessment";
    const competitorName = data.competitors?.split(",")[0]?.trim() || "Nearby competitors";

    const emailData: SnapshotEmailData = {
      dealershipName: data.dealershipName,
      contactName: data.name,
      city: data.city,
      snapshotDate: new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      appearedIn: snapshotSummary.appeared_in_prompts,
      overallVisibility: snapshotSummary.visibility_status,
      serviceDeptVisibility: snapshotSummary.service_visibility,
      competitorName,
      competitorCategories: snapshotSummary.competitor_categories,
      bookingUrl,
    };

    const html = buildSnapshotEmailHtml(emailData);

    if (process.env.NODE_ENV !== "production") {
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const slug = data.dealershipName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const emailDraftsDir = path.join(process.cwd(), "..", "data", "email-drafts");
      await mkdir(emailDraftsDir, { recursive: true });

      const baseName = `${timestamp}-${slug}`;
      const htmlPath = path.join(emailDraftsDir, `${baseName}.html`);
      const jsonPath = path.join(emailDraftsDir, `${baseName}.json`);

      await writeFile(htmlPath, html, "utf8");
      await writeFile(
        jsonPath,
        JSON.stringify(
          {
            to: data.email,
            subject: `Your AI Visibility Mini Snapshot — ${data.dealershipName}`,
            dealershipName: data.dealershipName,
            contactName: data.name,
            generatedAt: new Date().toISOString(),
            status: "draft",
          },
          null,
          2,
        ) + "\n",
        "utf8",
      );

      console.info("[lead] draft email written", { htmlPath, jsonPath, htmlLength: html.length });
    } else {
      console.info("[lead] email draft HTML generated for production-safe note storage", {
        htmlLength: html.length,
      });
    }
  } catch (draftError) {
    console.warn("[lead] draft email generation failed (non-fatal)", draftError);
  }

  return snapshotSummary;
}
