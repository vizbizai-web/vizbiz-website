/**
 * Pipeline Phase 2: PREFLIGHT (async, 30-60s)
 *
 * Scrapes site, extracts intelligence, LLM classification, SEO audit.
 * Updates Sheets, then fires research phase.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead, updateLeadResearchResults, isSheetsConfigured } from "@/lib/google-sheets";
import { preflightScan } from "@/lib/preflight-engine";

// Preflight takes 30-60s (Firecrawl scrape + LLM classification + SEO audit)
export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/preflight] Starting for ${leadId}`);

  try {
    // Get lead from Sheets
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    if (!lead.website) {
      return NextResponse.json({ success: false, error: "Lead has no website URL" }, { status: 400 });
    }

    // Update status to running
    await updateLead(leadId, { notes: `${lead.notes}\n[Preflight: running at ${new Date().toISOString()}]` });

    // Run preflight scan
    const preflightResult = await preflightScan(lead.website);

    // Update Sheets with preflight results
    await updateLead(leadId, {
      notes: `${lead.notes}\n[Preflight: complete. Niche: ${preflightResult.niche}, Score: ${preflightResult.aiReadinessScore}, Market: ${preflightResult.market}, Lang: ${preflightResult.searchLanguage}]`,
    });

    // Also update research results with enriched data
    // Store the full preflight JSON in notes for now (can add dedicated column later)
    const preflightJson = JSON.stringify({
      niche: preflightResult.niche,
      nicheLabel: preflightResult.nicheLabel,
      valueProposition: preflightResult.valueProposition,
      pricingInfo: preflightResult.pricingInfo,
      estimatedRevenueGap: preflightResult.estimatedRevenueGap,
      aiReadinessScore: preflightResult.aiReadinessScore,
      businessType: preflightResult.businessType,
      targetAudience: preflightResult.targetAudience,
      services: preflightResult.services,
      siteLanguage: preflightResult.siteLanguage,
      searchLanguage: preflightResult.searchLanguage,
      market: preflightResult.market,
      searchLangCode: preflightResult.searchLangCode,
      suggestedSearchQueries: preflightResult.suggestedSearchQueries,
      competitorSearchQueries: preflightResult.competitorSearchQueries,
      socialLinks: preflightResult.socialLinks,
      contactInfo: preflightResult.contactInfo,
      schemaOrg: preflightResult.schemaOrg,
      openGraph: preflightResult.openGraph,
      googleBusiness: preflightResult.googleBusiness,
      hasLlmsTxt: preflightResult.hasLlmsTxt,
      hasSchema: preflightResult.hasSchema,
      contentQuality: preflightResult.contentQuality,
      seoAudit: preflightResult.seoAudit ? {
        overallScore: preflightResult.seoAudit.overallScore,
        issues: preflightResult.seoAudit.issues.length,
        schemaTypes: preflightResult.seoAudit.schemaTypes,
      } : null,
    });

    // Use updateLeadResearchResults for the standard fields + notes with full JSON
    await updateLeadResearchResults(leadId, {
      notes: preflightJson,
    });

    console.info(`[pipeline/preflight] Complete for ${leadId}: niche=${preflightResult.niche}, score=${preflightResult.aiReadinessScore}`);

    // Fire research phase in background
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    fetch(`${baseUrl}/api/pipeline/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    }).catch((err) => {
      console.error(`[pipeline/preflight] research trigger failed for ${leadId}:`, err);
    });

    return NextResponse.json({ success: true, leadId, niche: preflightResult.niche, score: preflightResult.aiReadinessScore });
  } catch (error) {
    console.error(`[pipeline/preflight] Failed for ${leadId}:`, error);

    // Update status to failed
    try {
      const lead = await getLeadByLeadId(leadId);
      if (lead) {
        await updateLead(leadId, {
          notes: `${lead.notes}\n[Preflight: FAILED at ${new Date().toISOString()} — ${error instanceof Error ? error.message : String(error)}]`,
        });
      }
    } catch (updateErr) {
      console.error(`[pipeline/preflight] Failed to update error status:`, updateErr);
    }

    return NextResponse.json({ success: false, error: "Preflight failed", leadId }, { status: 500 });
  }
}
