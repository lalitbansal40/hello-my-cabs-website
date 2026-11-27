# MASTER PROMPT — hellomycabs.com: everything that comes next, in order (27 Nov 2026)

This is the **one runbook** for all remaining SEO work. It does not repeat the detailed prompts — it sequences them, fills the gaps between them, and lists every dated and owner-triggered task, so nothing is forgotten.

Detailed prompts it runs (read each fully when its turn comes):
- `docs/seo/PROMPT_KEYWORD_FILES_27NOV.md` — the owner's keyword files (Part B here).
- `docs/seo/PROMPT_INDEX_RANK_27NOV.md` — **done and live** (ledger `LEDGER_INDEX_RANK_27NOV.md` L0–L46); its weekly routine and gate continue (Parts A, D).
- `scripts/seo/old-domain/README.md` — the hellomycab.com 301 runbook (Part E).

Plans behind them: `PLAN_INDEX_RANK_27NOV.md` (+ addendum K9), `PLAN_KEYWORD_FILES_27NOV.md`, `KEYWORD_FILES_PAGE_DECISIONS_27NOV.csv`.

Work in the order below. Every task ends with **Done when**; record each in `docs/seo/LEDGER_MASTER_27NOV.md` (rows M0–M60, §8). Owner-facing text in simple Hinglish; code, comments, commits, tests in English.

---

## 0. Where things stand (27 Nov 2026 — verify before acting)

| What | State | Evidence |
|---|---|---|
| Backend | `002c5e4` live (Khatu / Jaipur Airport fares, `/public/transfers`, route survey, review settings) | `/health` |
| Website | `93b1f77` + docs `c1dc126` live | Amplify |
| App | `b6293e1` (admin survey areas; ships with the next app build) | — |
| Indexable set | **Wave 1 = 45 URLs** (16 routes, 7 cities, airport, 4 cars, 10 guides, core); everything else `noindex, follow` | `LEDGER_INDEX_RANK_27NOV.md` L45 |
| Google (export of 23 Nov) | 1 of 45 indexed; Discovered 50 (119 a week earlier); Crawled-not-indexed 29 (validation "Failed") | `WEEKLY.md` 27 Nov |
| Page weight | HTML median 524 → 240 kB; Lighthouse mobile `/` 98, Jaipur–Delhi 93; **Jaipur city LCP 3.21 s (worse in 1 run — re-measure)** | L45 |
| Sameness | `<main>` masked overlap max 0.627 (target 0.25 not met — needs driver facts) | L15 |
| IndexNow | 45 URLs, 200 accepted (27 Nov) | L46 |
| Biggest open issue | **hellomycab.com** (2017, 124 indexed pages, same phone/routes) still a separate live site; control lost | `PLAN_INDEX_RANK_27NOV.md` K9 |

**Done when (M0):** each row re-checked live (`/health`, `page-quality.mjs`, `monitor-domains.mjs`, sitemap count) and recorded.

---

## 1. Rules (all prompts' rules apply; these are the ones most often at risk)

1. No env changes for the owner — settings in code. 2. Production DB read-only; aggregates only. 3. No fake facts, fares, distances, timings, tour stops, reviews, photos, "guide", "platform pickup". 4. No thin / doorway pages; one keyword group → one URL. 5. Price in title/heading/schema = the API. 6. Never change URLs. 7. **No wave opens except through `release-wave.mjs` with the gate met**; Wave 1 stays 45 until then (test). 8. Per-km routes only on a measured road distance (≤ 10% off the estimate). 9. Commits by path; never stage owner files (`PLAN_*`/`PROMPT_*`/`LEDGER_five_changes.md` in the backend root, `docs/seo/CHATGPT_HANDOVER.md`, the deleted `public/img/monument.jpg` / `open-road.jpg`) or `~/Downloads/Triplesinfotech - Sheet1.csv` (a vendor contact list — never in any repo); **no Co-Authored-By / Claude attribution line**. 10. No DNS/GSC/GBP/Bing/directory actions — owner; you prepare text. 11. IndexNow only for indexable URLs. 12. Before every website build: delete `.next/cache/fetch-cache`. 13. Known noise: backend `broadcastBurst` ECONNRESET on this Mac — record, do not chase.

---

## PART A — The calendar (dated tasks; do them on the day, whatever else is running)

