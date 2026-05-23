export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { listJson } from '@/lib/file-store';
import type { MiniLeadRecord } from '@/lib/lead-pipeline';
import { CommandCenter } from './components/CommandCenter';
import { buildMissionControlSnapshot } from './lib/mission-control-insights';

export default async function MissionControlPage() {
  const leads = await listJson<MiniLeadRecord>('mini-leads');
  const snapshot = buildMissionControlSnapshot(leads);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">VizBiz founder cockpit</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Command Center</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Real-time view of intakes, reports, CTA clicks, follow-ups, and the next actions that move VizBiz.ai toward revenue.
          </p>
        </div>
        <Link
          href="/#free-mini-report"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)]"
        >
          Open intake funnel
        </Link>
      </div>

      <CommandCenter snapshot={snapshot} />
    </div>
  );
}
