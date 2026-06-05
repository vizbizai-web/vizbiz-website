/**
 * Manual Trigger: Queue Multiple Leads for Rerun
 * 
 * Quick endpoint for operators to queue leads.
 * Can queue 1 or many leads at once.
 * 
 * POST /api/trigger-rerun
 * Body: { leadIds: string[] } or { leadId: string }
 * Response: { success: true, queued: number, alreadyQueued: number, failed: number }
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLeadStatus } from "@/lib/google-sheets";

export const maxDuration = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const leadIds = body?.leadIds || (body?.leadId ? [body.leadId] : []);

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provide leadId or leadIds array" },
        { status: 400 }
      );
    }

    const results = {
      queued: 0,
      alreadyQueued: 0,
      notFound: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const leadId of leadIds) {
      try {
        const lead = await getLeadByLeadId(leadId);
        
        if (!lead) {
          results.notFound++;
          results.details.push({ leadId, status: "not_found" });
          continue;
        }

        if (lead.status === "rerun_queued" || lead.status === "rerun_processing") {
          results.alreadyQueued++;
          results.details.push({ leadId, status: "already_queued", currentStatus: lead.status });
          continue;
        }

        await updateLeadStatus(leadId, {
          status: "rerun_queued",
          notes: `Rerun manually triggered at ${new Date().toISOString()}. Previous status: ${lead.status}`,
        });

        results.queued++;
        results.details.push({ leadId, status: "queued", name: lead.dealershipName });

      } catch (e) {
        results.failed++;
        results.details.push({ leadId, status: "error", error: e instanceof Error ? e.message : "Unknown" });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRequested: leadIds.length,
        queued: results.queued,
        alreadyQueued: results.alreadyQueued,
        notFound: results.notFound,
        failed: results.failed,
      },
      details: results.details,
      nextStep: "Reruns will process automatically via cron (every 5 min). Check Telegram for alerts.",
    });

  } catch (error) {
    console.error("[trigger-rerun] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger reruns" },
      { status: 500 }
    );
  }
}
