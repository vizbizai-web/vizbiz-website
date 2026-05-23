import { describe, expect, it } from "vitest";
import { parseMiniAuditLead } from "./mini-audit-intake";

describe("parseMiniAuditLead", () => {
  it("normalizes the free mini-report form into audit input and lead metadata", () => {
    const lead = parseMiniAuditLead({
      name: "  Oakville Toyota  ",
      email: " Owner@OakvilleToyota.ca ",
      websiteUrl: " oakvilletoyota.ca ",
      city: " Oakville ",
      primaryMake: " Toyota ",
      competitors: "Burlington Toyota, Mississauga Toyota",
    });

    expect(lead.email).toBe("owner@oakvilletoyota.ca");
    expect(lead.auditInput).toMatchObject({
      name: "Oakville Toyota",
      city: "Oakville",
      market: "Oakville",
      primaryMake: "Toyota",
      businessType: "auto_dealer",
      websiteUrl: "https://oakvilletoyota.ca",
    });
    expect(lead.auditInput.competitors).toEqual([
      { name: "Burlington Toyota", aviScore: 65 },
      { name: "Mississauga Toyota", aviScore: 65 },
    ]);
  });

  it("rejects submissions without the required email capture fields", () => {
    expect(() => parseMiniAuditLead({ name: "Oakville Toyota", city: "Oakville" })).toThrow("email is required");
    expect(() => parseMiniAuditLead({ email: "owner@example.com", city: "Oakville" })).toThrow("name is required");
    expect(() => parseMiniAuditLead({ name: "Oakville Toyota", email: "owner@example.com" })).toThrow("city is required");
  });
});
