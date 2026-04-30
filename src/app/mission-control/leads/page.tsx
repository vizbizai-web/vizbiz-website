export const dynamic = "force-dynamic";

interface Lead {
  id: string;
  companyName: string;
  companyWebsite: string;
  companyCity: string;
  dealStage: string;
  createdAt: string;
  reportUrl: string;
}

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
      <span className="text-slate-200">{label}:</span> {value ?? "—"}
    </p>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const displayName = lead.companyName || "Unknown Company";

  return (
    <article className="glass-card rounded-[2rem] p-6 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="display-font text-2xl font-semibold text-white">
              {displayName}
            </h2>
          </div>

          <dl className="space-y-2 text-sm leading-6 text-slate-400">
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
              href={lead.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              View Report →
            </a>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
          <p className="section-kicker mb-4">Mini Snapshot</p>
          <div className="space-y-2">
            <SnapshotRow label="Status" value="Free report delivered" />
            <SnapshotRow label="Type" value="Lead" />
            <SnapshotRow label="Next Action" value="Follow up" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function LeadsPage() {
  // Static data for the 3 real leads
  const leads: Lead[] = [
    {
      id: "1",
      companyName: "ArtWow",
      companyWebsite: "artwow.ca",
      companyCity: "Toronto, ON",
      dealStage: "new_lead",
      createdAt: "2026-04-28T10:00:00Z",
      reportUrl: "https://vizbiz.ai/report/artwow"
    },
    {
      id: "2",
      companyName: "EA Dance",
      companyWebsite: "eadance.ca",
      companyCity: "Toronto, ON",
      dealStage: "new_lead",
      createdAt: "2026-04-29T11:00:00Z",
      reportUrl: "https://vizbiz.ai/report/ea-dance"
    },
    {
      id: "3",
      companyName: "Venue Experts",
      companyWebsite: "thevenueexperts.com",
      companyCity: "Toronto, ON",
      dealStage: "new_lead",
      createdAt: "2026-04-30T12:00:00Z",
      reportUrl: "https://vizbiz.ai/report/venue-experts"
    }
  ];

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <div>
          <p className="section-kicker">Pipeline</p>
          <h1 className="display-font mt-2 text-3xl font-bold text-white">
            Leads
          </h1>
        </div>
        {leads.length > 0 && (
          <span className="mt-4 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 px-2 text-sm font-semibold text-blue-300">
            {leads.length}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {leads.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-6 text-sm text-slate-400">
            No leads yet. When a dealership submits the intake form, they'll
            appear here.
          </div>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