| Date | Who | Task | Done when |
|---|---|---|---|
| **Mon 30 Nov 2026** | Owner | Search Console exports into `docs/seo/evidence/gsc-2026-11-30/` (Pages summary + every not-indexed drilldown + **"View data about indexed pages"** + Performance 7 d / 28 d) and GBP Performance screenshot | files present |
| Mon 30 Nov | Agent | `node scripts/seo/gsc-weekly.mjs --curr <perf-28d> --prev docs/seo/evidence/gsc-2026-11-27/perf-28d --coverage <30 Nov> --prev-coverage docs/seo/evidence/gsc-2026-11-27 --date 2026-11-30 --write`; record Wave 1 x/45, Discovered vs 50, "Next step" | WEEKLY.md block (M1) |
| Mon 30 Nov | Agent | Lighthouse mobile **3 runs** on `/cab-service-in-jaipur` and the 4 other baseline pages (`BASE_URL=https://www.hellomycabs.com node scripts/audit/lighthouse.mjs --runs=3 --pages=…`) → if Jaipur city median LCP > 2.9 s: find the LCP element and fix (it is text: check font loading / the hero block) | evidence + verdict (M2) |
| 30 Nov – 4 Dec | Owner | Request Indexing, 10 a day, the lists in `OWNER_STEPS_INDEX_RANK_27NOV.md` §2 (Din 1–4 + 5 guides); sitemaps resubmitted once (30 Nov); Removals: `https://api.hellomycabs.com/privacy` | owner confirms (M3) |
| Mon 7 Dec | Both | Weekly routine (as 30 Nov) | M4 |
| **Fri 11 Dec** | Owner | **Validate fix** on "Crawled – currently not indexed" and "Discovered – currently not indexed" (14 days after release) | owner confirms (M5) |
| Fri 11 Dec | Agent | 2-week rule (`scripts/seo/weekly.md` §10): if Wave 1 < 30% indexed → URL Inspection notes on 5 Wave 1 pages (the owner sends screenshots of Google-selected canonical / page fetch / last crawl) + `page-quality.mjs` live → written finding in WEEKLY.md | M6 |
| Mon 14, 21 Dec | Both | Weekly routine; gate check each time | M7, M8 |
| **Fri 25 Dec** | Agent | 4-week rule: if Wave 1 still < 30% → write the proposal for the **lean static route template** (plain HTML route pages, Autochatix-style: what changes, effort, risk, how to measure) to the owner — do not build without the owner's yes | M9 |
| Every Monday after | Both | Weekly routine; when the gate is met → Part D | M10… |
| Monthly (1st Monday) | Owner | 12 phone searches (`evidence/SERP_TEMPLATE.md`), GSC Links report screenshot; Agent: `page-quality.mjs` live → `evidence/page-quality-<date>.json` | M11 |

---

## PART B — The keyword-files work (agent, start now)

Run `docs/seo/PROMPT_KEYWORD_FILES_27NOV.md` Steps 0–9 exactly (its ledger `LEDGER_KEYWORD_FILES_27NOV.md` K0–K40). Facts verified on 27 Nov that the prompt already carries — re-check them first:
- `/fare/local` is **one package list for every city** (`api.localPackages()` takes no city); default prices in backend `src/constants/fareTable.ts` (hatchback ₹2,500, Dzire ₹2,750, Ertiga ₹3,250, Crysta ₹5,000 for 8 h / 80 km) — **check whether the admin panel config (`config.model.ts` local packages) overrides them** before quoting any price in text.
- The vehicle catalogue has **no luggage field** → no "bags" figures.
- `components/BookingWidget.tsx` supports the **local** trip type → the sightseeing page uses it.
- City keys exist for PUSHKAR, JODHPUR, JAISALMER, DEHRADUN, LUDHIANA, UDAIPUR, RISHIKESH, GURGAON, MATHURA, VRINDAVAN; **not** SALASAR.
- Per-km catalogue km = straight line × 1.3 (`demandRoutes.ts`) → measure before publishing.

**Done when (M12–M20):** keyword-files ledger complete, released, live checks recorded.

---

## PART C — Small gaps between the prompts (agent; after Part B, same release if possible)

