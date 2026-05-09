import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

// GET /api/attention-feed — things that need Alex's attention
export async function GET() {
  try {
    const leads = await getAllLeads();
    const now = Date.now();
    const alerts: Array<{
      id: string;
      severity: "critical" | "warning" | "info";
      category: string;
      message: string;
      leadId?: string;
      leadName?: string;
      action?: string;
    }> = [];

    let alertId = 1;

    // 1. Days since last outreach
    const emailLeads = leads.filter(
      (l) =>
        l.emailSentAt &&
        l.emailSentAt !== "pending" &&
        new Date(l.emailSentAt).getTime() > 0
    );
    const lastEmailDate = emailLeads.length
      ? Math.max(...emailLeads.map((l) => new Date(l.emailSentAt).getTime()))
      : 0;
    const daysSinceOutreach = lastEmailDate
      ? Math.floor((now - lastEmailDate) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceOutreach > 7) {
      alerts.push({
        id: `att-${alertId++}`,
        severity: "critical",
        category: "revenue",
        message: `No outreach sent in ${daysSinceOutreach} days. ${leads.filter((l) => l.status === "email_drafted").length} email drafts waiting.`,
        action: "Review and send emails",
      });
    }

    // 2. Leads stuck in stages too long
    const STALE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
    for (const lead of leads) {
      if (!lead.timestamp) continue;
      const age = now - new Date(lead.timestamp).getTime();
      if (age > STALE_THRESHOLD_MS) {
        const days = Math.floor(age / (1000 * 60 * 60 * 24));
        if (
          lead.status === "new" ||
          lead.status === "researching" ||
          lead.status === "pending_review"
        ) {
          alerts.push({
            id: `att-${alertId++}`,
            severity: "warning",
            category: "pipeline",
            message: `${lead.dealershipName || "Unknown"} has been in "${lead.status}" for ${days} days`,
            leadId: lead.leadId,
            leadName: lead.dealershipName,
            action:
              lead.status === "new"
                ? "Run Research"
                : lead.status === "pending_review"
                  ? "Approve or Rerun"
                  : "Check research status",
          });
        }
      }
    }

    // 3. Research failures
    const failedResearch = leads.filter((l) => l.researchStatus === "failed");
    for (const lead of failedResearch) {
      alerts.push({
        id: `att-${alertId++}`,
        severity: "warning",
        category: "pipeline",
        message: `Research failed for ${lead.dealershipName || "Unknown"}`,
        leadId: lead.leadId,
        leadName: lead.dealershipName,
        action: "Rerun research",
      });
    }

    // 4. Pipeline summary — leads with no movement
    const newLeads = leads.filter((l) => l.status === "new").length;
    if (newLeads > 0) {
      alerts.push({
        id: `att-${alertId++}`,
        severity: "info",
        category: "pipeline",
        message: `${newLeads} new lead${newLeads > 1 ? "s" : ""} waiting to be processed`,
        action: "Run Research",
      });
    }

    const pendingReview = leads.filter(
      (l) => l.status === "pending_review"
    ).length;
    if (pendingReview > 0) {
      alerts.push({
        id: `att-${alertId++}`,
        severity: "info",
        category: "pipeline",
        message: `${pendingReview} lead${pendingReview > 1 ? "s" : ""} waiting for your review`,
        action: "Review leads",
      });
    }

    const emailDrafts = leads.filter(
      (l) => l.status === "email_drafted"
    ).length;
    if (emailDrafts > 0) {
      alerts.push({
        id: `att-${alertId++}`,
        severity: "info",
        category: "email",
        message: `${emailDrafts} email draft${emailDrafts > 1 ? "s" : ""} ready to send`,
        action: "Review and send",
      });
    }

    // Sort: critical first, then warning, then info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );

    return NextResponse.json({
      alerts,
      summary: {
        totalAlerts: alerts.length,
        critical: alerts.filter((a) => a.severity === "critical").length,
        warning: alerts.filter((a) => a.severity === "warning").length,
        info: alerts.filter((a) => a.severity === "info").length,
        daysSinceOutreach,
        totalLeads: leads.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
