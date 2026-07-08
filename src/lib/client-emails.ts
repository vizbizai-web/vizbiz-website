import { sendVizBizEmail } from './resend-mailer';
import { supabaseRest, isSupabaseRestConfigured } from './supabase-rest';

export type ClientEmailId =
  | 'E1_INTAKE_CONFIRMATION'
  | 'E2_FREE_REPORT_DELIVERY'
  | 'E2B_STALE_DELIVERY'
  | 'E3_NURTURE_ONE_FIX'
  | 'E4_NURTURE_COMPETITOR_ANGLE'
  | 'E5_NURTURE_CLOSE_LOOP'
  | 'E7_PAYMENT_RECEIVED_NEXT_STEP'
  | 'E8_PAID_INTAKE_REMINDER'
  | 'E9_PAID_REPORT_FIX_KIT_DELIVERY'
  | 'E10_IMPLEMENTATION_CHECK_IN'
  | 'E11_30_DAY_RESCAN'
  | 'E12_PAYMENT_FAILED'
  | 'E13_CANCELLATION_ACKNOWLEDGMENT';

export type EmailClass = 'transactional' | 'commercial' | 'hybrid';
export type AutomationClass = 'auto' | 'gated';

export type ClientEmailContext = {
  business: string;
  firstName?: string | null;
  contactName?: string | null;
  city?: string | null;
  findingPrompt?: string | null;
  rival?: string | null;
  appearedX?: number | null;
  totalN?: number | null;
  reportUrl?: string | null;
  fixkitUrl?: string | null;
  intakeUrl?: string | null;
  upgradeUrl?: string | null;
  billingPortalUrl?: string | null;
  fixCount?: number | null;
  topFixPlain?: string | null;
  fixkitCount?: number | null;
  beforeX?: number | null;
  afterX?: number | null;
  monthBefore?: string | null;
  month?: string | null;
  deltaSummary?: string | null;
  flatReasonLine?: string | null;
  competitor1?: string | null;
  competitor2?: string | null;
  pauseDate?: string | null;
  mailingAddress?: string | null;
};

export type RenderedClientEmail = {
  id: ClientEmailId;
  subject: string;
  text: string;
  html: string;
  emailClass: EmailClass;
  automation: AutomationClass;
};

const TEMPLATE_META: Record<ClientEmailId, { emailClass: EmailClass; automation: AutomationClass }> = {
  E1_INTAKE_CONFIRMATION: { emailClass: 'transactional', automation: 'auto' },
  E2_FREE_REPORT_DELIVERY: { emailClass: 'transactional', automation: 'gated' },
  E2B_STALE_DELIVERY: { emailClass: 'transactional', automation: 'gated' },
  E3_NURTURE_ONE_FIX: { emailClass: 'commercial', automation: 'auto' },
  E4_NURTURE_COMPETITOR_ANGLE: { emailClass: 'commercial', automation: 'auto' },
  E5_NURTURE_CLOSE_LOOP: { emailClass: 'commercial', automation: 'auto' },
  E7_PAYMENT_RECEIVED_NEXT_STEP: { emailClass: 'transactional', automation: 'auto' },
  E8_PAID_INTAKE_REMINDER: { emailClass: 'transactional', automation: 'auto' },
  E9_PAID_REPORT_FIX_KIT_DELIVERY: { emailClass: 'transactional', automation: 'gated' },
  E10_IMPLEMENTATION_CHECK_IN: { emailClass: 'transactional', automation: 'auto' },
  E11_30_DAY_RESCAN: { emailClass: 'hybrid', automation: 'gated' },
  E12_PAYMENT_FAILED: { emailClass: 'transactional', automation: 'auto' },
  E13_CANCELLATION_ACKNOWLEDGMENT: { emailClass: 'transactional', automation: 'auto' },
};

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function required(value: unknown, field: string): string {
  const out = clean(value);
  if (!out) throw new Error(`Client email missing required field: ${field}`);
  return out;
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  throw new Error(`Client email missing required numeric field: ${field}`);
}

function mailingAddress(ctx: ClientEmailContext): string {
  return clean(ctx.mailingAddress) || process.env.VIZBIZ_MAILING_ADDRESS || 'VizBiz.ai';
}

export function firstNameForGreeting(ctx: Pick<ClientEmailContext, 'business' | 'firstName' | 'contactName'>): string {
  const business = clean(ctx.business).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const raw = clean(ctx.firstName) || clean(ctx.contactName);
  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!normalized || normalized === business || business.includes(normalized)) return '';
  return raw.split(/\s+/)[0];
}

