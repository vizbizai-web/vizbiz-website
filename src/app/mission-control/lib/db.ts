import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;
let mockData: any = null;

// Check if we're in static export/build mode
const isStaticExport = process.env.NEXT_EXPORT === 'true' || process.env.NODE_ENV === 'production' && typeof window !== 'undefined';

// Mock data for static export
const mockMissions: Mission[] = [
  {
    id: 'mission-001',
    title: 'Launch AI Visibility Audit Service',
    description: 'Complete end-to-end audit service with intake → analysis → report delivery',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'vlad',
    due_date: null,
    created_at: 1709000000,
    updated_at: 1709000000,
    metadata: { target_date: '2026-03-15', progress: 65 }
  },
  {
    id: 'mission-002',
    title: 'VizBiz.ai SEO Dominance',
    description: 'Rank #1 for "AI visibility audit" and related keywords',
    status: 'planning',
    priority: 'high',
    assignee: 'vlad',
    due_date: null,
    created_at: 1709000000,
    updated_at: 1709000000,
    metadata: { target_date: '2026-04-01', progress: 30 }
  },
  {
    id: 'mission-003',
    title: 'Client Portal v1.0',
    description: 'Build and deploy client portal with dashboard, reports, and action items',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'architect',
    due_date: null,
    created_at: 1709000000,
    updated_at: 1709000000,
    metadata: { target_date: '2026-02-28', progress: 80 }
  },
  {
    id: 'mission-004',
    title: 'Auto Transport Brokerage MVP',
    description: 'Build intake system for car transport brokerage service',
    status: 'backlog',
    priority: 'medium',
    assignee: 'vlad',
    due_date: null,
    created_at: 1709000000,
    updated_at: 1709000000,
    metadata: { target_date: '2026-04-15', progress: 0 }
  },
  {
    id: 'mission-005',
    title: 'Content Engine Automation',
    description: 'Automated content creation pipeline with AI agents',
    status: 'review',
    priority: 'high',
    assignee: 'copywriter',
    due_date: null,
    created_at: 1709000000,
    updated_at: 1709000000,
    metadata: { target_date: '2026-02-20', progress: 90 }
  }
];

const mockSchedules: Schedule[] = [
  {
    id: 'cron-001',
    name: 'Daily AVI Score Check',
    description: 'Monitor VizBiz.ai AVI score daily at 9 AM',
    cron_expression: '0 9 * * *',
    last_run: 1709000000,
    next_run: 1709086400,
    status: 'active',
    run_count: 45,
    error_count: 0,
    last_error: null,
    metadata: { last_result: 'Score: 46/100' }
  },
  {
    id: 'cron-002',
    name: 'Weekly Report to Alex',
    description: 'Generate and send weekly progress report every Monday',
    cron_expression: '0 9 * * 1',
    last_run: 1708900000,
    next_run: 1709100000,
    status: 'active',
    run_count: 8,
    error_count: 0,
    last_error: null,
    metadata: { channel: 'telegram' }
  },
  {
    id: 'cron-003',
    name: 'Competitor Monitoring',
    description: 'Check competitor movements and AVI scores',
    cron_expression: '0 12 * * *',
    last_run: 1708950000,
    next_run: 1709036400,
    status: 'active',
    run_count: 45,
    error_count: 0,
    last_error: null,
    metadata: {}
  },
  {
    id: 'cron-004',
    name: 'Content Publishing Queue',
    description: 'Auto-publish scheduled content',
    cron_expression: '0 10 * * *',
    last_run: null,
    next_run: null,
    status: 'paused',
    run_count: 12,
    error_count: 0,
    last_error: null,
    metadata: {}
  },
  {
    id: 'cron-005',
    name: 'Database Backup',
    description: 'Export mission data to JSON backup',
    cron_expression: '0 2 * * *',
    last_run: 1708900000,
    next_run: 1708986000,
    status: 'active',
    run_count: 45,
    error_count: 0,
    last_error: null,
    metadata: { destination: 'git' }
  }
];

const mockAgentLogs: AgentLog[] = [
  { id: 1, agent_name: 'architect', action: 'completed_task', status: 'success', message: 'Built Mission Control dashboard Phase 1', metadata: null, created_at: 1709050000 },
  { id: 2, agent_name: 'vlad', action: 'deployed', status: 'success', message: 'Client portal UI components integrated', metadata: null, created_at: 1709040000 },
  { id: 3, agent_name: 'copywriter', action: 'published', status: 'success', message: 'Published "AI Visibility for Dealerships" article', metadata: null, created_at: 1708950000 },
  { id: 4, agent_name: 'researcher', action: 'analysis', status: 'warning', message: 'Competitor AVI scores rising - need strategy adjustment', metadata: null, created_at: 1708860000 },
  { id: 5, agent_name: 'vlad', action: 'created', status: 'success', message: 'New mission: Auto Transport Brokerage MVP', metadata: null, created_at: 1708770000 }
];

const mockAlerts: Alert[] = [
  { id: 1, type: 'critical', title: 'Mission Due Soon', message: 'Client Portal v1.0 due in 3 days (Feb 28)', source: 'system', acknowledged_at: null, created_at: 1709050000 },
  { id: 2, type: 'warning', title: 'Schedule Job Paused', message: 'Content Publishing Queue is paused - manual review needed', source: 'cron-004', acknowledged_at: null, created_at: 1709040000 },
  { id: 3, type: 'info', title: 'New Agent Joined', message: 'ARCHITECT agent deployed for Mission Control build', source: 'system', acknowledged_at: null, created_at: 1709030000 }
];

