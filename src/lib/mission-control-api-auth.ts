import { createHash, timingSafeEqual } from 'crypto';
import { verifySessionToken } from '@/app/mission-control/lib/auth';
import { NextResponse } from 'next/server';
import { supabaseRest, isSupabaseRestConfigured, type SupabaseJson } from './supabase-rest';

const SESSION_COOKIE = 'mc_session';
const INTERNAL_HEADER = 'x-mission-control-internal-token';

function internalToken(): string | null {
  const explicit = process.env.MISSION_CONTROL_INTERNAL_TOKEN;
  if (explicit?.trim()) return explicit.trim();
  const password = process.env.MISSION_CONTROL_PASSWORD;
  if (!password) return null;
  const salt = process.env.MISSION_CONTROL_SECRET_SALT || 'vizbiz-salt';
  return createHash('sha256').update(`mc-internal:${password}:${salt}`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export function missionControlInternalHeaders(): HeadersInit {
  const token = internalToken();
  return token ? { [INTERNAL_HEADER]: token } : {};
}

export function isMissionControlApiAuthorized(request: Request): boolean {
  // Local dev is intentionally open for tests and non-production tooling.
  if (process.env.NODE_ENV !== 'production') return true;

  const expectedInternal = internalToken();
  const providedInternal = request.headers.get(INTERNAL_HEADER) || '';
  if (expectedInternal && providedInternal && safeEqual(providedInternal, expectedInternal)) return true;

  const cookie = request.headers.get('cookie') || '';
  const session = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return verifySessionToken(session?.slice(`${SESSION_COOKIE}=`.length));
}

export function unauthorizedMissionControlApiResponse() {
  return NextResponse.json({ success: false, error: 'Unauthorized Mission Control API request' }, { status: 401 });
}

export function requireMissionControlApiAuth(request: Request): NextResponse | null {
  return isMissionControlApiAuthorized(request) ? null : unauthorizedMissionControlApiResponse();
}

export async function recordActionAudit(input: {
  leadId?: string | null;
  action: string;
  channel: 'mission_control' | 'telegram' | 'cron' | 'api' | 'system';
  actor?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseRestConfigured()) return;
  const payload: Record<string, SupabaseJson> = {
    action: input.action,
    channel: input.channel,
    actor: input.actor || 'alex',
    loggedAt: new Date().toISOString(),
    ...(input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : {}),
  };
  await supabaseRest('/lead_events', {
    method: 'POST',
    body: JSON.stringify({
      lead_id: input.leadId || null,
      event_type: 'action_audit',
      event_payload: payload,
    }),
  }).catch((error) => console.warn('[action-audit] insert failed', error));
}
