import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Import everything we need
    const sheetsModule = await import("@/lib/google-sheets");
    
    // Read all leads
    const leads = await sheetsModule.getAllLeads();
    const artwow = leads.find((l: any) => l.leadId === "VZB-MOLHDGJK");
    
    if (!artwow) {
      return NextResponse.json({ error: "ARTWOW not found" });
    }
    
    const artwowIdx = leads.findIndex((l: any) => l.leadId === "VZB-MOLHDGJK");
    const sheetRow = artwowIdx + 2;
    
    // Try the update
    await sheetsModule.updateLeadResearchResults("VZB-MOLHDGJK", {
      status: "researching",
      researchStatus: "running",
    });
    
    // Wait a moment
    await new Promise(r => setTimeout(r, 2000));
    
    // Read back
    const leadsAfter = await sheetsModule.getAllLeads();
    const artwowAfter = leadsAfter.find((l: any) => l.leadId === "VZB-MOLHDGJK");
    
    return NextResponse.json({
      before: { status: artwow.status, researchStatus: artwow.researchStatus },
      after: { status: artwowAfter?.status, researchStatus: artwowAfter?.researchStatus },
      sheetRow,
      leadIndex: artwowIdx,
      envSheetName: JSON.stringify(process.env.GOOGLE_SHEETS_NAME),
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: String(error),
      stack: error?.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
}

export async function POST() { return GET(); }
