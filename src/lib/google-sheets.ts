/**
 * VizBiz CRM compatibility adapter (Supabase primary, Google Sheets legacy fallback)
 *
 * Keeps the old google-sheets import surface alive for launch safety while routing
 * the live pipeline through Supabase whenever Supabase env vars are configured.
 * Google Sheets is now optional legacy/fallback only; it must not block intake,
 * report lookup, payment updates, or operator review on the new pipeline.
 *
 * Columns A-Q: Original lead data (backward compatible)
 * Columns R-AF: Pipeline state tracking (v2 additions)
 */

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Column mapping — must match the Sheet header row
const COLUMNS = [
  "A", // timestamp
  "B", // dealership_name
  "C", // website
  "D", // city
  "E", // contact_name
  "F", // email
  "G", // phone
  "H", // competitor (client-provided competitors, comma-separated)
  "I", // snapshot_appeared
  "J", // visibility_band
  "K", // service_visibility
  "L", // status
  "M", // research_status
  "N", // email_sent_at
  "O", // notes (operator notes — never overwrite during reruns)
  "P", // source
  "Q", // lead_id
  // --- v2 Pipeline State Columns ---
  "R", // lock_owner
  "S", // lock_expires_at
  "T", // retry_count
  "U", // last_stage
  "V", // last_error
  "W", // preflight_started_at
  "X", // preflight_completed_at
  "Y", // research_started_at
  "Z", // research_completed_at
  "AA", // report_generated_at
  "AB", // report_url
  "AC", // competitor_mode
  "AD", // client_provided_competitors
  "AE", // internal_competitor_suggestions
  "AF", // places_validation_status
  "AG", // sonar_validation_status
] as const;

// Index for each column (0-based)
const COL = {
  TIMESTAMP: 0,
  DEALERSHIP_NAME: 1,
  WEBSITE: 2,
  CITY: 3,
  CONTACT_NAME: 4,
  EMAIL: 5,
  PHONE: 6,
  COMPETITOR: 7,
  SNAPSHOT_APPEARED: 8,
  VISIBILITY_BAND: 9,
  SERVICE_VISIBILITY: 10,
  STATUS: 11,
  RESEARCH_STATUS: 12,
  EMAIL_SENT_AT: 13,
  NOTES: 14,
  SOURCE: 15,
  LEAD_ID: 16,
  // v2
  LOCK_OWNER: 17,
  LOCK_EXPIRES_AT: 18,
  RETRY_COUNT: 19,
  LAST_STAGE: 20,
  LAST_ERROR: 21,
  PREFLIGHT_STARTED_AT: 22,
  PREFLIGHT_COMPLETED_AT: 23,
  RESEARCH_STARTED_AT: 24,
  RESEARCH_COMPLETED_AT: 25,
  REPORT_GENERATED_AT: 26,
  REPORT_URL: 27,
  COMPETITOR_MODE: 28,
  CLIENT_PROVIDED_COMPETITORS: 29,
  INTERNAL_COMPETITOR_SUGGESTIONS: 30,
  PLACES_VALIDATION_STATUS: 31,
  SONAR_VALIDATION_STATUS: 32,
} as const;

export type LeadStatus =
  | "new"
  | "preflight_queued"
  | "preflight_running"
  | "preflight_complete"
  | "preflight_partial"
  | "preflight_failed"
  | "research_queued"
  | "researching"
  | "research_complete"
  | "research_failed"
  | "rerun_queued"
  | "rerun_processing"
  | "rerun_completed"
  | "rerun_failed"
  | "pending_review"
  | "needs_revision"
  | "do_not_send"
  | "paid_checkout_complete"
  | "paid_intake_pending"
  | "paid_intake_submitted"
  | "paid_report_drafting"
  | "paid_report_ready_for_review"
  | "paid_report_delivered"
  | "approved"
  | "email_drafted"
  | "contacted"
  | "held"
  | "closed_won"
  | "closed_lost";

export type ResearchStatus =
  | "pending"
  | "running"
  | "complete"
  | "failed";

