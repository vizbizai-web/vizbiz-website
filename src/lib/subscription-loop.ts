import { supabaseRest, isSupabaseRestConfigured } from './supabase-rest';

export type SubscriptionMirrorStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | 'incomplete' | string;

export type StripeLikeEvent = {
  type?: string;
  data?: { object?: Record<string, unknown> };
};

export type SubscriptionMirrorPatch = {
  leadId?: string;
  stripeSubscriptionId: string;
  status: SubscriptionMirrorStatus;
  currentPeriodEnd?: string | null;
  nextRunAt?: string | null;
  pausedReason?: string | null;
  lastError?: string | null;
};

type SubscriptionLocalRow = {
  id?: string;
  lead_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end?: string | null;
  next_run_at?: string | null;
  last_run_snapshot_id?: string | null;
  paused_reason?: string | null;
  retry_count?: number;
  last_error?: string | null;
  created_at?: string;
  updated_at?: string;
};

function metadataLeadId(object: Record<string, unknown> | undefined): string | undefined {
  const metadata = object?.metadata;
  if (metadata && typeof metadata === 'object') {
    const leadId = (metadata as Record<string, unknown>).leadId;
    if (typeof leadId === 'string' && leadId.trim()) return leadId;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function secondsToIso(value: unknown): string | null | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return new Date(value * 1000).toISOString();
}

function subscriptionIdFromInvoice(object: Record<string, unknown> | undefined): string | undefined {
  const sub = object?.subscription;
  if (typeof sub === 'string') return sub;
  if (sub && typeof sub === 'object') return asString((sub as Record<string, unknown>).id);
  return undefined;
}

function leadIdFromInvoice(object: Record<string, unknown> | undefined): string | undefined {
  const direct = metadataLeadId(object);
  if (direct) return direct;
  const sub = object?.subscription;
  if (sub && typeof sub === 'object') return metadataLeadId(sub as Record<string, unknown>);
  return undefined;
}

export function nextRunAfter(date: Date): string {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + 30);
  return next.toISOString();
}

export function evaluateMonthlyRunFailure(attempts: number): { snapshotStatus: 'failed'; clientEmailAllowed: false; retryNextTick: boolean; pausedReason?: string } {
  return { snapshotStatus: 'failed', clientEmailAllowed: false, retryNextTick: attempts < 1, pausedReason: attempts < 1 ? undefined : 'monthly_run_failed' };
}

export function validateMonthlyProfileHash(previousProfileHash: string | null | undefined, currentProfileHash: string): { ok: boolean; reason?: string } {
  if (!previousProfileHash) return { ok: false, reason: 'missing_previous_profile_hash' };
  if (previousProfileHash !== currentProfileHash) return { ok: false, reason: 'profile_hash_changed' };
  return { ok: true };
}

export function subscriptionMirrorPatchFromStripeEvent(event: StripeLikeEvent, now = new Date()): SubscriptionMirrorPatch | null {
  const object = event.data?.object;
  if (!object) return null;

  if (event.type === 'checkout.session.completed') {
    const subscriptionId = asString(object.subscription);
    const leadId = metadataLeadId(object) || asString(object.client_reference_id);
    if (!subscriptionId || !leadId) return null;
    return {
      leadId,
      stripeSubscriptionId: subscriptionId,
      status: 'active',
      nextRunAt: nextRunAfter(now),
      pausedReason: null,
      lastError: null,
    };
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscriptionId = asString(object.id);
    if (!subscriptionId) return null;
    const status = asString(object.status) || (event.type === 'customer.subscription.deleted' ? 'canceled' : 'unknown');
    const canceled = event.type === 'customer.subscription.deleted' || status === 'canceled' || status === 'unpaid';
    const pastDue = status === 'past_due' || status === 'incomplete_expired';
    return {
      leadId: metadataLeadId(object),
      stripeSubscriptionId: subscriptionId,
      status,
      currentPeriodEnd: secondsToIso(object.current_period_end) ?? null,
      nextRunAt: canceled || pastDue ? null : nextRunAfter(now),
      pausedReason: canceled ? 'subscription_canceled' : pastDue ? 'payment_past_due' : null,
      lastError: null,
    };
  }

  if (event.type === 'invoice.payment_failed') {
    const subscriptionId = subscriptionIdFromInvoice(object);
    if (!subscriptionId) return null;
    return {
      leadId: leadIdFromInvoice(object),
      stripeSubscriptionId: subscriptionId,
      status: 'past_due',
      nextRunAt: null,
      pausedReason: 'payment_failed',
      lastError: asString(object.status) || 'invoice.payment_failed',
    };
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscriptionId = subscriptionIdFromInvoice(object);
    if (!subscriptionId) return null;
    return {
      leadId: leadIdFromInvoice(object),
      stripeSubscriptionId: subscriptionId,
      status: 'active',
      currentPeriodEnd: secondsToIso(object.period_end) ?? undefined,
      nextRunAt: nextRunAfter(now),
      pausedReason: null,
      lastError: null,
    };
  }

  return null;
}

