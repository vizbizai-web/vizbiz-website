import { NextResponse } from "next/server";
import { getAllLeads, updateLeadResearchResults } from "@/lib/google-sheets";
import type { LeadRow } from "@/lib/google-sheets";
import { sendPipelineAlert } from "@/lib/telegram-alerts";
import { recordActionAudit, requireMissionControlApiAuth, missionControlInternalHeaders } from "@/lib/mission-control-api-auth";
import { buildMissionControlNicheResolution } from "@/lib/niche-resolution-actions";
import { approveAndSendGatedEmail } from "@/lib/email-suite-automation";

// GET /api/lead-actions — list all leads with their available actions
export async function GET(request: Request) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const leads = await getAllLeads();
    const leadsWithActions = leads.map((lead) => ({
      ...lead,
      availableActions: getAvailableActions(lead.status),
    }));
    return NextResponse.json({ leads: leadsWithActions });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function scoreFromLead(lead: LeadRow) {
  const [appearedRaw, totalRaw] = (lead.snapshotAppeared || "0 of 5").split(/\s+of\s+/i);
  const appearedCount = Number.parseInt(appearedRaw || "0", 10) || 0;
  const totalPrompts = Number.parseInt(totalRaw || "5", 10) || 5;
  const statusBand = lead.visibilityBand || "Pending";
  const aviScore = statusBand === "Strong" ? 72 : statusBand === "Moderate" ? 42 : 18;
  return { appearedCount, totalPrompts, statusBand, aviScore };
}

async function proxyReviewAction(request: Request, leadId: string, action: string) {
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/api/operator-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId, action }),
  });
  return res.json();
}

function buildEmailDraftNote(kind: "SAVED" | "APPROVED", subject: string, body: string) {
  const marker = kind === "SAVED" ? "[EMAIL_DRAFT_SAVED" : "[EMAIL_DRAFT_APPROVED";
  return `${marker} ${new Date().toISOString()}] ${JSON.stringify({ subject, body })}`;
}

function getEmailDraftPayload(data: unknown) {
  const draft = data as { subject?: unknown; body?: unknown } | undefined;
  const subject = String(draft?.subject || "").trim();
  const body = String(draft?.body || "").trim();
  if (!subject || !body) return null;
  return { subject, body };
}

