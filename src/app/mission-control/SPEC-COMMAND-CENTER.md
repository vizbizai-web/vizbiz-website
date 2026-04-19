# Forge Task: Rewrite MC Command Center — File-Based Data

## Problem
Mission Control Command Center (`/mission-control/`) runs on hardcoded mock data from February 2026. The `db.ts` file has `mockMissions`, `mockSchedules`, `mockAgentLogs`, `mockAlerts` — all stale. SQLite is unused in practice (no real writes happening).

Other MC pages already work correctly by reading live files:
- **Activity** (`/mission-control/activity/`) → reads `memory/YYYY-MM-DD.md` ✅
- **X Strategy** (`/mission-control/x-strategy/`) → reads live `.md` files ✅
- **Calendar** (`/mission-control/calendar/`) → hardcoded but recently updated ✅

## Task
Rewrite the Command Center homepage to read from real files instead of mock data. Replace `db.ts` with a file-based data layer.

## Architecture

### New file: `src/app/mission-control/lib/file-data.ts`

This replaces `db.ts` as the data source for the Command Center. It reads and parses:

#### 1. Missions → from `ACTIVE-PRIORITIES.md`
Parse the file for sections that look like projects/missions. Each section heading or bold item with context about a project becomes a mission. Extract:
- `title` — the project name
- `status` — infer from keywords: "blocked" → blocked, "in progress" / "active" → in_progress, "done" / "complete" → done, "pending" → planning, otherwise backlog
- `priority` — infer from emoji or keywords: 🚨/critical → critical, high/important → high, otherwise medium
- `assignee` — look for @vlad, @forge, @reko, @pulse, @gekko mentions
- `description` — the text under the heading
- `progress` — look for percentage patterns like "65%" or "progress: 0.65"
- `due_date` — look for date patterns

If ACTIVE-PRIORITIES.md can't be parsed cleanly, create sensible defaults based on what's in the file. The file location is: `/Users/vlad/.openclaw/workspace/ACTIVE-PRIORITIES.md`

#### 2. Alerts → from `ACTIVE-PRIORITIES.md` + `DAILY-STATUS.md`
- Parse `ACTIVE-PRIORITIES.md` for any lines with 🚨, blocked, or "needs attention"
- Parse `DAILY-STATUS.md` for "Blockers" section
- Each blocker or flagged item becomes an alert
- Types: 🚨 → critical, "blocked" → error, "warning" → warning, everything else → info
- File locations: `/Users/vlad/.openclaw/workspace/ACTIVE-PRIORITIES.md`, `/Users/vlad/.openclaw/workspace/DAILY-STATUS.md`

#### 3. Schedules → hardcoded from known crons
No cron files to parse. Just define the known active schedules:
```
[
  { name: "VizBiz Heartbeat", cron: "Every 4 hours", status: "active" },
  { name: "Context Sync", cron: "Every 4 hours", status: "active" },
  { name: "Sage Sunday Dump", cron: "Sun 9:00 AM ET", status: "active" },
  { name: "Sage Morning Replies", cron: "Mon-Sat 7:30 AM ET", status: "active" },
  { name: "Sage Friday Feedback", cron: "Fri 5:00 PM ET", status: "active" },
]
```

#### 4. Agent Logs / Recent Activity → from `memory/YYYY-MM-DD.md`
Reuse the same pattern as `activity/page.tsx` already does. Parse the most recent daily memory files for bullet-point events. Each bullet becomes an agent log entry. Look for agent name mentions (Vlad, Forge, Reko, Pulse, Gekko) to assign agent_name. Files at: `/Users/vlad/.openclaw/workspace/memory/YYYY-MM-DD.md`

#### 5. Stats → computed from above
- `missionCounts` — count missions by status
- `criticalAlerts` — count alerts with type=critical
- `activeSchedules` — count schedules with status=active
- `recentActivity` — count log entries from last 24h

### Types
Keep the existing TypeScript interfaces from `db.ts` (Mission, Schedule, AgentLog, Alert, etc.) — just move them to the new file or a shared types file. Remove the SQLite and mock data dependencies.

### Updated: `src/app/mission-control/page.tsx`
Change imports from `./lib/db` to `./lib/file-data`. The component structure stays the same — `CommandCenter` still receives stats, alerts, logs.

### Updated: `src/app/mission-control/components/CommandCenter.tsx`
May need minor prop type adjustments if the data shape changes slightly.

## What NOT to touch
- `activity/` — already works, don't break it
- `x-strategy/` — already works
- `calendar/` — already works
- `lib/db.ts` — keep it for now (other pages might import from it), but the Command Center should no longer use it

## Constraints
- Must work in Next.js with `export const dynamic = 'force-dynamic'` (server-side)
- Must work both locally (npm run dev) and deployed on Vercel
- File paths must use `process.cwd()` relative paths or absolute paths from env
- No new npm packages needed — just `fs` (already used in activity page)
- The Vercel deployment needs file access — since files are in the workspace, for Vercel we should fall back gracefully (empty data rather than crashes)

## Testing
After building, verify:
1. `curl localhost:3000/mission-control/` returns 200
2. Missions show real data from ACTIVE-PRIORITIES.md
3. Alerts show real blockers
4. Recent Activity shows today's events from memory/2026-04-18.md
5. Stats compute correctly

## Files to modify
- `src/app/mission-control/lib/file-data.ts` — NEW (file-based data layer)
- `src/app/mission-control/page.tsx` — update imports
- `src/app/mission-control/components/CommandCenter.tsx` — minor prop adjustments if needed

## Deliverable
Working MC Command Center that reads from real files. No mock data. No SQLite dependency for the homepage.