export type CompetitorMode =
  | "client_only"
  | "client_provided";

export type PipelineStage =
  | "intake"
  | "preflight"
  | "research"
  | "review"
  | "report"
  | "deliver";

export interface LeadRow {
  // Original fields
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
  // v2 pipeline state
  lockOwner: string;
  lockExpiresAt: string;
  retryCount: number;
  lastStage: string;
  lastError: string;
  preflightStartedAt: string;
  preflightCompletedAt: string;
  researchStartedAt: string;
  researchCompletedAt: string;
  reportGeneratedAt: string;
  reportUrl: string;
  competitorMode: string;
  clientProvidedCompetitors: string;
  internalCompetitorSuggestions: string;
  placesValidationStatus: string;
  sonarValidationStatus: string;
}

/** Lock duration in milliseconds (5 minutes) */
const LOCK_DURATION_MS = 5 * 60 * 1000;

// ─── Legacy Google Sheets auth helpers ────────────────────────────────

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
  const buffer = typeof input === "string" ? new TextEncoder().encode(input) : input;
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

// ─── Row helpers ────────────────────────────────────────────────────

function getSheetName(): string {
  return (process.env.GOOGLE_SHEETS_NAME || "Leads").trim();
}

function getSheetRange(): string {
  return `'${getSheetName()}'!A:AG`;
}

function parseRow(row: string[]): LeadRow {
  return {
    timestamp: row[COL.TIMESTAMP] || "",
    dealershipName: row[COL.DEALERSHIP_NAME] || "",
    website: row[COL.WEBSITE] || "",
    city: row[COL.CITY] || "",
    contactName: row[COL.CONTACT_NAME] || "",
    email: row[COL.EMAIL] || "",
    phone: row[COL.PHONE] || "",
    competitor: row[COL.COMPETITOR] || "",
    snapshotAppeared: row[COL.SNAPSHOT_APPEARED] || "",
    visibilityBand: row[COL.VISIBILITY_BAND] || "",
    serviceVisibility: row[COL.SERVICE_VISIBILITY] || "",
    status: (row[COL.STATUS] || "new") as LeadStatus,
    researchStatus: (row[COL.RESEARCH_STATUS] || "pending") as ResearchStatus,
    emailSentAt: row[COL.EMAIL_SENT_AT] || "",
    notes: row[COL.NOTES] || "",
    source: row[COL.SOURCE] || "",
    leadId: row[COL.LEAD_ID] || "",
    // v2
    lockOwner: row[COL.LOCK_OWNER] || "",
    lockExpiresAt: row[COL.LOCK_EXPIRES_AT] || "",
    retryCount: parseInt(row[COL.RETRY_COUNT] || "0", 10),
    lastStage: row[COL.LAST_STAGE] || "",
    lastError: row[COL.LAST_ERROR] || "",
    preflightStartedAt: row[COL.PREFLIGHT_STARTED_AT] || "",
    preflightCompletedAt: row[COL.PREFLIGHT_COMPLETED_AT] || "",
    researchStartedAt: row[COL.RESEARCH_STARTED_AT] || "",
    researchCompletedAt: row[COL.RESEARCH_COMPLETED_AT] || "",
    reportGeneratedAt: row[COL.REPORT_GENERATED_AT] || "",
    reportUrl: row[COL.REPORT_URL] || "",
    competitorMode: row[COL.COMPETITOR_MODE] || "",
    clientProvidedCompetitors: row[COL.CLIENT_PROVIDED_COMPETITORS] || "",
    internalCompetitorSuggestions: row[COL.INTERNAL_COMPETITOR_SUGGESTIONS] || "",
    placesValidationStatus: row[COL.PLACES_VALIDATION_STATUS] || "",
    sonarValidationStatus: row[COL.SONAR_VALIDATION_STATUS] || "",
  };
}

