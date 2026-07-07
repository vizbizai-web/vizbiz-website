# VizBiz Client Email Suite v1
Written to docs/launch/vizbiz-brand-voice.md. Every email: one job, one
action, Alex's sign-off, no exclamation marks, numbers only from
pipeline data.

Merge fields: {business} {first_name} {city} {finding_prompt}
{rival} {appeared_x} {total_n} {report_url} {fixkit_url} {delta_*}
{month}. Greeting rule: "Hi {first_name}," only when a contact name is
known and ≠ business name; otherwise no greeting line.

CASL classes: [T] transactional (exempt, courtesy opt-out anyway),
[C] commercial (identification + opt-out REQUIRED; opt-out suppresses
the whole commercial class for that contact).

Automation classes: [AUTO] sends on trigger, no approval (template +
already-approved data only). [GATED] appears in Needs-You queue,
one-click approve to send.

Every send writes lead_events: email_sent, template id, Resend
message id. Suppression: purchase kills the nurture sequence
instantly; opt-out kills all [C]; do_not_send status kills everything.

---

## FREE JOURNEY

### E1 — Intake confirmation
Trigger: intake accepted (post spam-gate). [AUTO] [T]
Subject: `{business}: your AI visibility check is running`

> We're running your check now — real buyer questions, tested on
> ChatGPT, Gemini, and Perplexity.
>
> Your report typically lands within 48 hours. It will show exactly
> where {business} appears, where it doesn't, and who shows up
> instead.
>
> Alex — VizBiz.ai
> {mailing_address} · Reply "no thanks" any time to stop emails.

### E2 — Free report delivery (exists; canonical version)
Trigger: operator approves report. [GATED — existing gate] [T]
Subject: `{business}: your AI visibility snapshot is ready`

> I ran an AI visibility check on {business} and put together your
> snapshot report.
>
> The one number that matters: you appeared in {appeared_x} of
> {total_n} AI answers we tested for {city}.
>
> See the full results: {report_url}
>
> The report shows each question we asked, which platforms named you,
> and what's keeping you out of the rest.
>
> Alex — VizBiz.ai

### E3 — Nurture 1 (Day 2): one fix, free
Trigger: 48h after E2, no purchase. [AUTO] [C]
Subject: `One fix from your {business} report — no charge`

