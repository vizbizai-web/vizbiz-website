/**
 * Telegram alert — notify Alex when a new lead comes in
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALEX_CHAT_ID = "6960754854";

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

  const message = [
    `🎯 **NEW LEAD** — ${lead.dealershipName}`,
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

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ALEX_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Telegram alert failed: ${response.status} ${text}`);
  }

  console.info("[telegram-alert] lead alert sent", { dealership: lead.dealershipName });
}
