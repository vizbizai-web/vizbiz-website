# Site Intelligence + Google Places + Competitor Crawl Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace fragile niche-first mini reports with a cautious, evidence-first pipeline that uses Google Places, multi-page website crawling, and competitor crawling before generating client-facing reports.

**Architecture:** The free report should not be instant. Intake should save the lead and return quickly, then a background job builds a `BusinessIntelligenceProfile` from intake, Google Places, client website crawl, and competitor website crawls. Reports are only emailed after quality gates pass; uncertain reports are held for operator review.

**Tech Stack:** Next.js/Vercel app, Supabase CRM/storage, Google Places API, existing site-intelligence crawler, existing mini-audit/report pipeline, Resend email, Telegram/Mission Control alerts.

---

## Core Product Rule

Do not send a client-facing free report until the system can answer these with evidence:

1. What does this business actually sell/do?
2. Which local market is relevant?
3. Which Google category/categories describe it?
4. What services/products are visible on the client site?
5. What services/products are reinforced by competitors?
6. What human AI questions would real buyers ask?
7. What confidence level and evidence supports the niche/profile?

If confidence is low, mark `needs_operator_review` and do not send the report email.

---

## Proposed Pipeline

### Stage 1: Fast Intake

**Behavior:**
- Save lead immediately.
- Capture attribution, submitted competitors, business URL, location, service/niche hint, and email.
- Return thank-you page quickly.
- Set lead status: `queued_profile_build`.
- Do **not** promise instant report.

**Client copy direction:**
- “We’re preparing your AI visibility snapshot. You’ll receive it by email once the checks complete.”

---

### Stage 2: Google Places Entity Resolution

**Input:** business name, website, city/location.

**Use Google Places for:**
- Place ID
- canonical business name
- primary type/category
- additional types
- rating/review count
- address/city
- website URL match
- phone match if available
- opening status
- Google Maps URL

**Output:** `GoogleBusinessEvidence`:

```ts
interface GoogleBusinessEvidence {
  placeId: string | null;
  canonicalName: string | null;
  primaryType: string | null;
  types: string[];
  rating: number | null;
  reviewCount: number | null;
  websiteUrl: string | null;
  websiteMatch: "exact" | "same_domain" | "mismatch" | "missing";
  address: string | null;
  mapsUrl: string | null;
  confidence: number;
  evidence: string[];
}
```

**Quality gates:**
- If Google website mismatches submitted website, reduce confidence and require review unless other evidence is strong.
- If Google category conflicts with site category, require review or label as ambiguous.
- Use Google category as strong evidence, but never as the only source of truth.

---

### Stage 3: Client Website Crawl Beyond Homepage

**Crawl target:** submitted website domain.

**Crawl budget for free report:**
- Homepage
- About page
- Services page(s)
- Contact/location page
- FAQ page if visible
- Top 3–5 navigation links likely to contain services/products
- Limit total pages to 8–12 for free reports.

**Discovery sources:**
- homepage links/nav
- sitemap.xml if available
- common paths: `/services`, `/service`, `/about`, `/contact`, `/faq`, `/locations`, `/products`, `/menu`, `/pricing`

**Extract per page:**
- title
- meta description
- H1/H2
- schema types
- service/product phrases
- location phrases
- customer type phrases
- FAQ questions
- CTA language
- review/testimonial snippets
- page URL

**Output:** `WebsiteCrawlEvidence`:

```ts
interface WebsiteCrawlEvidence {
  domain: string;
  pages: CrawledPageEvidence[];
  extractedServices: EvidenceTerm[];
  extractedProducts: EvidenceTerm[];
  extractedLocations: EvidenceTerm[];
  extractedCustomerTypes: EvidenceTerm[];
  faqQuestions: string[];
  schemaTypes: string[];
  crawlErrors: string[];
  confidence: number;
}

interface EvidenceTerm {
  term: string;
  count: number;
  sources: Array<{ url: string; field: "title" | "meta" | "h1" | "h2" | "body" | "schema" | "faq" }>;
}
```

**Quality gates:**
- Require at least one specific service/product term from title/H1/nav/body/schema or Google category.
- If only generic phrases are found, mark `needs_operator_review`.
- Never let “local business” become a client-facing niche if any specific service term exists.

