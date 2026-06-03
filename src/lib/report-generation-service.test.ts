import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runAudit: vi.fn(),
  createMiniReportFromAudit: vi.fn(),
  sendMiniReportEmail: vi.fn(),
  saveJson: vi.fn(),
  saveJsonWithKey: vi.fn(),
  createSupabaseLeadEvent: vi.fn(),
  hasSupabaseServerConfig: vi.fn(),
  saveSupabaseBusinessProfile: vi.fn(),
  saveSupabaseMiniReport: vi.fn(),
  saveSupabaseSiteIntelligencePlaceholder: vi.fn(),
  updateSupabaseLeadStatus: vi.fn(),
}));

vi.mock("@/engines/research/runner", () => ({ runAudit: mocks.runAudit }));
vi.mock("@/engines/research/mini-audit", () => ({ createMiniReportFromAudit: mocks.createMiniReportFromAudit }));
vi.mock("@/lib/email", () => ({ sendMiniReportEmail: mocks.sendMiniReportEmail }));
vi.mock("@/lib/file-store", () => ({ saveJson: mocks.saveJson, saveJsonWithKey: mocks.saveJsonWithKey }));
vi.mock("@/lib/supabase-crm", () => ({
  createSupabaseLeadEvent: mocks.createSupabaseLeadEvent,
  hasSupabaseServerConfig: mocks.hasSupabaseServerConfig,
  saveSupabaseBusinessProfile: mocks.saveSupabaseBusinessProfile,
  saveSupabaseMiniReport: mocks.saveSupabaseMiniReport,
  saveSupabaseSiteIntelligencePlaceholder: mocks.saveSupabaseSiteIntelligencePlaceholder,
  updateSupabaseLeadStatus: mocks.updateSupabaseLeadStatus,
}));

import { generateMiniReportForLead, validateMiniReportQuality } from "./report-generation-service";

const lead = {
  email: "owner@example.com",
  competitorSource: "none" as const,
  auditInput: { name: "Lakeshore Dental", city: "Oakville", websiteUrl: "https://example.com" },
};

function baseReport(overrides: Record<string, unknown> = {}) {
  return {
    id: "mini_1",
    slug: "lakeshore-dental-abc",
    client: { name: "Lakeshore Dental", city: "Oakville", websiteUrl: "https://example.com" },
    aviScore: 72,
    emailMiniReport: {
      subject: "Your report is ready",
      previewText: "Preview",
      openingLine: "Opening",
      bullets: ["One"],
      ctaLabel: "View report",
    },
    createdAt: "2026-05-24T20:00:00.000Z",
    businessProfile: { niche: "dentist", displayNiche: "Dentist", primaryServices: ["emergency dentistry"] },
    businessIntelligenceProfile: { needsOperatorReview: false, confidence: 90, contradictions: [] },
    buyerQuestionTest: { prompts: [{ question: "best emergency dentist in Oakville" }] },
    ...overrides,
  };
}

describe("report generation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.runAudit.mockResolvedValue({ id: "audit_1", client: { name: "Lakeshore Dental" } });
    mocks.createMiniReportFromAudit.mockReturnValue(baseReport());
    mocks.sendMiniReportEmail.mockResolvedValue({ status: "dry_run", provider: "dry_run" });
    mocks.saveJson.mockImplementation(async (_collection, record) => record);
    mocks.saveJsonWithKey.mockImplementation(async (_collection, _key, record) => record);
    mocks.saveSupabaseMiniReport.mockResolvedValue({ data: { id: "report_1" }, error: null });
    mocks.hasSupabaseServerConfig.mockReturnValue(false);
  });

  it("saves audit and report before sending a passing mini report email", async () => {
    const result = await generateMiniReportForLead({ lead, rawIntake: {}, baseUrl: "https://vizbiz.ai/api/mini-audit/run", mode: "free" });

    expect(result.status).toBe("report_prepared");
    expect(result.reportUrl).toBe("/mini-report/lakeshore-dental-abc");
    expect(mocks.saveJson).toHaveBeenCalledWith("audits", expect.objectContaining({ id: "audit_1" }));
    expect(mocks.saveJsonWithKey).toHaveBeenCalledWith("mini-reports", "lakeshore-dental-abc", expect.objectContaining({ leadEmail: "owner@example.com" }));
    expect(mocks.sendMiniReportEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "owner@example.com",
      reportUrl: "https://vizbiz.ai/mini-report/lakeshore-dental-abc",
    }));
  });

  it("does not send email when quality gate fails, but still persists generated artifacts", async () => {
    mocks.createMiniReportFromAudit.mockReturnValue(baseReport({
      businessIntelligenceProfile: { needsOperatorReview: true, confidence: 40, contradictions: ["conflicting category evidence"] },
    }));

    const result = await generateMiniReportForLead({ lead, rawIntake: {}, baseUrl: "https://vizbiz.ai", supabaseLeadId: "lead_1", mode: "free" });

    expect(result.status).toBe("needs_operator_review");
    expect(result.reasons).toContain("business intelligence confidence gate requires operator review (40/100)");
    expect(result.reasons).toContain("conflicting category evidence");
    expect(mocks.saveJson).toHaveBeenCalledWith("audits", expect.objectContaining({ id: "audit_1" }));
    expect(mocks.saveJsonWithKey).toHaveBeenCalledWith("mini-reports", "lakeshore-dental-abc", expect.any(Object));
    expect(mocks.saveSupabaseMiniReport).not.toHaveBeenCalled();
    expect(mocks.sendMiniReportEmail).not.toHaveBeenCalled();
    expect(mocks.updateSupabaseLeadStatus).toHaveBeenCalledWith({ leadId: "lead_1", status: "needs_operator_review" });
  });

  it("flags generic client-facing questions when a specific service exists", () => {
    const quality = validateMiniReportQuality({
      businessProfile: { niche: "dentist", primaryServices: ["emergency dentistry"] },
      buyerQuestionTest: { prompts: [{ question: "Which local business should I choose?" }] },
    });

    expect(quality.ok).toBe(false);
    expect(quality.reasons).toContain("client-facing AI questions still use generic local-business wording");
  });
});