async function findLeadRow(leadId: string): Promise<{ rowIndex: number; sheetRow: number; data: string[][] } | null> {
  const result = await sheetsFetch<{ values: string[][] }>(`/values/${getSheetRange()}`);
  if (!result.values) return null;

  const rowIndex = result.values.findIndex((row) => row[COL.LEAD_ID] === leadId);
  if (rowIndex === -1) return null;

  return { rowIndex, sheetRow: rowIndex + 1, data: result.values };
}

// ─── Column map for generic updates ──────────────────────────────────

const FIELD_TO_COLUMN: Record<string, string> = {
  timestamp: "A",
  dealershipName: "B",
  website: "C",
  city: "D",
  contactName: "E",
  email: "F",
  phone: "G",
  competitor: "H",
  snapshotAppeared: "I",
  visibilityBand: "J",
  serviceVisibility: "K",
  status: "L",
  researchStatus: "M",
  emailSentAt: "N",
  notes: "O",
  source: "P",
  leadId: "Q",
  lockOwner: "R",
  lockExpiresAt: "S",
  retryCount: "T",
  lastStage: "U",
  lastError: "V",
  preflightStartedAt: "W",
  preflightCompletedAt: "X",
  researchStartedAt: "Y",
  researchCompletedAt: "Z",
  reportGeneratedAt: "AA",
  reportUrl: "AB",
  competitorMode: "AC",
  clientProvidedCompetitors: "AD",
  internalCompetitorSuggestions: "AE",
  placesValidationStatus: "AF",
  sonarValidationStatus: "AG",
};


// ─── Supabase CRM (primary source of truth) ───────────────────────────

type JsonRecord = Record<string, unknown>;

