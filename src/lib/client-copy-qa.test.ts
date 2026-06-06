import { describe, expect, it } from "vitest";
import { assertClientSafeCopy, clientSafeCompetitorContext, runClientCopyQA } from "./client-copy-qa";
import { buildSnapshotEmailHtml } from "./snapshot-email";

describe("client-copy QA guard", () => {
  it("blocks internal competitor workflow talk before any client-facing send", () => {
    const result = runClientCopyQA(
      "Comparison readiness: The client named BridgeLegal and Broughton Partners. That means the paid report should compare LexHive against those exact two, not random auto-discovered competitors."
    );

    expect(result.ok).toBe(false);
    expect(result.blockedTerms).toEqual(
      expect.arrayContaining([
        "internal client framing",
        "paid-report workflow language",
        "auto-discovery internal language",
      ])
    );
  });

  it("allows polished client-facing competitor context", () => {
    const copy = clientSafeCompetitorContext(["BridgeLegal", "Broughton Partners"], "LexHive");

    expect(copy).toBe(
      "LexHive should be positioned clearly against BridgeLegal and Broughton Partners so AI systems can understand where it fits, what makes it credible, and when it should be recommended."
    );
    expect(() => assertClientSafeCopy(copy)).not.toThrow();
  });

  it("fails generated email HTML if internal language leaks into visible copy", () => {
    const html = buildSnapshotEmailHtml({
      dealershipName: "LexHive",
      contactName: "Alex",
      city: "Toronto",
      snapshotDate: "June 6, 2026",
      appearedIn: "2 of 5 prompts",
      overallVisibility: "42",
      serviceDeptVisibility: "Moderate",
      competitorName: "auto-discovered competitors (internal only)",
      competitorCategories: "pipeline notes",
      bookingUrl: "https://vizbiz.ai/book-call/",
    });

    expect(() => assertClientSafeCopy(html, "snapshot email")).toThrow(/client-copy QA/);
  });
});
