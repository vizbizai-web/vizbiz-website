# VizBiz Fix Kit — Artifact Generator Spec (Phase 1)

Purpose: turn the $88 One-Time Fix from "report with recommendations" into
"report + ready-to-implement artifact pack." Every artifact is generated
from data the pipeline already has (niche profile, SEO audit, research
results, paid intake answers), validated mechanically, reviewed by the
operator in Mission Control, and delivered as a downloadable pack.

Design rules (same philosophy as the niche resolver):
- Artifacts are generated from evidence, never from generic templates with
  the business name swapped in. Placeholder text surviving to a client is
  a hard failure.
- Every artifact passes mechanical validation before operator review.
- Wrong-vertical term blocklists (G2) run on every artifact.
- Nothing ships without Mission Control approval.

---

## 1. The artifacts

### A1. Schema package (`schema.jsonld` + instructions)

Generated JSON-LD containing, as applicable per business:
- `LocalBusiness` (or the closest specific subtype: `LegalService`,
  `MedicalBusiness`, `AutoDealer`, `HomeAndConstructionBusiness`, etc. —
  chosen from the resolved niche, falling back to `LocalBusiness`)
  with name, address (from Places when domain-matched), phone, URL,
  geo, openingHours (when known), priceRange omitted unless known
- `Service` entries — one per service in the resolved profile
- `FAQPage` — wrapping the FAQ content block (A5)
- `BreadcrumbList` for the main pages found in the crawl

Inputs: resolved niche profile, Places enrichment (domain-matched only),
crawl page list, SEO audit findings (what schema already exists — never
duplicate types the site already has; the audit knows).

Validation: JSON parses; schema.org required fields present per type;
no placeholder strings (`{`, `[TODO`, `EXAMPLE`, `Lorem`, `INSERT`);
address only included when Places matchMethod === website_domain;
G2 vertical blocklist scan.

Output: one `.jsonld` file + a plain-language instruction card:
what it is, why it matters (one sentence), where it goes (inside
`<head>` via a script tag — exact snippet provided), and the
"forward to your web person" paragraph.

### A2. llms.txt

Markdown file following the llms.txt convention:
- H1: business name
- Blockquote: one-sentence description in the business's own vocabulary
  (from the resolved niche — never generic)
- Sections: Services (from profile), Service Area (from profile),
  Key Pages (top crawled URLs with one-line descriptions), Contact
- Optional: Credentials/Proof section from paid intake trust answers

Validation: every service listed must exist in the resolved profile;
every URL must come from the actual crawl; no placeholders; G2 scan;
under 200 lines.

Output: `llms.txt` + instruction card (upload to site root, exact path).

### A3. AI crawler access report + robots.txt patch

Check the live robots.txt for: GPTBot, OAI-SearchBot, PerplexityBot,
ClaudeBot, Claude-SearchBot, Google-Extended, BingBot, CCBot.

