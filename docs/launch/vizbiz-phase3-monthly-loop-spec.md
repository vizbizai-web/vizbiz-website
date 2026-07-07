# VizBiz Phase 3 — Monthly Loop Spec (Snapshot Model + $188 Fulfillment)

Purpose: make the $188/mo Fix & Monitor tier deliverable after month one.
Month one is the paid audit + Fix Kit (Phase 1). This spec covers months
two onward: automatic re-runs, trends, competitor movement, alerts, the
monthly Fix Drop, and the monthly client report.

Prerequisite: Phase 1 Fix Kit shipped and fixture-green. The Fix Drop
(section 6) reuses generateFixKit() unchanged.

Design rules (unchanged house style):
- Every run is a versioned, immutable snapshot. Trends are diffs between
  snapshots — never recomputed history.
- Nothing client-facing without operator approval. Alerts included.
- Every claim in a monthly report traces to snapshot data.
- Fail closed: a failed monthly run alerts the operator; it never sends
  a degraded report silently.

---

## 1. Snapshot model (the spine)

### Table: `audit_snapshots`

```
id                uuid pk
lead_id           uuid fk -> leads
sequence          int          -- 1 = baseline (first paid run), 2, 3...
run_type          text         -- baseline | monthly | rescan_after_fix | manual
tier              text         -- free | paid | full
created_at        timestamptz
profile_hash      text         -- niche profile hash at run time
prompt_plan       jsonb        -- the exact prompts run (versioned)
platform_scores   jsonb        -- per-provider {appearedCount,totalPrompts,rate}
blended_score     numeric
band              text         -- Weak | Moderate | Strong
prompt_results    jsonb        -- per-prompt per-provider appeared/cited detail
competitor_scores jsonb        -- per named competitor, same shape as platform_scores
readiness         jsonb        -- schema/llms.txt/robots/crawler-access findings
cost_estimate     numeric
status            text         -- complete | failed | partial
```

