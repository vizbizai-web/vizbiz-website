import { supabaseRest, isSupabaseRestConfigured } from './supabase-rest';
import { appendAuditSnapshot, listAuditSnapshots, type AuditSnapshot } from './audit-snapshots';
import { getFixKit, saveFixKit } from './fix-kit-store';
import type { LeadRow } from './google-sheets';
import type { FixKitResult } from './fix-kit-generator';

export const CLIENT_ZERO_SOURCE = 'client_zero';
export const CLIENT_ZERO_BUSINESS = 'VizBiz';
export const CLIENT_ZERO_WEBSITE = 'https://vizbiz.ai';
export const CLIENT_ZERO_MARKET = 'Ontario, Canada';
export const CLIENT_ZERO_NICHE = 'AI visibility service for local businesses';
export const CLIENT_ZERO_COMPETITORS = ['Otterly', 'Peec'];
export const CLIENT_ZERO_SUBSCRIPTION_ID = 'client_zero_internal_subscription';

export type ClientZeroDashboardModel = {
  lead: { leadId: string; businessName: string; website: string; market: string } | null;
  snapshots: AuditSnapshot[];
  monthlySnapshots: AuditSnapshot[];
  pulseSnapshots: AuditSnapshot[];
  scorePoints: Array<{ sequence: number; label: string; score: number | null; tier: string; runType: string; createdAt?: string }>;
  engineLines: Array<{ provider: string; points: Array<{ sequence: number; rate: number; runType: string }> }>;
  categoryScorecard: Array<{ categoryId: string; categoryName: string; currentRate: number; sparkline: number[] }>;
  competitorOverlay: Array<{ name: string; currentRate: number; points: number[] }>;
  sourceLedger: Array<{ domain: string; count: number; present: boolean }>;
  fixStatus: { ready: boolean; titles: string[]; status?: string };
  publicReady: boolean;
  approvedAt?: string | null;
};

export function isOperatorMetricExcludedSource(source?: string | null): boolean {
  const s = (source || '').trim().toLowerCase();
  return s.startsWith('qa_') || s === CLIENT_ZERO_SOURCE;
}

export function clientZeroLeadPayload(now = new Date()): LeadRow {
  const notes = [
    `[CLIENT_ZERO ${now.toISOString()}] permanent self-audit lead`,
    `[CLIENT_VERIFIED_PROFILE ${now.toISOString()} evidenceTier=client_verified niche="${CLIENT_ZERO_NICHE}"]`,
    `RESEARCH_DATA:${JSON.stringify({ nicheLabel: CLIENT_ZERO_NICHE, services: ['AI visibility audits', 'AI search visibility fixes', 'monthly AI visibility monitoring'], primaryMarket: CLIENT_ZERO_MARKET, searchLanguage: 'en' })}`,
  ].join('\n');
  return {
    timestamp: now.toISOString(), dealershipName: CLIENT_ZERO_BUSINESS, website: CLIENT_ZERO_WEBSITE, city: CLIENT_ZERO_MARKET,
    contactName: 'Alex', email: 'alex@vizbiz.ai', phone: '', competitor: CLIENT_ZERO_COMPETITORS.join(', '),
    snapshotAppeared: '', visibilityBand: '', serviceVisibility: 'AI visibility audits, AI search visibility fixes, monthly monitoring',
    status: 'paid_intake_submitted', researchStatus: 'complete', emailSentAt: '', notes, source: CLIENT_ZERO_SOURCE,
    leadId: '', lockOwner: '', lockExpiresAt: '', retryCount: 0, lastStage: 'client_zero_registered', lastError: '',
    preflightStartedAt: '', preflightCompletedAt: '', researchStartedAt: '', researchCompletedAt: '', reportGeneratedAt: '', reportUrl: '',
    competitorMode: 'client_provided', clientProvidedCompetitors: CLIENT_ZERO_COMPETITORS.join(', '), internalCompetitorSuggestions: '', placesValidationStatus: 'client_verified', sonarValidationStatus: '',
  };
}

function rawLeadToLead(row: any): LeadRow {
  const raw = row.raw_intake || {};
  return { ...clientZeroLeadPayload(new Date(row.created_at || Date.now())), ...raw, leadId: row.id, status: row.status || raw.status, source: row.source || raw.source };
}

export async function getClientZeroLead(): Promise<LeadRow | null> {
  if (!isSupabaseRestConfigured()) return null;
  const rows = await supabaseRest<any[]>(`/leads?select=*&source=eq.${CLIENT_ZERO_SOURCE}&order=created_at.asc&limit=1`);
  return rows?.[0] ? rawLeadToLead(rows[0]) : null;
}

