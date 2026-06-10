/**
 * Pipeline Phase 1: INTAKE — Fast (< 3s)
 *
 * Validates input, writes to the primary CRM, returns immediately.
 * Fires preflight in the background.
 */

import { after, NextResponse } from "next/server";
import { appendLead, isSheetsConfigured } from "@/lib/google-sheets";
import { sendLeadAlertTelegram } from "@/lib/telegram-alerts";
import { buildPostIntakeRedirect } from "@/lib/funnel-logic";
import { buildPipelineBaseUrl } from "@/lib/pipeline-url";
import { buildIntakeNotes, cleanIntakeBusinessCategory, cleanIntakeText } from "@/lib/intake-normalization";

type IntakePayload = {
  name: string;
  dealershipName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  cityMarket: string;
  competitor?: string;
  competitor2?: string;
  competitorMode?: string;
  businessCategory?: string;
  selectedPlan?: string;
  source: string;
  originalCta?: string;
  originalPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  timezone?: string;
  utcOffset?: string;
  locale?: string;
};

const requiredFields = [
  "name",
  "dealershipName",
  "email",
  "phone",
  "websiteUrl",
  "cityMarket",
] as const;

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function POST(request: Request) {
  // Support both JSON and FormData
  let payload: Record<string, string>;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    payload = Object.fromEntries(formData.entries()) as Record<string, string>;
  } else {
    payload = await request.json();
  }

  const missingField = requiredFields.find((field) => {
    const value = payload[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingField) {
    return NextResponse.json(
      { success: false, error: `Missing required field: ${missingField}` },
      { status: 400 }
    );
  }

  // Determine competitor mode
  const hasClientCompetitor = (payload.competitor?.trim() || payload.competitor2?.trim()) ? true : false;
  const competitorMode = hasClientCompetitor ? "client_provided" : "client_only";

  const cleanPayload: IntakePayload = {
    name: cleanIntakeText(payload.name),
    dealershipName: cleanIntakeText(payload.dealershipName),
    email: cleanIntakeText(payload.email).toLowerCase(),
    phone: cleanIntakeText(payload.phone),
    websiteUrl: normalizeWebsiteUrl(payload.websiteUrl),
    cityMarket: cleanIntakeText(payload.cityMarket),
    competitor: cleanIntakeText(payload.competitor) || undefined,
    competitor2: cleanIntakeText(payload.competitor2) || undefined,
    competitorMode,
    businessCategory: cleanIntakeBusinessCategory(payload.businessCategory || payload.niche || payload.industry || payload.category) || undefined,
    selectedPlan: cleanIntakeText(payload.selectedPlan) || undefined,
    source: cleanIntakeText(payload.source) || "snapshot funnel",
    originalCta: cleanIntakeText(payload.originalCta) || undefined,
    originalPage: cleanIntakeText(payload.originalPage) || undefined,
    utmSource: cleanIntakeText(payload.utm_source) || undefined,
    utmMedium: cleanIntakeText(payload.utm_medium) || undefined,
    utmCampaign: cleanIntakeText(payload.utm_campaign) || undefined,
    utmTerm: cleanIntakeText(payload.utm_term) || undefined,
    utmContent: cleanIntakeText(payload.utm_content) || undefined,
    referrer: cleanIntakeText(payload.referrer) || undefined,
    timezone: cleanIntakeText(payload.timezone) || undefined,
    utcOffset: cleanIntakeText(payload.utcOffset) || undefined,
    locale: cleanIntakeText(payload.locale) || undefined,
  };

  // Always generate a leadId upfront — even if Sheets fails, we have a reference
  let leadId = `VZB-${Date.now().toString(36).toUpperCase()}`;
  let dataStored = false;

  if (isSheetsConfigured()) {
    try {
      const crmLead = {
        timestamp: new Date().toISOString(),
        dealershipName: cleanPayload.dealershipName,
        website: cleanPayload.websiteUrl,
        city: cleanPayload.cityMarket,
        contactName: cleanPayload.name,
        email: cleanPayload.email,
        phone: cleanPayload.phone,
        competitor: [cleanPayload.competitor, cleanPayload.competitor2].filter(Boolean).join(", ") || "",
        snapshotAppeared: "",
        visibilityBand: "",
        serviceVisibility: "",
        status: "new",
        researchStatus: "pending",
        emailSentAt: "",
        notes: buildIntakeNotes({
          source: cleanPayload.source,
          originalCta: cleanPayload.originalCta,
          originalPage: cleanPayload.originalPage,
          businessCategory: cleanPayload.businessCategory,
          utmSource: cleanPayload.utmSource,
          utmMedium: cleanPayload.utmMedium,
          utmCampaign: cleanPayload.utmCampaign,
          referrer: cleanPayload.referrer,
          timezone: cleanPayload.timezone,
          utcOffset: cleanPayload.utcOffset,
          locale: cleanPayload.locale,
          competitorMode: cleanPayload.competitorMode,
        }),
        source: cleanPayload.source,
        originalCta: cleanPayload.originalCta,
        originalPage: cleanPayload.originalPage,
        utmSource: cleanPayload.utmSource,
        utmMedium: cleanPayload.utmMedium,
        utmCampaign: cleanPayload.utmCampaign,
        utmTerm: cleanPayload.utmTerm,
        utmContent: cleanPayload.utmContent,
        referrer: cleanPayload.referrer,
        timezone: cleanPayload.timezone,
        utcOffset: cleanPayload.utcOffset,
        locale: cleanPayload.locale,
      } as Parameters<typeof appendLead>[0] & Record<string, string | number | undefined>;

      leadId = await appendLead(crmLead);
      dataStored = true;
      console.info("[pipeline/intake] lead stored in CRM", { leadId, email: cleanPayload.email });
    } catch (error) {
      console.error("[pipeline/intake] CRM write failed", error);
    }
  } else {
    console.warn("[pipeline/intake] Supabase/CRM not configured — lead NOT stored");
  }

  // Send Telegram alert — MUST await on serverless (Vercel kills process after response)
  try {
    await sendLeadAlertTelegram({
      leadId,
      dealershipName: cleanPayload.dealershipName,
      contactName: cleanPayload.name,
      email: cleanPayload.email,
      city: cleanPayload.cityMarket,
      website: cleanPayload.websiteUrl,
      appeared: "Pending",
      band: "Pending",
      dataStored,
      utmSource: cleanPayload.utmSource,
      utmMedium: cleanPayload.utmMedium,
      utmCampaign: cleanPayload.utmCampaign,
      referrer: cleanPayload.referrer,
      competitorMode: cleanPayload.competitorMode,
      competitors: [cleanPayload.competitor, cleanPayload.competitor2].filter(Boolean).join(", ") || undefined,
    });
  } catch (err) {
    console.error("[pipeline/intake] Telegram alert failed", err);
  }

  if (!dataStored) {
    return NextResponse.json(
      { success: false, error: "CRM write failed; intake was not stored. Please try again." },
      { status: 503 }
    );
  }

  // Fire preflight after the response only after the lead is durably stored.
  // Plain fire-and-forget fetches are unreliable in Vercel serverless runtimes:
  // the invocation can freeze immediately after returning the intake response.
  if (leadId) {
    const baseUrl = buildPipelineBaseUrl(request.url);

    after(async () => {
      try {
        const response = await fetch(`${baseUrl}/api/pipeline/preflight/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId }),
        });
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error("[pipeline/intake] preflight trigger failed", { leadId, status: response.status, body: text.slice(0, 500) });
        }
      } catch (err) {
        console.error("[pipeline/intake] preflight trigger failed", err);
      }
    });
  }

  // Return immediately — fast response.
  // Do not expose a report link here: the evidence pipeline/quality gate must finish first.
  const redirectUrl = buildPostIntakeRedirect(leadId);

  return NextResponse.json({
    success: true,
    leadId,
    redirectUrl,
    reportReady: false,
  });
}
