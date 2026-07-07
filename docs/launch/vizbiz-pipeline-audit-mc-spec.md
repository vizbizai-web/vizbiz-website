# VizBiz Pipeline Audit & Mission Control Upgrade Spec
## July 2026 — synthesized from all certificates, inventories, and live proofs to date

Method note: this audit is compiled from verified evidence across the
project (close certificates, the funnel inventory, live QA runs), not a
fresh code inspection. Items marked UNKNOWN need Forge to confirm.

---

# PART 1 — PIPELINE AUDIT, STAGE BY STAGE

## S1. Intake (homepage form → API → Supabase)
**Status: HARDENED.** Normalization module strips browser/form metadata
at write time; blank category persists as null (no synthetic
"local_business"); competitors stored as structured array; dedicated
submitted_primary_service column; UTM/referrer captured; zod-style
validation.
**Residual risk:** low. Regression-tested (polluted sentinel, blank
sentinel, comma-competitor).

## S2. Niche resolution
**Status: PROVEN.** Two-pass extraction (quote verification, no
taxonomy), isolation by type signature (no competitor/search/taxonomy
inputs), degraded modes with unsafe-value rejection, segment-trap and
brand-name guards, CONFLICT → Telegram buttons → rerun, prompt-plan
hash staleness guard.
**Open (small):** segment-check head-noun tuning (false-positived on
VizBiz's own "for local businesses" copy — fail-closed, so low
priority). Polish-diacritic slug mangling confirmed internal-only?
UNKNOWN — verify slugs never render client-facing.

## S3. Preflight (crawl, SEO audit, Places)
**Status: WORKING.** Cheap-first crawl behavior partially UNKNOWN (the
Inngest-era cheap-first escalation was specced; current implementation
may still be Firecrawl-primary — confirm). Places domain-match rule in
force.
**Open:** Places low-confidence/mismatch renders blank instead of a
clear "not confidently matched" state (from the funnel inventory,
never fixed). Crawl cache by domain: UNKNOWN if implemented.

## S4. Research (3-engine battery)
**Status: PROVEN.** ChatGPT (Responses+web_search), Gemini (grounded,
3.1 flash-lite), Perplexity Sonar; per-datapoint provider provenance;
web-search fallback never counted as AI evidence; "up to N" honest
depth copy; Pass 1 structured-failure counter exists.
**Open:** prompt generator top-up to tier cap (18-vs-20 gremlin —
ticketed, deferred). Pass 1 failure-rate alerting threshold (~10%)
implemented? UNKNOWN — was specced, confirm.

## S5. Scoring & snapshots
**Status: PROVEN.** Append-only audit_snapshots live (sequence 1 & 2
verified in production); per-platform + blended scores; deterministic
diff engine fixture-tested; snapshot write failure fails open for
audits with operator alert, strict for monthly runs.

## S6. Report rendering
**Status: WORKING, WITH THE LARGEST REMAINING STRUCTURAL GAP.**
Free report: solid visual structure, per-platform cards, honest copy,
qualitative risk framing.
**Open — priority:** the client-safe payload layer was never completed
(renderer still maps from raw lead/research data with copy-gates
around it, rather than consuming one schema-validated client-safe
object). This has been open since the original review; every renderer
leak class routes through it. Full/paid report layout stability across
viewports: UNKNOWN, flagged in inventory, never re-verified. Paid
report design polish: not yet done (copy/design track).

## S7. Review & approval
**Status: WORKING.** Free + paid approval gates; paid-report readiness
asserts (not stamps) research completion; Email Hub save/approve fixed
with persistence.

## S8. Email
**Status: WORKING, THIN.** Resend verified domain, client-copy gates,
CTA validation. Only one production email exists (report delivery) +
paid next-step. **Open:** the six-email suite (nurture ×3, fix-kit
delivery exists?, monthly one-pager, competitor alert, upgrade-at-
rescan); open/click tracking; all pending the copy track.

## S9. Payments
**Status: CERTIFIED.** Dynamic Checkout primary, Payment Links
fallback, trailing-slash webhook + non-3xx regression guard,
subscription lifecycle events extending into subscriptions_local,
readiness gates.

## S10. Paid fulfillment (Fix Kit)
**Status: LIVE.** Seven artifacts, validation → needs_operator_edit,
approval-gated delivery, client page + ZIP, 30-day rescan hook.
**Open:** artifact presentation/branding polish (copy/design track);
Alex's quality read still pending.

## S11. Monthly loop (Phase 3)
**Status: IN FLIGHT.** Spine proven live; trends/alerts/one-pager
built locally; Fix Drop tightening + MC approval flow + 10-fixture
suite + dress rehearsal remaining.

## S12. Ops & safety rails
**Status: MOSTLY IN PLACE.** CRON_SECRET enforced; Telegram dedicated
bot + webhook secret; gitleaks history clean; build-SHA at /api/health;
qa:client-copy watchdog (platforms, studies registry, internal vocab);
QA rows excluded from metrics.
**Open:** hard dollar budget governor (per-day/per-lead spend ledger
with auto-pause) — still vapor from the original inventory except the
Phase 3 monthly cap. Rate limits exist per provider; no unified spend
view.

## Consolidated open-items ledger (ranked)
1. **UNKNOWN-CRITICAL: Mission Control authentication** (see Part 2 —
   must be verified before anything else)
