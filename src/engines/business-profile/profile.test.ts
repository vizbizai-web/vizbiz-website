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

  it("weights dealership service, repairs, and parts as core revenue signals", () => {
    const profile = inferBusinessProfileFromSignals({
      businessName: "Foster Kia",
      websiteUrl: "https://fosterkia.com",
      city: "Scarborough",
      text: "Kia dealership with new cars, used cars, service department, certified repairs, parts department, oil changes, brakes, tires, warranty service, trade-in, and financing.",
    });

    expect(profile.niche).toBe("auto_dealer");
    expect(profile.primaryServices).toEqual(expect.arrayContaining(["service department", "auto repairs", "parts department"]));
    expect(profile.buyerIntentCategories).toEqual(expect.arrayContaining(["service", "repairs", "parts"]));
    expect(profile.promptLabels.service).toBe("dealership service and repairs");
    expect(profile.promptLabels.product).toBe("parts department");
    expect(profile.reportLabels.service).toBe("Service & Repair Visibility");
    expect(profile.reportLabels.inventory).toBe("Parts & Maintenance Visibility");
  });

  it("infers a dealership from brand/make naming even without explicit business type", () => {
    const profile = inferBusinessProfileFromSignals({
      businessName: "Foster Kia",
      websiteUrl: "https://www.fosterkia.com",
      city: "Oakville",
      text: "Foster Kia Oakville new Kia used cars service parts repair warranty maintenance",
      primaryService: "Kia dealership",
    });

    expect(profile.niche).toBe("auto_dealer");
    expect(profile.primaryServices).toEqual(expect.arrayContaining(["Kia dealership", "service department", "parts department", "auto repairs"]));
    expect(profile.reportLabels.service).toBe("Service & Repair Visibility");
  });

  it("detects tax service businesses from service wording", () => {
    const profile = inferBusinessProfileFromSignals({
      businessName: "AK Consultancy Services Inc.",
      websiteUrl: "https://akconsultancy.example",
      city: "Oakville",
      text: "AK Consultancy Services Inc. tax services tax preparation bookkeeping accounting Oakville",
      primaryService: "tax services",
    });

    expect(profile.niche).toBe("tax_service");
    expect(profile.reportLabels.discovery).toBe("Tax Service Discovery");
    expect(profile.primaryServices).toEqual(expect.arrayContaining(["tax services", "tax preparation", "bookkeeping"]));
  });

  it("creates a dynamic service profile instead of client-facing generic copy when a new niche has clear service signals", () => {
    const profile = inferBusinessProfileFromSignals({
      businessName: "Green Yard Pros",
      websiteUrl: "https://greenyard.example",
      city: "Hamilton",
      text: "Green Yard Pros provides landscaping, lawn care, garden cleanup, and seasonal property maintenance in Hamilton.",
    });

    expect(profile.niche).toBe("generic_local_service");
    expect(profile.profileMode).toBe("dynamic");
    expect(profile.displayNiche).toBe("landscaping service");
    expect(profile.primaryServices).toEqual(expect.arrayContaining(["landscaping"]));
    expect(profile.reportLabels.discovery).toBe("Landscaping Discovery");
    expect(profile.promptLabels.core).toBe("landscaping");
  });

  it("uses internal needs-review fallback only when niche confidence is low and no service is clear", () => {
    const profile = inferBusinessProfileFromSignals({
      businessName: "Acme Local Co",
      websiteUrl: "https://acmelocal.example",
      city: "Hamilton",
      text: "We help local customers with appointments, quotes, and trusted service across Hamilton.",
    });

    expect(profile.niche).toBe("generic_local_service");
    expect(profile.schemaType).toBe("LocalBusiness");
    expect(profile.profileMode).toBe("needs_review");
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
