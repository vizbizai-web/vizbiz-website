import { describe, expect, it } from "vitest";
import { buildPaidOrder, buildPaidSuccessExperience, normalizePaidIntake } from "./paid-fulfillment";
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
      googleBusinessProfileUrl: "business.google.com/profile",
      socialProfiles: "https://instagram.com/lakeshore\nfacebook.com/lakeshore",
      priorityServices: "Implants, emergency dentistry",
      urgentGoal: "Rank when patients ask AI for emergency dentists",
      notes: "Call after 3pm",
    });

    expect(intake.contactName).toBe("Alex");
    expect(intake.googleBusinessProfileUrl).toBe("https://business.google.com/profile");
    expect(intake.socialProfiles).toEqual(["https://instagram.com/lakeshore", "https://facebook.com/lakeshore"]);
    expect(intake.urgentGoal).toContain("emergency dentists");
  });
});
