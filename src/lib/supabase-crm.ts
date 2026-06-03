import type { MiniAuditReport } from "@/engines/research/mini-audit";
import type { AuditReport, ClientInput, CompetitorBenchmark } from "@/engines/research/types";
import type { EmailDeliveryStatus } from "@/lib/lead-pipeline";
import type { CompetitorSource } from "@/lib/mini-audit-intake";

interface SupabaseInsertResult<T> {
  data: T | null;
  error: Error | null;
}

export interface SupabaseLeadRow {
  id: string;
  business_name: string;
  email: string;
  website_url: string;
  submitted_location: string | null;
  submitted_niche: string | null;
  competitor_1_name: string | null;
  competitor_1_url: string | null;
  competitor_2_name: string | null;
  competitor_2_url: string | null;
  competitor_source: "submitted" | "auto_discovered" | "mixed" | "missing";
  status: string;
  source: string;
  raw_intake: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupabaseReportJobRow {
  id: string;
  type: string;
  status: string;
  lead_id: string | null;
  paid_order_id: string | null;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
  locked_at: string | null;
  locked_by: string | null;
  last_error: string | null;
  result: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function hasSupabaseServerConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function createSupabaseLead(input: {
  lead: { email: string; competitorSource: CompetitorSource; auditInput: ClientInput };
  rawIntake: Record<string, unknown>;
}): Promise<SupabaseInsertResult<SupabaseLeadRow>> {
  return safeSupabaseInsert<SupabaseLeadRow>("leads", {
    business_name: input.lead.auditInput.name,
    email: input.lead.email,
    website_url: input.lead.auditInput.websiteUrl ?? "https://unknown.local",
    submitted_location: input.lead.auditInput.city,
    submitted_niche: input.lead.auditInput.businessType ?? input.lead.auditInput.primaryService ?? null,
    competitor_1_name: input.lead.auditInput.competitors?.[0]?.name ?? null,
    competitor_1_url: input.lead.auditInput.competitors?.[0]?.websiteUrl ?? null,
    competitor_2_name: input.lead.auditInput.competitors?.[1]?.name ?? null,
    competitor_2_url: input.lead.auditInput.competitors?.[1]?.websiteUrl ?? null,
    competitor_source: mapCompetitorSource(input.lead.competitorSource),
    status: "new",
    source: "website_intake",
    raw_intake: input.rawIntake,
  });
}

export async function saveSupabaseCompetitors(input: {
  leadId: string;
  competitors: CompetitorBenchmark[];
  source: CompetitorSource;
}) {
  if (!input.competitors.length) return { data: [], error: null };
  return safeSupabaseInsert("competitor_candidates", input.competitors.map((competitor, index) => ({
    lead_id: input.leadId,
    source: input.source === "user_supplied" ? "submitted" : input.source === "none" ? "manual" : input.source,
    name: competitor.name,
    website_url: competitor.websiteUrl ?? null,
    reason_selected: input.source === "user_supplied" ? "Supplied by intake form" : "Added by VizBiz pipeline",
    confidence_score: input.source === "user_supplied" ? 1 : null,
    rank_order: index + 1,
  })));
}

export async function saveSupabaseMiniReport(input: {
  leadId: string;
  report: MiniAuditReport & { leadEmail?: string; competitorSource?: CompetitorSource; competitorNote?: string };
  absoluteReportUrl: string;
  emailDeliveryStatus: EmailDeliveryStatus;
}) {
  return safeSupabaseInsert("mini_reports", {
    lead_id: input.leadId,
    slug: input.report.slug,
    avi_score: input.report.aviScore,
    social_proof_score: input.report.socialProofScore?.score ?? null,
    local_clarity_score: input.report.businessProfile?.confidence ? Math.round(input.report.businessProfile.confidence * 100) : null,
    competitor_gap_summary: input.report.competitorNote ?? null,
    top_visibility_gaps: input.report.topVisibilityGaps ?? [],
    report_json: input.report,
    report_url: input.absoluteReportUrl,
    email_subject: input.report.emailMiniReport.subject,
    email_preview: input.report.emailMiniReport.previewText,
    sent_at: input.emailDeliveryStatus === "sent" ? new Date().toISOString() : null,
  });
}

export async function findSupabaseMiniReportBySlug(
  slug: string,
): Promise<(MiniAuditReport & { leadEmail?: string; competitorSource?: CompetitorSource; competitorNote?: string }) | null> {
  if (!hasSupabaseServerConfig()) return null;
  try {
    const reports = await supabaseFetch<Array<{ report_json: MiniAuditReport & { leadEmail?: string; competitorSource?: CompetitorSource; competitorNote?: string } }>>(
      `mini_reports?select=report_json&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { method: "GET" },
    );
    return reports[0]?.report_json ?? null;
  } catch {
    return null;
  }
}

export async function markSupabaseMiniReportViewed(slug: string) {
  const lead = await findSupabaseLeadByReportSlug(slug);
  if (!lead) return { ok: false };
  const event = await createSupabaseLeadEvent({
    leadId: lead.id,
    eventType: "report_viewed",
    payload: { slug },
  });
  return { ok: !event.error };
}

export async function saveSupabaseSiteIntelligencePlaceholder(input: {
  leadId: string;
  audit: AuditReport;
}) {
  const client = input.audit.client;
  return safeSupabaseInsert("site_crawls", {
    lead_id: input.leadId,
    homepage_url: client.websiteUrl ?? "https://unknown.local",
    pages_crawled: client.websiteUrl ? [client.websiteUrl] : [],
    detected_business_name: client.name,
    detected_city: client.city,
    schema_types: [],
    sitemap_found: false,
    llms_txt_found: false,
    social_links: [],
    review_links: [],
    trust_signals: {},
    llm_readiness_signals: {},
    raw_summary: "Initial CRM placeholder. Full site-intelligence crawl will populate this row in the production pipeline.",
    confidence_score: null,
  });
}

export async function saveSupabaseBusinessProfile(input: {
  leadId: string;
  report: MiniAuditReport;
}) {
  const profile = input.report.businessProfile;
  if (!profile) return { data: null, error: null };
  return safeSupabaseInsert("business_profiles", {
    lead_id: input.leadId,
    primary_category: profile.niche,
    secondary_categories: [],
    primary_services: profile.primaryServices ?? [],
    service_areas: [profile.city],
    target_city: input.report.client.city,
    target_region: null,
    target_country: null,
    buyer_intent_prompts: input.report.buyerQuestionTest?.prompts ?? [],
    inference_notes: "Generated from current mini-audit report profile.",
    confidence_score: profile.confidence ?? null,
  });
}

export async function findSupabaseLeadByReportSlug(slug: string): Promise<SupabaseLeadRow | null> {
  if (!hasSupabaseServerConfig()) return null;
  try {
    const reports = await supabaseFetch<Array<{ lead_id: string }>>(`mini_reports?select=lead_id&slug=eq.${encodeURIComponent(slug)}&limit=1`, { method: "GET" });
    const leadId = reports[0]?.lead_id;
    if (!leadId) return null;
    const leads = await supabaseFetch<SupabaseLeadRow[]>(`leads?select=*&id=eq.${encodeURIComponent(leadId)}&limit=1`, { method: "GET" });
    return leads[0] ?? null;
  } catch {
    return null;
  }
}

export async function createSupabaseLeadEvent(input: {
  leadId?: string;
  eventType: string;
  payload?: Record<string, unknown>;
}) {
  if (!input.leadId) return { data: null, error: null };
  return safeSupabaseInsert("lead_events", {
    lead_id: input.leadId,
    event_type: input.eventType,
    event_payload: input.payload ?? {},
  });
}

export async function createSupabasePaidOrder(input: {
  leadId?: string | null;
  miniReportId?: string | null;
  product: "fix_package" | "monthly_plan";
  amountCents: number;
  currency?: string;
  stripeCheckoutSessionId?: string | null;
  stripeCustomerId?: string | null;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  rawPayload?: Record<string, unknown>;
}) {
  return safeSupabaseInsert("paid_orders", {
    lead_id: input.leadId ?? null,
    mini_report_id: input.miniReportId ?? null,
    product: input.product,
    amount_cents: input.amountCents,
    currency: input.currency ?? "usd",
    stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    stripe_customer_id: input.stripeCustomerId ?? null,
    status: input.status,
    raw_payload: input.rawPayload ?? {},
  });
}

export async function createSupabaseTelegramAlertLog(input: {
  leadId?: string | null;
  alertType: string;
  chatId?: string | null;
  threadId?: string | null;
  messageId?: string | null;
  status: "pending" | "sent" | "failed";
  errorMessage?: string | null;
}) {
  return safeSupabaseInsert("telegram_alert_logs", {
    lead_id: input.leadId ?? null,
    alert_type: input.alertType,
    chat_id: input.chatId ?? null,
    thread_id: input.threadId ?? null,
    message_id: input.messageId ?? null,
    status: input.status,
    error_message: input.errorMessage ?? null,
  });
}

export async function createSupabaseReportJob(input: {
  id: string;
  type: string;
  status: string;
  leadId?: string | null;
  paidOrderId?: string | null;
  payload?: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  lockedAt?: string | null;
  lockedBy?: string | null;
  lastError?: string | null;
  result?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}): Promise<SupabaseInsertResult<SupabaseReportJobRow>> {
  return safeSupabaseInsert<SupabaseReportJobRow>("report_jobs", {
    id: input.id,
    type: input.type,
    status: input.status,
    lead_id: input.leadId ?? null,
    paid_order_id: input.paidOrderId ?? null,
    payload: input.payload ?? {},
    attempts: input.attempts,
    max_attempts: input.maxAttempts,
    locked_at: input.lockedAt ?? null,
    locked_by: input.lockedBy ?? null,
    last_error: input.lastError ?? null,
    result: input.result ?? null,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  });
}

export async function listSupabaseReportJobs(status?: string): Promise<SupabaseReportJobRow[]> {
  if (!hasSupabaseServerConfig()) return [];
  const statusFilter = status ? `&status=eq.${encodeURIComponent(status)}` : "";
  return supabaseFetch<SupabaseReportJobRow[]>(
    `report_jobs?select=*&order=created_at.asc${statusFilter}`,
    { method: "GET" },
  );
}

export async function readSupabaseReportJob(id: string): Promise<SupabaseReportJobRow | null> {
  if (!hasSupabaseServerConfig()) return null;
  const rows = await supabaseFetch<SupabaseReportJobRow[]>(`report_jobs?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, { method: "GET" });
  return rows[0] ?? null;
}

export async function updateSupabaseReportJob(
  id: string,
  patch: Partial<Omit<SupabaseReportJobRow, "id" | "created_at">>,
): Promise<SupabaseReportJobRow> {
  const rows = await supabaseFetch<SupabaseReportJobRow[]>(`report_jobs?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    headers: { Prefer: "return=representation" },
  });
  if (!rows[0]) throw new Error(`Report job not found: ${id}`);
  return rows[0];
}

export async function createSupabaseFulfillmentTask(input: {
  leadId?: string | null;
  paidOrderId?: string | null;
  product: "fix_package" | "monthly_plan";
  title: string;
  description: string;
  status?: "intake_pending" | "queued" | "in_progress" | "delivered" | "cancelled";
  priority?: "normal" | "high" | "urgent";
  rawPayload?: Record<string, unknown>;
}) {
  return safeSupabaseInsert<{ id: string }>("paid_fulfillment_tasks", {
    lead_id: input.leadId ?? null,
    paid_order_id: input.paidOrderId ?? null,
    product: input.product,
    title: input.title,
    description: input.description,
    status: input.status ?? "intake_pending",
    priority: input.priority ?? "urgent",
    raw_payload: input.rawPayload ?? {},
  });
}

export async function updateSupabaseLeadStatus(input: { leadId?: string; status: SupabaseLeadRow["status"] }) {
  if (!input.leadId || !hasSupabaseServerConfig()) return { ok: false };
  try {
    await supabaseFetch(`leads?id=eq.${encodeURIComponent(input.leadId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: input.status }),
      headers: { Prefer: "return=minimal" },
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

async function safeSupabaseInsert<T = unknown>(table: string, payload: unknown): Promise<SupabaseInsertResult<T>> {
  if (!hasSupabaseServerConfig()) return { data: null, error: new Error("Supabase server config is missing") };
  try {
    const result = await supabaseFetch<T[]>(table, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { Prefer: "return=representation" },
    });
    return { data: Array.isArray(result) ? (result[0] as T) : (result as T), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Supabase insert failed") };
  }
}

async function supabaseFetch<T>(path: string, init: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key) throw new Error("Supabase server config is missing");

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase ${path} failed: ${response.status} ${message}`);
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

function mapCompetitorSource(source: CompetitorSource): SupabaseLeadRow["competitor_source"] {
  if (source === "user_supplied") return "submitted";
  if (source === "auto_discovered") return "auto_discovered";
  if (source === "mixed") return "mixed";
  return "missing";
}
