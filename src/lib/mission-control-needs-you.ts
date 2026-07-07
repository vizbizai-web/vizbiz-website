import type { LeadRow } from './google-sheets';
import { isSupabaseRestConfigured, supabaseRest } from './supabase-rest';

type TriageLike = { label: 'junk_candidate' | 'uncertain' | 'clean'; reasons: string[]; score: number };

export type NeedsYouTier = 'paid' | 'subscriber' | 'free' | 'failure';
export type NeedsYouAction = 'resolve_niche' | 'review_paid' | 'review_free' | 'approve_monthly' | 'approve_gated_email' | 'inspect_failure' | 'open_detail' | 'complete_paid_intake' | 'fulfill_paid_from_profile';

export interface NeedsYouBadge {
  label: string;
  tone: 'red' | 'amber' | 'blue' | 'cyan' | 'slate';
  detail?: string;
}

export interface NeedsYouItem {
  leadId: string;
  businessName: string;
  status: string;
  tier: NeedsYouTier;
  tierRank: number;
  primaryAction: NeedsYouAction;
  primaryActionLabel: string;
  ageHours: number | null;
  createdAt: string;
  reportPreviewUrl: string;
  detailUrl: string;
  nextLeadId?: string;
  badges: NeedsYouBadge[];
  flags: string[];
  city: string;
  email: string;
}

export interface McHealthStrip {
  today: { leadsIn: number; completed: number; failed: number };
  pass1FailureRate7d: { rate: number | null; failed: number; total: number; label: string };
  providerStatus: Array<{ provider: 'openai' | 'gemini' | 'perplexity'; ok: boolean | null; label: string; detail: string }>;
  spendEstimateTodayUsd: number;
  deployedSha: string;
  pipelineFlow: Array<{ status: string; count: number }>;
}

export interface PipelineLead extends LeadRow {
  triage?: TriageLike;
}

const PAID_REVIEW_STATUSES = new Set(['paid_report_ready_for_review']);
const FREE_REVIEW_STATUSES = new Set(['pending_review']);
const FAILURE_STATUSES = new Set(['research_failed', 'preflight_failed', 'rerun_failed', 'needs_revision']);
const SUBSCRIBER_RE = /monthly_one_pager|monthly-one-pager|competitor_movement_alert|fix_drop|fix-drop/i;

export function parseResearchData(notes: string | undefined): Record<string, any> | null {
  if (!notes) return null;
  const marker = 'RESEARCH_DATA:';
  const idx = notes.indexOf(marker);
  if (idx < 0) return null;
  try {
    return JSON.parse(notes.slice(idx + marker.length));
  } catch {
    return null;
  }
}

function ageHours(timestamp: string, nowMs: number): number | null {
  const parsed = Date.parse(timestamp || '');
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(((nowMs - parsed) / 3_600_000) * 100) / 100);
}

function paymentConfirmedAt(lead: PipelineLead): string {
  return Array.from((lead.notes || '').matchAll(/\[PAYMENT_CONFIRMED\s+([^\]]+)\]/gi)).at(-1)?.[1] || lead.timestamp || '';
}

function paidIntakeAgeHours(lead: PipelineLead, nowMs = Date.now()): number | null {
  const parsed = Date.parse(paymentConfirmedAt(lead));
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, (nowMs - parsed) / 3_600_000);
}

function tierFor(lead: PipelineLead, nowMs = Date.now()): { tier: NeedsYouTier; rank: number; action: NeedsYouItem['primaryAction']; label: string } | null {
  const status = lead.status || 'new';
  const notes = lead.notes || '';
  if (status === 'paid_intake_pending') {
    const hours = paidIntakeAgeHours(lead, nowMs);
    if (hours != null && hours >= 72) return { tier: 'paid', rank: 1, action: 'fulfill_paid_from_profile', label: 'Fulfill from resolved profile' };
    if (hours != null && hours >= 24) return { tier: 'paid', rank: 1, action: 'complete_paid_intake', label: 'Paid intake stalled' };
  }
  if (FAILURE_STATUSES.has(status) || /snapshotWriteError|webhook failure|PASS_1_FAILURE_RATE_BREACH/i.test(notes)) {
    return { tier: 'failure', rank: 4, action: 'inspect_failure', label: 'Inspect failure' };
  }
  if (status === 'paid_report_ready_for_review' || PAID_REVIEW_STATUSES.has(status)) {
    return { tier: 'paid', rank: 1, action: 'review_paid', label: 'Review paid report' };
  }
  if (/GATED_EMAIL_READY.*templateId=E11_30_DAY_RESCAN/i.test(notes) && !/GATED_EMAIL_APPROVED.*templateId=E11_30_DAY_RESCAN/i.test(notes)) {
    return { tier: 'subscriber', rank: 2, action: 'approve_gated_email', label: 'Approve 30-day re-test email' };
  }
  if (SUBSCRIBER_RE.test(notes) && /awaiting|pending|approve/i.test(notes)) {
    return { tier: 'subscriber', rank: 2, action: 'approve_monthly', label: 'Approve monthly item' };
  }
  if (FREE_REVIEW_STATUSES.has(status)) {
    return { tier: 'free', rank: 3, action: 'review_free', label: status === 'pending_review' ? 'Review free report' : 'Continue approval flow' };
  }
  return null;
}

