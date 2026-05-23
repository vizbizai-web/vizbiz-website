import type { PaidProduct } from "./lead-pipeline";
import type { CompetitorSource } from "./mini-audit-intake";

export type TelegramAlertType = "free_intake" | "cta_clicked" | "purchase_completed" | "paid_fulfillment_task";
export type TelegramAlertStatus = "sent" | "failed" | "skipped";

export interface TelegramAlertResult {
  status: TelegramAlertStatus;
  messageId?: string;
  chatId?: string;
  threadId?: string;
  error?: string;
}

export interface TelegramAlertConfig {
  botToken?: string;
  chatId?: string;
  threadId?: string;
  fetchFn?: typeof fetch;
}

export interface AlertClientSummary {
  businessName?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  niche?: string | null;
  reportUrl?: string | null;
}

export interface AttributionSummary {
  source?: string | null;
  landingPage?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export function getTelegramAlertConfig(env: NodeJS.ProcessEnv = process.env): TelegramAlertConfig {
  return {
    botToken: env.TELEGRAM_BOT_TOKEN ?? env.VIZBIZ_TELEGRAM_BOT_TOKEN,
    chatId: env.TELEGRAM_CHAT_ID ?? env.VIZBIZ_TELEGRAM_CHAT_ID,
    threadId: env.TELEGRAM_LEADS_THREAD_ID ?? env.VIZBIZ_TELEGRAM_THREAD_ID ?? env.TELEGRAM_THREAD_ID,
  };
}

export async function sendTelegramAlert(input: {
  type: TelegramAlertType;
  text: string;
  config?: TelegramAlertConfig;
}): Promise<TelegramAlertResult> {
  const config = input.config ?? getTelegramAlertConfig();
  if (!config.botToken || !config.chatId) {
    return { status: "skipped", error: "Telegram alert config missing" };
  }

  try {
    const response = await (config.fetchFn ?? fetch)(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        ...(config.threadId ? { message_thread_id: config.threadId } : {}),
        text: input.text.slice(0, 3900),
        disable_web_page_preview: false,
      }),
    });

    const payload = await response.json().catch(() => null) as { ok?: boolean; result?: { message_id?: number | string }; description?: string } | null;
    if (!response.ok || payload?.ok === false) {
      return {
        status: "failed",
        chatId: config.chatId,
        threadId: config.threadId,
        error: payload?.description ?? `Telegram returned ${response.status}`,
      };
    }

    return {
      status: "sent",
      chatId: config.chatId,
      threadId: config.threadId,
      messageId: payload?.result?.message_id ? String(payload.result.message_id) : undefined,
    };
  } catch (error) {
    return {
      status: "failed",
      chatId: config.chatId,
      threadId: config.threadId,
      error: error instanceof Error ? error.message : "Telegram send failed",
    };
  }
}

export function buildFreeIntakeAlert(input: {
  client: AlertClientSummary;
  competitorSource: CompetitorSource;
  competitors?: Array<{ name?: string; websiteUrl?: string }>;
  attribution?: AttributionSummary;
  supabaseLeadId?: string | null;
}) {
  const competitors = input.competitors?.map((competitor) => competitor.name).filter(Boolean).join("; ") || "None supplied — client-only snapshot";
  return [
    "🚨 New VizBiz free intake",
    `Business: ${value(input.client.businessName)}`,
    `Email: ${value(input.client.email)}`,
    `Website: ${value(input.client.websiteUrl)}`,
    `Location: ${value(input.client.location)}`,
    `Niche: ${value(input.client.niche)}`,
    `Competitor mode: ${describeCompetitorSource(input.competitorSource)}`,
    `Competitors: ${competitors}`,
    attributionLine(input.attribution),
    input.supabaseLeadId ? `Supabase lead: ${input.supabaseLeadId}` : null,
    "Next: watch for report generation, then follow up if this looks like a qualified local business.",
  ].filter(Boolean).join("\n");
}

export function buildCtaClickAlert(input: {
  client: AlertClientSummary;
  product: PaidProduct;
  destinationUrl: string;
  slug: string;
}) {
  return [
    "👀 VizBiz paid CTA clicked",
    `Business: ${value(input.client.businessName)}`,
    `Email: ${value(input.client.email)}`,
    `Product: ${productLabel(input.product)}`,
    `Report: ${value(input.client.reportUrl ?? `/mini-report/${input.slug}`)}`,
    `Destination: ${input.destinationUrl}`,
    "Next: this prospect showed buyer intent. If payment does not arrive, consider manual follow-up.",
  ].join("\n");
}

