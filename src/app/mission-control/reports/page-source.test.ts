import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("mission control reports page source", () => {
  const source = readFileSync(path.join(__dirname, "page.tsx"), "utf8");

  it("renders the real report queue instead of the placeholder grid", () => {
    expect(source).toContain("listReportJobs");
    expect(source).toContain("npm run worker:reports -- --limit=3");
    expect(source).toContain("queued");
    expect(source).toContain("processing");
    expect(source).toContain("completed");
    expect(source).toContain("needs_operator_review");
    expect(source).toContain("failed_retryable");
    expect(source).toContain("failed_permanent");
    expect(source).not.toContain("Phase 1 workspace");
  });

  it("uses mobile-first cards with overflow-safe classes and no table", () => {
    expect(source).not.toMatch(/<table\b/i);
    expect(source).toMatch(/grid gap-3 sm:grid-cols-2/);
    expect(source).toContain("min-w-0");
    expect(source).toContain("break-words");
    expect(source).toContain("[overflow-wrap:anywhere]");
  });
});