export async function upsertSubscriptionMirror(patch: SubscriptionMirrorPatch): Promise<void> {
  if (!isSupabaseRestConfigured()) {
    console.warn('[subscriptions-local] Supabase not configured; skipped subscription mirror update');
    return;
  }

  let existing: SubscriptionLocalRow | null = null;
  const rows = await supabaseRest<SubscriptionLocalRow[]>(`/subscriptions_local?select=*&stripe_subscription_id=eq.${encodeURIComponent(patch.stripeSubscriptionId)}&limit=1`);
  existing = rows?.[0] || null;

  const leadId = patch.leadId || existing?.lead_id;
  if (!leadId) throw new Error(`Cannot mirror subscription ${patch.stripeSubscriptionId}: missing leadId`);

  const body = {
    lead_id: leadId,
    stripe_subscription_id: patch.stripeSubscriptionId,
    status: patch.status,
    current_period_end: patch.currentPeriodEnd === undefined ? existing?.current_period_end ?? null : patch.currentPeriodEnd,
    next_run_at: patch.nextRunAt === undefined ? existing?.next_run_at ?? null : patch.nextRunAt,
    paused_reason: patch.pausedReason === undefined ? existing?.paused_reason ?? null : patch.pausedReason,
    last_error: patch.lastError === undefined ? existing?.last_error ?? null : patch.lastError,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await supabaseRest(`/subscriptions_local?id=eq.${existing.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    });
  } else {
    await supabaseRest('/subscriptions_local', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    });
  }
}

export async function listDueSubscriptions(now = new Date(), limit = 5): Promise<SubscriptionLocalRow[]> {
  if (!isSupabaseRestConfigured()) return [];
  const due = encodeURIComponent(now.toISOString());
  return supabaseRest<SubscriptionLocalRow[]>(`/subscriptions_local?select=*&status=eq.active&paused_reason=is.null&next_run_at=lte.${due}&order=next_run_at.asc&limit=${limit}`);
}

export async function markSubscriptionAfterMonthlyRun(stripeSubscriptionId: string, snapshotId: string, nextRunAt: string): Promise<void> {
  await supabaseRest(`/subscriptions_local?stripe_subscription_id=eq.${encodeURIComponent(stripeSubscriptionId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ last_run_snapshot_id: snapshotId, next_run_at: nextRunAt, retry_count: 0, last_error: null, updated_at: new Date().toISOString() }),
  });
}

export async function markSubscriptionLoopFailure(stripeSubscriptionId: string, error: string): Promise<void> {
  const rows = await supabaseRest<SubscriptionLocalRow[]>(`/subscriptions_local?select=*&stripe_subscription_id=eq.${encodeURIComponent(stripeSubscriptionId)}&limit=1`);
  const current = rows?.[0];
  const retryCount = (current?.retry_count || 0) + 1;
  await supabaseRest(`/subscriptions_local?stripe_subscription_id=eq.${encodeURIComponent(stripeSubscriptionId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ retry_count: retryCount, last_error: error, paused_reason: retryCount > 1 ? 'monthly_run_failed' : null, updated_at: new Date().toISOString() }),
  });
}
