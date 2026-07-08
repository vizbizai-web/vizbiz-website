import type { LeadRow } from './google-sheets';
import { updateLead } from './google-sheets';
import { buildReportUrl } from './report-token';
import { isSupabaseRestConfigured, supabaseRest } from './supabase-rest';
import {
  type ClientEmailId,
  type RenderedClientEmail,
  renderClientEmail,
  sendRenderedClientEmail,
  shouldSuppressClientEmail,
} from './client-emails';

export type EmailSuiteEventType = 'email_scheduled' | 'email_suppressed' | 'email_skipped' | 'gated_email_ready' | 'gated_email_approved' | 'email_suite_error';

export type LeadEventRow = {
  id?: string;
  lead_id: string;
  event_type: string;
  event_payload?: any;
  created_at?: string;
};

export async function recordEmailSuiteEvent(input: {
  leadId: string;
  eventType: EmailSuiteEventType;
  payload: Record<string, unknown>;
  createdAt?: string;
}) {
  if (!isSupabaseRestConfigured()) return;
  await supabaseRest('/lead_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      lead_id: input.leadId,
      event_type: input.eventType,
      event_payload: input.payload,
      ...(input.createdAt ? { created_at: input.createdAt } : {}),
    }),
  });
}

export async function getLeadEmailEvents(leadId: string): Promise<LeadEventRow[]> {
  if (!isSupabaseRestConfigured()) return [];
  return supabaseRest<LeadEventRow[]>(`/lead_events?select=id,lead_id,event_type,event_payload,created_at&lead_id=eq.${encodeURIComponent(leadId)}&order=created_at.asc`).catch(() => []);
}

export function hasTemplateEvent(events: LeadEventRow[], eventType: string, templateId: ClientEmailId): boolean {
  return events.some((event) => event.event_type === eventType && event.event_payload?.templateId === templateId);
}

export function parseEmailSuiteState(notes = ''): { optedOutCommercial: boolean; purchased: boolean; fixVerifiedInstalled: boolean } {
  return {
    optedOutCommercial: /commercial_opt_out|opted_out_commercial|reply\s+no\s+thanks|no thanks/i.test(notes),
    purchased: /PAYMENT_CONFIRMED|paid_intake_pending|paid_intake_submitted|paid_report|closed_won/i.test(notes),
    fixVerifiedInstalled: /fix_verification_installed|llms\.txt present|schema present|"regressions"\s*:\s*\[\s*\]/i.test(notes),
  };
}

function parseCounts(snapshotAppeared?: string): { appeared: number; total: number } | null {
  const match = (snapshotAppeared || '').match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
  return match ? { appeared: Number(match[1]), total: Number(match[2]) } : null;
}

function parseIsoFromNotes(notes: string, marker: string): string | null {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = notes.match(new RegExp(`\\[${escaped}\\s+([^\\]\s]+)`, 'i'));
  return match?.[1] || null;
}

function daysAgoIso(days: number, now = new Date()) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function addDaysIso(base: string, days: number) {
  return new Date(Date.parse(base) + days * 24 * 60 * 60 * 1000).toISOString();
}

function due(scheduledAt: string | undefined, now: Date) {
  return Boolean(scheduledAt && Date.parse(scheduledAt) <= now.getTime());
}

const FREE_REPORT_DELIVERY_TEMPLATE_IDS = ['E2_FREE_REPORT_DELIVERY', 'E2B_STALE_DELIVERY'] as const;
export type FreeReportDeliveryTemplateId = typeof FREE_REPORT_DELIVERY_TEMPLATE_IDS[number];