export function getDb(): Database.Database | null {
  // Return null for static export (use mock data instead)
  if (isStaticExport) return null;
  
  if (db) return db;
  
  try {
    const dbPath = process.env.MISSION_CONTROL_DB_PATH || './mission-control.db';
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    // Initialize schema
    const initSql = readFileSync(
      join(process.cwd(), 'src/app/mission-control/data/init.sql'), 
      'utf-8'
    );
    db.exec(initSql);
    
    return db;
  } catch (error) {
    console.warn('SQLite not available, using mock data');
    return null;
  }
}

// Mission types
export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'planning' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  due_date: number | null;
  created_at: number;
  updated_at: number;
  metadata: Record<string, any>;
}

export interface Task {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  due_date: number | null;
  created_at: number;
  completed_at: number | null;
}

export interface Schedule {
  id: string;
  name: string;
  description: string;
  cron_expression: string;
  last_run: number | null;
  next_run: number | null;
  status: 'active' | 'paused' | 'error';
  run_count: number;
  error_count: number;
  last_error: string | null;
  metadata: Record<string, any>;
}

export interface AgentLog {
  id: number;
  agent_name: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  metadata: Record<string, any> | null;
  created_at: number;
}

export interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  acknowledged_at: number | null;
  created_at: number;
}

// Query helpers
export function getMissions(status?: string): Mission[] {
  const database = getDb();
  if (!database) {
    if (status) {
      return mockMissions.filter(m => m.status === status) as Mission[];
    }
    return mockMissions as Mission[];
  }
  
  let sql = 'SELECT * FROM missions';
  if (status) {
    sql += ' WHERE status = ?';
    return database.prepare(sql).all(status) as Mission[];
  }
  return database.prepare(sql).all() as Mission[];
}

export function getMissionById(id: string): Mission | undefined {
  const database = getDb();
  if (!database) {
    return mockMissions.find(m => m.id === id) as Mission | undefined;
  }
  return database.prepare('SELECT * FROM missions WHERE id = ?').get(id) as Mission | undefined;
}

export function updateMissionStatus(id: string, status: string): void {
  const database = getDb();
  if (!database) {
    const mission = mockMissions.find(m => m.id === id);
    if (mission) {
      mission.status = status as Mission['status'];
      mission.updated_at = Math.floor(Date.now() / 1000);
    }
    return;
  }
  database.prepare('UPDATE missions SET status = ?, updated_at = strftime("%s", "now") WHERE id = ?')
    .run(status, id);
}

export function getTasks(missionId?: string): Task[] {
  const database = getDb();
  if (!database) return [];
  
  if (missionId) {
    return database.prepare('SELECT * FROM tasks WHERE mission_id = ?').all(missionId) as Task[];
  }
  return database.prepare('SELECT * FROM tasks').all() as Task[];
}

export function getSchedules(): Schedule[] {
  const database = getDb();
  if (!database) {
    return mockSchedules as Schedule[];
  }
  return database.prepare('SELECT * FROM schedules').all() as Schedule[];
}

export function getAgentLogs(limit: number = 20): AgentLog[] {
  const database = getDb();
  if (!database) {
    return mockAgentLogs.slice(0, limit) as AgentLog[];
  }
  return database.prepare('SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT ?').all(limit) as AgentLog[];
}

export function getAlerts(unacknowledgedOnly: boolean = true): Alert[] {
  const database = getDb();
  if (!database) {
    if (unacknowledgedOnly) {
      return mockAlerts.filter(a => a.acknowledged_at === null) as Alert[];
    }
    return mockAlerts as Alert[];
  }
  
  if (unacknowledgedOnly) {
    return database.prepare('SELECT * FROM alerts WHERE acknowledged_at IS NULL ORDER BY created_at DESC').all() as Alert[];
  }
  return database.prepare('SELECT * FROM alerts ORDER BY created_at DESC').all() as Alert[];
}

export function acknowledgeAlert(id: number): void {
  const database = getDb();
  if (!database) {
    const alert = mockAlerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged_at = Math.floor(Date.now() / 1000);
    }
    return;
  }
  database.prepare('UPDATE alerts SET acknowledged_at = strftime("%s", "now") WHERE id = ?').run(id);
}

// Stats for dashboard
export function getDashboardStats() {
  const database = getDb();
  
  if (!database) {
    const missionCounts = mockMissions.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      missionCounts,
      criticalAlerts: mockAlerts.filter(a => a.type === 'critical' && a.acknowledged_at === null).length,
      activeSchedules: mockSchedules.filter(s => s.status === 'active').length,
      recentActivity: mockAgentLogs.filter(l => l.created_at > Date.now() / 1000 - 86400).length
    };
  }
  
  const missionCounts = database.prepare(`
    SELECT status, COUNT(*) as count 
    FROM missions 
    GROUP BY status
  `).all() as { status: string; count: number }[];
  
  const criticalAlerts = database.prepare(`
    SELECT COUNT(*) as count 
    FROM alerts 
    WHERE type = 'critical' AND acknowledged_at IS NULL
  `).get() as { count: number };
  
  const activeSchedules = database.prepare(`
    SELECT COUNT(*) as count 
    FROM schedules 
    WHERE status = 'active'
  `).get() as { count: number };
  
  const recentActivity = database.prepare(`
    SELECT COUNT(*) as count 
    FROM agent_logs 
    WHERE created_at > strftime('%s', 'now', '-24 hours')
  `).get() as { count: number };
  
  return {
    missionCounts: missionCounts.reduce((acc, { status, count }) => {
      acc[status] = count;
      return acc;
    }, {} as Record<string, number>),
    criticalAlerts: criticalAlerts.count,
    activeSchedules: activeSchedules.count,
    recentActivity: recentActivity.count
  };
}
