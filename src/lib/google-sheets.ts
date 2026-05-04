/**
 * Google Sheets CRM — VizBiz Lead Database
 *
 * Stores every intake submission as a row in a Google Sheet.
 * Columns: timestamp, dealership, website, city, contact name, email, phone,
 *          competitor, snapshot score, visibility band, status, research status,
 *          email sent, notes, last contacted, source
 */

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Column mapping (A through Q) — must match the Sheet header row
const COLUMNS = [
  "A", // timestamp
  "B", // dealership_name
  "C", // website
  "D", // city
  "E", // contact_name
  "F", // email
  "G", // phone
  "H", // competitor
  "I", // snapshot_appeared
  "J", // visibility_band
  "K", // service_visibility
  "L", // status (new / researching / email_drafted / contacted / closed_won / closed_lost)
  "M", // research_status (pending / running / complete / failed)
  "N", // email_sent_at
  "O", // notes
  "P", // source
  "Q", // lead_id
] as const;

export type LeadStatus =
  | "new"
  | "researching"
  | "email_drafted"
  | "contacted"
  | "closed_won"
  | "closed_lost";

export type ResearchStatus =
  | "pending"
  | "running"
  | "complete"
  | "failed";

export type LeadRow = {
  timestamp: string;
  dealershipName: string;
  website: string;
  city: string;
  contactName: string;
  email: string;
  phone: string;
  competitor: string;
  snapshotAppeared: string;
  visibilityBand: string;
  serviceVisibility: string;
  status: LeadStatus;
  researchStatus: ResearchStatus;
  emailSentAt: string;
  notes: string;
  source: string;
  leadId: string;
};

function getSheetId(): string {
  const id = (process.env.GOOGLE_SHEETS_ID || "").trim();
  if (!id) throw new Error("GOOGLE_SHEETS_ID not configured");
  return id;
}

function getApiKey(): string {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
  return key;
}

async function getAccessToken(): Promise<string> {
  // For service account auth — uses JWT assertion
  const serviceAccountJson = getApiKey();
  let serviceAccount: {
    client_email: string;
    private_key: string;
    token_uri: string;
  };

  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: SCOPES,
      aud: serviceAccount.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signInput = `${header}.${payload}`;

  // Use Web Crypto API (available in Node 19+ and Edge Runtime)
  const keyData = pemToBuffer(serviceAccount.private_key);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signInput),
  );

  const jwt = `${signInput}.${base64url(new Uint8Array(signature))}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    throw new Error(`Google auth failed: ${tokenResponse.status} ${text}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}