function greeting(ctx: ClientEmailContext): string {
  const first = firstNameForGreeting(ctx);
  return first ? `Hi ${first},\n\n` : '';
}

function courtesyOptOut(ctx: ClientEmailContext) {
  return `${mailingAddress(ctx)} · Reply "no thanks" any time to stop emails.`;
}

function commercialOptOut(ctx: ClientEmailContext) {
  return `${mailingAddress(ctx)} · Reply "no thanks" to stop these emails.`;
}

function htmlFromText(text: string): string {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.65;color:#E2E8F0;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return `<html><body style="margin:0;background:#020617;padding:24px;font-family:Arial,sans-serif;color:#F8FAFC;"><div style="max-width:640px;margin:0 auto;background:#0F172A;border:1px solid rgba(34,211,238,.22);border-radius:20px;padding:28px;">${paragraphs}</div></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function assertNoTemplateLeaks(email: RenderedClientEmail) {
  const combined = `${email.subject}\n${email.text}\n${email.html}`;
  const unresolved = combined.match(/\{[a-zA-Z0-9_\-]+\}/g);
  if (unresolved) throw new Error(`Client email ${email.id} has unresolved merge fields: ${unresolved.join(', ')}`);
  if (combined.includes('!')) throw new Error(`Client email ${email.id} contains exclamation mark; suite voice forbids it`);
  for (const blocked of ['manual review', 'operator approval', 'auto-discovered competitors', 'internal only', 'client-ready deliverable', 'paid report should', 'the client named']) {
    if (combined.toLowerCase().includes(blocked)) throw new Error(`Client email ${email.id} leaked blocked phrase: ${blocked}`);
  }
}

function finish(id: ClientEmailId, subject: string, text: string): RenderedClientEmail {
  const email = { id, subject, text, html: htmlFromText(text), ...TEMPLATE_META[id] };
  assertNoTemplateLeaks(email);
  return email;
}

