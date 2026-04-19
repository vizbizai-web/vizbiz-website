import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Types (kept compatible with db.ts interfaces)
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

// Workspace root — files live in the openclaw workspace
const WS = join(process.cwd(), '..', '..');

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

// --- Parsers ---

function parseMissions(content: string): Mission[] {
  const missions: Mission[] = [];
  let id = 1;
  const now = Math.floor(Date.now() / 1000);

  // Extract numbered priorities from "Current Top Priorities" section
  const prioritiesMatch = content.match(/## Current Top Priorities[\s\S]*?(?=##|$)/);
  if (prioritiesMatch) {
    const section = prioritiesMatch[0];
    const lines = section.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Match numbered items like "3. **OPENAI_API_KEY setup** — add key..."
      const numMatch = trimmed.match(/^\d+\.\s+(.*)/);
      if (numMatch) {
        const text = numMatch[1];
        // Skip completed items (~~struck through~~)
        if (text.includes('~~')) continue;

        // Extract title from bold
        const boldMatch = text.match(/\*\*(.*?)\*\*/);
        const title = boldMatch ? boldMatch[1] : text.replace(/\*\*/g, '').split('—')[0].trim();
        const desc = text.replace(/\*\*.*?\*\*/, '').replace(/^[\s—]+/, '').trim();

        const status: Mission['status'] = 'in_progress';
        const priority: Mission['priority'] = 'high';

        // Look for assignee
        let assignee = 'vlad';
        if (/outreach|content|sage/i.test(title + desc)) assignee = 'pulse';
        if (/audit|research/i.test(title + desc)) assignee = 'reko';
        if (/build|page|site|integration/i.test(title + desc)) assignee = 'forge';

        missions.push({
          id: `mission-${String(id++).padStart(3, '0')}`,
          title,
          description: desc,
          status,
          priority,
          assignee,
          due_date: null,
          created_at: now,
          updated_at: now,
          metadata: { progress: 50 },
        });
      }
    }
  }

  // Extract "Current Next 3 Actions" as high-priority missions
  const next3Match = content.match(/## Current Next 3 Actions[\s\S]*?(?=##|$)/);
  if (next3Match) {
    const section = next3Match[0];
    const lines = section.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const numMatch = trimmed.match(/^\d+\.\s+(.*)/);
      if (numMatch) {
        const text = numMatch[1];
        const boldMatch = text.match(/\*\*(.*?)\*\*/);
        const title = boldMatch ? boldMatch[1] : text.split('—')[0].trim();
        const desc = text.replace(/\*\*.*?\*\*/g, '').replace(/^[\s—]+/, '').trim();

        missions.push({
          id: `mission-${String(id++).padStart(3, '0')}`,
          title,
          description: desc,
          status: 'in_progress',
          priority: 'critical',
          assignee: /api|key|connect/i.test(title) ? 'vlad' : 'pulse',
          due_date: null,
          created_at: now,
          updated_at: now,
          metadata: { progress: 30 },
        });
      }
    }
  }

  // If no missions parsed, create a sensible default from the project info
  if (missions.length === 0) {
    missions.push({
      id: 'mission-001',
      title: 'VizBiz — Continue Launch & Growth',
      description: 'AI visibility platform for automotive dealerships',
      status: 'in_progress',
      priority: 'high',
      assignee: 'vlad',
      due_date: null,
      created_at: now,
      updated_at: now,
      metadata: { progress: 60 },
    });
  }

  return missions;
}

function parseAlerts(prioritiesContent: string, statusContent: string): Alert[] {
  const alerts: Alert[] = [];
  let id = 1;
  const now = Math.floor(Date.now() / 1000);

  // From ACTIVE-PRIORITIES: blockers section
  const blockersMatch = prioritiesContent.match(/## Current Known Blockers[\s\S]*?(?=##|$)/);
  if (blockersMatch) {
    const lines = blockersMatch[0].split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('-')) continue;
      if (trimmed.includes('✅') || trimmed.includes('~~')) continue;

      const text = trimmed.replace(/^-\s*/, '');
      let type: Alert['type'] = 'warning';
      if (trimmed.includes('🚨')) type = 'critical';

      const colonIdx = text.indexOf('—');
      const title = colonIdx > 0 ? text.slice(0, colonIdx).trim() : text.slice(0, 60).trim();
      const message = colonIdx > 0 ? text.slice(colonIdx + 1).trim() : '';

      alerts.push({
        id: id++,
        type,
        title,
        message: message || text,
        source: 'ACTIVE-PRIORITIES.md',
        acknowledged_at: null,
        created_at: now,
      });
    }
  }

  // From DAILY-STATUS: blockers section
  const statusBlockers = statusContent.match(/## Blockers[\s\S]*?(?=##|$)/);
  if (statusBlockers) {
    const lines = statusBlockers[0].split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('-')) continue;
      if (trimmed.includes('✅') || trimmed.includes('~~')) continue;

      const text = trimmed.replace(/^-\s*/, '');
      alerts.push({
        id: id++,
        type: 'info',
        title: text.slice(0, 60),
        message: text,
        source: 'DAILY-STATUS.md',
        acknowledged_at: null,
        created_at: now,
      });
    }
  }

  // From ACTIVE-PRIORITIES: 🚨 items
  const lines = prioritiesContent.split('\n');
  for (const line of lines) {
    if (line.includes('🚨') && line.trim().startsWith('-')) {
      const text = line.replace(/^-\s*/, '').replace(/🚨\s*/g, '').trim();
      if (text.length > 5) {
        alerts.push({
          id: id++,
          type: 'critical',
          title: 'Needs Attention',
          message: text,
          source: 'ACTIVE-PRIORITIES.md',
          acknowledged_at: null,
          created_at: now,
        });
      }
    }
  }

  return alerts;
}

