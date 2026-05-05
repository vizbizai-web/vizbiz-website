import { describe, expect, it } from "vitest";
import { extractCompetitors } from "./runner";

describe("extractCompetitors", () => {
  it("excludes target-name phrases and generic search result headings", () => {
    const competitors = extractCompetitors(
      "At Oakville Toyota, shoppers can browse Toyota vehicles. Burlington Toyota is another option. AutoTrader Canada lists Oakville dealers.",
      "Oakville Toyota",
    );

    expect(competitors).toContain("Burlington Toyota");
    expect(competitors).not.toContain("At Oakville Toyota");
    expect(competitors).not.toContain("AutoTrader Canada");
  });

  it("excludes generic all-caps category headings from search snippets", () => {
    const competitors = extractCompetitors(
      "THE BEST CAR DEALERS IN OAKVILLE include Oakville Nissan, Budds Chevrolet, and Georgetown Kia.",
      "Oakville Toyota",
    );

    expect(competitors).toEqual(["Oakville Nissan", "Budds Chevrolet", "Georgetown Kia"]);
  });

  it("excludes keyword phrases that are not business names", () => {
    const competitors = extractCompetitors(
      "Used Toyota Dealership and Car Dealers pages mention Oakville Nissan and Mississauga Toyota.",
      "Oakville Toyota",
    );

    expect(competitors).toEqual(["Oakville Nissan", "Mississauga Toyota"]);
  });
});
