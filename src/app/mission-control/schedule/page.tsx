export const dynamic = 'force-dynamic';

import { ScheduleCenter } from './components/ScheduleCenter';
import { getSchedules } from '../lib/db';

export default async function SchedulePage() {
  const schedules = await getSchedules();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Schedule Center</h1>
        <p className="text-slate-400">Automated tasks and cron job management</p>
      </div>
      <ScheduleCenter schedules={schedules} />
    </div>
  );
}
