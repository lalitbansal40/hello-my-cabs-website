# IMPLEMENTATION PROMPT — hellomycabs.com ke saare pages index karwana aur keywords par rank karwana (27 Nov 2026)

You are implementing `docs/seo/PLAN_INDEX_RANK_27NOV.md` (the plan; read it fully first) with its keyword map `docs/seo/KEYWORD_MAP_ROUTES_27NOV.csv`. Earlier work it builds on: `PLAN_RANK_21NOV.md`, `PROMPT_RANK_21NOV.md`, `LEDGER_RANK_21NOV.md` (rows R0–R40), `PLAN_INDEXING_20NOV.md`, `LEDGER_INDEXING_20NOV.md`.

Work **step by step, in the order below**. Do not skip a step. If a step cannot be done, mark it **blocked** in the ledger with the exact reason and continue with the next step. Every step ends with **Done when** checks; a step is done only when every check passes **and** its evidence (command output, file, number, URL) is written in the ledger.

Language: owner-facing text (reports, OWNER file, GBP posts, listings copy) in simple Hinglish. Code, comments, commit messages, tests in English.

---

## 0. Outcomes

| # | Outcome | Plan phase |
|---|---|---|
| O1 | The 21 Nov work (R1–R37) reviewed, finished (R32–R34, R38–R40) and **live** | A |
| O2 | Route/city/home pages light: HTML ≤ 150 KB, gzip ≤ 35 KB, LCP not worse | B1 |
| O3 | Every Wave 1 route page specific: masked 5-gram overlap < 0.25 between any two; FAQs 6–8, route-specific | B2 |
| O4 | Schema clean: one JSON-LD copy, Product behind one switch, FAQ matches the visible text, NAP equal everywhere | B3 |
| O5 | Trust pages and small items (About, Contact, footer NAP, legal out of sitemap, 404, og, alt, lastmod, analytics slot) | B4, B5 |
| O6 | Index set = Wave 1 (~38 URLs); everything else noindex + out of sitemaps; internal links concentrated on Wave 1 | C |
| O7 | Every Wave 1 page targets its keyword group (title/description/H1/H2/first paragraph/alt) from the keyword map; tests enforce one keyword → one URL | F1, F2 |
| O8 | Off-site kit: GBP products + 12 posts (month 1), listings copy refreshed, partner list, brand line; owner steps file | D |
| O9 | Measuring: weekly report knows the waves, overlap/weight evidence, Request-Indexing list, validation timing | E, H |
| O10 | Wave tooling: Wave 2 / Wave 3 / hold lists in code, gate-driven release command, tests | G |
| O11 | Released: tests, deploy (backend first), live checks, IndexNow, ledger, owner report | — |

### Owner decisions (27 Nov 2026) — record in the ledger

The owner has not answered these yet. Use the **default** column. Each default is built so the owner can change it with a one-line code change. Record "default used" in the ledger.

| # | Question | Default (use this) | Where it lives |
|---|---|---|---|
| P1 | Ship the uncommitted 21 Nov work? | **Yes**, after the full review in Step 1 | — |
| P2 | Page CSS: un-inline it (reverses the 3 Oct `inlineCss` decision)? | **No.** Keep `inlineCss: true` and **shrink the CSS itself** (Step 2.1). Un-inline only if Step 2.1 cannot reach the budget **and** a measured A/B shows LCP not worse by more than 0.2 s on mobile | `next.config.ts` |
| P3 | Remove Product schema from route pages (reverses D2 of 9 Oct / D8 of 13 Nov)? | **Keep for now**, behind one constant `PRODUCT_SCHEMA_ON = true`. Write the reason to remove it in OWNER_STEPS §3 so the owner can say "hata do" (= flip to false + push) | `src/lib/schema.tsx` |
| P4 | Car/round-trip variant pages (`/jaipur-to-delhi-innova-crysta`, `/…-tempo-traveller-12-seater`, `/…-round-trip-cab`) | **noindex, follow + out of sitemaps**, self canonical, still reachable. Keep `/jaipur-to-delhi-round-trip-cab` indexable (Tier 1 path) | `src/lib/indexing-tiers.ts` |
| P5 | The 13 plain routes indexable today but not Tier 1 (Jaipur↔Jodhpur, Jaipur↔Ajmer, Jaipur→Udaipur, Delhi→Dehradun, Chandigarh→Delhi, Agra→Delhi, Haridwar→Delhi, Agra→Jaipur, Chandigarh→Jaipur, Noida→Jaipur, Jaipur→Chandigarh…) | **Hold** (noindex, out of sitemaps) until Wave 2 opens. Concentrates Google on Wave 1 | `indexing-tiers.ts` `WAVE2_ROUTES` |
| P6 | Analytics | **Slot built, off.** `src/config/analytics.ts` with `GA4_ID: string \| null = null`; when set, load gtag `lazyOnload` on public pages only. Blocked until the owner sends the ID (OWNER_STEPS §6). Plausible code stays as it is | new file |
| P7 | Driver route survey `--send` | **Dry run only**; send only on the owner's word (OWNER_STEPS §8) | backend script |
| P8 | About page legal details (company name, GST/registration, founder) | Use only what `src/lib/company.ts` already has. Missing fields → slots that render nothing while null; list them in OWNER_STEPS §5 | `company.ts` |
| P9 | `/luxury-car`, `/force-urbania-rental`, `/tempo-traveller-14-seater-rental`, `/tempo-traveller-16-seater-rental`, `/char-dham-yatra`, `/rajasthan-tours` | Not Wave 1 → noindex + out of sitemaps, **unless** the page is already noindex by its own flag (`CHARDHAM_IS_SAMPLE`, `RAJASTHAN_IS_SAMPLE`); then leave it as is | `indexing-tiers.ts` / page metadata |
| P10 | Legal pages (privacy, terms, refund) | Indexable (`index, follow`) but **out of sitemaps** | `sitemap-entries.ts` |

---

## 1. Repos, rules, safety

Repos (all under `/Users/lalitbansal/Documents/hellomycab/`):
- **Backend** `hello-my-cab-backend` (Express/TS/Mongo, Jest). Pushing `main` auto-deploys to EC2 (`https://api.hellomycabs.com/health` shows the commit). **Push backend first**, only after its tests pass. Wait for `/health` to show the new commit before pushing the website.
- **Website** `hello-my-cabs-website` (Next.js **16.3.4**, React 19, Tailwind 4, AWS Amplify). `AGENTS.md`: this Next.js has breaking changes — read the matching guide in `node_modules/next/dist/docs/` before using any Next API you have not used in this repo. Scripts: `npm run lint`, `npx tsc --noEmit`, `npm run test:seo`, `npm run test:rating`, `npm run test:rank`, `npm run build`, `npm run qa:quality`, `npm run audit:lighthouse`, `npm run audit:speed`.
- **App** `hello-my-cab-app` (Flutter) — **do not touch** in this task (the app share-link and review-link buttons are later owner decisions, OWNER_STEPS §9).
- **Ghoomo** `ghoomo-rajasthan-frontend` — do not touch. Never create hellomycabs-style route pages there.

