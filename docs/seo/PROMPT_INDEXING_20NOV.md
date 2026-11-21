# IMPLEMENTATION PROMPT — hellomycabs.com pages index karwana (20 Nov 2026)

Implements `docs/seo/PLAN_INDEXING_20NOV.md` (same folder). Read this whole prompt **and** that whole plan, plus `LEDGER_13NOV.md`, before changing anything. Do the steps in order. Keep a ledger from Step 0 to the end (Section 12 lists every row).

**This prompt is a document. Nothing in it has been implemented, deployed or verified yet.**

---

## 0. Outcomes

| ID | Outcome |
|---|---|
| O1 | `hellomycabs.com` (http + https) answers one 301 hop to `https://www.hellomycabs.com{path}{query}`. |
| O2 | No page shows a rating number that real customer ratings do not support. The "63,000+ travellers" text is gone everywhere. |
| O3 | Only a focus set is offered to Google first: Tier 1 (~30 pages) + Tier 2 indexable; Tier 3 (~85 low-demand route pairs) `noindex, follow` and out of every sitemap, still live for users. Tiers can move by editing one list. |
| O4 | Every Tier 1 route/city page carries real, unique, dated data (aggregate demand, vehicle mix, fare range, measured distance/time) from the backend — nothing invented — and repeated boilerplate is moved to one page. Tier 1 pairwise similarity < 0.35, every indexable pair < 0.6, Tier 1 main content ≥ 900 words. CI fails if these regress. |
| O5 | Tier 1 pages are pre-built (cache-miss TTFB < 0.3 s). |
| O6 | Search engines are told: sitemaps, IndexNow, an exact Request Indexing schedule, weekly measurement and gates. |

### Owner decisions (plan §3). Defaults apply unless the invoking instruction says otherwise — record which.

| ID | Default for this run |
|---|---|
| N1 apex DNS | **Owner-only** (Hostinger). Check it in Step 1; if the A record is still missing, do everything else and mark O1 "blocked on N1". Never touch DNS yourself. |
| N2 review counters | **Yes, non-destructively:** website guard + backend public API guard so the inflated `reviewstats` are never shown. Do **not** rebuild/delete `reviewstats` in production unless the invoking instruction explicitly says so (then: backup first, Step 3.4). |
| N3 focus set | **Yes** — Tier 3 via the existing `NOINDEX_THIN` mechanism. |
| N4 aggregate data | **Yes** — counts, mix, fare range only; no names/phones/addresses; minimum sample thresholds. |
| N5 Jaipur Airport / Khatu pages | **No** in this run (fares unconfirmed, D4). |

---

## 1. Repos, rules, safety

| Repo | Path | HEAD when written |
|---|---|---|
| Website (Next 16) | `/Users/lalitbansal/Documents/hellomycab/hello-my-cabs-website` | `e1c997c` |
| Backend | `/Users/lalitbansal/Documents/hellomycab/hello-my-cab-backend` | `dd3da80` |

1. `git status`, `git log -5`, `git pull` in both. Read `AGENTS.md` / `CLAUDE.md` (website: **this is Next 16 — read `node_modules/next/dist/docs/` for any Next API you touch**). Note pre-existing local changes (website: deleted `public/img/monument.jpg`, `public/img/open-road.jpg`, untracked `docs/seo/CHATGPT_HANDOVER.md`) and **never** stage, revert or delete them.
2. **Production is read-only** unless a step says otherwise and the owner allowed it. Backend `.env` points at production MongoDB — read-only scripts only, from a scratch directory, printing no phone/name/address.
3. Never invent route facts, stops, tolls, fares, timings, reviews or ratings. If data is missing, show nothing for it.
4. No new doorway pages, no auto-generated filler, no link buying, no Google Indexing API, no automated GSC actions.
5. Keep fares, policies, the six held routes (`HELD` in `src/lib/held-routes.ts`), sample-package noindex gates and booking flows unchanged.
6. Commit/push only if the invoking instruction asks. **Pushing backend `main` auto-deploys to EC2; pushing website `main` deploys on Amplify.** Push the backend first (website reads the new endpoint), only after its full suite passes. No `Co-Authored-By`/Claude lines in commit messages. Stage files by path.
7. If a step is impossible or contradicts the code, stop that step, record why, continue with the rest.