export function renderClientEmail(id: ClientEmailId, ctx: ClientEmailContext): RenderedClientEmail {
  const business = required(ctx.business, 'business');
  const city = clean(ctx.city);
  switch (id) {
    case 'E1_INTAKE_CONFIRMATION':
      return finish(id, `${business}: your AI visibility check is running`, `${greeting(ctx)}We're running your check now — real buyer questions, tested on ChatGPT, Gemini, and Perplexity.\n\nYour report typically lands within 48 hours. It will show exactly where ${business} appears, where it doesn't, and who shows up instead.\n\nAlex — VizBiz.ai\n${courtesyOptOut(ctx)}`);
    case 'E2_FREE_REPORT_DELIVERY': {
      const appeared = requiredNumber(ctx.appearedX, 'appeared_x');
      const total = requiredNumber(ctx.totalN, 'total_n');
      const reportUrl = required(ctx.reportUrl, 'report_url');
      return finish(id, `${business}: your AI visibility snapshot is ready`, `${greeting(ctx)}I ran an AI visibility check on ${business} and put together your snapshot report.\n\nThe one number that matters: you appeared in ${appeared} of ${total} AI answers we tested${city ? ` for ${city}` : ''}.\n\nSee the full results: ${reportUrl}\n\nThe report shows each question we asked, which platforms named you, and what's keeping you out of the rest.\n\nAlex — VizBiz.ai`);
    }
    case 'E2B_STALE_DELIVERY': {
      const appeared = requiredNumber(ctx.appearedX, 'appeared_x');
      const total = requiredNumber(ctx.totalN, 'total_n');
      const reportUrl = required(ctx.reportUrl, 'report_url');
      const cityText = required(ctx.city, 'city');
      return finish(id, `${business}: your AI visibility report — tested this week`, `${greeting(ctx)}You asked for an AI visibility check a few weeks back, and I owe you a straight sentence: we were rebuilding the system that runs these reports, and yours waited longer than it should have.\n\nThe upside — your report just ran on the finished version: real buyer questions tested this week across ChatGPT, Gemini, and Perplexity, not a single engine. You appeared in ${appeared} of ${total} answers we tested for ${cityText}.\n\nSee the full results: ${reportUrl}\n\nNo charge, no strings — it's the report you asked for, done properly.\n\nAlex — VizBiz.ai`);
    }
    case 'E3_NURTURE_ONE_FIX': {
      const fixCount = requiredNumber(ctx.fixCount, 'fix_count');
      const topFix = required(ctx.topFixPlain, 'top_fix_plain');
      const reportUrl = required(ctx.reportUrl, 'report_url');
      return finish(id, `One fix from your ${business} report — no charge`, `${greeting(ctx)}Your report found ${fixCount} fixable issues. Here's the first one, free:\n\n${topFix}\n\nThe remaining ${Math.max(0, fixCount - 1)} are in the Fix plan — files ready to install, not a to-do list: ${reportUrl}\n\nAlex — VizBiz.ai\n${commercialOptOut(ctx)}`);
    }
    case 'E4_NURTURE_COMPETITOR_ANGLE': {
      const prompt = required(ctx.findingPrompt, 'finding_prompt');
      const reportUrl = required(ctx.reportUrl, 'report_url');
      const rival = clean(ctx.rival);
      const subject = rival ? `${rival} keeps coming up for "${prompt}"` : `Nobody in ${city || 'your market'} is winning these AI answers yet`;
      const lead = rival
        ? `When we asked "${prompt}", ${rival} was named. ${business} wasn't. That answer runs every day, for free, to anyone who asks.`
        : `When we tested ${city || 'your market'} questions like "${prompt}", almost nobody came up. These positions are unclaimed — the first business that structures for AI tends to keep them.`;
      return finish(id, subject, `${greeting(ctx)}${lead}\n\nThe Fix plan closes the gap with installed files, not advice — and a 30-day re-test proves the movement: ${reportUrl}\n\nAlex — VizBiz.ai\n${commercialOptOut(ctx)}`);
    }
    case 'E5_NURTURE_CLOSE_LOOP': {
      const reportUrl = required(ctx.reportUrl, 'report_url');
      return finish(id, `Last note on the ${business} report`, `${greeting(ctx)}Quick final note — your report stays live at ${reportUrl}.\n\nIf the timing isn't right, no problem. Two things worth knowing: the fixes are one-time files your web person installs in about an hour, and every fix comes with a 30-day re-test on the same questions — you see the movement, or you see us say it hasn't moved yet.\n\nThat's the last email from me unless something changes in your market.\n\nAlex — VizBiz.ai\n${commercialOptOut(ctx)}`);
    }
    case 'E7_PAYMENT_RECEIVED_NEXT_STEP': {
      const intakeUrl = required(ctx.intakeUrl, 'intake_url');
      return finish(id, `${business}: payment received — one 5-minute step`, `${greeting(ctx)}Payment confirmed. One short step before we run your full analysis: confirm your business details and tell us the questions your customers actually ask. Five minutes, and it makes your report sharper: ${intakeUrl}\n\nYour full report — up to 60 buyer questions per platform, plus your Fix Kit — is typically ready within 48 hours of this step.\n\nAlex — VizBiz.ai`);
    }
    case 'E8_PAID_INTAKE_REMINDER': {
      const intakeUrl = required(ctx.intakeUrl, 'intake_url');
      return finish(id, `${business}: your paid analysis is waiting on one step`, `${greeting(ctx)}Your payment is in, and your analysis is queued behind one 5-minute step: ${intakeUrl}\n\nIf you'd rather we proceed with what our system already verified about ${business}, just reply "go ahead" and we'll run it as-is.\n\nAlex — VizBiz.ai`);
    }
    case 'E9_PAID_REPORT_FIX_KIT_DELIVERY': {
      const appeared = requiredNumber(ctx.appearedX, 'appeared_x');
      const total = requiredNumber(ctx.totalN, 'total_n');
      const reportUrl = required(ctx.reportUrl, 'report_url');
      const fixkitUrl = required(ctx.fixkitUrl, 'fixkit_url');
      const count = requiredNumber(ctx.fixkitCount, 'fixkit_count');
      return finish(id, `${business}: your full report and Fix Kit are ready`, `${greeting(ctx)}Your full analysis is done — ${appeared} of ${total} answers across ChatGPT, Gemini, and Perplexity, broken down by the kind of question customers ask: ${reportUrl}\n\nYour Fix Kit is ready too: ${count} files, ready to install, each with plain instructions — plus a pre-written email you can forward straight to your web person: ${fixkitUrl}\n\nIn 30 days we re-run the same questions and send you the before/after.\n\nAlex — VizBiz.ai`);
    }
    case 'E10_IMPLEMENTATION_CHECK_IN': {
      const fixkitUrl = required(ctx.fixkitUrl, 'fixkit_url');
      return finish(id, `${business}: quick check — are the files in?`, `${greeting(ctx)}Checking in on the Fix Kit. Our next scan hasn't spotted the files on your site yet — no rush, but the 30-day re-test measures what's installed, so the sooner they're in, the more movement it can show.\n\nIf anything's unclear, reply here and I'll straighten it out. If your web person needs the package again: ${fixkitUrl}\n\nAlex — VizBiz.ai`);
    }
    case 'E11_30_DAY_RESCAN': {
      const reportUrl = required(ctx.reportUrl, 'report_url');
      const upgradeUrl = required(ctx.upgradeUrl, 'upgrade_url');
      const before = requiredNumber(ctx.beforeX, 'before_x');
      const after = requiredNumber(ctx.afterX, 'after_x');
      const moved = after > before;
      const subject = moved ? `${business}: 30-day re-test — ${clean(ctx.deltaSummary) || `${before} answers became ${after}`}` : `${business}: 30-day re-test results — and what they mean`;
      const body = moved
        ? `We re-ran the same questions on the same platforms. ${clean(ctx.monthBefore) || 'Before'}: you appeared in ${before} answers. Today: ${after}. Each new appearance is listed in your updated report: ${reportUrl}\n\nThis movement holds only as long as nothing breaks and competitors stand still — neither lasts. Monitoring re-tests monthly, watches ${clean(ctx.competitor1) || 'your first competitor'} and ${clean(ctx.competitor2) || 'your second competitor'}, and ships a fresh fix each month. Your $88 credits toward the first month: ${upgradeUrl}`
        : `We re-ran the same questions. The honest result: no new appearances yet. ${required(ctx.flatReasonLine, 'flat_reason_line')} Updated report: ${reportUrl}\n\nIf you want us to stay on it — monthly re-tests, competitor tracking, a fresh fix each month — your $88 credits toward the first month: ${upgradeUrl}`;
      return finish(id, subject, `${greeting(ctx)}${body}\n\nAlex — VizBiz.ai\n${commercialOptOut(ctx)}`);
    }
    case 'E12_PAYMENT_FAILED': {
      const portal = required(ctx.billingPortalUrl, 'stripe_billing_portal_url');
      const pauseDate = required(ctx.pauseDate, 'pause_date');
      return finish(id, `${business}: card issue — monitoring pauses ${pauseDate}`, `${greeting(ctx)}Your monthly payment didn't go through — usually an expired card.\n\nMonitoring for ${business} pauses on ${pauseDate} unless it's updated: ${portal}\n\nYour snapshots and trend history are safe either way.\n\nAlex — VizBiz.ai`);
    }
    case 'E13_CANCELLATION_ACKNOWLEDGMENT':
      return finish(id, `${business}: monitoring closed — your history is archived`, `${greeting(ctx)}Your monitoring is closed as requested — no further charges.\n\nEverything stays archived: your snapshots, trend line, and Fix Kit. If you ever come back, the trend picks up where it left off rather than starting over.\n\nIf anything about the service fell short, I'd genuinely like to know — just reply.\n\nAlex — VizBiz.ai`);
  }
}

