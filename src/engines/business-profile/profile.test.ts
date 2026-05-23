import { describe, expect, it } from "vitest";
import { createBusinessProfile, inferBusinessProfileFromSignals } from "./profile";

describe("business profile inference", () => {
  it("detects a dentist from website and service signals", () => {
    const profile = inferBusinessProfileFromSignals({
      businessName: "Oakville Family Dental",
      websiteUrl: "https://oakvillefamilydental.ca",
      city: "Oakville",
      text: "Family dentist offering emergency dental care, dental implants, teeth whitening, Invisalign, and cosmetic dentistry in Oakville.",
    });

    expect(profile.niche).toBe("dentist");
    expect(profile.industry).toBe("healthcare");
    expect(profile.schemaType).toBe("Dentist");
    expect(profile.primaryServices).toEqual(expect.arrayContaining(["emergency dental", "dental implants", "teeth whitening"]));
    expect(profile.promptLabels.core).toBe("dentist");
    expect(profile.reportLabels.service).toBe("Procedure Visibility");
    expect(profile.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("uses generic local service fallback when niche confidence is low", () => {
    const profile = inferBusinessProfileFromSignals({
      businessName: "Acme Local Co",
      websiteUrl: "https://acmelocal.example",
      city: "Hamilton",
      text: "We help local customers with appointments, quotes, and trusted service across Hamilton.",
    });

    expect(profile.niche).toBe("generic_local_service");
    expect(profile.schemaType).toBe("LocalBusiness");
    expect(profile.confidence).toBeLessThan(0.7);
    expect(profile.primaryServices.length).toBeGreaterThan(0);
  });

  it("creates a website-first profile and preserves optional category overrides", async () => {
    const profile = await createBusinessProfile({
      name: "Bright Smile Studio",
      websiteUrl: "https://brightsmile.example",
      city: "Toronto",
      businessType: "dentist",
      primaryService: "cosmetic dentistry",
    });

    expect(profile.businessName).toBe("Bright Smile Studio");
    expect(profile.niche).toBe("dentist");
    expect(profile.primaryServices[0]).toBe("cosmetic dentistry");
    expect(profile.competitorQueries).toContain("best dentist in Toronto");
  });
});
