import type { LeadRow } from './google-sheets';
import { isSupabaseRestConfigured, supabaseRest } from './supabase-rest';
import { sendPipelineAlert } from './telegram-alerts';

export type EmailOpsEvent = {
  id?: string;
  lead_id: string;
  event_type: string;
  event_payload?: Record<string, any> | null;
  created_at?: string;
};

export type EmailTemplateClass = 'delivery' | 'nurture' | 'lifecycle' | 'gated';

type CountTrend = { current: number; prior: number; direction: 'up' | 'down' | 'flat'; delta: number };

export type EmailOpsSummary = {
  generatedAt: string;
  source: 'lead_events';
  health24h: { sent: number; failed: number };
  topStrip: {
    sent: CountTrend;
    delivered: CountTrend;
    opened: CountTrend;
    clicked: CountTrend;
    failed: CountTrend;
    bounced: CountTrend;
  };
  daily: Array<{
    date: string;
    sent: number;
    failed: number;
    delivery: number;
    nurture: number;
    lifecycle: number;
    gated: number;
    alarm: boolean;
    scheduledDue: number;
  }>;
  funnel: {
    e2: number;
    e3: number;
    e4: number;
    e5: number;
    suppressions: Array<{ between: string; count: number; purchase: number; other: number }>;
  };
  pendingGatedCards: number;
  rescansCompleted24h: number;
  suppressions24h: Array<{ reason: string; count: number }>;
  sendsByTemplate24h: Array<{ templateId: string; count: number }>;
  failures24h: number;
  recentEvents: Array<{ id?: string; leadId: string; businessName: string; eventType: string; templateId: string; reason?: string; at: string; leadUrl: string }>;
};

const DAY = 24 * 60 * 60 * 1000;

export function templateClass(templateId = '', eventType = ''): EmailTemplateClass {
  if (eventType === 'gated_email_ready' || /^E11|MONTHLY_ONE_PAGER|COMPETITOR_MOVEMENT/i.test(templateId)) return 'gated';
  if (/^E[345]_/.test(templateId)) return 'nurture';
  if (/^E(?:1|8|10|12|13)_/.test(templateId)) return 'lifecycle';
  return 'delivery';
}

function dayKey(date: Date) { return date.toISOString().slice(0, 10); }
function templateOf(event: EmailOpsEvent): string { return String(event.event_payload?.templateId || event.event_payload?.template_id || event.event_payload?.template || 'unknown'); }
function reasonOf(event: EmailOpsEvent): string { return String(event.event_payload?.reason || event.event_payload?.error || event.event_payload?.status || 'unknown'); }
function isFailed(event: EmailOpsEvent) { return /email_(failed|bounced)|send_failed|resend_.*(failed|bounced)|bounce/i.test(event.event_type); }
function isDelivered(event: EmailOpsEvent) { return /email_delivered|resend_.*delivered/i.test(event.event_type); }
function isOpened(event: EmailOpsEvent) { return /email_opened|resend_.*opened/i.test(event.event_type); }
function isClicked(event: EmailOpsEvent) { return /email_clicked|resend_.*clicked/i.test(event.event_type); }
function trend(current: number, prior: number): CountTrend {
  return { current, prior, delta: current - prior, direction: current > prior ? 'up' : current < prior ? 'down' : 'flat' };
}
function inc(map: Map<string, number>, key: string, by = 1) { map.set(key, (map.get(key) || 0) + by); }
function mapEntries(map: Map<string, number>) { return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ [key.includes(':') ? 'key' : 'templateId']: key, count })); }

export async function fetchEmailOpsEvents(now = new Date()): Promise<EmailOpsEvent[]> {
  if (!isSupabaseRestConfigured()) return [];
  const since = encodeURIComponent(new Date(now.getTime() - 30 * DAY).toISOString());
  return supabaseRest<EmailOpsEvent[]>(`/lead_events?select=id,lead_id,event_type,event_payload,created_at&created_at=gte.${since}&order=created_at.desc&limit=5000`).catch(() => []);
}

