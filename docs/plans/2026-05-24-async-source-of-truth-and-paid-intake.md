# VizBiz Async Source of Truth + Paid Intake Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make VizBiz intake instant, report generation asynchronous, and paid fulfillment driven by one source-of-truth evidence/report pipeline with no stale synchronous engines sending client emails.

**Architecture:** Prospect-facing routes only enqueue work and return quickly. A shared worker module claims queued jobs, runs evidence-first report generation, saves artifacts, applies quality gates, and only sends client email when safe. Paid reports use the same evidence engine with deeper budgets and a richer paid intake schema.

**Tech Stack:** Next.js App Router, TypeScript, local `.data/vizbiz` JSON store for dev, Supabase CRM as production source of truth, Resend, Telegram alerts, existing `runAudit`, `createMiniReportFromAudit`, Google Places, site crawler, competitor evidence, business intelligence profile.

---

## Source-of-truth decisions

1. **One report engine:** `src/engines/research/runner.ts` + evidence-first profile is the only audit source of truth.
2. **One generation service:** create a shared service module that all routes/workers call. Routes must not duplicate generation/email logic.
3. **Free report competitor policy:**
   - If client supplies 1–2 competitors: validate/enrich those competitors and show limited competitor context only when evidence is available.
   - If client supplies 0 competitors: report is `client_only`; do not guess or show auto-discovered competitors client-facing; no competitor scores, no market rank, no competitor revenue gap.
   - Auto suggestions can be stored internal-only as `auto_suggested_internal` for operator review or paid intake.
4. **Paid report competitor policy:** paid intake asks for richer competitor details and permission/confirmation. Paid reports may include operator-approved or client-confirmed competitor research.
5. **Quality gate:** no client email until report passes evidence quality. Blocked reports are persisted and shown as `needs_operator_review`.
6. **Archive old engines:** do not delete useful code immediately. Move old direct/sync API paths behind enqueue wrappers or mark as deprecated with tests ensuring they do not email or run long audits synchronously.

---

## Paid report/fix intake questionnaire

### Required baseline fields

- Contact name
- Role/title
- Best email
- Business legal/display name
- Website URL
- Primary city / service area / country
- Google Business Profile URL
- Business category/niche confirmation
- Top services/products to win for, ranked 1–5
- Highest-value service/product
- Service/product margins or average customer value if known
- Main conversion action: call, booking form, checkout, quote request, walk-in, etc.
- Primary phone number and preferred tracked contact path

### Competitor fields

- Competitor 1 name
- Competitor 1 website
- Competitor 1 Google Maps/GBP URL if known
- Why this competitor matters: most visible, closest, cheapest, strongest reviews, owner concern, etc.
- Competitor 2 same fields
- Optional competitor 3–5 for paid/monthly only
- Permission checkbox: “VizBiz may research additional competitors internally, but only confirmed/operator-approved competitors appear in client-facing paid deliverables.”

### Fix access and implementation fields

- CMS/platform: WordPress, Webflow, Squarespace, Wix, Shopify, custom, other
- Who can edit the website: client, agency, VizBiz with access, unknown
- Access status: no access yet, collaborator invite possible, staging available, edits must be sent to developer
- Google Business Profile access status
- Analytics/Search Console access status if available
- Booking/CRM/contact form platform
- Existing schema/plugin tools
- Approval constraints: compliance/legal/brand approval, medical/legal disclaimers, corporate/franchise rules
- “Can we implement simple website/schema/copy fixes directly if access is provided?” yes/no/manual approval only

### Content and proof fields

- Customer types to attract
- Common customer questions
- Common objections
- Differentiators/proof: years, certifications, awards, guarantees, specialties, owner story
- Review links and best review themes
- Before/after or project gallery links
- FAQs already answered somewhere
- Offers/promos/seasonal priorities
- Languages served

### Paid report priority fields

- What do you want fixed first?
- Which service/product would be most valuable to rank/recommend for?
- Which AI/search result surprised or worried you?
- Known incorrect AI/search info about the business
- Deadline/urgency
- One-time package: choose 1–3 immediate fix priorities
- Monthly plan: choose monitoring markets, competitor watchlist, and monthly update preferences

---

## Task 1: Extract report generation service

**Objective:** Move mini-audit generation, persistence, quality gate, email send, Supabase saves, and Telegram events out of `/api/mini-audit/run` into a reusable service.

**Files:**
- Create: `src/lib/report-generation-service.ts`
- Modify: `src/app/api/mini-audit/run/route.ts`
- Test: `src/lib/report-generation-service.test.ts`

**Behavior:**
- `generateMiniReportForLead({ lead, rawIntake, baseUrl, mode })`
- mode: `"free" | "paid_baseline" | "paid_full"`
- returns `{ status: "report_sent" | "needs_operator_review" | "report_prepared", slug?, reportUrl?, reasons?, emailDelivery? }`
- saves audit/report before quality gate
- never sends email when quality gate fails
- keeps `validateMiniReportQuality` exported/tested from service

