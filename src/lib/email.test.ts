import { describe, expect, it } from "vitest";
import { buildMiniReportEmailHtml, sendMiniReportEmail } from "./email";

describe("mini report email", () => {
  const email = {
    subject: "Oakville Family Dental: your AI Visibility Score is ready",
    previewText: "Your site scored 42/100.",
    openingLine: "We checked buyer questions in Oakville.",
    bullets: ["AI Visibility Score: 42/100", "Competitor benchmark rank: #2"],
    ctaLabel: "View My Free AI Visibility Report",
  };

  it("renders a CTA email with mini-report details", () => {
    const html = buildMiniReportEmailHtml({ email, reportUrl: "https://vizbiz.ai/mini-report/abc" });

    expect(html).toContain("Oakville Family Dental: your AI Visibility Score is ready");
    expect(html).toContain("Search is changing. Build your AI reputation early.");
    expect(html).toContain("popular AI assistants and AI-powered search tools");
    expect(html).toContain("AI Visibility Score: 42/100");
    expect(html).toContain("https://vizbiz.ai/mini-report/abc");
  });

  it("dry-runs when no transactional email provider is configured", async () => {
    const result = await sendMiniReportEmail({
      to: "owner@example.com",
      email,
      reportUrl: "https://vizbiz.ai/mini-report/abc",
      apiKey: undefined,
    });

    expect(result.status).toBe("dry_run");
  });
});
