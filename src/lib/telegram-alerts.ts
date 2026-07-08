/**
 * Telegram alert — notify Alex when a new lead comes in
 *
 * Sends two messages:
 * 1. Group topic 355 (Leads) — structured lead data
 * 2. Alex's DM — operator alert with next steps
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VIZBIZ_HQ_GROUP = "-1003708779177";
const LEADS_TOPIC_ID = 355;
const ALEX_DM = "6960754854";

type LeadAlert = {
  leadId: string;
  dealershipName: string;
  contactName: string;
  email: string;
  city: string;
  website: string;
  appeared: string;
  band: string;
  dataStored: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  competitorMode?: string;
  competitors?: string;
  // Google Places enrichment
  googleProfileFound?: boolean;
  googleRating?: number | null;
  googleReviews?: number | null;
  googleWebsiteMatch?: boolean | null;
  localEntityTrustScore?: number | null;
};

export async function sendLeadAlertTelegram(lead: LeadAlert): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[telegram-alert] TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  const emoji = lead.band.toLowerCase().includes("strong")
    ? "🟢"
    : lead.band.toLowerCase().includes("moderate")
      ? "🟡"
      : "🔴";

  const isWeak = lead.band.toLowerCase().includes("weak") || lead.band.toLowerCase() === "pending";

  const competitorNote = lead.competitorMode === "client_provided"
    ? `🎯 Client named competitors: ${lead.competitors || "N/A"}`
    : `📍 No competitors named — client-only snapshot`;

  // -- 1. Group alert (structured, for the Leads topic) --
  const groupMessage = [
    `🎯 NEW LEAD — ${lead.dealershipName}`,
    "",
    `👤 ${lead.contactName} (${lead.email})`,
    `📍 ${lead.city}`,
    `🌐 ${lead.website}`,
    "",
    `${emoji} AI Visibility: ${lead.band}`,
    `📊 Appeared in: ${lead.appeared}`,
    "",
    competitorNote,
    "",
    lead.googleProfileFound !== undefined ? `🔍 Google profile: ${lead.googleProfileFound ? 'found' : 'not found'}` : null,
    lead.googleRating !== undefined && lead.googleRating !== null ? `⭐ Google rating: ${lead.googleRating}` : null,
    lead.googleReviews !== undefined && lead.googleReviews !== null ? `📝 Google reviews: ${lead.googleReviews}` : null,
    lead.googleWebsiteMatch !== undefined && lead.googleWebsiteMatch !== null ? `🔗 Website match: ${lead.googleWebsiteMatch ? 'yes' : 'no'}` : null,
    lead.localEntityTrustScore !== undefined && lead.localEntityTrustScore !== null ? `🏆 Local trust: ${lead.localEntityTrustScore}/100` : null,
    lead.googleProfileFound !== undefined ? "" : null,
    lead.dataStored ? "✅ Captured in Supabase CRM" : "⚠️ CRM storage failed — lead NOT stored",
    "",
    `ID: ${lead.leadId || "N/A"}`,
    lead.utmSource ? `🔗 Source: ${lead.utmSource}${lead.utmMedium ? ` / ${lead.utmMedium}` : ""}${lead.utmCampaign ? ` / ${lead.utmCampaign}` : ""}` : "",
    lead.referrer ? `↩️ Referrer: ${lead.referrer.substring(0, 80)}` : "",
  ].join("\n");

  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: VIZBIZ_HQ_GROUP,
        message_thread_id: LEADS_TOPIC_ID,
        text: groupMessage,
      }),
    },
  );

  // -- 2. DM alert (operator context and next steps) --
  // Sent ONLY when lead is confirmed in the CRM (dataStored=true)
  if (!lead.dataStored) {
    console.warn("[telegram-alert] Skipping DM alert — lead not stored in CRM", { dealership: lead.dealershipName });
    return;
  }

  const dmMessage = isWeak
    ? [
        `Alex. New lead just came in — this one needs help.`,
        "",
        `${lead.dealershipName} in ${lead.city}.`,
        `${emoji} They're barely showing up in AI search (${lead.appeared}). That's exactly our sweet spot — they can see the problem, and we can show them the fix.`,
        "",
        `Pipeline is running. I'll flag it when research is ready for review.`,
        "",
        `What you should know:`,
        `• Contact: ${lead.contactName} (${lead.email})`,
        `• Website: ${lead.website}`,
        `• ${competitorNote}`,
        `• Lead ID: ${lead.leadId}`,
        "",
        `Once research is done, I'll flag it for your review. If it looks good, we approve and I'll draft the outreach email. One approval from you and it goes.`,
      ].join("\n")
    : [
        `New lead: ${lead.dealershipName} in ${lead.city}.`,
        "",
        `${emoji} Interestingly, they're already showing up decently (${lead.appeared}). They might not feel the pain as acutely — but their competitors are probably closing in. That's actually a strong angle for outreach: "you're doing well, here's how to protect and extend that."`,
        "",
        `Research is running. I'll flag it when it's ready for review.`,
        "",
        `Contact: ${lead.contactName} (${lead.email})`,
        `Website: ${lead.website}`,
        `${competitorNote}`,
        `Lead ID: ${lead.leadId}`,
      ].join("\n");

  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ALEX_DM,
        text: dmMessage,
      }),
    },
  );

  console.info("[telegram-alert] lead alerts sent", { dealership: lead.dealershipName });
}

/**
 * Secondary alert — report is live and outreach email is ready
 *
 * Fires when the operator approves a lead and the report + email are ready to go.
 * Sent to Alex's DM only (the group already got the research-done alert).
 */
