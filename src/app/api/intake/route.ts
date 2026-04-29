import { NextResponse } from "next/server";
import { appendLead, isSheetsConfigured } from "@/lib/google-sheets";
import { buildMiniSnapshot } from "@/lib/mini-snapshot";
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
    competitor: payload.competitor?.trim() || undefined,
    selectedPlan: payload.selectedPlan?.trim() || undefined,
    source: payload.source?.trim() || "snapshot funnel",
    originalCta: payload.originalCta?.trim() || undefined,
    originalPage: payload.originalPage?.trim() || undefined,
  };

  // Generate mini snapshot
  const snapshot = buildMiniSnapshot({
    dealershipName: cleanPayload.dealershipName,
    websiteUrl: cleanPayload.websiteUrl,
    cityMarket: cleanPayload.cityMarket,
    competitor: cleanPayload.competitor,
  });

  const snapshotSummary = {
    appeared: `${snapshot.appearedCount} of 7 prompts`,
    band: snapshot.statusBand,
    service: snapshot.serviceVisibility,
  };

  // Store in Google Sheets CRM
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
        snapshotAppeared: snapshotSummary.appeared,
        visibilityBand: snapshotSummary.band,
        serviceVisibility: snapshotSummary.service,
        status: "new",
        researchStatus: "pending",
        emailSentAt: "",
        notes: `Source: ${cleanPayload.source}. CTA: ${cleanPayload.originalCta || "direct"}. Page: ${cleanPayload.originalPage || "/intake"}`,
        source: cleanPayload.source,
      });
      sheetsOk = true;
      console.info("[intake] lead stored in Sheets", { leadId, email: cleanPayload.email });
    } catch (error) {
      console.error("[intake] Sheets write failed", error);
      // Continue — don't block the user experience
    }
  } else {
    console.warn("[intake] Google Sheets not configured — lead NOT stored");
  }

  // Send Telegram alert to Alex
  try {
    await sendLeadAlertTelegram({
      leadId,
      dealershipName: cleanPayload.dealershipName,
      contactName: cleanPayload.name,
      email: cleanPayload.email,
      city: cleanPayload.cityMarket,
      website: cleanPayload.websiteUrl,
      appeared: snapshotSummary.appeared,
      band: snapshotSummary.band,
      sheetsOk,
    });
  } catch (error) {
    console.error("[intake] Telegram alert failed", error);
    // Non-blocking
  }

  // Redirect to thank-you page with snapshot results
  const thankYouParams = new URLSearchParams({
    submitted: "1",
    appeared: snapshotSummary.appeared.split(" ")[0],
    band: snapshotSummary.band.toLowerCase(),
    service: snapshotSummary.service.toLowerCase().replace(/\s+/g, "-"),
    competitor: cleanPayload.competitor?.trim() || "nearby competitors",
    crm: sheetsOk ? "captured" : "pending",
  });

  return NextResponse.redirect(new URL(`/thank-you?${thankYouParams.toString()}`, request.url), 303);
}