function getQualityBadges(lead: PipelineLead): NeedsYouBadge[] {
  const badges: NeedsYouBadge[] = [];
  const notes = lead.notes || '';
  const places = lead.placesValidationStatus || '';
  const research = parseResearchData(notes);
  const warningBlob = [notes, places, research?.recommendedNextStep, research?.qualityWarning, ...(Array.isArray(research?.warnings) ? research.warnings : [])]
    .filter(Boolean)
    .join(' ');

  if (/places.*(unavailable|not available|not configured|low confidence|mismatch|not found|none)|google places.*(unavailable|not available|not configured|not found)|regional/i.test(warningBlob)) {
    badges.push({ label: 'Places gap', tone: 'amber', detail: 'Regional or low-confidence Google Places evidence needs careful read.' });
  }
  if (/language|spanish|español|non-english|translation|locale|market language/i.test(warningBlob)) {
    badges.push({ label: 'Language check', tone: 'blue', detail: 'Review language/market phrasing before approval.' });
  }
  if (/zero appearances|only \d+ competitor|prompts may not match|quality warning/i.test(warningBlob)) {
    badges.push({ label: 'Quality warning', tone: 'red', detail: 'Research payload flagged a low-quality or mismatch risk.' });
  }
  if (lead.status === 'paid_intake_pending') {
    badges.push({ label: 'Paid intake stalled', tone: 'amber', detail: 'Client has paid but has not completed confirm-and-enrich intake.' });
    const hours = paidIntakeAgeHours(lead);
    if (hours != null && hours >= 72) badges.push({ label: '72h fallback allowed', tone: 'cyan', detail: 'Operator can fulfill using resolved profile alone.' });
  }
  if (lead.triage?.label === 'uncertain') {
    badges.push({ label: 'Uncertain triage', tone: 'amber', detail: lead.triage.reasons.join(', ') });
  }
  if (lead.triage?.label === 'junk_candidate') {
    badges.push({ label: 'Junk candidate', tone: 'red', detail: lead.triage.reasons.join(', ') });
  }
  return badges;
}

export function buildNeedsYouQueue(leads: PipelineLead[], now = new Date()): NeedsYouItem[] {
  const nowMs = now.getTime();
  const items = leads
    .map((lead) => {
      const tier = tierFor(lead, nowMs);
      if (!tier) return null;
      const badges = getQualityBadges(lead);
      return {
        leadId: lead.leadId,
        businessName: lead.dealershipName || 'Unknown Business',
        status: lead.status || 'new',
        tier: tier.tier,
        tierRank: tier.rank,
        primaryAction: tier.action,
        primaryActionLabel: tier.label,
        ageHours: ageHours(lead.timestamp, nowMs),
        createdAt: lead.timestamp || '',
        reportPreviewUrl: `/mission-control/report-preview/${lead.leadId}`,
        detailUrl: `/mission-control/leads/${lead.leadId}`,
        badges,
        flags: badges.map((badge) => badge.label),
        city: lead.city || '',
        email: lead.email || '',
      } satisfies NeedsYouItem;
    })
    .filter(Boolean) as NeedsYouItem[];

  items.sort((a, b) => {
    if (a.tierRank !== b.tierRank) return a.tierRank - b.tierRank;
    const aTime = Date.parse(a.createdAt || '') || 0;
    const bTime = Date.parse(b.createdAt || '') || 0;
    return aTime - bTime;
  });

  return items.map((item, index) => ({ ...item, nextLeadId: items[index + 1]?.leadId }));
}

type SnapshotProviderRow = {
  created_at?: string;
  platform_scores?: any;
  prompt_results?: any;
  status?: string;
  error_message?: string | null;
};

