/**
 * Cron Job: Process Queued Reruns
 * 
 * This endpoint is called by Vercel Cron or OpenClaw Cron.
 * It processes ONE lead at a time to avoid timeouts.
 * 
 * GET /api/cron/process-reruns
 * Returns: { success: true, processed: number, remaining: number }
 */

import { NextResponse } from "next/server";
import { getLeadsByStatus, updateLeadStatus, updateLeadResearchResults, getLeadByLeadId } from "@/lib/google-sheets";
import { preflightScan } from "@/lib/preflight-engine";
import { runResearch } from "@/lib/research-runner";
import { sendLeadAlertTelegram } from "@/lib/telegram-alerts";

// Wrapper for the cron endpoint
async function sendTelegramAlert({ message, topic }: { message: string; topic?: string }) {
  try {
    await sendLeadAlertTelegram({
      message,
      topic: topic || "system",
    } as any);
  } catch {
    // Non-blocking
  }
}

// Allow up to 5 minutes for processing
export const maxDuration = 300;

export async function GET(request: Request) {
  // Simple auth check — verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const xCronSecret = request.headers.get("x-cron-secret");
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret;
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  console.info("[cron/process-reruns] Starting cron job");

  try {
    // Find leads queued for rerun
    const queuedLeads = await getLeadsByStatus("rerun_queued");
    
    if (queuedLeads.length === 0) {
      console.info("[cron/process-reruns] No queued reruns found");
      return NextResponse.json({
        success: true,
        processed: 0,
        remaining: 0,
        message: "No leads queued for rerun",
      });
    }

    // Process only ONE lead per cron run to avoid timeouts
    const lead = queuedLeads[0];
    console.info(`[cron/process-reruns] Processing lead: ${lead.leadId} (${lead.dealershipName})`);

    // Mark as processing (with lock)
    await updateLeadResearchResults(lead.leadId, {
      status: "rerun_processing",
      notes: `Rerun started at ${new Date().toISOString()}`,
    });

    const startTime = Date.now();
    let result;

    try {
      // Step 1: Preflight
      console.info(`[cron/process-reruns] [${lead.leadId}] Step 1: Preflight scan`);
      const preflight = await preflightScan(lead.website, lead.city);
      
      // Step 2: Research
      console.info(`[cron/process-reruns] [${lead.leadId}] Step 2: AI visibility research`);
      result = await runResearch(
        lead.dealershipName,
        lead.website,
        lead.city,
        lead.competitor ? lead.competitor.split(',').map(c => c.trim()).filter(Boolean) : [],
        preflight,
        { tier: "free", competitorMode: "client_only" }
      );

      const duration = Math.round((Date.now() - startTime) / 1000);

      // Save results
      const researchJson = JSON.stringify({
        ...result,
        processedAt: new Date().toISOString(),
        durationSeconds: duration,
        isRerun: true,
      });

      await updateLeadResearchResults(lead.leadId, {
        status: "rerun_completed",
        researchStatus: "complete",
        snapshotAppeared: `${result.appearedCount} of ${result.totalPrompts} prompts`,
        visibilityBand: result.statusBand,
        serviceVisibility: result.serviceVisibility,
        notes: `RESEARCH_DATA:${researchJson}`,
      });

      // Success alert
      await sendTelegramAlert({
        message: `✅ Rerun completed\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nAppeared: ${result.appearedCount}/${result.totalPrompts}\nBand: ${result.statusBand}\nDuration: ${duration}s\n\n🔗 Report: https://vizbiz.ai/report/${lead.leadId}`,
        topic: "system",
      });

      console.info(`[cron/process-reruns] [${lead.leadId}] Completed in ${duration}s`);

      return NextResponse.json({
        success: true,
        processed: 1,
        remaining: queuedLeads.length - 1,
        leadId: lead.leadId,
        duration: `${duration}s`,
        appearedCount: result.appearedCount,
        statusBand: result.statusBand,
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const duration = Math.round((Date.now() - startTime) / 1000);

      console.error(`[cron/process-reruns] [${lead.leadId}] Failed: ${errorMsg}`);

      await updateLeadResearchResults(lead.leadId, {
        status: "rerun_failed",
        notes: `Rerun failed at ${new Date().toISOString()}. Error: ${errorMsg}. Duration: ${duration}s`,
      });

      // Failure alert
      await sendTelegramAlert({
        message: `❌ Rerun failed\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nError: ${errorMsg}\nDuration: ${duration}s\n\nWill retry in next cycle.`,
        topic: "system",
      });

      return NextResponse.json({
        success: false,
        processed: 0,
        remaining: queuedLeads.length - 1,
        leadId: lead.leadId,
        error: errorMsg,
        duration: `${duration}s`,
      }, { status: 500 });
    }

  } catch (error) {
    console.error("[cron/process-reruns] Fatal error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}
