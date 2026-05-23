import { describe, expect, it } from "vitest";
import { HERO_TICKER_INTERVAL_MS } from "./HeroTicker";

describe("HeroTicker motion settings", () => {
  it("matches the fast vertical scroll cadence from the hero animation example", () => {
    expect(HERO_TICKER_INTERVAL_MS).toBe(1150);
  });
});