---

## 2. Read first (verify against current HEAD)

Website:
- `src/app/[slug]/page.tsx` — `allLandingSlugs()` (which slugs exist and which are `prebuild`), `generateStaticParams`, `revalidate = 86_400`, `dynamicParams = true`, metadata robots (`{ index: false, follow: true }` ~L295).
- `src/app/[slug]/RoutePage.tsx`, `CityPage.tsx`, `RouteVariantPage.tsx`, `VehiclePage.tsx`; `src/app/page.tsx`; `src/app/fares-explained/`.
- `src/lib/held-routes.ts` (`HELD`, `NOINDEX_THIN`, `isThinRoute`, `indexable`), `route-tiers.ts` (`BUSIEST`), `tier1.ts`, `sitemap-entries.ts` (`SITEMAP_GROUPS`, `sitemapEntries`), `src/app/sitemap.ts`, `src/app/sitemaps/sitemap.ts`, `src/app/robots.ts`.
- Ratings: `src/lib/review-rules.ts` (`MIN_REVIEWS = 5`, `worthShowing`, `routeRatingEligible`), `src/lib/reviews.ts`, `src/components/landing/RatingSummary.tsx`, `LiveRatingSummary.tsx`.
- `src/lib/api.ts` (backend fetch), `src/content/routes/*`, `src/content/guides/*`, `src/lib/route-faq.ts`, `city-faq.ts`.
- Scripts: `scripts/seo/crawl-audit.py`, `thin-routes.mjs`, `indexnow.mjs`, `monitor-domains.mjs`, `gsc-report.mjs`, `weekly.md`; tests `scripts/test/seo-recovery.mjs` (`npm run test:seo`), `rating-summary.mjs` (`npm run test:rating`); `npm run audit:speed`.
- `amplify.yml` (artifact size print; Amplify limit 220 MB; 13 Nov: 114.3 MiB).

Backend:
- `src/routes/public.route.ts` (`/public/reviews*`, `/public/routes`, `/public/fares/all`, `/public/route-knowledge`), the review controller behind `publicReviews*`, `src/services/reviewStats.service.ts`, `scripts/rebuild-review-stats.ts`, `src/models/rating.model.ts`, `reviewStats.model.ts`.
- `src/services/maps.provider.ts` (`resolveRoadRoute`), `src/models/duty.model.ts`, `booking.model.ts`, `src/services/cityDirectory.ts` (city keys ↔ coordinates).
- `src/middleware/publicCache.ts`, `rateLimit.ts`.

Production facts already measured (20 Nov, read-only): `ratings` 0 docs; `reviewstats` 105 rows at 62,734–63,300; completed customer bookings 4; live route pages show "Rated by 63,000+ travellers"; apex has no A record; route page HTML 600–700 KB, cache-miss TTFB 0.75–0.85 s.

---

## STEP 0 — Baseline and ledger

1. Create `docs/seo/LEDGER_INDEXING_20NOV.md` (rows of Section 12).
2. Save the 20 Nov GSC exports the owner downloaded (`~/Downloads/hellomycabs.com-*2026-11-20*.zip`) unzipped into `docs/seo/evidence/gsc-2026-11-20/` (CSV only).
3. Run and save to `docs/seo/evidence/`:
   - `python3 scripts/seo/crawl-audit.py` against production → `crawl-2026-11-20-baseline.{json,md}` (similarity, words, inbound links).
   - `node scripts/seo/monitor-domains.mjs` → `domains-2026-11-20.md`.
   - `npm run audit:speed` → `speed-2026-11-20-baseline.md`.
   - TTFB cache-miss for 5 Tier 1 routes (curl `-w %{time_starttransfer}`).
4. Website: `npx tsc --noEmit`, `npm run lint`, `npm run test:seo`, `npm run test:rating`, `npm run build` (record artifact size). Backend: `npm run typecheck`, `npm test` (batch if killed). Record pre-existing failures; do not fix unrelated ones.

