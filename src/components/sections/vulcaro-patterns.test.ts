import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = [
  "src/components/sections/Hero.tsx",
  "src/components/sections/Pricing.tsx",
  "src/components/sections/MiniReportJourney.tsx",
  "src/components/sections/AiVisibilityTeam.tsx",
  "src/components/sections/OfferStack.tsx",
  "src/app/page.tsx",
];

function combinedSource() {
  return files.map((file) => readFileSync(file, "utf8")).join("\n");
}

describe("VizBiz conversion offer patterns", () => {
  it("packages the paid report as a concrete founder offer with a risk reversal", () => {
    const source = combinedSource();

    expect(source).toContain("Founding local business offer");
    expect(source).toContain("120 buyer-intent AI prompts");
    expect(source).toContain("If we don’t uncover at least 10 clear AI visibility gaps");
  });

  it("explains the AI visibility team/process without promising guaranteed rankings", () => {
    const source = combinedSource();

    expect(source).toContain("Your AI visibility team");
    expect(source).toContain("Prompt Tester");
    expect(source).toContain("Citation Analyst");
    expect(source).not.toContain("We guarantee ChatGPT rankings");
    expect(source).not.toContain("control every AI platform");
  });
});
