import { describe, expect, it } from "vitest";
import type { MiniLeadRecord } from "@/lib/lead-pipeline";
import { buildMissionControlSnapshot, clientDisplayName, competitorDisplayName, leadTemperature } from "./mission-control-insights";

const baseLead: MiniLeadRecord = {
  id: "lead_1",
  email: "owner@example.com",
  auditId: "audit_1",
  reportSlug: "oakville-family-dental-1234",
  competitorSource: "user_supplied",
  competitors: [{ name: "Bronte Dental" }, { websiteUrl: "https://oakvilledental.com" }],
  client: { name: "Oakville Family Dental", city: "Oakville", primaryService: "Emergency dental" },
  status: "email_prepared",
  statusHistory: [
    { status: "submitted", at: "2026-05-08T10:00:00.000Z" },
    { status: "scan_complete", at: "2026-05-08T10:00:00.000Z" },
    { status: "email_prepared", at: "2026-05-08T10:00:00.000Z" },
  ],
  emailDeliveryStatus: "dry_run",
  reportViewedAt: null,
  ctaClicks: [],
  createdAt: "2026-05-08T10:00:00.000Z",
  updatedAt: "2026-05-08T10:00:00.000Z",
};

describe("mission control insights", () => {
  it("summarizes the current VizBiz funnel from real mini-report leads", () => {
    const viewedLead: MiniLeadRecord = {
      ...baseLead,
      id: "lead_2",
      status: "cta_clicked",
      reportViewedAt: "2026-05-08T12:00:00.000Z",
      ctaClicks: [{ product: "fix_package", destinationUrl: "https://buy.stripe.com/fix", clickedAt: "2026-05-08T12:15:00.000Z" }],
      createdAt: "2026-05-08T11:00:00.000Z",
      updatedAt: "2026-05-08T12:15:00.000Z",
    };

    const snapshot = buildMissionControlSnapshot([baseLead, viewedLead], new Date("2026-05-08T18:00:00.000Z"));

    expect(snapshot.metrics.totalLeads).toBe(2);
    expect(snapshot.metrics.newToday).toBe(2);
    expect(snapshot.metrics.reportViews).toBe(1);
    expect(snapshot.metrics.ctaClicks).toBe(1);
    expect(snapshot.metrics.fixPackageClicks).toBe(1);
    expect(snapshot.metrics.monthlyPlanClicks).toBe(0);
    expect(snapshot.hotLeads.map((lead) => lead.id)).toEqual(["lead_2"]);
    expect(snapshot.priorities.map((priority) => priority.title)).not.toContain("Client Portal v1.0");
  });

  it("labels leads by revenue temperature", () => {
    expect(leadTemperature(baseLead)).toBe("Warm");
    expect(leadTemperature({ ...baseLead, status: "submitted", statusHistory: [{ status: "submitted", at: baseLead.createdAt }] })).toBe("New");
    expect(leadTemperature({ ...baseLead, status: "report_viewed", reportViewedAt: "2026-05-08T12:00:00.000Z" })).toBe("Hot");
    expect(leadTemperature({ ...baseLead, status: "paid_conversion" })).toBe("Won");
  });

  it("extracts safe display values for clients and competitors", () => {
    expect(clientDisplayName(baseLead.client)).toBe("Oakville Family Dental");
    expect(competitorDisplayName(baseLead.competitors[0])).toBe("Bronte Dental");
    expect(competitorDisplayName(baseLead.competitors[1])).toBe("oakvilledental.com");
  });
});
