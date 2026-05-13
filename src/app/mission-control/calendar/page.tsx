'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  type: 'follow_up' | 'send_report' | 'demo' | 'check_payment' | 'approve_email' | 'review_lead' | 'fix_indexing' | 'post_content' | 'daily_check' | 'custom';
  leadId?: string;
  leadName?: string;
  done: boolean;
  createdAt: string;
  priority: 'critical' | 'high' | 'normal';
  source: 'morning_report' | 'pipeline' | 'standing' | 'manual';
}

const TASK_TYPES = {
  follow_up: { label: 'Follow Up', icon: '🔄', color: '#F59E0B' },
  send_report: { label: 'Send Report', icon: '📊', color: '#25D1F2' },
  demo: { label: 'Schedule Demo', icon: '📞', color: '#A855F7' },
  check_payment: { label: 'Check Payment', icon: '💰', color: '#22C55E' },
  approve_email: { label: 'Approve Email', icon: '✉️', color: '#A855F7' },
  review_lead: { label: 'Review Lead', icon: '📋', color: '#F59E0B' },
  fix_indexing: { label: 'Fix Indexing', icon: '🔍', color: '#EF4444' },
  post_content: { label: 'Post Content', icon: '📝', color: '#25D1F2' },
  daily_check: { label: 'Daily Check', icon: '✅', color: '#10B981' },
  custom: { label: 'Task', icon: '📌', color: '#64748B' },
};

const STORAGE_KEY = 'vizbiz-tasks-v2';
const SEEN_DEFAULTS_KEY = 'vizbiz-tasks-defaults-version';

// Default tasks that mirror ACTIVE-PRIORITIES and morning report items
const DEFAULT_TASKS: Omit<Task, 'id' | 'createdAt'>[] = [
  // Critical — Revenue
  { title: 'Approve outreach emails for 8 drafted leads', description: '8 leads have emails ready in the Email Hub. Zero sent, Day 46. Go to Emails → approve → send.', type: 'approve_email', dueDate: 'today', priority: 'critical', source: 'morning_report', done: false },
  { title: 'Review RAAD lead (pending)', description: 'RAAD home fragrance, NZ. Score 0/20. Free report ready. Approve or rerun?', type: 'review_lead', leadName: 'RAAD', leadId: 'VZB-MP1TK3NM', dueDate: 'today', priority: 'critical', source: 'pipeline', done: false },

  // Critical — Site
  { title: 'Request GSC indexing for all 22 pages', description: 'Only homepage indexed. 8 blog posts + 13 landing pages invisible to Google. Single biggest lever for dogfood score.', type: 'fix_indexing', dueDate: 'today', priority: 'critical', source: 'morning_report', done: false },

  // High — X/Twitter
  { title: 'Fresh X login — session 23+ days old', description: 'Browser session about to expire. Log in at x.com to refresh cookies, otherwise posting dies.', type: 'daily_check', dueDate: 'today', priority: 'high', source: 'morning_report', done: false },
  { title: 'Post 5 Sage reply drafts', description: 'Reply drafts ready for @AiBizit, @RiverCitiesHub, others. Session must be fresh first.', type: 'post_content', dueDate: 'today', priority: 'high', source: 'standing', done: false },

  // High — Pipeline
  { title: 'Draft emails for 5 approved leads', description: 'Bolton Kia, Network Logistics, Alchemy & Stone, Fleurish, Broken Bay — all approved, no emails drafted yet.', type: 'send_report', dueDate: 'tomorrow', priority: 'high', source: 'pipeline', done: false },

  // Normal — Site improvements
  { title: 'Add FAQ section to homepage with structured data', description: 'Dogfood score 39/100. FAQ block with schema markup will help AI citations.', type: 'custom', dueDate: '3days', priority: 'normal', source: 'morning_report', done: false },
  { title: 'Build "VizBiz vs Competitors" comparison page', description: 'Not on any "best AI visibility tools" list. Comparison page = citability.', type: 'custom', dueDate: '5days', priority: 'normal', source: 'standing', done: false },
  { title: 'Submit VizBiz to AI tool directories', description: 'Third-party mentions are the strongest AI visibility signal. Submit to directories + reach comparison article authors.', type: 'custom', dueDate: '5days', priority: 'normal', source: 'standing', done: false },

  // Standing — recurring
  { title: 'Check cron health', description: 'Run openclaw cron list. Fix any errors before moving on.', type: 'daily_check', dueDate: 'today', priority: 'normal', source: 'standing', done: false },
  { title: 'Check X notifications and mentions', description: 'Respond to any new interactions on @VizBizAI.', type: 'daily_check', dueDate: 'today', priority: 'normal', source: 'standing', done: false },
  { title: 'Wire Gmail API for hello@vizbiz.ai', description: 'Currently all emails are manual drafts. Gmail API = actual sending from MC.', type: 'custom', dueDate: '7days', priority: 'normal', source: 'standing', done: false },
];

