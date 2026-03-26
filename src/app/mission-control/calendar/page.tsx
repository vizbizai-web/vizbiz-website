export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | Mission Control',
  description: 'Schedule and cron jobs',
  robots: { index: false, follow: false }
};

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  description: string;
  days: number[];
}

async function fetchCronJobs(): Promise<CronJob[]> {
  try {
    const res = await fetch('http://localhost:4222/api/cron/jobs', { 
      next: { revalidate: 0 },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    // Fallback mock jobs
    return [
      { id: '1', name: 'Morning briefing', schedule: '0 9 * * *', description: 'Daily 9am briefing', days: [0, 1, 2, 3, 4, 5, 6] },
      { id: '2', name: 'Competitor scan', schedule: '0 10 * * 1', description: 'Monday 10am competitor scan', days: [1] },
      { id: '3', name: 'Memory distill', schedule: '0 20 * * 0', description: 'Sunday 8pm memory distill', days: [0] },
    ];
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default async function CalendarPage() {
  const jobs = await fetchCronJobs();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const scheduledDays = new Set<number>();
  jobs.forEach(job => {
    job.days.forEach(day => {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, currentMonth, d);
        if (date.getDay() === day) {
          scheduledDays.add(d);
        }
      }
    });
  });

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

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
                aspect-square rounded-lg flex items-center justify-center text-sm relative
                ${day === null 
                  ? 'bg-transparent' 
                  : day === currentDate 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'bg-slate-800/30 text-slate-300 hover:bg-slate-800/50'
                }
              `}
            >
              {day}
              {day !== null && scheduledDays.has(day) && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Scheduled Jobs</h2>
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-800/50">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-lg">⏰</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{job.name}</h3>
                <p className="text-sm text-slate-400">{job.description}</p>
              </div>
              <div className="text-xs font-mono text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded">
                {job.schedule}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
