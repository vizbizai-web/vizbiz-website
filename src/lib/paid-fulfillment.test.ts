import { describe, expect, it } from "vitest";
import { attachPaidIntake, buildPaidOrder, buildPaidSuccessExperience, normalizePaidIntake } from "./paid-fulfillment";
import type { MiniLeadRecord } from "./lead-pipeline";

const lead: MiniLeadRecord = {
  id: "lead_123",
  email: "owner@example.com",
  auditId: "audit_123",
  reportSlug: "lakeshore-family-dentistry-1aff335b",
  competitorSource: "user_supplied",
  competitors: [],
  client: { name: "Lakeshore Family Dentistry", websiteUrl: "https://lakeshore.example", city: "Oakville" },
  status: "cta_clicked",
  statusHistory: [{ status: "submitted", at: "2026-05-09T20:00:00.000Z" }],
  emailDeliveryStatus: "sent",
  reportViewedAt: "2026-05-09T20:05:00.000Z",
  ctaClicks: [],
  createdAt: "2026-05-09T20:00:00.000Z",
  updatedAt: "2026-05-09T20:05:00.000Z",
};

describe("paid fulfillment", () => {
  it("creates an immediate fulfillment record for one-time fix purchases", () => {
    const order = buildPaidOrder({ lead, product: "fix_package", paymentId: "cs_test_123", now: "2026-05-09T21:00:00.000Z" });

    expect(order.id).toBe("paid_lakeshore-family-dentistry-1aff335b_fix_package");
    expect(order.status).toBe("intake_pending");
    expect(order.clientName).toBe("Lakeshore Family Dentistry");
    expect(order.promise.headline).toBe("Your One-Time Full Report + Fix is now underway");
    expect(order.promise.deliveryWindow).toBe("2–3 business days");
    expect(order.nextSteps[0]).toContain("Complete the paid intake");
    expect(order.timeline.map((item) => item.label)).toContain("Full report delivery");
  });

  it("uses monthly onboarding copy for monthly subscriptions", () => {
    const order = buildPaidOrder({ lead, product: "monthly_plan", now: "2026-05-09T21:00:00.000Z" });
    const experience = buildPaidSuccessExperience(order);

    expect(order.promise.headline).toBe("Your Monthly Full Report Growth Plan is active");
    expect(order.promise.deliveryWindow).toBe("First baseline within 2–3 business days");
    expect(experience.primaryCta).toBe("Complete Monthly Growth Intake");
    expect(experience.whatStarted).toContain("monthly local competitor monitoring");
  });

  it("normalizes client intake into client-safe fulfillment fields", () => {
    const intake = normalizePaidIntake({
      contactName: "  Alex  ",
      role: "Owner",
      businessDisplayName: "  Lakeshore Family Dentistry  ",
      primaryLocation: "Oakville, ON",
      country: "Canada",
      confirmedNiche: "Family dentist",
      googleBusinessProfileUrl: "business.google.com/profile",
      socialProfiles: "https://instagram.com/lakeshore\nfacebook.com/lakeshore",
      priorityServices: "Implants, emergency dentistry",
      topServicesToWin: "Implants\nEmergency dentistry, Invisalign",
      highestValueService: "Dental implants",
      primaryConversionAction: "Phone calls",
      primaryPhone: " +1 555 123 4567 ",
      competitor1Website: "comp-one.example",
      competitor1GoogleUrl: "maps.google.com/?cid=123",
      additionalCompetitors: "Competitor A\nCompetitor B",
      additionalResearchPermission: "on",
      reviewLinks: "g.page/lakeshore/review\nhttps://reviews.example/lakeshore",
      proofLinks: "case-study.example",
      monthlyMonitoringMarkets: "Oakville\nBurlington, Mississauga",
      urgentGoal: "Rank when patients ask AI for emergency dentists",
      notes: "Call after 3pm",
    });

    expect(intake.contactName).toBe("Alex");
    expect(intake.googleBusinessProfileUrl).toBe("https://business.google.com/profile");
    expect(intake.socialProfiles).toEqual(["https://instagram.com/lakeshore", "https://facebook.com/lakeshore"]);
    expect(intake.businessDisplayName).toBe("Lakeshore Family Dentistry");
    expect(intake.topServicesToWin).toEqual(["Implants", "Emergency dentistry", "Invisalign"]);
    expect(intake.primaryPhone).toBe("+1 555 123 4567");
    expect(intake.competitor1Website).toBe("https://comp-one.example");
    expect(intake.competitor1GoogleUrl).toBe("https://maps.google.com/?cid=123");
    expect(intake.additionalCompetitors).toEqual(["Competitor A", "Competitor B"]);
    expect(intake.additionalResearchPermission).toBe(true);
    expect(intake.reviewLinks).toEqual(["https://g.page/lakeshore/review", "https://reviews.example/lakeshore"]);
    expect(intake.proofLinks).toEqual(["https://case-study.example"]);
    expect(intake.monthlyMonitoringMarkets).toEqual(["Oakville", "Burlington", "Mississauga"]);
    expect(intake.urgentGoal).toContain("emergency dentists");
  });

  it("attaches intake, queues fulfillment, and stores the report job id", () => {
    const order = buildPaidOrder({ lead, product: "fix_package", now: "2026-05-09T21:00:00.000Z" });
    const intake = normalizePaidIntake({ contactName: "Alex", businessDisplayName: "Lakeshore" });

    const updated = attachPaidIntake(order, intake, "2026-05-09T22:00:00.000Z", "report_job_123");

    expect(updated.status).toBe("queued");
    expect(updated.reportJobId).toBe("report_job_123");
    expect(updated.intake?.submittedAt).toBe("2026-05-09T22:00:00.000Z");
    expect(updated.timeline.find((item) => item.label === "Paid intake")?.status).toBe("complete");
    expect(updated.timeline.find((item) => item.label === "Full audit queued")?.status).toBe("active");
  });
});
