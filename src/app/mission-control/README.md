# Mission Control Dashboard

Internal operations dashboard for VizBiz.ai

## Development

```bash
npm install
npm run dev
```

## Authentication

Set `MISSION_CONTROL_PASSWORD` in your `.env.local` file:

```
MISSION_CONTROL_PASSWORD=your-secure-password-here
```

## Structure

```
app/mission-control/
├── page.tsx              # Main dashboard (Command Center)
├── layout.tsx            # Auth wrapper + dark theme
├── kanban/page.tsx       # Missions Kanban board
├── agents/page.tsx       # Agent Roster
├── schedule/page.tsx     # Cron/Schedule Center
├── api/
│   ├── missions/route.ts # CRUD for missions
│   ├── tasks/route.ts    # Task management
│   └── schedule/route.ts # Schedule/cron data
├── components/
│   ├── CommandCenter.tsx # Today's priorities + alerts
│   ├── KanbanBoard.tsx   # Drag-drop kanban
│   ├── AgentCard.tsx     # Agent status cards
│   ├── ScheduleView.tsx  # Cron schedule viewer
│   └── Sidebar.tsx       # Navigation
├── lib/
│   ├── db.ts             # SQLite connection
│   └── auth.ts           # Auth utilities
└── data/
    └── init.sql          # Database schema
```

## Phase 1 Features

- [x] Command Center dashboard
- [x] Missions Kanban (5 columns)
- [x] Agent Roster with status
- [x] Schedule/Cron Center
- [x] Dark theme (Aionic-inspired)
- [x] Mobile responsive
- [x] Password protection
