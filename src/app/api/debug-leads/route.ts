import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/google-sheets";

export async function GET() {
  try {
    const allLeads = await getAllLeads();
    return NextResponse.json({
      total: allLeads.length,
      leads: allLeads.map(l => ({
        dealershipName: l.dealershipName,
        status: l.status,
        researchStatus: l.researchStatus,
        leadId: l.leadId,
        email: l.email,
        city: l.city,
        website: l.website,
        timestamp: l.timestamp,
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { test } = await request.json().catch(() => ({}));
    // Import internal functions to test sheet writes
    const { updateLeadResearchResults, getAllLeads: getAll } = await import("@/lib/google-sheets");
    
    // Get the actual sheet name being used (by reading the env directly)
    const rawSheetName = process.env.GOOGLE_SHEETS_NAME || "Leads";
    const cleanSheetName = rawSheetName.replace(/[\\\n\r\s]+$/g, "").trim();
    
    const leads = await getAll();
    const artwow = leads.find(l => l.leadId === "VZB-MOLHDGJK");
    
    if (!artwow) {
      return NextResponse.json({ error: "ARTWOW lead not found" }, { status: 404 });
    }
    
    // Try updating
    await updateLeadResearchResults("VZB-MOLHDGJK", {
      status: "researching",
      researchStatus: "running"
    });
    
    // Read back
    const leadsAfter = await getAll();
    const artwowAfter = leadsAfter.find(l => l.leadId === "VZB-MOLHDGJK");
    
    return NextResponse.json({
      before: { status: artwow.status, researchStatus: artwow.researchStatus },
      after: { status: artwowAfter?.status, researchStatus: artwowAfter?.researchStatus },
      sheetNameRaw: process.env.GOOGLE_SHEETS_NAME,
      sheetNameCodes: Array.from(process.env.GOOGLE_SHEETS_NAME || "").map(c => c.charCodeAt(0)),
      cleanSheetName
    });
  } catch (error) {
    return NextResponse.json({ error: String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
}