2. Client-safe report payload layer (S6)
3. Email suite + tracking (S8, copy track)
4. Fix Kit presentation polish (S10, copy track)
5. Budget governor / spend ledger (S12)
6. Places mismatch UI state (S3)
7. Prompt top-up to cap (S4)
8. Pass 1 failure alert threshold confirm (S4)
9. Full-report viewport stability re-verify (S6)
10. Segment-check head-noun tuning (S2)
11. middleware → proxy rename (housekeeping)

---

# PART 2 — MISSION CONTROL: FROM ADMIN PAGE TO COCKPIT

## 2.0 FIRST: the authentication question
Nothing in any report to date has evidenced that /mission-control and
/api/lead-actions are authentication-protected. If they are publicly
reachable, anyone with the URL can approve reports, send client
emails, edit drafts, and mark leads junk. **Verify before any other MC
work.** If unprotected or weakly protected: add real auth (at minimum
a strong shared-secret session; better, an identity login), rate-limit
the action API, and add an action audit log. This outranks every
feature below.

## 2.1 Design principle
MC's job is one question, answered instantly: **"What needs Alex, and
what's the one click that resolves it?"** Alex's future context: HVAC
school from September, operating in stolen minutes, often from a
phone. Every MC decision optimizes for: triage speed, one-click
resolution, evidence without SQL, mobile usability.

## 2.2 The "Needs You" queue (new MC home)
One screen listing every item awaiting operator action, newest-money
first:
- 🔴 Niche conflicts (with inline resolve — see 2.3)
- 🟠 Paid: fix-kit artifacts in needs_operator_edit; paid reports
  ready for review
- 🟠 Monthly (Phase 3): one-pagers, fix drops, competitor alerts
  awaiting approve
- 🟡 Free reports pending review
- ⚫ Failures: failed runs, snapshot write errors, webhook failures,
  Pass 1 failure-rate breach
Each row: business name, tier/$ value, age, ONE primary action button
+ "open detail". Empty state: "Nothing needs you." — that sentence is
the product goal.
Ordering rule: paid > subscriber > free; oldest first within tier.

## 2.3 Niche resolution parity in MC
Today conflicts are resolvable ONLY via Telegram buttons — a
single-channel dependency (Telegram outage or a lost message = stuck
lead). Lead detail gets a Niche panel:
- submitted service vs inferred type, confidence, method
- the verified evidence quotes (with source URLs) Pass 2 actually used
- conflict explanation when blocked
- the same three actions as Telegram: Use declared / Use website /
  Custom (free-text) — wired to the identical resolution path so the
  two channels can never diverge in behavior.

## 2.4 Lead diagnostics timeline (evidence without SQL)
Render lead_events as a human-readable timeline per lead: intake
received (fields present/null), pack built (chars, pages, crawl
quality), quotes verified/dropped, resolution result, per-provider
research summary, snapshot appended (sequence), gates passed/failed,
approvals, emails sent (Resend id), Stripe events. Today this requires
Forge querying Supabase; the operator should self-serve it. This is
also what makes "give Forge feedback" precise: Alex can paste a
timeline instead of a symptom.

## 2.5 Report copy control
The inventory flagged that rendered-report copy has no robust
edit/persist path (unlike emails post-fix). Minimum viable: per-lead
overrides for the headline/summary/action-plan text blocks, persisted
and consumed by the renderer, with the client-copy watchdog run on
save. (Full copy CMS: not now.)

## 2.6 Paid & subscriber operations
- Paid clients view: everyone past checkout — tier, status, fix-kit
  state, rescan date, report links, lifetime value.
- Subscriber view (Phase 3 spec §8 already defines it): next_run_at,
  last snapshot, trend sparkline, pending monthly approvals, paused/
  payment-failed flags. Build once, as one view, when Phase 3 lands.
- Monthly approval mode: step through the month's one-pagers/drops/
  alerts approve-by-approve — target <10 min per subscriber per month.

## 2.7 Health strip (top of MC, always visible)
- Today: leads in / completed / failed
- Pass 1 structured-failure rate (7-day)
- Provider status dots (last call ok/fail per engine)
- Spend today vs budget (feeds from the budget governor when built —
  strip ships with estimate math first)
- Deployed SHA (from /api/health) — one glance confirms what's live

## 2.8 Action audit log
Every MC/Telegram action recorded: action, lead, channel, timestamp.
Surfaced on lead detail. Cheap now, invaluable the first time "wait,
did I approve that?" happens — and required the day anyone besides
Alex touches MC.

## 2.9 Mobile pass
The Needs-You queue, niche resolution panel, and monthly approval mode
must work on a phone. Telegram remains the push channel; MC becomes
usable as the pull channel from the same phone.

## 2.10 Explicitly NOT now
- Full CRM (communications log, client portal accounts)
- Multi-operator roles/permissions (audit log prepares for it)
- Analytics dashboards beyond the health strip
- Automating the approve decision itself — the human gate IS the
  product's trust story; MC's job is making the gate fast, not
  removing it.

## 2.11 Build order
0. Auth verification/fix + action audit log (2.0, 2.8)
1. Needs-You queue (2.2) + health strip v1 (2.7)
2. Niche panel parity (2.3)
3. Diagnostics timeline (2.4)
4. Mobile pass on the above (2.9)
5. Report copy overrides (2.5)
6. Paid/subscriber views (2.6) — timed with Phase 3 close