1. **Weekly report knows the new pages (M21).** `gsc-weekly.mjs`: list the held Wave 2 paths added by Part B (new routes, station page, sightseeing page) under "Waiting for Wave 2" with whether Google has seen them (they may show as "Excluded by noindex" — that is expected).
2. **`release-wave.mjs` covers held paths, not only routes (M22).** Wave 2 now also has non-route pages (`WAVE2_PATHS` from Part B). The release must open both (`RELEASED_WAVES` already drives routes; make `WAVE2_PATHS` follow the same switch) and `--check` must measure them. Tests.
3. **Overlap target needs facts (M23).** The only honest way to bring `<main>` overlap below 0.25 is driver facts. Prepare the survey send for the owner's word (Part F-8): dry-run numbers refreshed (`npx tsx scripts/send-route-survey.ts`), written to OWNER file. When answers arrive (≥ 2 approved per road), run `node scripts/seo/pull-driver-data.mjs`, rebuild, re-measure overlap.
4. **Quality baseline discipline (M24).** Every time `quality-baseline.json` is rewritten, the ledger says why (as L43 did). Add a one-line check in `scripts/seo/weekly.md`: "never rewrite the baseline to make a red gate green without a reason in the ledger".
5. **Evidence hygiene (M25).** `docs/seo/evidence/` grew by large PNGs (1.2 MB). Future screenshots as compressed JPEG/WebP ≤ 300 kB; do not rewrite history.
6. **Memory note (M26).** Update the project memory (`hellomycabs-seo-nov-2026`) after each release with commit, Wave 1 count and open issues.

**Done when:** each item done or blocked with reason.

---

## PART D — When the gate is met (Wave 2 release procedure)

Trigger: the weekly line says "gate met" (Wave 1 ≥ 80% indexed **and** Discovered not rising vs last week).

1. Fresh local build (fetch cache cleared), `npx next start -p 3100`.
2. Every Wave 2 page gets the Part B §A improvements (outstation / door to door / family / own numbers) **before** release — run `keyword-coverage.mjs` on them.
3. `node scripts/seo/release-wave.mjs --wave 2 --coverage <this week> --prev-coverage <last week> --check http://localhost:3100` (dry) → fix any pair above the overlap limit → rerun with `--apply`.
4. Tests, build, commit (`RELEASED_WAVES` change only + content fixes), push; live checks: sitemap = Wave 1 + Wave 2; Wave 2 pages `index, follow`.
5. IndexNow (the new URLs); OWNER file: Request Indexing list for Wave 2 (10/day), Validate fix 14 days later.
6. GBP posts for the Wave 2 routes (text, prices from the API).
7. Wave 3: the same, two weeks after Wave 2 passes the gate.

**Done when (M30–M36):** release recorded with the before/after Wave counts.

---

## PART E — The old domain (owner-triggered; the biggest single step)

Trigger: the owner gets the GoDaddy login (or the Hostinger hosting) for **hellomycab.com** back.
1. `node scripts/seo/old-domain/update-map.mjs --write` (new routes since the map was made — include Part B's new routes and pages; held pages are fine targets, the 301 still carries the old page's standing).
2. `node scripts/seo/old-domain/make-redirects.mjs` → `htaccess.txt` / `cloudflare-bulk.csv`.
3. Put the redirects live (README: Hostinger `.htaccess` above WordPress, or GoDaddy → Cloudflare Bulk Redirects) — owner clicks, agent prepares the exact steps and values.
4. `node scripts/seo/old-domain/verify-redirects.mjs` → must be `125/125`.
5. Owner: GSC old-domain property (DNS TXT) → **Change of address** → hellomycabs.com.
6. Keep redirects for good; domain auto-renew; MX records kept if email exists.
7. Re-run `monitor-domains.mjs`: hellomycab.com → one 301 → the right www page.

**Done when (M40–M46):** 125/125 verified live, Change of address submitted (owner screenshot).

---

## PART F — Owner decisions: what each answer changes (one place, exact edits)

When the owner answers, make exactly this change, test, deploy, record.

