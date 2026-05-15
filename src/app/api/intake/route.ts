import { NextResponse } from "next/server";
import { appendLead, isSheetsConfigured } from "@/lib/google-sheets";
import { buildMiniSnapshot } from "@/lib/mini-snapshot";
import { sendLeadAlertTelegram } from "@/lib/telegram-alerts";
import { preflightScan } from "@/lib/preflight-engine";

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
  // Attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
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
    utmSource: payload.utm_source?.trim() || undefined,
    utmMedium: payload.utm_medium?.trim() || undefined,
    utmCampaign: payload.utm_campaign?.trim() || undefined,
    utmTerm: payload.utm_term?.trim() || undefined,
    utmContent: payload.utm_content?.trim() || undefined,
    referrer: payload.referrer?.trim() || undefined,
  };

  // Generate mini snapshot (now returns honest messaging instead of fake scores)
  const snapshot = buildMiniSnapshot({
    dealershipName: cleanPayload.dealershipName,
    websiteUrl: cleanPayload.websiteUrl,
    cityMarket: cleanPayload.cityMarket,
    competitor: cleanPayload.competitor,
  });

  const snapshotSummary = {
    appeared: "0 of 7 prompts", // Honest: we haven't run the real analysis yet
    band: "Pending",
    service: "Pending",
  };

  // Analyze AI readiness and niche BEFORE storing — do this regardless of Sheets config
  const aiReport = isSheetsConfigured() ? await preflightScan(cleanPayload.websiteUrl) : { 
    niche: "local_business", nicheLabel: "Local Business", pricingInfo: null, valueProposition: "",
    contentQuality: "low" as const, hasLlmsTxt: false, hasSchema: false, 
    aiReadinessScore: 0, estimatedRevenueGap: { low: 0, high: 0, currency: "USD" },
    businessType: "", targetAudience: "", services: [] as string[], siteLanguage: "English",
    searchLanguage: "English", market: "", searchLangCode: "en",
    suggestedSearchQueries: [] as string[], competitorSearchQueries: [] as string[],
    socialLinks: { instagram: null, facebook: null, linkedin: null, twitter: null, tiktok: null, youtube: null },
    contactInfo: { emails: [] as string[], phones: [] as string[], address: null },
    schemaOrg: { types: [] as string[], name: null, aggregateRating: null, sameAs: [] as string[] },
    openGraph: { title: null, description: null, image: null },
    googleBusiness: { url: null, placeId: null },
  };
  
  const revGap = aiReport.estimatedRevenueGap;
  
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
        notes: `Source: ${cleanPayload.source}. CTA: ${cleanPayload.originalCta || "direct"}. Page: ${cleanPayload.originalPage || "/intake"}.${cleanPayload.utmSource ? ` UTM: ${cleanPayload.utmSource}/${cleanPayload.utmMedium || "none"}/${cleanPayload.utmCampaign || "none"}` : ""}${cleanPayload.referrer ? ` Referrer: ${cleanPayload.referrer}` : ""}. AI-Niche: ${aiReport.niche}. AI-Score: ${aiReport.aiReadinessScore} (LLMS:${aiReport.hasLlmsTxt}, Schema:${aiReport.hasSchema}). PREFLIGHT:${JSON.stringify({ niche: aiReport.niche, valueProposition: aiReport.valueProposition, pricingInfo: aiReport.pricingInfo, estimatedRevenueGap: aiReport.estimatedRevenueGap, aiReadinessScore: aiReport.aiReadinessScore, businessType: aiReport.businessType, targetAudience: aiReport.targetAudience, services: aiReport.services, siteLanguage: aiReport.siteLanguage, searchLanguage: aiReport.searchLanguage, market: aiReport.market, searchLangCode: aiReport.searchLangCode, suggestedSearchQueries: aiReport.suggestedSearchQueries, competitorSearchQueries: aiReport.competitorSearchQueries, socialLinks: aiReport.socialLinks, contactInfo: aiReport.contactInfo, schemaOrg: aiReport.schemaOrg, openGraph: aiReport.openGraph, googleBusiness: aiReport.googleBusiness })}`,
        source: cleanPayload.source,
      });
      sheetsOk = true;
      console.info("[intake] lead stored in Sheets", { leadId, email: cleanPayload.email, niche: aiReport.niche });
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

  // Fire research asynchronously — don't block the redirect
  if (sheetsOk && leadId) {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/process-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    }).then(() => {
      console.info('[intake] research triggered for lead', leadId);
    }).catch((err) => {
      console.error('[intake] research trigger failed (non-blocking):', err);
    });
  }

  // Redirect to thank-you page with snapshot results
  const thankYouParams = new URLSearchParams({
    submitted: "1",
    appeared: snapshotSummary.appeared.split(" ")[0],
    band: snapshotSummary.band.toLowerCase(),
    service: snapshotSummary.service.toLowerCase().replace(/\s+/g, "-"),
    competitor: cleanPayload.competitor?.trim() || "nearby competitors",
    crm: sheetsOk ? "captured" : "pending",
    score: aiReport.aiReadinessScore.toString(),
    llms: aiReport.hasLlmsTxt ? "1" : "0",
    schema: aiReport.hasSchema ? "1" : "0",
    niche: aiReport.niche,
    revLossMin: revGap.low.toString(),
    revLossMax: revGap.high.toString(),
    nicheLabel: encodeURIComponent(aiReport.nicheLabel),
    ...(leadId ? { lid: leadId } : {}),
  });

  return NextResponse.redirect(new URL(`/thank-you?${thankYouParams.toString()}`, request.url), 303);
}
