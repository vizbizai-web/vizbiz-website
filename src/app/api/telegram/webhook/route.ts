import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead } from "@/lib/google-sheets";
import { buildNicheCallbackResolution } from "@/lib/telegram-niche-callback";
import { sendPipelineAlert } from "@/lib/telegram-alerts";
import { sendVizBizEmail } from "@/lib/resend-mailer";
import { recordActionAudit } from "@/lib/mission-control-api-auth";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

function isAuthorizedTelegramWebhook(request: Request): boolean {
  if (!TELEGRAM_WEBHOOK_SECRET) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === TELEGRAM_WEBHOOK_SECRET;
}

async function answerCallback(callbackQueryId: string, text: string, showAlert = false): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: showAlert }),
  }).catch((error) => console.warn("[telegram-webhook] answerCallbackQuery failed", error));
}

async function editCallbackMessage(chatId: number | string, messageId: number, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } }),
  }).catch((error) => console.warn("[telegram-webhook] editMessageText failed", error));
}

export async function POST(request: Request) {
  try {
    if (!isAuthorizedTelegramWebhook(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized Telegram webhook" }, { status: 401 });
    }

    const update = await request.json();
    const callback = update?.callback_query;
    const callbackId = String(callback?.id || "");
    const callbackData = String(callback?.data || "");
    const messageText = String(callback?.message?.text || "");
    const chatId = callback?.message?.chat?.id;
    const messageId = callback?.message?.message_id;

    if (callbackData.startsWith("move_alert_")) {
      const match = callbackData.match(/^move_alert_(approve|skip)_(.+)$/);
      const action = match?.[1];
      const leadId = match?.[2];
      if (!action || !leadId) {
        if (callbackId) await answerCallback(callbackId, "Invalid movement-alert action.", true);
        return NextResponse.json({ ok: false, error: "Invalid movement-alert action" }, { status: 400 });
      }
      const lead = await getLeadByLeadId(leadId);
      if (!lead) {
        if (callbackId) await answerCallback(callbackId, `Lead not found: ${leadId}`, true);
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }
      if (action === "skip") {
        await updateLead(leadId, { notes: `${lead.notes || ""}\n[COMPETITOR_MOVEMENT_ALERT_SKIPPED ${new Date().toISOString()}]` });
        await recordActionAudit({ leadId, action: "competitor_movement_alert_skip", channel: "telegram" });
        if (callbackId) await answerCallback(callbackId, "Skipped this month.");
        if (chatId && messageId) await editCallbackMessage(chatId, messageId, `${messageText}\n\n⏭️ Skipped this month's competitor movement alert.`);
        return NextResponse.json({ ok: true, action, leadId });
      }
      if (!lead.email) {
        if (callbackId) await answerCallback(callbackId, "Lead has no email; alert not sent.", true);
        return NextResponse.json({ ok: false, error: "Lead has no email" }, { status: 400 });
      }
      const subjectMatch = messageText.match(/^Subject:\s*(.+)$/m);
      const subject = subjectMatch?.[1]?.trim() || `${lead.dealershipName}: monthly AI visibility alert`;
      const bodyMatch = messageText.match(/CLIENT EMAIL BODY:\s*\n([\s\S]*)$/);
      const clientBody = (bodyMatch?.[1] || '').replace(/\n\n(?:✅|⏭️).*[\s\S]*$/m, '').trim();
      if (!clientBody) {
        if (callbackId) await answerCallback(callbackId, "Client email body missing; alert not sent.", true);
        return NextResponse.json({ ok: false, error: "Client email body missing" }, { status: 400 });
      }
      const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;white-space:pre-wrap">${clientBody.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c))}</div>`;
      await sendVizBizEmail({ to: lead.email, subject, html });
      await updateLead(leadId, { notes: `${lead.notes || ""}\n[COMPETITOR_MOVEMENT_ALERT_APPROVED_SENT ${new Date().toISOString()} subject=${subject}]` });
      await recordActionAudit({ leadId, action: "competitor_movement_alert_approve_send", channel: "telegram", metadata: { subject } });
      if (callbackId) await answerCallback(callbackId, "Competitor movement alert sent.");
      if (chatId && messageId) await editCallbackMessage(chatId, messageId, `${messageText}\n\n✅ Approved and sent to ${lead.email}.`);
      return NextResponse.json({ ok: true, action, leadId, sent: true });
    }

    if (!callbackData.startsWith("niche_")) {
      if (callbackId) await answerCallback(callbackId, "Unsupported VizBiz action.", true);
      return NextResponse.json({ ok: true, ignored: true });
    }

    const resolution = buildNicheCallbackResolution(callbackData, messageText);
    const lead = await getLeadByLeadId(resolution.leadId);
    if (!lead) {
      if (callbackId) await answerCallback(callbackId, `Lead not found: ${resolution.leadId}`, true);
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    if (resolution.action === "custom") {
      await updateLead(resolution.leadId, {
        status: "needs_revision",
        researchStatus: "pending",
        notes: `${lead.notes || ""}\n${resolution.noteLine}`,
      });
      if (callbackId) await answerCallback(callbackId, "Custom niche needed. Open Mission Control.", true);
      if (chatId && messageId) {
        await editCallbackMessage(chatId, messageId, `${messageText}\n\n⏸️ Custom niche requested. Lead is held for Mission Control edit.`);
      }
      return NextResponse.json({ ok: true, action: resolution.action, leadId: resolution.leadId });
    }

    await updateLead(resolution.leadId, {
      status: "new",
      researchStatus: "pending",
      notes: `${lead.notes || ""}\n${resolution.noteLine}`,
    });

    const origin = new URL(request.url).origin;
    const rerun = await fetch(`${origin}/api/pipeline/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: resolution.leadId, force: true, researchMode: "free", revisionReason: resolution.rerunReason }),
    }).then((res) => res.json().catch(() => ({ success: res.ok, status: res.status })));

    if (callbackId) await answerCallback(callbackId, `Resolved as ${resolution.selectedNiche}. Rerun started.`);
    if (chatId && messageId) {
      await editCallbackMessage(chatId, messageId, `${messageText}\n\n✅ Resolved via Telegram: ${resolution.selectedNiche}\nRerun started.`);
    }
    await sendPipelineAlert([
      `✅ Niche resolution applied — ${lead.dealershipName || "Unknown business"}`,
      "",
      `Lead ID: ${resolution.leadId}`,
      `Selected niche: ${resolution.selectedNiche}`,
      `Action: ${resolution.action}`,
      `Rerun: ${JSON.stringify(rerun).slice(0, 300)}`,
    ].join("\n"));

    return NextResponse.json({ ok: true, action: resolution.action, leadId: resolution.leadId, selectedNiche: resolution.selectedNiche, rerun });
  } catch (error) {
    console.error("[telegram-webhook] callback handling failed", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown Telegram webhook error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "telegram-webhook" });
}
