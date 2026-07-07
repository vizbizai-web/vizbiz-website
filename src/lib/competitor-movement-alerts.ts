import type { SnapshotDiff } from './snapshot-diff';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALEX_DM = '6960754854';

export type CompetitorMovementAlert = {
  leadId: string;
  businessName: string;
  clientEmail?: string;
  triggers: string[];
  proposedSubject: string;
  proposedBody: string;
};

export function buildCompetitorMovementAlert(input: { leadId: string; businessName: string; clientEmail?: string; diff: SnapshotDiff }): CompetitorMovementAlert | null {
  const triggers: string[] = [];
  for (const movement of input.diff.promptMovements.lost.slice(0, 5)) {
    triggers.push(`You stopped appearing for: ${movement.prompt}`);
  }
  for (const movement of input.diff.competitorMovements.gained.slice(0, 5)) {
    triggers.push(`${movement.competitor} started appearing for: ${movement.prompt}`);
  }
  const crossing = input.diff.competitorMovements.shareOfVoice.find((item) => item.current > 0 && item.delta > 0.1);
  if (crossing) triggers.push(`${crossing.name} gained share of voice this month (${Math.round(crossing.previous * 100)}% → ${Math.round(crossing.current * 100)}%).`);
  if (!triggers.length) return null;
  const namedCompetitor = input.diff.competitorMovements.gained[0]?.competitor || crossing?.name || 'A competitor';
  const proposedSubject = `${namedCompetitor} started appearing where you don't — ${input.businessName} monthly AI visibility alert`;
  const proposedBody = [
    `Hi,`,
    ``,
    `This month's AI visibility re-scan found competitor movement worth reviewing for ${input.businessName}.`,
    ``,
    ...triggers.map((trigger) => `• ${trigger}`),
    ``,
    `We are reviewing the exact prompt evidence and will fold the highest-value fix into this month's VizBiz recommendations.`,
  ].join('\n');
  return { leadId: input.leadId, businessName: input.businessName, clientEmail: input.clientEmail, triggers, proposedSubject, proposedBody };
}

export async function sendCompetitorMovementApprovalTelegram(alert: CompetitorMovementAlert): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[competitor-alert] TELEGRAM_BOT_TOKEN not configured');
    return;
  }
  const text = [
    `⚠️ Competitor movement alert proposed — ${alert.businessName}`,
    ``,
    `Lead ID: ${alert.leadId}`,
    alert.clientEmail ? `Client: ${alert.clientEmail}` : null,
    ``,
    `Triggers:`,
    ...alert.triggers.map((trigger) => `• ${trigger}`),
    ``,
    `Subject: ${alert.proposedSubject}`,
    ``,
    `CLIENT EMAIL BODY:`,
    alert.proposedBody,
  ].filter(Boolean).join('\n');
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ALEX_DM,
      text,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Approve alert', callback_data: `move_alert_approve_${alert.leadId}` }],
          [{ text: 'Skip this month', callback_data: `move_alert_skip_${alert.leadId}` }],
        ],
      },
    }),
  });
}
