import { NextResponse } from "next/server";
import { getAllLeads, updateLeadResearchResults } from "@/lib/google-sheets";
import type { LeadRow } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

// GET /api/lead-actions — list all leads with their available actions
export async function GET() {
  try {
    const leads = await getAllLeads();

    const leadsWithActions = leads.map((lead) => ({
      ...lead,
      availableActions: getAvailableActions(lead.status),
    }));

    return NextResponse.json({ leads: leadsWithActions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/lead-actions — execute a pipeline action on a lead
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, action, data } = body;

    if (!leadId || !action) {
      return NextResponse.json(
        { error: "leadId and action are required" },
        { status: 400 }
      );
    }

    const leads = await getAllLeads();
    const lead = leads.find((l) => l.leadId === leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const allowed = getAvailableActions(lead.status);
    if (!allowed.includes(action)) {
      return NextResponse.json(
        { error: `Action "${action}" not allowed for status "${lead.status}"` },
        { status: 400 }
      );
    }

    switch (action) {
      case "run_research": {
        // Trigger process-lead for this specific lead
        const res = await fetch(
          `https://vizbiz.ai/api/process-lead/?leadId=${leadId}`,
          { method: "GET" }
        );
        const result = await res.json();
        return NextResponse.json({
          success: true,
          action: "run_research",
          leadId,
          result,
        });
      }

      case "approve": {
        const res = await fetch("https://vizbiz.ai/api/vlad-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, action: "approve" }),
        });
        const result = await res.json();
        return NextResponse.json({
          success: true,
          action: "approve",
          leadId,
          result,
        });
      }

      case "hold": {
        const res = await fetch("https://vizbiz.ai/api/vlad-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, action: "hold" }),
        });
        const result = await res.json();
        return NextResponse.json({
          success: true,
          action: "hold",
          leadId,
          result,
        });
      }

      case "rerun": {
        const res = await fetch("https://vizbiz.ai/api/vlad-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, action: "rerun" }),
        });
        const result = await res.json();
        return NextResponse.json({
          success: true,
          action: "rerun",
          leadId,
          result,
        });
      }

      case "mark_junk": {
        await updateLeadResearchResults(leadId, {
          status: "closed_lost",
          notes: (lead.notes || "") + "\n[MARKED JUNK via MC]",
        });
        return NextResponse.json({
          success: true,
          action: "mark_junk",
          leadId,
        });
      }

      case "update_status": {
        if (!data?.status) {
          return NextResponse.json(
            { error: "data.status is required" },
            { status: 400 }
          );
        }
        await updateLeadResearchResults(leadId, {
          status: data.status,
          notes: data.notes
            ? (lead.notes || "") + "\n" + data.notes
            : lead.notes,
        });
        return NextResponse.json({
          success: true,
          action: "update_status",
          leadId,
          newStatus: data.status,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[lead-actions] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getAvailableActions(status: string): string[] {
  switch (status) {
    case "new":
      return ["run_research", "mark_junk", "update_status"];
    case "researching":
      return ["update_status"];
    case "pending_review":
      return ["approve", "hold", "rerun", "update_status"];
    case "approved":
      return ["update_status"];
    case "email_drafted":
      return ["update_status", "mark_junk"];
    case "contacted":
      return ["update_status"];
    case "closed_won":
    case "closed_lost":
      return ["update_status"];
    default:
      return ["update_status"];
  }
}
