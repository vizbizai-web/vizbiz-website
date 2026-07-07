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

## Report review quality rule

Mission Control report previews, email previews, approve/send buttons, and needs-fix workflows must follow `../../docs/launch/report-quality-architecture-reset.md`.

Mission Control must show enough operator evidence to approve or block a report without guessing:

- `ClientReportPayload` status/version
- `NicheResolution` category, confidence, and source priority
- competitor mode: `client_only` or `client_provided`
- competitor provenance: client-supplied/operator-approved/internal-only
- provider evidence mode: AI answer evidence vs web/search fallback vs unavailable
- rank safety: zero appearances renders `Not ranked` / `AI Presence`
- rendered-copy QA status/hash when available
- Release Captain approval status

Mission Control must not route pending-review operators to a public client-gated report route as proof. Use a protected operator preview route for review, and keep the public route blocked until approval.

If Alex clicks **Needs Fix**, the workflow must store the reason, block delivery, and make the next recovery action visible. A silent status change is not enough.

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
- `/mission-control/visibility-engine` — secondary Projects surface for VizBiz SEO/GEO/AEO work
- `/mission-control/settings` — internal settings/status

## API contract

Mission Control APIs are allowed to be wrappers, but they must terminate in real VizBiz sources:

- `/mission-control/api/pipeline-status` → `@/lib/google-sheets#getAllLeads`
- `/mission-control/api/lead-actions` → production `/api/lead-actions`
- `/mission-control/api/email-drafts` → real lead statuses from `getAllLeads`

No legacy SQLite mission schema. No generic agent roster. No old workspace memory feed.