**Verification:**
- Route imports service and contains no direct `runAudit` call.
- `npm test -- src/lib/report-generation-service.test.ts`
- `npm test`

---

## Task 2: Add local queue store for dev and worker portability

**Objective:** Add a small queue abstraction that works locally now and can map to Supabase later.

**Files:**
- Create: `src/lib/report-job-queue.ts`
- Test: `src/lib/report-job-queue.test.ts`

**Job shape:**
```ts
export type ReportJobType = "free_mini_report" | "paid_full_report" | "paid_monthly_baseline" | "rerun_report";
export type ReportJobStatus = "queued" | "processing" | "completed" | "needs_operator_review" | "failed_retryable" | "failed_permanent";

export interface ReportJobRecord {
  id: string;
  type: ReportJobType;
  status: ReportJobStatus;
  leadId?: string | null;
  paidOrderId?: string | null;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  lockedAt?: string | null;
  lockedBy?: string | null;
  lastError?: string | null;
  result?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
```

**Required functions:**
- `enqueueReportJob(input)`
- `listReportJobs(status?)`
- `claimNextReportJob(workerId, now?)`
- `completeReportJob(id, result)`
- `markReportJobNeedsReview(id, reasons, result?)`
- `failReportJob(id, error, retryable)`
- stuck lock recovery for jobs locked > 15 minutes

---

## Task 3: Make free intake route enqueue only

**Objective:** `/api/mini-audit/run` should save lead/competitors/alert, enqueue report job, and return within seconds.

**Files:**
- Modify: `src/app/api/mini-audit/run/route.ts`
- Modify: `src/components/MiniAuditFunnel.tsx`
- Test: existing intake tests + new route/service tests if feasible

**Behavior:**
- No direct `runAudit` call in route.
- Response status `202` with `{ status: "queued", jobId, thankYouUrl }`.
- Thank-you page copy supports “report being prepared/reviewed.”
- Supabase lead status: `queued` or `report_queued`.

---

## Task 4: Add worker runner script

**Objective:** Add a command that can be run locally, by Mac mini launchd, Vercel Cron, GitHub Actions, or a hosted worker.

**Files:**
- Create: `scripts/process-report-jobs.ts`
- Modify: `package.json`
- Test: `src/lib/report-job-worker.test.ts` or service-level tests

**Command:**
```bash
npm run worker:reports -- --limit=3
```

**Behavior:**
- claims queued/stuck jobs
- calls `generateMiniReportForLead` or paid report service based on job type
- updates job status
- sends Telegram alerts on complete/needs-review/failure
- exits cleanly after limit so cron can run it

---

## Task 5: Archive old sync/direct engines and routes

**Objective:** Preserve useful code but prevent multiple report-generation sources of truth.

**Files:**
- Inspect/modify:
  - `src/app/api/audit/run/route.ts`
  - `src/app/api/fix-engine/run/route.ts`
  - `src/engines/research/cli.ts`
  - `src/engines/fix/cli.ts`
- Create docs: `docs/archive/old-pipeline-engines.md`

**Behavior:**
- If old routes remain, label internal/deprecated and make them call the same service/worker or return a deprecation response.
- Do not delete CLIs if useful for local debugging, but mark them as developer-only and not the client pipeline.
- Add a test or grep guard that `/api/mini-audit/run` does not import `runAudit` directly.

---

## Task 6: Expand paid intake schema and form

**Objective:** Replace the thin paid intake with a report/fix-ready questionnaire.

**Files:**
- Modify: `src/lib/paid-fulfillment.ts`
- Modify: `src/app/purchase/success/page.tsx`
- Modify: `src/app/api/purchase/intake/route.ts`
- Test: `src/lib/paid-fulfillment.test.ts`

**Fields:** implement the questionnaire above, grouped visually as:
1. Business confirmation
2. Competitor confirmation
3. Services/products to win
4. Fix/access details
5. Proof/reviews/content
6. Urgency and approval constraints

**Behavior:**
- Paid intake completion enqueues `paid_full_report` or `paid_monthly_baseline`.
- Paid order status becomes `queued` only after intake saved and job enqueued.

---

## Task 7: Mission Control needs-review queue

**Objective:** Make blocked reports actionable.

**Files:**
- Modify/create Mission Control pages under `src/app/mission-control/*`

**Display:**
- queued/processing/completed/needs-review jobs
- report blocker reasons
- Google Places evidence
- site crawl summary
- competitor evidence
- generated questions
- approve/send/regenerate actions placeholder

---

## Verification checklist

- [ ] Free intake returns queued response quickly.
- [ ] No client email sends inside intake route.
- [ ] Worker can process a queued free report.
- [ ] Quality gate blocks risky reports and persists them for review.
- [ ] No competitor info appears client-facing when competitor fields are blank.
- [ ] One supplied competitor yields limited source-aware context, not fake market rank.
- [ ] Two supplied competitors yield validated source-aware competitor context only.
- [ ] Paid intake captures fix/access details needed to create actual implementation assets.
- [ ] Paid intake queues paid report/fix work.
- [ ] Old sync routes no longer act as client-facing source of truth.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