function parseAgentLogs(memoryDir: string, limit: number = 5): AgentLog[] {
  const AGENTS = ['Vlad', 'Forge', 'Reko', 'Pulse', 'Gekko'];
  const logs: AgentLog[] = [];
  let id = 1;

  let files: string[];
  try {
    files = readdirSync(memoryDir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse()
      .slice(0, 3);
  } catch {
    return [];
  }

  for (const f of files) {
    const content = safeRead(join(memoryDir, f));
    if (!content) continue;

    const dateStr = f.replace('.md', '');
    const dayTimestamp = Math.floor(new Date(dateStr + 'T12:00:00').getTime() / 1000);

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // Only bullet/numbered items
      if (!trimmed.match(/^[-*•]\s/) && !trimmed.match(/^\d+\.\s/)) continue;

      const text = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
      if (text.length < 10 || text.startsWith('#')) continue;
      // Skip completed items
      if (text.startsWith('~~')) continue;

      let agent = 'System';
      for (const a of AGENTS) {
        if (text.toLowerCase().includes(a.toLowerCase())) {
          agent = a.toLowerCase();
          break;
        }
      }

      let status: AgentLog['status'] = 'success';
      if (/fail|error|broken|blocker/i.test(text)) status = 'error';
      else if (/warn|stale|pending/i.test(text)) status = 'warning';

      let action = 'event';
      if (/fix|resolv|patch/i.test(text)) action = 'fixed';
      else if (/add|creat|built|ship|publish|post/i.test(text)) action = 'shipped';
      else if (/integrat|install|setup/i.test(text)) action = 'configured';
      else if (/scan|test|verif|check/i.test(text)) action = 'verified';

      logs.push({
        id: id++,
        agent_name: agent,
        action,
        status,
        message: text.length > 150 ? text.slice(0, 150) + '…' : text,
        metadata: null,
        created_at: dayTimestamp + id, // spread within day
      });
    }
  }

  return logs.slice(0, limit);
}

// --- Public API ---

const KNOWN_SCHEDULES: Schedule[] = [
  { id: 'cron-001', name: 'VizBiz Heartbeat', description: 'Every 4 hours', cron_expression: '0 */4 * * *', last_run: null, next_run: null, status: 'active', run_count: 0, error_count: 0, last_error: null, metadata: {} },
  { id: 'cron-002', name: 'Context Sync', description: 'Every 4 hours', cron_expression: '0 */4 * * *', last_run: null, next_run: null, status: 'active', run_count: 0, error_count: 0, last_error: null, metadata: {} },
  { id: 'cron-003', name: 'Sage Sunday Dump', description: 'Sun 9:00 AM ET', cron_expression: '0 9 * * 0', last_run: null, next_run: null, status: 'active', run_count: 0, error_count: 0, last_error: null, metadata: {} },
  { id: 'cron-004', name: 'Sage Morning Replies', description: 'Mon-Sat 7:30 AM ET', cron_expression: '30 7 * * 1-6', last_run: null, next_run: null, status: 'active', run_count: 0, error_count: 0, last_error: null, metadata: {} },
  { id: 'cron-005', name: 'Sage Friday Feedback', description: 'Fri 5:00 PM ET', cron_expression: '0 17 * * 5', last_run: null, next_run: null, status: 'active', run_count: 0, error_count: 0, last_error: null, metadata: {} },
];

export function getDashboardStats() {
  const priorities = safeRead(join(WS, 'ACTIVE-PRIORITIES.md')) || '';
  const status = safeRead(join(WS, 'DAILY-STATUS.md')) || '';
  const missions = parseMissions(priorities);
  const alerts = parseAlerts(priorities, status);

  const missionCounts = missions.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const memoryDir = join(WS, 'memory');
  const logs = parseAgentLogs(memoryDir, 20);
  const now = Math.floor(Date.now() / 1000);
  const recentActivity = logs.filter(l => l.created_at > now - 86400).length;

  return {
    missionCounts,
    criticalAlerts: alerts.filter(a => a.type === 'critical').length,
    activeSchedules: KNOWN_SCHEDULES.filter(s => s.status === 'active').length,
    recentActivity,
  };
}

export function getAlerts(_unacknowledgedOnly: boolean = true): Alert[] {
  const priorities = safeRead(join(WS, 'ACTIVE-PRIORITIES.md')) || '';
  const status = safeRead(join(WS, 'DAILY-STATUS.md')) || '';
  return parseAlerts(priorities, status);
}

export function getAgentLogs(limit: number = 5): AgentLog[] {
  const memoryDir = join(WS, 'memory');
  return parseAgentLogs(memoryDir, limit);
}

export function getMissions(): Mission[] {
  const priorities = safeRead(join(WS, 'ACTIVE-PRIORITIES.md')) || '';
  return parseMissions(priorities);
}

export function getSchedules(): Schedule[] {
  return KNOWN_SCHEDULES;
}
