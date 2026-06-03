import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/app/mini-report/[slug]/page.tsx", "utf8");

describe("mini report prompt display", () => {
  it("does not visually clamp missed prompt questions", () => {
    expect(pageSource).not.toContain("line-clamp-2");
  });

  it("does not fall back to generic local business question labels", () => {
    expect(pageSource).not.toContain('?? "this business"');
    expect(pageSource).not.toContain("local business in ${market}");
    expect(pageSource).toContain("displayServiceForReport");
  });
});
