import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claimNextReportJob: vi.fn(),
  completeReportJob: vi.fn(),
  failReportJob: vi.fn(),
  markReportJobNeedsReview: vi.fn(),
  generateMiniReportForLead: vi.fn(),
}));

vi.mock("@/lib/report-job-queue", () => ({
  claimNextReportJob: mocks.claimNextReportJob,
  completeReportJob: mocks.completeReportJob,
  failReportJob: mocks.failReportJob,
  markReportJobNeedsReview: mocks.markReportJobNeedsReview,
}));

vi.mock("@/lib/report-generation-service", () => ({
  generateMiniReportForLead: mocks.generateMiniReportForLead,
}));

import { processReportJob, processReportJobs } from "./process-report-jobs";

const lead = {
  email: "owner@example.com",
  competitorSource: "none",
  auditInput: {
    name: "Lakeshore Dental",
    city: "Oakville",
    businessType: "dentist",
  },
};

describe("process-report-jobs worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.completeReportJob.mockResolvedValue({});
    mocks.failReportJob.mockResolvedValue({});
    mocks.markReportJobNeedsReview.mockResolvedValue({});
  });

  it("claims jobs up to the requested limit and completes generated free mini reports", async () => {
    mocks.claimNextReportJob
      .mockResolvedValueOnce({ id: "job_1", type: "free_mini_report", leadId: "lead_1", payload: { lead, rawIntake: { email: lead.email }, baseUrl: "https://vizbiz.ai" } })
      .mockResolvedValueOnce(null);
    mocks.generateMiniReportForLead.mockResolvedValue({ status: "report_prepared", slug: "lakeshore-dental", reportUrl: "/mini-report/lakeshore-dental" });

    const result = await processReportJobs({ limit: 3, workerId: "worker-test" });

    expect(result).toEqual({ processed: 1, completed: 1, needsReview: 0, failed: 0 });
    expect(mocks.claimNextReportJob).toHaveBeenCalledWith("worker-test");
    expect(mocks.generateMiniReportForLead).toHaveBeenCalledWith({
      lead,
      rawIntake: { email: lead.email },
      baseUrl: "https://vizbiz.ai",
      supabaseLeadId: "lead_1",
      mode: "free",
    });
    expect(mocks.completeReportJob).toHaveBeenCalledWith("job_1", expect.objectContaining({ status: "report_prepared", slug: "lakeshore-dental" }));
  });

  it("marks quality-gated reports as needing operator review", async () => {
    mocks.generateMiniReportForLead.mockResolvedValue({ status: "needs_operator_review", reasons: ["low confidence"], slug: "slug_1" });

    const status = await processReportJob({ id: "job_1", type: "free_mini_report", status: "processing", leadId: "lead_1", payload: { lead }, attempts: 1, maxAttempts: 3, createdAt: "", updatedAt: "" });

    expect(status).toBe("needs_operator_review");
    expect(mocks.markReportJobNeedsReview).toHaveBeenCalledWith("job_1", ["low confidence"], expect.objectContaining({ status: "needs_operator_review", slug: "slug_1" }));
  });

  it("does not implement paid job generation yet", async () => {
    const status = await processReportJob({ id: "job_paid", type: "paid_full_report", status: "processing", payload: {}, attempts: 1, maxAttempts: 3, createdAt: "", updatedAt: "" });

    expect(status).toBe("needs_operator_review");
    expect(mocks.generateMiniReportForLead).not.toHaveBeenCalled();
    expect(mocks.markReportJobNeedsReview).toHaveBeenCalledWith("job_paid", ["Report job type paid_full_report is not implemented by this worker yet"]);
  });
});
