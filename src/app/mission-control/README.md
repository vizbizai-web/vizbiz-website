# VizBiz Mission Control

Internal operator dashboard for VizBiz.ai.

Mission Control is for verified VizBiz operations only:

- Lead pipeline from the real VizBiz lead adapter (`getAllLeads`).
- Report review and lead actions through the production VizBiz action routes.
- Email draft counts generated from real lead statuses.
- Honest unavailable states when a source is not connected.

## Non-negotiable integrity rule

Do not ship, demo, or describe Mission Control as working if a panel is backed by placeholder arrays, canned demo rows, legacy project files, or a TODO stub.

If data is unavailable, show an explicit unavailable state and the missing integration. Do not silently return empty dashboards.

## Development

```bash
npm install
npm run dev
```

## Authentication

Set `MISSION_CONTROL_PASSWORD` in `.env.local` and in Vercel production before exposing the route.

```bash
MISSION_CONTROL_PASSWORD=your-secure-password-here
```

## Current production routes

- `/mission-control/` — VizBiz control center
- `/mission-control/leads` — real lead pipeline
- `/mission-control/leads/[leadId]` — individual lead review/action surface
- `/mission-control/emails` — email hub generated from real lead statuses
- `/mission-control/calendar` — local operator task list
- `/mission-control/visibility-engine` — VizBiz SEO/GEO/AEO operating surface
- `/mission-control/settings` — internal settings/status

## API contract

Mission Control APIs are allowed to be wrappers, but they must terminate in real VizBiz sources:

- `/mission-control/api/pipeline-status` → `@/lib/google-sheets#getAllLeads`
- `/mission-control/api/lead-actions` → production `/api/lead-actions`
- `/mission-control/api/email-drafts` → real lead statuses from `getAllLeads`

No legacy SQLite mission schema. No generic agent roster. No old workspace memory feed.
