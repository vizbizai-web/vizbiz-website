# VizBiz Visibility Engine Todo

Purpose: make VizBiz.ai the proof asset for the same AI visibility, SEO, GEO, AEO, and recommendation-readiness work VizBiz sells to local businesses.

## Operating rule

These items are internal Visibility Engine tasks. They strengthen VizBiz.ai and Mission Control. They must not leak into client-facing free reports as raw setup warnings, internal scoring notes, or technical implementation noise.

## Dogfood foundation queue

- [ ] **Bing Webmaster Tools verification for `vizbiz.ai`**
  - Verify the domain/property in Bing Webmaster Tools.
  - Store the verification method and date in Mission Control/internal notes.
  - Do not show raw Bing setup status as a client-facing report warning.

- [ ] **Submit VizBiz sitemap to Bing**
  - Submit `https://vizbiz.ai/sitemap.xml` after Bing verification.
  - Record submitted date and status.
  - Re-submit or ping when major authority pages ship.

- [ ] **IndexNow setup**
  - Add IndexNow key file if practical.
  - Add a safe submission route/script for new or updated public authority pages.
  - Keep private report/Mission Control routes excluded.

- [x] **Update `/llms.txt` away from dealership-only positioning**
  - Broadened to local businesses, GEO/AEO, AI visibility, trust signals, and recommendation readiness.
  - Keep dealership pages as one important vertical, not the whole company identity.

- [ ] **Mission Control visibility checklist**
  - Show Bing verification, sitemap submission, IndexNow status, llms.txt freshness, sitemap health, and key authority-page status in `/mission-control/visibility-engine/`.
  - Use green/yellow/red proof states, not vague “done” claims.

## Acceptance criteria

- `https://vizbiz.ai/robots.txt` returns 200 and references the sitemap.
- `https://vizbiz.ai/sitemap.xml` returns 200 and contains canonical public pages only.
- `https://vizbiz.ai/llms.txt` returns 200 and describes VizBiz as local-business AI visibility infrastructure, not dealership-only.
- Bing Webmaster Tools verification is visible in Bing dashboard or via a deployed verification method.
- IndexNow key/submission route exists or is explicitly marked “not practical yet” with reason.
- Client-facing free reports do not contain raw Bing Webmaster Tools setup warnings.