Output: a one-page status table (allowed / blocked / not mentioned →
effective default), and if anything relevant is blocked, a corrected
robots.txt snippet with a clear warning card ("your site is currently
invisible to X because of this line"). If nothing is blocked, the
report says so — a clean bill of health is also a deliverable.

Validation: parse-only, no LLM needed. Deterministic.

### A4. Title / meta / H1 rewrite package

For each crawled page (up to the paid-tier page cap): current title,
current meta description, current H1 → proposed rewrites.

Rewrite rules fed to the generator:
- Lead with the specific niche + location where natural
  ("Tax Resolution Specialist in Kitchener | Clearpath"), never
  keyword-stuff
- Meta descriptions: 140–160 chars, answer-shaped (these get quoted by
  AI engines), include one concrete proof point when available from
  the profile (years, rating, specialty)
- H1s state what the business does in its own vocabulary
- Never invent claims (awards, years in business, ratings) not present
  in profile/Places/intake evidence

Validation: length limits enforced mechanically; every factual claim
must trace to a profile/Places/intake field (same evidence discipline
as the niche resolver); G2 scan; no placeholders.

Output: a before/after table per page + instruction card.

### A5. FAQ content block

6–10 Q&A pairs engineered from the prompts the business LOST in
research (the "Where You're Invisible" rows are the input — each lost
buyer query becomes a question the site should answer).

Rules:
- Questions phrased the way buyers ask (reuse the actual tested prompt
  phrasing where natural)
- Answers: 40–80 words, direct answer in the first sentence (answer-
  engine shaped), business's own vocabulary, location-anchored where
  relevant, factual claims traceable to evidence
- Include the matching FAQPage JSON-LD (feeds A1)

Validation: each Q maps to a lost prompt or paid-intake customer
question; claims traceable; G2 scan; no placeholders.

Output: formatted FAQ document (copy-paste ready HTML + plain text) +
instruction card ("add to your services page or a dedicated FAQ page").

### A6. Google Business Profile optimization document

Generated from Places data + resolved profile:
- Primary/secondary category recommendations (current vs proposed,
  with the reason)
- Business description rewrite (750 chars, niche-specific)
- Services list to add (from profile)
- 5 seeded Q&A pairs for the GBP Q&A section
- Review ask templates: one email, one SMS, one in-person script —
  written in the business's voice, asking for service-specific reviews
  (reviews mentioning the service+city are AI citation fuel)
- Posting cadence suggestion (1/week, with 4 example post drafts)

Validation: category recommendations only from the official GBP
category list (maintain as a data file); claims traceable; G2 scan.

Output: one document + instruction card. (This artifact is also the
backbone of Vertical Pro fulfillment — same generator, but the operator
implements instead of the client.)

### A7. Implementation roadmap (the cover page)

One page that orders A1–A6 by impact-for-effort for THIS client based
on the audit findings (e.g., if robots.txt blocks GPTBot, that's #1;
if schema is absent, that's high; if metas are decent, rewrites rank
lower). Each item: what / why in one sentence / who does it (you vs
your web person) / time estimate. Ends with the 30-day re-scan promise
and date.

---

## 2. Generation pipeline

New module: `src/lib/fix-kit-generator.ts`

```
generateFixKit(input: FixKitInput): Promise<FixKitResult>
```

Inputs (typed, nothing else): resolved niche profile, SEO audit result,
research results (lost/won prompts), Places enrichment, paid intake
answers, crawl page data.

Flow per artifact:
1. Deterministic assembly where possible (A3 entirely; A1 structure;
   A6 categories).
2. LLM generation for prose (A4 rewrites, A5 answers, A6 description,
   A2 description) — NICHE_PASS2_MODEL, temperature 0, structured
   output, one call per artifact with the relevant evidence pack.
3. Mechanical validation per artifact (rules above). Validation failure
   → one retry → on second failure mark artifact `needs_operator_edit`
   instead of shipping or silently dropping.
4. Persist: `fix_kits` table — leadId, version, per-artifact status
   (generated / needs_operator_edit / approved / delivered), content,
   generation timestamp, evidence hash.

## 3. Mission Control integration

Fix Kit tab on the paid lead detail page:
- Per-artifact preview with approve / edit / regenerate actions
  (edits persist — unlike the current Email Hub save bug, which gets
  fixed as part of this work)
- "Approve all & package" assembles the delivery pack
- Pack delivery blocked until every artifact is approved

## 4. Packaging & delivery

- Client-facing Fix Kit page: `/report/[leadId]/fix-kit` — gated to
  paid + approved status. Each artifact as a card: instruction text,
  copy button, file download. Plus a single "Download everything
  (.zip)" button.
- The "send to your web person" email: pre-written, client just
  forwards it; contains the technical artifacts and instructions,
  none of the business-strategy content.
- Delivery email via existing Resend path, subject:
  "{Business}: your AI visibility Fix Kit is ready" — gated on
  operator approval like everything else.

## 5. 30-day re-scan hook

On Fix Kit delivery: insert a scheduled rerun row (reuse
/api/cron/process-reruns) dated +30 days, flagged `rescan_after_fix`.
The rescan output stores alongside the original as before/after.
(Full trend/snapshot architecture is Phase 3 — this is the minimal
two-point version: original score vs post-fix score, rendered as a
simple before/after delta in the report and email.)

## 6. Prompt depth change

Paid tier limits: raise sonarPrompts 20 → 60 drawn from the 84-prompt
generator (skip categories irrelevant to the business type — e.g.
Inventory & Availability for service businesses). Keep free at 5.
Verified cost impact: under $0.40/audit additional. Update report copy
to state the honest number of prompts tested per tier.

## 7. Acceptance fixtures

Run the generator against the existing QA-fixture profiles
(med spa, tax resolution, audio supplier, Spanish supplier, dealership):
- Zero placeholder strings in any artifact (mechanical grep)
- Zero G2 blocklist hits cross-vertical (dealership terms in the med
  spa kit = fail; dealership kit MAY contain them = inverse test)
- A1 parses as valid JSON-LD with required fields
- A4 claims-traceability: spot-check that no rewrite invents facts
- Spanish supplier: artifacts generate in Spanish
- needs_operator_edit path: force a validation failure and confirm it
  surfaces in Mission Control instead of shipping
```
