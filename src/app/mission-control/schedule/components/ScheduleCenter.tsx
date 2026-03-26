'use client';

import { useState } from 'react';
import { Schedule } from '../../lib/db';

interface ScheduleCenterProps {
  schedules: Schedule[];
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-yellow-500',
  error: 'bg-red-500'
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  error: 'Error'
};

export function ScheduleCenter({ schedules }: ScheduleCenterProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'error'>('all');

  const filteredSchedules = filter === 'all' 
    ? schedules 
    : schedules.filter(s => s.status === filter);

  const activeCount = schedules.filter(s => s.status === 'active').length;
  const pausedCount = schedules.filter(s => s.status === 'paused').length;
  const errorCount = schedules.filter(s => s.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center gap-4">
        <FilterButton 
          label="All" 
          count={schedules.length} 
          active={filter === 'all'} 
          onClick={() => setFilter('all')} 
        />
        <FilterButton 
          label="Active" 
          count={activeCount} 
          active={filter === 'active'} 
          onClick={() => setFilter('active')}
          dotColor="emerald"
        />
        <FilterButton 
          label="Paused" 
          count={pausedCount} 
          active={filter === 'paused'} 
          onClick={() => setFilter('paused')}
          dotColor="yellow"
        />
        <FilterButton 
          label="Error" 
          count={errorCount} 
          active={filter === 'error'} 
          onClick={() => setFilter('error')}
          dotColor="red"
        />
      </div>

      {/* Schedule List */}
      <div className="bg-[#111118] border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Job</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Schedule</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Status</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Last Run</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Runs</th>
                <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map(schedule => (
                <ScheduleRow key={schedule.id} schedule={schedule} />
              ))}
            </tbody>
          </table>
        </div>
        {filteredSchedules.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No schedules found
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ 
  label, 
  count, 
  active, 
  onClick, 
  dotColor 
}: { 
  label: string; 
  count: number; 
  active: boolean; 
  onClick: () => void;
  dotColor?: string;
}) {
  const dotClasses: Record<string, string> = {
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        active 
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {dotColor && <span className={`w-2 h-2 rounded-full ${dotClasses[dotColor]}`} />}
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
        {count}
      </span>
    </button>
  );
}

function ScheduleRow({ schedule }: { schedule: Schedule }) {
  const metadata = schedule.metadata || {};

  return (
    <tr className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
      <td className="py-4 px-6">
        <div>
          <p className="text-white font-medium">{schedule.name}</p>
          <p className="text-slate-500 text-sm">{schedule.description}</p>
        </div>
      </td>
      <td className="py-4 px-6">
        <code className="text-sm text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
          {schedule.cron_expression}
        </code>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[schedule.status]}`} />
          <span className="text-slate-300 text-sm">{statusLabels[schedule.status]}</span>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="text-slate-400 text-sm">
          {schedule.last_run 
            ? new Date(schedule.last_run * 1000).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : 'Never'
          }
        </span>
        {metadata.last_result && (
          <p className="text-slate-500 text-xs mt-1">{metadata.last_result}</p>
        )}
      </td>
      <td className="py-4 px-6">
        <span className="text-slate-300 text-sm">{schedule.run_count}</span>
        {schedule.error_count > 0 && (
          <span className="ml-2 text-red-400 text-xs">({schedule.error_count} errors)</span>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Run now"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title={schedule.status === 'active' ? 'Pause' : 'Resume'}
          >
            {schedule.status === 'active' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