| # | Owner says | Change (file → edit) | Then |
|---|---|---|---|
| F-1 | Product schema "hata do" (P3) | website `src/lib/schema.tsx` `PRODUCT_SCHEMA_ON = false` | tests (`test:rating` expects Service + Product — update), deploy, Rich Results Test on 2 routes |
| F-2 | Title "Taxi @ ₹X \| One Way Cab" (D1) | website `src/app/[slug]/page.tsx` route title head/tails | title tests, overlap guard, deploy |
| F-3 | Analytics ID / Plausible account | website `src/config/analytics.ts` (`GA4_ID` or `PLAUSIBLE_DOMAIN`) | test 'analytics' expects null — update to the value; verify the script loads on `/` and **not** on `/driver/route/x`, `/rate/x` |
| F-4 | GBP review link (D2) | backend `src/config/reviewSettings.ts` `GBP_REVIEW_URL`; website `src/lib/company.ts` `reviewUrl` | review tests; contact page shows "Rate us on Google" |
| F-5 | WhatsApp rating template approved | backend `reviewSettings.ts` `RATING_TEMPLATE_APPROVED = true` | `reviews.test.ts`; watch the first day's sends (count only) |
| F-6 | Office photo / founder / GST | website `company.ts` `officePhoto`, `founder` (photo into `public/img/`, ≤ 200 kB WebP) | About renders them |
| F-7 | Listings created (profile URLs) | website `company.ts` `sameAs` (only checked, live profiles) | JSON-LD test |
| F-8 | "Survey bhej do" | backend `npx tsx scripts/send-route-survey.ts --send` (after a fresh dry run) | count sent (no names); Part C-3 when answers arrive |
| F-9 | Fares decided for FARE_HOLD pairs | backend `src/constants/fareTable.ts` (+ tolls if needed); website remove the pair from `FARE_HOLD` | `fare-sanity.mjs` re-run (the pair no longer flags); the route waits for its wave like any other |
| F-10 | Station fares (E1) | backend `airportTransfers.ts` `TRANSFERS['jaipur-railway-station']` (zones × cars, the airport shape) | station page goes 200 (still noindex, Wave 2); GBP post |
| F-11 | Local package price (E2) | backend `fareTable.ts` local defaults **or** the admin panel's local config (whichever `/fare/local` reads — check first) | sightseeing + city pages show the new price automatically; GBP post |
| F-12 | Ludhiana–Chandigarh fare (E3) | backend `fareTable.ts` fixed pair **or** `DEMAND_ROUTES` (per-km) per the owner | distance check; WAVE2 entry; page builds held |
| F-13 | Short Haridwar routes (E5) | as F-12 | — |
| F-14 | Salasar (E6) | backend `cities.ts` `SALASAR` (coordinates from a measured source, not guessed) + fare + `DEMAND_ROUTES` | city directory test (keep it out of the driver directory like Khatu — `DISPATCH_PARENT` if needed) |
| F-15 | Hindi reader approves (E7) | website `HINDI_REVIEWED = true`; later `HINDI_LIVE = true` only with the gate (Wave 1 ≥ 80%) | Hindi tests; hreflang appears only with `HINDI_LIVE` |
| F-16 | Domain recovered (E8) | Part E | — |
| F-17 | Real Char Dham / Rajasthan packages | `src/content/chardham`, `src/content/rajasthan` (`*_IS_SAMPLE = false`) | the page becomes indexable only through a wave |
| F-18 | Keyword Planner volumes file | `docs/seo/evidence/keyword-planner-<date>.csv` → `keywords-seed.mjs` adds a `volume` column; priorities re-ranked | keywords tests |

**Done when (M50–M60):** each answered decision applied, tested, deployed and recorded; unanswered ones listed in the weekly report.

---

## PART G — Never (check before every commit)
- A page per small town / locality; a second page for a twin route; generated-phrase pages.
- A wave opened by hand; Wave 1 changed without a release.
- Fares, packages, distances, timings, tour stops, guide claims, luggage figures that no source gives.
- Spam links (HackMD / Issuu / Payhip), bought links, cloaking.
- Owner files, the Triplesinfotech file, attribution lines in commits; env changes.

## 7. Report to the owner (after each part)
Hinglish, short: what went live, numbers before → after (Wave 1 x/45, Discovered, coverage, weight, overlap), what is waiting on the owner (Part F rows still open, dated tasks of Part A), no ranking promises.

## 8. Ledger rows (`docs/seo/LEDGER_MASTER_27NOV.md`)
M0 status re-check · M1 weekly 30 Nov · M2 Lighthouse 3-run + Jaipur city verdict · M3 Request Indexing done (owner) · M4 weekly 7 Dec · M5 Validate fix 11 Dec (owner) · M6 2-week rule finding · M7 weekly 14 Dec · M8 weekly 21 Dec · M9 4-week rule / lean template proposal · M10 later weeklies · M11 monthly checks · M12–M20 keyword-files prompt (link K0–K40) · M21 weekly lists held Wave 2 pages · M22 release-wave covers WAVE2_PATHS · M23 survey prep + driver facts pipeline · M24 baseline discipline note · M25 evidence hygiene · M26 memory update · M30–M36 Wave 2 release · M40–M46 old domain · M50–M60 owner decisions applied (one row per F-item answered).