export async function enrichProviderStatusFromLatestSnapshot(health: McHealthStrip): Promise<McHealthStrip> {
  if (!isSupabaseRestConfigured()) return health;
  try {
    const rows = await supabaseRest<SnapshotProviderRow[]>('/audit_snapshots?select=created_at,platform_scores,prompt_results,status,error_message&order=created_at.desc&limit=1');
    const row = rows?.[0];
    if (!row) return health;
    const providers = ['openai', 'gemini', 'perplexity'] as const;
    const platformScores = Array.isArray(row.platform_scores) ? row.platform_scores : [];
    const promptResults = Array.isArray(row.prompt_results) ? row.prompt_results : [];
    return {
      ...health,
      providerStatus: providers.map((provider) => {
        const score = platformScores.find((s: any) => s?.provider === provider);
        const results = promptResults.filter((r: any) => r?.provider === provider);
        const total = Number(score?.totalPrompts || results.length || 0);
        const failed = results.filter((r: any) => r?.status === 'failed' || r?.executionStatus === 'failed' || r?.error).length;
        return {
          provider,
          ok: total > 0 ? failed === 0 && row.status !== 'failed' : false,
          label: provider === 'openai' ? 'ChatGPT' : provider === 'gemini' ? 'Gemini' : 'Perplexity',
          detail: total > 0 ? `${total} latest snapshot executions${failed ? ` · ${failed} failures` : ''}` : 'No latest snapshot executions',
        };
      }),
    };
  } catch {
    return health;
  }
}

export function buildMcHealthStrip(leads: PipelineLead[], opts: { now?: Date; deployedSha?: string } = {}): McHealthStrip {
  const now = opts.now || new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const todayLeads = leads.filter((lead) => (lead.timestamp || '').slice(0, 10) === todayKey);
  const completed = todayLeads.filter((lead) => ['approved', 'email_drafted', 'contacted', 'paid_report_delivered', 'closed_won'].includes(lead.status)).length;
  const failed = todayLeads.filter((lead) => /failed|needs_revision|do_not_send/.test(lead.status || '')).length;

  const recentResearch = leads.map((lead) => parseResearchData(lead.notes)).find((rd) => rd && (Array.isArray(rd.platformScores) || Array.isArray(rd.promptResults)));
  const providers = ['openai', 'gemini', 'perplexity'] as const;
  const providerStatus = providers.map((provider) => {
    const score = Array.isArray(recentResearch?.platformScores) ? recentResearch.platformScores.find((s: any) => s?.provider === provider) : null;
    const results = Array.isArray(recentResearch?.promptResults) ? recentResearch.promptResults.filter((r: any) => r?.provider === provider) : [];
    const total = Number(score?.totalPrompts || results.length || 0);
    const failures = Array.isArray(recentResearch?.executionFailures)
      ? recentResearch.executionFailures.filter((f: any) => f?.provider === provider).length
      : 0;
    return {
      provider,
      ok: total > 0 ? failures === 0 : null,
      label: provider === 'openai' ? 'ChatGPT' : provider === 'gemini' ? 'Gemini' : 'Perplexity',
      detail: total > 0 ? `${total} latest executions${failures ? ` · ${failures} failures` : ''}` : 'No recent provider evidence',
    };
  });

  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const recentNotes = leads.filter((lead) => (Date.parse(lead.timestamp || '') || 0) >= sevenDaysAgo).map((lead) => lead.notes || '').join('\n');
  const pass1Failed = (recentNotes.match(/pass_1_structured_failure|Pass 1 structured-output failure|PASS_1_FAILURE/gi) || []).length;
  const pass1Total = Math.max(leads.filter((lead) => (Date.parse(lead.timestamp || '') || 0) >= sevenDaysAgo).length, pass1Failed);
  const pass1Rate = pass1Total ? pass1Failed / pass1Total : null;

  const spendEstimateTodayUsd = todayLeads.reduce((sum, lead) => {
    const rd = parseResearchData(lead.notes);
    const estimate = typeof rd?.costEstimate?.paid === 'number'
      ? rd.costEstimate.paid
      : typeof rd?.costEstimate?.free === 'number'
        ? rd.costEstimate.free
        : lead.status?.startsWith('paid') ? 0.75 : 0.2;
    return sum + estimate;
  }, 0);

  const statuses = ['new', 'researching', 'pending_review', 'approved', 'email_drafted', 'contacted', 'closed_won'];
  const pipelineFlow = statuses.map((status) => ({ status, count: leads.filter((lead) => (lead.status || 'new') === status).length }));

  return {
    today: { leadsIn: todayLeads.length, completed, failed },
    pass1FailureRate7d: {
      rate: pass1Rate,
      failed: pass1Failed,
      total: pass1Total,
      label: pass1Rate == null ? 'No 7-day sample' : `${(pass1Rate * 100).toFixed(1)}%`,
    },
    providerStatus,
    spendEstimateTodayUsd: Math.round(spendEstimateTodayUsd * 100) / 100,
    deployedSha: opts.deployedSha || process.env.NEXT_PUBLIC_BUILD_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    pipelineFlow,
  };
}
