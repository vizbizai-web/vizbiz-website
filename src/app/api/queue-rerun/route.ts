/**
 * Queue Lead for Rerun API
 * 
 * Fast endpoint (< 2s) that marks a lead for background rerun.
 * Returns immediately. Actual processing happens via cron.
 * 
 * POST /api/queue-rerun
 * Body: { leadId: string }
 * Response: { success: true, status: "queued", estimatedRun: "next cron cycle" }
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLeadStatus } from "@/lib/google-sheets";
import { sendLeadAlertTelegram } from "@/lib/telegram-alerts";

// Wrapper for the queue endpoint
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

export const maxDuration = 10; // Quick response, no long processing

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const leadId = body?.leadId;

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: leadId" },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: `Lead ${leadId} not found` },
        { status: 404 }
      );
    }

    // Idempotency: Check if already queued or processing
    if (lead.status === "rerun_queued" || lead.status === "rerun_processing") {
      return NextResponse.json({
        success: true,
        status: lead.status,
        message: `Lead ${leadId} is already ${lead.status}. Skipping duplicate request.`,
        leadId,
      });
    }

    // Mark as queued
    await updateLeadStatus(leadId, {
      status: "rerun_queued",
      notes: `${lead.notes || ""}\n[RERUN_QUEUED ${new Date().toISOString()}] Previous status: ${lead.status}`,
    });

    // Send confirmation Telegram alert
    try {
      await sendTelegramAlert({
        message: `🔄 Lead queued for rerun\n\nID: ${leadId}\nName: ${lead.dealershipName}\nQueued at: ${new Date().toLocaleTimeString()}\n\nWill process in next cron cycle (~5 min).`,
        topic: "system",
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      status: "rerun_queued",
      message: "Lead queued for background rerun",
      leadId,
      estimatedRun: "Next cron cycle (within 5 minutes)",
      currentReportUrl: `https://vizbiz.ai/report/${leadId}`,
    });

  } catch (error) {
    console.error("[queue-rerun] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to queue rerun" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/queue-rerun",
    method: "POST",
    description: "Queue a lead for background rerun",
    body: { leadId: "string" },
    response: { status: "rerun_queued", estimatedRun: "within 5 minutes" },
  });
}
