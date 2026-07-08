import { NextResponse } from 'next/server';
import { requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';
import { ensureClientZeroLead, ensureClientZeroSubscription, appendClientZeroFixtureSnapshot, ensureSampleClientZeroFixDrop } from '@/lib/client-zero';
import { listAuditSnapshots, appendResearchSnapshot } from '@/lib/audit-snapshots';
import { preflightScan } from '@/lib/preflight-engine';
import { runResearch } from '@/lib/research-runner';
import { updateLead } from '@/lib/google-sheets';
import { notifyGatedEmailCardEnteredNeedsYou } from '@/lib/email-suite-automation';

export const runtime = 'nodejs';
export const maxDuration = 300;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET || '';
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const header = request.headers.get('x-cron-secret') || '';
  const query = new URL(request.url).searchParams.get('secret') || '';
  if ([bearer, header, query].some((value) => value && value === secret)) return true;
  return requireMissionControlApiAuth(request) === null;
}

async function runPulse(lead: Awaited<ReturnType<typeof ensureClientZeroLead>>) {
  const preflight = await preflightScan(lead.website, lead.city, lead.dealershipName);
  const result = await runResearch(lead.dealershipName, lead.website, lead.city, lead.competitor.split(',').map((c) => c.trim()).filter(Boolean), preflight, {
    tier: 'free',
    competitorMode: 'client_provided',
    maxPrompts: 5,
  });
  return appendResearchSnapshot({ leadId: lead.leadId, tier: 'free', researchResult: result, preflightProfile: preflight, runType: 'pulse', source: 'client_zero' });
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'dispatch';
  const now = new Date(url.searchParams.get('now') || Date.now());
  if (Number.isNaN(now.getTime())) return NextResponse.json({ success: false, error: 'Invalid now timestamp' }, { status: 400 });

  const lead = await ensureClientZeroLead(now);
  await ensureClientZeroSubscription(lead.leadId);

  if (action === 'register') return NextResponse.json({ success: true, action, leadId: lead.leadId });

  if (action === 'seed-fixtures') {
    const existing = await listAuditSnapshots(lead.leadId);
    const written = [];
    if (existing.length === 0) written.push(await appendClientZeroFixtureSnapshot({ leadId: lead.leadId, runType: 'baseline', tier: 'paid', appeared: 24, total: 180 }));
    written.push(await appendClientZeroFixtureSnapshot({ leadId: lead.leadId, runType: 'pulse', tier: 'free', appeared: 3, total: 15 }));
    written.push(await appendClientZeroFixtureSnapshot({ leadId: lead.leadId, runType: 'monthly', tier: 'paid', appeared: 31, total: 180 }));
    await ensureSampleClientZeroFixDrop(lead.leadId);
    await updateLead(lead.leadId, { notes: `${lead.notes || ''}\n[CLIENT_ZERO_FIX_DROP_READY ${now.toISOString()}]\n[monthly_one_pager awaiting approve]` });
    await notifyGatedEmailCardEnteredNeedsYou(lead, { templateId: 'MONTHLY_ONE_PAGER', subject: `${lead.dealershipName}: monthly one-pager ready`, trigger: 'monthly_one_pager', cardKey: `MONTHLY_ONE_PAGER:${now.toISOString().slice(0, 10)}` }).catch((error) => console.warn('[cron/client-zero] monthly gated ping failed', error));
    return NextResponse.json({ success: true, action, leadId: lead.leadId, snapshotsWritten: written.length });
  }

  if (action === 'pulse') {
    const snapshot = await runPulse(lead);
    return NextResponse.json({ success: true, action, leadId: lead.leadId, snapshotId: snapshot?.id, runType: snapshot?.runType, tier: snapshot?.tier });
  }

  if (action === 'fix-drop') {
    const fixKit = await ensureSampleClientZeroFixDrop(lead.leadId);
    await updateLead(lead.leadId, { notes: `${lead.notes || ''}\n[CLIENT_ZERO_FIX_DROP_READY ${now.toISOString()}]\n[monthly_one_pager awaiting approve]` });
    await notifyGatedEmailCardEnteredNeedsYou(lead, { templateId: 'MONTHLY_ONE_PAGER', subject: `${lead.dealershipName}: monthly one-pager ready`, trigger: 'monthly_one_pager', cardKey: `MONTHLY_ONE_PAGER:${now.toISOString().slice(0, 10)}` }).catch((error) => console.warn('[cron/client-zero] monthly gated ping failed', error));
    return NextResponse.json({ success: true, action, leadId: lead.leadId, artifactCount: fixKit.artifacts.length });
  }

  const snapshots = await listAuditSnapshots(lead.leadId);
  const latestPulse = snapshots.filter((s) => s.runType === 'pulse').at(-1);
  const pulseDue = !latestPulse || !latestPulse.createdAt || Date.parse(latestPulse.createdAt) <= now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return NextResponse.json({ success: true, action: 'dispatch', leadId: lead.leadId, pulseDue, monthlyDelegatedTo: '/api/cron/process-reruns', snapshotCount: snapshots.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