type SupabaseLeadRow = {
  id: string;
  business_name?: string | null;
  email?: string | null;
  website_url?: string | null;
  submitted_location?: string | null;
  submitted_niche?: string | null;
  competitor_1_name?: string | null;
  competitor_1_url?: string | null;
  competitor_2_name?: string | null;
  competitor_2_url?: string | null;
  competitor_source?: string | null;
  status?: string | null;
  source?: string | null;
  raw_intake?: JsonRecord | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseUrl(): string {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  return url;
}

function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  return key;
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = getSupabaseServiceKey();
  const response = await fetch(`${getSupabaseUrl()}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase REST ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function parseRawIntake(row: SupabaseLeadRow): JsonRecord {
  const raw = row.raw_intake;
  return raw && typeof raw === "object" ? raw : {};
}

function rawString(raw: JsonRecord, key: string): string {
  const value = raw[key];
  return typeof value === "string" ? value : "";
}

function rawNumber(raw: JsonRecord, key: string): number {
  const value = raw[key];
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value || 0);
  return 0;
}

function supabaseRowToLead(row: SupabaseLeadRow): LeadRow {
  const raw = parseRawIntake(row);
  const competitors = [row.competitor_1_name, row.competitor_2_name].filter(Boolean).join(", ");
  return {
    timestamp: row.created_at || rawString(raw, "timestamp"),
    dealershipName: row.business_name || rawString(raw, "dealershipName"),
    website: row.website_url || rawString(raw, "website"),
    city: row.submitted_location || rawString(raw, "city"),
    contactName: rawString(raw, "contactName") || rawString(raw, "name"),
    email: row.email || rawString(raw, "email"),
    phone: rawString(raw, "phone"),
    competitor: competitors || rawString(raw, "competitor"),
    snapshotAppeared: rawString(raw, "snapshotAppeared"),
    visibilityBand: rawString(raw, "visibilityBand"),
    serviceVisibility: rawString(raw, "serviceVisibility"),
    status: (row.status || rawString(raw, "status") || "new") as LeadStatus,
    researchStatus: (rawString(raw, "researchStatus") || "pending") as ResearchStatus,
    emailSentAt: rawString(raw, "emailSentAt"),
    notes: rawString(raw, "notes"),
    source: row.source || rawString(raw, "source"),
    leadId: row.id,
    lockOwner: rawString(raw, "lockOwner"),
    lockExpiresAt: rawString(raw, "lockExpiresAt"),
    retryCount: rawNumber(raw, "retryCount"),
    lastStage: rawString(raw, "lastStage"),
    lastError: rawString(raw, "lastError"),
    preflightStartedAt: rawString(raw, "preflightStartedAt"),
    preflightCompletedAt: rawString(raw, "preflightCompletedAt"),
    researchStartedAt: rawString(raw, "researchStartedAt"),
    researchCompletedAt: rawString(raw, "researchCompletedAt"),
    reportGeneratedAt: rawString(raw, "reportGeneratedAt"),
    reportUrl: rawString(raw, "reportUrl"),
    competitorMode: rawString(raw, "competitorMode") || (row.competitor_source === "submitted" ? "client_provided" : "client_only"),
    clientProvidedCompetitors: rawString(raw, "clientProvidedCompetitors") || competitors,
    internalCompetitorSuggestions: rawString(raw, "internalCompetitorSuggestions"),
    placesValidationStatus: rawString(raw, "placesValidationStatus"),
    sonarValidationStatus: rawString(raw, "sonarValidationStatus"),
  };
}

function splitCompetitors(value: string | undefined): [string | null, string | null] {
  const parts = (value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return [parts[0] || null, parts[1] || null];
}

export function normalizeSubmittedNicheForInsert(value?: string | null): string | null {
  const trimmed = (value || "").trim();
  return trimmed || null;
}

async function supabaseAppendLead(lead: Partial<LeadRow> & Pick<LeadRow, "timestamp" | "dealershipName" | "website" | "city" | "email">): Promise<string> {
  const [competitor1, competitor2] = splitCompetitors(lead.clientProvidedCompetitors || lead.competitor);
  const rawIntake = {
    ...lead,
    timestamp: lead.timestamp || new Date().toISOString(),
    status: lead.status || "new",
    researchStatus: lead.researchStatus || "pending",
    lastStage: lead.lastStage || "intake",
    retryCount: lead.retryCount || 0,
  };

  const rows = await supabaseFetch<SupabaseLeadRow[]>("/leads", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      business_name: lead.dealershipName,
      email: lead.email,
      website_url: lead.website,
      submitted_location: lead.city,
      submitted_niche: normalizeSubmittedNicheForInsert((lead as Partial<LeadRow> & { niche?: string }).niche),
      competitor_1_name: competitor1,
      competitor_2_name: competitor2,
      competitor_source: competitor1 || competitor2 ? "submitted" : "missing",
      status: lead.status || "new",
      source: lead.source || "snapshot funnel",
      raw_intake: rawIntake,
    }),
  });

  const leadId = rows?.[0]?.id;
  if (!leadId) throw new Error("Supabase lead insert did not return an id");

  await supabaseFetch("/lead_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      lead_id: leadId,
      event_type: "intake_submitted",
      event_payload: { source: lead.source || "snapshot funnel", competitorMode: lead.competitorMode || "client_only" },
    }),
  }).catch((error) => console.warn("[supabase-crm] lead event insert failed (non-fatal)", error));

  console.info("[supabase-crm] lead appended", { leadId, email: lead.email });
  return leadId;
}

async function supabaseGetAllLeads(): Promise<LeadRow[]> {
  const rows = await supabaseFetch<SupabaseLeadRow[]>("/leads?select=*&order=created_at.desc");
  return (rows || []).map(supabaseRowToLead);
}

async function supabaseGetLeadByLeadId(leadId: string): Promise<LeadRow | null> {
  const id = encodeURIComponent(leadId);
  const rows = await supabaseFetch<SupabaseLeadRow[]>(`/leads?select=*&id=eq.${id}&limit=1`);
  return rows?.[0] ? supabaseRowToLead(rows[0]) : null;
}

async function supabaseUpdateLead(leadId: string, updates: Record<string, string>): Promise<boolean> {
  const id = encodeURIComponent(leadId);
  const existingRows = await supabaseFetch<SupabaseLeadRow[]>(`/leads?select=*&id=eq.${id}&limit=1`);
  const existingRow = existingRows?.[0];
  if (!existingRow) throw new Error(`Lead ${leadId} not found in Supabase`);

  const existing = supabaseRowToLead(existingRow);

  const rawUpdates: JsonRecord = { ...parseRawIntake(existingRow) };
  for (const [field, value] of Object.entries(updates)) rawUpdates[field] = value;

  const patchBody: JsonRecord = { raw_intake: { ...existing, ...rawUpdates } };
  if (updates.status) patchBody.status = updates.status;
  if (updates.source) patchBody.source = updates.source;
  if (updates.competitor || updates.clientProvidedCompetitors || updates.competitorMode) {
    const competitorValue = updates.clientProvidedCompetitors || updates.competitor || existing.clientProvidedCompetitors || existing.competitor || "";
    const [competitor1 = "", competitor2 = ""] = competitorValue
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .slice(0, 2);
    patchBody.competitor_1_name = competitor1 || null;
    patchBody.competitor_2_name = competitor2 || null;
    patchBody.competitor_source = competitor1 && competitor2 ? "submitted" : "missing";
  }

  await supabaseFetch(`/leads?id=eq.${encodeURIComponent(leadId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patchBody),
  });

  await supabaseFetch("/lead_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      lead_id: leadId,
      event_type: "lead_updated",
      event_payload: { fields: Object.keys(updates) },
    }),
  }).catch((error) => console.warn("[supabase-crm] lead update event failed (non-fatal)", error));

  console.info("[supabase-crm] lead updated", { leadId, fields: Object.keys(updates) });
  return true;
}

