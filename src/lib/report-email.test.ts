import { describe, expect, it } from "vitest";
import { assertValidReportEmailCta, buildReportEmailHtml, buildReportEmailSubject } from "./report-email";
import { runClientCopyQA } from "./client-copy-qa";

describe("report email", () => {
  it("rejects the stale public free-test page as a report email CTA", () => {
    expect(() => assertValidReportEmailCta("https://vizbiz.ai/free-ai-visibility-test/")).toThrow(/must not point/);
  });

  it("accepts private report CTAs even when site URL env has a literal escaped newline", () => {
    const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://vizbiz.ai\\n";
    try {
      expect(assertValidReportEmailCta("/report/lead-123?preview=1")).toBe("https://vizbiz.ai/report/lead-123?preview=1");
    } finally {
      if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    }
  });

  it("builds premium client-safe copy for a non-dealership report", () => {
    const html = buildReportEmailHtml({
      businessName: "LexHive",
      contactName: "Alex",
      city: "Toronto",
      primaryMarket: "Greater Toronto Area",
      reportUrl: "https://vizbiz.ai/report/lexhive?preview=1",
      aviScore: 42,
      statusBand: "Moderate",
      appearedCount: 2,
      totalPrompts: 5,
      competitors: ["BridgeLegal", "Broughton Partners"],
      nicheLabel: "legal referral and case-growth",
    });

    expect(buildReportEmailSubject({ businessName: "LexHive", reportUrl: "/report/lexhive" })).toBe(
      "LexHive: your AI visibility snapshot is ready"
    );
    expect(html).toContain("BridgeLegal and Broughton Partners");
    expect(html).toContain("legal referral and case-growth options in Greater Toronto Area");
    expect(html).toContain("Open the free snapshot");
    expect(html).toContain("Snapshot visibility score");
    expect(html).toContain("Free limited test");
    expect(html).toContain("The full report verifies the score");
    expect(html).toContain("AI-readable website data");
    expect(html).toContain("Appeared in 2 of 5 AI recommendation checks");
    expect(html).not.toMatch(/dealership|Does ChatGPT|AI-driven buyers|60 seconds|free-ai-visibility-test/i);
    expect(runClientCopyQA(html).ok).toBe(true);
  });

  it("labels paid report score as verified instead of a free snapshot", () => {
    const html = buildReportEmailHtml({
      businessName: "Mop Wringers",
      contactName: "Mop Wringers",
      primaryMarket: "Rockwall County",
      reportUrl: "https://vizbiz.ai/report/mop/full?preview=1",
      aviScore: 40,
      statusBand: "Moderate",
      appearedCount: 8,
      totalPrompts: 20,
      nicheLabel: "commercial cleaning",
      isPaid: true,
    });

    expect(html).toContain("Verified visibility score");
    expect(html).toContain("Full-report benchmark");
    expect(html).toContain("Open the verified AI visibility report");
    expect(html).not.toMatch(/Hi Mop Wringers|Hi there/i);
    expect(runClientCopyQA(html).ok).toBe(true);
  });

  it("does not invent a contact name, city, or niche when those facts are not supplied", () => {
    const html = buildReportEmailHtml({
      businessName: "LexHive",
      contactName: "LexHive",
      reportUrl: "https://vizbiz.ai/report/lexhive?preview=1",
      aviScore: 42,
      statusBand: "Moderate",
      appearedCount: 2,
      totalPrompts: 5,
      competitors: ["BridgeLegal", "Broughton Partners"],
    });

    expect(html).not.toMatch(/Hi LexHive|Hi there|Hi Alex|Toronto|legal marketing|legal referral|your market/i);
    expect(runClientCopyQA(html).ok).toBe(true);
  });
});
