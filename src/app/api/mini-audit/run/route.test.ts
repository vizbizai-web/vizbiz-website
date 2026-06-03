import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enqueueReportJob: vi.fn(),
  createSupabaseLead: vi.fn(),
  createSupabaseLeadEvent: vi.fn(),
  createSupabaseTelegramAlertLog: vi.fn(),
  saveSupabaseCompetitors: vi.fn(),
  updateSupabaseLeadStatus: vi.fn(),
  sendTelegramAlert: vi.fn(),
}));

vi.mock("@/lib/report-job-queue", () => ({
  enqueueReportJob: mocks.enqueueReportJob,
}));

vi.mock("@/lib/telegram-alerts", async () => {
  const actual = await vi.importActual<typeof import("@/lib/telegram-alerts")>("@/lib/telegram-alerts");
  return {
    ...actual,
    sendTelegramAlert: mocks.sendTelegramAlert,
  };
});

vi.mock("@/lib/supabase-crm", () => ({
  createSupabaseLead: mocks.createSupabaseLead,
  createSupabaseLeadEvent: mocks.createSupabaseLeadEvent,
  createSupabaseTelegramAlertLog: mocks.createSupabaseTelegramAlertLog,
  saveSupabaseCompetitors: mocks.saveSupabaseCompetitors,
  updateSupabaseLeadStatus: mocks.updateSupabaseLeadStatus,
}));

import { POST } from "./route";

describe("POST /api/mini-audit/run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSupabaseLead.mockResolvedValue({ data: { id: "lead_1" }, error: null });
    mocks.createSupabaseLeadEvent.mockResolvedValue({ data: {}, error: null });
    mocks.createSupabaseTelegramAlertLog.mockResolvedValue({ data: {}, error: null });
    mocks.saveSupabaseCompetitors.mockResolvedValue({ data: [], error: null });
    mocks.updateSupabaseLeadStatus.mockResolvedValue({ ok: true });
    mocks.sendTelegramAlert.mockResolvedValue({ status: "skipped" });
    mocks.enqueueReportJob.mockResolvedValue({ id: "report_job_1", type: "free_mini_report" });
  });

  it("does not import or call synchronous mini-report generation", async () => {
    const source = await readFile(new URL("./route.ts", import.meta.url), "utf8");

    expect(source).not.toContain("generateMiniReportForLead");
    expect(source).not.toContain("report-generation-service");
  });

  it("saves the intake, preserves the Telegram intake alert, enqueues a report job, and returns 202", async () => {
    const rawIntake = {
      name: "Lakeshore Dental",
      email: "owner@example.com",
      city: "Oakville",
      businessType: "dentist",
      websiteUrl: "https://lakeshore.example",
      competitors: "Competitor A, Competitor B",
    };

    const response = await POST(new Request("https://vizbiz.ai/api/mini-audit/run", {
      method: "POST",
      body: JSON.stringify(rawIntake),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toEqual({
      status: "queued",
      jobId: "report_job_1",
      thankYouUrl: "/intake/thank-you?email=owner%40example.com&delivery=queued",
      supabaseLeadId: "lead_1",
    });
    expect(mocks.sendTelegramAlert).toHaveBeenCalledWith(expect.objectContaining({ type: "free_intake" }));
    expect(mocks.enqueueReportJob).toHaveBeenCalledWith(expect.objectContaining({
      type: "free_mini_report",
      leadId: "lead_1",
      payload: expect.objectContaining({
        rawIntake,
        email: "owner@example.com",
        competitorSource: "user_supplied",
        baseUrl: "https://vizbiz.ai",
        origin: "https://vizbiz.ai",
        supabaseLeadId: "lead_1",
        auditInput: expect.objectContaining({ name: "Lakeshore Dental" }),
        lead: expect.objectContaining({ email: "owner@example.com" }),
      }),
    }));
    expect(mocks.createSupabaseLeadEvent).toHaveBeenCalledWith(expect.objectContaining({
      leadId: "lead_1",
      eventType: "report_queued",
      payload: { jobId: "report_job_1", jobType: "free_mini_report" },
    }));
    expect(mocks.updateSupabaseLeadStatus).toHaveBeenCalledWith({ leadId: "lead_1", status: "report_queued" });
  });
});
