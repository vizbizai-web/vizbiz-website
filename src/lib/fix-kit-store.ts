import { supabaseRest, isSupabaseRestConfigured } from './supabase-rest';
import type { FixKitArtifact, FixKitResult } from './fix-kit-generator';

export type StoredFixKit = FixKitResult & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string | null;
  deliveredAt?: string | null;
  rescanScheduledAt?: string | null;
  rescanCompletedAt?: string | null;
  beforeAfter?: unknown;
};

type Row = {
  id: string;
  lead_id: string;
  version: number;
  status: StoredFixKit['status'];
  artifacts: FixKitArtifact[];
  evidence_hash: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  delivered_at: string | null;
  rescan_scheduled_at: string | null;
  rescan_completed_at: string | null;
  before_after: unknown;
};
function fromRow(row: Row): StoredFixKit {
  return { id: row.id, leadId: row.lead_id, version: row.version, status: row.status, artifacts: row.artifacts || [], evidenceHash: row.evidence_hash, createdAt: row.created_at, updatedAt: row.updated_at, approvedAt: row.approved_at, deliveredAt: row.delivered_at, rescanScheduledAt: row.rescan_scheduled_at, rescanCompletedAt: row.rescan_completed_at, beforeAfter: row.before_after };
}
export function assertFixKitStoreReady() {
  if (!isSupabaseRestConfigured()) throw new Error('Fix Kit store requires Supabase env vars and the fix_kits table. It cannot use stubs.');
}
export async function getFixKit(leadId: string): Promise<StoredFixKit | null> {
  assertFixKitStoreReady();
  const rows = await supabaseRest<Row[]>(`/fix_kits?select=*&lead_id=eq.${encodeURIComponent(leadId)}&order=version.desc&limit=1`);
  return rows?.[0] ? fromRow(rows[0]) : null;
}
export async function saveFixKit(kit: FixKitResult): Promise<StoredFixKit> {
  assertFixKitStoreReady();
  const existing = await getFixKit(kit.leadId);
  if (existing?.id) {
    const rows = await supabaseRest<Row[]>(`/fix_kits?id=eq.${existing.id}`, { method:'PATCH', headers:{ Prefer:'return=representation' }, body: JSON.stringify({ status: kit.status, artifacts: kit.artifacts, evidence_hash: kit.evidenceHash, updated_at: new Date().toISOString() }) });
    return fromRow(rows[0]);
  }
  const rows = await supabaseRest<Row[]>('/fix_kits', { method:'POST', headers:{ Prefer:'return=representation' }, body: JSON.stringify({ lead_id: kit.leadId, version: kit.version, status: kit.status, artifacts: kit.artifacts, evidence_hash: kit.evidenceHash }) });
  return fromRow(rows[0]);
}
export async function updateFixKitArtifact(leadId: string, artifactKey: string, update: { content?: string; status?: FixKitArtifact['status']; validationErrors?: string[] }): Promise<StoredFixKit> {
  const kit = await getFixKit(leadId); if (!kit?.id) throw new Error(`Fix Kit not found for ${leadId}`);
  const artifacts = kit.artifacts.map(a => a.key === artifactKey ? { ...a, ...update, generatedAt: update.content ? new Date().toISOString() : a.generatedAt } : a);
  const status = artifacts.every(a => a.status === 'approved' || a.status === 'delivered') ? 'approved' : 'draft';
  const rows = await supabaseRest<Row[]>(`/fix_kits?id=eq.${kit.id}`, { method:'PATCH', headers:{ Prefer:'return=representation' }, body: JSON.stringify({ artifacts, status, approved_at: status === 'approved' ? new Date().toISOString() : kit.approvedAt, updated_at: new Date().toISOString() }) });
  return fromRow(rows[0]);
}
export async function approveAllFixKitArtifacts(leadId: string): Promise<StoredFixKit> {
  const kit = await getFixKit(leadId); if (!kit?.id) throw new Error(`Fix Kit not found for ${leadId}`);
  if (kit.artifacts.some(a => a.status === 'needs_operator_edit')) throw new Error('Cannot approve all while artifacts need operator edit');
  const artifacts = kit.artifacts.map(a => ({ ...a, status: 'approved' as const }));
  const rows = await supabaseRest<Row[]>(`/fix_kits?id=eq.${kit.id}`, { method:'PATCH', headers:{ Prefer:'return=representation' }, body: JSON.stringify({ artifacts, status:'approved', approved_at:new Date().toISOString(), updated_at:new Date().toISOString() }) });
  return fromRow(rows[0]);
}
export async function markFixKitDelivered(leadId: string): Promise<StoredFixKit> {
  const kit = await getFixKit(leadId); if (!kit?.id) throw new Error(`Fix Kit not found for ${leadId}`);
  if (!kit.artifacts.every(a => a.status === 'approved' || a.status === 'delivered')) throw new Error('Fix Kit delivery blocked until all artifacts are approved');
  const scheduled = new Date(Date.now()+30*24*60*60*1000).toISOString();
  const artifacts = kit.artifacts.map(a => ({ ...a, status: 'delivered' as const }));
  const rows = await supabaseRest<Row[]>(`/fix_kits?id=eq.${kit.id}`, { method:'PATCH', headers:{ Prefer:'return=representation' }, body: JSON.stringify({ artifacts, status:'delivered', delivered_at:new Date().toISOString(), rescan_scheduled_at: scheduled, updated_at:new Date().toISOString() }) });
  return fromRow(rows[0]);
}
export async function dueFixKitRescans(): Promise<StoredFixKit[]> {
  assertFixKitStoreReady();
  const now = encodeURIComponent(new Date().toISOString());
  const rows = await supabaseRest<Row[]>(`/fix_kits?select=*&status=eq.delivered&rescan_scheduled_at=lte.${now}&rescan_completed_at=is.null&limit=5`);
  return (rows || []).map(fromRow);
}
export async function markFixKitRescanQueued(id: string, beforeAfter: unknown) {
  return supabaseRest(`/fix_kits?id=eq.${id}`, { method:'PATCH', headers:{ Prefer:'return=minimal' }, body: JSON.stringify({ before_after: beforeAfter, updated_at:new Date().toISOString() }) });
}
export async function markFixKitRescanCompleted(id: string, beforeAfter: unknown) {
  return supabaseRest(`/fix_kits?id=eq.${id}`, { method:'PATCH', headers:{ Prefer:'return=minimal' }, body: JSON.stringify({ before_after: beforeAfter, rescan_completed_at: new Date().toISOString(), updated_at:new Date().toISOString() }) });
}
