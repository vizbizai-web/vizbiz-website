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
  date: string; // ISO date
  time?: string;
  type: 'x-post' | 'x-thread' | 'dogfood' | 'milestone' | 'recurring' | 'deadline';
  account?: string;
  description: string;
  status: 'pending' | 'ready' | 'blocked';
}

// Today is April 14, 2026 (Tuesday)
const events: CalendarEvent[] = [
  // === WEEK 1: April 14-18 ===
  {
    id: 'p1',
    title: '🚀 First post: Ontario 11/100 scorecard',
    date: '2026-04-14',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Single tweet. Ontario dealerships average 11/100 AI visibility. 84 prompts, 252 data points.',
    status: 'ready',
  },
  {
    id: 'p2',
    title: '📝 JSON-LD schema tip',
    date: '2026-04-15',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Quick tip. Zero schema = invisible to AI. Add Organization + LocalBusiness + FAQPage.',
    status: 'ready',
  },
  {
    id: 'p3',
    title: '🧵 Dogfood thread: We scored ourselves 20/100',
    date: '2026-04-16',
    time: '8:30 AM',
    type: 'x-thread',
    account: '@VizBizAI',
    description: '6-tweet thread. Vulnerable opener, fixes deployed, honest +2 result, building in public.',
    status: 'ready',
  },
  {
    id: 'p4',
    title: '💬 ChatGPT Brampton challenge',
    date: '2026-04-17',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'ChatGPT recommended 5 dealerships in Brampton. None were the ones spending $15K/mo on ads.',
    status: 'ready',
  },
  {
    id: 'p5',
    title: '📝 Buyer questions tip',
    date: '2026-04-18',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Dealership websites answer zero buyer questions. No content = no AI citation.',
    status: 'ready',
  },
  // === WEEK 2: April 21-25 ===
  {
    id: 'p6',
    title: '🧵 "AI SEO" grift teardown',
    date: '2026-04-21',
    time: '8:30 AM',
    type: 'x-thread',
    account: '@VizBizAI',
    description: '5-tweet thread. How to spot fake AI SEO. Real vs grift. Red flags.',
    status: 'ready',
  },
  {
    id: 'p7',
    title: '📈 Building in public: Week 2 update',
    date: '2026-04-22',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Score still 22/100. Schema fixes live. Content going up. The gap between shipping and AI seeing it.',
    status: 'pending',
  },
  {
    id: 'p8',
    title: '📝 Google Business Profile tip',
    date: '2026-04-23',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'ChatGPT reads your GBP directly. Fix generic descriptions. Add brands, city, services.',
    status: 'ready',
  },
  {
    id: 'p9',
    title: '🧵 ChatGPT 5-city challenge',
    date: '2026-04-24',
    time: '8:30 AM',
    type: 'x-thread',
    account: '@VizBizAI',
    description: '4-tweet thread. ChatGPT recs in 5 Ontario cities. No correlation with reviews/inventory/tenure.',
    status: 'ready',
  },
  {
    id: 'p10',
    title: '📊 30% stat with implication',
    date: '2026-04-25',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: '30% of car buyers start with AI. Your ads reach the other 70%. AI visibility budget: $0.',
    status: 'ready',
  },
  // === Dogfood Milestones ===
  {
    id: 'd1',
    title: '🔍 Re-run VizBiz SaaS audit',
    date: '2026-04-28',
    time: '10:00 AM',
    type: 'dogfood',
    description: '2-week mark. Re-scan VizBiz with SaaS battery. Check if schema fixes moved the needle.',
    status: 'pending',
  },
  {
    id: 'd2',
    title: '🔍 Check Google index status',
    date: '2026-04-21',
    time: '9:00 AM',
    type: 'dogfood',
    description: 'Verify Google has re-indexed pages with new schema. Check Search Console for structured data errors.',
    status: 'pending',
  },
  {
    id: 'd3',
    title: '📊 Month-end VizBiz audit',
    date: '2026-05-01',
    type: 'milestone',
    description: 'Full 30-day re-audit. Compare 20→22→? Track index refresh impact. Update audit history.',
    status: 'pending',
  },
  // === Builder Account ===
  {
    id: 'b1',
    title: '🚀 Builder account first post',
    date: '2026-04-15',
    time: '12:00 PM',
    type: 'x-post',
    account: '@AlexBuildsAI',
    description: '"My entire company runs on AI agents." Intro post.',
    status: 'ready',
  },
  {
    id: 'b2',
    title: '🧵 $150/mo vs $15K/mo cost breakdown',
    date: '2026-04-17',
    time: '12:00 PM',
    type: 'x-thread',
    account: '@AlexBuildsAI',
    description: 'Thread. Full cost breakdown of running 5 AI agents vs hiring. Likely viral.',
    status: 'ready',
  },
  // === Recurring ===
  {
    id: 'r1',
    title: '🔄 Sage daily batch',
    date: '2026-04-14',
    type: 'recurring',
    description: 'Every weekday: Sage generates 3-5 draft posts for review. 20 min review cycle.',
    status: 'ready',
  },
  {
    id: 'r2',
    title: '🔄 Heartbeat check (every 4h)',
    date: '2026-04-14',
    type: 'recurring',
    description: 'Site uptime, intake health, mission control health. Auto via OpenClaw cron.',
    status: 'ready',
  },
  {
    id: 'r3',
    title: '🔄 Weekly building-in-public update',
    date: '2026-04-22',
    type: 'recurring',
    account: '@VizBizAI',
    description: 'Every Tuesday: post VizBiz score update, what was fixed, what\'s next.',
    status: 'pending',
  },
  // === Deadlines ===
  {
    id: 'dl1',
    title: '⏰ Create @VizBizAI account',
    date: '2026-04-14',
    type: 'deadline',
    description: 'Create X account, set up profile, add pinned tweet. Subscribe to Premium for creator payouts.',
    status: 'blocked',
  },
  {
    id: 'dl2',
    title: '⏰ Create @AlexBuildsAI account',
    date: '2026-04-15',
    type: 'deadline',
    description: 'Create builder account, set up profile, add pinned tweet.',
    status: 'blocked',
  },
  {
    id: 'dl3',
    title: '⏰ Submit VizBiz to AI directories',
    date: '2026-04-18',
    type: 'deadline',
    description: 'Submit vizbiz.ai to AI tool directories for backlinks and citations. Helps AI visibility.',
    status: 'pending',
  },
];

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  'x-post': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  'x-thread': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'dogfood': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'milestone': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'recurring': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'deadline': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