Rules:
1. **No env changes for the owner.** New settings live in code (`src/config/*.ts`, constants) and apply on deploy.
2. **Production DB read-only.** Read-only scripts go in the scratchpad and print aggregates only — no phone numbers, names or addresses.
3. **No fake anything:** reviews, ratings, trip counts, addresses, facts, photos, badges, distances. A fact on a page must come from code data, measured data (route insights / polylines), a driver survey with ≥ 2 agreeing approved drivers, or the owner. Otherwise leave it out.
4. **No thin or doorway pages:** no per-locality pages, no second page for the same intent, no new city × city pages in this task. One keyword → one target URL.
5. **Price honesty:** any price in a title, description, heading or schema equals what `/fare/oneway` / the booking widget returns for that route and car (existing R14 test must keep passing).
6. **Never change URLs** of existing pages. No redirects except the ones that already exist.
7. **Commits:** stage by path only. Never stage owner files: backend-root `PLAN_*` / `PROMPT_*` / `LEDGER_five_changes.md` (website `docs/seo/` plan/prompt/ledger files **are** committed — see Step 11.6); website `docs/seo/CHATGPT_HANDOVER.md`; the deleted `public/img/monument.jpg` and `public/img/open-road.jpg` (leave them unstaged unless Step 1 proves they are unused **and** the owner agreed — default: leave). **No `Co-Authored-By` / Claude attribution line** (owner rule).
8. **No DNS, Caddy, GSC, GBP, Bing, directory or Meta actions** — owner steps. You prepare exact text and lists.
9. **No Google Indexing API.** IndexNow is allowed (`scripts/seo/indexnow.mjs`).
10. **Gates:** Tier 3 / Wave 2 / Wave 3 are not opened in this task (only the tooling). `HINDI_LIVE` stays `false`.
11. Fares in `FARE_HOLD` (23 pairs) are not changed and those routes stay noindex.
12. `inlineCss` stays `true` unless P2's measured exception applies (record the A/B numbers).
13. Amplify artifact limit **220 MB**: record the build's artifact size after every build that changes prebuilt pages.
14. No AI-written filler text. Every new sentence on a page states a fact from rule 3 or answers a searched question with our own rule (fares, inclusions, waiting, night charge).

---

## 2. Read first (check each against current HEAD; note mismatches in the ledger)

Website:
- `docs/seo/PLAN_INDEX_RANK_27NOV.md`, `KEYWORD_MAP_ROUTES_27NOV.csv`, `LEDGER_RANK_21NOV.md`, `OWNER_STEPS_RANK_21NOV.md`, `GBP_KIT_21NOV.md`, `CITATIONS_21NOV.md`, `FARE_REVIEW_21NOV.md`, `keywords.csv`, `WEEKLY.md`, `scripts/seo/weekly.md`, `evidence/SERP_TEMPLATE.md`.
- `next.config.ts` (the `inlineCss` comment: 91 kB CSS copied into HTML + RSC + prefetch; 260 MB vs 220 MB; un-inlining cost 0.8 s on phones), `src/app/globals.css`, `src/app/layout.tsx`.
- `src/lib/{indexing-tiers,tier1,held-routes,route-tiers,route-variants,variant-pages,sitemap-entries,seo,schema,company,route-faq,city-faq,vehicle-faq,route-distance,route-map,city-pages,api,analytics,indexnow,hindi}.ts(x)`.
- `src/app/[slug]/{page,RoutePage,CityPage,RouteVariantPage,VehiclePage}.tsx`, `src/app/[slug]/map.svg/route.ts`, `src/app/{page,not-found,robots,sitemap}.tsx|ts`, `src/app/sitemaps/**`, `src/app/{about,contact,routes,fares-explained,guides,jaipur-airport-taxi,luxury-car,char-dham-yatra,rajasthan-tours}/**`.
- `src/components/landing/*` (especially `RouteRoad.tsx`, `FareTable`, `RouteInsights`, `TierA`, `RouteDetail`), `src/components/site/{Footer,VehicleArt}.tsx`.
- `scripts/seo/{crawl-audit.py,quality-gate.mjs,gsc-weekly.mjs,release-tier3.mjs,keywords-seed.mjs,fare-sanity.mjs,new-routes.mjs,monitor-domains.mjs,indexnow.mjs,pull-driver-data.mjs}`, `scripts/seo/lib/tiers.mjs`, `scripts/test/{seo-recovery,rating-summary,rank}.mjs`, `scripts/audit/{lighthouse,speed}.mjs`.
- GSC evidence: `~/Downloads/hellomycabs.com-*-2026-11-27*.zip` → copy (unzipped) into `docs/seo/evidence/gsc-2026-11-27/` (coverage, 5 drilldowns, performance 24h/7d/28d/3m).

Backend:
- The uncommitted 21 Nov files (`git status`): `src/constants/{cities,fareTable,tolls,airportTransfers}.ts`, `src/controllers/{rating,routeKnowledge,transfers}.controller.ts`, `src/models/routeKnowledge.model.ts`, `src/routes/public.route.ts`, `src/services/{broadcastTargeting,dutyCompletion,ghoomoReviewRequests,jobs,routeSurvey.service}.ts`, `src/utils/routeKnowledgeMerge.ts`, `src/validators/routeKnowledge.validator.ts`, `src/config/reviewSettings.ts`, `scripts/send-route-survey.ts`, tests `cityDirectory`, `reviews`, `routeKnowledge`, `rank21nov`.
- `src/controllers/booking.controller.ts` (`publicRoutes`, `onewayFareBody`, `/fare/local`), `src/services/routeInsights.ts`.

---

## STEP 0 — Baseline and ledger