// ─── Core CRUD ───────────────────────────────────────────────────────

export async function appendLead(lead: Partial<LeadRow> & Pick<LeadRow, "timestamp" | "dealershipName" | "website" | "city" | "email">): Promise<string> {
  if (isSupabaseConfigured()) return supabaseAppendLead(lead);

  const leadId = `VZB-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();

  const values = [[
    lead.timestamp || now,
    lead.dealershipName,
    lead.website,
    lead.city,
    lead.contactName || "",
    lead.email,
    lead.phone || "",
    lead.competitor || "",
    lead.snapshotAppeared || "",
    lead.visibilityBand || "",
    lead.serviceVisibility || "",
    lead.status || "new",
    lead.researchStatus || "pending",
    lead.emailSentAt || "",
    lead.notes || "",
    lead.source || "",
    leadId,
    // v2 — initialize pipeline state
    "", // lockOwner
    "", // lockExpiresAt
    "0", // retryCount
    "intake", // lastStage
    "", // lastError
    "", // preflightStartedAt
    "", // preflightCompletedAt
    "", // researchStartedAt
    "", // researchCompletedAt
    "", // reportGeneratedAt
    "", // reportUrl
    lead.competitorMode || "client_only",
    lead.clientProvidedCompetitors || lead.competitor || "",
    "", // internalCompetitorSuggestions
    "", // placesValidationStatus
    "", // sonarValidationStatus
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

export async function getAllLeads(): Promise<LeadRow[]> {
  if (isSupabaseConfigured()) return supabaseGetAllLeads();

  const data = await sheetsFetch<{ values: string[][] }>(`/values/${getSheetRange()}`);
  if (!data.values) return [];

  return data.values.slice(1)
    .filter((row) => row[COL.LEAD_ID] && row[COL.LEAD_ID].trim().length > 0)
    .map(parseRow);
}

export async function getLeadByLeadId(leadId: string): Promise<LeadRow | null> {
  if (isSupabaseConfigured()) return supabaseGetLeadByLeadId(leadId);

  const all = await getAllLeads();
  return all.find((lead) => lead.leadId === leadId) || null;
}

export async function getLeadsByStatus(status: LeadStatus): Promise<LeadRow[]> {
  const all = await getAllLeads();
  return all.filter((lead) => lead.status === status);
}

// ─── Generic update (supports all columns) ───────────────────────────

export async function updateLead(leadId: string, updates: Record<string, string>): Promise<boolean> {
  if (isSupabaseConfigured()) return supabaseUpdateLead(leadId, updates);

  const found = await findLeadRow(leadId);
  if (!found) throw new Error(`Lead ${leadId} not found in sheet`);

  const { sheetRow } = found;
  const sheetName = getSheetName();
  const cells: { range: string; values: string[][] }[] = [];

  for (const [field, value] of Object.entries(updates)) {
    const col = FIELD_TO_COLUMN[field];
    if (col) {
      cells.push({ range: `${sheetName}!${col}${sheetRow}`, values: [[value]] });
    }
  }

  if (cells.length === 0) return true;

  await sheetsFetch(`/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      data: cells,
      valueInputOption: "USER_ENTERED",
    }),
  });

  console.info("[sheets] lead updated", { leadId, fields: Object.keys(updates), row: sheetRow });
  return true;
}

