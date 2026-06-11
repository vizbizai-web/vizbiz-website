import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/google-sheets";
import { excludeQaLeads } from "@/lib/qa-leads";


export const revalidate = 0;

export async function GET() {
  try {
    const allLeads = await getAllLeads();
    const leads = excludeQaLeads(allLeads);

    // Group by status for pipeline view
    const byStatus = leads.reduce(
      (acc, lead) => {
        const status = lead.status || "new";
        if (!acc[status]) acc[status] = [];
        acc[status].push(lead);
        return acc;
      },
      {} as Record<string, typeof leads>
    );

    // Summary stats
    const stats = {
      total: leads.length,
      new: byStatus["new"]?.length || 0,
      researching: byStatus["researching"]?.length || 0,
      pending_review: byStatus["pending_review"]?.length || 0,
      approved: byStatus["approved"]?.length || 0,
      contacted: byStatus["contacted"]?.length || 0,
      closed_won: byStatus["closed_won"]?.length || 0,
      closed_lost: byStatus["closed_lost"]?.length || 0,
    };

    return NextResponse.json({
      stats,
      qa: { excluded: allLeads.length - leads.length, included: leads.length },
      pipeline: byStatus,
      leads,
    });
  } catch (error: any) {
    console.error("[pipeline-status] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch pipeline data", details: error.message },
      { status: 500 }
    );
  }
}
