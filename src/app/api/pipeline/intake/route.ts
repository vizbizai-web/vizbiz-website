/**
 * Pipeline Phase 1: INTAKE — Fast (< 3s)
 *
 * Validates input, writes to Google Sheets, returns immediately.
 * Fires preflight in the background.
 */

import { NextResponse } from "next/server";
import { appendLead, isSheetsConfigured } from "@/lib/google-sheets";
import { sendLeadAlertTelegram } from "@/lib/telegram-alerts";

type IntakePayload = {
  name: string;
  dealershipName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  cityMarket: string;
  competitor?: string;
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

  const cleanPayload: IntakePayload = {
    name: payload.name.trim(),
    dealershipName: payload.dealershipName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    websiteUrl: normalizeWebsiteUrl(payload.websiteUrl),
    cityMarket: payload.cityMarket.trim(),
    competitor: payload.competitor?.trim() || undefined,
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

  // Write to Sheets immediately — fast path
  let leadId = "";
  let sheetsOk = false;

  if (isSheetsConfigured()) {
    try {
      leadId = await appendLead({
        timestamp: new Date().toISOString(),
        dealershipName: cleanPayload.dealershipName,
        website: cleanPayload.websiteUrl,
        city: cleanPayload.cityMarket,
        contactName: cleanPayload.name,
        email: cleanPayload.email,
        phone: cleanPayload.phone,
        competitor: cleanPayload.competitor || "",
        snapshotAppeared: "",
        visibilityBand: "",
        serviceVisibility: "",
        status: "new",
        researchStatus: "pending",
        emailSentAt: "",
        notes: `Source: ${cleanPayload.source}. CTA: ${cleanPayload.originalCta || "direct"}. Page: ${cleanPayload.originalPage || "/intake"}.${cleanPayload.utmSource ? ` UTM: ${cleanPayload.utmSource}/${cleanPayload.utmMedium || "none"}/${cleanPayload.utmCampaign || "none"}` : ""}${cleanPayload.referrer ? ` Referrer: ${cleanPayload.referrer}` : ""}${cleanPayload.timezone ? ` TZ: ${cleanPayload.timezone} (UTC${cleanPayload.utcOffset ? (parseInt(cleanPayload.utcOffset) > 0 ? "-" : "+") + String(Math.abs(parseInt(cleanPayload.utcOffset) / 60)).padStart(2, "0") + ":" + String(Math.abs(parseInt(cleanPayload.utcOffset) % 60)).padStart(2, "0") : ""})` : ""}${cleanPayload.locale ? ` Locale: ${cleanPayload.locale}` : ""}.`,
        source: cleanPayload.source,
      });
      sheetsOk = true;
      console.info("[pipeline/intake] lead stored in Sheets", { leadId, email: cleanPayload.email });
    } catch (error) {
      console.error("[pipeline/intake] Sheets write failed", error);
    }
  } else {
    console.warn("[pipeline/intake] Google Sheets not configured — lead NOT stored");
  }

  // Send Telegram alert (non-blocking)
  sendLeadAlertTelegram({
    leadId,
    dealershipName: cleanPayload.dealershipName,
    contactName: cleanPayload.name,
    email: cleanPayload.email,
    city: cleanPayload.cityMarket,
    website: cleanPayload.websiteUrl,
    appeared: "Pending",
    band: "Pending",
    sheetsOk,
    utmSource: cleanPayload.utmSource,
    utmMedium: cleanPayload.utmMedium,
    utmCampaign: cleanPayload.utmCampaign,
    referrer: cleanPayload.referrer,
  }).catch((err) => {
    console.error("[pipeline/intake] Telegram alert failed", err);
  });

  // Fire preflight in background — don't await
  if (sheetsOk && leadId) {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    fetch(`${baseUrl}/api/pipeline/preflight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    }).catch((err) => {
      console.error("[pipeline/intake] preflight trigger failed (non-blocking):", err);
    });
  }

  // Return immediately — fast response
  return NextResponse.json({
    success: true,
    leadId,
    redirectUrl: `/report/${leadId}`,
  });
}