function isFreeReportDeliveryTemplateId(value: unknown): value is FreeReportDeliveryTemplateId {
  return typeof value === 'string' && (FREE_REPORT_DELIVERY_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function selectFreeReportDeliveryTemplate(lead: Pick<LeadRow, 'timestamp'>, opts: { now?: Date; override?: unknown } = {}): FreeReportDeliveryTemplateId {
  if (isFreeReportDeliveryTemplateId(opts.override)) return opts.override;
  const now = opts.now || new Date();
  const createdAt = Date.parse(lead.timestamp || '');
  if (Number.isFinite(createdAt) && createdAt < now.getTime() - 14 * 24 * 60 * 60 * 1000) return 'E2B_STALE_DELIVERY';
  return 'E2_FREE_REPORT_DELIVERY';
}

export function latestResearchRunAt(lead: Pick<LeadRow, 'researchCompletedAt' | 'reportGeneratedAt'>): string | null {
  const candidates = [lead.researchCompletedAt, lead.reportGeneratedAt]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .filter((value) => Number.isFinite(Date.parse(value)))
    .sort((a, b) => Date.parse(b) - Date.parse(a));
  return candidates[0] || null;
}

export function assertStaleDeliveryFreshness(lead: Pick<LeadRow, 'leadId' | 'researchCompletedAt' | 'reportGeneratedAt'>, templateId: FreeReportDeliveryTemplateId, now = new Date()) {
  if (templateId !== 'E2B_STALE_DELIVERY') return;
  const latest = latestResearchRunAt(lead);
  if (!latest || Date.parse(latest) < now.getTime() - 7 * 24 * 60 * 60 * 1000) {
    throw new Error('E2B_STALE_DELIVERY blocked: rerun first. This template says the report was tested this week, so latest research must be under 7 days old.');
  }
}

export function buildFreeReportDeliveryContext(lead: LeadRow) {
  const counts = parseCounts(lead.snapshotAppeared);
  if (!counts) throw new Error(`Cannot render E2 for ${lead.leadId}: missing appeared/total counts`);
  return {
    business: lead.dealershipName || 'your business',
    contactName: lead.contactName,
    city: lead.city,
    appearedX: counts.appeared,
    totalN: counts.total,
    reportUrl: lead.reportUrl || buildReportUrl(lead.leadId),
  };
}

export function buildE2Context(lead: LeadRow) {
  return buildFreeReportDeliveryContext(lead);
}

export function buildNurtureContext(lead: LeadRow, templateId: ClientEmailId) {
  const firstPrompt = (lead.notes || '').match(/"([^"\n]{12,120})"/)?.[1] || `best ${lead.dealershipName || 'business'} in ${lead.city || 'your market'}`;
  const firstRival = (lead.competitor || lead.clientProvidedCompetitors || '').split(',').map((x) => x.trim()).find(Boolean) || '';
  const base = {
    business: lead.dealershipName || 'your business',
    contactName: lead.contactName,
    city: lead.city,
    reportUrl: lead.reportUrl || buildReportUrl(lead.leadId),
    findingPrompt: firstPrompt,
    rival: firstRival,
  };
  if (templateId === 'E3_NURTURE_ONE_FIX') {
    return {
      ...base,
      fixCount: 3,
      topFixPlain: `Your site needs clearer structured proof of what ${lead.dealershipName || 'the business'} does, where it operates, and why it should be trusted by AI systems.`,
    };
  }
  return base;
}

export function buildE11Context(lead: LeadRow, payload: Record<string, any> = {}) {
  const after = parseCounts(lead.snapshotAppeared) || { appeared: Number(payload.afterX ?? 0), total: Number(payload.totalN ?? 0) };
  const beforeX = Number(payload.beforeX ?? Math.max(0, after.appeared - 1));
  const moved = after.appeared > beforeX;
  return {
    business: lead.dealershipName || 'your business',
    contactName: lead.contactName,
    reportUrl: lead.reportUrl || buildReportUrl(lead.leadId),
    upgradeUrl: payload.upgradeUrl || `https://vizbiz.ai/pricing?lead=${encodeURIComponent(lead.leadId)}`,
    beforeX,
    afterX: after.appeared,
    monthBefore: payload.monthBefore || 'Before',
    deltaSummary: payload.deltaSummary || (moved ? `${beforeX} answers became ${after.appeared}` : undefined),
    flatReasonLine: payload.flatReasonLine || 'Our scan shows no new appearances yet, so the next step is checking whether the files are installed and whether competitors moved at the same time.',
    competitor1: payload.competitor1 || (lead.clientProvidedCompetitors || lead.competitor || '').split(',')[0]?.trim() || 'your first competitor',
    competitor2: payload.competitor2 || (lead.clientProvidedCompetitors || lead.competitor || '').split(',')[1]?.trim() || 'your second competitor',
  };
}

export async function sendIntakeConfirmation(lead: Pick<LeadRow, 'leadId' | 'dealershipName' | 'contactName' | 'email' | 'city'>) {
  if (!lead.email) return null;
  const rendered = renderClientEmail('E1_INTAKE_CONFIRMATION', {
    business: lead.dealershipName || 'your business',
    contactName: lead.contactName,
    city: lead.city,
  });
  return sendRenderedClientEmail({ leadId: lead.leadId, to: lead.email, rendered });
}

export async function scheduleNurtureAfterE2(lead: LeadRow, sentAt = new Date()) {
  const events = await getLeadEmailEvents(lead.leadId);
  const schedule = [
    { templateId: 'E3_NURTURE_ONE_FIX' as const, day: 2 },
    { templateId: 'E4_NURTURE_COMPETITOR_ANGLE' as const, day: 5 },
    { templateId: 'E5_NURTURE_CLOSE_LOOP' as const, day: 9 },
  ];
  for (const item of schedule) {
    if (hasTemplateEvent(events, 'email_scheduled', item.templateId)) continue;
    await recordEmailSuiteEvent({
      leadId: lead.leadId,
      eventType: 'email_scheduled',
      payload: {
        templateId: item.templateId,
        class: 'commercial',
        automation: 'auto',
        trigger: 'post_E2',
        scheduledAt: addDaysIso(sentAt.toISOString(), item.day),
      },
    });
  }
}

export async function createE11GatedCard(lead: LeadRow, payload: Record<string, any> = {}) {
  const events = await getLeadEmailEvents(lead.leadId);
  if (hasTemplateEvent(events, 'gated_email_ready', 'E11_30_DAY_RESCAN')) return false;
  const rendered = renderClientEmail('E11_30_DAY_RESCAN', buildE11Context(lead, payload));
  await recordEmailSuiteEvent({
    leadId: lead.leadId,
    eventType: 'gated_email_ready',
    payload: {
      templateId: 'E11_30_DAY_RESCAN',
      subject: rendered.subject,
      previewText: rendered.text.slice(0, 500),
      trigger: 'rescan_after_fix',
      ...payload,
    },
  });
  await updateLead(lead.leadId, {
    notes: `${lead.notes || ''}\n[GATED_EMAIL_READY ${new Date().toISOString()} templateId=E11_30_DAY_RESCAN trigger=rescan_after_fix]`,
  }).catch(() => false);
  return true;
}

async function suppressOrSend(input: { lead: LeadRow; rendered: RenderedClientEmail; events: LeadEventRow[]; templateId: ClientEmailId }) {
  if (!input.lead.email) return { sent: false, suppressed: true, reason: 'missing_email' };
  if (hasTemplateEvent(input.events, 'email_sent', input.templateId)) return { sent: false, skipped: true, reason: 'already_sent' };
  const state = parseEmailSuiteState(input.lead.notes || '');
  const suppression = shouldSuppressClientEmail({
    emailClass: input.rendered.emailClass,
    leadStatus: input.lead.status,
    optedOutCommercial: state.optedOutCommercial,
    purchased: state.purchased || ['paid_checkout_complete', 'paid_intake_pending', 'paid_intake_submitted', 'paid_report_ready_for_review', 'paid_report_delivered', 'closed_won'].includes(input.lead.status),
    sequenceTemplateId: input.templateId,
  });
  if (suppression.suppressed) {
    await recordEmailSuiteEvent({ leadId: input.lead.leadId, eventType: 'email_suppressed', payload: { templateId: input.templateId, reason: suppression.reason, evaluatedAt: new Date().toISOString() } });
    return { sent: false, suppressed: true, reason: suppression.reason };
  }
  const messageId = await sendRenderedClientEmail({ leadId: input.lead.leadId, to: input.lead.email, rendered: input.rendered });
  return { sent: true, messageId };
}

export async function runEmailSuiteAutomation(leads: LeadRow[], opts: { now?: Date; dryRun?: boolean } = {}) {
  const now = opts.now || new Date();
  const actions: any[] = [];
  for (const lead of leads) {
    const events = await getLeadEmailEvents(lead.leadId);
    const state = parseEmailSuiteState(lead.notes || '');

    for (const event of events.filter((e) => e.event_type === 'email_scheduled')) {
      const templateId = event.event_payload?.templateId as ClientEmailId;
      if (!['E3_NURTURE_ONE_FIX', 'E4_NURTURE_COMPETITOR_ANGLE', 'E5_NURTURE_CLOSE_LOOP'].includes(templateId)) continue;
      if (!due(event.event_payload?.scheduledAt, now)) continue;
      const rendered = renderClientEmail(templateId, buildNurtureContext(lead, templateId));
      const result = opts.dryRun ? { dryRun: true } : await suppressOrSend({ lead, rendered, events, templateId });
      actions.push({ leadId: lead.leadId, templateId, trigger: 'nurture_schedule', ...result });
    }

    if (lead.status === 'paid_intake_pending' && !hasTemplateEvent(events, 'email_sent', 'E8_PAID_INTAKE_REMINDER') && !hasTemplateEvent(events, 'email_suppressed', 'E8_PAID_INTAKE_REMINDER')) {
      const paymentAt = parseIsoFromNotes(lead.notes || '', 'PAYMENT_CONFIRMED') || lead.timestamp;
      if (Date.parse(paymentAt) <= now.getTime() - 24 * 60 * 60 * 1000) {
        const intakeUrl = `https://vizbiz.ai/paid-intake/${encodeURIComponent(lead.leadId)}`;
        const rendered = renderClientEmail('E8_PAID_INTAKE_REMINDER', { business: lead.dealershipName || 'your business', contactName: lead.contactName, intakeUrl });
        const result = opts.dryRun ? { dryRun: true } : await suppressOrSend({ lead, rendered, events, templateId: 'E8_PAID_INTAKE_REMINDER' });
        actions.push({ leadId: lead.leadId, templateId: 'E8_PAID_INTAKE_REMINDER', trigger: 'paid_intake_pending_24h', ...result });
      }
    }

    if (lead.status === 'paid_report_delivered' && state.fixVerifiedInstalled && !hasTemplateEvent(events, 'email_skipped', 'E10_IMPLEMENTATION_CHECK_IN') && !hasTemplateEvent(events, 'email_sent', 'E10_IMPLEMENTATION_CHECK_IN')) {
      const deliveredAt = parseIsoFromNotes(lead.notes || '', 'FIX_KIT_DELIVERED') || lead.emailSentAt || lead.timestamp;
      if (Date.parse(deliveredAt) <= now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        const payload = { templateId: 'E10_IMPLEMENTATION_CHECK_IN' as const, trigger: 'post_kit_delivery_day_7', reason: 'fix_verification_installed', evaluatedAt: new Date().toISOString() };
        if (!opts.dryRun) await recordEmailSuiteEvent({ leadId: lead.leadId, eventType: 'email_skipped', payload });
        actions.push({ leadId: lead.leadId, ...payload, sent: false, skipped: true });
      }
    }

    if (lead.status === 'paid_report_delivered' && !state.fixVerifiedInstalled && !hasTemplateEvent(events, 'email_sent', 'E10_IMPLEMENTATION_CHECK_IN')) {
      const deliveredAt = parseIsoFromNotes(lead.notes || '', 'FIX_KIT_DELIVERED') || lead.emailSentAt || lead.timestamp;
      if (Date.parse(deliveredAt) <= now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        const rendered = renderClientEmail('E10_IMPLEMENTATION_CHECK_IN', { business: lead.dealershipName || 'your business', contactName: lead.contactName, fixkitUrl: `https://vizbiz.ai/api/fix-kits/${encodeURIComponent(lead.leadId)}/download` });
        const result = opts.dryRun ? { dryRun: true } : await suppressOrSend({ lead, rendered, events, templateId: 'E10_IMPLEMENTATION_CHECK_IN' });
        actions.push({ leadId: lead.leadId, templateId: 'E10_IMPLEMENTATION_CHECK_IN', trigger: 'post_kit_delivery_day_7', ...result });
      }
    }
  }
  return actions;
}

export async function approveAndSendGatedEmail(lead: LeadRow, templateId: ClientEmailId = 'E11_30_DAY_RESCAN') {
  const events = await getLeadEmailEvents(lead.leadId);
  const ready = [...events].reverse().find((event) => event.event_type === 'gated_email_ready' && event.event_payload?.templateId === templateId);
  if (!ready) throw new Error(`No gated ${templateId} card is ready for ${lead.leadId}`);
  if (hasTemplateEvent(events, 'email_sent', templateId)) throw new Error(`${templateId} already sent for ${lead.leadId}`);
  const rendered = renderClientEmail(templateId, templateId === 'E11_30_DAY_RESCAN' ? buildE11Context(lead, ready.event_payload || {}) : buildE2Context(lead));
  const result = await suppressOrSend({ lead, rendered, events, templateId });
  if (!result.sent) throw new Error(`Gated ${templateId} was not sent: ${result.reason || 'unknown'}`);
  await recordEmailSuiteEvent({ leadId: lead.leadId, eventType: 'gated_email_approved', payload: { templateId, messageId: result.messageId, approvedAt: new Date().toISOString() } });
  await updateLead(lead.leadId, { notes: `${lead.notes || ''}\n[GATED_EMAIL_APPROVED ${new Date().toISOString()} templateId=${templateId} messageId=${result.messageId}]` }).catch(() => false);
  return { ...result, subject: rendered.subject };
}

export const emailSuiteTestHelpers = { daysAgoIso };