Rules:
- Snapshots are append-only. Reruns create a new row; nothing is
  overwritten. (This fixes the QA observation where a paid rerun
  overwrote the free run's payload — that class of loss ends here.)
- The existing free/paid research write path is refactored to ALSO write
  a snapshot row at completion. Backfill: for existing paid leads,
  synthesize snapshot #1 from stored research data where parseable.
- The Phase 1 `rescan_after_fix` hook writes its result as a snapshot
  (run_type rescan_after_fix) instead of a bespoke before/after pair —
  Phase 1's minimal version migrates onto this table when Phase 3 lands.

### Prompt-plan stability vs. drift

Trends are only honest if the prompt set is comparable month to month.
Policy:
- The monthly run reuses the prior snapshot's prompt_plan verbatim by
  default (hash-checked).
- Prompt refresh happens at most quarterly, replaces at most 25% of the
  battery, and is recorded: refreshed prompts are tagged in the plan so
  the diff engine can exclude them from month-over-month deltas for one
  cycle (a new prompt's first result is a baseline, not a change).
- If the niche profile hash changed (operator override, business pivot),
  block the monthly run for operator review instead of silently running
  stale prompts — same fail-closed pattern as the resolver.

---

## 2. Diff engine

New module: `src/lib/snapshot-diff.ts`

```
diffSnapshots(current: Snapshot, previous: Snapshot): SnapshotDiff
```

Computes, per provider and blended:
- score delta (rate and count), band change
- prompt-level movements:
  - `gained`: prompts where the business newly appears
  - `lost`: prompts where it stopped appearing
  - `held`: stable appearances
- competitor movements: same gained/lost per named competitor, plus
  share-of-voice shift (of prompts where anyone in the set appeared,
  who got cited)
- readiness changes: schema/llms.txt/robots findings that appeared or
  disappeared (catches "site update wiped the schema" — see section 7)
- excluded set: prompts refreshed this cycle (reported separately as
  "newly tracked", never as gains/losses)

Determinism requirement: diffing the same two snapshots twice yields
identical output (pure function, no LLM). All narrative language about
the diff is generated downstream and validated against these numbers.

---

## 3. Subscription-aware scheduling

### Table: `subscriptions_local`

Minimal mirror of what fulfillment needs (Stripe stays source of truth):

```
lead_id, stripe_subscription_id, status, current_period_end,
next_run_at, last_run_snapshot_id, paused_reason
```

Maintained by the existing Stripe webhook: extend handling to
`customer.subscription.updated` / `.deleted` / `invoice.payment_succeeded`
(already enabled on the endpoint) so cancellations and payment failures
pause the loop automatically. A canceled/past-due subscription never
gets a monthly run or report.

### Scheduler

Extend `/api/cron/process-reruns` (CRON_SECRET-gated, already live):
- Daily tick: find active subscriptions with next_run_at <= now.
- Enqueue one monthly run per due subscription; process serially
  (existing one-at-a-time pattern is fine at current volume).
- On completion: write snapshot, run diff vs previous, set next_run_at
  = +30 days, proceed to alert/report generation (sections 5–6).
- On failure: mark snapshot failed, Telegram operator alert, retry once
  next daily tick, then hold with alert. Never skip silently.

---

## 4. Trend rendering

Report renderer additions (both the client monthly report and the full
report page for subscribers):
- Trend chart: blended score across all snapshots (line or bar, month
  labels), plus per-platform mini-trends on the platform cards
  ("ChatGPT: 15% → 20% ▲").
- Competitor overlay: named competitors' rates on the same axis.
- Movements list: "Newly appearing for: …" / "No longer appearing
  for: …" rendered from the diff's gained/lost sets (top 5 each,
  buyer-prompt phrasing).
- Copy rules: deltas only ever from the diff engine's numbers; the
  qa:client-copy watchdog gains patterns blocking trend claims that
  don't parse from snapshot data (no hand-written "up 40%!" ever).
- Two-snapshot minimum: with only a baseline, render "baseline
  recorded [date] — first trend comparison arrives next month" instead
  of an empty chart.

---

## 5. Competitor movement alerts

Trigger conditions (evaluated on each monthly diff):
- A named competitor GAINED a prompt the client does not appear for.
- The client LOST a prompt it previously held.
- A competitor's share-of-voice crossed above the client's.

Alert delivery:
1. Operator first (Telegram, existing bot): the proposed client alert
   with Approve / Skip buttons — same webhook mechanics as niche
   resolution.
2. On approve: client email via Resend. One email per month maximum;
   multiple triggers batch into a single "competitor movement" email.
   Subject pattern: "{Competitor} started appearing where you don't —
   {Business} monthly AI visibility alert".
3. No triggers → no alert email. Silence is honest; the monthly report
   still goes out.

The alert email is the mid-cycle retention touch — it must contain the
specific prompt(s) and competitor name(s) from the diff, nothing vague.

---

## 6. Monthly deliverables

Generated after each successful monthly run, in order:

### 6a. Monthly Fix Drop
- Input: current snapshot's lost/never-appeared prompts + readiness
  findings.
- Call generateFixKit() in "drop mode": produce 1–2 artifacts targeting
  the highest-value current gaps (typically a new FAQ block from newly
  lost prompts, or a readiness repair if section 7 found breakage).
  Skip artifact types already delivered and still verified live.
- Same validation + Mission Control approval flow as Phase 1.

### 6b. Monthly one-pager (the client report)
Structure (rendered page + email, owner-language throughout):
1. Score + trend arrow ("62 → 68 ▲")
2. Platform cards with mini-trends
3. What changed (from diff: gained/lost, competitor movement)
4. What we did (this month's Fix Drop artifacts, implementation status)
5. What's next (next month's focus, plainly stated)
6. Baseline reminder ("tracking since {baseline date}")

Generation: template-first with LLM prose only for the "what
changed/what's next" narrative — validated so every number matches the
diff, every claim traces to snapshot/artifact data. Operator approval
gates the send, one-click in Mission Control.

### 6c. Delivery
Resend email: "{Business}: your {Month} AI visibility report" linking
to the report page. Same client-copy safety gates as all email.

---

## 7. Fix verification (implementation drift watch)

Each monthly run's readiness check compares against the delivered Fix
Kit manifest:
- schema.jsonld present and parsing on the site?
- llms.txt live at root?
- robots.txt still permitting AI crawlers?
- rewritten titles/metas still in place (fuzzy match, since sites edit)?

Regressions (e.g., site rebuild wiped the schema) surface in:
- the diff (readiness changes)
- the monthly report ("your schema markup went missing after your
  site update on ~{date} — reinstall file attached")
- the Fix Drop (the repair artifact regenerates automatically)

This is quietly the strongest retention feature: the subscription
notices and repairs breakage the client would never see.

---

## 8. Mission Control additions

- Subscriber view: active subscriptions, next_run_at, last snapshot,
  trend sparkline, pending approvals (report / fix drop / alert).
- Snapshot history per lead: sequence list with scores and diffs.
- Monthly approval queue: one screen to review and release the month's
  reports/drops/alerts. Target operator time: under 10 minutes per
  subscriber per month.

---

## 9. Cost & capacity

Per subscriber per month at current paid depth (20 prompts × 3
engines): ~$0.25 provider cost + Firecrawl readiness crawl + 1–2 Fix
Drop LLM calls ≈ well under $1. At 50 subscribers the loop costs less
than one subscription. The existing serial cron is sufficient past
100 subscribers before parallelization is worth discussing.

Budget guard: monthly runs respect the same per-run caps as paid
audits; a hard monthly total cap (env-configurable, default $50) pauses
the scheduler with an operator alert if exceeded.

---

## 10. Acceptance fixtures

1. **Baseline + one month**: fixture subscriber, run baseline, force a
   monthly run, assert snapshot #2 written, diff computed, trend chart
   renders with two points, one-pager generated and gated.
2. **Gained/lost correctness**: seed two snapshots with known
   prompt-result differences; assert diff gained/lost sets exactly
   match, and rendered movement copy contains only those prompts.
3. **Prompt refresh exclusion**: refresh 3 prompts between snapshots;
   assert they appear as "newly tracked", not gains/losses.
4. **Cancellation pause**: cancel the fixture subscription in Stripe
   (test clock or webhook simulation); assert next monthly run does
   not execute and no report generates.
5. **Payment failure pause**: simulate invoice.payment_failed →
   paused_reason set, loop halted, operator alerted.
6. **Fix verification regression**: remove the fixture site's
   llms.txt between runs; assert the diff flags it, the report
   mentions it, and the Fix Drop contains the repair.
7. **Failed run fail-closed**: force a provider failure mid-run;
   assert snapshot marked failed, operator alerted, NO client email
   of any kind sent, retry occurs next tick.
8. **Profile-change block**: change the niche profile hash between
   runs; assert the monthly run blocks for review instead of running
   stale prompts.
9. **Trend copy honesty**: attempt to render a report where narrative
   numbers disagree with diff numbers; assert validation blocks it.
10. **Determinism**: diff the same snapshot pair twice; byte-identical
    output.
```