const statusIcons: Record<string, string> = {
  pending: '⏳',
  ready: '✅',
  blocked: '🚫',
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default async function CalendarPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Build map of day -> events
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  events.forEach(event => {
    const d = new Date(event.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    }
  });

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Separate upcoming events (today+) from recurring
  const upcomingEvents = events
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d.getDate() >= currentDate && e.type !== 'recurring';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const recurringEvents = events.filter(e => e.type === 'recurring');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <div className="text-sm text-slate-400">{monthName}</div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => (
            <div
              key={idx}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative cursor-default
                ${day === null 
                  ? 'bg-transparent' 
                  : day === currentDate 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'bg-slate-800/30 text-slate-300 hover:bg-slate-800/50'
                }
              `}
            >
              <span>{day}</span>
              {day !== null && eventsByDay[day] && (
                <div className="flex gap-0.5 mt-0.5">
                  {[...new Set(eventsByDay[day].map(e => e.type))].map((type, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        type === 'x-post' || type === 'x-thread' ? 'bg-sky-500' :
                        type === 'dogfood' ? 'bg-amber-500' :
                        type === 'milestone' ? 'bg-purple-500' :
                        type === 'deadline' ? 'bg-red-500' :
                        'bg-emerald-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-800/50">
          {[
            { label: 'X Post', color: 'bg-sky-500' },
            { label: 'Dogfood', color: 'bg-amber-500' },
            { label: 'Milestone', color: 'bg-purple-500' },
            { label: 'Deadline', color: 'bg-red-500' },
            { label: 'Recurring', color: 'bg-emerald-500' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Events */}
      {eventsByDay[currentDate] && eventsByDay[currentDate].length > 0 && (
        <div className="bg-[#111118] rounded-xl border border-blue-500/20 p-6">
          <h2 className="text-lg font-semibold text-blue-400 mb-4">📍 Today</h2>
          <div className="space-y-3">
            {eventsByDay[currentDate].map(event => {
              const colors = typeColors[event.type];
              return (
                <div key={event.id} className={`flex items-start gap-4 p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <div className="text-lg mt-0.5">{statusIcons[event.status]}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${colors.text}`}>{event.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                    {event.time && <span className="text-xs text-slate-500 mt-1 block">{event.time} ET</span>}
                  </div>
                  {event.account && (
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded shrink-0">{event.account}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">📅 Upcoming</h2>
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-slate-500 text-sm">No upcoming events this month</p>
          ) : (
            upcomingEvents.map(event => {
              const colors = typeColors[event.type];
              const d = new Date(event.date);
              const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <div key={event.id} className={`flex items-start gap-4 p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <div className="text-lg mt-0.5">{statusIcons[event.status]}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${colors.text}`}>{event.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                    <span className="text-xs text-slate-500 mt-1 block">{dayStr} {event.time ? `• ${event.time} ET` : ''}</span>
                  </div>
                  {event.account && (
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded shrink-0">{event.account}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recurring Events */}
      <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">🔄 Recurring</h2>
        <div className="space-y-3">
          {recurringEvents.map(event => {
            const colors = typeColors[event.type];
            return (
              <div key={event.id} className={`flex items-start gap-4 p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                <div className="text-lg mt-0.5">🔄</div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${colors.text}`}>{event.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
