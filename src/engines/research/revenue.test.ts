import { describe, expect, it } from "vitest";
import { calculateRevenueOpportunity } from "./revenue";

describe("calculateRevenueOpportunity", () => {
  it("estimates AI revenue opportunity gap against the next two competitors", () => {
    const projection = calculateRevenueOpportunity({
      clientName: "Oakville Toyota",
      clientAviScore: 58,
      competitors: [
        { name: "Burlington Toyota", aviScore: 73 },
        { name: "Mississauga Toyota", aviScore: 68 },
      ],
      assumptions: {
        monthlyUnitsSold: 80,
        averageGrossPerVehicle: 3500,
        aiInfluencedBuyerShare: 0.2,
      },
    });

    expect(projection).not.toBeNull();
    expect(projection?.method).toBe("visibility_share_gamma_v1");
    expect(projection?.monthlyAiOpportunityPool).toBe(56000);
    expect(projection?.clientAiRecommendationShare).toBeCloseTo(0.253, 2);
    expect(projection?.topCompetitor?.name).toBe("Burlington Toyota");
    expect(projection?.monthlyGapVsTopTwoAverage).toBe(6781);
    expect(projection?.annualGapVsTopTwoAverage).toBe(81370);
    expect(projection?.scenarios.conservative.annualGapVsTopTwoAverage).toBe(40685);
    expect(projection?.scenarios.aggressive.annualGapVsTopTwoAverage).toBe(122055);
  });

  it("returns null when no competitor benchmarks are supplied", () => {
    expect(calculateRevenueOpportunity({ clientName: "Oakville Toyota", clientAviScore: 58, competitors: [] })).toBeNull();
  });
});
