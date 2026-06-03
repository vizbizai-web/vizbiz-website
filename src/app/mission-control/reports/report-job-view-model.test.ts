import { describe, expect, it } from "vitest";
import type { ReportJobRecord } from "@/lib/report-job-queue";
import {
  buildReportJobViewModel,
  buildReportQueueSummary,
  REPORT_JOB_STATUSES,
} from "./report-job-view-model";

const baseJob: ReportJobRecord = {
  id: "report_job_1234567890abcdef",
  type: "paid_full_report",
  status: "needs_operator_review",
  leadId: "lead_abc",
  paidOrderId: "po_987",
  payload: {
    lead: {
      email: "owner@example.com",
      auditInput: {
        name: "Lakeshore Dental",
        clientName: "Dr. Patel",
        city: "Oakville",
        websiteUrl: "https://lakeshore.example/very/long/path/that/should/not/break/mobile",
        competitors: [{ name: "Competitor One" }, { name: "Competitor Two" }, { name: "Competitor Three" }],
      },
    },
  },
  attempts: 2,
  maxAttempts: 3,
  lockedAt: "2026-05-24T20:10:00.000Z",
  lockedBy: "worker-a",
  lastError: "Needs human review because confidence is low and source URL is very long",
  result: {
    absoluteReportUrl: "https://viz.biz/reports/report_job_1234567890abcdef",
    reasons: ["low confidence", "missing paid deliverable section"],
  },
  createdAt: "2026-05-24T20:00:00.000Z",
  updatedAt: "2026-05-24T20:12:00.000Z",
};

describe("report job view model", () => {
  it("keeps the canonical status order and labels every status", () => {
    expect(REPORT_JOB_STATUSES).toEqual([
      "queued",
      "processing",
      "completed",
      "needs_operator_review",
      "failed_retryable",
      "failed_permanent",
    ]);

    const summary = buildReportQueueSummary([baseJob]);

    expect(summary.statusCards.map((card) => card.status)).toEqual(REPORT_JOB_STATUSES);
    expect(summary.statusCards.find((card) => card.status === "needs_operator_review")).toMatchObject({
      label: "Needs operator review",
      count: 1,
    });
    expect(summary.statusCards.find((card) => card.status === "queued")?.count).toBe(0);
  });

  it("extracts a lightweight, mobile-safe job summary without dumping raw JSON", () => {
    const vm = buildReportJobViewModel(baseJob);

    expect(vm).toMatchObject({
      id: "report_job_1234567890abcdef",
      shortId: "report_job_…abcdef",
      statusLabel: "Needs operator review",
      typeLabel: "Paid full report",
      businessName: "Lakeshore Dental",
      clientName: "Dr. Patel",
      email: "owner@example.com",
      paidOrderId: "po_987",
      attemptsLabel: "2 / 3",
      lockedLabel: "worker-a · 2026-05-24 20:10 UTC",
      lastError: "Needs human review because confidence is low and source URL is very long",
      reportUrl: "https://viz.biz/reports/report_job_1234567890abcdef",
      reasons: ["low confidence", "missing paid deliverable section"],
    });
    expect(vm.payloadSummary).toEqual([
      { label: "Website", value: "https://lakeshore.example/very/long/path/that/should/not/break/mobile" },
      { label: "Location", value: "Oakville" },
      { label: "Competitors", value: "Competitor One, Competitor Two +1 more" },
    ]);
    expect(JSON.stringify(vm)).not.toContain("rawJson");
  });

  it("falls back to top-level payload fields and relative report URLs", () => {
    const vm = buildReportJobViewModel({
      ...baseJob,
      type: "free_mini_report",
      status: "completed",
      payload: { clientName: "Solo Owner", businessName: "Solo Shop", email: "solo@example.com" },
      paidOrderId: null,
      lockedAt: null,
      lockedBy: null,
      lastError: null,
      result: { reportUrl: "/mini-report/solo-shop" },
    });

    expect(vm.businessName).toBe("Solo Shop");
    expect(vm.clientName).toBe("Solo Owner");
    expect(vm.email).toBe("solo@example.com");
    expect(vm.reportUrl).toBe("/mini-report/solo-shop");
    expect(vm.lockedLabel).toBe("Not locked");
  });
});
