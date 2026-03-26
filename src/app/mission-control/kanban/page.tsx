export const dynamic = 'force-dynamic';

import { KanbanBoard } from './components/KanbanBoard';
import { getMissions } from '../lib/db';

export default async function KanbanPage() {
  const missions = await getMissions();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Missions</h1>
          <p className="text-slate-400">Track objectives from backlog to completion</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Mission
        </button>
      </div>
      <KanbanBoard missions={missions} />
    </div>
  );
}
