import { NextResponse } from "next/server";
import { updateLeadResearchResults, getAllLeads } from "@/lib/google-sheets";

export async function GET() {
  try {
    // First, reset to "new" using raw write
    const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
    const saKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    let sa;
    try { sa = JSON.parse(saKeyRaw || ""); } catch { return NextResponse.json({ error: "Bad SA key" }); }
    
    const header = Buffer.from(JSON.stringify({alg:"RS256",typ:"JWT"})).toString("base64url");
    const now = Math.floor(Date.now()/1000);
    const payload = Buffer.from(JSON.stringify({
      iss: sa.client_email, scope: SCOPES, aud: sa.token_uri, iat: now, exp: now + 3600
    })).toString("base64url");
    
    const crypto = await import("crypto");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(header + "." + payload);
    const sig = sign.sign(sa.private_key, "base64url");
    const jwt = header + "." + payload + "." + sig;
    
    const tokenRes = await fetch(sa.token_uri, {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return NextResponse.json({ error: "Token failed" });
    
    const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
    const sheetId = (process.env.GOOGLE_SHEETS_ID || "").trim();
    const sheetName = (process.env.GOOGLE_SHEETS_NAME || "Leads").trim();
    
    // Reset to "new"
    await fetch(
      `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(sheetName + "!L4")}?valueInputOption=USER_ENTERED`,
      { method: "PUT", headers: { Authorization: `Bearer ${tokenData.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values: [["new"]] }) }
    );
    await fetch(
      `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(sheetName + "!M4")}?valueInputOption=USER_ENTERED`,
      { method: "PUT", headers: { Authorization: `Bearer ${tokenData.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values: [["pending"]] }) }
    );
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Verify reset
    const leadsBefore = await getAllLeads();
    const artwowBefore = leadsBefore.find(l => l.leadId === "VZB-MOLHDGJK");
    
    // Now try the MODULE's updateLeadResearchResults
    let moduleError = null;
    try {
      await updateLeadResearchResults("VZB-MOLHDGJK", {
        status: "researching",
        researchStatus: "running"
      });
    } catch (e: any) {
      moduleError = String(e);
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Read back
    const leadsAfter = await getAllLeads();
    const artwowAfter = leadsAfter.find(l => l.leadId === "VZB-MOLHDGJK");
    
    return NextResponse.json({
      beforeModule: { status: artwowBefore?.status, research: artwowBefore?.researchStatus },
      afterModule: { status: artwowAfter?.status, research: artwowAfter?.researchStatus },
      moduleError
    });
  } catch (error: any) {
    return NextResponse.json({ error: String(error), stack: error?.stack?.split('\n').slice(0, 5) }, { status: 500 });
  }
}
