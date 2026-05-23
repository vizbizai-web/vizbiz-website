import { describe, expect, it } from "vitest";
import { buildMiniLeadRecord, buildPaymentLinks, nextLeadStatus } from "./lead-pipeline";

const base = {
  id: "mini_123",
  email: "owner@example.com",
  auditId: "audit_123",
  reportSlug: "oakville-family-dental-1234",
  competitorSource: "user_supplied" as const,
  competitors: [{ name: "Bronte Road Dental" }, { name: "Oakville Place Dental", websiteUrl: "https://oakvilleplacedental.com", aviScore: 65 }],
  client: { name: "Oakville Family Dental", city: "Oakville" },
  createdAt: "2026-05-06T00:00:00.000Z",
};

describe("lead pipeline", () => {
  it("creates a mission-control lead record with funnel statuses", () => {
    const lead = buildMiniLeadRecord({ ...base, emailDeliveryStatus: "dry_run" });

    expect(lead.status).toBe("email_prepared");
    expect(lead.statusHistory.map((event) => event.status)).toEqual(["submitted", "scan_complete", "email_prepared"]);
    expect(lead.reportViewedAt).toBeNull();
    expect(lead.ctaClicks).toEqual([]);
    expect(lead.emailDeliveryStatus).toBe("dry_run");
  });

  it("advances status without moving backwards", () => {
    expect(nextLeadStatus("email_prepared", "report_viewed")).toBe("report_viewed");
    expect(nextLeadStatus("cta_clicked", "report_viewed")).toBe("cta_clicked");
    expect(nextLeadStatus("paid_conversion", "cta_clicked")).toBe("paid_conversion");
  });

  it("builds tracked paid CTA links and falls back when Stripe links are not configured", () => {
    const links = buildPaymentLinks({
      slug: "oakville-family-dental-1234",
      baseUrl: "https://vizbiz.ai",
      fixPackageUrl: "https://buy.stripe.com/fix",
      monthlyPlanUrl: undefined,
    });

    expect(links.fixPackage.trackingUrl).toBe("https://vizbiz.ai/api/mini-audit/cta?slug=oakville-family-dental-1234&product=fix_package");
    expect(links.fixPackage.destinationUrl).toBe("https://buy.stripe.com/fix");
    expect(links.monthlyPlan.destinationUrl).toBe("/#pricing");
  });
});
