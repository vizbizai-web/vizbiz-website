import { createHash } from 'crypto';
import { supabaseRest, isSupabaseRestConfigured, type SupabaseJson } from './supabase-rest';
import type { ResearchMode } from './pipeline-controller';
import type { PlatformScore, ResearchResult } from './research-runner';

export type AuditSnapshotRunType = 'baseline' | 'monthly' | 'rescan_after_fix' | 'manual';
export type AuditSnapshotStatus = 'complete' | 'failed' | 'partial';

export type SnapshotPromptResult = {
  prompt: string;
  provider: string;
  businessAppeared: boolean;
  competitorAppeared?: boolean;
  competitorName?: string;
  kind?: string;
  categoryId?: string;
  categoryName?: string;
  promptId?: string;
  citations?: string[];
};

export type AuditSnapshot = {
  id?: string;
  leadId: string;
  sequence: number;
  runType: AuditSnapshotRunType;
  tier: ResearchMode;
  createdAt?: string;
  profileHash?: string;
  promptPlan: { prompts: Array<string | { id?: string; text: string; categoryId?: string; categoryName?: string; ownerLabel?: string }>; version: string; refreshedPromptIds?: string[]; hash?: string; batteryVersion?: string };
  platformScores: PlatformScore[];
  blendedScore: number | null;
  band: string | null;
  promptResults: SnapshotPromptResult[];
  competitorScores: unknown[];
  readiness: Record<string, unknown>;
  costEstimate: number | null;
  status: AuditSnapshotStatus;
  errorMessage?: string | null;
  source: string;
};

type AuditSnapshotRow = {
  id?: string;
  lead_id: string;
  sequence: number;
  run_type: AuditSnapshotRunType;
  tier: ResearchMode;
  created_at?: string;
  profile_hash?: string | null;
  prompt_plan: SupabaseJson;
  platform_scores: SupabaseJson;
  blended_score?: number | null;
  band?: string | null;
  prompt_results: SupabaseJson;
  competitor_scores: SupabaseJson;
  readiness: SupabaseJson;
  cost_estimate?: number | null;
  status: AuditSnapshotStatus;
  error_message?: string | null;
  source: string;
};

