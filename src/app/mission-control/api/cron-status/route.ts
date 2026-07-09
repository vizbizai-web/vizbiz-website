import { NextResponse } from 'next/server';
import { formatCronAge, getLatestCronHeartbeat } from '@/lib/cron-heartbeats';

export async function GET() {
  const latest = await getLatestCronHeartbeat();
  const age = formatCronAge(latest?.created_at);
  return NextResponse.json({
    source: 'lead_events.cron_invoked',
    status: latest ? (age.alarm ? 'alarm' : 'ok') : 'missing',
    lastTickAt: latest?.created_at || null,
    route: latest?.event_payload?.route || null,
    path: latest?.event_payload?.path || null,
    hasTrailingSlash: latest?.event_payload?.hasTrailingSlash ?? null,
    authMethod: latest?.event_payload?.authMethod || null,
    ageLabel: age.label,
    ageHours: age.ageHours,
    alarm: age.alarm,
    message: latest ? `Last cron tick ${age.label}` : 'No durable cron heartbeat has been recorded yet.',
  });
}
