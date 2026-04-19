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
  type: 'x-post' | 'x-thread' | 'dogfood' | 'milestone' | 'recurring' | 'deadline' | 'fix' | 'sage';
  account?: string;
  description: string;
  status: 'pending' | 'ready' | 'done' | 'blocked';
}

const events: CalendarEvent[] = [
  // ==========================================
  // WEEK 1: April 14-18 (Current Week)
  // ==========================================
  {
    id: 'p1',
    title: '🚀 First post: Ontario 11/100 scorecard',
    date: '2026-04-14',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Single tweet. Ontario dealerships average 11/100 AI visibility. 84 prompts, 252 data points.',
    status: 'done',
  },
  {
    id: 'p2',
    title: '📝 JSON-LD schema tip',
    date: '2026-04-15',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Quick tip. Zero schema = invisible to AI. Add Organization + LocalBusiness + FAQPage.',
    status: 'done',
  },
  {
    id: 'p3',
    title: '🧵 Dogfood thread: We scored ourselves 20/100',
    date: '2026-04-16',
    time: '8:30 AM',
    type: 'x-thread',
    account: '@VizBizAI',
    description: '6-tweet thread. Vulnerable opener, fixes deployed, honest +2 result, building in public.',
    status: 'done',
  },
  {
    id: 'p4',
    title: '💬 ChatGPT Brampton challenge',
    date: '2026-04-17',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'ChatGPT recommended 5 dealerships in Brampton. None were the ones spending $15K/mo on ads.',
    status: 'done',
  },
  {
    id: 'p5',
    title: '📝 Buyer questions tip',
    date: '2026-04-18',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Dealership websites answer zero buyer questions. No content = no AI citation.',
    status: 'done',
  },

  // ==========================================
  // Today's Work — April 18
  // ==========================================
  {
    id: 'fix1',
    title: '🔧 Fixed GSC redirect errors (4 pages)',
    date: '2026-04-18',
    time: '4:50 PM',
    type: 'fix',
    description: 'Root cause: missing trailing slashes on 25 internal links. Vercel 308 redirects. All validated in GSC.',
    status: 'done',
  },
  {
    id: 'fix2',
    title: '✅ Added Gemini to homepage (0→11 mentions)',
    date: '2026-04-18',
    time: '4:35 PM',
    type: 'fix',
    description: 'All platform references now include ChatGPT, Gemini, Google AI, Perplexity.',
    status: 'done',
  },
  {
    id: 'fix3',
    title: '🔥 Firecrawl integration complete',
    date: '2026-04-18',
    time: '4:30 PM',
    type: 'milestone',
    description: 'API key saved, CLI + 12 skills installed, full dogfood scan of all 8 pages. Replaces broken GLM-5.',
    status: 'done',
  },
  {
    id: 'fix4',
    title: '📝 Book-call page SEO content added',
    date: '2026-04-18',
    time: '4:40 PM',
    type: 'fix',
    description: '63→150 words. Added "What happens on the call", "Who it\'s for", "No pressure" sections.',
    status: 'done',
  },

  // ==========================================
  // WEEK 2: April 21-25
  // ==========================================
  {
    id: 'p6',
    title: '🧵 "AI SEO" grift teardown',
    date: '2026-04-21',
    time: '8:30 AM',
    type: 'x-thread',
    account: '@VizBizAI',
    description: '5-tweet thread. How to spot fake AI SEO. Real vs grift. Red flags: no scoring, no before/after, "we write articles".',
    status: 'ready',
  },
  {
    id: 'p7',
    title: '📈 Building in public: Week 2 update',
    date: '2026-04-22',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'Score still 22/100. Schema fixes live. Content going up. Gap between shipping and AI seeing it.',
    status: 'ready',
  },
  {
    id: 'p8',
    title: '📝 Google Business Profile tip',
    date: '2026-04-23',
    time: '8:30 AM',
    type: 'x-post',
    account: '@VizBizAI',
    description: 'ChatGPT reads your GBP directly. Fix generic descriptions. Add brands, city, services. Be specific.',
    status: 'ready',
  },
  {
    id: 'p9',
    title: '🧵 ChatGPT 5-city challenge',
    date: '2026-04-24',
    time: '8:30 AM',
    type: 'x-thread',
    account: '@VizBizAI',
    description: '4-tweet thread. ChatGPT recs in 5 Ontario cities. No correlation with reviews/inventory/tenure. Different game, different rules.',
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

  // ==========================================
  // WEEK 3: April 28+
  // ==========================================
  {
    id: 'd1',
    title: '🔍 Dogfood re-scan: 2-week mark',
    date: '2026-04-28',
    time: '10:00 AM',
    type: 'dogfood',
    description: 'Re-run VizBiz audit with Firecrawl. Check if schema fixes + Gemini additions moved the score.',
    status: 'pending',
  },
  {
    id: 'd3',
    title: '📊 Month-end VizBiz audit',
    date: '2026-05-01',
    time: '10:00 AM',
    type: 'milestone',
    description: 'Full 30-day re-audit. Compare 20→22→? Track index refresh impact.',
    status: 'pending',
  },

  // ==========================================
  // Sage Crons (Recurring)
  // ==========================================
  {
    id: 'sage1',
    title: '🔄 Sage Sunday Dump',
    date: '2026-04-20',
    time: '9:00 AM',
    type: 'sage',
    description: 'Every Sunday: 20 content ideas from X + Reddit. 8 subreddits monitored. Generates week\'s draft queue.',
    status: 'ready',
  },
  {
    id: 'sage2',
    title: '🔄 Sage Morning Replies',
    date: '2026-04-21',
    time: '7:30 AM',
    type: 'sage',
    description: 'Mon-Sat: 5 reply targets from X + Reddit. Trending conversations to engage with.',
    status: 'ready',
  },
  {
    id: 'sage3',
    title: '🔄 Sage Friday Feedback',
    date: '2026-04-25',
    time: '5:00 PM',
    type: 'sage',
    description: 'Every Friday: top/bottom performing posts analysis. What worked, what didn\'t, what to adjust.',
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

  // ==========================================
  // Deadlines & Action Items
  // ==========================================
  {
    id: 'dl1',
    title: '📌 Pin first tweet on X',
    date: '2026-04-19',
    type: 'deadline',
    description: 'Alex must manually pin. OpenTweet API cannot pin tweets.',
    status: 'blocked',
  },
  {
    id: 'dl2',
    title: '🖼️ Upload banner to X profile',
    date: '2026-04-19',
    type: 'deadline',
    description: 'Banner generated at vizbiz/banner.png. Alex must upload manually to X.',
    status: 'blocked',
  },
  {
    id: 'dl3',
    title: '👥 Follow 15-18 target accounts on X',
    date: '2026-04-19',
    type: 'deadline',
    description: 'Dealer marketing, AI SEO, local search accounts. Algorithm training.',
    status: 'pending',
  },
  {
    id: 'dl4',
    title: '💬 Set up Telegram channels',
    date: '2026-04-19',
    type: 'deadline',
    description: 'Forum-mode supergroup with topics: VizBiz, Trading Bot, General.',
    status: 'pending',
  },
  {
    id: 'dl5',
    title: '🎨 Design VizBiz logo',
    date: '2026-04-20',
    type: 'deadline',
    description: 'Try HTML/CSS approach (like banner). AI image generators keep producing gibberish text.',
    status: 'pending',
  },
  {
    id: 'dl6',
    title: '⏰ OpenTweet trial ends',
    date: '2026-04-25',
    type: 'deadline',
    description: 'Trial ends Apr 25. Decide: keep Pro ($11.99/mo) or upgrade Advanced ($24.99/mo) for analytics.',
    status: 'pending',
  },
  {
    id: 'dl7',
    title: '⏰ Submit VizBiz to AI directories',
    date: '2026-04-21',
    type: 'deadline',
    description: 'Submit vizbiz.ai to AI tool directories for backlinks and citations.',
    status: 'pending',
  },
  {
    id: 'dl8',
    title: '🔍 Check GSC validation results',
    date: '2026-04-25',
    type: 'deadline',
    description: '4 issues validated on 4/18. Check if Google has confirmed fixes.',
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
  'fix': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  'sage': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
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
    .filter((e) => e.date >= today || e.type === 'recurring' || e.type === 'sage')
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = events
    .filter((e) => e.date < today && e.type !== 'recurring' && e.type !== 'sage')
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
          { label: 'X Posts Done', value: events.filter((e) => (e.type === 'x-post' || e.type === 'x-thread') && e.status === 'done').length, color: 'text-sky-400' },
          { label: 'Upcoming Posts', value: events.filter((e) => (e.type === 'x-post' || e.type === 'x-thread') && e.status !== 'done').length, color: 'text-blue-400' },
          { label: 'Sage Crons', value: events.filter((e) => e.type === 'sage' || e.type === 'recurring').length, color: 'text-indigo-400' },
          { label: 'Deadlines', value: events.filter((e) => e.type === 'deadline').length, color: 'text-red-400' },
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
