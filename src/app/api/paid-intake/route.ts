import { NextResponse } from 'next/server';
import { getLeadByLeadId, updateLead } from '@/lib/google-sheets';
import { buildPaidIntakePayload, clientVerifiedNotesBlock, paidIntakeNotesBlock } from '@/lib/paid-intake-logic';
import { isSupabaseRestConfigured, supabaseRest } from '@/lib/supabase-rest';

const PAID_INTAKE_ALLOWED_STATUSES = new Set([
  'paid_checkout_complete',
  'paid_intake_pending',
  'paid_intake_submitted',
  'paid_report_drafting',
  'paid_report_ready_for_review',
]);

function stripOldPaidIntakeBlocks(notes: string): string {
  return notes
    .replace(/\n?PAID_INTAKE:\{[\s\S]*?\}(?=\n[A-Z_]+:|$)/g, '')
    .replace(/\n?CLIENT_VERIFIED_PROFILE:\{[\s\S]*?\}(?=\n[A-Z_]+:|$)/g, '')
    .trim();
}

async function recordClientVerifiedEvent(leadId: string, payload: Record<string, unknown>) {
  if (!isSupabaseRestConfigured()) return;
  await supabaseRest('/lead_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      lead_id: leadId,
      event_type: 'client_verified_profile',
      event_payload: payload,
    }),
  }).catch((error) => console.warn('[paid-intake] client_verified event failed', error));
}

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

    const payload = buildPaidIntakePayload(body, lead);
    if (!payload.requiredComplete) {
      return NextResponse.json({
        success: false,
        error: 'Please confirm category, services, competitors, location, contact name, at least one customer question, GBP access, and one priority service.',
      }, { status: 400 });
    }

    const previousNotes = lead.notes || '';
    const notes = [stripOldPaidIntakeBlocks(previousNotes), paidIntakeNotesBlock(payload), clientVerifiedNotesBlock(payload)].filter(Boolean).join('\n');
    const competitors = payload.competitors.map((competitor) => competitor.name).filter(Boolean).join(', ');

    await updateLead(leadId, {
      status: 'paid_intake_submitted',
      researchStatus: 'pending',
      notes,
      contactName: payload.contactPersonName || lead.contactName || '',
      city: payload.location || lead.city || '',
      serviceVisibility: payload.mainServices || lead.serviceVisibility || '',
      competitor: competitors || lead.competitor || '',
      clientProvidedCompetitors: competitors || lead.clientProvidedCompetitors || '',
      competitorMode: 'client_provided',
      lastStage: 'paid_intake',
    });

    await recordClientVerifiedEvent(leadId, {
      evidenceTier: 'client_verified',
      corrections: payload.clientVerified.corrections,
      customerQuestions: payload.customerQuestions,
      proofAssets: payload.proofAssets,
      priorityService: payload.priorityService,
      plan: payload.plan,
    });

    return NextResponse.json({
      success: true,
      leadId,
      status: 'paid_intake_submitted',
      corrections: payload.clientVerified.corrections,
      customerQuestions: payload.customerQuestions,
      nextUrl: `/thank-you?paid=1&lid=${encodeURIComponent(leadId)}`,
    });
  } catch (error) {
    console.error('[paid-intake] failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
