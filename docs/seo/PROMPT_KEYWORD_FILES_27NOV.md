# IMPLEMENTATION PROMPT — the owner's keyword files: optimise Wave 1, build the justified new pages (27 Nov 2026)

You are implementing `docs/seo/PLAN_KEYWORD_FILES_27NOV.md` (the plan; read it fully first) with its decision table `docs/seo/KEYWORD_FILES_PAGE_DECISIONS_27NOV.csv`. It runs **inside** the index plan that is live (`PLAN_INDEX_RANK_27NOV.md`, `PROMPT_INDEX_RANK_27NOV.md`, `LEDGER_INDEX_RANK_27NOV.md`): Wave 1 (45 URLs) is the only indexable set, everything else is `noindex, follow` until `scripts/seo/release-wave.mjs` opens a wave past the gate. **Nothing in this prompt changes the gate or opens a wave.**

Work **step by step, in the order below**. Do not skip a step. If a step cannot be done, mark it **blocked** in the ledger with the exact reason and continue. Every step ends with **Done when**; a step is done only when every check passes and its evidence (command output, file, number, URL) is in the ledger.

Language: owner-facing text (report, OWNER file, GBP copy) in simple Hinglish. Code, comments, commit messages and tests in English.

---

## 0. Outcomes

| # | Outcome | Plan |
|---|---|---|
| K1 | The owner's 4 keyword files are in the repo as evidence and every keyword is mapped to one real URL of ours (or marked "no page") in `docs/seo/keywords.csv`, tracked weekly | §F step 2 |
| K2 | The 30 Wave 1 pages carry the missing words of their keyword groups — truthfully: "outstation", local / hourly / full day, private, door to door, family, seats, "on rent in Jaipur", "Jaipur Airport to {city} cab" | §A |
| K3 | Hindi lines for Wave 1 routes/cities/Khatu built, **hidden** until a Hindi reader approves (`HINDI_REVIEWED`) | §A, E7 |
| K4 | New catalogue routes (Jaipur ↔ Pushkar, Jodhpur ↔ Jaisalmer, Chandigarh ↔ Dehradun, Jodhpur ↔ Udaipur) live as **noindex Wave 2** pages — only with a measured road distance; Ludhiana ↔ Chandigarh code-ready, held until the owner's fare (E3) | §C1, E3, E4 |
| K5 | `/jaipur-railway-station-taxi` built; published (noindex, Wave 2) only when the owner's station fares exist (E1) | §C1, E1 |
| K6 | `/jaipur-local-sightseeing-taxi` built from the real local packages; noindex, Wave 2; package price stays the owner's (E2) | §C1, E2 |
| K7 | Pages the plan rejects are not created (14 doorway city pages, 24 no-demand routes); a test stops anyone adding them by accident | §C3, §G |
| K8 | GBP: 4 more posts + products for the new pages (text only — owner posts) | §D |
| K9 | Owner file with the 8 decisions (E1–E8), dated | §E |
| K10 | Released (backend first), live checks, IndexNow (Wave 1 only), ledger, owner report | §F |

### Owner decisions — defaults (the owner has not answered; record "default used")

| # | Decision | Default (use this) | Where |
|---|---|---|---|
| E1 | Jaipur railway station → city zone fares; how a station pickup works | **None set** → the station page is built but **not published** (404) while `RAILWAY_STATION_TRANSFER` is missing; no invented fare, no "platform exit pickup" claim | backend `src/constants/airportTransfers.ts` (`TRANSFERS`), website page guard |
| E2 | Jaipur local / sightseeing package price | **Keep today's `/fare/local` prices** (8 h / 80 km: hatchback ₹2,500, Dzire ₹2,750, …). The page shows exactly those. No guide claimed ("driver, not a licensed guide") | backend `/fare/local` (unchanged) |
| E3 | Ludhiana ↔ Chandigarh fare | **Not set** → route code-ready, **not added** to the catalogue (per-km ₹2,300 is 40–100% above competitors) | backend `DEMAND_ROUTES` comment |
| E4 | Pushkar / Jodhpur–Jaisalmer / Chandigarh–Dehradun / Jodhpur–Udaipur: per-km or fixed | **Per-km** (what the booking form already charges), and only after the measured road distance check in Step 4 passes | backend `DEMAND_ROUTES` |
| E5 | Haridwar ↔ Rishikesh / Dehradun short-route fare | **Not set** → not added | — |
| E6 | Salasar Balaji as a city + fare | **Not set** → nothing built (no city key exists) | — |
| E7 | A Hindi reader | **None** → Hindi lines built, `HINDI_REVIEWED = false` (not rendered) | website `src/content/hi/` |
| E8 | Recover hellomycab.com | Owner action; nothing in code (301 kit is ready in `scripts/seo/old-domain/`) | OWNER file |

