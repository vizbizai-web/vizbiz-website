/**
 * Pipeline Phase 1: INTAKE — Fast (< 3s)
 *
 * Validates input, writes to the primary CRM, returns immediately.
 * Fires preflight in the background.
 */

import { NextResponse } from "next/server";
import { appendLead, isSheetsConfigured } from "@/lib/google-sheets";
import { sendLeadAlertTelegram } from "@/lib/telegram-alerts";
import { buildPostIntakeRedirect } from "@/lib/funnel-logic";

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
    name: payload.name.trim(),
    dealershipName: payload.dealershipName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    websiteUrl: normalizeWebsiteUrl(payload.websiteUrl),
    cityMarket: payload.cityMarket.trim(),
    competitor: payload.competitor?.trim() || undefined,
    competitor2: payload.competitor2?.trim() || undefined,
    competitorMode,
    selectedPlan: payload.selectedPlan?.trim() || undefined,
    source: payload.source?.trim() || "snapshot funnel",
    originalCta: payload.originalCta?.trim() || undefined,
    originalPage: payload.originalPage?.trim() || undefined,
    utmSource: payload.utm_source?.trim() || undefined,
    utmMedium: payload.utm_medium?.trim() || undefined,
    utmCampaign: payload.utm_campaign?.trim() || undefined,
    utmTerm: payload.utm_term?.trim() || undefined,
    utmContent: payload.utm_content?.trim() || undefined,
    referrer: payload.referrer?.trim() || undefined,
    timezone: payload.timezone?.trim() || undefined,
    utcOffset: payload.utcOffset?.trim() || undefined,
    locale: payload.locale?.trim() || undefined,
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
        notes: `Source: ${cleanPayload.source}. CTA: ${cleanPayload.originalCta || "direct"}. Page: ${cleanPayload.originalPage || "/intake"}.${cleanPayload.utmSource ? ` UTM: ${cleanPayload.utmSource}/${cleanPayload.utmMedium || "none"}/${cleanPayload.utmCampaign || "none"}` : ""}${cleanPayload.referrer ? ` Referrer: ${cleanPayload.referrer}` : ""}${cleanPayload.timezone ? ` TZ: ${cleanPayload.timezone} (UTC${cleanPayload.utcOffset ? (parseInt(cleanPayload.utcOffset) > 0 ? "-" : "+") + String(Math.abs(parseInt(cleanPayload.utcOffset) / 60)).padStart(2, "0") + ":" + String(Math.abs(parseInt(cleanPayload.utcOffset) % 60)).padStart(2, "0") : ""})` : ""}${cleanPayload.locale ? ` Locale: ${cleanPayload.locale}` : ""} | CompetitorMode: ${cleanPayload.competitorMode}.`,
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

  // Fire preflight in background only after the lead is durably stored.
  if (leadId) {
    const requestOrigin = new URL(request.url).origin;
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : requestOrigin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    fetch(`${baseUrl}/api/pipeline/preflight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    }).catch((err) => {
      console.error("[pipeline/intake] preflight trigger failed (non-blocking):", err);
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
