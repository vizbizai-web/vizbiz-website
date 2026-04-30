export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | Mission Control',
  description: 'Upcoming events, posts, and milestones',
  robots: { index: false, follow: false }
};

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'dogfood' | 'content' | 'client' | 'milestone' | 'recurring' | 'deadline';
  account?: string;
  description: string;
  status: 'pending' | 'ready' | 'done' | 'blocked';
}

const events: CalendarEvent[] = [
  // ==========================================
  // DOGFOOD HISTORY
  // ==========================================
  {
    id: 'dog1',
    title: '🟠 Baseline AVI: 9/100 (1/11 prompts)',
    date: '2026-04-09',
    time: '10:00 AM',
    type: 'dogfood',
    description: 'Initial VizBiz audit. Only appeared in 1 out of 11 prompts.',
    status: 'done',
  },
  {
    id: 'dog2',
    title: '🟠 Second audit: still 9/100',
    date: '2026-04-13',
    time: '10:00 AM',
    type: 'dogfood',
    description: 'Re-audit after initial fixes. No improvement yet.',
    status: 'done',
  },
  {
    id: 'dog3',
    title: '🟠 Authority content deployed (2 blog posts)',
    date: '2026-04-30',
    time: '4:00 PM',
    type: 'dogfood',
    description: 'Fix engine built and authority content deployed to vizbiz.ai',
    status: 'done',
  },

  // ==========================================
  // UPCOMING EVENTS
  // ==========================================
  {
    id: 'may1-reaudit',
    title: '🟠 Monthly Re-audit: VizBiz self-audit',
    date: '2026-05-01',
    time: '9:00 AM',
    type: 'dogfood',
    description: 'Full re-audit of VizBiz (Reko, DeepSeek V4 Flash)',
    status: 'pending',
  },
  {
    id: 'may1-content',
    title: '🔵 Content Calendar: Generate May content plan',
    date: '2026-05-01',
    time: '11:00 AM',
    type: 'content',
    description: 'Generate May content calendar (Pulse, Gemini 3 Flash)',
    status: 'pending',
  },
  {
    id: 'may5-post',
    title: '🔵 Authority Content: Weekly blog post',
    date: '2026-05-05',
    time: '10:00 AM',
    type: 'content',
    description: 'Weekly authority blog post (Forge, Devstral 2 123B)',
    status: 'pending',
  },
  {
    id: 'may12-post',
    title: '🔵 Authority Content: Weekly blog post',
    date: '2026-05-12',
    time: '10:00 AM',
    type: 'content',
    description: 'Weekly authority blog post',
    status: 'pending',
  },
  {
    id: 'may15-fix',
    title: '🟠 Fix Engine Dogfood: Run pipeline on VizBiz',
    date: '2026-05-15',
    time: '9:00 AM',
    type: 'dogfood',
    description: 'Run fix engine pipeline on VizBiz (Vlad, GLM-5.1)',
    status: 'pending',
  },
  {
    id: 'may19-post',
    title: '🔵 Authority Content: Weekly blog post',
    date: '2026-05-19',
    time: '10:00 AM',
    type: 'content',
    description: 'Weekly authority blog post',
    status: 'pending',
  },
  {
    id: 'may26-post',
    title: '🔵 Authority Content: Weekly blog post',
    date: '2026-05-26',
    time: '10:00 AM',
    type: 'content',
    description: 'Weekly authority blog post',
    status: 'pending',
  },
  {
    id: 'jun1-reaudit',
    title: '🟠 Monthly Re-audit (June)',
    date: '2026-06-01',
    time: '9:00 AM',
    type: 'dogfood',
    description: 'Monthly re-audit for June',
    status: 'pending',
  },

  // ==========================================
  // CLIENT PIPELINE
  // ==========================================
  {
    id: 'lead-artwow',
    title: '🟢 ArtWow (artwow.ca) — Free report delivered',
    date: '2026-04-28',
    type: 'client',
    description: 'Free report delivered at /report/artwow, status: lead',
    status: 'pending',
  },
  {
    id: 'lead-eadance',
    title: '🟢 EA Dance (eadance.ca) — Free report delivered',
    date: '2026-04-29',
    type: 'client',
    description: 'Free report delivered at /report/ea-dance, status: lead',
    status: 'pending',
  },
  {
    id: 'lead-venue',
    title: '🟢 Venue Experts — Free report delivered',
    date: '2026-04-30',
    type: 'client',
    description: 'Free report delivered at /report/venue-experts, status: lead',
    status: 'pending',
  },

  // ==========================================
  // RECURRING CRONS (Always Active)
  // ==========================================
  {
    id: 'cron-heartbeat',
    title: '⚪ Heartbeat check (every 4h)',
    date: '2026-04-30',
    type: 'recurring',
    description: 'Site uptime, intake health, mission control health',
    status: 'ready',
  },
  {
    id: 'cron-leadproc',
    title: '⚪ Lead processor (every 2h)',
    date: '2026-04-30',
    type: 'recurring',
    description: 'Checks CRM for new leads',
    status: 'ready',
  },
  {
    id: 'cron-sage-daily',
    title: '⚪ Sage daily intel',
    date: '2026-04-30',
    time: '6:00 AM',
    type: 'recurring',
    description: 'Daily Sage intel processing',
    status: 'ready',
  },
  {
    id: 'cron-sage-morning',
    title: '⚪ Sage morning replies',
    date: '2026-04-30',
    time: '7:30 AM',
    type: 'recurring',
    description: 'Mon-Sat: Sage morning reply targets',
    status: 'ready',
  },
  {
    id: 'cron-sage-midday',
    title: '⚪ Sage midday tweet draft',
    date: '2026-04-30',
    time: '12:14 PM',
    type: 'recurring',
    description: 'Mon-Sat: Sage midday tweet drafts',
    status: 'ready',
  },
  {
    id: 'cron-xmonitor',
    title: '⚪ X monitor (8AM/12PM/4PM/8PM)',
    date: '2026-04-30',
    type: 'recurring',
    description: 'X monitoring at key times',
    status: 'ready',
  },
];

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  'dogfood': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'content': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'client': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'milestone': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'recurring': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  'deadline': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

