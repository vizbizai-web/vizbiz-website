import { describe, expect, it } from "vitest";
import { parseMiniAuditLead } from "./mini-audit-intake";

describe("parseMiniAuditLead generalized intake", () => {
  it("defaults to website-first niche detection instead of auto dealer", () => {
    const lead = parseMiniAuditLead({
      name: "Oakville Family Dental",
      email: " owner@oakvillefamilydental.ca ",
      websiteUrl: " oakvillefamilydental.ca ",
      city: " Oakville ",
      primaryService: " emergency dental ",
    });

    expect(lead.email).toBe("owner@oakvillefamilydental.ca");
    expect(lead.auditInput).toMatchObject({
      name: "Oakville Family Dental",
      city: "Oakville",
      market: "Oakville",
      websiteUrl: "https://oakvillefamilydental.ca",
      primaryService: "emergency dental",
    });
    expect(lead.auditInput.businessType).toBeUndefined();
  });

  it("accepts optional niche/category and two separate user-supplied competitor fields", () => {
    const lead = parseMiniAuditLead({
      name: "Reliable Roof Co",
      email: "hello@roof.example",
      websiteUrl: "https://roof.example",
      city: "Burlington",
      businessType: "roofer",
      competitorOne: "Burlington Roofers",
      competitorTwo: "https://haltonroof.example",
    });

    expect(lead.auditInput.businessType).toBe("roofer");
    expect(lead.competitorSource).toBe("user_supplied");
    expect(lead.auditInput.competitors).toEqual([
      { name: "Burlington Roofers", aviScore: 65 },
      { name: "https://haltonroof.example", websiteUrl: "https://haltonroof.example", aviScore: 65 },
    ]);
  });

  it("keeps legacy competitor textarea parsing as a capped two-competitor fallback", () => {
    const lead = parseMiniAuditLead({
      name: "Reliable Roof Co",
      email: "hello@roof.example",
      websiteUrl: "https://roof.example",
      city: "Burlington",
      businessType: "roofer",
      competitors: "Burlington Roofers\nhttps://haltonroof.example\nThird Roofing Co",
    });

    expect(lead.competitorSource).toBe("user_supplied");
    expect(lead.auditInput.competitors).toEqual([
      { name: "Burlington Roofers", aviScore: 65 },
      { name: "https://haltonroof.example", websiteUrl: "https://haltonroof.example", aviScore: 65 },
    ]);
  });

  it("marks competitor source as none when the recommended competitor field is blank", () => {
    const lead = parseMiniAuditLead({
      name: "Reliable Roof Co",
      email: "hello@roof.example",
      websiteUrl: "https://roof.example",
      city: "Burlington",
      businessType: "roofer",
    });

    expect(lead.competitorSource).toBe("none");
    expect(lead.auditInput.competitors).toBeUndefined();
  });
});