---

## 1. Repos, rules, safety

Repos under `/Users/lalitbansal/Documents/hellomycab/`:
- **Backend** `hello-my-cab-backend` (Express/TS/Mongo, Jest). Push to `main` = auto-deploy (EC2); `/health` shows the commit. **Backend first**, tests green; wait for `/health` before pushing the website.
- **Website** `hello-my-cabs-website` (Next.js 16.3.4 — read `node_modules/next/dist/docs/` before any Next API not used in this repo). Scripts: `npx tsc --noEmit`, `npm run lint`, `npm run test:seo`, `npm run test:rating`, `npm run test:rank`, `npm run build`, `npm run qa:quality`. **Before a build, delete `.next/cache/fetch-cache`** (a day-old cached `/public/routes` made the 27 Nov build miss new routes).
- **App** — do not touch. **Ghoomo** — do not touch.

Rules (all from the earlier prompts, still binding):
1. **No env changes for the owner** — settings in code.
2. **Production DB read-only**; scripts print aggregates only (no names, phones, addresses).
3. **No fake anything**: fares, distances, timings, tour stops, "guide", "platform pickup", reviews, photos. A fact on a page comes from code data, measured data, ≥ 2 agreeing approved drivers, or the owner — else it is left out. **No train timings, temple timings or monument opening hours** (they change).
4. **No thin / doorway pages**: never a city page whose only difference is the name; one keyword group → one URL.
5. **Price honesty**: every price in a title, heading, description or schema = what `/fare/oneway`, `/fare/local` or `/public/transfers/:key` returns. Tested.
6. **Never change existing URLs**; no new redirects.
7. **Gate**: no wave is released; every new page in this prompt is `noindex, follow` and out of the sitemaps (it is on `WAVE2_ROUTES` or a held list). Wave 1 stays exactly 45 URLs — test.
8. **Distances**: a new route page needs a **measured road distance** (backend `services/routeInsights.ts measure()` / `resolveRoadRoute`, the Ola router used on 21 Nov). The per-km catalogue km is straight line × 1.3 (`demandRoutes.ts` warns about it); if measured and estimated km differ by more than 10%, the route is **blocked** (its per-km fare is computed on the wrong km) and listed for the owner.
9. **Commits** by path; never stage backend-root `PLAN_*` / `PROMPT_*` / `LEDGER_five_changes.md`, website `docs/seo/CHATGPT_HANDOVER.md`, the deleted `public/img/monument.jpg` / `open-road.jpg`, or `~/Downloads/Triplesinfotech - Sheet1.csv` (a vendor contact list — never copy it into any repo). **No `Co-Authored-By` / Claude attribution line.**
10. **No DNS, GSC, GBP, Bing or directory actions** — owner steps; you prepare text.
11. **No Google Indexing API**; IndexNow only for Wave 1 URLs.
12. The overlap guard (`rank.mjs` 'sameness guard': max ≤ 0.65, median ≤ 0.33) and the quality gate must keep passing; every sentence added in Step 3 carries the page's own numbers or names, never a line identical on every page.

---

## 2. Read first (note mismatches in the ledger)

