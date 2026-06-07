import { describe, expect, it } from "vitest";
import { assertValidReportEmailCta, buildReportEmailHtml, buildReportEmailSubject } from "./report-email";
import { runClientCopyQA } from "./client-copy-qa";

describe("report email", () => {
  it("rejects the stale public free-test page as a report email CTA", () => {
    expect(() => assertValidReportEmailCta("https://vizbiz.ai/free-ai-visibility-test/")).toThrow(/must not point/);
  });

  it("accepts private report CTAs", () => {
    expect(assertValidReportEmailCta("/report/lead-123?preview=1")).toBe("https://vizbiz.ai/report/lead-123?preview=1");
  });

  it("builds premium client-safe copy for a non-dealership report", () => {
    const html = buildReportEmailHtml({
      businessName: "LexHive",
      contactName: "Alex",
      city: "Toronto",
      reportUrl: "https://vizbiz.ai/report/lexhive?preview=1",
      aviScore: 42,
      statusBand: "Moderate",
      appearedCount: 2,
      totalPrompts: 5,
      competitors: ["BridgeLegal", "Broughton Partners"],
      nicheLabel: "legal referral and case-growth",
    });

    expect(buildReportEmailSubject({ businessName: "LexHive", reportUrl: "/report/lexhive" })).toBe(
      "LexHive AI visibility snapshot is ready"
    );
    expect(html).toContain("BridgeLegal and Broughton Partners");
    expect(html).toContain("View the private AI visibility snapshot");
    expect(html).not.toMatch(/dealership|Does ChatGPT|AI-driven buyers|60 seconds|free-ai-visibility-test/i);
    expect(runClientCopyQA(html).ok).toBe(true);
  });

  it("does not invent a contact name, city, or niche when those facts are not supplied", () => {
    const html = buildReportEmailHtml({
      businessName: "LexHive",
      reportUrl: "https://vizbiz.ai/report/lexhive?preview=1",
      aviScore: 42,
      statusBand: "Moderate",
      appearedCount: 2,
      totalPrompts: 5,
      competitors: ["BridgeLegal", "Broughton Partners"],
    });

    expect(html).toContain("Hi there,");
    expect(html).toContain("when customers compare options in their market");
    expect(html).not.toMatch(/Hi Alex|Toronto|legal marketing|legal referral|your market/i);
    expect(runClientCopyQA(html).ok).toBe(true);
  });
});
