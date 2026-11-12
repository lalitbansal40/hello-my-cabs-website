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

## Rules that do not change
Only true statements. No invented reviews, ratings, distances, tolls or photos. No pages that
differ only by city names. No hidden text, no keyword stuffing, no review gating.
