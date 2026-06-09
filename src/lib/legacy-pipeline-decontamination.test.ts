import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("legacy pipeline route decontamination", () => {
  it("keeps the old process-lead route as a wrapper, not a duplicate research engine", () => {
    const source = readFileSync("src/app/api/process-lead/route.ts", "utf8");

    expect(source).toContain("archivedLegacyRoute");
    expect(source).toContain("runAllStages");
    expect(source).not.toContain("discoverCompetitors");
    expect(source).not.toContain("detectNiche");
    expect(source).not.toContain("auto-discovered");
    expect(source).not.toContain("car_dealership");
  });

  it("disables legacy direct delivery so report emails must pass CTA verification", () => {
    const source = readFileSync("src/app/api/pipeline/deliver/route.ts", "utf8");

    expect(source).toContain("archivedLegacyRoute");
    expect(source).toContain("status: 410");
    expect(source).toContain("/api/send-report-email");
    expect(source).not.toContain("buildSnapshotEmailHtml");
    expect(source).not.toContain("sendVizBizEmail");
  });

  it("does not trigger the archived process-lead path from operator reruns", () => {
    const source = readFileSync("src/app/api/operator-review/route.ts", "utf8");

    expect(source).toContain("/api/pipeline/process");
    expect(source).not.toContain("/api/process-lead");
  });

  it("blocks direct research calls from using the legacy finite niche detector without preflight", () => {
    const source = readFileSync("src/lib/research-runner.ts", "utf8");

    expect(source).toContain("preflightScan");
    expect(source).toContain("No PreFlight profile supplied; running evidence-first preflight");
    expect(source).not.toContain("detectNiche(");
    expect(source).not.toContain("finalNiche = websiteInsight.niche");
  });
});
