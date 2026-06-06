import { NextResponse } from 'next/server';
import { getLeadByLeadId, updateLead } from '@/lib/google-sheets';
import { buildPaidIntakePayload, paidIntakeNotesBlock } from '@/lib/paid-intake-logic';

const PAID_INTAKE_ALLOWED_STATUSES = new Set([
  'paid_checkout_complete',
  'paid_intake_pending',
  'paid_intake_submitted',
  'paid_report_drafting',
  'paid_report_ready_for_review',
]);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const leadId = typeof body.leadId === 'string' ? body.leadId.trim() : '';
    if (!leadId) {
      return NextResponse.json({ success: false, error: 'Missing leadId' }, { status: 400 });
    }

    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    if (!PAID_INTAKE_ALLOWED_STATUSES.has(lead.status)) {
      return NextResponse.json({ success: false, error: 'Paid intake is only available after confirmed checkout.' }, { status: 403 });
    }

    const payload = buildPaidIntakePayload(body);
    if (!payload.requiredComplete) {
      return NextResponse.json({
        success: false,
        error: 'Please complete business category, main services, ideal customer, goal, and exactly two competitor names.',
      }, { status: 400 });
    }

    const previousNotes = lead.notes || '';
    const withoutOldPaidIntake = previousNotes.replace(/\n?PAID_INTAKE:\{[\s\S]*?\}(?=\n[A-Z_]+:|$)/g, '').trim();
    const notes = [withoutOldPaidIntake, paidIntakeNotesBlock(payload)].filter(Boolean).join('\n');
    const competitors = payload.competitors.map((competitor) => competitor.name).filter(Boolean).join(', ');

    await updateLead(leadId, {
      status: 'paid_intake_submitted',
      researchStatus: 'pending',
      notes,
      competitor: competitors || lead.competitor || '',
      clientProvidedCompetitors: competitors || lead.clientProvidedCompetitors || '',
      competitorMode: 'client_provided',
      lastStage: 'paid_intake',
    });

    return NextResponse.json({
      success: true,
      leadId,
      status: 'paid_intake_submitted',
      nextUrl: `/thank-you?paid=1&lid=${encodeURIComponent(leadId)}`,
    });
  } catch (error) {
    console.error('[paid-intake] failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