// POST /api/lead-actions — execute a pipeline action on a lead
export async function POST(request: Request) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const { leadId, action, data } = body;

    if (!leadId || !action) {
      return NextResponse.json({ error: "leadId and action are required" }, { status: 400 });
    }

    const leads = await getAllLeads();
    const lead = leads.find((l) => l.leadId === leadId);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const allowed = getAvailableActions(lead.status);
    if (!allowed.includes(action)) {
      return NextResponse.json({ error: `Action "${action}" not allowed for status "${lead.status}"` }, { status: 400 });
    }

    await recordActionAudit({ leadId, action, channel: "mission_control", metadata: { status: lead.status } });

    switch (action) {
      case "run_research": {
        const origin = new URL(request.url).origin;
        const res = await fetch(`${origin}/api/pipeline/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, researchMode: data?.researchMode || "free", force: Boolean(data?.force) }),
        });
        const result = await res.json();
        return NextResponse.json({ success: true, action: "run_research", leadId, result });
      }

      case "approve": {
        const result = await proxyReviewAction(request, leadId, "approve");
        return NextResponse.json({ success: true, action: "approve", leadId, result });
      }

      case "approve_gated_email": {
        const templateId = data?.templateId === 'E11_30_DAY_RESCAN' ? 'E11_30_DAY_RESCAN' : 'E11_30_DAY_RESCAN';
        const result = await approveAndSendGatedEmail(lead, templateId);
        await recordActionAudit({ leadId, action: "approve_gated_email", channel: "mission_control", metadata: { templateId, messageId: result.messageId } });
        return NextResponse.json({ success: true, action: "approve_gated_email", leadId, result });
      }

      case "fulfill_paid_from_profile": {
        const paymentAt = Array.from((lead.notes || '').matchAll(/\[PAYMENT_CONFIRMED\s+([^\]]+)\]/gi)).at(-1)?.[1] || lead.timestamp;
        const ageMs = Date.now() - (Date.parse(paymentAt) || Date.now());
        if (ageMs < 72 * 60 * 60 * 1000) {
          return NextResponse.json({ error: "Paid intake fallback is only available after 72h pending." }, { status: 409 });
        }
        await updateLeadResearchResults(leadId, {
          status: "paid_intake_submitted",
          researchStatus: "pending",
          notes: `${lead.notes || ""}\n[PAID_INTAKE_FALLBACK_APPROVED ${new Date().toISOString()}] source=resolved_profile operator=mission_control`,
        });
        await recordActionAudit({ leadId, action: "fulfill_paid_from_profile", channel: "mission_control", metadata: { paymentAt } });
        return NextResponse.json({ success: true, action: "fulfill_paid_from_profile", leadId });
      }

      case "save_email_draft": {
        const draft = getEmailDraftPayload(data);
        if (!draft) return NextResponse.json({ error: "Draft subject and body are required" }, { status: 400 });
        await updateLeadResearchResults(leadId, {
          notes: `${lead.notes || ""}\n${buildEmailDraftNote("SAVED", draft.subject, draft.body)}`,
        });
        return NextResponse.json({ success: true, action: "save_email_draft", leadId });
      }

      case "approve_email": {
        const draft = getEmailDraftPayload(data);
        if (!draft) return NextResponse.json({ error: "Draft subject and body are required" }, { status: 400 });
        await updateLeadResearchResults(leadId, {
          status: "email_drafted",
          notes: `${lead.notes || ""}\n${buildEmailDraftNote("APPROVED", draft.subject, draft.body)}`,
        });
        return NextResponse.json({ success: true, action: "approve_email", leadId });
      }

      case "hold": {
        const reason = String(data?.reason || "Mission Control hold requested").trim();
        await updateLeadResearchResults(leadId, {
          status: "pending_review",
          notes: `${lead.notes || ""}\n[HOLD via MC ${new Date().toISOString()}] ${reason}`,
        });
        try {
          await sendPipelineAlert([
            `⏸️ Report held — ${lead.dealershipName || "Unknown business"}`,
            "",
            `Lead ID: ${leadId}`,
            `Reason: ${reason}`,
            `Mission Control: https://vizbiz.ai/mission-control/leads/${leadId}`,
          ].join("\n"));
        } catch (alertErr) {
          console.warn("[lead-actions] hold alert failed (non-blocking):", alertErr);
        }
        return NextResponse.json({ success: true, action: "hold", leadId, reason });
      }

      case "rerun": {
        const reason = String(data?.reason || "Mission Control rerun requested").trim();
        const origin = new URL(request.url).origin;
        await updateLeadResearchResults(leadId, {
          status: "new",
          researchStatus: "pending",
          notes: `${lead.notes || ""}\n[RERUN_REQUESTED via MC ${new Date().toISOString()}] ${reason}`,
        });
        const result = await fetch(`${origin}/api/pipeline/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, force: true, researchMode: data?.researchMode || "free", revisionReason: reason }),
        }).then((res) => res.json().catch(() => ({ ok: res.ok, status: res.status })));
        try {
          await sendPipelineAlert([
            `🔄 Research rerun started — ${lead.dealershipName || "Unknown business"}`,
            "",
            `Lead ID: ${leadId}`,
            `Reason: ${reason}`,
            `Mission Control: https://vizbiz.ai/mission-control/leads/${leadId}`,
          ].join("\n"));
        } catch (alertErr) {
          console.warn("[lead-actions] rerun alert failed (non-blocking):", alertErr);
        }
        return NextResponse.json({ success: true, action: "rerun", leadId, result });
      }

      case "approve_and_send": {
        const reportType = data?.reportType === "paid" ? "paid" : "free";
        const { appearedCount, totalPrompts, statusBand, aviScore } = scoreFromLead(lead);
        const origin = new URL(request.url).origin;
        const previousStatus = lead.status;
        const approvalStamp = new Date().toISOString();

        if (reportType === "free" && lead.status !== "approved") {
          await updateLeadResearchResults(leadId, {
            status: "approved",
            notes: `${lead.notes || ""}\n[APPROVED_FOR_FREE_SEND via MC ${approvalStamp}]`,
          });
        }

        const sendRes = await fetch(`${origin}/api/send-report-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...missionControlInternalHeaders() },
          body: JSON.stringify({
            to: lead.email,
            leadId,
            businessName: lead.dealershipName,
            contactName: lead.contactName,
            city: lead.city,
            aviScore,
            statusBand,
            appearedCount,
            totalPrompts,
            competitorName: lead.competitor.split(",")[0]?.trim() || "",
            competitorScore: 0,
          }),
        });
        const sendResult = await sendRes.json().catch(() => ({}));
        if (!sendRes.ok) {
          if (reportType === "free" && previousStatus !== "approved") {
            await updateLeadResearchResults(leadId, {
              status: previousStatus,
              notes: `${lead.notes || ""}\n[APPROVE_SEND_BLOCKED ${reportType.toUpperCase()} ${new Date().toISOString()}] ${sendResult?.error || "Email send failed"}`,
            });
          }
          return NextResponse.json({ success: false, error: sendResult?.error || "Email send failed", details: sendResult }, { status: 502 });
        }
        await updateLeadResearchResults(leadId, {
          status: reportType === "paid" ? "paid_report_delivered" : "contacted",
          emailSentAt: new Date().toISOString(),
          notes: `${lead.notes || ""}\n[APPROVED_AND_SENT ${reportType.toUpperCase()} via MC ${new Date().toISOString()}]`,
        });
        try {
          await sendPipelineAlert([
            `✅ Approved and sent — ${lead.dealershipName || "Unknown business"}`,
            "",
            `Lead ID: ${leadId}`,
            `Report type: ${reportType}`,
            `Email: ${lead.email}`,
            `Report: ${sendResult?.reportUrl || lead.reportUrl || `https://vizbiz.ai/report/${leadId}`}`,
          ].join("\n"));
        } catch (alertErr) {
          console.warn("[lead-actions] approve_and_send alert failed (non-blocking):", alertErr);
        }
        return NextResponse.json({ success: true, action: "approve_and_send", leadId, reportType, sendResult });
      }

      case "needs_revision": {
        const reason = String(data?.reason || "").trim();
        const reportType = data?.reportType === "paid" ? "paid" : "free";
        const autoRerun = data?.autoRerun === true;
        if (!reason) return NextResponse.json({ error: "Revision reason is required" }, { status: 400 });
        await updateLeadResearchResults(leadId, {
          status: "needs_revision",
          notes: `${lead.notes || ""}\n[NEEDS_REVISION ${reportType.toUpperCase()} ${new Date().toISOString()}] ${reason}`,
        });
        let rerunResult: { success?: boolean; error?: string; [key: string]: unknown } | null = null;
        if (autoRerun) {
          try {
            await sendPipelineAlert([
              `🔧 Needs fix received — ${lead.dealershipName || "Unknown business"}`,
              "",
              `Lead ID: ${leadId}`,
              `Report type: ${reportType}`,
              `Reason: ${reason}`,
              `Recovery: rerun starting now`,
              `Mission Control: https://vizbiz.ai/mission-control/leads/${leadId}`,
            ].join("\n"));
          } catch (alertErr) {
            console.warn("[lead-actions] needs_revision immediate alert failed (non-blocking):", alertErr);
          }

          const origin = new URL(request.url).origin;
          rerunResult = await fetch(`${origin}/api/pipeline/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              leadId,
              force: true,
              researchMode: reportType === "paid" ? "paid" : "free",
              revisionReason: reason,
            }),
          }).then((res) => res.json().catch(() => ({ success: res.ok, status: res.status })));
          if (rerunResult?.success === false) {
            try {
              await sendPipelineAlert([
                `🚫 Needs fix rerun failed — ${lead.dealershipName || "Unknown business"}`,
                "",
                `Lead ID: ${leadId}`,
                `Report type: ${reportType}`,
                `Reason: ${reason}`,
                `Error: ${rerunResult.error || "Unknown rerun failure"}`,
                `Mission Control: https://vizbiz.ai/mission-control/leads/${leadId}`,
              ].join("\n"));
            } catch (alertErr) {
              console.warn("[lead-actions] needs_revision failure alert failed (non-blocking):", alertErr);
            }
            return NextResponse.json({
              success: false,
              action: "needs_revision",
              leadId,
              reportType,
              reason,
              autoRerun,
              error: rerunResult.error || "Needs-fix rerun failed",
              rerunResult,
            }, { status: 502 });
          }
        }
        try {
          await sendPipelineAlert([
            autoRerun
              ? `🔧 Needs fix + rerun started — ${lead.dealershipName || "Unknown business"}`
              : `🔧 Needs fix — ${lead.dealershipName || "Unknown business"}`,
            "",
            `Lead ID: ${leadId}`,
            `Report type: ${reportType}`,
            `Reason: ${reason}`,
            "",
            `Mission Control: https://vizbiz.ai/mission-control/leads/${leadId}`,
          ].join("\n"));
        } catch (alertErr) {
          console.warn("[lead-actions] needs_revision alert failed (non-blocking):", alertErr);
        }
        return NextResponse.json({ success: true, action: "needs_revision", leadId, reportType, reason, autoRerun, rerunResult });
      }

      case "do_not_send": {
        const reason = String(data?.reason || "Operator marked do not send").trim();
        await updateLeadResearchResults(leadId, {
          status: "do_not_send",
          notes: `${lead.notes || ""}\n[DO_NOT_SEND ${new Date().toISOString()}] ${reason}`,
        });
        try {
          await sendPipelineAlert([
            `🛑 Do not send — ${lead.dealershipName || "Unknown business"}`,
            "",
            `Lead ID: ${leadId}`,
            `Reason: ${reason}`,
            `Mission Control: https://vizbiz.ai/mission-control/leads/${leadId}`,
          ].join("\n"));
        } catch (alertErr) {
          console.warn("[lead-actions] do_not_send alert failed (non-blocking):", alertErr);
        }
        return NextResponse.json({ success: true, action: "do_not_send", leadId, reason });
      }

      case "mark_junk": {
        await updateLeadResearchResults(leadId, {
          status: "closed_lost",
          notes: (lead.notes || "") + "\n[MARKED JUNK via MC]",
        });
        return NextResponse.json({ success: true, action: "mark_junk", leadId });
      }

      case "resolve_niche": {
        const resolution = buildMissionControlNicheResolution({
          leadId,
          action: data?.resolutionAction as "use_submitted" | "use_website" | "custom",
          submittedNiche: typeof data?.submittedNiche === 'string' ? data.submittedNiche : '',
          websiteNiche: typeof data?.websiteNiche === 'string' ? data.websiteNiche : '',
          customNiche: typeof data?.customNiche === 'string' ? data.customNiche : '',
        });
        await updateLeadResearchResults(leadId, {
          status: "new",
          researchStatus: "pending",
          notes: `${lead.notes || ""}\n${resolution.noteLine}`,
        });
        await recordActionAudit({ leadId, action: `niche_resolution_${resolution.action}`, channel: "mission_control", metadata: { selectedNiche: resolution.selectedNiche } });
        const origin = new URL(request.url).origin;
        const rerun = await fetch(`${origin}/api/pipeline/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, force: true, researchMode: data?.researchMode || "free", revisionReason: resolution.rerunReason }),
        }).then((res) => res.json().catch(() => ({ success: res.ok, status: res.status })));
        try {
          await sendPipelineAlert([
            `✅ Niche resolution applied — ${lead.dealershipName || "Unknown business"}`,
            "",
            `Lead ID: ${leadId}`,
            `Selected niche: ${resolution.selectedNiche}`,
            `Action: ${resolution.action}`,
            `Channel: Mission Control`,
            `Rerun: ${JSON.stringify(rerun).slice(0, 300)}`,
          ].join("\n"));
        } catch (alertErr) {
          console.warn("[lead-actions] niche resolution alert failed (non-blocking):", alertErr);
        }
        return NextResponse.json({ success: true, action: "resolve_niche", leadId, selectedNiche: resolution.selectedNiche, rerun });
      }

      case "update_status": {
        if (!data?.status) return NextResponse.json({ error: "data.status is required" }, { status: 400 });
        await updateLeadResearchResults(leadId, {
          status: data.status,
          notes: data.notes ? (lead.notes || "") + "\n" + data.notes : lead.notes,
        });
        return NextResponse.json({ success: true, action: "update_status", leadId, newStatus: data.status });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("[lead-actions] Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function getAvailableActions(status: string): string[] {
  switch (status) {
    case "new":
      return ["run_research", "mark_junk", "resolve_niche", "update_status"];
    case "researching":
    case "research_complete":
      return ["update_status"];
    case "pending_review":
      return ["approve", "approve_and_send", "needs_revision", "do_not_send", "hold", "rerun", "resolve_niche", "update_status"];
    case "approved":
      return ["save_email_draft", "approve_email", "approve_and_send", "needs_revision", "do_not_send", "update_status"];
    case "email_drafted":
      return ["save_email_draft", "approve_email", "approve_and_send", "needs_revision", "update_status", "mark_junk"];
    case "paid_checkout_complete":
    case "paid_intake_pending":
      return ["fulfill_paid_from_profile", "update_status"];
    case "paid_intake_submitted":
      return ["run_research", "update_status"];
    case "paid_report_ready_for_review":
      return ["approve_and_send", "needs_revision", "do_not_send", "update_status"];
    case "needs_revision":
      return ["rerun", "run_research", "resolve_niche", "update_status"];
    case "contacted":
    case "paid_report_delivered":
      return ["approve_gated_email", "update_status"];
    case "rerun_completed":
      return ["approve_gated_email", "update_status"];
    case "closed_won":
    case "closed_lost":
    case "do_not_send":
      return ["update_status"];
    default:
      return ["update_status"];
  }
}