const DEFAULTS_VERSION = '2026-05-12-v2';

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function injectDefaults(existing: Task[]): Task[] {
  if (typeof window === 'undefined') return existing;
  const seen = localStorage.getItem(SEEN_DEFAULTS_KEY);
  if (seen === DEFAULTS_VERSION) return existing;

  // Add defaults that don't already exist (by title match)
  const existingTitles = new Set(existing.map(t => t.title));
  const newTasks: Task[] = DEFAULT_TASKS
    .filter(d => !existingTitles.has(d.title))
    .map((d, i) => ({
      ...d,
      id: `default-${Date.now()}-${i}`,
      createdAt: new Date().toISOString(),
    }));

  const merged = [...newTasks, ...existing];
  saveTasks(merged);
  localStorage.setItem(SEEN_DEFAULTS_KEY, DEFAULTS_VERSION);
  return merged;
}

function resolveDue(due: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (due === 'today') return today;
  if (due === 'tomorrow') return new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (due === '3days') return new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  if (due === '5days') return new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
  if (due === '7days') return new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  return due;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newType, setNewType] = useState<Task['type']>('follow_up');
  const [newPriority, setNewPriority] = useState<Task['priority']>('normal');
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadId, setNewLeadId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'overdue' | 'today' | 'upcoming' | 'done'>('all');

  useEffect(() => {
    const loaded = loadTasks();
    const withDefaults = injectDefaults(loaded);
    setTasks(withDefaults);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const addTask = () => {
    if (!newTitle.trim() || !newDue) return;
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      dueDate: newDue,
      type: newType,
      priority: newPriority,
      leadName: newLeadName.trim() || undefined,
      leadId: newLeadId.trim() || undefined,
      done: false,
      createdAt: new Date().toISOString(),
      source: 'manual',
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setNewTitle(''); setNewDue(''); setNewType('follow_up'); setNewPriority('normal');
    setNewLeadName(''); setNewLeadId(''); setNewDesc('');
    setShowForm(false);
  };

  const toggleDone = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const filtered = tasks.filter(t => {
    if (filter === 'all') return !t.done;
    if (filter === 'critical') return !t.done && t.priority === 'critical';
    if (filter === 'overdue') return !t.done && t.dueDate < today;
    if (filter === 'today') return !t.done && t.dueDate <= today;
    if (filter === 'upcoming') return !t.done && t.dueDate > today;
    if (filter === 'done') return t.done;
    return true;
  }).sort((a, b) => {
    // Critical first, then by date
    const pOrder = { critical: 0, high: 1, normal: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    return a.dueDate.localeCompare(b.dueDate);
  });

  const overdue = tasks.filter(t => !t.done && t.dueDate < today).length;
  const dueToday = tasks.filter(t => !t.done && t.dueDate <= today).length;
  const upcoming = tasks.filter(t => !t.done && t.dueDate > today).length;
  const done = tasks.filter(t => t.done).length;
  const critical = tasks.filter(t => !t.done && t.priority === 'critical').length;

  const formatDue = (date: string) => {
    if (date === today) return 'Today';
    if (date === tomorrow) return 'Tomorrow';
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sourceBadge = (source: Task['source']) => {
    if (source === 'morning_report') return { label: 'Morning Report', color: '#F59E0B' };
    if (source === 'pipeline') return { label: 'Pipeline', color: '#25D1F2' };
    if (source === 'standing') return { label: 'Standing', color: '#10B981' };
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-sm text-slate-300 uppercase tracking-widest font-semibold">Tasks</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Action Items</h1>
          <p className="text-slate-400 mt-1 text-base">{tasks.filter(t => !t.done).length} open • from morning report, pipeline & standing orders</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="text-sm px-4 py-2 rounded-lg border font-medium flex-shrink-0 transition-colors"
          style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
          + New Task
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MiniStat label="Critical" value={critical} color="#EF4444" />
        <MiniStat label="Due Today" value={dueToday} color="#F59E0B" />
        <MiniStat label="Overdue" value={overdue} color="#EF4444" />
        <MiniStat label="Upcoming" value={upcoming} color="#25D1F2" />
        <MiniStat label="Done" value={done} color="#22C55E" />
      </div>

      {/* New Task Form */}
      {showForm && (
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="text-base font-medium text-white">New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title..."
              className="bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" />
            <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
              className="bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600" />
          </div>
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)..." rows={2}
            className="w-full bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={newType} onChange={e => setNewType(e.target.value as Task['type'])}
              className="bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600">
              {Object.entries(TASK_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as Task['priority'])}
              className="bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600">
              <option value="critical">🔴 Critical</option>
              <option value="high">🟡 High</option>
              <option value="normal">⚪ Normal</option>
            </select>
            <input type="text" value={newLeadName} onChange={e => setNewLeadName(e.target.value)} placeholder="Business name"
              className="bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" />
            <input type="text" value={newLeadId} onChange={e => setNewLeadId(e.target.value)} placeholder="Lead ID"
              className="bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" />
          </div>
          <div className="flex gap-2">
            <button onClick={addTask} className="text-sm px-4 py-2 rounded-lg border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>Create Task</button>
            <button onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 glass-card rounded-lg p-1 w-fit" style={{ background: 'rgba(10,11,20,0.2)' }}>
        {(['all', 'critical', 'today', 'upcoming', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-3 py-2 rounded-md transition-colors ${filter === f ? 'bg-slate-800/50 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-slate-500 text-base">{filter === 'all' ? 'All done — create new tasks above' : `No ${filter} tasks`}</p>
          </div>
        )}

        {filtered.map(task => {
          const typeInfo = TASK_TYPES[task.type];
          const isOverdue = !task.done && task.dueDate < today;
          const isCritical = task.priority === 'critical';
          const src = sourceBadge(task.source);
          return (
            <div key={task.id} className={`glass-card rounded-xl p-4 flex items-start gap-3 transition-all ${task.done ? 'opacity-40' : isCritical ? 'ring-1 ring-red-500/30' : isOverdue ? 'ring-1 ring-amber-500/20' : ''}`}>
              {/* Checkbox */}
              <button onClick={() => toggleDone(task.id)}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border ${task.done ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800/50 border-slate-600 hover:border-slate-400'}`}>
                {task.done && <span className="text-emerald-400 text-xs">✓</span>}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base">{typeInfo.icon}</span>
                  <p className={`text-base ${task.done ? 'line-through text-slate-600' : 'text-white font-medium'}`}>{task.title}</p>
                  {isCritical && !task.done && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 font-medium">CRITICAL</span>}
                  {task.priority === 'high' && !task.done && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium">HIGH</span>}
                  {src && !task.done && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${src.color}15`, color: src.color, border: `1px solid ${src.color}25` }}>{src.label}</span>}
                </div>
                {task.description && !task.done && (
                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{task.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {task.leadName && (
                    task.leadId ? (
                      <Link href={`/mission-control/leads/${task.leadId}`} className="text-sm text-slate-300 hover:text-white transition-colors">📋 {task.leadName}</Link>
                    ) : (
                      <span className="text-sm text-slate-400">{task.leadName}</span>
                    )
                  )}
                  <span className={`text-sm font-medium ${isOverdue ? 'text-red-400' : task.dueDate <= today ? 'text-amber-400' : 'text-slate-400'}`}>
                    {formatDue(task.dueDate)}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => deleteTask(task.id)} className="text-slate-700 hover:text-red-400 transition-colors p-1 flex-shrink-0">✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-card rounded-xl p-3 text-center">
      <p className="text-xl sm:text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
