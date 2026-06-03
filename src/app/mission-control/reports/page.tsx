export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { listReportJobs } from '@/lib/report-job-queue';
import type { ReportJobStatus } from '@/lib/report-job-queue';
import { buildReportJobViewModel, buildReportQueueSummary, REPORT_JOB_STATUSES } from './report-job-view-model';

const statusTone: Record<ReportJobStatus, string> = {
  queued: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  processing: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  completed: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  needs_operator_review: 'border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100',
  failed_retryable: 'border-orange-300/25 bg-orange-300/10 text-orange-100',
  failed_permanent: 'border-red-300/25 bg-red-300/10 text-red-100',
};

export default async function ReportsPage() {
  const jobs = await listReportJobs();
  const summary = buildReportQueueSummary(jobs);
  const grouped = REPORT_JOB_STATUSES.map((status) => ({
    status,
    label: summary.statusCards.find((card) => card.status === status)?.label ?? status,
    jobs: jobs.filter((job) => job.status === status).map(buildReportJobViewModel),
  }));

  return (
    <div className="min-w-0 space-y-5 pb-24 lg:pb-0">
      <div className="min-w-0 rounded-[2rem] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_36%),linear-gradient(135deg,#111827,#020617)] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.35)] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200 sm:text-sm">Mission Control · report queue</p>
        <div className="mt-3 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black leading-tight text-white sm:text-4xl">Reports / Fulfillment</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Mobile-first operator view for free mini reports, paid full reports, monthly baselines, reruns, quality gates, and failed worker jobs.
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-slate-300 sm:min-w-[320px]">
            <p className="font-bold uppercase tracking-[0.16em] text-cyan-200">Worker command</p>
            <code className="mt-2 block break-words rounded-xl bg-slate-950/80 px-3 py-2 font-mono text-cyan-100 [overflow-wrap:anywhere]">npm run worker:reports -- --limit=3</code>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {summary.statusCards.map((card) => (
          <div key={card.status} className={`min-w-0 rounded-2xl border p-4 ${statusTone[card.status]}`}>
            <p className="text-3xl font-black">{card.count}</p>
            <p className="mt-1 break-words text-xs font-black uppercase tracking-[0.14em] [overflow-wrap:anywhere]">{card.label}</p>
          </div>
        ))}
      </div>

      {summary.total === 0 ? (
        <div className="min-w-0 rounded-[2rem] border border-slate-800 bg-[#111118] p-5 text-center sm:p-8">
          <p className="text-4xl">🛰️</p>
          <h2 className="mt-3 text-2xl font-black text-white">No report jobs yet</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Submit a free intake or complete a paid intake to enqueue the first job. Then run the worker command above to process queued work.
          </p>
          <Link href="/#free-mini-report" className="mt-5 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">
            Open intake funnel
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <section key={group.status} className="min-w-0 rounded-[2rem] border border-slate-800/70 bg-[#0B1120]/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="min-w-0 break-words text-lg font-black text-white sm:text-xl">{group.label}</h2>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusTone[group.status]}`}>{group.jobs.length}</span>
              </div>
              {group.jobs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-500">No jobs in this lane.</p>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                  {group.jobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

type JobVM = ReturnType<typeof buildReportJobViewModel>;

function JobCard({ job }: { job: JobVM }) {
  return (
    <article className="min-w-0 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-lg font-black text-white [overflow-wrap:anywhere]">{job.businessName}</p>
          <p className="mt-1 break-words text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 [overflow-wrap:anywhere]">{job.typeLabel}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusTone[job.status]}`}>{job.statusLabel}</span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-300">
        <Meta label="Client" value={job.clientName} />
        <Meta label="Email" value={job.email} />
        <Meta label="Job" value={job.shortId} />
        <Meta label="Paid order" value={job.paidOrderId} />
        <Meta label="Attempts" value={job.attemptsLabel} />
        <Meta label="Locked" value={job.lockedLabel} />
        <Meta label="Created" value={job.createdLabel} />
        <Meta label="Updated" value={job.updatedLabel} />
      </div>

      {job.payloadSummary.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Payload summary</p>
          <div className="mt-2 grid gap-2">
            {job.payloadSummary.map((item) => <Meta key={item.label} label={item.label} value={item.value} />)}
          </div>
        </div>
      )}

      {(job.lastError || job.reasons.length > 0) && (
        <div className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-3 text-sm leading-6 text-fuchsia-50">
          <p className="font-black uppercase tracking-[0.14em]">Review blockers</p>
          {job.lastError && <p className="mt-2 break-words [overflow-wrap:anywhere]">{job.lastError}</p>}
          {job.reasons.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {job.reasons.map((reason) => <li key={reason} className="break-words [overflow-wrap:anywhere]">{reason}</li>)}
            </ul>
          )}
        </div>
      )}

      {job.reportUrl && (
        <Link href={job.reportUrl} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
          Open report
        </Link>
      )}
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800/70 bg-black/20 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-200 [overflow-wrap:anywhere]">{value || '—'}</p>
    </div>
  );
}