export function buildEmailOpsSummary(events: EmailOpsEvent[], leads: Pick<LeadRow, 'leadId' | 'dealershipName'>[] = [], now = new Date()): EmailOpsSummary {
  const leadNames = new Map(leads.map((lead) => [lead.leadId, lead.dealershipName || 'Unknown Business']));
  const current7Start = now.getTime() - 7 * DAY;
  const prior7Start = now.getTime() - 14 * DAY;
  const last24Start = now.getTime() - DAY;
  const inWindow = (event: EmailOpsEvent, start: number, end = now.getTime()) => {
    const t = Date.parse(event.created_at || '');
    return Number.isFinite(t) && t >= start && t < end;
  };
  const countWhere = (start: number, end: number, fn: (event: EmailOpsEvent) => boolean) => events.filter((event) => inWindow(event, start, end) && fn(event)).length;

  const sent7 = countWhere(current7Start, now.getTime(), (event) => event.event_type === 'email_sent');
  const sentPrior = countWhere(prior7Start, current7Start, (event) => event.event_type === 'email_sent');
  const delivered7 = countWhere(current7Start, now.getTime(), isDelivered);
  const deliveredPrior = countWhere(prior7Start, current7Start, isDelivered);
  const opened7 = countWhere(current7Start, now.getTime(), isOpened);
  const openedPrior = countWhere(prior7Start, current7Start, isOpened);
  const clicked7 = countWhere(current7Start, now.getTime(), isClicked);
  const clickedPrior = countWhere(prior7Start, current7Start, isClicked);
  const failed7 = countWhere(current7Start, now.getTime(), isFailed);
  const failedPrior = countWhere(prior7Start, current7Start, isFailed);
  const bounced7 = countWhere(current7Start, now.getTime(), (event) => /bounce/i.test(event.event_type));
  const bouncedPrior = countWhere(prior7Start, current7Start, (event) => /bounce/i.test(event.event_type));

  const sentByDay = new Map<string, number>();
  const scheduledDueByDay = new Map<string, number>();
  const daily = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(now.getTime() - (13 - idx) * DAY);
    return { date: dayKey(d), sent: 0, failed: 0, delivery: 0, nurture: 0, lifecycle: 0, gated: 0, alarm: false, scheduledDue: 0 };
  });
  const dailyByDate = new Map(daily.map((row) => [row.date, row]));

  for (const event of events) {
    const t = Date.parse(event.created_at || '');
    if (!Number.isFinite(t)) continue;
    const key = dayKey(new Date(t));
    const row = dailyByDate.get(key);
    if (row) {
      if (event.event_type === 'email_sent') {
        row.sent += 1;
        row[templateClass(templateOf(event), event.event_type)] += 1;
        inc(sentByDay, key);
      }
      if (isFailed(event)) row.failed += 1;
    }
    if (event.event_type === 'email_scheduled') {
      const scheduledAt = String(event.event_payload?.scheduledAt || '');
      const scheduledMs = Date.parse(scheduledAt);
      if (Number.isFinite(scheduledMs)) {
        const dueKey = dayKey(new Date(scheduledMs));
        if (dailyByDate.has(dueKey) && scheduledMs <= now.getTime()) inc(scheduledDueByDay, dueKey);
      }
    }
  }
  for (const row of daily) {
    row.scheduledDue = scheduledDueByDay.get(row.date) || 0;
    row.alarm = row.scheduledDue > 0 && (sentByDay.get(row.date) || 0) === 0;
  }

  const last24 = events.filter((event) => inWindow(event, last24Start));
  const sendsByTemplate = new Map<string, number>();
  const suppressionsByReason = new Map<string, number>();
  let rescansCompleted24h = 0;
  for (const event of last24) {
    if (event.event_type === 'email_sent') inc(sendsByTemplate, templateOf(event));
    if (event.event_type === 'email_suppressed') inc(suppressionsByReason, reasonOf(event));
    if (/rescan.*completed|fix_kit_rescan_completed/i.test(event.event_type) || event.event_payload?.trigger === 'rescan_after_fix') rescansCompleted24h += 1;
  }

  const sentTemplateCount = (ids: string[]) => events.filter((event) => event.event_type === 'email_sent' && ids.includes(templateOf(event))).length;
  const suppressionBetween = (between: string, templates: string[]) => {
    const matched = events.filter((event) => event.event_type === 'email_suppressed' && templates.includes(templateOf(event)));
    const purchase = matched.filter((event) => reasonOf(event) === 'purchase_stops_nurture').length;
    return { between, count: matched.length, purchase, other: matched.length - purchase };
  };

  const pendingGatedCards = events.filter((event) => event.event_type === 'gated_email_ready').filter((ready) => {
    const templateId = templateOf(ready);
    return !events.some((event) => event.lead_id === ready.lead_id && event.event_type === 'gated_email_approved' && templateOf(event) === templateId);
  }).length;

  return {
    generatedAt: now.toISOString(),
    source: 'lead_events',
    health24h: { sent: last24.filter((event) => event.event_type === 'email_sent').length, failed: last24.filter(isFailed).length },
    topStrip: {
      sent: trend(sent7, sentPrior),
      delivered: trend(delivered7, deliveredPrior),
      opened: trend(opened7, openedPrior),
      clicked: trend(clicked7, clickedPrior),
      failed: trend(failed7, failedPrior),
      bounced: trend(bounced7, bouncedPrior),
    },
    daily,
    funnel: {
      e2: sentTemplateCount(['E2_FREE_REPORT_DELIVERY', 'E2B_STALE_DELIVERY']),
      e3: sentTemplateCount(['E3_NURTURE_ONE_FIX']),
      e4: sentTemplateCount(['E4_NURTURE_COMPETITOR_ANGLE']),
      e5: sentTemplateCount(['E5_NURTURE_CLOSE_LOOP']),
      suppressions: [
        suppressionBetween('E2→E3', ['E3_NURTURE_ONE_FIX']),
        suppressionBetween('E3→E4', ['E4_NURTURE_COMPETITOR_ANGLE']),
        suppressionBetween('E4→E5', ['E5_NURTURE_CLOSE_LOOP']),
      ],
    },
    pendingGatedCards,
    rescansCompleted24h,
    suppressions24h: [...suppressionsByReason.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({ reason, count })),
    sendsByTemplate24h: [...sendsByTemplate.entries()].sort((a, b) => b[1] - a[1]).map(([templateId, count]) => ({ templateId, count })),
    failures24h: last24.filter(isFailed).length,
    recentEvents: events
      .filter((event) => event.event_type === 'email_sent' || event.event_type === 'email_suppressed' || isFailed(event) || event.event_type === 'gated_email_ready')
      .slice(0, 80)
      .map((event) => ({
        id: event.id,
        leadId: event.lead_id,
        businessName: leadNames.get(event.lead_id) || event.lead_id,
        eventType: event.event_type,
        templateId: templateOf(event),
        reason: event.event_type === 'email_suppressed' || isFailed(event) ? reasonOf(event) : undefined,
        at: event.created_at || '',
        leadUrl: `/mission-control/leads/${event.lead_id}`,
      })),
  };
}