// ─── Legacy update functions (backward compatible) ───────────────────

export async function updateLeadStatus(
  leadId: string,
  updates: Partial<Pick<LeadRow, "status" | "researchStatus" | "emailSentAt" | "notes">>,
): Promise<void> {
  const updateMap: Record<string, string> = {};
  if (updates.status) updateMap.status = updates.status;
  if (updates.researchStatus) updateMap.researchStatus = updates.researchStatus;
  if (updates.emailSentAt) updateMap.emailSentAt = updates.emailSentAt;
  // Notes: only update if provided and non-empty (protect operator notes)
  if (updates.notes) updateMap.notes = updates.notes;
  await updateLead(leadId, updateMap);
}

export async function updateLeadResearchResults(
  leadId: string,
  updates: {
    status?: LeadStatus;
    researchStatus?: ResearchStatus;
    snapshotAppeared?: string;
    visibilityBand?: string;
    serviceVisibility?: string;
    emailSentAt?: string;
    notes?: string;
  },
): Promise<void> {
  const updateMap: Record<string, string> = {};
  if (updates.status) updateMap.status = updates.status;
  if (updates.researchStatus) updateMap.researchStatus = updates.researchStatus;
  if (updates.snapshotAppeared) updateMap.snapshotAppeared = updates.snapshotAppeared;
  if (updates.visibilityBand) updateMap.visibilityBand = updates.visibilityBand;
  if (updates.serviceVisibility) updateMap.serviceVisibility = updates.serviceVisibility;
  if (updates.emailSentAt) updateMap.emailSentAt = updates.emailSentAt;
  if (updates.notes) updateMap.notes = updates.notes;
  await updateLead(leadId, updateMap);
}

// ─── Pipeline Locking ────────────────────────────────────────────────

/**
 * Acquire a processing lock for a lead.
 * Returns true if lock acquired, false if already locked by another owner (and not expired).
 */
