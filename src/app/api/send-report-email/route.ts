import { NextRequest, NextResponse } from 'next/server';
import { buildReportUrl } from '@/lib/report-token';
import { sendVizBizEmail } from '@/lib/resend-mailer';
import { getLeadByLeadId } from '@/lib/google-sheets';
import { buildReportEmailHtml, buildReportEmailSubject } from '@/lib/report-email';
import { verifyReportCta } from '@/lib/report-cta-verifier';
import { recordActionAudit, requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';
import { recordClientEmailSent } from '@/lib/client-emails';
import { scheduleNurtureAfterE2 } from '@/lib/email-suite-automation';

export const runtime = 'nodejs';
export const maxDuration = 30;

function numberValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function splitCompetitors(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((competitor) => competitor.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function parseLeadNotes(notes: string): { preflight: any; research: any } {
  if (!notes?.trim()) return { preflight: null, research: null };
  try {
    const parsed = JSON.parse(notes);
    return { preflight: parsed?.preflight || null, research: parsed?.research || null };
  } catch {
    return { preflight: null, research: null };
  }
}

function parseAppearedSnapshot(value: string | undefined): { appearedCount?: number; totalPrompts?: number } {
  const match = (value || '').match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
  if (!match) return {};
  return { appearedCount: Number(match[1]), totalPrompts: Number(match[2]) };
}

function scoreFromLead(snapshotAppeared: string | undefined, preflight: any, bodyScore: unknown): number | undefined {
  const explicit = numberValue(bodyScore);
  if (explicit !== undefined) return explicit;
  const preflightScore = numberValue(preflight?.aiReadinessScore);
  if (preflightScore !== undefined) return preflightScore;
  const scoreMatch = (snapshotAppeared || '').match(/^(\d+)\s*\/\s*100$/);
  return scoreMatch ? Number(scoreMatch[1]) : undefined;
}

async function sendEmail(to: string, subject: string, html: string): Promise<string> {
  return sendVizBizEmail({ to, subject, html });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireMissionControlApiAuth(req);
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const { to, leadId } = body;

    if (!leadId || !to) {
      return NextResponse.json({ error: 'Missing leadId or recipient email' }, { status: 400 });
    }

    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const isPaidSend = lead.status === 'paid_report_ready_for_review' || lead.status === 'paid_report_delivered';
    const isFreeApprovedSend = lead.status === 'approved' && lead.researchStatus === 'complete';
    if (!isPaidSend && !isFreeApprovedSend) {
      return NextResponse.json(
        { error: 'Report email is blocked until the report is ready and operator-approved.', currentStatus: lead.status, researchStatus: lead.researchStatus },
        { status: 409 }
      );
    }

    if (isPaidSend && !lead.reportUrl) {
      return NextResponse.json({ error: 'Paid report delivery requires a stored reportUrl.' }, { status: 409 });
    }

    const reportUrl = lead.reportUrl || buildReportUrl(leadId);
    await verifyReportCta(reportUrl);
    const nicheLabels: Record<string, string> = {
      spray_tanning: 'spray tanning',
      beauty_salon: 'beauty & salon',
      car_dealership: 'automotive retail',
      venue_wedding: 'wedding venue',
      dance_studio: 'dance studio',
      real_estate: 'real estate',
      restaurant: 'restaurant',
      fine_jewelry: 'fine jewelry',
      fitness: 'fitness',
      local_business: 'local business',
    };

    const businessName = body.businessName || lead.dealershipName;
    const contactName = body.contactName || lead.contactName;
    const city = body.city || lead.city;
    const { preflight, research } = parseLeadNotes(lead.notes || '');
    const niche = body.niche || preflight?.niche || research?.niche;
    const snapshotCounts = parseAppearedSnapshot(lead.snapshotAppeared);
    const appearedCount = numberValue(body.appearedCount) ?? numberValue(research?.appearedCount) ?? snapshotCounts.appearedCount;
    const totalPrompts = numberValue(body.totalPrompts) ?? numberValue(research?.totalPrompts) ?? snapshotCounts.totalPrompts;
    const competitors = splitCompetitors(lead.clientProvidedCompetitors || lead.competitor || body.competitorName);

    const html = buildReportEmailHtml({
      businessName,
      contactName,
      city,
      primaryMarket: preflight?.primaryMarket,
      reportUrl,
      aviScore: scoreFromLead(lead.snapshotAppeared, preflight, body.aviScore),
      statusBand: body.statusBand || lead.visibilityBand,
      appearedCount,
      totalPrompts,
      competitors,
      nicheLabel: preflight?.businessType || preflight?.nicheLabel || nicheLabels[niche] || 'local business',
      isPaid: isPaidSend,
    });

    const subject = buildReportEmailSubject({ businessName, reportUrl });
    const messageId = await sendEmail(to, subject, html);
    console.info(`[send-report-email] Sent to ${to}, id=${messageId}`);
    await recordActionAudit({ leadId, action: "send_report_email", channel: "mission_control", metadata: { to, messageId } });
    await recordClientEmailSent({
      leadId,
      templateId: isPaidSend ? 'E9_PAID_REPORT_FIX_KIT_DELIVERY' : 'E2_FREE_REPORT_DELIVERY',
      messageId,
      emailClass: 'transactional',
      automation: 'gated',
      to,
    });
    if (!isPaidSend) await scheduleNurtureAfterE2(lead);

    return NextResponse.json({ success: true, emailId: messageId, reportUrl });
  } catch (err) {
    console.error('[send-report-email] Failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to send email' }, { status: 500 });
  }
}
