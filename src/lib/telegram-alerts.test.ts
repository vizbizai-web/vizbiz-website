import { describe, expect, it, vi } from "vitest";
import {
  attributionFromRawIntake,
  buildCtaClickAlert,
  buildFreeIntakeAlert,
  buildPaidFulfillmentTaskDescription,
  buildPaidFulfillmentTaskTitle,
  buildPurchaseCompletedAlert,
  getTelegramAlertConfig,
  sendTelegramAlert,
} from "./telegram-alerts";

describe("telegram alerts", () => {
  it("builds a buyer-safe free-intake alert without inventing competitors", () => {
    const text = buildFreeIntakeAlert({
      client: {
        businessName: "Lakeshore Family Dentistry",
        email: "owner@example.com",
        websiteUrl: "https://lakeshore.example",
        location: "Oakville",
        niche: "dentist",
      },
      competitorSource: "none",
      competitors: [],
      attribution: attributionFromRawIntake({
        attribution: {
          utm_source: "google",
          utm_campaign: "free-audit",
          referrer: "https://example.com/article",
          landingPage: "/?utm_source=google",
        },
      }),
      supabaseLeadId: "lead_123",
    });

    expect(text).toContain("New VizBiz free intake");
    expect(text).toContain("Lakeshore Family Dentistry");
    expect(text).toContain("client-only, no competitors supplied");
    expect(text).toContain("None supplied — client-only snapshot");
    expect(text).toContain("utm_source=google");
    expect(text).toContain("Supabase lead: lead_123");
  });

  it("builds CTA and purchase alerts with product-specific labels", () => {
    const cta = buildCtaClickAlert({
      client: { businessName: "Lakeshore Family Dentistry", email: "owner@example.com", reportUrl: "https://vizbiz.ai/mini-report/lakeshore" },
      product: "fix_package",
      destinationUrl: "https://buy.stripe.com/fix?client_reference_id=lakeshore%3Afix_package",
      slug: "lakeshore",
    });
    const purchase = buildPurchaseCompletedAlert({
      client: { businessName: "Lakeshore Family Dentistry", email: "owner@example.com" },
      product: "monthly_plan",
      amountCents: 18800,
      currency: "usd",
      stripeCheckoutSessionId: "cs_test_123",
      fulfillmentTaskId: "task_123",
      slug: "lakeshore",
    });

    expect(cta).toContain("$88 One-Time Full Report + Fix");
    expect(cta).toContain("buyer intent");
    expect(purchase).toContain("purchase completed");
    expect(purchase).toContain("$188.00");
    expect(purchase).toContain("Fulfillment task: task_123");
  });

  it("builds paid fulfillment task text for Mission Control/Supabase", () => {
    expect(buildPaidFulfillmentTaskTitle({ product: "fix_package", businessName: "Lakeshore Family Dentistry" }))
      .toBe("$88 One-Time Full Report + Fix fulfillment — Lakeshore Family Dentistry");
    expect(buildPaidFulfillmentTaskDescription({
      client: { businessName: "Lakeshore Family Dentistry", email: "owner@example.com", websiteUrl: "https://lakeshore.example" },
      product: "fix_package",
      amountCents: 8800,
      currency: "usd",
      stripeCheckoutSessionId: "cs_test_123",
      slug: "lakeshore",
    })).toContain("Buyer-safe next steps");
  });

  it("skips send when Telegram config is missing", async () => {
    await expect(sendTelegramAlert({ type: "free_intake", text: "hello", config: {} })).resolves.toMatchObject({ status: "skipped" });
  });

  it("posts to Telegram with configured thread when env is present", async () => {
    let requestInit: RequestInit | undefined;
    const fetchFn = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      requestInit = init;
      return new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200 });
    });
    const result = await sendTelegramAlert({
      type: "cta_clicked",
      text: "hello",
      config: { botToken: "token", chatId: "123", threadId: "456", fetchFn: fetchFn as unknown as typeof fetch },
    });

    expect(result).toMatchObject({ status: "sent", messageId: "42", chatId: "123", threadId: "456" });
    expect(fetchFn).toHaveBeenCalledWith("https://api.telegram.org/bottoken/sendMessage", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse(requestInit?.body as string);
    expect(body).toMatchObject({ chat_id: "123", message_thread_id: "456", text: "hello" });
  });

  it("reads Telegram config from either generic or VizBiz-specific env vars", () => {
    expect(getTelegramAlertConfig({ VIZBIZ_TELEGRAM_BOT_TOKEN: "token", VIZBIZ_TELEGRAM_CHAT_ID: "chat", VIZBIZ_TELEGRAM_THREAD_ID: "thread" })).toEqual({
      botToken: "token",
      chatId: "chat",
      threadId: "thread",
    });
  });
});
