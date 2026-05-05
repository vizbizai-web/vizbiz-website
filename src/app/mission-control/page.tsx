export const dynamic = 'force-dynamic';

import { CommandCenter } from './components/CommandCenter';
import { getDashboardStats, getAlerts, getAgentLogs } from './lib/db';

export default async function MissionControlPage() {
  const [stats, alerts, logs] = await Promise.all([
    getDashboardStats(),
    getAlerts(true),
    getAgentLogs(5)
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
        <p className="text-slate-400">Today&apos;s priorities, alerts, and quick stats</p>
      </div>
      <CommandCenter stats={stats} alerts={alerts} logs={logs} />
    </div>
  );
}