---

### Stage 4: Competitor Resolution + Crawl

**Competitors:**
- Use only user-supplied competitors for client-facing competitor statements.
- Google/auto-discovered competitors can be internal suggestions only until operator-approved.

**For each supplied competitor:**
1. Resolve competitor in Google Places using name + city.
2. Confirm website/domain if available.
3. Crawl homepage + service/about pages with a smaller budget, e.g. 4–6 pages each.
4. Extract service/category terms.

**Output:** `CompetitorEvidence[]`:

```ts
interface CompetitorEvidence {
  submittedName: string;
  resolvedName: string | null;
  googleTypes: string[];
  websiteUrl: string | null;
  websiteMatchConfidence: number;
  extractedServices: EvidenceTerm[];
  overlappingTermsWithClient: string[];
  differentiatingTerms: string[];
  confidence: number;
  reviewCount: number | null;
  rating: number | null;
}
```

**Use competitor data for:**
- niche confidence
- service overlap
- buyer-intent prompt refinement
- internal competitor gap evidence

**Do not use competitor data for:**
- unverified public claims if competitor resolution is uncertain
- client-facing competitor comparisons unless supplied/confirmed

---

### Stage 5: Business Intelligence Profile Resolver

Combine:
- intake fields
- Google Places evidence
- client crawl evidence
- competitor crawl evidence

Create one profile:

```ts
interface BusinessIntelligenceProfile {
  profileMode: "known" | "dynamic" | "needs_review";
  displayNiche: string;
  canonicalCategory: string;
  schemaType: string;
  primaryServices: string[];
  secondaryServices: string[];
  products: string[];
  customerTypes: string[];
  locations: string[];
  buyerIntentCategories: string[];
  humanQuestionSeeds: string[];
  confidence: number;
  evidence: ProfileEvidence[];
  contradictions: string[];
  needsOperatorReview: boolean;
}
```

**Confidence scoring:**
- Google primary category match: +20
- submitted service/category match: +15
- homepage title/H1 service evidence: +20
- service page evidence: +20
- schema type match: +10
- competitor overlap: +15
- contradictory Google/site evidence: -25
- website unavailable/thin: -20
- no specific service extracted: force review

**Recommended thresholds:**
- `>= 75`: auto-send allowed
- `60–74`: auto-send only if no contradictions and prompts are specific
- `< 60`: needs operator review
- Any client-facing generic language: force review

---

### Stage 6: Human AI Question Generator

Generate question seeds from the profile, not from hardcoded niche fallback.

**Prompt clusters:**
- Discovery: “I’m in {city} and need help with {service}. Who should I consider?”
- Trust: “Which {service} provider near {city} seems trustworthy?”
- Comparison: “How should I compare {service} providers near {city} before choosing one?”
- Need-specific: “Where can I get {specific_service_1}, {specific_service_2}, or {specific_service_3} near {city}?”
- Urgency/occasion if relevant: deadline, emergency, same-day, event, seasonal, family, budget, premium, etc.
- Brand defense: “Is {businessName} a good choice for {service} in {city}?”

**Blocked patterns:**
- “local business”
- “service provider” when a specific service exists
- keyword-only phrases as displayed examples
- AI/platform-specific wording that implies only Perplexity

**Client-facing wording:**
- “Popular AI assistants and AI-powered search tools”
- “AI recommendation moments”
- “AI answers buyers may see when comparing local options”

---

### Stage 7: Report Quality Gate

Before saving/sending email, validate:

```ts
interface ReportQualityGateResult {
  status: "pass" | "needs_review" | "fail";
  reasons: string[];
  confidence: number;
  evidenceSummary: string[];
}
```

**Hard blockers:**
- no specific niche/service
- client-facing “generic local service”
- client-facing “local business” prompts when a service is known
- Google/site category contradiction not resolved
- competitor mismatch if competitor claims are used
- report URL/storage not durable
- no buyer-question examples
- unsupported revenue estimate shown to client

**If blocked:**
- status: `needs_operator_review`
- do not send client email
- send Telegram/Mission Control alert with evidence and reasons

