import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';
import { runEmailSuiteAutomation } from '@/lib/email-suite-automation';
import { requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET || '';
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const header = request.headers.get('x-cron-secret') || '';
  const query = new URL(request.url).searchParams.get('secret') || '';
  if ([bearer, header, query].some((value) => value && value === secret)) return true;
  return requireMissionControlApiAuth(request) === null;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === '1' || url.searchParams.get('dryRun') === 'true';
  const nowParam = url.searchParams.get('now');
  const now = nowParam ? new Date(nowParam) : new Date();
  if (Number.isNaN(now.getTime())) return NextResponse.json({ success: false, error: 'Invalid now timestamp' }, { status: 400 });
  const leads = await getAllLeads();
  const actions = await runEmailSuiteAutomation(leads, { now, dryRun });
  return NextResponse.json({ success: true, dryRun, processed: actions.length, actions });
}

export async function POST(request: Request) {
  return GET(request);
}