export async function ensureClientZeroLead(now = new Date()): Promise<LeadRow> {
  if (!isSupabaseRestConfigured()) throw new Error('Client Zero requires Supabase');
  const existing = await getClientZeroLead();
  if (existing?.leadId) return existing;
  const lead = clientZeroLeadPayload(now);
  const rows = await supabaseRest<any[]>('/leads', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({
    business_name: lead.dealershipName, email: lead.email, website_url: lead.website, submitted_location: lead.city, submitted_niche: CLIENT_ZERO_NICHE,
    competitor_1_name: CLIENT_ZERO_COMPETITORS[0], competitor_2_name: CLIENT_ZERO_COMPETITORS[1], competitor_source: 'submitted', status: lead.status, source: CLIENT_ZERO_SOURCE, raw_intake: lead,
  })});
  await supabaseRest('/lead_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ lead_id: rows?.[0]?.id, event_type: 'client_zero_registered', event_payload: { source: CLIENT_ZERO_SOURCE } }) }).catch(() => undefined);
  return rawLeadToLead(rows[0]);
}

export async function ensureClientZeroSubscription(leadId: string, nextRunAt?: string) {
  const existing = await supabaseRest<any[]>(`/subscriptions_local?select=*&stripe_subscription_id=eq.${CLIENT_ZERO_SUBSCRIPTION_ID}&limit=1`).catch(() => []);
  const body = { lead_id: leadId, stripe_subscription_id: CLIENT_ZERO_SUBSCRIPTION_ID, status: 'active', next_run_at: nextRunAt || new Date().toISOString(), paused_reason: null, last_error: null, updated_at: new Date().toISOString() };
  if (existing?.[0]?.id) return supabaseRest(`/subscriptions_local?id=eq.${existing[0].id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(body) });
  return supabaseRest('/subscriptions_local', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(body) });
}

export function buildFixtureResearchResult(total = 180, appeared = 27) {
  const providers = ['openai', 'gemini', 'perplexity'] as const;
  const categories = ['C1','C2','C3','C4','C5','C6','C7','C8'];
  const promptResults: any[] = [];
  let idx = 0;
  for (const provider of providers) for (let i = 0; i < total / providers.length; i++) {
    const cat = categories[idx % categories.length];
    promptResults.push({ prompt: `${cat} VizBiz visibility question ${i + 1}`, provider, businessAppeared: idx < appeared, competitorAppeared: idx % 5 === 0, competitorName: idx % 2 === 0 ? 'Otterly' : 'Peec', categoryId: cat, categoryName: `${cat} category`, citations: idx % 7 === 0 ? ['https://vizbiz.ai/proof'] : ['https://example.com/source'] });
    idx++;
  }
  return {
    appearedCount: appeared, totalPrompts: total, statusBand: appeared / total > 0.25 ? 'Emerging' : 'Weak', serviceVisibility: 'Appears selectively for AI visibility questions.',
    prompts: promptResults.map((r) => r.prompt), promptResults,
    platformScores: providers.map((provider) => { const rows = promptResults.filter((r) => r.provider === provider); const yes = rows.filter((r) => r.businessAppeared).length; const label = (provider === 'openai' ? 'ChatGPT' : provider === 'gemini' ? 'Gemini' : 'Perplexity') as 'ChatGPT' | 'Gemini' | 'Perplexity'; return { provider, label, appearedCount: yes, totalPrompts: rows.length, appearanceRate: yes / rows.length, status: 'tested' as const }; }),
    competitorScores: [], promptPlanMetadata: { version: 'client-zero-fixture', hash: total === 15 ? 'pulse-plan' : 'monthly-plan', prompts: promptResults.map((r, i) => ({ id: `cz-${i}`, text: r.prompt, categoryId: r.categoryId, categoryName: r.categoryName })) },
    costEstimate: { free: 0.05, paid: 0.75 }, batteryVersion: 'battery-v2:60x8',
  };
}

export async function appendClientZeroFixtureSnapshot(input: { leadId: string; runType: 'baseline' | 'monthly' | 'pulse'; tier: 'free' | 'paid'; appeared: number; total?: number }) {
  const total = input.total || (input.tier === 'free' ? 15 : 180);
  const research = buildFixtureResearchResult(total, input.appeared);
  const snapshots = await listAuditSnapshots(input.leadId);
  const payload = {
    leadId: input.leadId, sequence: snapshots.length + 1, runType: input.runType as any, tier: input.tier as any, profileHash: 'client-zero-profile-v1',
    promptPlan: { prompts: research.promptPlanMetadata.prompts, version: research.promptPlanMetadata.version, hash: research.promptPlanMetadata.hash, batteryVersion: research.batteryVersion, runType: input.runType },
    platformScores: research.platformScores, blendedScore: input.appeared / total, band: research.statusBand, promptResults: research.promptResults, competitorScores: [], readiness: { hasLlmsTxt: true, hasSchema: true }, costEstimate: input.tier === 'free' ? 0.05 : 0.75, status: 'complete' as const, errorMessage: null, source: CLIENT_ZERO_SOURCE,
  };
  return appendAuditSnapshot(payload);
}

function monthLabel(iso?: string, seq?: number) {
  return iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : `Snapshot ${seq}`;
}

export async function getClientZeroDashboardModel(): Promise<ClientZeroDashboardModel> {
  const lead = await getClientZeroLead();
  const snapshots = lead?.leadId ? (await listAuditSnapshots(lead.leadId)).filter((s) => s.status === 'complete') : [];
  const monthlySnapshots = snapshots.filter((s) => s.tier === 'paid' && s.runType !== 'pulse');
  const pulseSnapshots = snapshots.filter((s) => s.runType === 'pulse' || s.tier === 'free' || s.source === 'client_zero:pulse' || (s.promptPlan as any)?.runType === 'pulse');
  const latest = snapshots.at(-1);
  const engineLines = ['openai','gemini','perplexity'].map((provider) => ({ provider, points: snapshots.map((s) => ({ sequence: s.sequence, rate: Number((s.platformScores || []).find((p: any) => p.provider === provider)?.appearanceRate || 0), runType: s.runType })) }));
  const cats = new Map<string, { name: string; vals: number[] }>();
  for (const s of snapshots) {
    const total = new Map<string, number>(); const yes = new Map<string, number>(); const names = new Map<string, string>();
    for (const r of s.promptResults || []) { const c = r.categoryId || 'Uncategorized'; names.set(c, r.categoryName || c); total.set(c, (total.get(c) || 0) + 1); if (r.businessAppeared) yes.set(c, (yes.get(c) || 0) + 1); }
    for (const [c, t] of total) { const cur = cats.get(c) || { name: names.get(c) || c, vals: [] }; cur.vals.push((yes.get(c) || 0) / t); cats.set(c, cur); }
  }
  const comp = new Map<string, number[]>();
  for (const s of snapshots) for (const c of (s.competitorScores as any[] || [])) { const arr = comp.get(c.name) || []; arr.push(Number(c.appearanceRate || 0)); comp.set(c.name, arr); }
  const ledger = new Map<string, { count: number; present: boolean }>();
  for (const r of latest?.promptResults || []) for (const url of r.citations || []) { const domain = String(url).replace(/^https?:\/\//, '').split('/')[0]; if (!domain) continue; const cur = ledger.get(domain) || { count: 0, present: false }; cur.count++; if (domain.includes('vizbiz.ai')) cur.present = true; ledger.set(domain, cur); }
  const fixKit = lead?.leadId ? await getFixKit(lead.leadId).catch(() => null) : null;
  const approvedAt = (lead?.notes || '').match(/\[MONTHLY_ONE_PAGER_APPROVED\s+([^\]]+)\]/)?.[1] || null;
  return {
    lead: lead ? { leadId: lead.leadId, businessName: lead.dealershipName, website: lead.website, market: lead.city } : null,
    snapshots, monthlySnapshots, pulseSnapshots,
    scorePoints: snapshots.map((s) => ({ sequence: s.sequence, label: monthLabel(s.createdAt, s.sequence), score: s.blendedScore == null ? null : Math.round(s.blendedScore * 100), tier: s.tier, runType: s.runType, createdAt: s.createdAt })),
    engineLines,
    categoryScorecard: Array.from(cats.entries()).map(([categoryId, v]) => ({ categoryId, categoryName: v.name, currentRate: v.vals.at(-1) || 0, sparkline: v.vals })),
    competitorOverlay: Array.from(comp.entries()).map(([name, points]) => ({ name, currentRate: points.at(-1) || 0, points })),
    sourceLedger: Array.from(ledger.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([domain, v]) => ({ domain, ...v })),
    fixStatus: { ready: Boolean(fixKit?.artifacts?.length), titles: (fixKit?.artifacts || []).map((a) => a.title), status: fixKit?.status },
    publicReady: Boolean(approvedAt && monthlySnapshots.length >= 2), approvedAt,
  };
}

export async function ensureSampleClientZeroFixDrop(leadId: string) {
  const existing = await getFixKit(leadId).catch(() => null);
  if (existing?.artifacts?.length) return existing;
  const kit: FixKitResult = { leadId, version: 1, status: 'draft', evidenceHash: 'client-zero-sample', artifacts: [{ key: 'client-zero-faq-proof', title: 'Add proof-page FAQ answer for AI visibility monitoring', type: 'faq', status: 'draft', content: 'Add a concise FAQ explaining how VizBiz measures ChatGPT, Gemini, and Perplexity visibility for local businesses.', generatedAt: new Date().toISOString(), validationErrors: [] }] } as any;
  return saveFixKit(kit);
}