---

### Stage 8: Operator Review Queue

Mission Control should show:
- lead
- business URL
- Google category + evidence
- detected niche
- confidence score
- extracted services/products
- crawl pages used
- supplied competitors and resolution status
- generated human AI questions
- blockers/reasons

Operator actions:
- approve and send
- edit niche/service labels
- edit question examples
- reject/hold
- request manual competitor confirmation

---

## Implementation Tasks

### Task 1: Create evidence types

**Files:**
- Create: `src/engines/research/business-intelligence-types.ts`

**Objective:** Define shared evidence/profile types for Google Places, crawls, competitors, and profile confidence.

**Verification:** `npm test` and TypeScript build should pass.

---

### Task 2: Expand Google Places enrichment output

**Files:**
- Modify: `src/engines/research/platforms/google-places.ts`
- Modify tests: `src/engines/research/platforms/google-places.test.ts`

**Objective:** Return structured Google evidence including category/types, website match, rating/reviews, and evidence strings.

**Verification:** Unit tests cover exact website match, same-domain match, mismatch, and missing website.

---

### Task 3: Build multi-page crawler

**Files:**
- Create: `src/engines/research/site-crawler.ts`
- Modify existing site intelligence integration as needed.
- Add tests: `src/engines/research/site-crawler.test.ts`

**Objective:** Crawl homepage plus service/about/contact/FAQ/nav links with page budget and timeout controls.

**Verification:** Tests use fixture HTML and verify service/about/FAQ pages are selected and extracted.

---

### Task 4: Extract service/product/location terms with evidence

**Files:**
- Create: `src/engines/research/evidence-extractor.ts`
- Add tests: `src/engines/research/evidence-extractor.test.ts`

**Objective:** Convert crawled pages into ranked terms with source URLs and fields.

**Verification:** Fixtures prove tax/accounting, landscaping, clinic, restaurant, and ecommerce examples extract specific terms and reject generic terms.

---

### Task 5: Add competitor resolver/crawler

**Files:**
- Create: `src/engines/research/competitor-intelligence.ts`
- Add tests: `src/engines/research/competitor-intelligence.test.ts`

**Objective:** Resolve user-supplied competitors through Google Places, crawl their sites, and compute overlap/differentiation.

**Verification:** Tests cover resolved competitor, unresolved competitor, website mismatch, and overlap terms.

---

### Task 6: Create Business Intelligence Profile resolver

**Files:**
- Create: `src/engines/business-profile/business-intelligence-profile.ts`
- Modify: `src/engines/business-profile/profile.ts`
- Add tests.

**Objective:** Merge intake + Google + client crawl + competitor evidence into one profile with confidence and evidence.

**Verification:** Tests cover known niche, dynamic niche, ambiguous niche, contradiction, and competitor-reinforced niche.

---

### Task 7: Generate prompts from profile

**Files:**
- Modify: `src/lib/prompts.ts`
- Add tests: `src/lib/prompts.test.ts`

**Objective:** Build buyer questions from `BusinessIntelligenceProfile`, not just static `businessType`.

**Verification:** No client-facing prompt contains “local business” when specific services exist.

---

### Task 8: Add final report quality gate

**Files:**
- Create: `src/engines/research/report-quality-gate.ts`
- Modify: `src/app/api/mini-audit/run/route.ts`
- Add tests.

**Objective:** Prevent bad/generic/unsupported reports from being emailed.

**Verification:** Bad generic report fails; clear dynamic niche passes; contradiction requires review.

---

### Task 9: Add operator review UX in Mission Control

**Files:**
- Modify: Mission Control leads/reports pages.
- Add API route if needed.

**Objective:** Display profile confidence, evidence, blockers, and approve/edit/send actions.

**Verification:** A blocked lead appears as `needs_operator_review` with reasons and can be approved after edits.

---

### Task 10: Convert intake flow to queued async processing

**Files:**
- Modify intake API/route.
- Add worker/cron endpoint or local worker script.

**Objective:** Intake returns immediately; background processing handles crawl/Places/report/email.

**Verification:** Intake thank-you page works; report email sends only after quality gate passes.
