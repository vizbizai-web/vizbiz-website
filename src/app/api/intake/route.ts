import { NextResponse } from "next/server";
import { handleNewLead } from "@/lib/lead-handler";

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
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

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

  try {
    const snapshotSummary = await handleNewLead({
      timestamp: new Date().toISOString(),
      dealershipName: cleanPayload.dealershipName,
      website: cleanPayload.websiteUrl,
      city: cleanPayload.cityMarket,
      name: cleanPayload.name,
      email: cleanPayload.email,
      competitors: cleanPayload.competitor,
      phone: cleanPayload.phone,
      source: cleanPayload.source,
      originalCta: cleanPayload.originalCta,
      originalPage: cleanPayload.originalPage,
    });

    const thankYouParams = new URLSearchParams({
      submitted: "1",
      appeared: snapshotSummary.appeared_in_prompts.split(" ")[0],
      band: snapshotSummary.visibility_status.toLowerCase(),
      service: snapshotSummary.service_visibility.toLowerCase().replace(/\s+/g, "-"),
      competitor: cleanPayload.competitor?.trim() || "nearby competitors",
      hubspot: process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY ? "ready" : "pending",
    });

    return NextResponse.redirect(new URL(`/thank-you?${thankYouParams.toString()}`, request.url), 303);
  } catch (error) {
    console.error("[intake] lead handling failed", error);
    return NextResponse.redirect(new URL("/thank-you?submitted=1&hubspot=pending", request.url), 303);
  }
}
