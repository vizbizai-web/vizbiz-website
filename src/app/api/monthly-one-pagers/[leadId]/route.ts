import { NextRequest, NextResponse } from 'next/server';
import { getLeadByLeadId, updateLead } from '@/lib/google-sheets';
import { listAuditSnapshots } from '@/lib/audit-snapshots';
import { diffSnapshots } from '@/lib/snapshot-diff';
import { getFixKit } from '@/lib/fix-kit-store';
import { buildMonthlyOnePager, validateOnePagerNumbers, type MonthlyOnePager } from '@/lib/monthly-one-pager';
import { sendVizBizEmail } from '@/lib/resend-mailer';
import { recordActionAudit, requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';

function statusFromNotes(notes?: string) {
  if (!notes) return 'draft';
  if (notes.includes('[MONTHLY_ONE_PAGER_SENT')) return 'sent';
  if (notes.includes('[MONTHLY_ONE_PAGER_APPROVED')) return 'approved';
  return 'draft';
}

function renderOnePagerHtml(page: MonthlyOnePager, reportUrl: string) {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
  const list = (items: string[]) => items.length ? `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p>No major movement this month.</p>';
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:680px;margin:0 auto">
    <h1>${esc(page.title)}</h1>
    <p><strong>Score trend:</strong> ${esc(page.scoreLine)}</p>
    <h2>Platform movement</h2>
    ${list(page.platformLines)}
    <h2>What changed</h2>
    ${list(page.movementLines)}
    <h2>What we did / next focus</h2>
    <p>${esc(page.nextFocus)}</p>
    <p><a href="${reportUrl}" style="display:inline-block;background:#06b6d4;color:#00111a;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">Open your monthly AI visibility report</a></p>
  </div>`;
}

async function buildPayload(leadId: string) {
  const lead = await getLeadByLeadId(leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);
  const snapshots = (await listAuditSnapshots(leadId)).filter((snapshot) => snapshot.status === 'complete');
  const comparableSnapshots = snapshots.filter((snapshot) => snapshot.tier === 'paid' && snapshot.runType !== 'pulse' && (snapshot.promptPlan as any)?.runType !== 'pulse');
  if (comparableSnapshots.length < 2) throw new Error('Monthly one-pager requires at least two completed paid audit snapshots');
  const current = comparableSnapshots.at(-1)!;
  const previous = comparableSnapshots.at(-2)!;
  const diff = diffSnapshots(current, previous);
  const fixKit = await getFixKit(leadId).catch(() => null);
  const fixDropTitles = (fixKit?.artifacts || []).slice(0, 2).map((a) => a.title);
  const onePager = buildMonthlyOnePager({ businessName: lead.dealershipName, diff, fixDropTitles });
  const validationErrors = diff.comparable ? validateOnePagerNumbers(onePager, diff) : [];
  const reportUrl = `https://vizbiz.ai/report/${leadId}/`;
  return { lead, snapshots, diff, fixKit, onePager, validationErrors, reportUrl, status: statusFromNotes(lead.notes) };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = await params;
    const payload = await buildPayload(leadId);
    return NextResponse.json({ success: true, onePager: payload.onePager, validationErrors: payload.validationErrors, status: payload.status, reportUrl: payload.reportUrl, snapshotCount: payload.snapshots.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Monthly one-pager failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = await params;
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || '');
    const payload = await buildPayload(leadId);
    if (payload.validationErrors.length) {
      return NextResponse.json({ success: false, error: `One-pager validation failed: ${payload.validationErrors.join(', ')}` }, { status: 400 });
    }
    if (action === 'approve') {
      await updateLead(leadId, { notes: `${payload.lead.notes || ''}\n[MONTHLY_ONE_PAGER_APPROVED ${new Date().toISOString()}]` });
      await recordActionAudit({ leadId, action: 'monthly_one_pager_approve', channel: 'mission_control' });
      return NextResponse.json({ success: true, status: 'approved', onePager: payload.onePager });
    }
    if (action === 'send') {
      const latestLead = await getLeadByLeadId(leadId);
      if (!latestLead?.notes?.includes('[MONTHLY_ONE_PAGER_APPROVED')) {
        return NextResponse.json({ success: false, error: 'One-pager must be approved before send' }, { status: 400 });
      }
      if (!payload.lead.email) {
        return NextResponse.json({ success: false, error: 'Lead has no email' }, { status: 400 });
      }
      const subject = `${payload.lead.dealershipName}: your monthly AI visibility report`;
      const html = renderOnePagerHtml(payload.onePager, payload.reportUrl);
      const messageId = await sendVizBizEmail({ to: payload.lead.email, subject, html });
      await updateLead(leadId, { notes: `${latestLead.notes || ''}\n[MONTHLY_ONE_PAGER_SENT ${new Date().toISOString()} messageId=${messageId}]` });
      await recordActionAudit({ leadId, action: 'monthly_one_pager_send', channel: 'mission_control', metadata: { messageId } });
      return NextResponse.json({ success: true, status: 'sent', messageId, onePager: payload.onePager });
    }
    return NextResponse.json({ success: false, error: 'Unsupported one-pager action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Monthly one-pager action failed' }, { status: 500 });
  }
}
