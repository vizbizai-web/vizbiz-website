# VizBiz Production Push Readiness Audit

Generated: 2026-06-03 11:53 EDT
Repo: `/Users/vlad/VizBiz/app/vizbiz-website`
Remote: `https://github.com/vizbizai-web/vizbiz-website.git`
Branch inspected: `main`

## Executive call

Do **not** push local `main` directly to `origin/main` right now.

Reason: local `main` and `origin/main` have diverged heavily. A normal push to `main` is unsafe and likely to be rejected as non-fast-forward. A force-push would be reckless because remote `main` contains substantial newer production work.

The safe launch move is:

1. Keep local commits preserved.
2. Push this local launch state to a separate branch if we need remote backup/review.
3. Reconcile with `origin/main` deliberately before using GitHub/Vercel production-branch deployment.
4. If launching the exact local build is urgent, use a direct Vercel production deploy after explicit approval instead of overwriting remote `main`.

Tiny translation: the repo history is doing parkour. We do not shove it off a roof.

## Current git state

`git status --short --branch`:

```txt
## main
```

Working tree was clean before this audit document was created.

`git rev-list --left-right --count origin/main...HEAD` returned:

```txt
252 9
```

Meaning:

- `origin/main` has **252 commits** not present in local `main`.
- local `main` has **9 commits** not present in `origin/main`.

## Local launch commits not on `origin/main`

```txt
af9d4b0 chore: add launch runbooks and fulfillment assets
93a4670 feat: prepare VizBiz launch funnel and report operations
b6f74ca fix: polish report readability details
0ffb393 fix: humanize mini report prompt examples
83888cb fix: improve mini report teaser copy and CTA contrast
490625d fix: support serverless mini-report storage
c91f479 deploy: launch updated vizbiz site
1ede91d feat: add VizBiz mini audit report engine
2cd3d7e feat: snapshot VizBiz audit and revenue engine
```

Note: several of these local commits are already preserved on `origin/launch/current-production-vizbiz`, but not on `origin/main`.

## Remote production/main risk

`origin/main` contains a large amount of newer work not in local `main`, including but not limited to:

- Google Places / competitor discovery updates
- Supabase and Google Sheets pipeline hardening
- report token/access fixes
- UTM tracking updates
- Stripe and CTA wiring
- GSC, sitemap, and SEO fixes
- Mission Control changes
- report UX improvements
- production bug fixes from prior deploy cycles

Because of that, local `main` should be treated as a launch-prep branch state, not the unquestioned production source of truth.

## Vercel project state

Local `.vercel/project.json` exists and points to Vercel project name:

```txt
vizbiz-website
```

Vercel CLI exists:

```txt
/opt/homebrew/bin/vercel
```

Vercel CLI authenticated user/team output:

```txt
vizbizai-4875
```

Team JSON parsing was unavailable from the command output, but CLI auth itself appears present.

## Safe paths from here

### Path 1 — safest for GitHub/Vercel production branch

Use this when we want the production deploy to come from GitHub `main` cleanly.

1. Create a reconciliation branch from current local state:

```bash
git checkout -b launch/reconcile-local-vizbiz
```

2. Fetch remote:

```bash
git fetch origin --prune
```

3. Compare and manually reconcile with `origin/main`:

```bash
git diff --stat origin/main...HEAD
git diff --name-status origin/main...HEAD
```

4. Merge or cherry-pick only the launch-safe local work into a branch based on `origin/main`:

```bash
git checkout -b launch/vizbiz-production-ready origin/main
# then cherry-pick selected local commits, or manually port files
```

5. Run full verification:

```bash
npm test
npm run build
```

6. Push the safe branch and open a PR:

```bash
git push -u origin launch/vizbiz-production-ready
```

7. Merge only after reviewing diffs and confirming production env vars.

### Path 2 — preserve current local launch state remotely, without touching production

Use this if Alex wants the exact local work backed up on GitHub now but not deployed.

```bash
git push origin HEAD:launch/local-vizbiz-prep-2026-06-03
```

This does **not** update `origin/main` and should not trigger production if Vercel only deploys `main` to production.

### Path 3 — urgent launch of this exact local build via Vercel direct deploy

Use this only after explicit approval and only if we accept that GitHub `main` still needs cleanup later.

```bash
npm test
npm run build
vercel deploy --prod -y --no-wait
```

Then inspect the deployment and, if needed, move aliases only after Ready.

This bypasses the GitHub main-branch divergence problem, but it creates a source-of-truth cleanup task afterward. Useful in an emergency; not elegant. Like duct tape on a Ferrari — it can work, but we should not pretend it is the design language.

## Recommended next action

Recommendation: **Path 2 + then Path 1**.

1. Push current local prep to a non-production branch for safety.
2. Create a fresh branch off `origin/main` and port only the known-safe launch/report assets and code changes.
3. Run tests/build.
4. Deploy through the normal production path.

## Commands I am explicitly not running without Alex approval

```bash
git push origin main
vercel deploy --prod
git push --force
vercel alias set
```

No production action should happen until Alex explicitly approves the exact path.