export function buildPurchaseCompletedAlert(input: {
  client: AlertClientSummary;
  product: PaidProduct;
  amountCents: number;
  currency: string;
  stripeCheckoutSessionId?: string | null;
  fulfillmentTaskId?: string | null;
  slug?: string | null;
}) {
  return [
    "💰 VizBiz purchase completed — action required",
    `Product: ${productLabel(input.product)}`,
    `Amount: ${formatMoney(input.amountCents, input.currency)}`,
    `Business: ${value(input.client.businessName)}`,
    `Email: ${value(input.client.email)}`,
    input.slug ? `Report: ${input.client.reportUrl ?? `/mini-report/${input.slug}`}` : null,
    input.stripeCheckoutSessionId ? `Stripe session: ${input.stripeCheckoutSessionId}` : null,
    input.fulfillmentTaskId ? `Fulfillment task: ${input.fulfillmentTaskId}` : "Fulfillment task: create/check manually if missing",
    "Next: confirm the paid intake path and queue the full report/fix work so the buyer is not missed.",
  ].filter(Boolean).join("\n");
}

export function buildPaidFulfillmentTaskTitle(input: { product: PaidProduct; businessName?: string | null }) {
  return `${productLabel(input.product)} fulfillment — ${value(input.businessName, "Unknown business")}`;
}

export function buildPaidFulfillmentTaskDescription(input: {
  client: AlertClientSummary;
  product: PaidProduct;
  amountCents: number;
  currency: string;
  stripeCheckoutSessionId?: string | null;
  slug?: string | null;
}) {
  return [
    `Paid product: ${productLabel(input.product)}`,
    `Amount: ${formatMoney(input.amountCents, input.currency)}`,
    `Business: ${value(input.client.businessName)}`,
    `Email: ${value(input.client.email)}`,
    `Website: ${value(input.client.websiteUrl)}`,
    input.slug ? `Mini report: ${input.client.reportUrl ?? `/mini-report/${input.slug}`}` : null,
    input.stripeCheckoutSessionId ? `Stripe session: ${input.stripeCheckoutSessionId}` : null,
    "Buyer-safe next steps: verify paid intake completion, confirm competitors if needed, queue full audit/fix package, and send manual confirmation if email automation is unavailable.",
  ].filter(Boolean).join("\n");
}

export function attributionFromRawIntake(rawIntake?: Record<string, unknown> | null): AttributionSummary {
  const attribution = rawIntake?.attribution && typeof rawIntake.attribution === "object" ? rawIntake.attribution as Record<string, unknown> : {};
  return {
    source: stringValue(rawIntake?.source) ?? stringValue(attribution.source),
    landingPage: stringValue(attribution.landingPage) ?? stringValue(attribution.landing_page),
    referrer: stringValue(attribution.referrer),
    utmSource: stringValue(attribution.utm_source),
    utmMedium: stringValue(attribution.utm_medium),
    utmCampaign: stringValue(attribution.utm_campaign),
  };
}

function attributionLine(attribution?: AttributionSummary) {
  const parts = [
    attribution?.source ? `source=${attribution.source}` : null,
    attribution?.utmSource ? `utm_source=${attribution.utmSource}` : null,
    attribution?.utmMedium ? `utm_medium=${attribution.utmMedium}` : null,
    attribution?.utmCampaign ? `utm_campaign=${attribution.utmCampaign}` : null,
    attribution?.referrer ? `referrer=${attribution.referrer}` : null,
    attribution?.landingPage ? `landing=${attribution.landingPage}` : null,
  ].filter(Boolean);
  return `Attribution: ${parts.length ? parts.join(" | ") : "none captured"}`;
}

function productLabel(product: PaidProduct) {
  return product === "monthly_plan" ? "$188 Monthly Full Report Growth Plan" : "$88 One-Time Full Report + Fix";
}

function describeCompetitorSource(source: CompetitorSource) {
  if (source === "user_supplied") return "client supplied competitors";
  if (source === "auto_discovered") return "internal auto-discovery only";
  if (source === "mixed") return "mixed / needs operator review";
  return "client-only, no competitors supplied";
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amountCents / 100);
}

function value(valueToFormat: unknown, fallback = "Not provided") {
  return typeof valueToFormat === "string" && valueToFormat.trim() ? valueToFormat.trim() : fallback;
}

function stringValue(valueToFormat: unknown) {
  return typeof valueToFormat === "string" && valueToFormat.trim() ? valueToFormat.trim() : null;
}