> Your report found {fix_count} fixable issues. Here's the first one,
> free:
>
> {top_fix_plain — e.g. "Your site has no structured data, so AI
> systems can't confirm what {business} does or where. It's a small
> file your web person adds once."}
>
> The remaining {fix_count_minus_one} are in the Fix plan — files
> ready to install, not a to-do list: {report_url}
>
> Alex — VizBiz.ai
> {mailing_address} · Reply "no thanks" to stop these emails.

### E4 — Nurture 2 (Day 5): the competitor angle
Trigger: Day 5, no purchase. [AUTO] [C]
Subject variants:
- rival present: `{rival} keeps coming up for "{finding_prompt}"`
- nobody present: `Nobody in {city} is winning these AI answers yet`

> Body A (rival): When we asked "{finding_prompt}", {rival} was named.
> {business} wasn't. That answer runs every day, for free, to anyone
> who asks.
>
> Body B (open field): When we tested {city} questions like
> "{finding_prompt}", almost nobody came up. These positions are
> unclaimed — the first business that structures for AI tends to keep
> them.
>
> The Fix plan closes the gap with installed files, not advice —
> and a 30-day re-test proves the movement: {report_url}
>
> Alex — VizBiz.ai
> {mailing_address} · Reply "no thanks" to stop these emails.

### E5 — Nurture 3 (Day 9): close the loop
Trigger: Day 9, no purchase. Last touch. [AUTO] [C]
Subject: `Last note on the {business} report`

> Quick final note — your report stays live at {report_url}.
>
> If the timing isn't right, no problem. Two things worth knowing:
> the fixes are one-time files (your web person installs them in
> about an hour), and every fix comes with a 30-day re-test on the
> same questions — you see the movement, or you see us say it hasn't
> moved yet.
>
> That's the last email from me unless something changes in your
> market.
>
> Alex — VizBiz.ai
> {mailing_address} · Reply "no thanks" to stop these emails.

### E6 — Quarterly re-audit ping (later phase, optional)
Trigger: 90 days post-E5, one re-run, only if delta exists. [GATED] [C]
Subject: `We re-ran the {city} test — {one_line_change}`
Body: two lines + report link. Build after the core suite proves out.

---

## PAID ($88) JOURNEY

### E7 — Payment received / next step (exists; canonical)
Trigger: Stripe webhook. [AUTO] [T]
Subject: `{business}: payment received — one 5-minute step`

> Payment confirmed. One short step before we run your full analysis:
> confirm your business details and tell us the questions your
> customers actually ask. Five minutes, and it makes your report
> sharper: {intake_url}
>
> Your full report — up to 60 buyer questions per platform, plus your
> Fix Kit — is typically ready within 48 hours of this step.
>
> Alex — VizBiz.ai

### E8 — Intake reminder (24h stalled)
Trigger: paid_intake_pending > 24h. Once. [AUTO] [T]
Subject: `{business}: your paid analysis is waiting on one step`

> Your payment is in, and your analysis is queued behind one 5-minute
> step: {intake_url}
>
> If you'd rather we proceed with what our system already verified
> about {business}, just reply "go ahead" and we'll run it as-is.
>
> Alex — VizBiz.ai

### E9 — Paid report + Fix Kit delivery (exists; canonical)
Trigger: operator approves paid report + kit. [GATED — existing] [T]
Subject: `{business}: your full report and Fix Kit are ready`

> Your full analysis is done — {appeared_x} of {total_n} answers
> across ChatGPT, Gemini, and Perplexity, broken down by the kind of
> question customers ask: {report_url}
>
> Your Fix Kit is ready too: {fixkit_count} files, ready to install,
> each with plain instructions — plus a pre-written email you can
> forward straight to your web person: {fixkit_url}
>
> In 30 days we re-run the same questions and send you the
> before/after.
>
> Alex — VizBiz.ai

### E10 — Implementation check-in (Day 7)
Trigger: 7 days post-E9, only if fix verification hasn't detected
installs. [AUTO] [T]
Subject: `{business}: quick check — are the files in?`

> Checking in on the Fix Kit. Our next scan hasn't spotted the files
> on your site yet — no rush, but the 30-day re-test measures what's
> installed, so the sooner they're in, the more movement it can show.
>
> If anything's unclear, reply here and I'll straighten it out. If
> your web person needs the package again: {fixkit_url}
>
> Alex — VizBiz.ai

### E11 — 30-day re-scan (THE conversion email)
Trigger: rescan_after_fix snapshot completes. [GATED] [T→C hybrid:
include opt-out]
Subject variants:
- moved: `{business}: 30-day re-test — {delta_summary, e.g. "4
  answers became 11"}`
- flat: `{business}: 30-day re-test results — and what they mean`

> Body A (moved): We re-ran the same questions on the same platforms.
> {month_before}: you appeared in {before_x} answers. Today:
> {after_x}. Each new appearance is listed in your updated report:
> {report_url}
>
> This movement holds only as long as nothing breaks and competitors
> stand still — neither lasts. Monitoring re-tests monthly, watches
> {competitor_1} and {competitor_2}, and ships a fresh fix each month.
> Your $88 credits toward the first month: {upgrade_url}
>
> Body B (flat): We re-ran the same questions. The honest result: no
> new appearances yet. {flat_reason_line — from verification data,
> e.g. "Our scan shows the Fix Kit files aren't installed yet, which
> is the usual cause" / "The files are in; these systems typically
> take 4–8 weeks to re-read and re-rank."} Updated report:
> {report_url}
>
> If you want us to stay on it — monthly re-tests, competitor
> tracking, a fresh fix each month — your $88 credits toward the
> first month: {upgrade_url}
>
> Alex — VizBiz.ai
> {mailing_address} · Reply "no thanks" to stop follow-ups.

---

## SUBSCRIBER ($188) JOURNEY
(Monthly one-pager, competitor alert, Fix Drop delivery: already
built in Phase 3 — this suite adds the two lifecycle gaps.)

### E12 — Payment failed
Trigger: invoice.payment_failed webhook. [AUTO] [T]
Subject: `{business}: card issue — monitoring pauses {pause_date}`

> Your monthly payment didn't go through — usually an expired card.
>
> Monitoring for {business} pauses on {pause_date} unless it's
> updated: {stripe_billing_portal_url}
>
> Your snapshots and trend history are safe either way.
>
> Alex — VizBiz.ai

### E13 — Cancellation acknowledgment
Trigger: subscription.deleted webhook. [AUTO] [T]
Subject: `{business}: monitoring closed — your history is archived`

> Your monitoring is closed as requested — no further charges.
>
> Everything stays archived: your snapshots, trend line, and Fix Kit.
> If you ever come back, the trend picks up where it left off rather
> than starting over.
>
> If anything about the service fell short, I'd genuinely like to
> know — just reply.
>
> Alex — VizBiz.ai

---

## Implementation notes for Forge

1. Template system: one module (src/lib/client-emails.ts or similar),
   each template pure-function (lead/snapshot data → subject/body),
   client-copy watchdog runs on every rendered output in tests.
2. Sequencing engine: nurture (E3–E5) scheduled via the existing cron
   pattern; per-lead sequence state in lead notes or a small table;
   suppression checks (purchased / opted out / do_not_send) evaluated
   AT SEND TIME, not at schedule time.
3. Opt-out: "reply no thanks" is the v1 mechanism (low volume, Alex
   reads replies). Add a one-click unsubscribe link when volume
   justifies; suppression flag lives on the lead and gates all [C].
4. Every send → lead_events (template id, Resend message id, class).
   Resend webhooks for delivered/opened/clicked → lead_events too.
5. [GATED] emails surface in the Needs-You queue with preview +
   one-click approve (E2/E9 already do; E11 joins them).
6. All numeric merge fields validate against pipeline data before
   render — the one-pager number-validation pattern, reused.
7. Fixtures: per-template render tests (merge fields resolve, no
   placeholder leaks, watchdog clean); suppression tests (purchase
   mid-sequence kills E4/E5; opt-out kills all [C]); E11 both
   variants; E10 skips when verification already sees installs.