---

## STEP 1 — Apex → www (O1)

1. `dig +short A hellomycabs.com @8.8.8.8`.
   - Empty → ledger "blocked on N1 (owner: Hostinger → DNS → `A @ 43.204.57.108`, TTL 300; remove other apex A/AAAA/parking; leave `www`, `api`)". Continue with Step 2.
   - `43.204.57.108` → continue.
2. On the API server (SSH as in `LEDGER_13NOV.md` Step 1): confirm the apex block exists in `/etc/caddy/Caddyfile` (`http://hellomycabs.com, https://hellomycabs.com { redir https://www.hellomycabs.com{uri} permanent }`), `caddy validate`, `sudo systemctl reload caddy`.
3. Verify (save output): `curl -sI http://hellomycabs.com/`, `https://hellomycabs.com/`, `https://hellomycabs.com/kota-to-sikar-cab?x=1` → one 301 to the www URL with path+query; `https://www.hellomycabs.com/` 200; `https://api.hellomycabs.com/health` 200 + commit; certificate valid (`curl -v` shows a Let's Encrypt cert for `hellomycabs.com`).
4. `node scripts/seo/monitor-domains.mjs` → `hosts-2026-11-20-apex-live.md`.
5. Owner note for GSC: after this, "Page with redirect" and "Crawled – not indexed `http://hellomycabs.com/`" are expected and correct.

---

## STEP 2 — No unsupported rating numbers (O2) — website

1. `src/lib/review-rules.ts`: `MIN_REVIEWS` 5 → **10**. `worthShowing()` must also reject: a route/city count greater than the site count; a site count greater than `MAX_PLAUSIBLE` passed from the backend's real-ratings figure when present (see Step 3 `realRatings`); non-integers/negatives.
2. `RatingSummary.tsx`, `LiveRatingSummary.tsx`, `page.tsx`, `CityPage.tsx`, `RoutePage.tsx`, `RouteVariantPage.tsx`, `VehiclePage.tsx`: when `worthShowing` returns null, render **no number and no stars**; render one neutral line instead: "Har poori trip ke baad customer rating de sakte hain." (English pages: "Customers can rate every completed trip."). Keep the rate-your-trip link flow (`/rate`, `/r/...`) untouched.
3. `grep -rn "Rated by\|travellers who booked\|63,0\|62,7" src` → zero hard-coded claims.
4. Schema: `AggregateRating` stays absent unless `worthShowing` passes (already so since 13 Nov; add a test).
5. `scripts/test/rating-summary.mjs`: cases — 0 ratings → hidden; 9 → hidden; 10 consistent → shown; route > site → hidden; count above `realRatings` → hidden; schema absent when hidden.

---

## STEP 3 — No unsupported rating numbers (O2) — backend

1. In the public reviews controller (`/public/reviews`, `/public/reviews/site`, `/public/reviews/all`): read the real count `Rating.countDocuments(scope filter)` (site: `estimatedDocumentCount()` is fine), and return `realRatings` alongside. If the stored `ReviewStats.count` for that scope is greater than the real count, return the summary as `null` (and log once per process, no PII).
2. `/public/reviews/all` (catalog): same per key; cache as today (`publicCache`).
3. Tests (`src/__tests__/reviews.test.ts` or new `publicReviewsGuard.test.ts`): stats 63,000 with 0 ratings → `null`; stats equal to real ratings → returned; partial (route > real) → `null`; response carries `realRatings`.
4. **Only if the invoking instruction explicitly allows the production rebuild:** export `reviewstats` to a private scratch JSON (not in git), run `npx tsx scripts/rebuild-review-stats.ts` against production, verify 105 → counts equal to real ratings (today 0), save a non-PII summary to the ledger. Otherwise record "not run — guard hides the counters".

---

## STEP 4 — Focus set (O3)

1. New `src/lib/indexing-tiers.ts` — the single source of truth:
   - `TIER1_PATHS` (exactly plan §B1): `/`, `/routes`, `/fares-explained`, `/about`, `/contact`; `/cab-service-in-{kota,jaipur,delhi,sikar,agra,chandigarh}`; routes `jaipur-to-delhi-cab`, `delhi-to-jaipur-cab`, `kota-to-jaipur-cab`, `jaipur-to-kota-cab`, `kota-to-delhi-cab`, `delhi-to-kota-cab`, `jaipur-to-delhi-airport-cab`, `delhi-airport-to-jaipur-cab`, `jaipur-to-agra-cab`, `delhi-to-agra-cab`, `delhi-to-chandigarh-cab`, `delhi-to-haridwar-cab`, `jaipur-to-sikar-cab`, `sikar-to-jaipur-cab`, `jaipur-to-delhi-round-trip-cab`; vehicles `dzire-taxi`, `innova-crysta-taxi`, `ertiga-taxi`, `tempo-traveller-12-seater-rental`; `/guides`, `/guides/jaipur-delhi-by-road`.
   - `TIER2` = every other currently indexable page that is not a plain city-pair route (variants, other vehicles, other guides, other city pages, static pages) **plus** the `BUSIEST` pairs from `route-tiers.ts` and their reverses not already in Tier 1.
   - `TIER3` = every remaining plain city-pair route page (expected ≈ 85; print the exact list and count into the ledger).
   - Export `tierOf(path)`.
   - Make `tier1.ts` read its routes/cities/vehicles from here (no second list).
2. Put every Tier 3 pair into `NOINDEX_THIN` in `held-routes.ts` (generated from `indexing-tiers.ts`, not hand-copied), with the existing comment updated: "20 Nov 2026 focus set — owner N3; moves back in batches by the gate in PLAN_INDEXING_20NOV.md".
3. Confirm the existing mechanism does the rest: page metadata `noindex, follow`, `sitemapEntries()` leaves them out (full and group sitemaps), links stay. Tier 1/2 keep `index, follow`.
4. Directory/hub pages (`/routes`, city pages) keep linking Tier 3 (users), order Tier 1 first.
5. Tests in `scripts/test/seo-recovery.mjs`:
   - tier lists are disjoint and together cover every public page exactly once;
   - every Tier 1/2 page is `index, follow` and in exactly one group sitemap and in `/sitemap.xml`;
   - every Tier 3 page is `noindex, follow` and in no sitemap;
   - the six `HELD` routes unchanged;
   - homepage "Searched most" links only Tier 1.
6. Ledger: counts per tier, sitemap URL count before/after (expected 145 → ~60).

---

## STEP 5 — Real route data (O4) — backend

1. New `GET /api/v1/public/route-insights?pickup=<CITY_KEY>&drop=<CITY_KEY>` and `GET /api/v1/public/city-insights?city=<CITY_KEY>` in `public.route.ts` (validated with zod against the city directory keys; rate-limited like other public routes; `publicCache` 24 h).
2. Service `src/services/routeInsights.ts`, computing over the last **90 days**, matching on `cityKey`/`dropCityKey` (duties) and the equivalent booking fields:
   - `demand`: count of agent bookings + WhatsApp requirements + paid customer bookings on that pair; `null` if < 20.
   - `vehicleMix`: share per catalog vehicle type (top 4), only if total ≥ 20.
   - `fareRange`: p25–p75 of `price` (rupees, rounded to ₹100) on agent bookings + customer bookings with a fare, only if ≥ 20 samples; never per-booking values.
   - `timeOfDay`: share morning/afternoon/evening/night (IST) of `pickupAt`, only if ≥ 20.
   - `weekday` vs `weekend` share, only if ≥ 20.
   - `asOf` (ISO date of computation), `windowDays: 90`, `sources: ['agent','whatsapp','customer']`.
   - City version: top 5 drop cities by demand from that city (names only), total demand, vehicle mix.
   - **Never** names, phones, addresses, group names, booking numbers or exact timestamps.
3. Precompute nightly (existing jobs runner, leader-locked) into a small collection `route_insights`, so the endpoint is a cheap read; index on `{pickup, drop}`.
4. Measured distance/time: for each Tier 1 pair, `resolveRoadRoute` between the city directory coordinates once per week; store `distanceKm`, `durationMin`, `provider`, `measuredAt`. Only if the provider says measured (not estimated). No tolls unless the provider returns them.
5. Tests: thresholds (19 → null fields), no PII keys in the payload (walk the JSON for forbidden keys/phone patterns), IST buckets, cache headers, unknown city → 400.

---

## STEP 6 — Real route data (O4) — website

1. `src/lib/api.ts`: `routeInsights(pickup, drop)`, `cityInsights(city)`; failures return `null` (page still renders; a missing block is fine).
2. `RoutePage.tsx` (Tier 1 and Tier 2 routes): new section "Is route par Hello My Cab ka data" — demand line ("pichhle 90 din mein {n} bookings/requirements"), vehicle mix bars, fare range, time-of-day, weekday/weekend, measured distance/time with provider + date, and a source line "Hello My Cab bookings aur driver requirements, {asOf} tak". Render each item only when present.
3. `CityPage.tsx`: top destinations from the city + mix, same rules.
4. Respect the existing `distanceMeasured` labelling (13 Nov): when a measured value exists show it as measured with date; otherwise keep "about / estimated".
5. Boilerplate move: policies repeated on every route page (cancellation, toll/parking, night charges, waiting, inclusions) → keep the full text only on `/fares-explained` (add anchors), and on route pages show a 2-line summary + link to the anchor. Same for pickup notes shared by all routes from one city → city page, linked from routes.
6. FAQ: keep only route-specific answers derived from data/fares; drop FAQ items whose answer is identical across all routes (they live on `/fares-explained`). Do not write new FAQ without owner-supplied questions.
7. Kota: on `/cab-service-in-kota` add "One way taxi from Kota" — the Kota routes with fares and the city insights. No new page.
8. Rebuild + `crawl-audit.py` locally; iterate until Tier 1 pairwise similarity < 0.35, every indexable pair < 0.6, Tier 1 main-content words ≥ 900. **Do not pad.** If a Tier 1 page cannot reach 900 real words, record it and leave it — the gate in Step 10 decides.
9. CI test (`scripts/test/seo-recovery.mjs` reading a committed crawl snapshot or the local build): Tier 1 similarity and word thresholds; failing build on regression.

---

## STEP 7 — Crawl efficiency (O5)

1. `allLandingSlugs()`: mark every Tier 1 slug `prebuild: true` (plus what is already prebuilt). Build; record artifact size (must stay < 220 MB; budget ≤ 160 MB).
2. Measure cache-miss TTFB on 5 Tier 1 routes after deploy (< 0.3 s target).
3. `inlineCss` trial (D9): on a branch, `experimental.inlineCss: false`, `npm run audit:speed` before/after on 5 pages. Adopt only if mobile LCP ≤ 1.2 s on all and HTML weight drops ≥ 150 KB; otherwise keep and record numbers.
4. `lastmod`: route pages with insights use the insights `asOf` date; others keep the existing rule. No build/render dates.

---

## STEP 8 — External signals (O6) — prepare, owner executes account steps

Write `docs/seo/OWNER_STEPS_20NOV.md` (short, exact clicks):
1. Hostinger DNS (N1) if still pending.
2. Google Business Profile: website `https://www.hellomycabs.com/`; services; service areas (Tier 1 cities) — from `GBP_CHECKLIST.md`.
3. Play Console (customer + driver listings): website field `https://www.hellomycabs.com/`.
4. Bing Webmaster Tools → Import from Google Search Console.
5. Citations (Justdial, Sulekha, IndiaMART, Google Maps) with the exact NAP from `src/lib/company.ts`.
6. Ghoomo Rajasthan site: in `/Users/lalitbansal/Documents/hellomycab/ghoomo-rajasthan-frontend`, add a small contextual "Delhi/Jaipur outstation cabs — Hello My Cab" link block to the relevant cab pages pointing to `/jaipur-to-delhi-cab` and `/cab-service-in-jaipur` (code change; follow that repo's AGENTS.md and release checks; commit separately).

---

## STEP 9 — Tell search engines (O6)

1. After deploy (backend first, then website), live checks: 10 Tier 1 URLs 200 + `index, follow` + canonical; 10 Tier 3 URLs `noindex, follow`; sitemaps contain only Tier 1/2; robots lists the 6 sitemaps; no "63,000" text on 10 pages.
2. `node scripts/seo/indexnow.mjs --submit` (Tier 1 + Tier 2 URLs only).
3. Write the owner's GSC checklist into `OWNER_STEPS_20NOV.md`:
   - Sitemaps: submit `/sitemap.xml` + 5 group sitemaps; note counts.
   - Request Indexing schedule (≤ 10/day), exactly plan §F1 Day 1 / Day 2 / Day 3 lists.
   - Issues: "Validate fix" on Page with redirect / 404 / robots after Step 1 is live.
4. Do not use the Indexing API or any automated GSC submission.

---

## STEP 10 — Measure and gates

1. `docs/seo/WEEKLY.md`: one line per week — indexed total, Tier 1 indexed / 30, Tier 2, "Discovered" count, clicks/impressions, top Tier 1 queries.
2. `scripts/seo/weekly.md`: add the tier counts using the group sitemaps and the GSC export.
3. Gate (plan §F3) written into `indexing-tiers.ts` comment and the ledger:
   - Tier 1 ≥ 80% indexed after 2 weeks → move Tier 2 fully live (already indexable) and release the first 20–25 Tier 3 routes (highest impressions first) from `NOINDEX_THIN`.
   - 50–80% → improve the non-indexed Tier 1 pages (Steps 5–6) before releasing more.
   - < 50% or "Discovered" rising → stop releases; re-audit quality.
4. A script `node scripts/seo/release-tier3.mjs --count 25 --gsc <export>` that prints which Tier 3 routes to release next (by impressions, then demand), for a human-reviewed commit.

---

## STEP 11 — Verification and release

Website: `npx tsc --noEmit`, `npm run lint`, `npm run test:seo`, `npm run test:rating`, `npm run build` (artifact size), `npm run audit:speed`, `python3 scripts/seo/crawl-audit.py` (local + production after deploy).
Backend: `npm run typecheck`, changed-file ESLint, `npm test` (batches if killed).
Live (after deploy): Step 9.1 checks, TTFB, `monitor-domains.mjs`, backend `/health` commit.
Update `README`/`docs/seo` with tiers and the insights endpoint. Record artifacts and commits in the ledger.

---

## 12. Ledger rows (every row: done / blocked / skipped + reason + evidence)

| Row | Item | Evidence |
|---|---|---|
| L0 | Baseline exports, crawl, speed, TTFB, tests | evidence paths |
| L1 | Apex DNS check / Caddy reload / 301 checks | curl output, monitor file |
| L2a | Website rating guard + copy | diff, test:rating |
| L2b | No hard-coded claims | grep output |
| L3a | Backend reviews guard + `realRatings` | tests |
| L3b | `reviewstats` rebuild (only if allowed) | summary or "not run" |
| L4 | Tiers file, NOINDEX_THIN generated, sitemaps, tests | counts, test:seo |
| L5a | Insights service, nightly job, endpoints, thresholds, no PII | tests |
| L5b | Measured distance/time | stored values + provider/date |
| L6a | Route/city insights sections | screenshots 390/1440 |
| L6b | Boilerplate moved, FAQ trimmed | diff |
| L6c | Similarity / words targets | crawl-audit report |
| L6d | CI gate | test output |
| L7a | Tier 1 prebuilt, artifact size | build log |
| L7b | inlineCss trial | speed numbers, decision |
| L8 | OWNER_STEPS_20NOV.md; Ghoomo links | file, commit |
| L9a | Live checks after deploy | curl summary |
| L9b | IndexNow submitted | output |
| L10 | WEEKLY line, weekly script, release-tier3 script | files |
| L11 | Full verification + commits + deploy status | hashes, /health |

## 13. Final report (Hinglish, to the owner)

What changed per outcome, test counts, what is blocked on N1, the exact owner steps file, what was not done and why. Never write "indexed", "deployed" or "verified" for anything you did not see.
