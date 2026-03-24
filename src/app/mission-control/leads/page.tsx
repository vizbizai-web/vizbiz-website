export const dynamic = "force-dynamic";

import { getHubSpotLeads } from "../lib/hubspot-leads";
import type { HubSpotLead } from "../lib/hubspot-leads";

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function stageBadge(stage: string) {
  const s = stage.toLowerCase();
  let color = "bg-slate-700/60 text-slate-300 border-slate-600/50";
  let label = stage;

  if (s.includes("new") || s.includes("newlead") || s === "new_lead") {
    color = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    label = "New Lead";
  } else if (s.includes("call") || s.includes("booked")) {
    color = "bg-blue-500/15 text-blue-300 border-blue-500/30";
    label = "Call Booked";
  } else if (s.includes("qualified")) {
    color = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    label = "Qualified";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${color}`}
    >
      {label}
    </span>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string | null }) {
  return (
    <p className="text-sm leading-6 text-slate-400">
      <span className="text-slate-200">{label}:</span>{" "}
      {value ?? "—"}
    </p>
  );
}

function LeadCard({ lead }: { lead: HubSpotLead }) {
  const displayName =
    lead.companyName || lead.dealName || "Unknown Dealership";

  return (
    <article className="glass-card rounded-[2rem] p-6 sm:p-7">
      {/* Two-column body */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — deal / contact info */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="display-font text-2xl font-semibold text-white">
              {displayName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Deal: {lead.dealName}</p>
          </div>

          <dl className="space-y-2 text-sm leading-6 text-slate-400">
            {lead.contactName || lead.contactEmail || lead.contactPhone ? (
              <div>
                <dt className="inline text-slate-200">Contact: </dt>
                <dd className="inline">
                  {[lead.contactName, lead.contactEmail, lead.contactPhone]
                    .filter(Boolean)
                    .join(" | ")}
                </dd>
              </div>
            ) : null}

            {lead.companyWebsite && (
              <div>
                <dt className="inline text-slate-200">Website: </dt>
                <dd className="inline">
                  <a
                    href={
                      lead.companyWebsite.startsWith("http")
                        ? lead.companyWebsite
                        : `https://${lead.companyWebsite}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {lead.companyWebsite}
                  </a>
                </dd>
              </div>
            )}

            {lead.companyCity && (
              <div>
                <dt className="inline text-slate-200">City: </dt>
                <dd className="inline">{lead.companyCity}</dd>
              </div>
            )}

            <div>
              <dt className="inline text-slate-200">Submitted: </dt>
              <dd className="inline">{formatDate(lead.createdAt)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            {stageBadge(lead.dealStage)}
            <a
              href={`https://app.hubspot.com/contacts/343102280/deal/${lead.dealId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Open in HubSpot →
            </a>
          </div>
        </div>

        {/* RIGHT — Mini Snapshot */}
        <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
          <p className="section-kicker mb-4">Mini Snapshot</p>
          <div className="space-y-2">
            <SnapshotRow
              label="Appeared in prompts"
              value={lead.appearedInPrompts}
            />
            <SnapshotRow
              label="Overall AI Visibility"
              value={lead.overallVisibility}
            />
            <SnapshotRow
              label="Service Dept Visibility"
              value={lead.serviceDeptVisibility}
            />
            <SnapshotRow
              label="Competitor summary"
              value={lead.competitorSummary}
            />
          </div>
        </div>
      </div>

      {/* Draft email status row */}
      <div className="mt-5 flex items-center gap-3 border-t border-white/6 pt-4">
        <span className="text-sm text-slate-500">Snapshot Email:</span>
        <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-xs font-medium text-blue-300">
          Draft pending review
        </span>
      </div>
    </article>
  );
}

export default async function LeadsPage() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY;

  if (!token) {
    return (
      <div>
        <div className="mb-8">
          <p className="section-kicker">Pipeline</p>
          <h1 className="display-font mt-2 text-3xl font-bold text-white">
            Leads
          </h1>
        </div>
        <div className="glass-card rounded-[2rem] p-6 text-sm text-slate-400">
          HubSpot not configured. Set{" "}
          <code className="rounded bg-slate-800 px-1 py-0.5 text-xs text-slate-300">
            HUBSPOT_ACCESS_TOKEN
          </code>{" "}
          in your Vercel environment variables.
        </div>
      </div>
    );
  }

  const leads = await getHubSpotLeads();

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div>
          <p className="section-kicker">Pipeline</p>
          <h1 className="display-font mt-2 text-3xl font-bold text-white">
            Leads
          </h1>
        </div>
        {leads.length > 0 && (
          <span className="mt-4 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-blue-500/20 px-2 text-sm font-semibold text-blue-300 border border-blue-500/30">
            {leads.length}
          </span>
        )}
      </div>

      {/* Lead cards */}
      <div className="space-y-5">
        {leads.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-6 text-sm text-slate-400">
            No leads yet. When a dealership submits the intake form, they&apos;ll
            appear here.
          </div>
        ) : (
          leads.map((lead) => <LeadCard key={lead.dealId} lead={lead} />)
        )}
      </div>
    </div>
  );
}
