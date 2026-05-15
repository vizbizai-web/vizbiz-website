/**
 * Vlad Review Endpoint
 *
 * Called by Vlad (COS) after reviewing research results.
 * Actions:
 *  - approve: Flip status from pending_review → approved → report goes live
 *  - hold: Keep pending_review, add notes about why
 *  - rerun: Reset to new so process-lead picks it up again
 *  - fix: Accept JSON patches to research data, then approve
 */

import { NextRequest, NextResponse } from "next/server";
import { getLeadByLeadId, updateLeadResearchResults, isSheetsConfigured } from "@/lib/google-sheets";
import { isJunkCompetitor } from "@/lib/junk-filter";
import { analyzeTopCompetitors } from "@/lib/competitor-analyzer";
import { sendReportReadyTelegram } from "@/lib/telegram-alerts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, action, notes, patches } = body as {
      leadId: string;
      action: "approve" | "hold" | "rerun" | "fix";
      notes?: string;
      patches?: Record<string, any>;
    };

    if (!leadId || !action) {
      return NextResponse.json({ success: false, error: "leadId and action required" }, { status: 400 });
    }

    if (!isSheetsConfigured()) {
      return NextResponse.json({ success: false, error: "Sheets not configured" }, { status: 500 });
    }

    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: `Lead ${leadId} not found` }, { status: 404 });
    }

    switch (action) {
      case "approve": {
        // Preserve existing notes (research data), just flip status
        const existingNotes = lead.notes || "";
        await updateLeadResearchResults(leadId, {
          status: "approved",
        });
        console.info(`[vlad-review] ✅ Approved ${leadId}: ${lead.dealershipName}`);

        // Trigger deep competitor analysis for approved leads (paid reports)
        try {
          const marker = "RESEARCH_DATA:";
          const rdIdx = existingNotes.indexOf(marker);
          if (rdIdx >= 0) {
            const rd = JSON.parse(existingNotes.slice(rdIdx + marker.length));
            const compResults = await analyzeTopCompetitors(
              rd.promptResults || [],
              rd.niche || 'local_business',
              3
            );
            if (compResults.length > 0) {
              console.info(`[vlad-review] Competitor analysis complete: ${compResults.length} profiles for ${leadId}`);
            }
          }
        } catch (compErr) {
          console.warn(`[vlad-review] Competitor analysis failed (non-blocking):`, compErr);
        }

        // Send secondary alert to Alex: report is live + email is ready
        try {
          const marker = "RESEARCH_DATA:";
          const rdIdx = existingNotes.indexOf(marker);
          let appearedCount = 0;
          let totalPrompts = 0;
          let statusBand = "Unknown";
          if (rdIdx >= 0) {
            try {
              const rd = JSON.parse(existingNotes.slice(rdIdx + marker.length));
              appearedCount = rd.appearedCount || 0;
              totalPrompts = rd.totalPrompts || 0;
              statusBand = rd.statusBand || "Unknown";
            } catch {}
          }
          const reportUrl = `https://vizbiz.ai/report/${leadId}`;
          await sendReportReadyTelegram({
            leadId,
            dealershipName: lead.dealershipName,
            contactName: lead.contactName || "there",
            email: lead.email,
            city: lead.city,
            reportUrl,
            appearedCount,
            totalPrompts,
            statusBand,
          });
        } catch (alertErr) {
          console.warn(`[vlad-review] Report-ready alert failed (non-blocking):`, alertErr);
        }

        return NextResponse.json({ success: true, action: "approved", leadId });
      }

      case "hold": {
        await updateLeadResearchResults(leadId, {
          status: "pending_review",
          notes: notes ? `VLAD_HOLD: ${notes}` : "VLAD_HOLD: Manual review needed",
        });
        console.info(`[vlad-review] 🚫 Held ${leadId}: ${notes || "no reason given"}`);
        return NextResponse.json({ success: true, action: "held", leadId });
      }

      case "rerun": {
        await updateLeadResearchResults(leadId, {
          status: "new",
          researchStatus: "pending",
          notes: notes ? `VLAD_RERUN: ${notes}` : "VLAD_RERUN: Requested re-research",
        });
        console.info(`[vlad-review] 🔄 Rerun requested for ${leadId}: ${notes || "no reason"}`);

        // Trigger re-processing (fire and forget)
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        fetch(`${baseUrl}/api/process-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
        }).catch(() => {});

        return NextResponse.json({ success: true, action: "rerun", leadId });
      }

      case "fix": {
        // Apply patches to research data in notes, then approve
        const notesContent = lead.notes || "";
        const marker = "RESEARCH_DATA:";
        const rdIdx = notesContent.indexOf(marker);

        if (rdIdx < 0) {
          return NextResponse.json({ success: false, error: "No RESEARCH_DATA found to patch" }, { status: 400 });
        }

        let rd;
        try {
          rd = JSON.parse(notesContent.slice(rdIdx + marker.length));
        } catch {
          return NextResponse.json({ success: false, error: "Corrupt RESEARCH_DATA" }, { status: 400 });
        }

        // Apply patches
        if (patches) {
          for (const [key, value] of Object.entries(patches)) {
            if (key !== 'stripJunkCompetitors') {
              rd[key] = value;
            }
          }
        }

        // Strip junk competitors from promptResults if requested
        if (patches?.stripJunkCompetitors) {
          const JUNK = [/./.source]; // kept for stripJunkCompetitors — actual check uses isJunkCompetitor
          rd.promptResults = rd.promptResults.map((p: any) => {
            if (p.competitorName && isJunkCompetitor(p.competitorName)) {
              return { ...p, competitorAppeared: false, competitorName: undefined };
            }
            return p;
          });
        }

        await updateLeadResearchResults(leadId, {
          status: "approved",
          notes: `RESEARCH_DATA:${JSON.stringify(rd)}`,
        });
        console.info(`[vlad-review] 🔧 Fixed + approved ${leadId}`);
        return NextResponse.json({ success: true, action: "fixed_and_approved", leadId });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("[vlad-review] Error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

// GET for quick status check
export async function GET(request: NextRequest) {
  const leadId = request.nextUrl.searchParams.get("leadId");
  if (!leadId) {
    return NextResponse.json({ success: false, error: "leadId required" }, { status: 400 });
  }

  const lead = await getLeadByLeadId(leadId);
  if (!lead) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    leadId,
    businessName: lead.dealershipName,
    status: lead.status,
    researchStatus: lead.researchStatus,
  });
}
