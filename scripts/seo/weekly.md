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

## Rules that do not change
Only true statements. No invented reviews, ratings, distances, tolls or photos. No pages that
differ only by city names. No hidden text, no keyword stuffing, no review gating.