export function buildDailyAutomationDigestText(summary: EmailOpsSummary): string | null {
  const hasActivity = summary.health24h.sent || summary.health24h.failed || summary.suppressions24h.length || summary.pendingGatedCards || summary.rescansCompleted24h;
  if (!hasActivity) return null;
  const sends = summary.sendsByTemplate24h.length
    ? summary.sendsByTemplate24h.map((item) => `• ${item.templateId}: ${item.count}`).join('\n')
    : '• none';
  const suppressions = summary.suppressions24h.length
    ? summary.suppressions24h.map((item) => `• ${item.reason}: ${item.count}`).join('\n')
    : '• none';
  return [
    `📧 Email automation digest — last 24h`,
    `Sent: ${summary.health24h.sent} · Failed: ${summary.health24h.failed} · Pending gated: ${summary.pendingGatedCards} · Rescans completed: ${summary.rescansCompleted24h}`,
    ``,
    `Sends by template:`,
    sends,
    ``,
    `Suppressions:`,
    suppressions,
    ``,
    `Open Email Ops: https://vizbiz.ai/mission-control/email-ops`,
  ].join('\n');
}

export async function sendDailyEmailOpsDigest(leads: Pick<LeadRow, 'leadId' | 'dealershipName'>[] = [], now = new Date()): Promise<{ sent: boolean; text?: string | null }> {
  const summary = buildEmailOpsSummary(await fetchEmailOpsEvents(now), leads, now);
  const text = buildDailyAutomationDigestText(summary);
  if (!text) return { sent: false, text: null };
  await sendPipelineAlert(text);
  return { sent: true, text };
}
