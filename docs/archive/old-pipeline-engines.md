# Archived old pipeline engines

The async report queue and shared report-generation service are now the source of truth for client-facing VizBiz report work.

## Archived client-facing endpoints

- `POST /api/audit/run`
  - Old behavior: accepted a business audit payload, ran the research audit synchronously, wrote an audit JSON artifact, and returned a completed audit.
  - Current behavior: returns `410 Gone` with `sync_audit_route_deprecated` guidance.
  - Replacement: `POST /api/mini-audit/run` for free intake. It saves intake state, enqueues a `free_mini_report` job, and returns `202 queued`.

- `POST /api/fix-engine/run`
  - Old behavior: accepted an audit or audit id, generated a fix package synchronously, wrote a fix package JSON artifact, and returned it.
  - Current behavior: returns `410 Gone` with `sync_fix_route_deprecated` guidance.
  - Replacement: paid intake (`POST /api/purchase/intake`) queues paid fulfillment jobs for worker/operator processing.

## Read-only/delivery routes retained

The following legacy artifact routes remain available because they do not kick off long-running report generation:

- `GET /api/audit/[id]`
- `GET /api/audit/[id]/report`
- `GET /api/audit/history/[clientId]`
- `GET /api/fix-engine/[id]`
- `POST /api/fix-engine/[id]/deliver`

If these are later exposed beyond internal tooling, add authentication/authorization before making them public.

## Developer-only CLIs retained

The old engine CLIs are retained for local debugging and archived artifact reproduction only:

- `npm run audit -- --name "Business" --city "City" --website "https://example.com" --type "dentist"`
- `npm run fix -- --audit path/to/audit.json --output-dir ./output/fixes`

They are explicitly not production intake or fulfillment paths. Production/client work must enter the queue.

## Current queue/worker flow

1. Free intake calls `POST /api/mini-audit/run`.
2. Paid intake calls `POST /api/purchase/intake`.
3. Intake routes save lead/order context and enqueue report jobs via `src/lib/report-job-queue.ts`.
4. The worker claims jobs and calls the shared generation service:

```bash
npm run worker:reports -- --limit=3
```

5. The worker records completion, quality-gate/operator-review status, and failures in the queue store.

## Guardrails

Tests verify that:

- `POST /api/audit/run` no longer imports/calls the synchronous audit runner.
- `POST /api/fix-engine/run` no longer imports/calls synchronous fix generation.
- `POST /api/mini-audit/run` remains enqueue-only and does not import synchronous report generation.
