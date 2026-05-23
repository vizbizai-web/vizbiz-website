import { describe, expect, it } from "vitest";
import { HERO_TICKER_WORDS } from "./hero-ticker-words";

describe("hero ticker words", () => {
  it("keeps the rotating headline focused on local business niches", () => {
    expect(HERO_TICKER_WORDS).toHaveLength(12);
    expect(HERO_TICKER_WORDS[0]).toBe("dentists.");
    expect(HERO_TICKER_WORDS).toContain("local clinics.");
    expect(HERO_TICKER_WORDS).toContain("med spas.");
    expect(HERO_TICKER_WORDS).toContain("home services.");
    expect(HERO_TICKER_WORDS).not.toContain("car dealerships.");
    expect(HERO_TICKER_WORDS).not.toContain("auto retailers.");
    expect(HERO_TICKER_WORDS).not.toContain("solopreneurs.");
    expect(HERO_TICKER_WORDS.at(-1)).toBe("your business.");
    expect(HERO_TICKER_WORDS.every((word) => word.endsWith("."))).toBe(true);
  });
});