export function shouldSuppressClientEmail(input: {
  emailClass: EmailClass;
  leadStatus?: string | null;
  optedOutCommercial?: boolean;
  purchased?: boolean;
  sequenceTemplateId?: ClientEmailId;
}): { suppressed: boolean; reason?: string } {
  if (input.leadStatus === 'do_not_send') return { suppressed: true, reason: 'do_not_send' };
  if ((input.emailClass === 'commercial' || input.emailClass === 'hybrid') && input.optedOutCommercial) return { suppressed: true, reason: 'commercial_opt_out' };
  if (input.purchased && ['E3_NURTURE_ONE_FIX', 'E4_NURTURE_COMPETITOR_ANGLE', 'E5_NURTURE_CLOSE_LOOP'].includes(input.sequenceTemplateId || 'E1_INTAKE_CONFIRMATION')) return { suppressed: true, reason: 'purchase_stops_nurture' };
  return { suppressed: false };
}

export async function recordClientEmailSent(input: { leadId: string; templateId: ClientEmailId; messageId: string; emailClass: EmailClass; automation: AutomationClass; to?: string }) {
  if (!isSupabaseRestConfigured()) return;
  await supabaseRest('/lead_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      lead_id: input.leadId,
      event_type: 'email_sent',
      event_payload: {
        templateId: input.templateId,
        resendMessageId: input.messageId,
        class: input.emailClass,
        automation: input.automation,
        to: input.to,
      },
    }),
  }).catch((error) => console.warn('[client-emails] email_sent event insert failed', error));
}

export async function sendRenderedClientEmail(input: { leadId: string; to: string; rendered: RenderedClientEmail }) {
  const messageId = await sendVizBizEmail({ to: input.to, subject: input.rendered.subject, html: input.rendered.html, text: input.rendered.text });
  await recordClientEmailSent({ leadId: input.leadId, templateId: input.rendered.id, messageId, emailClass: input.rendered.emailClass, automation: input.rendered.automation, to: input.to });
  return messageId;
}