1. Create `docs/seo/LEDGER_INDEX_RANK_27NOV.md` with rows **L0–L46** from §13, status `todo`. Header: the plan + this prompt, owner decisions P1–P10 with "default used".
2. Record HEADs: website (`77c544a` expected), backend (`8871fe4` or later), and `git status --short` counts of both.
3. Copy the 27 Nov GSC exports into `docs/seo/evidence/gsc-2026-11-27/` (unzip each into its own folder: `coverage`, `drilldown-crawled`, `drilldown-discovered`, `drilldown-404`, `drilldown-robots`, `drilldown-redirect`, `valid`, `perf-24h`, `perf-7d`, `perf-28d`, `perf-3m`). Run `node scripts/seo/gsc-weekly.mjs --curr docs/seo/evidence/gsc-2026-11-27/perf-28d --coverage docs/seo/evidence/gsc-2026-11-27/coverage --write` (adjust flags to the script's real ones) → a 27 Nov block in `WEEKLY.md`.
4. Baseline commands on the **current working tree** (21 Nov work included) and record pass/fail and counts: website `tsc`, `lint`, `test:seo`, `test:rating`, `test:rank`, `build` (artifact size); backend `npm run typecheck`, `npm run lint`, full Jest (rerun load failures with `--runInBand` and record both; `broadcastBurst` is known to fail with ECONNRESET on this Mac even on clean HEAD — record it, do not chase it).
5. **Live baseline (production, before any deploy):**
   - `python3 -I scripts/seo/crawl-audit.py https://www.hellomycabs.com --label idx27-baseline` → pages, errors, pairs > 0.35 / 0.5 / 0.6, HTML median, words median, links-in < 15 list.
   - For 5 pages (`/`, `/jaipur-to-delhi-cab`, `/kota-to-jaipur-cab`, `/delhi-to-agra-cab`, `/cab-service-in-jaipur`): HTML bytes, gzip bytes (`curl --compressed -w %{size_download}`), inline `<style>` bytes, script bytes, JSON-LD bytes, words in `<main>`.
   - Masked 5-gram overlap (numbers → `#`, text of `<main>` without script/style/svg) for every pair of the 14 Tier 1 routes → `evidence/overlap-2026-11-27-baseline.json`. Expected from the plan: Jaipur–Delhi vs Delhi–Agra ≈ 0.37.
   - Local Lighthouse mobile (`npm run audit:lighthouse` or `npx lighthouse` with the repo's script) on the same 5 pages: LCP, CLS, TBT, Performance, SEO → `evidence/lighthouse-2026-11-27-baseline.json`.
6. Read-only production counts (scratchpad, aggregates only): active approved drivers; duties last 90 days per Wave 1 route pair (to confirm the "trips" numbers the pages print).

**Done when:** ledger exists with all baseline numbers and file paths; every command's result recorded.

---

## STEP 1 — Review, finish and ship the 21 Nov work (O1, plan Phase A)

### 1.1 Review (no shipping yet)
1. Read the **whole** diff of both repos (`git diff` + every untracked file). For each file, name the ledger row (R1–R37) it belongs to. Any change that belongs to no row → list it in the ledger and decide: keep (explain) or revert (only if clearly accidental; never revert owner work silently — ask in the report instead).
2. Check each R row's claim against the code (e.g. R15: `withMeasuredKm` used by title, description, page, FAQ, `/routes`, `map.svg`; R21: airport page refuses to build without prices; R36: `/hi/*` noindex and absent from sitemaps).
3. Security/safety pass on the diff: no secrets, no phone numbers or customer data in code or evidence, `/public/transfers/:key` rejects prototype keys (`constructor` → 404), survey script dry-run by default.

### 1.2 Finish the 21 Nov rows still `todo`
- **R32** route page order: on mobile (390 px) the first screen shows H1, "from" price, fare table (at least the cheapest two cars), Call + WhatsApp, booking form start. Screenshot `evidence/route-mobile-2026-11-27.png` via `npm run audit:shots`.
- **R33** guides: only the ones with real data available — "Kota to Jaipur by road", "Delhi to Agra by road (Yamuna Expressway)", "Jaipur Airport to the city". Facts from measured polylines/tolls/`airportTransfers.ts`; no train timings, no temple hours. Skip any guide whose facts are missing (mark `skipped — no data`).
- **R34** internal links: every Wave 1 page (Step 6 list) has ≥ 15 internal links **in** (count from the crawl). Add links from home "Searched most", city pages, reverse route, 3 nearby Wave 1 routes, guides. Test in `rank.mjs`.
- **R38 / R39**: done in Steps 2 and 4 of this prompt (mark them "moved to L-rows" in the old ledger).
- **R40**: release happens in Step 11 together with this task (one release, not two). Mark it "moved to L44".

### 1.3 Ship the backend part of the 21 Nov work first (separately)
The website's 21 Nov pages read new backend endpoints. So:
1. Backend: `npm run typecheck`, `npm run lint`, full Jest → all green except the known `broadcastBurst` ECONNRESET (re-run alone; record).
2. Commit **only the 21 Nov backend files** (list in §2) by path. Verify in a clean worktree (`git worktree add`, copy only those files, symlink `node_modules`, copy nothing secret; run `tsc` + the 4 affected suites).
3. Push; wait for `/health` = new commit. Live: `/api/v1/public/routes` contains `JAIPUR→KHATU_SHYAM_JI` and `JAIPUR_AIRPORT` pairs with prices; `/api/v1/public/transfers/jaipur-airport` and `/reengus-khatu` 200; `/api/v1/public/transfers/constructor` 404; `/api/v1/vehicle-catalog` still version 2.
4. Ledger L1 with the commit hash and each live check.

The **website** part of 21 Nov ships together with Steps 2–10 in Step 11 (one website release). Reason: the 21 Nov pages and this task touch the same files (`RoutePage`, `schema`, `indexing-tiers`, `sitemap-entries`).

**Done when:** every R row has a verdict; R32–R34 done or skipped with reason; backend 21 Nov commit live with checks recorded.

---

## STEP 2 — Page weight (O2, plan B1)

Budget for every Wave 1 page: **HTML ≤ 150 KB, gzip ≤ 35 KB**, LCP mobile ≤ baseline + 0.2 s (target < 2.5 s), CLS < 0.1, TBT < 200 ms, Lighthouse SEO = 100.

### 2.1 Shrink the CSS (keep it inline — P2)
1. Measure what is in the 91–100 KB: print the built CSS (`.next/static/**/*.css`) size by selector group. Find unused rules: Tailwind 4 scans every source file, so pages/components not used by public pages (admin/driver/booking screens, demo/sample pages) may be adding CSS.
2. Reduce: (a) limit Tailwind's sources (`@source` / `@source not` in `globals.css`, per this Tailwind version's docs) so app-only directories do not add classes to public pages, **or** move app-only screens to a CSS file imported only by their route segment; (b) remove dead component CSS; (c) drop unused font weights/subsets. Target CSS ≤ 35 KB.
3. If 2.1.2 cannot get under ~35 KB, do the P2 A/B: build once with `inlineCss: false`, Lighthouse mobile on the 5 pages, compare LCP. Switch only if LCP is not worse by more than 0.2 s. Record both runs.

### 2.2 The route map
`RouteRoad` (or whichever component draws the route SVG) puts thousands of `<circle>` nodes in the React payload (~68 KB). Replace the inline SVG with `<img src="/{slug}/map.svg" width height alt="{A} to {B} road map" loading="lazy" decoding="async">` served by the existing `src/app/[slug]/map.svg/route.ts` (cached; check its headers: `content-type: image/svg+xml`, long cache). If the inline SVG carries interactive parts, keep only those parts as a small client component. Keep any text that was inside the SVG (towns, km) as real HTML text next to the image (that text is content Google should read).

### 2.3 JSON-LD only once
Render JSON-LD from a server component as one `<script type="application/ld+json">` per graph, not inside a client component (it then appears again in the RSC payload). Verify: the JSON-LD string occurs **once** in the HTML (count a unique `@id` substring).

### 2.4 Client code
List every `'use client'` component on route/city/home pages. Anything that is not interactive (fare table display, FAQ text, route facts, insights text) becomes a server component. Interactive: booking form, theme toggle, Call/WhatsApp tracking, transfer form. FAQ open/close uses `<details>`, no JS.

### 2.5 Images and fonts
Hero/LCP image: `priority`, correct `sizes`, AVIF/WebP, explicit `width/height`. Other images lazy. Fonts: only used weights, `display: swap`, preload only the LCP font.

### 2.6 Budget test
Add to `scripts/test/rank.mjs` (or a new `scripts/test/weight.mjs` wired into `test:rank`) a check over the built HTML of 10 Wave 1 pages (from `.next/server/app/*.html` or a local `next start` fetch): fail if HTML > 150 KB or JSON-LD appears twice. Record the numbers each run.

**Done when:** the 5 pages meet the budget locally (numbers + Lighthouse JSON in `evidence/lighthouse-2026-11-27-after.json`); the build artifact ≤ 220 MB (number recorded); the test passes; `test:seo`/`test:rank` green.

---

## STEP 3 — Every Wave 1 route page specific (O3, plan B2)

Wave 1 routes (16): Jaipur↔Delhi, Kota↔Jaipur, Kota↔Delhi, Jaipur↔Delhi Airport, Jaipur→Agra, Delhi→Agra, Delhi→Chandigarh, Delhi→Haridwar, Jaipur↔Sikar, Jaipur↔Khatu Shyam ji.

For each route page, in this order on the page (mobile first screen per R32):
1. **H1 + "from" price + fare table per car** (Hatchback/Dzire/Ertiga/Crysta/Tempo 12 as available) — from the API.
2. **Distance & time** — measured (`routeDistance`/`driveTime`); one number everywhere (title, H1 line, table, FAQ, schema). Test exists (R15); extend it to the new blocks.
3. **Route** — towns on the way from the stored polyline (`routeInsights` / evidence files). Name an expressway/highway only if the polyline proves it (record how). No invented stops.
4. **Tolls** — amount from backend `tolls.ts`, "included in the fare" line.
5. **From the drivers** — survey block (R8), only with ≥ 2 approved agreeing drivers; hidden otherwise.
6. **Real demand** — existing insights block ("X trips in 90 days, most-booked car, busiest hours"), per route.
7. **Direction-specific notes** — only rule-based facts that differ by direction: airport drop vs pickup (terminal, waiting rule from `airportTransfers.ts`), Khatu mela advice (general, already written), station pickups that exist in `content/cities` PICKUPS.
8. **Innova Crysta / Tempo Traveller section** (anchor `#innova-crysta`, `#tempo-traveller`) — car-specific fare and seats from the catalog. This replaces the variant pages' purpose (P4); link from the section to the variant page is **not** needed.
9. **One way vs round trip** — the round-trip fare from the API with one line on when it is cheaper.
10. **FAQ: 6–8 questions**, built by `buildRouteFaq` from route data only: fare (cheapest car), distance & time, toll included?, which car for N people, airport/station pickup (if applicable), one way vs round trip, night travel charge (our rule), booking & payment. Questions that are identical on every route move to `/fares-explained` (with an anchor) and the route page links there once ("How fares work").
11. **Keyword targeting** — Step 7 formula.

Tests (`rank.mjs`):
- For every pair of Wave 1 route pages: masked 5-gram overlap of `<main>` text < 0.25 (fail above). Save the matrix to `evidence/overlap-2026-11-27-after.json`.
- FAQ count 6–8 on every Wave 1 route; FAQPage JSON-LD questions == visible questions.
- No block renders an empty heading (hidden when its data is missing).

**Done when:** all 16 pages pass overlap < 0.25 locally; tests green; one screenshot per direction pair in `evidence/`.

---

## STEP 4 — Schema (O4, plan B3)

1. `PRODUCT_SCHEMA_ON = true` constant in `src/lib/schema.tsx`; the Product graph renders only when true (P3). Comment: "Owner decision D2 (9 Oct) / D8 (13 Nov); proposal 27 Nov to remove — OWNER_STEPS §3".
2. Route pages keep: `TaxiService` (organization, `@id` `https://www.hellomycabs.com/#organization`), `Service` with `offers` per car (`priceCurrency: INR`, price from the API, `valueAddedTaxIncluded` true/false exactly as the price is), `BreadcrumbList`, `WebPage`, `FAQPage` (6–8, = visible).
3. No `AggregateRating`/`Review` markup anywhere while own ratings < 10 (existing guard; add a test that the Google rating text never enters JSON-LD — exists in R19, keep it).
4. NAP equality test: name, phone, street, city, PIN in JSON-LD == `company.ts` == footer text == `/contact` text.
5. Validate 6 URLs (home, Jaipur–Delhi, Jaipur Airport, Kota city, Khatu guide, Jaipur–Khatu) with a local JSON-LD parse + schema.org type check script; list them in OWNER_STEPS §4 for the owner's Rich Results Test.
6. 404 map (R39): `not-found.tsx` returns status 404 (check with `curl -I` on a random slug locally and live), links to home, `/routes`, Jaipur–Delhi, Jaipur Airport, Kota city. A known-wrong slug pattern (e.g. `/jaipur-to-delhi-taxi`) stays 404 (no redirect — rule 6).

**Done when:** tests green; JSON-LD parse of the 6 URLs clean; 404 status verified.

---

## STEP 5 — Trust pages and small items (O5, plan B4, B5)

### 5.1 About (`/about`)
From `company.ts` only (P8): legal/brand name, office address, phone, email, years active (only if in code), "More than 3,200 verified drivers use the Hello My Cab driver app (November 2026)" (R31, keep the date), how drivers are verified (KYC: Aadhaar, Driver License, RC, vehicle and selfie — matches the app), link to the driver app on Play Store (`https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app`), office photo slot (renders nothing while null), founder slot (null). List missing fields in OWNER_STEPS §5.

### 5.2 Contact (`/contact`)
NAP block, 24×7 phone, WhatsApp link, map embed (R27), Google rating line (R19), and links to `/fares-explained` and `/jaipur-airport-taxi`.

### 5.3 Footer
NAP (same strings as `company.ts`), links: About, Contact, Fares explained, Routes, Jaipur Airport taxi, 7 Wave 1 city pages. Remove footer links to non-Wave-1 routes (they stay linked from `/routes`).

### 5.4 Small items — each one a check in `rank.mjs` or the crawl
- Exactly one `<h1>` per page.
- Title ≤ 60 characters, description 140–160, both unique across all indexable pages.
- `og:title`, `og:description`, `og:image` (1200×630, existing OG routes) on every Wave 1 page.
- Every `<img>` has non-empty `alt`, `width`, `height`.
- Trailing slash: none (matches canonical); `?utm_*` and uppercase variants canonicalise to the clean URL.
- `lastmod` in sitemaps changes only when the page's content hash changes (not every build). Implement with a stored hash map in `scripts/seo/` or derive from data timestamps; test that two builds without content change keep the same `lastmod`.
- `favicon`, `apple-icon`, `manifest` return 200.
- `robots.txt` unchanged (allow all + 6 sitemaps).
- Mobile: sticky Call/WhatsApp bar on route/city pages does not cover content (CLS < 0.1).
- `hreflang` absent while `HINDI_LIVE = false` (existing test).

### 5.5 Analytics slot (P6)
`src/config/analytics.ts` `GA4_ID: string | null = null`. When non-null: `next/script` `strategy="lazyOnload"` gtag on public pages only (not `/driver/*`, `/rate/*`, `/r/*`, `/bookings`), `anonymize_ip`, and the existing `track()` funnel events also go to GA4. While null: nothing renders (test). OWNER_STEPS §6: how to create the GA4 property and send the ID.

**Done when:** all checks pass; About/Contact/footer screenshots in `evidence/`.

---

## STEP 6 — Index set, pruning, internal links (O6, plan C)

### 6.1 Wave 1 — the only indexable set (~38 URLs)
- `/`, `/routes`, `/fares-explained`, `/about`, `/contact`, `/guides`
- City pages (7): `/cab-service-in-jaipur`, `/cab-service-in-kota`, `/cab-service-in-delhi`, `/cab-service-in-sikar`, `/cab-service-in-agra`, `/cab-service-in-chandigarh`, `/cab-service-in-khatu-shyam-ji`
- `/jaipur-airport-taxi`
- Routes (16): `/jaipur-to-delhi-cab`, `/delhi-to-jaipur-cab`, `/kota-to-jaipur-cab`, `/jaipur-to-kota-cab`, `/kota-to-delhi-cab`, `/delhi-to-kota-cab`, `/jaipur-to-delhi-airport-cab`, `/delhi-airport-to-jaipur-cab`, `/jaipur-to-agra-cab`, `/delhi-to-agra-cab`, `/delhi-to-chandigarh-cab`, `/delhi-to-haridwar-cab`, `/jaipur-to-sikar-cab`, `/sikar-to-jaipur-cab`, Jaipur→Khatu and Khatu→Jaipur (actual slugs from the catalog)
- `/jaipur-to-delhi-round-trip-cab`
- Cars (4): `/dzire-taxi`, `/innova-crysta-taxi`, `/ertiga-taxi`, `/tempo-traveller-12-seater-rental` (actual slugs)
- Guides: `/guides/jaipur-delhi-by-road`, `/guides/how-to-reach-khatu-shyam`, and the R33 guides that were built
- Legal (indexable, **not** in sitemaps, P10): `/privacy`, `/terms`, `/refund`

### 6.2 Everything else: `noindex, follow`, out of every sitemap, self canonical, still 200 and reachable from `/routes`
- `WAVE2_ROUTES` (27) and `WAVE3_ROUTES` (22) — exact lists from `KEYWORD_MAP_ROUTES_27NOV.csv` (`action` column), stored in `src/lib/indexing-tiers.ts` with a comment citing the CSV and the date. This includes the 13 routes indexable today (P5).
- `NO_DEMAND_ROUTES` (14) — CSV "Noindex rakho" (zero Google autocomplete): `/noida-to-kota-cab`, `/chandigarh-to-kota-cab`, `/chandigarh-to-ajmer-cab`, `/chandigarh-to-sikar-cab`, `/kota-to-noida-cab`, `/kota-to-chandigarh-cab`, `/kota-to-sikar-cab`, `/kota-to-haridwar-cab`, `/ajmer-to-delhi-airport-cab`, `/ajmer-to-chandigarh-cab`, `/sikar-to-chandigarh-cab`, `/sikar-to-kota-cab`, `/sikar-to-ajmer-cab`, `/haridwar-to-kota-cab`.
- `FARE_HOLD` (23) and `TWIN_ROUTES` — unchanged.
- Variant pages (P4) except `/jaipur-to-delhi-round-trip-cab`.
- P9 pages.
- Make `TIER3_ROUTES` derive from (or be replaced by) `WAVE2_ROUTES ∪ WAVE3_ROUTES ∪ NO_DEMAND_ROUTES` so there is one source of truth; update `scripts/seo/lib/tiers.mjs` and `release-tier3.mjs` accordingly (Step 10).

### 6.3 Sitemaps
The 6 sitemap URLs stay (the owner submitted them). Contents = Wave 1 minus legal. `sitemap.xml` = union. Group files: core (home, routes, fares, about, contact, guides index), cities (7 + airport), routes (16 + round trip), vehicles (4), guides (2–5).

### 6.4 Internal links
- Home "Searched most": Jaipur→Delhi, Delhi→Jaipur, Jaipur Airport, Kota→Jaipur, Jaipur→Kota, Jaipur→Khatu, Delhi→Agra, Delhi→Chandigarh, plus the 3 big city pages.
- City page → its Wave 1 routes (both directions) + airport (Jaipur) + Khatu (Jaipur, Sikar) + guides.
- Route page → reverse route, its 2 city pages, 3 nearest Wave 1 routes, the related guide, `/fares-explained`.
- Breadcrumb on every page (Home › City › Route).
- Non-Wave-1 pages stay linked from `/routes` (a crawlable HTML list grouped by city) — no `nofollow`.

Tests: sitemap set == Wave 1 minus legal (exact); no noindex URL in any sitemap; every Wave 1 page `index, follow`; every hold page `noindex, follow` + self canonical; Wave 1 links-in ≥ 15 (crawl of local build).

**Done when:** tests green; local crawl `--label idx27-local` shows indexable count = Wave 1 count and links-in ≥ 15 for all Wave 1 pages.

---

## STEP 7 — Keyword targeting (O7, plan F1, F2)

### 7.1 Route pages (Wave 1 now; the same function serves Wave 2/3 later)
| Element | Rule |
|---|---|
| Title | `{A} to {B} Taxi @ ₹{from} \| One Way Cab, {km} km` — ≤ 60 chars; if longer, drop ", {km} km" then shorten "One Way Cab" → "Cab". `{from}` = cheapest car one-way (R14). |
| Meta description | `{A} to {B} taxi from ₹{from} (Dzire), Ertiga ₹{x}, Crysta ₹{y}. {km} km, ~{h} hrs. Toll & tax included. Call 24×7 +91 96671 11921.` — 140–160 chars, fares from the API |
| H1 | `{A} to {B} Taxi Service — One Way Cab from ₹{from}` |
| First paragraph | contains "{a} to {b} taxi" and "cab", fare, km, time — one natural sentence each, no stuffing |
| H2s (when data exists) | "{A} to {B} taxi fare" · "Distance and travel time" · "Route, tolls and stops" · "Pickup points in {A}" · "One way or round trip" · "Innova Crysta and Tempo Traveller for {A} to {B}" · "Questions about {A} to {B} cab" |
| Image alt | `{A} to {B} taxi — {car}` |
| URL | unchanged |

Airport names: "Delhi Airport (IGI)" in H1/first paragraph of Delhi Airport routes (autocomplete shows "igi airport").

### 7.2 City pages (Wave 1 cities)
Title `Taxi Service in {City} — One Way & Outstation Cab | Hello My Cab` (≤ 60; shorten the brand part first). H1 `Taxi Service in {City}`. Sections: outstation fares table (Wave 1 routes from the city + top others linked via `/routes`), local 8 hr / 80 km and 4 hr / 40 km (from `/fare/local`), airport pickup (Jaipur → `/jaipur-airport-taxi`), railway station pickup (PICKUPS data), "Contact number: +91 96671 11921, 24×7" near the top (searched: "kota taxi service number", "taxi service in jaipur contact number"), pickup areas (existing data). Kota: line for Kota↔Jaipur/Delhi student trips (no invented offers). Khatu: Reengus station transfer (R24). No separate sightseeing page (F3 — owner fares needed).

### 7.3 Home, airport, brand
- Home targets: "one way taxi", "one way cab", "one way cab booking", "one way taxi service", brand "hello my cab". Title stays brand-first (R31). H2 "One way taxi from ₹… — pay only for one side".
- `/jaipur-airport-taxi`: title/H1 already set (R21); add "Jaipur Airport cab" and "taxi at Jaipur Airport" naturally in the first paragraph and an H2.
- About: "Hello My Cab" + "Hello My Cab Jaipur / Delhi / Sikar" naturally (brand searches "hello my cab delhi", "hello my taxi sikar").

### 7.4 Keyword map in code + tests
- `scripts/seo/keywords-seed.mjs`: read `KEYWORD_MAP_ROUTES_27NOV.csv` (route primaries/secondaries) + the city/generic table of the plan (F2) → `docs/seo/keywords.csv` (keep existing columns, add `wave`).
- Tests: every keyword has exactly one target URL; every target URL is Wave 1 or listed in a wave; every Wave 1 route's title contains "{a} to {b}" and "Taxi"; description contains "taxi" and "₹"; H1 contains "Taxi Service"; no title/description duplicates; title price == API (R14).

**Done when:** tests green; a table of the 16 route titles + 7 city titles + home/airport in the ledger (L28) with their lengths.

---

## STEP 8 — Off-site kit for the owner (O8, plan D)

Update/create (Hinglish, copy-paste ready):
1. **`docs/seo/GBP_POSTS_DEC2026.md`** — 12 posts (3 per week, 4 weeks), each: route, text ≤ 1,500 chars (first 100 chars carry "{A} to {B} taxi ₹{from}"), the button ("Book" / "Call now"), link `https://www.hellomycabs.com/{slug}?utm_source=gbp&utm_medium=post&utm_campaign={slug}`, which photo to use (from the photo list). Fares from the API at writing time (print the date). Routes: Jaipur→Delhi, Delhi→Jaipur, Jaipur Airport, Kota→Jaipur, Jaipur→Kota, Jaipur→Khatu, Delhi→Agra, Delhi→Chandigarh, Delhi→Haridwar, Jaipur→Sikar, Kota→Delhi, Delhi Airport→Jaipur.
2. **GBP products** (in the same file): 16 Wave 1 routes + airport transfer — name, "from" price, 1-line description, link with UTM.
3. **GBP checklist refresh** (`GBP_KIT_21NOV.md` §1 still valid): add service areas (Jaipur, Kota, Delhi, Sikar, Khatu Shyam ji, Agra, Chandigarh, Ajmer, Jaipur Airport) and "website = https://www.hellomycabs.com/".
4. **`CITATIONS_21NOV.md`** — re-check the 11 start URLs (HTTP status only), keep the NAP block identical to `company.ts`.
5. **Partner list** (`docs/seo/PARTNERS_27NOV.md`): types (Kota PG/hostels → Kota page; Jaipur hotels travel desk → airport page; Khatu dharamshalas → Khatu page; travel agents using our cabs → home), a 3-line WhatsApp message the owner can send, and the rule "link only where a real partnership exists". No names/phones of third parties collected by you.
6. **Brand line** for WhatsApp broadcasts/visiting card/car sticker: `hellomycabs.com — One way taxi, Jaipur · Delhi · Kota · Khatu Shyam ji · 24×7 +91 96671 11921`.
7. **Video ideas** (5) for YouTube/Instagram/GBP: real drives the owner's drivers can film (Jaipur–Delhi expressway, Jaipur–Khatu road, Jaipur Airport pickup point), each with the page link to put in the description.
8. Do **not** prepare anything for HackMD/Issuu/Payhip-style posting.

**Done when:** files exist; every price in them matches the API on the writing date (check script output recorded); every link returns 200 (or is a Wave 1 page that will exist after release — mark those).

---

## STEP 9 — Measuring (O9, plan E, H)

1. `scripts/seo/gsc-weekly.mjs`: coverage per **wave** (Wave 1 indexed / total, Wave 2…, holds), "Discovered" trend vs last week, and the gate verdict for the next wave (≥ 80% of the current wave indexed and Discovered not rising). Tests with the 27 Nov fixtures (expect Wave 1 = 1/~38, gate not met).
2. `scripts/seo/weekly.md`: Monday routine updated (owner exports: Coverage + 5 drilldowns, Performance 7d + 28d; GBP Performance screenshot; then the command). Write the plan's decision rules (H3) into it, and make `gsc-weekly.mjs` print the matching line:
   - 2 weeks after release, Wave 1 < 30% indexed → URL Inspection on 5 pages (Google-selected canonical, page fetch, last crawl); re-run `page-quality.mjs` (weight + overlap).
   - 4 weeks after release, still < 30% → propose (to the owner) the lean static route template (Autochatix-style plain HTML) as the next technical step.
   - ≥ 80% and Discovered not rising → run `release-wave.mjs --wave 2`.
   - Page indexed but ~0 impressions for its keyword group after 3 weeks → revisit its title/H1 against the keyword map.
   - Anything in GSC "Manual actions" → stop all releases and report the same day.
3. **Request-Indexing list** in OWNER_STEPS §2: day 1–3 lists exactly as plan E2 (10 per day), then the remaining Wave 1 URLs; with "do this only after Step 11 live checks pass and after waiting 3–4 days".
4. **Validation timing** in OWNER_STEPS §2: "Validate fix" on "Crawled – not indexed" and "Discovered" only **14 days after** the release date (write the actual date).
5. **Removals:** OWNER_STEPS §2 — temporary removal for `https://api.hellomycabs.com/privacy`.
6. **Bing:** OWNER_STEPS §7 — Bing Webmaster Tools "Import from GSC", submit the 6 sitemaps; IndexNow already runs.
7. **Overlap/weight evidence** script: `scripts/seo/page-quality.mjs <base-url>` → HTML/gzip/style/script/JSON-LD bytes + masked overlap matrix for Wave 1 → `evidence/page-quality-<date>.json`. Used in Step 0 (baseline), Step 11 (after) and monthly.

**Done when:** tests green; fixtures produce the expected verdict; OWNER_STEPS sections written.

---

## STEP 10 — Wave tooling (O10, plan G)

1. `indexing-tiers.ts`: `WAVE1_*` (= the 6.1 sets), `WAVE2_ROUTES`, `WAVE3_ROUTES`, `NO_DEMAND_ROUTES`, `FARE_HOLD`, `TWIN_ROUTES`; helpers `isIndexableRoute(a,b)`, `waveOf(a,b)`.
2. `scripts/seo/release-wave.mjs --wave 2 [--apply]` (rename or wrap `release-tier3.mjs`): reads `--coverage` (GSC export folder), refuses unless the gate is met for the previous wave, refuses any FARE_HOLD / NO_DEMAND / TWIN pair, and with `--apply` moves the wave's routes into the indexable set (edits only the wave arrays). Prints what it would change without `--apply`.
3. Before a wave can open, each of its routes must pass the Step 3 checklist (blocks present, overlap < 0.25 against Wave 1 and each other). `release-wave.mjs` runs that check against a local build and refuses if any route fails.
4. Tests: refuses without coverage; refuses with the 27 Nov coverage (gate not met); with a fixture where Wave 1 is 85% indexed and Discovered falling → lists exactly the Wave 2 routes; never includes held/no-demand/twin; `--apply` edits only the arrays.

**Done when:** tests green.

---

## STEP 11 — Verification and release (O11)

1. **Website pre-flight:** `npx tsc --noEmit`, `npm run lint`, `npm run test:seo`, `npm run test:rating`, `npm run test:rank`, `npm run qa:quality`, `npm run build` (artifact ≤ 220 MB — record). Local `next start` + `page-quality.mjs http://localhost:3000` → all Wave 1 within budget, overlap < 0.25. Local crawl `--label idx27-local-final`.
2. Backend: nothing new beyond Step 1.3 unless a step needed it; if so, same routine (tests → commit by path → push → `/health`).
3. **Website commit(s)** by path: (a) the 21 Nov website work, (b) this task — separate commits with clear messages, both verified in a clean worktree (`npm ci` or symlinked `node_modules`, `tsc` + `test:rank` + `build`). Push. Wait until Amplify serves the new build (poll a page that changed, e.g. `/jaipur-airport-taxi` 200 and `/jaipur-to-delhi-cab` showing the measured km).
4. **Live checks** (record each, with the date/time):
   - Every Wave 1 URL: 200, `index, follow`, self canonical, title ≤ 60, description 140–160, exactly one H1, JSON-LD parses, JSON-LD once.
   - 10 hold URLs (mix of Wave 2, Wave 3, no-demand, fare-held, variant, P9): 200, `noindex, follow`, absent from all 6 sitemaps.
   - Sitemap counts per group = Step 6.3; legal pages absent; `robots.txt` unchanged.
   - Price check: the 16 route titles vs `/fare/oneway` (all equal).
   - `/cab-service-in-jaipur-airport` → 308 `/jaipur-airport-taxi`; random slug → 404 with status 404.
   - `/hi/` sample → noindex, absent from sitemaps.
   - `page-quality.mjs https://www.hellomycabs.com` → `evidence/page-quality-2026-11-<dd>-live.json`; production crawl `--label idx27-after` → compare with the Step 0 baseline (HTML median, pairs > 0.35/0.5, links-in).
   - Lighthouse mobile on the 5 pages (live) → compare with baseline.
   - `node scripts/seo/monitor-domains.mjs` all green (apex 301, http 301, api noindex).
5. **IndexNow:** submit the Wave 1 URLs (only those).
6. **Ledger** L0–L46 filled. Docs commit by path, following the repo's practice (the 13 Nov and 20 Nov PLAN/PROMPT/LEDGER files in `docs/seo/` are tracked in git):
   - with the 21 Nov website commit: `PLAN_RANK_21NOV.md`, `PLAN_RANK_STEPS_21NOV.md`, `PROMPT_RANK_21NOV.md`, `LEDGER_RANK_21NOV.md`, `OWNER_STEPS_RANK_21NOV.md`, `CITATIONS_21NOV.md`, `FARE_REVIEW_21NOV.md`, `GBP_KIT_21NOV.md`;
   - with this task: `PLAN_INDEX_RANK_27NOV.md`, `PROMPT_INDEX_RANK_27NOV.md`, `KEYWORD_MAP_ROUTES_27NOV.csv`, `LEDGER_INDEX_RANK_27NOV.md`, `OWNER_STEPS_INDEX_RANK_27NOV.md`, `GBP_POSTS_DEC2026.md`, `PARTNERS_27NOV.md`, `keywords.csv`, `WEEKLY.md`, `evidence/gsc-2026-11-27/**` and the new evidence files;
   - **never** `docs/seo/CHATGPT_HANDOVER.md`, never the deleted `public/img/*.jpg`.

**Done when:** all live checks recorded green (or the failing one fixed and re-checked); IndexNow response recorded.

---

## 12. What must NOT happen (check before each commit)
- No new page types, no per-locality pages, no city × city additions.
- No URL changes; no new redirects.
- No fare changes; FARE_HOLD routes stay noindex.
- No Wave 2/3 or Hindi opened.
- No fake facts, ratings, reviews, photos.
- No owner files staged; no attribution line.
- No env changes; no DNS/GSC/GBP actions by you.

---

## 13. Ledger rows (each: done / blocked / skipped + reason + evidence)

L0 baseline (commands, live crawl, weight, overlap, Lighthouse, prod counts) · L1 21 Nov backend shipped + live checks · L2 21 Nov diff review verdicts · L3 R32 route page order + screenshot · L4 R33 guides · L5 R34 links ≥ 15 · L6 CSS shrink (before/after KB) · L7 P2 A/B (if run) · L8 route map as image · L9 JSON-LD once · L10 client components reduced (list) · L11 images/fonts · L12 weight budget test · L13 route blocks 1–9 · L14 FAQ 6–8 + `/fares-explained` anchors · L15 overlap test + matrix · L16 Product switch (P3) · L17 Service/Offer/Breadcrumb/WebPage/FAQ graphs · L18 NAP equality test · L19 JSON-LD validation 6 URLs · L20 404 status + links · L21 About · L22 Contact · L23 Footer · L24 small items checks · L25 analytics slot (P6) · L26 Wave 1 set + hold lists in code · L27 sitemaps = Wave 1 · L28 titles/descriptions/H1 table · L29 internal links + breadcrumb · L30 city page sections · L31 home/airport/brand targeting · L32 keywords.csv from the map + tests · L33 GBP posts (12) + products · L34 GBP checklist refresh · L35 citations re-check · L36 partners file · L37 brand line + video ideas · L38 gsc-weekly waves + gate · L39 weekly routine · L40 Request-Indexing list + validation date + removals + Bing (OWNER_STEPS) · L41 page-quality script · L42 release-wave tool + tests · L43 pre-flight results · L44 website commits + clean-worktree checks + deploy · L45 live checks · L46 IndexNow + ledger/owner file committed.

---

## 14. Owner file — `docs/seo/OWNER_STEPS_INDEX_RANK_27NOV.md` (Hinglish)

§1 **Kya live hua** (one paragraph, no ranking claims) aur aaj ki taareekh.
§2 **Google Search Console:** release ke 3–4 din baad Request Indexing — Din 1/2/3 ki list (10-10 URL, plan E2 ke kram mein), phir baaki Wave 1; sitemaps dobara submit (wahi 6); **"Validate fix" sirf {release + 14 din} ko**; Removals → `https://api.hellomycabs.com/privacy` (temporary); Links report ka screenshot har mahine.
§3 **Faisle jo aapke hain:** P3 Product schema hatana (kyun: service par Google Product rich result nahi deta) — "hata do" bolo to ek line; P2 sirf agar CSS chhota na ho paaya; P4/P5/P9 jo default lagaye wo palatne hon to batayein.
§4 **Rich Results Test** — 6 URLs.
§5 **About page ke liye chahiye:** company ka kanooni naam, office photo, (marzi ho to) GST/registration, founder ka naam.
§6 **GA4:** property banana (step-by-step), Measurement ID bhejna — code mein jaayega, env nahi.
§7 **Bing Webmaster Tools:** GSC se import, 6 sitemaps.
§8 **Route survey:** "bhej do" bolo to `--send` (23 drivers, 11 roads, dry-run numbers).
§9 **Baad ke faisle (is kaam mein nahi):** Ghoomo Rajasthan ke tour pages par jahan taxi ki baat ho wahan sahi hellomycabs route page ka link (Ghoomo par route pages kabhi nahi); local news portals par asli kahani ("3,200+ drivers ka network"); har mahine 2 naye guides (sirf asli data wale); app mein website share link aur "review link bhejein" button; Delhi Airport transfer fares; sightseeing/tempo packages; naye routes (`new-routes-2026-11-21.txt`); 23 galat fares (`FARE_REVIEW_21NOV.md`); GBP review link (D2); GBP naam (D5).
§10 **GBP har hafte:** 3 posts (`GBP_POSTS_DEC2026.md`), 2 photos, reviews ka jawab 48 ghante mein, products ek baar; Performance → Website clicks ka screenshot har somvaar.
§11 **Listings:** `CITATIONS_21NOV.md` ki 11 sites; bann jaane par profile URLs bhejein (tab `sameAs` jodunga).
§12 **Partners + brand line + videos:** `PARTNERS_27NOV.md`.
§13 **Har somvaar:** GSC exports (Coverage + 5 drilldowns, Performance 7d + 28d) + GBP screenshot → main `WEEKLY.md` aur wave gate ka faisla.
§14 **Har mahine:** `SERP_TEMPLATE.md` ke 12 search, India se incognito phone par.

---

## 15. Final report (Hinglish, to the owner)

Short and factual:
- **Kya live hua:** 21 Nov ka kaam aur is kaam ke pages; commits (website + backend).
- **Pehle → baad:** HTML size, gzip, CSS KB, Lighthouse LCP/Performance, overlap (max pair), links-in, indexable pages count, sitemap count.
- **Tests:** counts per suite; known `broadcastBurst` note if it appears.
- **Live checks:** pass/fail list.
- **Aapke kaam:** OWNER_STEPS §2 (dates), §3 faisle, §5, §6, §10–§13.
- **Agla somvaar** kya dekhna hai, aur wave gate kab jaanchenge.
- No ranking promises — only what was shipped and measured.
