'use client';

import { useState } from 'react';
import { Mission } from '../../lib/db';

interface KanbanBoardProps {
  missions: Mission[];
}

const columns = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-500' },
  { id: 'planning', label: 'Planning', color: 'border-blue-500' },
  { id: 'in_progress', label: 'In Progress', color: 'border-yellow-500' },
  { id: 'review', label: 'Review', color: 'border-purple-500' },
  { id: 'done', label: 'Done', color: 'border-emerald-500' },
];

const priorityDots: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-500'
};

export function KanbanBoard({ missions }: KanbanBoardProps) {
  const [draggedMission, setDraggedMission] = useState<Mission | null>(null);

  const handleDragStart = (mission: Mission) => {
    setDraggedMission(mission);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!draggedMission || draggedMission.status === status) return;

    // Optimistic update would go here
    await fetch(`/mission-control/api/missions/${draggedMission.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    window.location.reload();
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map(column => {
        const columnMissions = missions.filter(m => m.status === column.id);
        
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${column.color}`}>
              <h3 className="font-semibold text-white">{column.label}</h3>
              <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-full">
                {columnMissions.length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[200px]">
              {columnMissions.map(mission => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onDragStart={() => handleDragStart(mission)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MissionCard({ mission, onDragStart }: { mission: Mission; onDragStart: () => void }) {
  const metadata = mission.metadata || {};
  const progress = metadata.progress || 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-[#111118] border border-slate-800/50 rounded-lg p-4 cursor-move hover:border-slate-700 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-white font-medium text-sm leading-snug">{mission.title}</h4>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${priorityDots[mission.priority]}`} />
      </div>
      
      {progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-400">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs text-white font-medium">
            {mission.assignee?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-slate-500">@{mission.assignee}</span>
        </div>
        {mission.due_date && (
          <span className="text-xs text-slate-500">
            {new Date(mission.due_date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
