export const dynamic = "force-dynamic";

import Link from "next/link";
import { listJson } from "@/lib/file-store";
import type { MiniLeadRecord } from "@/lib/lead-pipeline";
import { buildMissionControlSnapshot, clientDisplayName, clientCity, clientService, competitorDisplayName, leadTemperature } from "../lib/mission-control-insights";

export default async function LeadsPage() {
  const leads = (await listJson<MiniLeadRecord>("mini-leads")).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const snapshot = buildMissionControlSnapshot(leads);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Intake Inbox</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Mini-report leads</h1>
          <p className="mt-2 max-w-3xl text-slate-400">Visual intake board for submissions, report views, CTA clicks, and paid follow-up priority.</p>
        </div>
        <Link href="/#free-mini-report" className="rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-bold text-slate-950 hover:bg-cyan-200">
          Open intake
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total leads" value={snapshot.metrics.totalLeads} />
        <Stat label="New today" value={snapshot.metrics.newToday} />
        <Stat label="Report views" value={snapshot.metrics.reportViews} />
        <Stat label="CTA clicks" value={snapshot.metrics.ctaClicks} />
      </div>

      <div className="sticky top-[73px] z-20 -mx-4 border-y border-slate-800/60 bg-[#0a0a0f]/95 px-4 py-3 backdrop-blur lg:top-0 lg:mx-0 lg:rounded-2xl lg:border lg:bg-[#111118]">
        <div className="flex gap-2 overflow-x-auto pb-1 text-sm">
          <FilterChip label="All" value={leads.length} active />
          <FilterChip label="Hot" value={snapshot.hotLeads.length} />
          <FilterChip label="Viewed" value={snapshot.metrics.reportViews} />
          <FilterChip label="CTA clicked" value={snapshot.metrics.ctaClicks} />
          <FilterChip label="Paid" value={snapshot.metrics.paidConversions} />
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-[#111118] px-5 py-14 text-center">
          <h2 className="text-xl font-semibold text-white">No mini-report leads yet.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Once a business submits the free AVI mini report form, the intake will appear here with competitors, report link, and follow-up state.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: MiniLeadRecord }) {
  const temperature = leadTemperature(lead);
  const competitors = lead.competitors?.map(competitorDisplayName).filter(Boolean).slice(0, 2) ?? [];
  const lastClick = lead.ctaClicks?.at(-1);

  return (
    <article className="rounded-3xl border border-slate-800/60 bg-[#111118] p-4 shadow-[0_0_34px_rgba(15,23,42,0.22)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-white">{clientDisplayName(lead.client)}</h2>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${temperatureClass(temperature)}`}>{temperature}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{clientCity(lead.client)} · {clientService(lead.client)}</p>
          <p className="mt-1 text-sm text-slate-500">{lead.email}</p>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <Link href={`/mini-report/${lead.reportSlug}`} className="flex-1 rounded-xl bg-cyan-300 px-3 py-2 text-center text-sm font-bold text-slate-950 hover:bg-cyan-200 sm:flex-none">
            Report
          </Link>
          <a href={`mailto:${lead.email}`} className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-center text-sm font-semibold text-slate-200 hover:bg-slate-800 sm:flex-none">
            Email
          </a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <MiniStat label="Status" value={lead.status.replaceAll("_", " ")} />
        <MiniStat label="Email" value={lead.emailDeliveryStatus.replaceAll("_", " ")} />
        <MiniStat label="CTA clicks" value={`${lead.ctaClicks?.length ?? 0}`} />
        <MiniStat label="Last touch" value={formatShortDate(lead.updatedAt)} />
      </div>

      <div className="mt-4 rounded-2xl bg-slate-950/35 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Competitors supplied</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {competitors.length > 0 ? competitors.map((competitor) => (
            <span key={competitor} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{competitor}</span>
          )) : <span className="text-sm text-slate-500">No competitors supplied</span>}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-800/60 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Created {formatDateTime(lead.createdAt)}</span>
        {lastClick ? <span className="text-amber-200">Last CTA: {lastClick.product.replaceAll("_", " ")}</span> : <span>No paid CTA click yet</span>}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-[#111118] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/35 p-3">
      <span className="block text-xs text-slate-500">{label}</span>
      <span className="mt-1 block truncate font-semibold capitalize text-slate-200">{value}</span>
    </div>
  );
}

function FilterChip({ label, value, active = false }: { label: string; value: number; active?: boolean }) {
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1.5 font-semibold ${active ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" : "border-slate-700 bg-slate-900/70 text-slate-400"}`}>
      {label} <span className="ml-1 text-slate-500">{value}</span>
    </span>
  );
}

function temperatureClass(temperature: ReturnType<typeof leadTemperature>) {
  return {
    New: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    Warm: "border-violet-300/20 bg-violet-300/10 text-violet-200",
    Hot: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    Won: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    Review: "border-slate-600/40 bg-slate-700/40 text-slate-300",
  }[temperature];
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