function base64url(input: string | Uint8Array): string {
  const buffer =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : input;
  let binary = "";
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToBuffer(pem: string): ArrayBuffer {
  const pemContent = pem
    .replace(/-----BEGIN.*?-----/g, "")
    .replace(/-----END.*?-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(pemContent);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

async function sheetsFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${SHEETS_API_BASE}/${getSheetId()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sheets API ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

/**
 * Append a new lead row to the CRM sheet
 */
export async function appendLead(lead: Omit<LeadRow, "leadId">): Promise<string> {
  const leadId = `VZB-${Date.now().toString(36).toUpperCase()}`;

  const values = [[
    lead.timestamp,
    lead.dealershipName,
    lead.website,
    lead.city,
    lead.contactName,
    lead.email,
    lead.phone,
    lead.competitor,
    lead.snapshotAppeared,
    lead.visibilityBand,
    lead.serviceVisibility,
    lead.status,
    lead.researchStatus,
    lead.emailSentAt,
    lead.notes,
    lead.source,
    leadId,
  ]];

  const result = await sheetsFetch<{
    updates: { updatedRange: string };
  }>(`/values/${getSheetRange()}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values }),
  });

  console.info("[sheets] lead appended", { leadId, range: result.updates?.updatedRange });
  return leadId;
}

/**
 * Update a specific lead's status
 */
export async function updateLeadStatus(
  leadId: string,
  updates: Partial<Pick<LeadRow, "status" | "researchStatus" | "emailSentAt" | "notes">>,
): Promise<void> {
  // First, find the row with this leadId
  const data = await sheetsFetch<{
    values: string[][];
  }>(`/values/${getSheetRange()}`);

  if (!data.values) {
    throw new Error("No data found in CRM sheet");
  }

  // leadId is in column Q (index 16)
  const rowIndex = data.values.findIndex((row) => row[16] === leadId);
  if (rowIndex === -1) {
    throw new Error(`Lead ${leadId} not found in sheet`);
  }

  // Sheet rows are 1-indexed (data.values index 0 = sheet row 1)
  const sheetRow = rowIndex + 1;

  // Use batch update for reliability
  const sheetName = getSheetName();
  const cells: { range: string; values: string[][] }[] = [];

  if (updates.status) {
    cells.push({ range: `${sheetName}!L${sheetRow}`, values: [[updates.status]] });
  }
  if (updates.researchStatus) {
    cells.push({ range: `${sheetName}!M${sheetRow}`, values: [[updates.researchStatus]] });
  }
  if (updates.emailSentAt) {
    cells.push({ range: `${sheetName}!N${sheetRow}`, values: [[updates.emailSentAt]] });
  }
  if (updates.notes) {
    cells.push({ range: `${sheetName}!O${sheetRow}`, values: [[updates.notes]] });
  }

  if (cells.length === 0) return;

  await sheetsFetch(`/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      data: cells,
      valueInputOption: "USER_ENTERED",
    }),
  });

  console.info("[sheets] lead status updated (batch)", { leadId, updates: Object.keys(updates), row: sheetRow });
}

/**
 * Update comprehensive lead fields including research results
 */
export async function updateLeadResearchResults(
  leadId: string,
  updates: {
    status?: LeadStatus;
    researchStatus?: ResearchStatus;
    snapshotAppeared?: string;
    visibilityBand?: string;
    serviceVisibility?: string;
    notes?: string;
  },
): Promise<void> {
  // First, find the row with this leadId
  const data = await sheetsFetch<{
    values: string[][];
  }>(`/values/${getSheetRange()}`);

  if (!data.values) {
    throw new Error("No data found in CRM sheet");
  }

  // leadId is in column Q (index 16)
  const rowIndex = data.values.findIndex((row) => row[16] === leadId);
  if (rowIndex === -1) {
    throw new Error(`Lead ${leadId} not found in sheet`);
  }

  // Sheet rows are 1-indexed (data.values index 0 = sheet row 1)
  const sheetRow = rowIndex + 1;

  // Use batch update for reliability
  const sheetName = getSheetName();
  const cells: { range: string; values: string[][] }[] = [];

  if (updates.status) {
    cells.push({ range: `${sheetName}!L${sheetRow}`, values: [[updates.status]] });
  }
  if (updates.researchStatus) {
    cells.push({ range: `${sheetName}!M${sheetRow}`, values: [[updates.researchStatus]] });
  }
  if (updates.snapshotAppeared) {
    cells.push({ range: `${sheetName}!I${sheetRow}`, values: [[updates.snapshotAppeared]] });
  }
  if (updates.visibilityBand) {
    cells.push({ range: `${sheetName}!J${sheetRow}`, values: [[updates.visibilityBand]] });
  }
  if (updates.serviceVisibility) {
    cells.push({ range: `${sheetName}!K${sheetRow}`, values: [[updates.serviceVisibility]] });
  }
  if (updates.notes) {
    cells.push({ range: `${sheetName}!O${sheetRow}`, values: [[updates.notes]] });
  }

  if (cells.length === 0) return;

  // Use batchUpdate endpoint which is more reliable than individual cell PUTs
  await sheetsFetch<{ totalUpdatedCells?: number }>(`/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      data: cells,
      valueInputOption: "USER_ENTERED",
    }),
  });

  console.info("[sheets] lead updated (batch)", { leadId, updates: Object.keys(updates), row: sheetRow });
}

/**
 * Get all leads from the sheet
 */
export async function getAllLeads(): Promise<LeadRow[]> {
  const data = await sheetsFetch<{
    values: string[][];
  }>(`/values/${getSheetRange()}`);

  if (!data.values) return [];

  // Skip header row
  return data.values.slice(1).map((row) => ({
    timestamp: row[0] || "",
    dealershipName: row[1] || "",
    website: row[2] || "",
    city: row[3] || "",
    contactName: row[4] || "",
    email: row[5] || "",
    phone: row[6] || "",
    competitor: row[7] || "",
    snapshotAppeared: row[8] || "",
    visibilityBand: row[9] || "",
    serviceVisibility: row[10] || "",
    status: (row[11] || "new") as LeadRow["status"],
    researchStatus: (row[12] || "pending") as LeadRow["researchStatus"],
    emailSentAt: row[13] || "",
    notes: row[14] || "",
    source: row[15] || "",
    leadId: row[16] || "",
  }));
}

/**
 * Get leads by status
 */
export async function getLeadsByStatus(status: LeadStatus): Promise<LeadRow[]> {
  const all = await getAllLeads();
  return all.filter((lead) => lead.status === status);
}

/**
 * Initialize the sheet with headers (run once during setup)
 */
export async function initializeSheet(): Promise<void> {
  const headers = [[
    "Timestamp",
    "Dealership Name",
    "Website",
    "City",
    "Contact Name",
    "Email",
    "Phone",
    "Competitor",
    "Snapshot (Appeared In)",
    "Visibility Band",
    "Service Visibility",
    "Status",
    "Research Status",
    "Email Sent At",
    "Notes",
    "Source",
    "Lead ID",
  ]];

  await sheetsFetch(`/values/${getSheetName()}!A1:Q1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values: headers }),
  });

  console.info("[sheets] headers initialized");
}

function getSheetName(): string {
  return (process.env.GOOGLE_SHEETS_NAME || "Leads").trim();
}

function getSheetRange(): string {
  return `'${getSheetName()}'!A:Q`;
}

/**
 * Get a single lead by leadId
 */
export async function getLeadByLeadId(leadId: string): Promise<LeadRow | null> {
  const all = await getAllLeads();
  return all.find((lead) => lead.leadId === leadId) || null;
}

/**
 * Check if Google Sheets CRM is configured
 */
export function isSheetsConfigured(): boolean {
  return !!(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}
