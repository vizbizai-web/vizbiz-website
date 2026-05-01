'use client';

import { useState } from 'react';
import { Alert, AgentLog } from '../lib/file-data';

interface DashboardStats {
  missionCounts: Record<string, number>;
  criticalAlerts: number;
  activeSchedules: number;
  recentActivity: number;
}

interface CommandCenterProps {
  stats: DashboardStats;
  alerts: Alert[];
  logs: AgentLog[];
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-cyan-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  low: 'bg-slate-500',
  medium: 'bg-slate-400'
};

const statusColors: Record<string, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500'
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CommandCenter({ stats, alerts, logs }: CommandCenterProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  const handleDismiss = async (id: number) => {
    setDismissedAlerts(prev => [...prev, id]);
    await fetch(`/mission-control/api/alerts/${id}/acknowledge`, { method: 'POST' });
  };

  const totalMissions = Object.values(stats.missionCounts).reduce((a, b) => a + b, 0);
  const inProgressMissions = stats.missionCounts.in_progress || 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Missions"
          value={totalMissions}
          subtitle={`${inProgressMissions} in progress`}
          icon="🎯"
          color="blue"
        />
        <StatCard
          title="Active Schedules"
          value={stats.activeSchedules}
          subtitle={`${stats.activeSchedules} crons active`}
          icon="⏰"
          color="emerald"
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          subtitle={stats.criticalAlerts > 0 ? 'Needs attention' : 'All clear'}
          icon="🔔"
          color={stats.criticalAlerts > 0 ? 'red' : 'slate'}
        />
        <StatCard
          title="24h Activity"
          value={stats.recentActivity}
          subtitle="Agent actions"
          icon="⚡"
          color="indigo"
        />
      </div>

      {/* X Accounts & AVI Status */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            VizBiz AVI Score
          </h2>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-cyan-400">9</span>
            <span className="text-slate-500 text-lg mb-1">/100</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">Latest audit Apr 9 — Re-audit May 1</p>
          <div className="mt-3 h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: '22%' }} />
          </div>
        </div>

        <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🐦</span>
            X Accounts
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">@VizBizAI</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">@AlexBuildsAI</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">Ready</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📝</span>
            Content Engine
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Blog Posts Deployed</span>
              <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded-full">2 posts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Active Crons</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">4 crons</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">👥</span>
            Client Pipeline
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">ArtWow</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">Lead</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">EA Dance</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">Lead</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Venue Experts</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">Lead</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Priority Missions */}
        <div className="col-span-2 bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-xl">🚨</span>
              Priority Missions
            </h2>
            <a 
              href="/mission-control/kanban/" 
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all →
            </a>
          </div>
          <div className="space-y-3">
            <MissionPreview title="VizBiz Fix Engine Deployment" assignee="vlad" progress={75} dueIn="2 days" />
            <MissionPreview title="Content Engine Crons" assignee="forge" progress={100} dueIn="Complete" />
            <MissionPreview title="Client Pipeline Automation" assignee="pulse" progress={50} dueIn="7 days" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <QuickActionButton 
              label="New Mission" 
              icon="➕" 
              href="/mission-control/kanban?action=new/" 
            />
            <QuickActionButton 
              label="View Agent Logs" 
              icon="📊" 
              href="/mission-control/agents/" 
            />
            <QuickActionButton 
              label="Check Schedules" 
              icon="📅" 
              href="/mission-control/schedule/" 
            />
            <QuickActionButton 
              label="VizBiz Website" 
              icon="🌐" 
              href="https://vizbiz.ai" 
              external 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-xl">🔔</span>
              Active Alerts
              {activeAlerts.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                  {activeAlerts.length}
                </span>
              )}
            </h2>
          </div>
          <div className="space-y-3">
            {activeAlerts.length === 0 ? (
              <EmptyState message="No active alerts" />
            ) : (
              activeAlerts.slice(0, 5).map(alert => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onDismiss={() => handleDismiss(alert.id)} 
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Recent Activity
          </h2>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <EmptyState message="No recent activity" />
            ) : (
              logs.map(log => (
                <ActivityItem key={log.id} log={log} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
    red: 'from-red-500/20 to-red-600/10 text-red-400',
    slate: 'from-slate-500/20 to-slate-600/10 text-slate-400',
    indigo: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400'
  };

  return (
    <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MissionPreview({ title, assignee, progress, dueIn }: {
  title: string;
  assignee: string;
  progress: number;
  dueIn: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">@{assignee}</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-500">{dueIn}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-slate-400 w-10 text-right">{progress}%</span>
      </div>
    </div>
  );
}

function QuickActionButton({ label, icon, href, external }: {
  label: string;
  icon: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors group"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-slate-300 group-hover:text-white transition-colors">{label}</span>
      {external && (
        <svg className="w-4 h-4 text-slate-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </a>
  );
}

function AlertCard({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  return (
    <div className={`p-4 rounded-lg border ${
      alert.type === 'critical' 
        ? 'bg-red-500/10 border-red-500/30' 
        : alert.type === 'warning'
        ? 'bg-yellow-500/10 border-yellow-500/30'
        : 'bg-blue-500/10 border-blue-500/30'
    }`}>
      <div className="flex items-start gap-3">
        <span className={`w-2 h-2 rounded-full mt-2 ${priorityColors[alert.type]}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${
            alert.type === 'critical' ? 'text-red-400' : 
            alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
          }`}>
            {alert.title}
          </h3>
          <p className="text-slate-400 text-sm mt-1">{alert.message}</p>
          <p className="text-slate-600 text-xs mt-2">{formatTime(alert.created_at)}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ log }: { log: AgentLog }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/20 rounded-lg">
      <span className={`w-2 h-2 rounded-full mt-2 ${statusColors[log.status]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">@{log.agent_name}</span>
          <span className="text-slate-500 text-sm">{log.action}</span>
        </div>
        <p className="text-slate-400 text-sm mt-0.5">{log.message}</p>
        <p className="text-slate-600 text-xs mt-1">{formatTime(log.created_at)}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-slate-500">
      <p>{message}</p>
    </div>
  );
}
