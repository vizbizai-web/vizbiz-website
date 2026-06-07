# VizBiz Launch Copy QA Notes

Date: 2026-06-03
Scope: homepage/report/offer copy risk review for Friday soft launch.

## Executive verdict

The current launch copy is usable for a controlled soft launch. It is strongest when it stays grounded in:
- popular AI visibility
- local trust signals
- competitor context supplied by the user
- conservative snapshots
- paid fix plan as the deeper deliverable

Do not let the copy drift into guaranteed rankings, guaranteed revenue, or provider-specific claims.

## Architecture reset dependency

All launch copy QA now inherits the report-quality reset in `docs/launch/report-quality-architecture-reset.md`.

That means launch copy is not approved just because it sounds better. It is approved only when the rendered report/email is backed by a client-safe payload, correct niche resolution, approved competitor provenance, verified CTA, and Release Captain visible-output review.

Client-facing copy must not expose fulfillment mechanics or operator notes. Specifically block wording such as `the client named`, `paid report should`, `manual review`, `operator approval`, `human correction`, `auto-discovered competitors`, `internal only`, `client-ready deliverable`, fake slugs, QA/debug notes, and pipeline language.

If competitor context must be mentioned, translate it into value language. Example:

```txt
LexHive should be positioned clearly against BridgeLegal and Broughton Partners so AI systems can understand where it fits, what makes it credible, and when it should be recommended.
```

Never write:

```txt
The client named BridgeLegal and Broughton Partners. That means the paid report should compare LexHive against those exact two...
```

That is internal operator logic and must never appear in an email, report, preview, or Alex QA artifact.

## Safe language to keep using

Use:
- popular AI assistants
- AI-powered search tools
- popular AI recommendations
- local AI visibility
- AI recommendation readiness
- trust signals
- entity clarity
- website/schema/review readiness
- directional estimate, not a guarantee
- named competitor context
- operator review

Avoid:
- guaranteed ChatGPT rankings
- guaranteed revenue
- “we know exactly what AI thinks”
- “Perplexity says” unless the report specifically shows Perplexity evidence
- “your competitor is winning” unless evidence is verified
- exact implementation details inside free report

## Homepage QA

Strong:
- Hero explains the core idea clearly.
- CTA is concrete: “Email me my free AI visibility snapshot.”
- Competitor policy is visible and asks for two competitors.
- The page makes AI visibility feel tied to trust/customers, not abstract hype.
- Paid offer is concrete and low-friction.

Small fix completed:
- Changed “Two nearby competitor benchmark showing where AI recommends them instead of you” to safer/cleaner “Two nearby competitor benchmarks showing where AI may recommend them instead of you.”

Watch-outs:
- “Own your ZIP code” is memorable, but should be treated as a positioning metaphor, not a legal/performance guarantee.
- Free report expectations should stay conservative: snapshot, not full implementation plan.
- Keep encouraging exactly two competitor fields; user-supplied competitors are more accurate than auto-discovered names.

## Mini report QA

Strong:
- Report headline uses “popular AI recommendations,” not single-provider framing.
- It warns that the free snapshot is conservative.
- It distinguishes free snapshot vs full paid report.
- It includes fallback handling for older/missing fields.
- It supports Spanish reports.
- It does not show dollar gap when assumptions are weak.

Safe copy fixes completed:
- Changed free report labels from “First fix,” “Next fix,” and “Recommended fix” to “Paid report focus” / “Paid report opportunity.”

Reason:
- Free reports should tease broad opportunities, not imply the exact fix roadmap is already fully included for free.

Watch-outs:
- Generated report content can still include specific recommendations from upstream data. Operator review remains important for first launch clients.
- If a client did not provide competitors, do not let the report imply validated competitor evidence.
- If a business niche is low-confidence, keep status as `needs_operator_review` and do not email automatically.

## Paid offer QA

Strong:
- $88 product feels concrete: evidence, competitor gaps, machine readiness, fix plan.
- $188/mo product has a clear monitoring/competitor movement story.
- Risk reversal is honest: guarantee depth of diagnosis, not rankings.

Watch-outs:
- “120 prompts” sounds substantial but may feel technical. Good in deliverables list; less useful as primary sales language.
- For non-technical owners, lead with “what to fix first,” not “prompt table.”
- Keep “directional estimate” language whenever money/revenue is shown.

## Email QA

Strong:
- Email payload uses branded `from`, `reply_to`, and broad AI-search language.
- Email keeps the full roadmap on the report/paid path.

Blocker:
- Public DNS still needs SPF before calling email deliverability launch-ready.

## Launch QA checklist for any real client report

Before sending a free or paid report to a real prospect, verify:

```txt
[ ] Business name is correct.
[ ] Website/domain is correct.
[ ] Niche/service label is specific and correct.
[ ] City/service area is correct.
[ ] Competitors are user-supplied or clearly operator-approved.
[ ] Questions sound like real buyer-to-AI questions.
[ ] Report says popular AI visibility, not one-provider visibility.
[ ] No unsupported revenue guarantee.
[ ] No unsupported competitor claim.
[ ] Free report does not expose the full fix roadmap.
[ ] Paid CTA copy is visible and understandable.
[ ] Email link works.
[ ] Mission Control/status reflects sent/held state.
[ ] Rendered report/email body was personally read exactly as recipient will see it.
[ ] No internal workflow/operator wording appears in visible output.
[ ] 0/N AI appearances never displays a flattering rank; it displays Not ranked / AI Presence.
[ ] Competitor claims include only client-supplied or operator-approved competitors.
[ ] Search/API/provider fallback evidence is not rewritten as AI recommendation proof.
[ ] Release Captain final review is recorded as APPROVED.
```

## Recommended Friday stance

Public positioning:

```txt
VizBiz is doing a controlled soft launch for local businesses that want to understand whether AI-powered search can clearly understand, trust, and recommend them.
```

Founder note:

```txt
Reports are reviewed for evidence quality. If the snapshot needs manual review, we would rather hold it briefly than send a generic or misleading report.
```

That line is not weakness. It is trust infrastructure. The cheap bots can send instant garbage; VizBiz should not join that clown parade.
