import { NextResponse } from 'next/server';
import { getAllLeads, updateLeadResearchResults } from '@/lib/google-sheets';
import { classifyLeadTriage } from '@/lib/lead-triage';
import { recordActionAudit, requireMissionControlApiAuth } from '@/lib/mission-control-api-auth';

const APPROVAL_PHRASE = 'ALEX_APPROVED_BULK_JUNK';

export async function POST(request: Request) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || 'preview_junk_candidates');
  const leadIds = Array.isArray(body.leadIds) ? body.leadIds.map(String) : [];
  const dryRun = body.dryRun !== false;
  const confirmPhrase = String(body.confirmPhrase || '');

  if (action !== 'preview_junk_candidates' && action !== 'bulk_mark_junk') {
    return NextResponse.json({ success: false, error: 'Unsupported bulk action' }, { status: 400 });
  }

  const leads = await getAllLeads();
  const selected = leadIds.length ? leads.filter((lead) => leadIds.includes(lead.leadId)) : leads;
  const inspected = selected.map((lead) => ({ lead, triage: classifyLeadTriage(lead) }));
  const candidates = inspected.filter((row) => row.triage.label === 'junk_candidate');
  const uncertain = inspected.filter((row) => row.triage.label === 'uncertain');

  if (action === 'preview_junk_candidates' || dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      candidates: candidates.map(({ lead, triage }) => ({ leadId: lead.leadId, businessName: lead.dealershipName, email: lead.email, website: lead.website, status: lead.status, score: triage.score, reasons: triage.reasons })),
      uncertain: uncertain.map(({ lead, triage }) => ({ leadId: lead.leadId, businessName: lead.dealershipName, email: lead.email, website: lead.website, status: lead.status, score: triage.score, reasons: triage.reasons })),
      message: 'Preview only. Bulk junk requires Alex approval and confirmPhrase ALEX_APPROVED_BULK_JUNK.',
    });
  }

  if (confirmPhrase !== APPROVAL_PHRASE) {
    return NextResponse.json({ success: false, error: 'Bulk junk blocked: missing Alex approval confirmPhrase.' }, { status: 403 });
  }

  const updated: string[] = [];
  for (const { lead, triage } of candidates) {
    await updateLeadResearchResults(lead.leadId, {
      status: 'closed_lost',
      notes: `${lead.notes || ''}\n[BULK_MARKED_JUNK via MC ${new Date().toISOString()}] ${triage.reasons.join('; ')}`,
    });
    await recordActionAudit({ leadId: lead.leadId, action: 'bulk_mark_junk', channel: 'mission_control', metadata: { score: triage.score, reasons: triage.reasons } });
    updated.push(lead.leadId);
  }

  return NextResponse.json({ success: true, dryRun: false, updated, skippedUncertain: uncertain.length });
}