const statusIcons: Record<string, string> = {
  pending: '⏳',
  ready: '✅',
  done: '✅',
  blocked: '🚫',
};

export default function CalendarPage() {
  const today = new Date().toISOString().split('T')[0];

  // Group events by week
  const upcoming = events
    .filter((e) => e.date >= today || e.type === 'recurring')
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = events
    .filter((e) => e.date < today && e.type !== 'recurring')
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
        <p className="text-slate-400">X posts, Sage crons, dogfood scans, and deadlines</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Dogfood Events', value: events.filter((e) => e.type === 'dogfood').length, color: 'text-amber-400' },
          { label: 'Content Events', value: events.filter((e) => e.type === 'content').length, color: 'text-blue-400' },
          { label: 'Client Pipeline', value: events.filter((e) => e.type === 'client').length, color: 'text-emerald-400' },
          { label: 'Recurring Crons', value: events.filter((e) => e.type === 'recurring').length, color: 'text-slate-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111118] border border-slate-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <h2 className="text-xl font-semibold text-white mb-4">Upcoming & Active</h2>
      <div className="space-y-3">
        {upcoming.map((event) => {
          const colors = typeColors[event.type] || typeColors['deadline'];
          return (
            <div
              key={event.id}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-slate-400">
                      {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {event.time && ` · ${event.time}`}
                    </span>
                    {event.account && (
                      <span className="text-xs text-slate-500">{event.account}</span>
                    )}
                  </div>
                  <h3 className={`font-medium ${colors.text}`}>{event.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                </div>
                <div className="text-lg shrink-0">{statusIcons[event.status]}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past Events */}
      {past.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-white mb-4 mt-10">Completed</h2>
          <div className="space-y-3 opacity-60">
            {past.map((event) => {
              const colors = typeColors[event.type] || typeColors['deadline'];
              return (
                <div
                  key={event.id}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-400">
                          {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {event.time && ` · ${event.time}`}
                        </span>
                      </div>
                      <h3 className={`font-medium ${colors.text}`}>{event.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                    </div>
                    <div className="text-lg shrink-0">✅</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
