import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead } from "@/lib/google-sheets";
import { buildNicheCallbackResolution } from "@/lib/telegram-niche-callback";
import { sendPipelineAlert } from "@/lib/telegram-alerts";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

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
    const update = await request.json();
    const callback = update?.callback_query;
    const callbackId = String(callback?.id || "");
    const callbackData = String(callback?.data || "");
    const messageText = String(callback?.message?.text || "");
    const chatId = callback?.message?.chat?.id;
    const messageId = callback?.message?.message_id;

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
