# VizBiz Intake Engine — Current State Document

Last verified: 2026-06-09 15:26 EDT  
Owner: VizBiz.ai  
Purpose: Give an outside reviewer a clear view of the current free-intake → free-report pipeline, the logic paths, tools/providers, guardrails, and known weak spots.

This document describes the current production code path, not the ideal future architecture. It intentionally avoids API keys, secrets, or private customer data.

---

## 1. Executive summary

VizBiz’s free intake engine is a staged pipeline that converts a website form submission into an evidence-based AI visibility snapshot.

The current flow is:

```txt
Homepage intake form
→ /api/pipeline/intake
→ durable lead record in Supabase, with Google Sheets as legacy fallback
→ Telegram operator alert
→ async preflight
→ website crawl + metadata/schema/llms/sitemap/review checks + Google Places enrichment
→ Business Intelligence Profile
→ async research
→ prompt generation from the Business Intelligence Profile
→ Perplexity Sonar AI-search checks, with Tavily/Brave web-search fallback
→ competitor validation and internal competitor discovery
→ score/status calculation
→ pending operator review
→ public report page remains blocked until approval gates pass
```

The important architectural principle is:

```txt
Evidence → Business Intelligence Profile → prompt plan → research → gated report
```

The engine should not start with a hardcoded industry guess and force the report around that guess. Taxonomy still exists, but it is supposed to be secondary compatibility glue, not the brain.

---

## 2. Primary code paths

Main user-facing intake:

- `src/app/HomeContent.tsx`
- `src/app/api/pipeline/intake/route.ts`

Pipeline orchestration:

- `src/lib/pipeline-controller.ts`
- `src/app/api/pipeline/preflight/route.ts`
- `src/app/api/pipeline/research/route.ts`
- `src/app/api/pipeline/review/route.ts`
- `src/app/api/pipeline/process/route.ts`

Evidence/profile/research:

- `src/lib/preflight-engine.ts`
- `src/lib/site-scraper.ts`
- `src/lib/seo-auditor.ts`
- `src/lib/places-client.ts`
- `src/lib/research-runner.ts`
- `src/lib/prompt-curator.ts`
- `src/lib/full-prompts.ts`
- `src/lib/query-fanout.ts`
- `src/lib/competitor-discovery.ts`
- `src/lib/tavily-client.ts`
- `src/lib/social-signals.ts`

Persistence/report rendering:

- `src/lib/google-sheets.ts` — compatibility adapter; Supabase primary when configured
- `src/lib/report-data.ts`
- `src/app/report/[leadId]/page.tsx`
- `src/app/report/[leadId]/report-content.tsx`

Important project policy docs:

- `docs/launch/vizbiz-pipeline-source-of-truth.md`
- `docs/launch/report-quality-architecture-reset.md`
- `AGENTS.md`

---

## 3. External tools and providers currently used

### Supabase

Role: primary CRM/source of truth when configured.

Used by:

- `src/lib/google-sheets.ts`

Required env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Current behavior:

- If Supabase env vars are configured, lead writes and reads go through Supabase REST.
- Lead rows are written to `leads`.
- Intake events are written to `lead_events` when possible.
- The old `google-sheets.ts` import surface remains for compatibility, but the file routes to Supabase first.

Stored/derived Supabase fields include:

- `business_name`
- `email`
- `website_url`
- `submitted_location`
- `submitted_niche`
- `competitor_1_name`
- `competitor_2_name`
- `competitor_source`
- `status`
- `source`
- `raw_intake`

### Google Sheets legacy fallback

Role: older CRM fallback / compatibility layer.

Used by:

- `src/lib/google-sheets.ts`

Required env if Supabase is not used:

- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_KEY`

Current behavior:

- If Supabase is not configured, lead rows can still be appended to Google Sheets.
- Pipeline state columns are maintained for lock/status/retry/report tracking.
- The code comments say Google Sheets should be optional legacy fallback only, not the launch-critical source of truth.

### Telegram alerts

Role: operator notifications.

Used by:

- `src/lib/telegram-alerts.ts`
- intake route
- research route
- review route

Current behavior:

- Intake route sends a lead alert after durable storage.
- Research route sends a “research complete” alert with score, report link, and mode.
- Review route sends a “ready/needs operator review” alert and blocks client email until approval.

### Firecrawl

Role: website crawling and JavaScript-rendered content extraction.

Used by:

- `src/lib/site-scraper.ts`
- called by `src/lib/preflight-engine.ts`

Required env:

- `FIRECRAWL_API_KEY`

Current behavior:

- Scrapes homepage via Firecrawl `/scrape`.
- Uses Firecrawl `/map` to discover pages.
- Prioritizes and scrapes up to `MAX_PAGES = 15` pages in batches of 3.
- Extracts markdown and HTML.
- Also performs a raw HTML fetch because Firecrawl-rendered output can sanitize or omit useful schema/link details.
- Falls back to basic fetch crawl if Firecrawl fails or is unavailable.

Firecrawl helps with:

- JavaScript-rendered sites
- Shopify/React-style sites
- markdown extraction
- page discovery
- richer website body evidence

### Basic fetch crawler fallback

Role: fallback when Firecrawl fails.

Used by:

- `src/lib/site-scraper.ts`

Current behavior:

- Fetches the site directly with a browser-like user agent.
- Extracts HTML/text from reachable pages.
- Less robust than Firecrawl for JS-heavy sites.

### SEO auditor

Role: machine-readiness/technical signal extraction.

Used by:

- `src/lib/preflight-engine.ts`
- `src/lib/seo-auditor.ts`

Inputs:

- scraped HTML
- website URL
- `llms.txt` content when available

Checks include:

- schema presence/types
- `llms.txt`
- title/meta/H1 style signals
- content quality
- machine-readiness score

The preflight score currently uses SEO audit `overallScore` when available.

### `llms.txt` checker

Role: AI-readiness signal.

Used by:

- `fetchLlmsTxt()` in `src/lib/site-scraper.ts`
- `preflightScan()` in `src/lib/preflight-engine.ts`

Current behavior:

- Checks whether the target website exposes an `llms.txt` file.
- Uses this as a machine-readiness signal, not as proof that AI systems recommend the business.

### Sitemap checker

Role: crawlability/content depth signal.

Used by:

- `countIndexedPages()` in `src/lib/preflight-engine.ts`

Current behavior:

- Tries:
  - `/sitemap.xml`
  - `/sitemap_index.xml`
  - `/sitemap-index.xml`
- Counts `<url>` entries if found.
- Stores `indexedPages` as a preflight signal.

### Google Places API

Role: local entity validation and competitor validation/enrichment.

Used by:

- `src/lib/places-client.ts`
- `src/lib/preflight-engine.ts`
- `src/lib/research-runner.ts`
- `src/lib/competitor-discovery.ts`

Required env:

- `GOOGLE_PLACES_API_KEY`

Optional control flag:

- `ENABLE_GOOGLE_PLACES_ENRICHMENT=false` disables enrichment.

Current behavior:

- Geocodes the submitted city/location.
- Searches Google Places for the client business.
- Captures:
  - place ID
  - display name
  - formatted address
  - city match
  - website match
  - Google Maps URL
  - rating
  - review count
  - business status
  - Google place types
  - coordinates
  - validation status/confidence/warnings
- Calculates a local entity trust score.
- Validates/enriches client-provided competitors.

Important caveat for reviewer:

- Google Places is used as local/entity evidence, not as a guarantee of AI recommendation visibility.

### Perplexity Sonar API

Role: AI-search answer/citation evidence.

Used by:

- `src/lib/research-runner.ts`

Required env:

- `PERPLEXITY_API_KEY`

Optional env:

- `PERPLEXITY_MODEL`, default `sonar`

Current behavior:

- For each prompt, calls Perplexity Sonar.
- Checks whether the target business appears in:
  - answer text
  - website/domain mention
  - citations
- Stores provider evidence per prompt.
- Batches prompt checks in groups of 5 with a small delay between batches.

Important wording caveat:

- Sonar provides AI-search/citation evidence. It is not the same as checking every consumer AI surface such as ChatGPT, Google AI Overview, Gemini, Claude, etc.

### Tavily

Role: web-search fallback and competitor/source discovery.

Used by:

- `src/lib/tavily-client.ts`
- `src/lib/research-runner.ts`

Required env:

- `TAVILY_API_KEY`

Current behavior:

- Used as fallback if Perplexity is missing or fails.
- Also used alongside AI checks for competitor discovery and citation/source analysis.
- Outputs are treated as web evidence, not true AI recommendation proof.

### Brave Search

Role: fallback if Tavily fails or is unavailable.

Used by:

- `src/lib/research-runner.ts`

Required env:

- `BRAVE_SEARCH_API_KEY`

Current behavior:

- Maps Brave web results into Tavily-like result shape.
- Used when Tavily is unavailable/fails.

### Resend

Role: report email delivery, not part of the core intake-to-report research path.

Used by:

- `src/lib/resend-mailer.ts`
- `src/lib/report-email.ts`
- `src/app/api/send-report-email/route.ts`

Important current rule:

- Free report email delivery is blocked until the report is approved/operator-safe. Intake/research can complete without sending the email.

### Vercel / Next.js runtime

Role: hosted Next.js app and serverless route execution.

Used by:

- all `src/app/api/**` routes

Current behavior:

- Intake route returns quickly.
- Preflight and research routes are async-ish staged serverless routes with `maxDuration` settings.
- Next/Vercel `after()` is used to trigger follow-up stages after a response instead of unreliable plain fire-and-forget fetches.

---

## 4. Intake form fields and normalized payload

Homepage form code:

- `src/app/HomeContent.tsx`

Visible/prospect-facing fields:

- Business name
- Email
- Website URL
- City / ZIP / postal code / market
- Primary service / niche
- Competitor 1
- Competitor 2

Form submit behavior:

- Sends `FormData` to `/api/pipeline/intake`.
- Normalizes website URL by prefixing `https://` if scheme is missing.
- Captures UTM params from current URL.
- Captures browser referrer.
- Captures timezone, UTC offset, and locale.

Important current mapping:

```txt
name                → name
name                → dealershipName            legacy field name still used internally
email               → email
websiteUrl          → websiteUrl, normalized
city                → cityMarket
primaryService      → businessCategory
competitorOne       → competitor
competitorTwo       → competitor2
source              → hero form
originalCta         → Show my score preview + prepare email report
originalPage        → /
utm_*               → utmSource/utmMedium/etc.
referrer            → referrer
timezone/offset     → timezone/utcOffset
locale              → locale
```

Legacy naming caveat:

- Some fields still use `dealershipName` internally for backward compatibility.
- This does not mean the product is dealership-only.
- A reviewer should not interpret the internal field name as the intended niche logic.

---

## 5. Stage 1 — `/api/pipeline/intake`

File:

- `src/app/api/pipeline/intake/route.ts`

Goal:

- Validate intake.
- Store lead durably.
- Alert operator.
- Start preflight.
- Return quickly without exposing a report link.

Required fields:

- `name`
- `dealershipName`
- `email`
- `phone`
- `websiteUrl`
- `cityMarket`

Current note:

- Homepage sends `phone = Not provided` because phone is not a visible required form field.

Validation/normalization:

- Accepts JSON or form data.
- Trims strings.
- Lowercases email.
- Normalizes website URL.
- Determines competitor mode:

```txt
if competitor or competitor2 exists:
  competitorMode = client_provided
else:
  competitorMode = client_only
```

Durable write:

- Calls `appendLead()` from `src/lib/google-sheets.ts`.
- If Supabase is configured, writes to Supabase.
- If not, falls back to Google Sheets.
- If write fails, returns `503` and does not proceed.

Operator alert:

- Sends Telegram lead alert after storage.
- Includes lead ID, business, website, city, attribution, competitor mode, and competitors if supplied.

Preflight trigger:

- Uses `after()` to POST `{ leadId }` to `/api/pipeline/preflight/` after the response.
- This is intentional because un-awaited serverless fetches can freeze after response.

Client response:

- Returns `{ success, leadId, redirectUrl, reportReady: false }`.
- Does not expose a final report link at intake time.
- Redirect goes to a post-intake/thank-you style page while report is still processing.

---

## 6. Persistence layer — Supabase first, Sheets fallback

File:

- `src/lib/google-sheets.ts`

Despite the filename, this file now acts as a CRM compatibility adapter.

Current source-of-truth selection:

```txt
if NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY exist:
  use Supabase REST
else:
  use Google Sheets legacy path
```

Supabase lead insert:

- Splits submitted competitors into `competitor_1_name` and `competitor_2_name`.
- Writes `competitor_source = submitted` if either competitor exists, otherwise `missing`.
- Stores a large compatibility payload in `raw_intake`.
- Inserts a `lead_events` row with event type `intake_submitted` where possible.

Known shape weakness:

- The Supabase compatibility adapter still receives competitors as a joined compatibility string in some paths, then splits it.
- The frontend now sends two separate fields, but the adapter still has legacy split logic.
- Recommendation: move the storage contract to a true `competitors: [{ name, website, source }]` structure across all routes.

---

## 7. Stage 2 — `/api/pipeline/preflight`

Files:

- `src/app/api/pipeline/preflight/route.ts`
- `src/lib/pipeline-controller.ts`
- `src/lib/preflight-engine.ts`

Goal:

- Build the Business Intelligence Profile from evidence before research prompts are generated.

Route behavior:

- Requires `leadId`.
- Calls `runPreflightStage(leadId)`.
- Uses `maxDuration = 120`.
- On success, uses `after()` to trigger `/api/pipeline/research/`.

Controller behavior:

1. Loads lead by lead ID.
2. Skips if preflight already complete unless `force` is true.
3. Acquires a lock.
4. Sets status:

```txt
status = preflight_running
researchStatus = pending
lastStage = preflight
preflightStartedAt = now
```

5. Parses any paid intake payload from notes if present.
6. Parses `ClientBusinessCategory` from notes if present.
7. Runs `preflightScan(lead.website, lead.city, lead.dealershipName)`.
8. Applies client-declared niche override if provided.
9. Parses competitors from paid intake first, then durable lead competitor field.
10. Stores preflight JSON in lead notes.
11. Updates lead fields and releases lock.

Client-declared niche override:

- If the intake/payload includes a business category, it overrides automated classification.
- It regenerates queries from the declared category.
- It sets niche confidence to 100.
- This is designed to prevent stale automated prompt logic from overpowering user-provided service/niche evidence.

---

## 8. Preflight evidence collection and logic

File:

- `src/lib/preflight-engine.ts`

Function:

- `preflightScan(url, intakeCity, businessName)`

### 8.1 Website scrape

Calls:

- `scrapeSite(url)` from `site-scraper.ts`
- `fetchLlmsTxt(url)`

Collected from scrape:

- HTML
- markdown/text content
- page title
- render method (`firecrawl` or `fetch`)
- page count
- discovered page URLs
- social links
- contact info
- schema.org data
- Open Graph data
- Google Business profile URL/place ID if visible in page HTML
- navigation links
- meta title/description/keywords/canonical/robots/html language

### 8.2 SEO/machine-readiness audit

Calls:

- `runSEOAudit(scraped.html, url, llmsTxtContent)`

Stores:

- overall score
- schema types
- issue count
- `hasSchema`
- `hasLlmsTxt`
- content quality

### 8.3 Extra AI discovery checks

Checks:

- Bing Webmaster Tools verification meta tag
- blog/news/resource section
- sitemap indexed page count
- reviews/testimonials/review schema

Stored fields:

- `bingWmtVerified`
- `hasBlog`
- `blogUrl`
- `indexedPages`
- `hasReviews`

### 8.4 Google Places enrichment

Calls:

- `enrichBusinessProfile(placesLookupName, placesCity, url)`
- `calculateLocalEntityTrustScore(enrichment)`

Lookup name:

- submitted business name if available
- otherwise domain fallback

Lookup city:

- submitted city/location

Stores:

- Google place ID
- display name
- formatted address
- city match
- website match
- Maps URL
- rating/review count
- business status
- Google place types
- validation status/confidence/warnings
- local entity trust score

If city is missing:

- Google Places enrichment is skipped and marked unavailable.

### 8.5 Business identity separation

Primary function:

- `separateBusinessIdentityFromEvidence()`

Goal:

Separate:

- what the business is
- what services it provides
- who it serves
- what market/location it serves
- what language customers likely search in

Inputs:

- URL
- meta title
- meta description
- scraped title
- body evidence text
- HTML language
- market/intake city
- Google Places types
- business name

Outputs:

- `niche`
- `businessType`
- `services`
- `customerSegments`
- `primaryMarket`
- `serviceAreas`
- `serviceAreaEvidence`
- `promptMarketStrategy`
- `siteLanguage`
- `searchLanguage`
- `confidenceReason`

Current behavior:

- Detects a human business type from page title/meta/body patterns.
- Rejects candidates that are just the business name masquerading as business type.
- Detects service terms separately from customer segments.
- Detects language from HTML language and text signals.
- Uses Google Places types as supporting evidence.

### 8.6 Niche/taxonomy handling

The pipeline still creates a `niche` slug for compatibility.

Current logic:

- Keyword detection creates an initial niche when obvious.
- If the detected niche is generic but a strong human business type is found, the code creates a slug from that business type.
- Deterministic guardrails override known false-positive cases.
- Taxonomy is not supposed to dominate over stronger website/Places/intake evidence.

Examples of guardrail families:

- Endermologie / LPG / body contouring
- Functional nutrition / eczema / psoriasis
- Electrical contractors
- Pro audio / AV systems
- Food ingredient suppliers where Spanish `salsas` must not become dance-studio logic
- Beauty/wellness blocking false car-dealership classification

### 8.7 Evidence-first query generation

Function:

- `buildEvidenceFirstQueries()`

Inputs:

- `businessType`
- `services`
- `market`
- `intakeCity`
- `customerSegments`
- `primaryMarket`
- `serviceAreas`

Outputs:

- `suggestedSearchQueries`
- `competitorSearchQueries`

Example shape:

```txt
I need a trusted {businessType} in {market}. Who should I choose?
Which {businessType}s near {market} have good reviews and clear proof?
best {businessType} in {market}
trusted {primaryService} provider in {market}
{businessType} with good reviews in {market}
```

The query safety gate rebuilds queries when:

- niche is generic/unknown
- confidence is weak
- fewer than five usable queries exist
- stale vertical language appears that does not match evidence

### 8.8 Preflight output

Stored preflight fields include:

- `niche`
- `nicheLabel`
- `valueProposition`
- `pricingInfo`
- `estimatedRevenueGap`
- `aiReadinessScore`
- `businessType`
- `targetAudience`
- `services`
- `customerSegments`
- `siteLanguage`
- `searchLanguage`
- `market`
- `primaryMarket`
- `serviceAreas`
- `promptMarketStrategy`
- `searchLangCode`
- `suggestedSearchQueries`
- `competitorSearchQueries`
- `clientDeclaredNiche`
- `paidIntake`
- `customerQuestions`
- `socialLinks`
- `contactInfo`
- `schemaOrg`
- `openGraph`
- `googleBusiness`
- `hasLlmsTxt`
- `hasSchema`
- `contentQuality`
- `googlePlaceEnrichment`
- `localEntityTrustScore`
- `seoAudit` summary
- `competitorMode`
- `competitors`
- `researchMode`

---

## 9. Research mode limits

File:

- `src/lib/pipeline-controller.ts`

Current central limits:

### Free mode

```txt
sonarPrompts: 5
firecrawlPages: 5
runCompetitorDiscovery: false
runCompetitorAnalysis: false
runFullSeoAudit: false
runGooglePlacesEnrichment: true
runSocialSignals: false
runQueryFanout: false
runYouTubeScoring: false
sonarModel: sonar
```

Important caveat:

- These config flags are defined as the intended cost-control source of truth.
- Not every flag is fully enforced inside the current `research-runner.ts`; some non-blocking social/fan-out/AI-discovery logic still runs in code paths regardless of mode. Reviewer should check enforcement if cost/runtime control is a concern.

### Paid mode

```txt
sonarPrompts: 20
firecrawlPages: 15
runCompetitorDiscovery: true
runCompetitorAnalysis: true
runFullSeoAudit: true
runGooglePlacesEnrichment: true
runSocialSignals: true
runQueryFanout: true
runYouTubeScoring: true
sonarModel: sonar
```

### Full mode

```txt
sonarPrompts: 30
firecrawlPages: 25
runCompetitorDiscovery: true
runCompetitorAnalysis: true
runFullSeoAudit: true
runGooglePlacesEnrichment: true
runSocialSignals: true
runQueryFanout: true
runYouTubeScoring: true
sonarModel: sonar-pro
```

---

## 10. Stage 3 — `/api/pipeline/research`

Files:

- `src/app/api/pipeline/research/route.ts`
- `src/lib/pipeline-controller.ts`
- `src/lib/research-runner.ts`

Goal:

- Generate prompt checks from the Business Intelligence Profile.
- Run AI-search/web evidence checks.
- Track target and competitor appearances.
- Store research results.
- Mark report for operator review.

Route behavior:

- Requires `leadId`.
- Calls `runResearchStage(leadId)`.
- Uses `maxDuration = 300`.
- Sends Telegram research-complete alert.
- Uses `after()` to trigger `/api/pipeline/review/`.

Controller behavior:

1. Loads lead.
2. Skips if research is already complete unless forced.
3. Parses preflight JSON from notes.
4. Extracts `competitorMode` and `competitors` from preflight.
5. Acquires lock.
6. Sets status:

```txt
status = researching
researchStatus = running
lastStage = research
researchStartedAt = now
```

7. Calls `runResearch()` with:

- business name
- website
- city
- competitors
- preflight profile
- `competitorMode`
- max prompts from research mode
- tier/mode

8. Stores research JSON in notes.
9. Updates lead fields:

```txt
snapshotAppeared = {appearedCount} of {totalPrompts}
visibilityBand = statusBand
serviceVisibility = serviceVisibility
internalCompetitorSuggestions = JSON
placesValidationStatus = complete/skipped
sonarValidationStatus = complete
status = pending_review
researchStatus = complete
```

---

## 11. Research runner logic

File:

- `src/lib/research-runner.ts`

Function:

- `runResearch()`

### 11.1 Business Intelligence Profile is required

Current behavior:

- If no preflight profile is supplied, `runResearch()` runs `preflightScan()` itself.
- It refuses to use legacy finite taxonomy fallback if profile generation fails.

This is a key anti-regression guard.

### 11.2 Prompt source priority

Priority order:

1. `preflightProfile.customerQuestions` from paid intake, if present.
2. `preflightProfile.suggestedSearchQueries`, if at least five exist.
3. Paid/full prompt expansion seeded by profile fields.
4. Taxonomy fallback prompt set only if no profile-first query set exists.

Free mode usually takes profile-first queries and limits them to 5 prompts.

### 11.3 Prompt contamination guard

Functions:

- `rebuildPromptsFromScrapedProfileIfContaminated()`
- `verifyPromptQuality()`

Purpose:

- Catch stale vertical leakage after prompt generation.

Blocks/rebuilds prompts containing mismatched stale terms such as:

- car/dealer/dealership/inventory/trade-in language when the business is not auto
- jewelry/ring/silversmith/artisan language when the business is not that
- other stale vertical drift detected by regex

If bad prompts are found, deterministic replacements are generated from the business type.

### 11.4 Competitor handling

Inputs:

- `competitorMode`
- `competitors[]`

Modes:

```txt
client_provided:
  validate/enrich supplied competitors via Google Places
  use supplied competitors for competitor checks/scoring

client_only:
  do not use auto-discovered competitors in client-facing scoring
  still collect internal competitor suggestions for operator review
```

Client-provided competitor validation:

- `validateCompetitorViaPlaces(comp, city)`
- `enrichCompetitor(comp, city)`

Outputs:

- resolved competitor names
- ratings
- review counts
- distance from client when available
- validation status

Internal discovery:

- The runner scans web/search results for recurring business-like names/domains.
- Filters directories/platforms/generic names.
- Stores suggestions in `internalCompetitorSuggestions`.
- In `client_only` mode, these suggestions are internal and must not appear as confirmed client-facing competitors.

### 11.5 AI visibility checks

Function:

- `runPromptSearches()`

For each prompt:

1. Calls `checkAIBusinessAppearance()`.
2. If `PERPLEXITY_API_KEY` exists, checks Perplexity Sonar.
3. If Sonar fails/missing, falls back to web search.
4. Separately runs web search for competitor discovery/source analysis.
5. Checks if supplied competitors appear in web results.
6. Stores prompt result:

```txt
prompt
businessAppeared
competitorAppeared
competitorName
```

Batching:

- Prompts are processed in batches of 5.
- 500ms delay between batches.

Provider evidence fields:

- `aiVisibilityProvider`
- `aiVisibilityChecks`
- `aiAnswerEvidenceAvailable`
- `webSearchFallbackUsed`
- `visibilityEvidenceSource`
- `evidenceWarnings`

Important caveat:

- If fallback is used, the evidence is web-search evidence, not AI-generated recommendation evidence.

### 11.6 Scoring

Function:

- `calculateScores()`

Current free-report scoring is simple:

```txt
appearedCount = number of prompts where business appeared
totalPrompts = prompt count
appearanceRate = appearedCount / totalPrompts
```

Status band:

```txt
Strong   if appearanceRate >= 0.70
Moderate if appearanceRate >= 0.40
Weak     otherwise
```

Service visibility:

```txt
Strong       if appearanceRate >= 0.50
Moderate     if appearanceRate >= 0.20
Not surfaced otherwise
```

Competitor scoring:

- In `client_only` mode, competitors are passed as empty to avoid fabricated comparisons.
- In `client_provided` mode, supplied/validated competitors can be counted.

Caveat:

- The current free score is mostly appearance-count based.
- It is not yet the full hybrid AVI formula described in the broader methodology docs.

### 11.7 Non-blocking enrichment after scoring

The runner also attempts:

- social signals
- query fan-out extraction
- AI Discovery analysis
- citation competitor analysis
- content readiness scoring
- recommendations

These are non-blocking and log warnings on failure.

Caveat:

- Some of these features may run even when free-mode config flags imply they should be off. This should be reviewed for cost/runtime discipline.

---

## 12. Stage 4 — `/api/pipeline/review`

File:

- `src/app/api/pipeline/review/route.ts`

Goal:

- Perform a sanity review classification.
- Alert operator.
- Keep client delivery blocked until approval.

Current checks:

- Warns if zero appearances with prompt count greater than zero.
- Warns if niche is `local_business` or `unknown`.

Classification:

```txt
if appearedCount > 0 and niche != unknown:
  Ready for operator review
else:
  Needs operator review
```

Important:

- The route sets status to `pending_review` either way.
- It does not auto-send the report.
- It sends a Telegram alert with:
  - score
  - niche
  - competitor mode
  - competitor validations
  - warnings
  - report URL
  - Mission Control URL
  - “Client email: blocked until operator approval”

Known weakness:

- The review classification is currently fairly shallow. It checks only a few conditions.
- More hard gates should be added for wrong vertical terms, generic prompts, impossible ranking/copy, missing provider evidence, and client-unsafe internal language before any client-visible send.

---

## 13. Report page access and rendering

Files:

- `src/app/report/[leadId]/page.tsx`
- `src/lib/report-data.ts`
- `src/app/report/[leadId]/report-content.tsx`

Report page behavior:

1. Loads lead by `leadId`.
2. Parses research data from notes.
3. Checks access state with `getClientReportAccessState()`.
4. If not ready, renders `ReportPending`.
5. If ready, renders `ReportContent`.

Current gate:

- Public report needs approval/completed research/parsed research data according to `getClientReportAccessState()`.
- Tokens can be validated if present.
- `owner_` token bypass is recognized for owner/operator style preview.

Parsed report data includes:

- research results
- niche label
- technical readiness
- competitor mode
- supplied competitors
- internal competitor suggestions
- competitor validations
- Google Places enrichment
- local entity trust score

Competitor preservation improvement:

- Report parsing now prefers paid-intake structured competitors when available.
- Otherwise it falls back to parsed competitor names from pipeline JSON.

---

## 14. Current free-report value boundary

Free report is intended to show:

- score / appeared-in count
- broad AI visibility snapshot
- 2–3 high-level gaps/benefits
- human-like buyer questions
- broad machine-readiness signals
- client-only snapshot when no competitors are supplied
- CTA to paid report/fix or monthly monitoring

Free report should not expose:

- exact implementation fixes
- full schema/code plan
- full prompt universe
- detailed competitor intelligence
- auto-discovered competitors as if confirmed
- internal pipeline notes
- manual/operator workflow language

---

## 15. Known guardrails already in place

### Structured intake fields

- Homepage now sends primary service/niche as `businessCategory`.
- Homepage sends competitor 1 and competitor 2 separately as `competitor` and `competitor2`.

### Competitor mode

- If supplied: `client_provided`.
- If not supplied: `client_only`.
- Auto-discovered competitors are internal only.

### Evidence-first profile

- Preflight reads actual website evidence before prompt generation.
- Business category, services, customer segments, language, market, and service areas are separated.

### Client-declared niche override

- User-submitted business category can override automated classification and regenerate prompts.

### Stale vertical prompt protection

- Research stage can rebuild prompts if old vertical language leaks into a mismatched business.

### Public report gating

- Report page does not show final report content until access state is ready.
- Review route says client email is blocked until operator approval.

### Provider evidence labeling

- Research result tracks whether evidence came from Sonar or web-search fallback.

---

## 16. Known weak spots / questions for second-opinion reviewer

These are the areas most worth reviewing. This is where the suspicious smell lives. Very useful smell, but still suspicious.

### 1. Supabase competitor storage still uses some legacy string splitting

The frontend now sends competitors separately, but `appendLead()` receives a compatibility `competitor` string and splits it into Supabase columns.

Reviewer question:

- Should the API/storage contract be upgraded to structured `competitors[]` everywhere so no future code path can rejoin/split competitor data incorrectly?

### 2. Primary niche/category storage may still be too legacy-shaped

Homepage sends `businessCategory`; intake stores it in notes as `ClientBusinessCategory`, but Supabase insert currently sets `submitted_niche` from `(lead as { niche?: string }).niche || "local_business"`.

Reviewer question:

- Should `businessCategory` be stored directly in a first-class Supabase field instead of mainly living in notes/raw intake?

### 3. Free-mode config flags may not fully control downstream enrichment

`PIPELINE_LIMITS.free` says some things are off, but `research-runner.ts` still attempts non-blocking social signals, fan-out, and AI Discovery logic.

Reviewer question:

- Should free mode strictly skip those sections for cost/runtime predictability?

### 4. Review gate is too shallow

Current review only checks broad issues like zero appearances and weak/unknown niche.

Reviewer question:

- Should the review route enforce hard failures for:
  - wrong vertical language
  - `local business` prompt leakage when business type is specific
  - fallback-only evidence being presented as AI evidence
  - unsafe/internal report copy
  - no supplied competitors but competitor-looking report sections
  - impossible rank/leader claims?

### 5. Sonar endpoint/model assumptions should be verified

`research-runner.ts` uses:

```txt
PERPLEXITY_ENDPOINT = https://api.perplexity.ai/v1/sonar
PERPLEXITY_MODEL = sonar by default
```

Reviewer question:

- Is this endpoint/model current and correct for the production Perplexity API account?
- Should provider readiness be checked in a health route before report claims are made?

### 6. Google Places geocoding/client code should be reviewed

`places-client.ts` should be reviewed closely for API correctness, including geocoding URL construction and new Places API field masks.

Reviewer question:

- Are Google Places calls returning real production enrichment reliably, or silently falling back/unavailable?

### 7. Preflight comments mention model-assisted extraction, but current path is deterministic

`BUSINESS_PROFILE_EXTRACTION_CONTRACT` exists, but `modelAssistedExtractionUsed = false` in the current preflight code.

Reviewer question:

- Should the pipeline remain deterministic-only for now, or should current configured-model extraction be added as an advisory layer with strict validation?

### 8. Report payload is not yet a fully separate canonical client-safe contract everywhere

`report-data.ts` parses research JSON into report props. Broader architecture docs call for a canonical `ClientReportPayload`.

Reviewer question:

- Should report rendering be forced to consume only a sanitized canonical payload to prevent renderers from deriving/inventing rankings, competitors, or revenue claims?

### 9. Notes field is overloaded

Pipeline stores JSON blobs and review notes inside `notes`.

Reviewer question:

- Should preflight/research/report artifacts move into dedicated Supabase tables/JSON columns instead of being serialized into `raw_intake.notes`?

### 10. Legacy naming still leaks into code ergonomics

Fields like `dealershipName` remain because the product began dealership-heavy.

Reviewer question:

- Should compatibility fields be wrapped behind generic names like `businessName` to reduce future wrong-vertical mental contamination?

---

## 17. Suggested ideal next architecture

A cleaner version would be:

```txt
Lead intake
  fields: businessName, email, website, location, primaryService, competitors[]

Lead row
  stores raw intake and normalized first-class fields

Preflight artifact table
  lead_id
  crawl evidence
  Business Intelligence Profile
  provider/tool status
  confidence and warnings

Research job table
  lead_id
  mode
  prompt plan
  provider checks
  prompt results
  competitor validation
  evidence source labels

ClientReportPayload table
  lead_id
  client-safe facts only
  score
  public-safe gaps
  approved competitor data only
  CTA state
  QA status

Renderer
  formats ClientReportPayload only
  cannot invent scores/rank/competitors/revenue
```

This would reduce the risk of the report renderer deriving claims from raw notes, fallback data, or stale compatibility fields.

---

## 18. End-to-end state machine

Current free-intake path:

```txt
new
→ preflight_running
→ preflight_complete
→ researching
→ pending_review
→ approved / needs_revision / do_not_send / contacted / etc.
```

Current research status path:

```txt
pending
→ running
→ complete / failed
```

Failure states:

```txt
preflight_failed
research_failed
rerun_failed
```

Manual/recovery states exist for Mission Control flows:

```txt
rerun_queued
rerun_processing
rerun_completed
needs_revision
held
```

---

## 19. High-level review checklist for second eyes

Ask the reviewer to check:

1. Does every visible intake field survive to the backend and report layer?
2. Are competitors preserved as two separate entities all the way through?
3. Is primary service/niche stored as first-class data, not just notes?
4. Does preflight correctly separate business type, services, and customer segments?
5. Can stale vertical prompts still survive into research?
6. Can web-search fallback be mislabeled as true AI visibility?
7. Can auto-discovered competitors appear client-facing without approval?
8. Does report access truly block unfinished/unapproved reports?
9. Are provider failures visible enough to operators?
10. Are the free-mode limits actually enforced?
11. Is the review gate strong enough before email/report delivery?
12. Should JSON notes be replaced with dedicated artifact tables?

---

## 20. Plain-English current verdict

The logic is better than the previous version because it now respects structured intake data and builds prompts from evidence instead of relying on stale vertical assumptions.

The biggest improvement:

- primary service/niche now enters the pipeline
- competitor 1 and competitor 2 are preserved at intake
- preflight derives a human business type from website evidence
- research uses the Business Intelligence Profile before taxonomy prompts

The biggest remaining architectural risk:

- too much important state is still being passed through legacy-shaped fields and serialized notes
- the review gate needs to become a stricter mechanical blocker, not just a warning step
- free/paid mode flags need tighter enforcement

Recommended next hardening move:

```txt
Create an end-to-end contract test that submits a fake lead with:
- unique business name
- unique primary service/niche
- competitor 1
- competitor 2
- UTM/referrer

Then assert those exact fields survive through:
- intake payload
- Supabase lead row
- preflight JSON
- research input
- report parsed data
- rendered report copy where appropriate
```

That test would have caught the previous bug before it reached production.
