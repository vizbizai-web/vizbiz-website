import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';
import { runEmailSuiteAutomation } from '@/lib/email-suite-automation';
import { sendDailyEmailOpsDigest } from '@/lib/email-ops';
import { authorizeCronRequest, recordCronHeartbeat } from '@/lib/cron-heartbeats';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function runEmailSuiteCron(request: Request) {
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === '1' || url.searchParams.get('dryRun') === 'true';
  const nowParam = url.searchParams.get('now');
  const now = nowParam ? new Date(nowParam) : new Date();
  if (Number.isNaN(now.getTime())) return NextResponse.json({ success: false, error: 'Invalid now timestamp' }, { status: 400 });
  const leads = await getAllLeads();
  const actions = await runEmailSuiteAutomation(leads, { now, dryRun });
  const digest = dryRun ? { sent: false } : await sendDailyEmailOpsDigest(leads, now).catch((error) => ({ sent: false, error: error instanceof Error ? error.message : 'digest_failed' }));
  return NextResponse.json({ success: true, dryRun, processed: actions.length, actions, digest });
}

export async function GET(request: Request) {
  const auth = authorizeCronRequest(request, { allowQuerySecret: true, allowMissionControlSession: true });
  if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  await recordCronHeartbeat(request, '/api/cron/email-suite/', auth.authMethod);
  return runEmailSuiteCron(request);
}

export async function POST(request: Request) {
  return GET(request);
}