export function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj).sort().map((key) => `${JSON.stringify(key)}:${stableJson(obj[key])}`).join(',')}}`;
}

export function hashProfile(profile: unknown): string {
  return createHash('sha256').update(stableJson(profile)).digest('hex');
}

export function hashPromptPlan(prompts: Array<string | { text?: string }>): string {
  return createHash('sha256').update(stableJson(uniquePromptPlan(prompts))).digest('hex');
}

export function uniquePromptPlan(prompts: Array<string | { text?: string }>): Array<string | { text?: string }> {
  const seen = new Set<string>();
  const out: Array<string | { text?: string }> = [];
  for (const prompt of prompts) {
    const text = typeof prompt === 'string' ? prompt.trim() : String(prompt?.text || '').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(typeof prompt === 'string' ? text : prompt);
  }
  return out;
}

export function stableProfileForMonthlyHash(profile: unknown): unknown {
  const p = (profile || {}) as Record<string, any>;
  return {
    niche: p.niche || p.businessNiche?.value || p.businessType || null,
    nicheLabel: p.nicheLabel || p.businessNiche?.value || p.businessType || null,
    businessType: p.businessType || p.category || null,
    services: Array.isArray(p.services) ? p.services.map(String).sort() : [],
    serviceAreas: Array.isArray(p.serviceAreas) ? p.serviceAreas.map(String).sort() : [],
    primaryMarket: p.primaryMarket || p.market || null,
    searchLanguage: p.searchLanguage || null,
  };
}

function toJson(value: unknown): SupabaseJson {
  return JSON.parse(JSON.stringify(value ?? null)) as SupabaseJson;
}

function rowToSnapshot(row: AuditSnapshotRow): AuditSnapshot {
  return {
    id: row.id,
    leadId: row.lead_id,
    sequence: row.sequence,
    runType: row.run_type,
    tier: row.tier,
    createdAt: row.created_at,
    profileHash: row.profile_hash || undefined,
    promptPlan: row.prompt_plan as AuditSnapshot['promptPlan'],
    platformScores: row.platform_scores as PlatformScore[],
    blendedScore: row.blended_score ?? null,
    band: row.band ?? null,
    promptResults: row.prompt_results as SnapshotPromptResult[],
    competitorScores: row.competitor_scores as unknown[],
    readiness: row.readiness as Record<string, unknown>,
    costEstimate: row.cost_estimate ?? null,
    status: row.status,
    errorMessage: row.error_message ?? null,
    source: row.source,
  };
}

export async function getLatestAuditSnapshot(leadId: string): Promise<AuditSnapshot | null> {
  if (!isSupabaseRestConfigured()) return null;
  const rows = await supabaseRest<AuditSnapshotRow[]>(`/audit_snapshots?select=*&lead_id=eq.${encodeURIComponent(leadId)}&order=sequence.desc&limit=1`);
  return rows?.[0] ? rowToSnapshot(rows[0]) : null;
}


export async function getLatestCompletedAuditSnapshot(leadId: string): Promise<AuditSnapshot | null> {
  if (!isSupabaseRestConfigured()) return null;
  const rows = await supabaseRest<AuditSnapshotRow[]>(`/audit_snapshots?select=*&lead_id=eq.${encodeURIComponent(leadId)}&status=eq.complete&order=sequence.desc&limit=1`);
  return rows?.[0] ? rowToSnapshot(rows[0]) : null;
}

export async function listAuditSnapshots(leadId: string): Promise<AuditSnapshot[]> {
  if (!isSupabaseRestConfigured()) return [];
  const rows = await supabaseRest<AuditSnapshotRow[]>(`/audit_snapshots?select=*&lead_id=eq.${encodeURIComponent(leadId)}&order=sequence.asc`);
  return (rows || []).map(rowToSnapshot);
}

export function buildCompetitorScores(promptResults: SnapshotPromptResult[]): { name: string; appearedCount: number; totalPrompts: number; appearanceRate: number }[] {
  const totals = new Map<string, { appearedCount: number; totalPrompts: number }>();
  for (const result of promptResults) {
    const name = (result.competitorName || '').trim();
    if (!name) continue;
    const current = totals.get(name) || { appearedCount: 0, totalPrompts: 0 };
    current.totalPrompts += 1;
    if (result.competitorAppeared) current.appearedCount += 1;
    totals.set(name, current);
  }
  return Array.from(totals.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([name, score]) => ({
    name,
    appearedCount: score.appearedCount,
    totalPrompts: score.totalPrompts,
    appearanceRate: score.totalPrompts ? score.appearedCount / score.totalPrompts : 0,
  }));
}

export function buildReadinessSnapshot(preflightProfile: Record<string, unknown> | null | undefined): Record<string, unknown> {
  const p = preflightProfile || {};
  return {
    aiReadinessScore: typeof p.aiReadinessScore === 'number' ? p.aiReadinessScore : null,
    hasLlmsTxt: typeof p.hasLlmsTxt === 'boolean' ? p.hasLlmsTxt : null,
    hasSchema: typeof p.hasSchema === 'boolean' ? p.hasSchema : null,
    bingWmtVerified: typeof p.bingWmtVerified === 'boolean' ? p.bingWmtVerified : null,
    hasBlog: typeof p.hasBlog === 'boolean' ? p.hasBlog : null,
    indexedPages: typeof p.indexedPages === 'number' ? p.indexedPages : null,
    localEntityTrustScore: typeof p.localEntityTrustScore === 'number' ? p.localEntityTrustScore : null,
  };
}

export function buildAuditSnapshotInput(args: {
  leadId: string;
  tier: ResearchMode;
  runType: AuditSnapshotRunType;
  researchResult: ResearchResult;
  preflightProfile?: Record<string, unknown> | null;
  sequence: number;
  source?: string;
}): Omit<AuditSnapshot, 'id' | 'createdAt'> {
  const promptResults = (args.researchResult.promptResults || []).map((result) => ({
    prompt: result.prompt,
    provider: result.provider || 'unknown',
    businessAppeared: Boolean(result.businessAppeared),
    competitorAppeared: Boolean(result.competitorAppeared),
    competitorName: result.competitorName,
    kind: result.kind,
    categoryId: result.categoryId,
    categoryName: result.categoryName,
    promptId: result.promptId,
    citations: result.citations || [],
  }));
  return {
    leadId: args.leadId,
    sequence: args.sequence,
    runType: args.runType,
    tier: args.tier,
    profileHash: hashProfile(stableProfileForMonthlyHash(args.preflightProfile || {})),
    promptPlan: args.researchResult.promptPlanMetadata
      ? { prompts: uniquePromptPlan(args.researchResult.promptPlanMetadata.prompts) as AuditSnapshot['promptPlan']['prompts'], version: args.researchResult.promptPlanMetadata.version, hash: args.researchResult.promptPlanMetadata.hash, batteryVersion: args.researchResult.batteryVersion }
      : { prompts: uniquePromptPlan(args.researchResult.prompts || []) as AuditSnapshot['promptPlan']['prompts'], version: 'research-runner:v1', hash: hashPromptPlan(args.researchResult.prompts || []) },
    platformScores: args.researchResult.platformScores || [],
    blendedScore: args.researchResult.totalPrompts ? args.researchResult.appearedCount / args.researchResult.totalPrompts : null,
    band: args.researchResult.statusBand || null,
    promptResults,
    competitorScores: buildCompetitorScores(promptResults),
    readiness: buildReadinessSnapshot(args.preflightProfile),
    costEstimate: args.tier === 'free' ? args.researchResult.costEstimate?.free ?? null : args.researchResult.costEstimate?.paid ?? null,
    status: 'complete',
    errorMessage: null,
    source: args.source || 'pipeline',
  };
}

export async function appendAuditSnapshot(snapshot: Omit<AuditSnapshot, 'id' | 'createdAt'>): Promise<AuditSnapshot> {
  const rows = await supabaseRest<AuditSnapshotRow[]>('/audit_snapshots', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      lead_id: snapshot.leadId,
      sequence: snapshot.sequence,
      run_type: snapshot.runType,
      tier: snapshot.tier,
      profile_hash: snapshot.profileHash || null,
      prompt_plan: toJson(snapshot.promptPlan),
      platform_scores: toJson(snapshot.platformScores),
      blended_score: snapshot.blendedScore,
      band: snapshot.band,
      prompt_results: toJson(snapshot.promptResults),
      competitor_scores: toJson(snapshot.competitorScores),
      readiness: toJson(snapshot.readiness),
      cost_estimate: snapshot.costEstimate,
      status: snapshot.status,
      error_message: snapshot.errorMessage || null,
      source: snapshot.source,
    }),
  });
  if (!rows?.[0]) throw new Error('audit snapshot insert did not return a row');
  return rowToSnapshot(rows[0]);
}

export async function appendResearchSnapshot(args: {
  leadId: string;
  tier: ResearchMode;
  researchResult: ResearchResult;
  preflightProfile?: Record<string, unknown> | null;
  runType?: AuditSnapshotRunType;
  source?: string;
}): Promise<AuditSnapshot | null> {
  if (!isSupabaseRestConfigured()) {
    console.warn('[audit-snapshots] Supabase not configured; skipped append-only audit snapshot');
    return null;
  }
  const latest = await getLatestAuditSnapshot(args.leadId);
  const sequence = (latest?.sequence || 0) + 1;
  const snapshot = buildAuditSnapshotInput({
    leadId: args.leadId,
    tier: args.tier,
    runType: args.runType || (sequence === 1 ? 'baseline' : 'manual'),
    researchResult: args.researchResult,
    preflightProfile: args.preflightProfile,
    sequence,
    source: args.source || 'pipeline',
  });
  return appendAuditSnapshot(snapshot);
}
