import Link from 'next/link';
import type { MissionControlSnapshot, MissionControlMetric, MissionControlLeadSummary } from '../lib/mission-control-insights';

interface CommandCenterProps {
  snapshot: MissionControlSnapshot;
}

const toneClasses: Record<MissionControlMetric['tone'], string> = {
  cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200',
  emerald: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  amber: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
  violet: 'border-violet-300/20 bg-violet-300/10 text-violet-200',
  rose: 'border-rose-300/20 bg-rose-300/10 text-rose-200',
  slate: 'border-slate-600/40 bg-slate-800/40 text-slate-300',
};

const priorityToneClasses: Record<MissionControlSnapshot['priorities'][number]['tone'], string> = {
  cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200',
  emerald: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  amber: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
  violet: 'border-violet-300/20 bg-violet-300/10 text-violet-200',
  rose: 'border-rose-300/20 bg-rose-300/10 text-rose-200',
};

const temperatureClasses: Record<MissionControlLeadSummary['temperature'], string> = {
  New: 'bg-cyan-300/10 text-cyan-200 border-cyan-300/20',
  Warm: 'bg-violet-300/10 text-violet-200 border-violet-300/20',
  Hot: 'bg-amber-300/10 text-amber-200 border-amber-300/20',
  Won: 'bg-emerald-300/10 text-emerald-200 border-emerald-300/20',
  Review: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
};

export function CommandCenter({ snapshot }: CommandCenterProps) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {snapshot.metricCards.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Panel title="Today’s revenue priorities" eyebrow="What to do next" icon="🚦">
          <div className="space-y-3">
            {snapshot.priorities.map((priority) => (
              <Link
                key={priority.title}
                href={priority.href}
                className={`block rounded-2xl border p-4 transition hover:scale-[1.005] hover:bg-white/[0.06] ${priorityToneClasses[priority.tone]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{priority.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{priority.description}</p>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold sm:inline-flex">{priority.cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Quick actions" eyebrow="Founder shortcuts" icon="🎛️">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickAction label="Intake Inbox" helper="Review new leads" href="/mission-control/leads" icon="💼" />
            <QuickAction label="Tasks" helper="Follow-ups and launch work" href="/mission-control/tasks" icon="✅" />
            <QuickAction label="Content Studio" helper="Draft posts from research" href="/mission-control/content" icon="✍️" />
            <QuickAction label="X Research" helper="Find monetizable topics" href="/mission-control/research" icon="𝕏" />
            <QuickAction label="Settings" helper="Stripe, Resend, Sheets" href="/mission-control/settings" icon="⚙️" />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Hot leads" eyebrow="Report views + CTA intent" icon="🔥" action={{ label: 'Open all leads', href: '/mission-control/leads' }}>
          {snapshot.hotLeads.length === 0 ? (
            <EmptyState title="No hot leads yet" message="When someone views a report or clicks a paid CTA, they’ll appear here for fast follow-up." />
          ) : (
            <div className="space-y-3">
              {snapshot.hotLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
            </div>
          )}
        </Panel>

        <Panel title="Recent funnel activity" eyebrow="Latest intake movement" icon="📈">
          {snapshot.recentActivity.length === 0 ? (
            <EmptyState title="No funnel activity yet" message="Submit a free mini report to populate the intake timeline." />
          ) : (
            <div className="space-y-3">
              {snapshot.recentActivity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotClass(item.tone)}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Launch checklist" eyebrow="Production readiness" icon="🚀">
          <div className="space-y-3">
            {snapshot.launchChecklist.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-emerald-300 text-slate-950' : 'bg-amber-300 text-slate-950'}`}>
                  {item.done ? '✓' : '!'}
                </span>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.helper}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Growth engine ideas" eyebrow="Content → intake loop" icon="🧠">
          <div className="grid gap-3 sm:grid-cols-2">
            <Idea title="AI recommended your competitor because…" helper="Turn report gaps into educational X posts and mini teardowns." />
            <Idea title="Niche-specific proof posts" helper="Dentists, med spas, law firms, roofers, clinics, and home services each get their own angle." />
            <Idea title="Weekly AI visibility watch" helper="Track Google AI Overviews, ChatGPT recommendations, and local SEO conversations." />
            <Idea title="Lead magnet CTA" helper="Every post should point back to the free AVI mini report when it makes sense." />
          </div>
        </Panel>
      </section>
    </div>
  );
}

function MetricCard({ metric }: { metric: MissionControlMetric }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClasses[metric.tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
        <span className="text-2xl">{metric.icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{metric.value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{metric.helper}</p>
    </div>
  );
}

function Panel({ title, eyebrow, icon, action, children }: { title: string; eyebrow: string; icon: string; action?: { label: string; href: string }; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-800/60 bg-[#111118] p-4 shadow-[0_0_40px_rgba(15,23,42,0.22)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">{eyebrow}</p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white sm:text-xl"><span>{icon}</span>{title}</h2>
        </div>
        {action && <Link href={action.href} className="shrink-0 text-sm font-semibold text-cyan-300 hover:text-cyan-200">{action.label} →</Link>}
      </div>
      {children}
    </div>
  );
}

function QuickAction({ label, helper, href, icon }: { label: string; helper: string; href: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/10">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">{icon}</span>
      <span>
        <span className="block font-semibold text-white">{label}</span>
        <span className="text-sm text-slate-400">{helper}</span>
      </span>
    </Link>
  );
}

function LeadCard({ lead }: { lead: MissionControlLeadSummary }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{lead.name}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${temperatureClasses[lead.temperature]}`}>{lead.temperature}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{lead.city} · {lead.service}</p>
          <p className="mt-1 text-xs text-slate-500">{lead.email}</p>
        </div>
        <Link href={`/mini-report/${lead.reportSlug}`} className="rounded-xl bg-cyan-300 px-3 py-2 text-center text-sm font-bold text-slate-950 hover:bg-cyan-200">
          Open report
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div className="rounded-xl bg-slate-950/40 p-3"><span className="block text-xs text-slate-500">CTA clicks</span>{lead.ctaClicks}</div>
        <div className="rounded-xl bg-slate-950/40 p-3"><span className="block text-xs text-slate-500">Last product</span>{lead.lastProduct?.replaceAll('_', ' ') ?? 'None yet'}</div>
      </div>
    </div>
  );
}

function Idea({ title, helper }: { title: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-6 text-center">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function dotClass(tone: MissionControlSnapshot['recentActivity'][number]['tone']) {
  const classes = {
    cyan: 'bg-cyan-300',
    emerald: 'bg-emerald-300',
    amber: 'bg-amber-300',
    violet: 'bg-violet-300',
    rose: 'bg-rose-300',
    slate: 'bg-slate-400',
  };
  return classes[tone];
}
