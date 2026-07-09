import { requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';
import { isSupabaseRestConfigured, supabaseRest, type SupabaseJson } from './supabase-rest';

export type CronAuthMethod = 'bearer' | 'x-cron-secret' | 'query-secret' | 'mission-control-session' | 'none';

export type CronAuthOptions = {
  allowQuerySecret?: boolean;
  allowMissionControlSession?: boolean;
};

export function authorizeCronRequest(request: Request, opts: CronAuthOptions = {}): { authorized: boolean; authMethod: CronAuthMethod } {
  const secret = process.env.CRON_SECRET || '';
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const header = request.headers.get('x-cron-secret') || '';
  const query = new URL(request.url).searchParams.get('secret') || '';

  if (secret && bearer && bearer === secret) return { authorized: true, authMethod: 'bearer' };
  if (secret && header && header === secret) return { authorized: true, authMethod: 'x-cron-secret' };
  if (opts.allowQuerySecret && secret && query && query === secret) return { authorized: true, authMethod: 'query-secret' };
  if (opts.allowMissionControlSession && requireMissionControlApiAuth(request) === null) return { authorized: true, authMethod: 'mission-control-session' };

  // Preserve the legacy process-reruns behavior in non-configured environments only.
  if (!secret && !opts.allowMissionControlSession) return { authorized: true, authMethod: 'none' };

  return { authorized: false, authMethod: 'none' };
}

function safeHeader(request: Request, name: string): string | null {
  const value = request.headers.get(name);
  if (!value) return null;
  if (/authorization|secret|token|cookie|key/i.test(name)) return '[REDACTED]';
  return value.slice(0, 240);
}

export async function recordCronHeartbeat(request: Request, route: string, authMethod: CronAuthMethod): Promise<void> {
  if (!isSupabaseRestConfigured()) return;
  const url = new URL(request.url);
  const payload: Record<string, SupabaseJson> = {
    route,
    path: url.pathname,
    method: request.method,
    invokedAt: new Date().toISOString(),
    hasTrailingSlash: url.pathname.endsWith('/'),
    authMethod,
    userAgent: safeHeader(request, 'user-agent'),
    vercelCronHeaderPresent: Boolean(request.headers.get('x-vercel-cron')),
    vercelIdPresent: Boolean(request.headers.get('x-vercel-id')),
    forwardedHost: safeHeader(request, 'x-forwarded-host'),
    forwardedProto: safeHeader(request, 'x-forwarded-proto'),
  };

  await supabaseRest('/lead_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      lead_id: null,
      event_type: 'cron_invoked',
      event_payload: payload,
    }),
  }).catch((error) => console.warn('[cron-heartbeat] insert failed', error));
}

export type CronHeartbeatRow = {
  id: string;
  created_at: string;
  event_payload: {
    route?: string;
    path?: string;
    invokedAt?: string;
    hasTrailingSlash?: boolean;
    authMethod?: string;
    userAgent?: string | null;
  } | null;
};

export async function getLatestCronHeartbeat(route?: string): Promise<CronHeartbeatRow | null> {
  if (!isSupabaseRestConfigured()) return null;
  const routeFilter = route ? `&event_payload->>route=eq.${encodeURIComponent(route)}` : '';
  const rows = await supabaseRest<CronHeartbeatRow[]>(`/lead_events?select=id,event_payload,created_at&event_type=eq.cron_invoked${routeFilter}&order=created_at.desc&limit=1`).catch(() => []);
  return rows?.[0] || null;
}

export function formatCronAge(createdAt?: string | null, now = new Date()): { label: string; ageHours: number | null; alarm: boolean } {
  const parsed = Date.parse(createdAt || '');
  if (!Number.isFinite(parsed)) return { label: 'never', ageHours: null, alarm: true };
  const ageHours = Math.max(0, (now.getTime() - parsed) / 3_600_000);
  const label = ageHours < 1 ? `${Math.max(0, Math.round(ageHours * 60))}m ago` : ageHours < 48 ? `${Math.round(ageHours)}h ago` : `${Math.round(ageHours / 24)}d ago`;
  return { label, ageHours: Math.round(ageHours * 100) / 100, alarm: ageHours > 26 };
}
