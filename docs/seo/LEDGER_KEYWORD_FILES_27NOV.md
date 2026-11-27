# Ledger — keyword files work (27 Nov 2026)

Implements `docs/seo/PROMPT_KEYWORD_FILES_27NOV.md` (plan `PLAN_KEYWORD_FILES_27NOV.md`). Start: backend `002c5e4`, website `c1dc126`.

Owner decisions — **defaults used**: E1 no station fares → station page built, not published · E2 local package prices unchanged · E3 Ludhiana–Chandigarh not added · E4 per-km after the distance check · E5 short Haridwar routes not added · E6 Salasar nothing · E7 Hindi hidden (`HINDI_REVIEWED = false`) · E8 owner action.

| Row | Item | Status | Evidence |
|---|---|---|---|
| K0 | baseline | done | Website `c1dc126`: tsc 0, lint 0, test:seo 25, test:rating 13, test:rank 28, build 0 (fetch cache cleared). Live `page-quality-2026-11-27-kw-baseline.json`: HTML median 240,338 B, overlap max 0.627, 82 pairs > 0.25. Sitemap 45. Coverage baseline (L7) |
| K1 | files copied + shasum | done | `docs/seo/evidence/keyword-files-2026-11-27/`: keyword_master ce120863…, new_keywords 607beb20…, page_roadmap c62d2b4f…, priority_keywords a7fedc8d… (SHA-256). **Not** copied: `Triplesinfotech - Sheet1.csv` (a vendor contact list) |
| K2 | keyword map script | done | `scripts/seo/keyword-files-map.mjs` → `keyword-map.csv` (3,349 rows): wave 1 page 844 · held page 876 · held sample 23 · twin 198 (→ /jaipur-airport-taxi or the same road's page) · planned Wave 2 186 · planned later 342 · no page (doorway) 448 · no page (no demand) 432. All 147 file targets are in the decisions CSV |
| K3 | keywords.csv merge + source | done | `keywords-seed.mjs` adds owner rows (group `owner:<Cluster>`, wave from the map, P1/P2/P3 → high/medium/seed) with a `source` column: gsc 67 · map 559 · owner-file 3,101 (248 owner keywords already existed). `gsc-weekly --write` keeps `source` and `wave`. All 3,727 lines have 9 fields |
| K4 | gsc-weekly source breakdown | done | Weekly 'Source' table — 27 Nov 3-month export: gsc 67/67 seen (2,605 impr) · map 19 of 559 · **owner-file 19 of 3,101 (33 impressions)** |
| K5 | keyword tests | done | `rank.mjs`: owner file mapped once per keyword, no-page rows say why, doorway towns never mapped, > 3,000 owner rows, vendor list not tracked (`git ls-files`); old keyword tests scoped to our own rows; wave 'none' allowed only with an empty target |
| K6 | NO_PAGE_CITIES | done | `indexing-tiers.ts NO_PAGE_CITIES` (14 towns) enforced in `city-pages.ts citiesWithPages`; test: ALWAR with 4 routes still gets no page |
| K7 | coverage script + baseline | done | `scripts/seo/keyword-coverage.mjs`; baseline (map-based) **789 / 1,006** owner keywords fully on their Wave 1 page (`keyword-coverage-2026-11-27-baseline.json`); e.g. `/cab-service-in-delhi` 31/44, `/cab-service-in-jaipur` 25/41, `/jaipur-to-delhi-cab` 18/31, car pages 6/12 |
| K8 | city outstation H2 | done | H2 'Outstation taxi from {City}: one way routes and fares' + a line with this city's count and cheapest fare (cheapest route named, not the nearest) |
| K9 | city hourly section | done | H2 'Hourly and full-day taxi in {City}' on the existing package block (not printed twice). `/fare/local` is one list for every city and is read from the admin panel's config (`config.pricing.localPackages`; `fareTable.ts` only defaults) |
| K10 | private line | done | 'It is a private cab — the car is booked for you, and nobody else is picked up.' |
| K11 | city title/description | done | Title tail order: ' \| Outstation & Local Cab' first (≤ 60), then the old tails; description 'outstation one way to …' |
| K12 | door to door | done | Route hero: 'Door to door: picked up at your address in {A}, dropped at yours in {B}.' |
| K13 | bags | done — no data | The backend vehicle catalogue has no luggage field; nothing added |
| K14 | family | done | WhichVehicle: 'For a family of up to {seats}: {car} at ₹{fare}.' (cheapest 6-seater, this route's fare); FAQ 'for a family or a group?' |
| K15 | Khatu darshan | done | Route pages to/from Khatu: 'Same-day darshan and back: the round trip … starts at ₹{cheapest round trip} in a {car}'; Khatu city page: section 'Same-day darshan from Jaipur' with Jaipur→Khatu round-trip fare (`/fare/roundtrip`) |
| K16 | car pages | done | H2 '{Car} on rent in Jaipur with driver'; the list is now the Wave 1 routes out of Jaipur, busiest first (was the catalogue's first eight); hero range wording 'On our busiest routes from Jaipur …' |
| K17 | airport twins wording | done | 'Jaipur Airport to {City} cab', H2 'Airport transfer to the city…', 'you know the fare when you book' (**not** 'small advance online' — transfers are booked by enquiry; caught and corrected) |
| K18 | home intercity | done | '{N} intercity cab routes carry a listed fare …' |
| K19 | coverage after + overlap + gate | done | `keyword-coverage.mjs` now reads the page body without header/footer/nav (route heroes sit outside `<main>`); same method before/after: **815 → 856 / 1,006** (live after deploy: 856). Gains: Delhi city 39/44, Jaipur city +5, other cities +4 each, Khatu +2. No page worse. Overlap `<main>` max 0.631 (guard 0.65), median within guard; local crawl 45 pages, 0 errors, links-in ≥ 45; **quality gate passed without rewriting the baseline**. Also added 'A private cab' to the route hero line |
| K20 | Hindi hidden | done | `src/content/hi/lines.ts` (`hiRouteLine`, `hiCityLine`, numbers from the API, null without a Hindi name); `HINDI_REVIEWED = false` in `indexing-tiers.ts`; rendered with `lang="hi"` only when true; test |
| K21 | distance check | done | Ola router via `resolveRoadRoute` (Google Maps key returned **403 permission denied** → fell back to Ola; owner told): Jodhpur↔Jaisalmer 287 km vs 291 (1%) ✅ · Jodhpur↔Udaipur 260 vs 256 (2%) ✅ · Jaipur↔Pushkar 141–144 vs 171 (+19–21%) ⛔ · Chandigarh↔Dehradun 192 vs 168 (−12%) ⛔ · Ludhiana↔Chandigarh 100 vs 118 (+17%) ⛔. Backend has a measured-distance table (`ROAD_KM`) but it is switched by env (`USE_ROAD_KM_TABLE`, owner sign-off) and changes every per-km price — left to the owner (E4) |
| K22 | DEMAND_ROUTES | done | + JODHPUR↔JAISALMER, JODHPUR↔UDAIPUR (comments with duties, measured km); `publicApi.test.ts` 14 demand routes, the 4 present with prices, the 3 held pairs absent (40/40). Full Jest: 191/196, failures load-only (4 suites 90/90 serially) + known broadcastBurst |
| K23 | Ludhiana–Chandigarh | held | Commented in `demandRoutes.ts` with the reason (E3 fare, +17% distance) |
| K24 | backend release | done | `1e3e63c` live (`/health`); `/public/routes` 124: JODHPUR↔JAISALMER ₹4,370, JODHPUR↔UDAIPUR ₹3,840 (`fixed: false`); Pushkar, Chandigarh–Dehradun, Ludhiana–Chandigarh absent |
| K25 | website WAVE2 additions | done | 4 pairs in `WAVE2_ROUTES` (noindex, out of sitemaps); seo-recovery tier-3 count 65 → 69. Jodhpur now has 3 routes out → its city page exists automatically, `noindex` (not a Tier 1 city) — Wave 3 per the plan |
| K26 | new route facts | done — no extra copy | The per-km pages print the catalogue km (within 2% of measured) and the per-km toll wording; no towns/expressway written (no polyline evidence stored for these) |
| K27 | new route tests | done | Live: the 4 pages 200, `noindex, follow`, not in sitemaps, title price = API; Jodhpur city page exists, noindex |
| K28 | station transfer | not set (E1) | No `TRANSFERS['jaipur-railway-station']` → page 404 |
| K29 | station page | done | `src/app/jaipur-railway-station-taxi/page.tsx` on the airport pattern: `notFound()` without the transfer, `noindex, follow` until Wave 2 (`WAVE2_PATHS`, `isReleasedPath`), zone table, outstation = Jaipur routes, FAQ from the transfer's rules, schema; no platform/exit/prepaid claims |
| K30 | station form mode | done | `TransferForm`: a `*-railway-station` key asks 'Train number' (no flight box) |
| K31 | station tests | done | Train box test; 404 guard + no platform claim in rendered JSX; sitemap absence |
| K32 | sightseeing page | done | `src/app/jaipur-local-sightseeing-taxi/page.tsx`: `localPackages()` table (8 h / 80 km, 10 h, 12 h, extra hour), places by name only, 'driver is not a licensed guide', no timings; `BookingWidget` preset local from Jaipur; noindex (Wave 2); linked from the Jaipur city hourly section |
| K33 | sightseeing tests | done | noindex, honest wording, no clock times, absent from sitemaps |
| K34 | GBP | done | `GBP_POSTS_DEC2026.md` 'Naye pages': Jodhpur→Jaisalmer ₹4,370, Jodhpur→Udaipur ₹3,840, Jaipur sightseeing ₹2,500 (live API 27 Nov); Pushkar/station/Ludhiana marked 'abhi nahi'; products; service area Jodhpur |
| K35 | owner file | done | `OWNER_STEPS_KEYWORD_FILES_27NOV.md` §1–§8 (E1–E8 with today's state and what an answer changes, the distance table, Google Maps 403 note, Keyword Planner steps, GBP, later candidates, Char Dham, reminders) |
| K36 | website pre-flight | done | tsc 0, lint 0, test:seo 25, test:rating 13, test:rank 32, build 0 (server 67 MB, fetch cache cleared), crawl + `qa:quality` passed |
| K37 | commits + deploy | done | Backend `1e3e63c`; website `2e938cb` (24 code paths) pushed 17:43 IST, Amplify live; docs in the next commit |
| K38 | live checks | done | Wave 1 45/45 (200, index, canonical, title ≤ 60, description 90–165, one H1, og:image; every city 'Outstation taxi from', every route 'A private cab, door to door'); sitemap = Wave 1 (45); sightseeing 200 noindex unlisted; station 404; Jodhpur routes + Jodhpur city noindex unlisted; Alwar and Pushkar pages 404; 16/16 route title prices = `/fare/oneway`; Kota local price = `/fare/local`; monitor-domains unchanged (hellomycab.com still separate) |
| K39 | IndexNow | done | 45 Wave 1 URLs, 200 accepted (changed pages recrawl) |
| K40 | docs + report | done | Ledger, owner file, plan, prompts, decisions CSV, keyword files evidence, coverage/quality/crawl evidence committed by path |
