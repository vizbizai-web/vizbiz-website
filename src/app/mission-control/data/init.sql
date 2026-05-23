-- Mission Control Database Schema
-- SQLite database for internal operations

-- Missions table (high-level objectives)
CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog', -- backlog, planning, in_progress, review, done
    priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    assignee TEXT,
    due_date INTEGER, -- Unix timestamp
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    metadata TEXT -- JSON string for flexible data
);

-- Tasks table (individual work items)
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    mission_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo', -- todo, in_progress, done
    priority TEXT NOT NULL DEFAULT 'medium',
    assignee TEXT,
    due_date INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- Schedule/Cron jobs tracking
CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cron_expression TEXT NOT NULL,
    last_run INTEGER,
    next_run INTEGER,
    status TEXT DEFAULT 'active', -- active, paused, error
    run_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    metadata TEXT -- JSON for job-specific config
);

-- Agent activity log
CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL, -- success, error, warning
    message TEXT,
    metadata TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Alerts and notifications
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- info, warning, error, critical
    title TEXT NOT NULL,
    message TEXT,
    source TEXT,
    acknowledged_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Seed data: Initial missions
INSERT OR IGNORE INTO missions (id, title, description, status, priority, assignee, metadata) VALUES
('mission-001', 'Launch Free AVI Mini-Report Funnel', 'Keep intake → instant score preview → emailed mini report → expanded report running cleanly', 'in_progress', 'critical', 'alex', '{"target_date": "2026-05-10", "progress": 80}'),
('mission-002', 'Wire Stripe + Resend Revenue Plumbing', 'Verify payment links, report-page CTA redirects, conversion tracking, and mini-report email delivery', 'in_progress', 'critical', 'alex', '{"target_date": "2026-05-11", "progress": 55}'),
('mission-003', 'Publish VizBiz.ai Landing Page', 'Merge the updated premium landing page into production vizbiz.ai without breaking Stripe or lead capture', 'planning', 'high', 'alex', '{"target_date": "2026-05-12", "progress": 45}'),
('mission-004', 'Build AI Visibility Content Engine', 'Turn X/social research, AI SEO trends, and niche teardowns into posts that drive free mini-report submissions', 'planning', 'high', 'alex', '{"target_date": "2026-05-15", "progress": 25}'),
('mission-005', 'Improve Mission Control Mobile Cockpit', 'Make lead review, follow-ups, tasks, content ideas, and integrations easy to run from a phone', 'review', 'medium', 'alex', '{"target_date": "2026-05-16", "progress": 70}');

-- Seed data: Schedule jobs
INSERT OR IGNORE INTO schedules (id, name, description, cron_expression, status, metadata) VALUES
('cron-001', 'Daily AVI Score Check', 'Monitor VizBiz.ai AVI score daily at 9 AM', '0 9 * * *', 'active', '{"last_result": "Score: 46/100"}'),
('cron-002', 'Weekly Report to Alex', 'Generate and send weekly progress report every Monday', '0 9 * * 1', 'active', '{"channel": "telegram"}'),
('cron-003', 'Competitor Monitoring', 'Check competitor movements and AVI scores', '0 12 * * *', 'active', '{}'),
('cron-004', 'Content Publishing Queue', 'Auto-publish scheduled content', '0 10 * * *', 'paused', '{}'),
('cron-005', 'Database Backup', 'Export mission data to JSON backup', '0 2 * * *', 'active', '{"destination": "git"}');

-- Seed data: Recent agent logs
INSERT OR IGNORE INTO agent_logs (agent_name, action, status, message, created_at) VALUES
('architect', 'completed_task', 'success', 'Built Mission Control dashboard Phase 1', strftime('%s', 'now') - 3600),
('alex', 'deployed', 'success', 'Updated VizBiz landing page and Mission Control cockpit', strftime('%s', 'now') - 7200),
('content', 'planned', 'success', 'Queued AI visibility teardown posts for niche lead magnets', strftime('%s', 'now') - 86400),
('researcher', 'analysis', 'warning', 'Competitor AVI scores rising - need strategy adjustment', strftime('%s', 'now') - 172800);

-- Seed data: Current alerts
INSERT OR IGNORE INTO alerts (type, title, message, source, created_at) VALUES
('warning', 'Revenue Plumbing Needed', 'Connect Stripe and Resend before production launch', 'system', strftime('%s', 'now') - 3600),
('warning', 'Schedule Job Paused', 'Content Publishing Queue is paused - manual review needed', 'cron-004', strftime('%s', 'now') - 7200),
('info', 'Founder Cockpit Updated', 'Mission Control now centers on leads, reports, content, and revenue', 'system', strftime('%s', 'now') - 10800);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON missions(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_mission_id ON tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged_at);