Website: `docs/seo/PLAN_KEYWORD_FILES_27NOV.md`, `KEYWORD_FILES_PAGE_DECISIONS_27NOV.csv`, `PLAN_INDEX_RANK_27NOV.md`, `LEDGER_INDEX_RANK_27NOV.md`, `OWNER_STEPS_INDEX_RANK_27NOV.md`, `GBP_POSTS_DEC2026.md`, `keywords.csv`; `src/lib/indexing-tiers.ts` (`TIER1_*`, `WAVE2_ROUTES`, `WAVE3_ROUTES`, `NO_DEMAND_ROUTES`, `isIndexableRoute`, `isIndexableCity`, `isIndexableVehicle`, `isIndexableGuide`), `src/lib/held-routes.ts`, `src/lib/sitemap-entries.ts`, `src/lib/city-pages.ts` (`OWN_PAGE`), `src/lib/route-faq.ts`, `src/lib/seo.ts`, `src/lib/api.ts` (`transfer`, `localPackages`/`/fare/local`), `src/app/[slug]/{page,RoutePage,CityPage,VehiclePage}.tsx`, `src/app/jaipur-airport-taxi/page.tsx` (the pattern for the station page), `src/components/landing/TransferForm.tsx`, `src/content/{cities,routes,hi}/`, `scripts/seo/{keywords-seed.mjs,gsc-weekly.mjs,page-quality.mjs,release-wave.mjs,lib/tiers.mjs}`, `scripts/test/{rank,seo-recovery}.mjs`.
Backend: `src/constants/demandRoutes.ts`, `src/constants/airportTransfers.ts` (`TRANSFERS`), `src/controllers/transfers.controller.ts`, `src/controllers/booking.controller.ts` (`publicRoutes`, per-km path, `/fare/local`), `src/constants/cities.ts` (`PUSHKAR`, `JODHPUR`, `JAISALMER`, `DEHRADUN`, `LUDHIANA`, `UDAIPUR`, `RISHIKESH` exist; **no `SALASAR`**), `src/services/routeInsights.ts`, `src/constants/tolls.ts`.
Keyword files: `~/Downloads/hellomycabs_{keyword_master,priority_keywords,new_keywords,page_roadmap}_v2_rebuilt.csv`.

---

## STEP 0 — Baseline and ledger