type ReportReadyAlert = {
  leadId: string;
  dealershipName: string;
  contactName: string;
  email: string;
  city: string;
  reportUrl: string;
  appearedCount: number;
  totalPrompts: number;
  statusBand: string;
};

export async function sendReportReadyTelegram(alert: ReportReadyAlert): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;

  const msg = [
    `✅ Report ready — ${alert.dealershipName}`,
    "",
    `Free report is live: ${alert.reportUrl}`,
    `Appeared: ${alert.appearedCount}/${alert.totalPrompts} prompts (${alert.statusBand})`,
    "",
    `Outreach email to ${alert.contactName} (${alert.email}) is drafted and waiting for your approval.`,
    "",
    `Say "send" and it goes. Or tweak it first — your call.`,
  ].join("\n");

  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ALEX_DM,
        text: msg,
      }),
    },
  );

  console.info("[telegram-alert] report-ready alert sent", { dealership: alert.dealershipName, leadId: alert.leadId });
}

type NicheResolutionAlert = {
  leadId: string;
  businessName: string;
  submitted: string;
  websiteCandidate: string;
  status: string;
  explanation?: string;
};

export async function sendNicheResolutionAlertTelegram(alert: NicheResolutionAlert): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[telegram-alert] TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  const msg = [
    `⚠️ Niche resolution blocked — ${alert.businessName}`,
    "",
    `Lead ID: ${alert.leadId}`,
    `Submitted: ${alert.submitted || "none"}`,
    `Website evidence: ${alert.websiteCandidate || "insufficient evidence"}`,
    `Status: ${alert.status}`,
    alert.explanation ? `Why: ${alert.explanation}` : null,
    "",
    `Choose a resolution before research continues.`,
  ].filter(Boolean).join("\n");

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ALEX_DM,
      text: msg,
      reply_markup: {
        inline_keyboard: [
          [{ text: "Use declared", callback_data: `niche_use_submitted_${alert.leadId}` }],
          [{ text: "Use website", callback_data: `niche_use_website_${alert.leadId}` }],
          [{ text: "Custom…", callback_data: `niche_custom_${alert.leadId}` }],
        ],
      },
    }),
  });

  console.info("[telegram-alert] niche-resolution alert sent", { leadId: alert.leadId, status: alert.status });
}

/**
 * Pipeline alert — sends to Alex's DM with pipeline stage updates
 */
export async function sendPipelineAlert(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[telegram-alert] TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ALEX_DM,
      text: message,
    }),
  });

  console.info("[telegram-alert] pipeline alert sent");
}

export async function sendGatedNeedsYouTelegramPing(card: {
  leadId: string;
  businessName: string;
  templateId: string;
  subject?: string;
  trigger?: string;
  mcUrl?: string;
}): Promise<{ ok: boolean; messageId?: number; channel: 'intake_topic' | 'alex_dm_fallback' } | null> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[telegram-alert] TELEGRAM_BOT_TOKEN not configured");
    return null;
  }
  const mcUrl = card.mcUrl || `https://vizbiz.ai/mission-control/leads/${encodeURIComponent(card.leadId)}`;
  const text = [
    `🟣 GATED email card needs approval — ${card.businessName}`,
    `Template: ${card.templateId}`,
    card.subject ? `Subject: ${card.subject}` : null,
    card.trigger ? `Trigger: ${card.trigger}` : null,
    `Open MC: ${mcUrl}`,
  ].filter(Boolean).join("\n");

  const send = (body: Record<string, unknown>) => fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let res = await send({
    chat_id: VIZBIZ_HQ_GROUP,
    message_thread_id: LEADS_TOPIC_ID,
    text,
    disable_web_page_preview: true,
  });
  let json = await res.json().catch(() => ({}));
  let channel: 'intake_topic' | 'alex_dm_fallback' = 'intake_topic';
  if (!res.ok || json?.ok === false) {
    console.warn("[telegram-alert] gated Needs-You intake topic ping failed; falling back to Alex DM", { status: res.status, description: json?.description });
    channel = 'alex_dm_fallback';
    res = await send({ chat_id: ALEX_DM, text: `${text}\n\nFallback: intake topic was unavailable to the bot.`, disable_web_page_preview: true });
    json = await res.json().catch(() => ({}));
  }
  if (!res.ok || json?.ok === false) throw new Error(`Telegram gated ping failed: ${res.status}`);

  console.info("[telegram-alert] gated Needs-You ping sent", { leadId: card.leadId, templateId: card.templateId, messageId: json?.result?.message_id, channel });
  return { ok: true, messageId: json?.result?.message_id, channel };
}

/**
 * Revenue alert — for CTA clicks, payments, abandoned checkouts
 */
export async function sendRevenueAlert(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[telegram-alert] TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  // Revenue topic in group + DM
  const REVENUE_TOPIC_ID = 5;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: VIZBIZ_HQ_GROUP,
      message_thread_id: REVENUE_TOPIC_ID,
      text: message,
    }),
  });

  // Also DM Alex
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ALEX_DM,
      text: message,
    }),
  });

  console.info("[telegram-alert] revenue alert sent");
}
