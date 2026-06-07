import { describe, expect, it } from "vitest";
import { assertRenderedReportPageSafe, verifyReportCta } from "./report-cta-verifier";

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: { "content-type": "text/html" } });
}

describe("report CTA verifier", () => {
  it("rejects stale/free-test CTA paths before fetch", async () => {
    await expect(
      verifyReportCta("https://vizbiz.ai/free-ai-visibility-test/", {
        fetchImpl: async () => htmlResponse("should not fetch"),
      })
    ).rejects.toThrow(/stale free AI visibility test/i);
  });

  it("rejects report routes that render Report Not Found", async () => {
    await expect(
      verifyReportCta("https://vizbiz.ai/report/qa-lexhive-email-test/full", {
        fetchImpl: async () => htmlResponse("<h1>Report Not Found</h1><a>Back to Home</a>"),
      })
    ).rejects.toThrow(/report not found page|back home fallback/i);
  });

  it("rejects non-200 report routes", async () => {
    await expect(
      verifyReportCta("https://vizbiz.ai/report/missing/full", {
        fetchImpl: async () => htmlResponse("not found", 404),
      })
    ).rejects.toThrow(/HTTP 404/i);
  });

  it("rejects rendered report pages with internal workflow language", () => {
    expect(() =>
      assertRenderedReportPageSafe("Comparison readiness: auto-discovered competitors (internal only)")
    ).toThrow(/internal auto-discovery wording|internal-only wording/i);
  });

  it("accepts a rendered report page with client-safe report content", async () => {
    await expect(
      verifyReportCta("/report/venue-experts/", {
        fetchImpl: async () => htmlResponse("<h1>Venue Experts visibility report</h1><p>AI visibility snapshot ready.</p>"),
      })
    ).resolves.toMatchObject({ ok: true, url: "https://vizbiz.ai/report/venue-experts/", status: 200 });
  });
});