1. Create `docs/seo/LEDGER_KEYWORD_FILES_27NOV.md` with rows **K0–K40** (§12), status `todo`, header with E1–E8 "default used".
2. HEADs of website and backend; `git status --short` counts.
3. Website `tsc`, `lint`, `test:seo`, `test:rating`, `test:rank`, build (after clearing the fetch cache) — record. Backend `npm run typecheck`, full Jest (known: `broadcastBurst` ECONNRESET on this Mac — record, do not chase).
4. Live baseline: `node scripts/seo/page-quality.mjs https://www.hellomycabs.com --label 2026-11-27-kw-baseline`; sitemap count (45).
5. Re-run the keyword coverage measure (the plan's §A table) as a script — `scripts/seo/keyword-coverage.mjs <base-url>`: for every Wave 1 URL, the file keywords targeting it, how many have all their significant words on the page (title + description + `<main>` text), and the missing words with counts → `docs/seo/evidence/keyword-coverage-2026-11-27-baseline.json`. Expected from the plan: `/cab-service-in-delhi` 31/44, `/cab-service-in-jaipur` 25/41, `/jaipur-to-delhi-cab` 18/31, car pages 6/12.

**Done when:** ledger exists with every baseline number and file.

---

## STEP 1 — The keyword files into the repo (K1)

1. Copy the **four** `hellomycabs_*_v2_rebuilt.csv` files to `docs/seo/evidence/keyword-files-2026-11-27/` (unchanged bytes; `shasum` of each in the ledger). **Not** the Triplesinfotech file.
2. `scripts/seo/keyword-files-map.mjs`: reads `keyword_master` and writes, per keyword, `our_url` by these rules (in order):
   - roadmap URL is a Wave 1 path → that path;
   - roadmap URL is a held page (exists, noindex) → that path (it opens with its wave);
   - Jaipur Airport / Delhi Airport **twin** routes (TWIN_ROUTES) → `/jaipur-airport-taxi` (Jaipur Airport side) or the Jaipur/Delhi route page of the same road;
   - a C3 "don't build" city (Tonk, Dausa, Hanumangarh, Pali, Mount Abu, Sri Ganganagar, Chittorgarh, Kishangarh, Sawai Madhopur, Nagaur, Bharatpur, Beawar, Alwar, Jhunjhunu) → `''` with `reason = no page (doorway)`;
   - a C3 no-demand route → `''`, `reason = no page (no demand)`;
   - a C1/C2 new page → its planned path with `reason = planned (Wave 2|3)`.
3. `scripts/seo/keywords-seed.mjs`: add these rows to `docs/seo/keywords.csv` with a new column `source` (`gsc | map | owner-file`) — existing rows keep priority; owner-file rows get `group` from their `Cluster`, `wave` from the target (1 / 2 / 3 / held / none). No duplicate keyword.
4. `gsc-weekly.mjs`: the weekly table gains a `source` breakdown (how many owner-file keywords got impressions this week).
5. Tests (`rank.mjs`): every owner-file keyword appears once; every non-empty `our_url` is a real page (catalogue route, city with a page, own page, guide, car) or a planned path listed in this prompt; the Triplesinfotech file is not in the repo (`git ls-files | grep -i triples` empty).

**Done when:** keywords.csv has the owner keywords with `source`; tests green; counts by `reason` in the ledger.

---

## STEP 2 — Guard: the pages we will not build (K7)

1. `src/lib/indexing-tiers.ts`: `NO_PAGE_CITIES` (the 14 C3 cities, keys) and a comment pointing to the plan §C3 and Google's doorway policy.
2. Test: no city in `NO_PAGE_CITIES` has a city page (`citiesWithPages` never returns it), no sitemap entry contains `/cab-service-in-{those}`, and `NO_DEMAND_ROUTES` + the 24 C3 routes are never in a sitemap.

**Done when:** test green.

---

## STEP 3 — Wave 1 optimisation (K2) — the 30 pages, words they miss, truthfully

Do each item; re-run `keyword-coverage.mjs` locally after the step; the overlap guard and quality gate must pass.

### 3.1 City pages (Jaipur, Delhi, Kota, Agra, Chandigarh, Sikar, Khatu Shyam ji)
- H2 **"Outstation taxi from {City}"** above the existing outstation fare list, with one sentence carrying this city's numbers ("{N} routes out of {City} with a published fare, from ₹{cheapest} to {cheapest destination}").
- Section **"Hourly and full-day taxi in {City}"** from `api.localPackages()` (`/fare/local` — **one package list for every city**, checked 27 Nov: the endpoint takes no city), 8 h / 80 km, 10 h, 12 h (the API's `examples`), per car; "extra hour ₹{extraPerHour}" from the API. City pages already print these packages (21 Nov R30) — reuse that block, give it this heading, do not print the table twice. Rendered only when the API returns packages.
- One line **"Private cab — the car is booked for you; nobody else is picked up"** (true; it answers "private", "sharing").
- Title tail: use `' | Outstation & Local Cab'` when the title stays ≤ 60 chars, else the current tail (fitTitle order). Description adds "outstation" if it fits 155.
- Tests: every Wave 1 city page (built HTML) has an H2 containing "Outstation taxi from" and an H2 "Hourly and full-day taxi in"; the 8 h / 80 km price in it = `localPackages()`; the package table appears once per page.

### 3.2 Route pages (16 Wave 1 routes)
- In the first section: **"Door to door — pickup at your address in {A}, drop at your address in {B}."**
- Fare table rows show **seats** (already). **Bags: no data** — the backend vehicle catalogue has no luggage field (checked 27 Nov); add nothing and record it.
- In the "Which vehicle" section: **"For a family of up to {seats of the cheapest 6-seater}: {car} ₹{fare}"** (numbers from the API).
- FAQ: the group question's wording includes "family" (`route-faq.ts`, the existing "Which vehicle should I book … for a group?" → "… for a family or a group?").
- Tests: the line exists on every Wave 1 route; the family fare = the API fare.

### 3.3 Khatu pages (Jaipur ↔ Khatu, Khatu city)
- **"Same-day darshan and back — the round trip on this page is ₹{roundtrip from /fare/roundtrip}"** (no new package invented). Uses "darshan", "same day", "family".
- Test: price = API round trip.

### 3.4 Car pages (Dzire, Ertiga, Innova Crysta, Tempo Traveller 12)
- H2 **"{Car} on rent in Jaipur with driver"** + a table of that car's one-way fare on the 5 busiest Wave 1 routes from Jaipur (API), each linking its route page.
- Test: H2 present; fares = API.

### 3.5 Jaipur Airport page
- The "From Jaipur Airport to other cities" list: each item's visible text **"Jaipur Airport to {City} cab — ₹{fare}"** (same fare, links the Jaipur route page) — answers the twin keywords without indexing twin pages.
- Heading "Airport transfer to the city: fixed fare by area" (adds "transfer").
- "Fixed before you land — a small advance online" (answers "prepaid" truthfully; no "prepaid counter" claim).

### 3.6 Home
- One sentence with **"intercity cab"** in the existing services copy (true).

### 3.7 Measure
- `keyword-coverage.mjs http://localhost:3100 --label 2026-11-27-kw-after` → compare with Step 0 per page.
- `page-quality.mjs` local → overlap max/median; must stay within the guard.
- Local crawl + `qa:quality` → must pass (baseline rewritten only with the reason written in the ledger).

**Done when:** all tests green; coverage after ≥ before on every page; overlap guard and quality gate pass; table of before/after coverage in the ledger.

---

## STEP 4 — Hindi lines, hidden (K3)

1. `src/content/hi/lines.ts`: one hand-written Hindi sentence per Wave 1 route ("जयपुर से दिल्ली टैक्सी का किराया ₹{fare} से, {km} किमी") built from API numbers (template words fixed; place names from `HI_CITY`), and per Wave 1 city ("{शहर} में टैक्सी सेवा — आउटस्टेशन और लोकल, 24×7 {phone}"), Khatu ("खाटू श्याम जी टैक्सी").
2. `HINDI_REVIEWED = false` in `src/lib/indexing-tiers.ts` next to `HINDI_LIVE`; the line renders (with `lang="hi"`) only when true.
3. Test: nothing Hindi renders while false; when true (test flip) every Wave 1 route has its line with the API fare.

**Done when:** built, hidden, tested.

---

## STEP 5 — New catalogue routes (K4) — backend first

### 5.1 Distance check (rule 8)
For JAIPUR↔PUSHKAR, JODHPUR↔JAISALMER, CHANDIGARH↔DEHRADUN, JODHPUR↔UDAIPUR, LUDHIANA↔CHANDIGARH: get the **measured** road km and minutes (backend `routeInsights` measure / Ola router — a scratchpad script using the backend's service, read-only, no DB writes) and the catalogue's estimated km (`/public/fare/oneway`). Record both. A pair whose estimate is off by > 10% is **blocked** (listed for the owner: "per-km fare is on the wrong km").

### 5.2 Add to `DEMAND_ROUTES` (backend `src/constants/demandRoutes.ts`)
- Add the pairs that passed 5.1, both directions, each with a comment: duties/90 days (Jaipur→Pushkar 26, Pushkar→Jaipur 38, Jodhpur→Jaisalmer 66, Chandigarh→Dehradun 30, Jodhpur→Udaipur 29), autocomplete evidence, "per-km, owner E4 default, 27 Nov 2026".
- **Ludhiana ↔ Chandigarh**: a commented-out line with the reason (E3) — not added.
- If the backend can store the measured km for a per-km route (route insights already do for fixed routes), make `/public/routes` print the measured km for these pairs; if it cannot without a fare change, leave the fare as is and record.
- Tests (backend): `/public/routes` lists each added pair `fixed: false` with a price; `/fare/oneway` price = the listed `fromRupees`; Ludhiana–Chandigarh absent.
- Push backend; `/health`; live `/public/routes` shows them.

### 5.3 Website
- Add the new pairs to `WAVE2_ROUTES` (comment: plan §C1, 27 Nov) so they are `noindex, follow` and out of sitemaps; Wave 1 unchanged (test: sitemap still exactly 45).
- Route page content for them (`src/content/routes/index.ts`): only facts we have — measured km + time (5.1), towns from the measured polyline (name an expressway/highway only if the polyline proves it), toll from `tolls.ts` **only if** the pair is in the toll table (else "toll on the road, paid as it comes" — the existing per-km wording). No invented sights (Pushkar: no temple/lake timings; the word "Pushkar" and "Brahma temple" may appear only as the destination's name, not as a guide).
- Tests: each new page builds, `noindex, follow`, not in sitemaps, title price = API, H1 "Taxi Service", one H1, description length.

**Done when:** backend live with the passed pairs; website pages build as held Wave 2; blocked pairs listed with numbers.

---

## STEP 6 — `/jaipur-railway-station-taxi` (K5)

1. Backend: `TRANSFERS` gains `'jaipur-railway-station'` **only when E1 fares exist**. Default (E1 not set): no entry; `/public/transfers/jaipur-railway-station` → 404 (existing own-key lookup).
2. Website `src/app/jaipur-railway-station-taxi/page.tsx` on the airport page's pattern: H1 "Jaipur Railway Station Taxi — fixed fares to the city and outstation", zone table from the transfer (stations: Jaipur Junction, Durgapura, Gandhinagar Jaipur — names only), outstation-from-the-station list (Jaipur fares, links the Jaipur route pages), `TransferForm` (station preset, train number box instead of flight), FAQ 6 from the transfer's own rules, TaxiService + FAQPage + Breadcrumb schema.
3. **Refuses to publish without the transfer**: `notFound()` when `api.transfer('jaipur-railway-station')` is null (not a 200 with no prices). Robots: `noindex, follow` (Wave 2 — add its path to a held list `WAVE2_PATHS` in `indexing-tiers.ts`; not in sitemaps).
4. Links to it only when it is published (Jaipur city page "Railway station pickup" line, Jaipur Airport page, footer) — guarded by the same transfer check.
5. Tests: with no transfer → 404; with a fixture transfer → 200, noindex, prices = transfer, not in sitemap; `TransferForm` station mode (train box, no flight box).

**Done when:** tests green; live: 404 (E1 not set) — recorded.

---

## STEP 7 — `/jaipur-local-sightseeing-taxi` (K6)

1. Page from `/fare/local?city=JAIPUR` (E2 default: today's prices): H1 "Jaipur Local Sightseeing Taxi — 8 hours / 80 km from ₹{hatchback base}", package table per car (8 h / 80 km, 10 h, 12 h, extra hour), "what is included" (driver, fuel, the 80 km; toll/parking as they come — the existing local wording), "places people usually ask the driver to cover" — **names only** (Amer Fort, Hawa Mahal, City Palace, Jal Mahal, Nahargarh, Albert Hall), with "the driver is not a licensed guide; entry tickets are yours", no timings. Booking: `components/BookingWidget.tsx` already supports the local trip type (checked 27 Nov) — mount it preset to local, pickup Jaipur; plus Call/WhatsApp.
2. `noindex, follow`, Wave 2 held path (`WAVE2_PATHS`), not in sitemaps; linked from the Jaipur city page's new hourly section (Step 3.1).
3. Schema: TaxiService + Offer per package (INR, `/fare/local` price, GST as the API says) + Breadcrumb; FAQ only if questions are on the page.
4. Tests: prices = API; noindex; not in sitemap; no "guide" claim other than the disclaimer; no time-of-day for monuments.

**Done when:** page builds, tested, live as held.

---

## STEP 8 — GBP and owner text (K8, K9)

1. `docs/seo/GBP_POSTS_DEC2026.md`: append "Naye pages" — 4 posts (Jaipur → Pushkar, Jodhpur → Jaisalmer — only if their routes went live in Step 5; Jaipur local 8 hr / 80 km; Jaipur railway station — only when E1 is set), fares from the live API on the writing date, UTM links; products for the same. If a page did not go live, its post says "abhi nahi — page live hone par". Add to the profile checklist: service areas **+ Pushkar, Jodhpur** (only once their routes are live).
2. `docs/seo/OWNER_STEPS_KEYWORD_FILES_27NOV.md` (Hinglish):
   §1 kya bana (pages, kaunse held, kaunse blocked aur kyun);
   §2 faisle E1–E8 — har ek ke saath abhi kya chal raha hai aur aapke jawab se kya badlega (E1 station fares ka format: zone A/B/C × car; E2 package; E3 Ludhiana–Chandigarh; E4; E5; E6; E7; E8);
   §3 distance-blocked routes (Step 5.1 numbers);
   §4 Keyword Planner: top 100 owner keywords (list from `keywords.csv`, owner-file source, Wave 1 first) — how to get monthly volumes (Google Ads → Tools → Keyword Planner → "Get search volume and forecasts" → paste → India → download) and where to put the file (`docs/seo/evidence/keyword-planner-<date>.csv`);
   §5 GBP — the new posts;
   §6 baad ke candidates (plan §C2, §C4) — kya chahiye har ek ke liye: Jodhpur / Udaipur city pages (≥ 3 priced routes out first), Bikaner / Pushkar / Jaisalmer / Bhilwara city pages, Agra–Mathura, Ajmer–Udaipur, Jaipur–Bikaner / Bhilwara, Delhi → Rishikesh (fare in line with Delhi → Haridwar ₹2,920; per-km today ₹3,780), Dehradun city page (after Delhi ↔ Dehradun opens in Wave 2), Salasar Balaji (city key + fare, E6), Gurgaon → Jaipur (per-km ₹4,130 vs Delhi → Jaipur ₹2,800 — fare or a "Gurgaon pickup" line on the Delhi page);
   §7 Char Dham / Rajasthan tours: sample packages — index only after the owner sends real packages and prices;
   §8 reminder: Request Indexing is still only Wave 1 (`OWNER_STEPS_INDEX_RANK_27NOV.md` §2), Validate fix on 11 Dec; hellomycab.com recovery (E8) stays the biggest single step.

**Done when:** files written; every price matches the API on that date (script output in the ledger).

---

## STEP 9 — Release (K10)

1. Backend (if Step 5/6 changed it): typecheck, lint on changed files, full Jest (serial rerun of load failures) → commit by path → push → `/health` → live: `/public/routes` has the passed pairs; `/public/transfers/jaipur-railway-station` 404 (or 200 with E1).
2. Website: clear `.next/cache/fetch-cache`; tsc, lint, test:seo, test:rating, test:rank, build (artifact size), local crawl + `qa:quality`, `page-quality` (overlap guard), `keyword-coverage` after → commit by path → push → wait for Amplify (a changed page shows the new text).
3. Live checks (record):
   - Wave 1 still exactly 45 in `sitemap.xml`; all 45: 200, index, self canonical, one H1, title ≤ 60, description 90–165, no inline CSS, og:image.
   - New pages: 200 (or 404 by design for the station page), `noindex, follow`, absent from all 6 sitemaps, title price = API.
   - City pages: "Outstation taxi from" H2; local section prices = `/fare/local`.
   - 16 route titles = cheapest `/fare/oneway` (unchanged rule).
   - `keyword-coverage.mjs https://www.hellomycabs.com --label 2026-11-27-kw-live` vs baseline.
   - `monitor-domains.mjs`.
4. IndexNow: the live sitemap only (= Wave 1, 45 URLs) — the changed Wave 1 pages get recrawled; new pages are not sent.
5. Ledger + owner file committed (docs by path).

---

## 10. What must NOT happen
- No page for the 14 C3 cities or the 24 no-demand routes; no second page for a twin route.
- No wave released, no new page indexable, Wave 1 not changed.
- No fare changed; no invented station fare, package, tour stop, timing, guide or luggage figure.
- No per-km route published on a straight-line distance that is > 10% off.
- No Triplesinfotech data anywhere; no owner files staged; no attribution line; no env.

## 11. Final report (Hinglish, to the owner)
Short: what is live on Wave 1 (coverage before → after per page group), which new pages exist as held Wave 2 and which are blocked (with the reason: E1 fares, E3 fare, distance check), test counts, live checks, the 8 decisions with defaults used, next steps. No ranking promises.

## 12. Ledger rows
K0 baseline · K1 files copied + shasum · K2 keyword map script · K3 keywords.csv merge + source column · K4 gsc-weekly source breakdown · K5 keyword tests · K6 NO_PAGE_CITIES guard + test · K7 coverage script + baseline · K8 city outstation H2 · K9 city hourly/full-day section · K10 private line · K11 city title/description tail · K12 route door-to-door line · K13 bags (data or 'no data') · K14 family line + FAQ wording · K15 Khatu same-day darshan · K16 car pages on rent in Jaipur · K17 airport twins wording · K18 home intercity · K19 coverage after + overlap + quality gate · K20 Hindi lines hidden + test · K21 distance check table · K22 DEMAND_ROUTES additions + backend tests · K23 Ludhiana–Chandigarh held (E3) · K24 backend release + live · K25 website WAVE2 additions · K26 new route content facts · K27 new route tests · K28 station transfer (E1) · K29 station page + guard · K30 station form mode · K31 station tests · K32 sightseeing page · K33 sightseeing tests · K34 GBP posts/products · K35 owner file · K36 website pre-flight · K37 commits + deploy · K38 live checks · K39 IndexNow · K40 ledger/docs committed + report.
