import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaidOrderRecord } from "@/lib/paid-fulfillment";

const readJson = vi.fn();
const saveJsonWithKey = vi.fn();
const enqueueReportJob = vi.fn();

vi.mock("@/lib/file-store", () => ({
  readJson,
  saveJsonWithKey,
}));

vi.mock("@/lib/report-job-queue", () => ({
  enqueueReportJob,
}));

const { POST } = await import("./route");

const baseOrder: PaidOrderRecord = {
  id: "paid_lakeshore_fix_package",
  leadId: "lead_123",
  auditId: "audit_123",
  reportSlug: "lakeshore",
  email: "owner@example.com",
  clientName: "Lakeshore Family Dentistry",
  product: "fix_package",
  paymentId: "cs_test_123",
  status: "intake_pending",
  promise: { headline: "h", subheadline: "s", deliveryWindow: "2-3 days" },
  nextSteps: [],
  timeline: [
    { label: "Paid intake", description: "", status: "active" },
    { label: "Full audit queued", description: "", status: "pending" },
  ],
  intake: null,
  createdAt: "2026-05-24T20:00:00.000Z",
  updatedAt: "2026-05-24T20:00:00.000Z",
};

function requestFor(product: "fix_package" | "monthly_plan", orderId = baseOrder.id) {
  const body = new FormData();
  body.set("orderId", orderId);
  body.set("slug", "lakeshore");
  body.set("product", product);
  body.set("contactName", "Alex");
  body.set("businessDisplayName", "Lakeshore Family Dentistry");
  body.set("googleBusinessProfileUrl", "business.google.com/profile");
  body.set("topServicesToWin", "Implants\nEmergency dentistry");
  body.set("additionalResearchPermission", "on");
  body.set("monthlyMonitoringMarkets", "Oakville\nBurlington");
  return new Request("https://vizbiz.test/api/purchase/intake", { method: "POST", body });
}

describe("purchase intake route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readJson.mockResolvedValue(baseOrder);
    saveJsonWithKey.mockImplementation(async (_collection, _key, value) => value);
    enqueueReportJob.mockResolvedValue({ id: "report_job_123" });
  });

  it("enqueues a paid full report job for fix_package intake before saving queued order", async () => {
    const response = await POST(requestFor("fix_package"));

    expect(response.status).toBe(303);
    expect(enqueueReportJob).toHaveBeenCalledWith(expect.objectContaining({
      type: "paid_full_report",
      leadId: "lead_123",
      paidOrderId: baseOrder.id,
      payload: expect.objectContaining({
        orderId: baseOrder.id,
        slug: "lakeshore",
        product: "fix_package",
        reportSlug: "lakeshore",
        auditId: "audit_123",
        email: "owner@example.com",
        clientName: "Lakeshore Family Dentistry",
        intake: expect.objectContaining({
          businessDisplayName: "Lakeshore Family Dentistry",
          googleBusinessProfileUrl: "https://business.google.com/profile",
          topServicesToWin: ["Implants", "Emergency dentistry"],
          additionalResearchPermission: true,
        }),
      }),
    }));
    expect(saveJsonWithKey).toHaveBeenCalledWith("paid-orders", baseOrder.id, expect.objectContaining({
      status: "queued",
      reportJobId: "report_job_123",
    }));
  });

  it("enqueues a paid monthly baseline job for monthly_plan intake", async () => {
    readJson.mockResolvedValue({
      ...baseOrder,
      id: "paid_lakeshore_monthly_plan",
      product: "monthly_plan",
      timeline: [
        { label: "Paid intake", description: "", status: "active" },
        { label: "Baseline audit queued", description: "", status: "pending" },
      ],
    });

    await POST(requestFor("monthly_plan", "paid_lakeshore_monthly_plan"));

    expect(enqueueReportJob).toHaveBeenCalledWith(expect.objectContaining({
      type: "paid_monthly_baseline",
      paidOrderId: "paid_lakeshore_monthly_plan",
      payload: expect.objectContaining({ product: "monthly_plan" }),
    }));
    expect(enqueueReportJob.mock.calls[0][0].payload.intake.monthlyMonitoringMarkets).toEqual(["Oakville", "Burlington"]);
    expect(saveJsonWithKey).toHaveBeenCalledWith("paid-orders", "paid_lakeshore_monthly_plan", expect.objectContaining({
      status: "queued",
      reportJobId: "report_job_123",
    }));
  });
});
