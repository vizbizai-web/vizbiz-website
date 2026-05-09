/**
 * Telegram alert — notify Alex when a new lead comes in
 *
 * Sends two messages:
 * 1. Group topic 355 (Leads) — structured lead data
 * 2. Alex's DM — Vlad's conversational alert with next steps
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VLAD_HQ_GROUP = "-1003708779177";
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
  sheetsOk: boolean;
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
    lead.sheetsOk ? "✅ Captured in Sheets CRM" : "⚠️ Sheets not configured — lead NOT stored",
    "",
    `ID: ${lead.leadId || "N/A"}`,
  ].join("\n");

  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: VLAD_HQ_GROUP,
        message_thread_id: LEADS_TOPIC_ID,
        text: groupMessage,
      }),
    },
  );

  // -- 2. DM alert (Vlad talking to Alex with context and next steps) --
  const dmMessage = isWeak
    ? [
        `Alex. New lead just came in — this one needs help.`,
        "",
        `${lead.dealershipName} in ${lead.city}.`,
        `${emoji} They're barely showing up in AI search (${lead.appeared}). That's exactly our sweet spot — they can see the problem, and we can show them the fix.`,
        "",
        `Pipeline is running now. I'll have research ready for review in ~2 minutes.`,
        "",
        `What you should know:`,
        `• Contact: ${lead.contactName} (${lead.email})`,
        `• Website: ${lead.website}`,
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
