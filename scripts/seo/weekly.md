# SEO — the weekly routine

Written 7 Oct 2026 (SEO v3). Once a week, about 20 minutes. Nothing here changes the site on its
own: every step prints a list, and a person decides.

## 1. Export Search Console (the owner)
Search Console → Performance → Search results → **Last 28 days** → Export → Download CSV.
Unzip into a folder, e.g. `~/Downloads/gsc-2026-10-14/` (it holds `Pages.csv`, `Queries.csv`, …).

## 2. Titles that are seen but not clicked
```
node scripts/seo/title-candidates.mjs ~/Downloads/gsc-2026-10-14
```
Pages with 100+ impressions, average position 1–20 and CTR under 2%. For each, write a truthful
title/description in `src/content/routes/titles.ts` (only figures the page shows; 30–60 / 120–155
characters; no "best", "cheapest", "no. 1"). Take an entry out when the default does better.

## 3. Questions a page is nearly answering
```
node scripts/seo/gsc-report.mjs ~/Downloads/gsc-2026-10-14
```
Queries where a page sits at position 8–20: add the missing answer to that page — a FAQ entry or
the first line — from real fares, distances and rules only.

## 4. Thin routes (only with the owner's yes)
```
node scripts/seo/thin-routes.mjs ~/Downloads/gsc-2026-10-14
```
Route pages with no impressions AND ≥ 80% like another page. Paste the lines the owner agrees to
into `NOINDEX_THIN` in `src/lib/held-routes.ts`. Re-check the list every week: take a route off
the day it gets impressions or content of its own.

## 5. Drivers' road answers
```
node scripts/seo/pull-driver-data.mjs           # what would change
node scripts/seo/pull-driver-data.mjs --write   # once the change looks right
```

## 6. After the deploy that carries any of this
```
bash scripts/seo/after-deploy.sh
node scripts/seo/indexnow.mjs --dry-run && node scripts/seo/indexnow.mjs
```
Then Search Console → URL inspection → "Request indexing" for the ten most important changed
pages (the CSV in Downloads, `hellomycabs-index-urls.csv`, says which), about ten a day.

## 7. Indexing and Tier 1 (added 13 Nov 2026)
Search Console → Pages: write one line in `docs/seo/WEEKLY.md`:
- indexed / not indexed;
- how many Tier 1 pages are indexed (`src/lib/tier1.ts`);
- clicks, impressions, CTR (28 days);
- position of "hello my cab", "jaipur delhi cab", "one way taxi service in kota", "jaipur airport taxi".

Per sitemap (Search Console → Sitemaps): each of `/sitemaps/sitemap/{core,cities,routes,vehicles,guides}.xml` shows its own discovered/indexed count. Note which group lags.

A Tier 1 page still "Crawled – currently not indexed" after 4 weeks:
1. add real facts (D3), and check its similarity with `python3 -I scripts/seo/crawl-audit.py --only <path>,…`;
2. request indexing again.

Domains (monthly): `node scripts/seo/monitor-domains.mjs`. The bare `hellomycabs.com` must be one 301 to www.

## 8. Tiers and the release gate (added 20 Nov 2026)
Tiers live in `src/lib/indexing-tiers.ts` (Tier 1 ≈ 32 pages, Tier 3 = routes held out of the index).
Each week, in the `docs/seo/WEEKLY.md` line, add: **Tier 1 indexed / 32**, Tier 2 indexed, Tier 3 still held, and the "Discovered – currently not indexed" count.
- Wave 1 (Tier 1) indexed ≥ 80% and Discovered not rising → `node scripts/seo/release-wave.mjs --wave 2 --coverage <this week> --prev-coverage <last week> --check <local build URL> --apply` (27 Nov 2026; it edits only `RELEASED_WAVES`), run the tests, commit, deploy, resubmit `/sitemaps/sitemap/routes.xml`, and Request Indexing for the wave's URLs.
- 50–80% → improve the Tier 1 pages not indexed first (real data, owner facts), request indexing again.
- < 50%, or "Discovered" rising → release nothing; re-run `crawl-audit.py` and `npm run qa:quality <crawl.json>`.
- Content gate: after any change to route/city pages, crawl a local build and run `npm run qa:quality docs/seo/evidence/crawl-<date>-<label>.json`; refresh the baseline (`--write-baseline`) only when a page genuinely improved.

## 9. Keywords, movers and the gate in one command (added 21 Nov 2026)
The owner also exports **Indexing → Pages** (Export → Download CSV for the summary, and each reason's
drill-down) into the same week's folder — like `docs/seo/evidence/gsc-2026-11-20/`.
```
node scripts/seo/gsc-weekly.mjs --curr <this week Performance folder> --prev <last week's> \
     --coverage <this week Pages folder> --date <YYYY-MM-DD> --write
```
It prints and appends to `docs/seo/WEEKLY.md`: queries/clicks/impressions, Tier 1 indexed of N, the
Tier 1 pages still not indexed with their reason, **the gate**, average position per keyword group
(`docs/seo/keywords.csv`), the top 10 up / down and new queries — and refreshes `keywords.csv`.
Monthly: the owner's 12 phone searches → `docs/seo/evidence/SERP_TEMPLATE.md` copied to `serp-<date>.md`.

## 10. Waves and the decisions (added 27 Nov 2026, PROMPT_INDEX_RANK_27NOV Step 9)
The owner exports, every Monday, into `docs/seo/evidence/gsc-<date>/` (same folder names as
`gsc-2026-11-27/`): **Pages** — the summary (`coverage-summary`), each not-indexed reason's
drill-down (`drill-*`) and **"View data about indexed pages"** (`drill-indexed-valid` — without it
the Wave 1 count is only an estimate); **Performance** 7 days and 28 days (`perf-7d`, `perf-28d`).
Plus GBP → Performance → Website clicks (a screenshot).
```
node scripts/seo/gsc-weekly.mjs --curr <perf-28d> --prev <last week's perf-28d> \
     --coverage <this week> --prev-coverage <last week> --date <YYYY-MM-DD> --write
```
Decide with the line it prints (Wave 1 = Tier 1 + Wave 1 guides, `src/lib/indexing-tiers.ts`):
- **2 weeks after a release, Wave 1 < 30% indexed** → URL Inspection on 5 Wave 1 pages (Google-selected
  canonical, page fetch, last crawl) and `node scripts/seo/page-quality.mjs https://www.hellomycabs.com
  --label <date>` (weight + sameness). Write what you found in WEEKLY.md.
- **4 weeks after, still < 30%** → propose the lean static route template (plain HTML, Autochatix-style)
  to the owner as the next technical step.
- **Wave 1 ≥ 80% and Discovered not rising** → `node scripts/seo/release-wave.mjs --wave 2 --coverage
  <this week> --prev-coverage <last week> --check http://localhost:3100 --apply` on a fresh local build;
  tests, commit, deploy, resubmit the routes sitemap, Request Indexing for the wave's URLs.
- **A page indexed but ~0 impressions for its keyword group after 3 weeks** → check its title and H1
  against `docs/seo/keywords.csv` (`target_url`), change one thing, wait 3 weeks.
- **Anything in Search Console → Manual actions** → stop every release, report the same day.
Monthly: `page-quality.mjs` on production → `docs/seo/evidence/page-quality-<date>.json`.

## Rules that do not change
Only true statements. No invented reviews, ratings, distances, tolls or photos. No pages that
differ only by city names. No hidden text, no keyword stuffing, no review gating.
