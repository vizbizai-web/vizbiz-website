import { NextResponse } from "next/server";

// Raw write test to verify Sheets API is working
export async function GET() {
  const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
  
  const saKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!saKeyRaw) return NextResponse.json({ error: "No SA key" }, { status: 500 });
  
  let sa;
  try { sa = JSON.parse(saKeyRaw); } catch(e: any) { return NextResponse.json({ error: "Bad SA key: " + e.message }); }
  
  const header = Buffer.from(JSON.stringify({alg:"RS256",typ:"JWT"})).toString("base64url");
  const now = Math.floor(Date.now()/1000);
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: SCOPES,
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600
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
  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Token failed", details: tokenData });
  }
  
  const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
  const sheetId = (process.env.GOOGLE_SHEETS_ID || "").trim();
  const sheetName = (process.env.GOOGLE_SHEETS_NAME || "Leads").trim();
  
  // Write "researching" to L4
  const writeUrl = `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(sheetName + "!L4")}?valueInputOption=USER_ENTERED`;
  
  const writeRes = await fetch(writeUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: [["researching"]] })
  });
  
  const writeStatus = writeRes.status;
  const writeText = await writeRes.text();
  
  // Read back
  const readUrl = `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(sheetName + "!L4")}`;
  const readRes = await fetch(readUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const readData = await readRes.json();
  
  return NextResponse.json({
    sheetId: sheetId.substring(0, 8) + "...",
    sheetName,
    writeUrl: writeUrl.substring(0, 80) + "...",
    writeStatus,
    writeBody: writeText.substring(0, 500),
    readBack: readData,
    envSheetNameRaw: JSON.stringify(process.env.GOOGLE_SHEETS_NAME),
    envSheetIdChars: JSON.stringify(process.env.GOOGLE_SHEETS_ID?.substring(0, 10)),
  });
}