export async function acquireLock(leadId: string, owner: string, durationMs: number = LOCK_DURATION_MS): Promise<boolean> {
  const lead = await getLeadByLeadId(leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  const now = Date.now();

  // Check existing lock
  if (lead.lockOwner && lead.lockExpiresAt) {
    const expiresAt = new Date(lead.lockExpiresAt).getTime();
    if (expiresAt > now && lead.lockOwner !== owner) {
      // Lock is active and owned by someone else
      console.warn(`[crm-store] Lock contention: ${leadId} locked by ${lead.lockOwner} until ${lead.lockExpiresAt}`);
      return false;
    }
    // Lock expired or same owner — allow takeover
    if (expiresAt <= now && lead.lockOwner !== owner) {
      console.info(`[crm-store] Lock takeover: ${leadId} expired lock from ${lead.lockOwner}`);
    }
  }

  const expiresAtIso = new Date(now + durationMs).toISOString();
  await updateLead(leadId, {
    lockOwner: owner,
    lockExpiresAt: expiresAtIso,
  });

  return true;
}

/**
 * Release a processing lock.
 */
export async function releaseLock(leadId: string, owner: string): Promise<void> {
  const lead = await getLeadByLeadId(leadId);
  if (!lead) return;

  // Only release if we own it
  if (lead.lockOwner === owner) {
    await updateLead(leadId, { lockOwner: "", lockExpiresAt: "" });
  }
}

// ─── Pipeline Stage Tracking ─────────────────────────────────────────

export interface StageTransition {
  status?: LeadStatus;
  researchStatus?: ResearchStatus;
  lastStage: PipelineStage;
  lastError?: string;
  retryCount?: number;
  // Timestamp fields
  preflightStartedAt?: string;
  preflightCompletedAt?: string;
  researchStartedAt?: string;
  researchCompletedAt?: string;
  reportGeneratedAt?: string;
  reportUrl?: string;
}

/**
 * Update pipeline stage state. Never overwrites operatorNotes.
 */
export async function updatePipelineState(leadId: string, transition: StageTransition): Promise<void> {
  const updates: Record<string, string> = {};

  if (transition.status) updates.status = transition.status;
  if (transition.researchStatus) updates.researchStatus = transition.researchStatus;
  updates.lastStage = transition.lastStage;
  if (transition.lastError !== undefined) updates.lastError = transition.lastError;
  if (transition.retryCount !== undefined) updates.retryCount = String(transition.retryCount);
  if (transition.preflightStartedAt) updates.preflightStartedAt = transition.preflightStartedAt;
  if (transition.preflightCompletedAt) updates.preflightCompletedAt = transition.preflightCompletedAt;
  if (transition.researchStartedAt) updates.researchStartedAt = transition.researchStartedAt;
  if (transition.researchCompletedAt) updates.researchCompletedAt = transition.researchCompletedAt;
  if (transition.reportGeneratedAt) updates.reportGeneratedAt = transition.reportGeneratedAt;
  if (transition.reportUrl) updates.reportUrl = transition.reportUrl;

  await updateLead(leadId, updates);
}

// ─── Idempotency Checks ──────────────────────────────────────────────

/**
 * Check if a stage has already completed (skip unless force=true).
 */
export function isStageComplete(lead: LeadRow, stage: PipelineStage): boolean {
  switch (stage) {
    case "preflight":
      return ["preflight_complete", "research_queued", "researching", "research_complete", "pending_review", "approved", "email_drafted", "contacted", "closed_won"].includes(lead.status);
    case "research":
      return ["research_complete", "pending_review", "approved", "email_drafted", "contacted", "closed_won"].includes(lead.status);
    case "report":
      return !!lead.reportGeneratedAt;
    default:
      return false;
  }
}

/**
 * Get the next stage that needs to run for a lead.
 */
export function getNextStage(lead: LeadRow): PipelineStage | null {
  const status = lead.status;

  if (["new", "preflight_queued", "preflight_failed"].includes(status)) return "preflight";
  if (["preflight_complete", "research_queued", "research_failed"].includes(status)) return "research";
  if (status === "pending_review" || status === "approved") return "report";

  return null;
}

// ─── Sheet Initialization ────────────────────────────────────────────

export async function initializeSheet(): Promise<void> {
  if (isSupabaseConfigured()) {
    console.info("[crm-store] Supabase configured; skipping legacy Google Sheets initialization");
    return;
  }

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
    // v2
    "Lock Owner",
    "Lock Expires At",
    "Retry Count",
    "Last Stage",
    "Last Error",
    "Preflight Started At",
    "Preflight Completed At",
    "Research Started At",
    "Research Completed At",
    "Report Generated At",
    "Report URL",
    "Competitor Mode",
    "Client Provided Competitors",
    "Internal Competitor Suggestions",
    "Places Validation Status",
    "Sonar Validation Status",
  ]];

  await sheetsFetch(`/values/${getSheetName()}!A1:AG1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values: headers }),
  });

  console.info("[sheets] v2 headers initialized (A-AG)");
}

export function isSheetsConfigured(): boolean {
  // Legacy name kept for existing imports. Supabase is now the primary CRM;
  // Google Sheets is only an optional mirror/export path.
  return isSupabaseConfigured() || !!(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}
