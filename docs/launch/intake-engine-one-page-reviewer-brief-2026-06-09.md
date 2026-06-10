# VizBiz Intake Engine — One-Page Reviewer Brief

Last verified: 2026-06-09  
Purpose: outside technical/product review of the current free-intake → free-report pipeline.

## What VizBiz is trying to do

VizBiz helps local businesses understand whether AI/search systems can identify, trust, and recommend them. The free intake engine takes a business website, location, primary service/niche, and up to two competitors, then creates an evidence-based AI visibility snapshot. The goal is not generic SEO; it is AI recommendation readiness for local businesses.

## Current pipeline flow

```txt
Homepage form
→ /api/pipeline/intake
→ Supabase lead record, Google Sheets fallback
→ Telegram operator alert
→ /api/pipeline/preflight
→ Firecrawl/fetch website crawl
→ SEO/llms/sitemap/schema/review checks
→ Google Places enrichment
→ Business Intelligence Profile
→ /api/pipeline/research
→ prompt generation from profile evidence
→ Perplexity Sonar AI-search checks
→ Tavily/Brave web-search fallback + competitor/source discovery
→ scoring + evidence labels
→ /api/pipeline/review
→ pending operator approval
→ report page stays blocked until ready/approved
```

## Core principle

The intended architecture is:

```txt
Evidence → Business Intelligence Profile → prompt plan → research → gated report
```

The engine should not start with a hardcoded industry category and force everything into stale templates. Taxonomy exists, but should be secondary. The pipeline should first determine what the business actually is from website evidence, submitted service/niche, Google Places, schema, content, and supplied competitors.

## Important current tools/providers

- **Supabase**: primary CRM/source of truth when configured.
- **Google Sheets**: legacy fallback through compatibility adapter.
- **Telegram**: operator alerts for intake, research completion, and review status.
- **Firecrawl**: primary website crawler; maps and scrapes multiple pages with JS rendering.
- **Fetch crawler**: fallback if Firecrawl fails.
- **SEO auditor**: checks schema, `llms.txt`, title/meta/H1 style signals, machine readiness.
- **Google Places API**: validates/enriches client business and supplied competitors; reviews, rating, address, website match, place types.
- **Perplexity Sonar**: AI-search answer/citation evidence for generated prompts.
- **Tavily**: web-search fallback and citation/competitor discovery support.
- **Brave Search**: backup fallback if Tavily fails.
- **Resend**: report email delivery, currently blocked until approval.
- **Vercel/Next.js**: app/API runtime; `after()` triggers follow-up stages after responses.

## Intake fields that must survive end-to-end

Visible homepage fields:

- business name
- email
- website URL
- city / ZIP / postal code / market
- primary service / niche
- competitor 1
- competitor 2

Current mapping:

```txt
primaryService → businessCategory
competitorOne → competitor
competitorTwo → competitor2
```

Important: older internal names like `dealershipName` still exist for compatibility. This should not mean the engine is dealership-only.

## What improved recently

- Homepage now passes **primary service/niche** into the pipeline.
- Competitor 1 and competitor 2 are submitted as separate fields instead of one comma string.
- Preflight now derives a more human business type from title/meta/body evidence.
- Research uses the Business Intelligence Profile before taxonomy prompts.
- Client-declared category can override automated classification and regenerate prompts.
- Stale prompt guardrails rebuild mismatched vertical prompts, such as dealership language on a non-auto business.

## Current scoring shape

Free report scoring is currently simple:

```txt
appearedCount = prompts where business appeared
totalPrompts = total prompts tested
appearanceRate = appearedCount / totalPrompts
```

Bands:

```txt
Strong   ≥ 70%
Moderate ≥ 40%
Weak     < 40%
```

This is not yet the full hybrid AVI score. It is a free-report snapshot based mainly on prompt appearance plus supporting machine-readiness and evidence signals.

## Competitor policy

- Ask for exactly two competitors.
- If supplied, competitor mode is `client_provided`.
- If not supplied, mode is `client_only`.
- Auto-discovered competitors are internal-only until confirmed or approved.
- Client-only reports should not invent competitor scores, ranks, AI share, or revenue gaps.

## Report gating

The report page should stay blocked until:

- lead exists
- research is complete
- research data parses correctly
- access state is ready/approved

Client email is blocked until operator approval. The report renderer should not expose internal workflow language, fake competitors, wrong-niche prompts, impossible metrics, or fallback evidence as if it were true AI recommendation proof.

## Best second-opinion review questions

1. Does every visible intake field survive through frontend → API → Supabase → preflight → research → report?
2. Should competitors be stored as a true structured array everywhere instead of split/join compatibility strings?
3. Should submitted primary service/niche be a first-class Supabase column, not mostly notes/raw intake?
4. Can stale vertical prompts still survive into research after the guardrails?
5. Can Tavily/Brave fallback be mislabeled as true AI visibility?
6. Are free-mode cost/runtime limits actually enforced?
7. Is Google Places enrichment reliably returning real production data?
8. Is the Perplexity Sonar endpoint/model current and correctly configured?
9. Is the review gate strong enough, or should it hard-block wrong vertical terms, weak niche confidence, fallback-only provider evidence, and unsafe copy?
10. Should preflight/research/report artifacts move out of overloaded `notes` into dedicated Supabase tables?
11. Should report rendering consume only a canonical client-safe payload instead of raw research JSON?
12. Do any legacy dealership field names or templates create future wrong-niche risk?

## Reviewer target outcome

The most valuable outside review is not “is this clever?” It is:

- Where can wrong business type/niche still enter?
- Where can structured intake data be lost?
- Where can fallback/search evidence be overclaimed?
- Where can unapproved competitors leak client-facing?
- Where can reports render facts not proven by the pipeline?

Recommended next hardening move:

```txt
Create one end-to-end contract test that submits a fake lead with a unique business name, unique primary service, two unique competitors, and UTM/referrer data. Assert those exact fields survive through intake, Supabase, preflight, research input, parsed report data, and rendered report copy where appropriate.
```
