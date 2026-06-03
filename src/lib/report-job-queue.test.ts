import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({ records: new Map<string, unknown>() }));

vi.mock("@/lib/file-store", () => ({
  saveJsonWithKey: vi.fn(async (_collection: string, key: string, record: unknown) => {
    store.records.set(key, record);
    return record;
  }),
  readJson: vi.fn(async (_collection: string, id: string) => store.records.get(id) ?? null),
  listJson: vi.fn(async () => Array.from(store.records.values())),
}));

process.env.VIZBIZ_REPORT_JOB_STORE = "local";

import {
  claimNextReportJob,
  completeReportJob,
  enqueueReportJob,
  failReportJob,
  listReportJobs,
  markReportJobNeedsReview,
} from "./report-job-queue";

describe("report job queue", () => {
  beforeEach(() => {
    store.records.clear();
  });

  it("enqueues and lists local JSON-backed jobs", async () => {
    const job = await enqueueReportJob({
      type: "free_mini_report",
      leadId: "lead_1",
      payload: { email: "owner@example.com" },
      now: "2026-05-24T20:00:00.000Z",
    });

    expect(job.id).toMatch(/^report_job_/);
    expect(job.status).toBe("queued");
    expect(job.attempts).toBe(0);
    expect(job.maxAttempts).toBe(3);
    expect(await listReportJobs("queued")).toEqual([job]);
  });

  it("claims the oldest queued job and locks it for a worker", async () => {
    const first = await enqueueReportJob({ type: "free_mini_report", now: "2026-05-24T20:00:00.000Z" });
    await enqueueReportJob({ type: "paid_full_report", now: "2026-05-24T20:01:00.000Z" });

    const claimed = await claimNextReportJob("worker-a", "2026-05-24T20:02:00.000Z");

    expect(claimed).toMatchObject({ id: first.id, status: "processing", attempts: 1, lockedBy: "worker-a" });
    expect(await listReportJobs("queued")).toHaveLength(1);
  });

  it("recovers processing jobs whose locks are older than 15 minutes", async () => {
    const job = await enqueueReportJob({ type: "free_mini_report", now: "2026-05-24T20:00:00.000Z" });
    await claimNextReportJob("worker-a", "2026-05-24T20:01:00.000Z");

    const tooSoon = await claimNextReportJob("worker-b", "2026-05-24T20:15:59.000Z");
    const recovered = await claimNextReportJob("worker-b", "2026-05-24T20:16:01.000Z");

    expect(tooSoon).toBeNull();
    expect(recovered).toMatchObject({ id: job.id, status: "processing", attempts: 2, lockedBy: "worker-b" });
  });

  it("completes and marks jobs for operator review", async () => {
    const completedJob = await enqueueReportJob({ type: "free_mini_report" });
    await claimNextReportJob("worker-a", "2026-05-24T20:00:00.000Z");
    const completed = await completeReportJob(completedJob.id, { slug: "abc" }, "2026-05-24T20:05:00.000Z");

    const reviewJob = await enqueueReportJob({ type: "paid_full_report" });
    const review = await markReportJobNeedsReview(reviewJob.id, ["low confidence"], { slug: "def" }, "2026-05-24T20:06:00.000Z");

    expect(completed).toMatchObject({ status: "completed", result: { slug: "abc" }, lockedAt: null, lockedBy: null });
    expect(review).toMatchObject({ status: "needs_operator_review", lastError: "low confidence", result: { slug: "def", reasons: ["low confidence"] } });
  });

  it("retries retryable failures until maxAttempts, then fails permanently", async () => {
    const job = await enqueueReportJob({ type: "free_mini_report", maxAttempts: 2 });
    await claimNextReportJob("worker-a", "2026-05-24T20:00:00.000Z");
    const retryable = await failReportJob(job.id, new Error("temporary outage"), true, "2026-05-24T20:01:00.000Z");
    const claimedAgain = await claimNextReportJob("worker-b", "2026-05-24T20:02:00.000Z");
    const permanent = await failReportJob(job.id, "still down", true, "2026-05-24T20:03:00.000Z");

    expect(retryable.status).toBe("failed_retryable");
    expect(claimedAgain).toMatchObject({ attempts: 2, lockedBy: "worker-b" });
    expect(permanent).toMatchObject({ status: "failed_permanent", lastError: "still down" });
  });
});
