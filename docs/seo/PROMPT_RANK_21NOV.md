# IMPLEMENTATION PROMPT — hellomycabs.com ko keywords aur routes par top par laana (21 Nov 2026)

You are implementing `docs/seo/PLAN_RANK_STEPS_21NOV.md` (the step plan) whose research is `docs/seo/PLAN_RANK_21NOV.md`. Work **step by step, in the order below**. Do not skip a step; if a step cannot be done, mark it **blocked** in the ledger with the reason and continue with the next one. Every step ends with its **Done when** checks — a step is not done until every check passes and its evidence is written down.

Owner speaks Hinglish; owner-facing text (reports, OWNER files, GBP/post copy) in simple Hinglish. Code comments, commit messages and tests in English.

---

## 0. Outcomes

| # | Outcome | Plan phase |
|---|---|---|
| O1 | Measuring system: keyword list, weekly GSC diff, index tracker, SERP snapshot format | 1.1–1.4, 10 |
| O2 | Real route facts from drivers (survey sent, facts shown when ≥ 2 drivers agree) | 1.5 |
| O3 | Fares: flagged list for the owner; new fares set (Airport, Khatu); title price = booking price; one measured distance everywhere | 2 |
| O4 | Real reviews: after-ride request working from code (no env), rating page, Google rating text, review link slot | 3 |
| O5 | New pages: Jaipur Airport taxi, Jaipur↔Khatu Shyam route, Khatu Shyam city page, Khatu guide | 4 |
| O6 | Google Business Profile kit (products, 4 weeks of posts, Q&A, review replies, photo list) + contact page map | 5 |
| O7 | Content: city pages (pickup areas, local taxi), home/brand, route pages (top section, facts), 4 new guides, internal links ≥ 15 | 6 |
| O8 | Citations checklist + partner-link list (owner executes) | 7 |
| O9 | Hindi pages scaffold — **built but held** behind the 80% gate | 8 |
| O10 | Technical: Tier 3 release tool, HTML weight down, schema checks, 404 map, monitoring | 9 |
| O11 | Everything released: tests, deploy, live checks, IndexNow, ledger, owner report | — |

### Owner decisions (21 Nov 2026 — record these in the ledger)

| # | Question | Owner's answer | What you do |
|---|---|---|---|
| D1 | WhatsApp rating template | "m karwa dunga, tum content with template name de dena" | Give final template name + body + sample in `docs/seo/OWNER_STEPS_RANK_21NOV.md` §1 (and in the final report). Code: template name set **in code** (`hmc_rate_ride_v1`), sending stays **off until a code flag says approved** — see Step 3. Never send an unapproved template. |
| D2 | GBP "Ask for reviews" link | "baad m dal dunga" | Code takes it from one constant (`null` now). Everything that uses it hides itself while null. Adding it later = one line + push. |
| D3 | Flagged (wrong-looking) fares | "baad m" | Produce the list (`FARE_REVIEW_21NOV.md`); **do not change** those fares; keep those routes out of Tier 1 and out of any Tier 3 release until decided. |
| D4 | Jaipur Airport + Khatu Shyam fares | "tum kar do, unse compete karke" | Use the fares in §D4 below exactly. All in one file each, commented "owner-set 21 Nov 2026, competitive with MMT/Savaari/Rajputana/CabBazar/HurryUp", easy to change. |
| D5 | GBP name has a keyword ("-Taxi service in jaipur") | not answered | Do not touch. Explain the risk once in OWNER_STEPS. |

#### §D4 — fares to set (rupees)

Convention: same as `ONEWAY_FARES` in backend `src/constants/fareTable.ts` — the table value is the **total including toll**, before GST; the page "from" price is derived by the existing code (toll split out, discount applied). After setting, read `/public/routes` and `/fare/oneway` and record the printed "from" price in the ledger.

**One-way (add to `ONEWAY_FARES`, both directions):**

| Pair | hatchback | dzire | ertiga | crysta |
|---|---|---|---|---|
| JAIPUR ↔ KHATU_SHYAM_JI | 1,199 | 1,349 | 1,799 | 2,599 |
| DELHI ↔ KHATU_SHYAM_JI | 3,099 | 3,399 | 4,299 | 5,999 |
| DELHI_AIRPORT ↔ KHATU_SHYAM_JI | 3,099 | 3,399 | 4,299 | 5,999 |
| JAIPUR_AIRPORT → DELHI / DELHI_AIRPORT / AGRA / AJMER / SIKAR / KOTA / KHATU_SHYAM_JI | same as the JAIPUR row for that drop | | | |
| (reverse of each JAIPUR_AIRPORT pair) | same as the X → JAIPUR row | | | |

Competitor reference (research 21 Nov): Jaipur→Khatu HurryUp ₹1,200, CabBazar ₹1,335, MMT ₹1,487, Om Taxi ₹1,500.

**Jaipur Airport ↔ city transfer (new, fixed, GST and airport parking included, per trip, either direction):**

| Zone | Road km from JAI terminal (measured) | hatchback | dzire | ertiga | crysta |
|---|---|---|---|---|---|
| A | ≤ 12 km | 449 | 549 | 749 | 1,199 |
| B | > 12 – 20 km | 549 | 649 | 899 | 1,399 |
| C | > 20 – 30 km | 749 | 849 | 1,099 | 1,699 |
| beyond 30 km | — | use outstation / local package | | | |

- Free waiting: **45 minutes** after the flight lands (arrivals) / after the pickup time (departures); then **₹100 per 30 minutes**.
- Night (11 PM – 5 AM pickup): **+₹100**.
- Competitor reference: Rajputana/Heritage sedan ₹499, Ertiga ₹699; Jaipur Day ₹750; Savaari ₹768; MMT ₹360–1,050.
- Localities are placed in a zone **only by measured road distance** from the airport (Step 4.1), never by guess.

**Reengus Junction ↔ Khatu Shyam Ji transfer (fixed, GST incl.):** hatchback 449 · dzire 549 · ertiga 749 · crysta 1,099.

---

## 1. Repos, rules, safety

Repos (all under `/Users/lalitbansal/Documents/hellomycab/`):
- **Backend** `hello-my-cab-backend` (Express/TS/Mongo, Jest). Push to `main` = auto-deploy to EC2 (`/health` shows commit). **Push backend first**, only after its tests pass; wait for `/health` before pushing the website.
- **Website** `hello-my-cabs-website` (Next.js 16, Amplify). Read `node_modules/next/dist/docs` before using any Next API you have not used in this repo. Tests: `npm run test:seo`, `npm run test:rating`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- **App** `hello-my-cab-app` (Flutter) — only touched in Step 1.5 if the driver survey needs an in-app entry point; otherwise do not touch.
- **Ghoomo** — do not touch.

Rules:
1. **No env changes for the owner.** Every new setting lives in code (`src/config/*.ts` or constants) and applies on deploy. Env may keep an emergency **off** switch only.
2. **Production DB is read-only** except: (a) writes the app itself makes through deployed code; (b) nothing else. Read-only scripts go in the scratchpad, print counts/aggregates only — no phone numbers, names or addresses.
3. **No fake anything:** reviews, ratings, trip counts, addresses, phone numbers, facts, photos, "verified" badges. A fact shown on a page must come from code data, measured data, a driver survey with ≥ 2 agreeing drivers, or the owner. Otherwise leave it out.
4. **No thin pages:** no per-locality pages, no second page for the same route intent, no doorway pages. One keyword → one target URL.
5. **Price honesty:** any price in a title, description, heading or schema must equal what the booking widget / fare API returns for that route and car. Tested.
6. **WhatsApp:** never send a template that is not approved; never send to opted-out numbers; never send marketing to drivers/agents through customer templates. Survey sends go through a dry run first.
7. **Commits:** stage by path. Never stage owner files (`PLAN_*`, `PROMPT_*` in backend root, `docs/seo/CHATGPT_HANDOVER.md`, deleted `public/img/*`). **No `Co-Authored-By` / Claude attribution line** (owner rule).
8. **No DNS, no GSC/GBP/Meta actions** — those are owner steps; you prepare exact text.
9. **No Google Indexing API.** IndexNow is allowed (already set up).
10. **Tier 3 gate** (`src/lib/indexing-tiers.ts`) is not opened early. Hindi pages ship **noindex + out of sitemaps** until the gate.
11. Fares the owner has not approved (D3 list) are not changed.
12. Keep `inlineCss: true` (LCP rule from L7b).

---

## 2. Read first (verify each against current HEAD before using it)

Website:
- `docs/seo/PLAN_RANK_STEPS_21NOV.md`, `docs/seo/PLAN_RANK_21NOV.md`, `docs/seo/LEDGER_INDEXING_20NOV.md`, `docs/seo/OWNER_STEPS_20NOV.md`, `docs/seo/WEEKLY.md`, `scripts/seo/weekly.md`.
- `src/lib/indexing-tiers.ts`, `tier1.ts`, `held-routes.ts`, `sitemap-entries.ts`, `seo.ts`, `schema.tsx`, `company.ts`, `route-faq.ts`, `city-faq.ts`, `api.ts`, `reviews.ts`, `review-rules.ts`.
- `src/app/[slug]/{page,RoutePage,CityPage,RouteVariantPage,VehiclePage}.tsx`, `src/app/page.tsx`, `src/app/contact`, `src/app/about`, `src/app/rate/[token]`, `src/app/driver/route/[token]/page.tsx`, `src/app/api/driver-survey/route.ts`, `src/content/routes/driver.generated.ts`, `src/content/guides/{index,roads}.ts`, `src/app/guides/**`.
- `src/components/landing/{FareTable,Included,RouteRoad,RouteInsights,RatingSummary,LiveRatingSummary,TierA,RouteDetail}.tsx`, `src/components/site/RateUs.tsx`.
- `scripts/seo/{crawl-audit.py,quality-gate.mjs,gsc-report.mjs,indexnow.mjs,release-tier3.mjs,monitor-domains.mjs,thin-routes.mjs}`, `scripts/test/{seo-recovery.mjs,rating-summary.mjs,source-modules.mjs}`.
- Evidence: `docs/seo/evidence/gsc-2026-11-20/perf-3m/{Queries,Pages}.csv`, `crawl-2026-11-21-live-after-deploy.{json,md}`.

Backend:
- `src/constants/fareTable.ts` (`ONEWAY_FARES`, `INTERCITY_VEHICLES`, `AIRPORT_SURCHARGE`), `src/constants/demandRoutes.ts`, `src/constants/cityAliases.ts` (note **`'KHATU SHYAM JI' → 'SIKAR'`, `'KHATU SHYAM' → 'SIKAR'`**), city directory (`models/cityDirectory.model.ts` + wherever `findCity`/`cityRoadKm`/`isAirportCity` live).
- `src/controllers/booking.controller.ts` (`publishedRoutes`, `publicRoutes`, `onewayFareBody`, `/fare/local`).
- `src/services/jobs.ts` (`sendDueReviewRequests` ~L460–515), `services/ratingLink.ts`, `controllers/rating.controller.ts`, `services/whatsapp.service.ts` (`sendRatingRequestTemplate`, `sendReviewRequestTemplate`), `config/env.ts` (`REVIEW_REQUESTS_ENABLED` default false, `REVIEW_TEMPLATE_NAME`, `RATING_TEMPLATE_NAME`, `GBP_REVIEW_URL`), `config/ghoomoSettings.ts` (pattern for settings-in-code), `TEMPLATE_hmc_rate_ride.md`.
- `src/models/routeKnowledge.model.ts`, `controllers/*routeKnowledge*`, `/public/route-knowledge/:pickup/:drop` (returns `drivers: 0` on top routes today).
- `src/services/routeInsights.ts` (`measure()`, `resolveRoadRoute`), `models/routeInsight.model.ts`.
- Parser / broadcast tests that mention Sikar or Khatu (`grep -ri "khatu" src`).

Write in the ledger which of these you read and anything that did not match this prompt.

---

## STEP 0 — Baseline and ledger

1. Create `docs/seo/LEDGER_RANK_21NOV.md` with rows R0–R40 from §12 (status `todo`).
2. Record HEADs of website, backend.
3. Run and record: website `tsc`, `lint`, `test:seo`, `test:rating`, `build` (artifact size); backend `npm run typecheck`, `lint`, full Jest (if the machine is loaded, rerun failures serially with `--runInBand` and record both).
4. Production crawl: `python3 -I scripts/seo/crawl-audit.py https://www.hellomycabs.com --label rank-baseline` → record pages, similarity counts, HTML median, internal-links-in < 15 list.
5. Read-only production counts (scratchpad script, aggregates only): completed bookings last 30 days by source (customer app / website / agent / WhatsApp), how many have a customer phone; `Booking.reviewRequestedAt` set in last 30 days; `Rating` total; bookings whose raw text mentions Khatu (count) and which city they were saved as.

**Done when:** ledger exists with baseline numbers; all baseline commands recorded (pass/fail as found).

---

## STEP 1 — Measuring system (O1)

### 1.1 Keyword list
- Create `docs/seo/keywords.csv`: `keyword,group,target_url,priority,impressions_3m,position_3m,last_checked`.
- Rows: every query in `gsc-2026-11-20/perf-3m/Queries.csv` with ≥ 10 impressions (exclude typos like "raxi"/"texi" only if they have no sensible target — keep them mapped to `/` otherwise), plus for each of the 14 Tier 1 routes: "a to b cab", "a to b taxi", "a to b one way taxi", "a to b cab fare"; plus Airport group (5) and Khatu group (6) keywords from the plan.
- Target mapping rules: route keyword → route page; city keyword → city page (`/cab-service-in-x`); airport → `/jaipur-airport-taxi`; khatu/reengus → `/jaipur-to-khatu-shyam-cab` for "jaipur to khatu", else `/cab-service-in-khatu-shyam-ji`; brand + generic → `/`; "one way or round trip" type → guide.
- Test (`seo-recovery.mjs`): every `target_url` exists in the site's route list or is planned in this prompt; no keyword appears twice; no two rows with the same keyword map to different URLs.

### 1.2 Weekly GSC diff
- Extend `scripts/seo/gsc-report.mjs`: `--prev <folder> --curr <folder>` → per query and per page: impressions, clicks, position, delta; updates `keywords.csv` (`impressions_3m`, `position_3m`, `last_checked`); appends a dated block to `docs/seo/WEEKLY.md` (top 10 up, top 10 down, keyword groups average position).
- Folder may be a GSC zip extracted (Queries.csv, Pages.csv). Handle missing files with a clear message.
- Test with two small fixtures in `scripts/test/fixtures/gsc-a`, `gsc-b`.

### 1.3 SERP snapshot format
- `docs/seo/evidence/SERP_TEMPLATE.md`: the 12 queries (plan 1.3), table per query: rank, domain, URL, page type (aggregator / operator / GBP post / guide / directory), shows price in title (y/n), shows rating (y/n). Owner sends screenshots; you fill it.

### 1.4 Index tracker
- `gsc-report.mjs --coverage <Pages export folder>`: count Tier 1 URLs (from `indexing-tiers.ts`, read from source like `release-tier3.mjs` does) in "Indexed" vs each "not indexed" reason; print gate status (Tier 1 ≥ 80% indexed AND "Discovered" count not higher than last week). Append to WEEKLY.

**Done when:** tests pass; running on the 20 Nov export produces the WEEKLY block and the coverage line (gate: not met — expected).

---

## STEP 2 — Driver route facts (O2)

1. Backend script `scripts/send-route-survey.ts` (`--dry-run` default; `--send` to send):
   - For each of the 14 Tier 1 routes (+ JAIPUR↔KHATU_SHYAM_JI after Step 4.2): drivers with ≥ 1 completed duty on that pair (either direction) in the last 90 days, ranked by count, top 5; skip drivers who already answered that route (`routeKnowledge`), skip blocked/inactive drivers.
   - One driver gets **one** message listing up to 3 of their routes (not 3 messages).
   - Channel: in-app push notification + in-app inbox (existing notification service). **No WhatsApp template** unless an approved driver-facing template exists — check; if none, push only and write the template text in OWNER_STEPS §6 for later.
   - Link = existing tokenised `/driver/route/[token]` (verify how tokens are made; reuse).
   - Dry run prints: per route, number of drivers it would reach (no names/phones).
2. Survey page (`/driver/route/[token]`): confirm it asks — stops (dhaba / fuel / washroom with approx km), toll count and approx rupees, common pickup areas at both ends, road notes (expressway, ghat, border, night safety). Add missing fields in both backend model and page; keep it short (≤ 2 minutes), Hindi labels with English.
3. Aggregation: a fact is publishable only when **≥ 2 drivers** give a matching answer (same stop name normalised, toll count equal, ±20% rupees). Implement in backend (`/public/route-knowledge` returns only publishable facts + `drivers` count).
4. Website: route page block "From drivers who run this road" — shows only publishable facts, with "N drivers, updated <month>". Hidden when nothing publishable. Update `driver.generated.ts` flow if it is the build-time path (read it first).
5. Admin: a list of answers per route (read-only) in the existing admin panel if an admin route for route knowledge exists; otherwise skip and note.
6. **Do not run `--send` in this task.** Run `--dry-run` against production read-only and record counts. Sending is an owner step (OWNER_STEPS §6: "bolo to bhej dun" — one command for you later), because it messages real drivers.

Tests: aggregation threshold (1 driver → hidden; 2 agreeing → shown; 2 disagreeing → hidden), one message per driver, skip already-answered.

**Done when:** tests pass; dry-run counts in ledger; page block renders with a fixture and is absent without data.

---

## STEP 3 — Fares and distance (O3)

### 3.1 Fare sanity list
- `scripts/seo/fare-sanity.mjs` (website repo; reads `/public/routes`, or a JSON path): flag (a) ₹/km > 2× catalog median, (b) A→B vs B→A differ > 20%, (c) same-distance (±15%) pairs differ > 1.8×, (d) under 40 km priced > ₹1,500. Output `docs/seo/FARE_REVIEW_21NOV.md`: route, km, from-price, ₹/km, reason, competitor price where the research has one, column "Owner: theek / naya ₹" (empty).
- Known flags to expect (check they appear): DELHI→DELHI_AIRPORT, DELHI→NOIDA, NOIDA→DELHI, NOIDA→DELHI_AIRPORT, DELHI_AIRPORT→DELHI, DELHI→SIKAR / SIKAR→DELHI, CHANDIGARH↔HARIDWAR, KOTA↔AGRA.
- **Do not change** any of them (D3). Add every flagged pair to a `FARE_HOLD` list in `src/lib/indexing-tiers.ts`; `release-tier3.mjs` skips them and prints "held: fare under review"; a Tier 1 route on the list → fail the test (none expected).

### 3.2 Khatu Shyam city key (needed by 3.3 and Step 5)
- Backend: add city `KHATU_SHYAM_JI` (label "Khatu Shyam Ji", state Rajasthan, coordinates of the temple area — take from an existing reliable source in the repo, e.g. Ghoomo `place:KHATU_SHYAM_JI` data; if none, the routing provider's geocode; record the source).
- Remove the two aliases `'KHATU SHYAM JI' → 'SIKAR'`, `'KHATU SHYAM' → 'SIKAR'` and map them (plus "KHATU", "KHATUSHYAM", "KHATU SHYAMJI", "खाटू श्याम") to `KHATU_SHYAM_JI`.
- Add `REENGUS` only if the booking/parser flow needs it for the transfer; otherwise the transfer is page-only (Step 5.3).
- **No data migration** of old bookings.
- Run every parser / broadcast / fare / city test; update expectations that asserted Khatu → Sikar, and add tests: WhatsApp text "Jaipur to Khatu Shyam ji drop" parses to JAIPUR→KHATU_SHYAM_JI; broadcast targeting for a Khatu duty reaches the same drivers a Sikar duty would (check how targeting works — if by city, add Khatu to Sikar's area so no driver loses duties).

### 3.3 New fares (D4)
- Backend `ONEWAY_FARES`: the Khatu rows and the JAIPUR_AIRPORT rows exactly as §D4 (only if `JAIPUR_AIRPORT` exists as a city or is created in Step 5.1 — do 3.3's airport rows after 5.1).
- New file `src/constants/airportTransfers.ts`: `JAIPUR_AIRPORT_TRANSFER` zones A/B/C (km bounds, 4 cars), waiting rule, night rule; `REENGUS_KHATU_TRANSFER`. Comment with source "owner delegated 21 Nov 2026" and competitor refs.
- Public endpoint `/public/transfers/:key` (zod-validated key) returns the table — the website prints from it (never hard-coded on the page).
- Tests: endpoint shape; fares match the constants; `/public/routes` lists the new pairs with a "from" price.

### 3.4 Title / description = booking price
- Website test (new, `seo-recovery.mjs`): for every indexable route page, the price in `<title>`, H1 and the first fare in the fare table equals `/fare/oneway` cheapest car (after the existing toll/discount display rules). Use the mock API in the harness.
- Description template (route): `"{A} to {B} cab @ ₹{from} one way — {km} km, about {h} h. {Included}. {Demand line when insights demand ≥ 20}. Book online or call 24×7."` trimmed to 120–155 chars by dropping optional parts in this order: demand line, "about {h} h". `{Included}` = what `Included.tsx` says is included (e.g. "Toll & driver included") — read it, do not invent.
- Show struck "was ₹X" only when `fromListRupees > fromRupees` (already) — no new offers.

### 3.5 One distance everywhere
- Website: a single helper `routeKm(route, insights)` → measured km (insights `distance.km` when `distanceSource === 'measured'`, or catalog `distanceMeasured`) else catalog estimate. Used by title, H1 area, fare table note, FAQ, schema (`TaxiService`/`Trip` distance if present), RouteRoad, OG image text.
- "via ___": only from the measured route's summary/major roads if the provider returns it (check `resolveRoadRoute` output); otherwise omit.
- Duration: measured duration if present; else existing estimate with "traffic par nirbhar" note (exists).
- Test: for a fixture with measured 281 km and catalog 306 km, every place prints 281.

**Done when:** FARE_REVIEW file exists with the expected flags; FARE_HOLD wired + tested; Khatu city works end to end (parser, fare, booking create in test); §D4 fares live in tests; price-equality and single-distance tests pass.

---

## STEP 4 — Real reviews (O4)

### 4.1 Settings in code
- New `src/config/reviewSettings.ts` (pattern: `ghoomoSettings.ts`):
  - `REVIEW_REQUESTS_ENABLED: true` (env can only force **off**),
  - `RATING_TEMPLATE_NAME: 'hmc_rate_ride_v1'`,
  - `RATING_TEMPLATE_APPROVED: false` ← the one line the owner's "approved" message flips,
  - `GBP_REVIEW_URL: null` ← D2,
  - `SEND_WINDOW_IST: { from: 9, to: 21 }`, `DELAY_AFTER_COMPLETE_MIN: 120`, `ONE_PER_PHONE_DAYS: 30`.
- `jobs.ts` reads these instead of env. Behaviour:
  - `RATING_TEMPLATE_APPROVED === false` → **send nothing** (do not fall back to the old Google review template unless `REVIEW_TEMPLATE_NAME` is set and known approved — check what production uses today in Step 0.5 and keep that exact behaviour if it is already sending; record it).
  - Approved → send `hmc_rate_ride_v1` with name, route, rating link.
  - Respect window (defer, do not drop), opt-out, one per phone per 30 days, brand ≠ ghoomo (exists).
- Agent bookings: send only when the booking has the **end customer's** phone (check the field); never to the agent or driver.
- Tests: off → 0 sent; approved → template name used; outside window → deferred then sent; 2 trips same phone in 30 days → 1 message; agent booking without customer phone → 0.

### 4.2 Rating page
- `/rate/[token]` (website): after a rating, show "Google par bhi likhein?" button **to everyone** (all star values) when `GBP_REVIEW_URL` is set (website reads it from backend `/public/reviews/rate/:token` response or from `company.reviewUrl` — use one source: backend config, returned by the API). 4–5 stars: button first; 1–3 stars: feedback box first, button below. Hidden while null.
- Tests for both orders and the null case.

### 4.3 Google rating as text
- Website `company.googleRating = { value: 4.7, count: 156, asOf: 'October 2026' }` (the figure already recorded in `company.ts` comments from the owner's profile). Render as text on home, city pages and contact: "4.7★ on Google · 156 reviews (Oct 2026)" linking `company.mapsUrl`. **Not** in JSON-LD. Add a test that no `aggregateRating` is emitted from it.
- OWNER_STEPS §2: "har mahine rating aur count bataiye" (one line to update).

### 4.4 Own ratings
- No change: guard shows them from 10 real ratings. Add a test that 9 → hidden, 10 → shown with the real count (exists? if yes, record).

**Done when:** backend + website tests pass; with `RATING_TEMPLATE_APPROVED=false` production sends nothing new (verify after deploy: `reviewRequestedAt` count does not jump); OWNER_STEPS §1 has the template.

---

## STEP 5 — New pages (O5)

### 5.1 Jaipur Airport
Backend:
- City `JAIPUR_AIRPORT` ("Jaipur Airport (JAI)", coordinates of the terminal) if missing; `isAirportCity` includes it; aliases: "JAIPUR AIRPORT", "SANGANER AIRPORT", "JAI AIRPORT".
- §D4 one-way rows for JAIPUR_AIRPORT (Step 3.3).
- Zones: measure road km from the terminal to each candidate locality with `resolveRoadRoute` (script in scratchpad, results saved to `docs/seo/evidence/jaipur-airport-zones-2026-11-21.md`): Sanganer, Pratap Nagar, Sitapura, Malviya Nagar, Jagatpura, Durgapura, Tonk Road, Gopalpura, Mansarovar, Raja Park, C-Scheme, MI Road, Railway Station, Sindhi Camp, Bani Park, Civil Lines, Vaishali Nagar, Hawa Mahal / Walled City, Vidhyadhar Nagar, Jhotwara, Murlipura, Amer. Put each in A/B/C by measured km; > 30 km → not listed. Store the result in `airportTransfers.ts` (`localities: [{name, km, zone}]`).
- Booking: the transfer is booked through the existing enquiry / web-lead flow with the quoted transfer fare and car prefilled (check `webLead` flow; add `kind: 'airport_transfer'`, zone, car, fare, flight no. optional). Owner gets the same alert as other web enquiries. **Not** a new payment flow in this task (note it as a follow-up in OWNER_STEPS §8).
Website `/jaipur-airport-taxi`:
- Title: `Jaipur Airport Taxi @ ₹{zone A dzire} | Fixed Fare Cab 24×7` (≤ 60). Description 120–155 with zone A price, "parking & GST included", "45 min free waiting".
- H1 "Jaipur Airport Taxi — fixed fares to the city and outstation".
- Sections: (1) booking card (airport ↔ locality selector, car, date/time, flight no., submit → enquiry; phone + WhatsApp); (2) city transfer table by zone with locality names from the measured list; (3) waiting + night rules; (4) airport → outstation table (from `/public/routes`, JAIPUR_AIRPORT rows) linking route pages where indexable; (5) how pickup works at T1/T2 — **only** what the owner/office has confirmed; if nothing confirmed, a one-line "Driver calls you after landing" (that is how the service works — verify in booking notification code; if not true, omit); (6) FAQ 5–6 airport-only questions answered from the rules above; (7) links: `/cab-service-in-jaipur`, Jaipur route pages, guide 6.4.
- Schema: `TaxiService` (areaServed Jaipur, provider ORG_ID, `offers` with zone A–C dzire prices as `PriceSpecification`), `FAQPage`, `BreadcrumbList`.
- Tier 1 (`TIER1_OTHER_PATHS`), core sitemap, home "Searched most" (top 3), footer, Jaipur city page "Airport" line, every JAIPUR route page "Airport pickup available" line linking it.

### 5.2 `/jaipur-to-khatu-shyam-cab` (and `/khatu-shyam-ji-to-jaipur-cab`, `/delhi-to-khatu-shyam-cab`, `/khatu-shyam-ji-to-delhi-cab`)
- These come from the normal route system once the city + fares exist. Check the slug the system generates (`khatu-shyam-ji`) and make the **Jaipur→Khatu** canonical slug match the keyword: if generated slug is `/jaipur-to-khatu-shyam-ji-cab`, keep it (do not create a second URL); update keywords.csv target accordingly.
- Route-specific content (beyond the standard route page): road "Jaipur → Chomu → Reengus → Khatu" **only if** the measured route confirms those towns (check provider output); mela/Ekadashi note: "Phalgun mela aur Ekadashi par bheed — 2–3 din pehle book karein" (service advice, not a claim); same-day return: link to round-trip quote (existing round-trip flow) — no invented package price.
- Tier 1: JAIPUR→KHATU_SHYAM_JI and reverse; DELHI↔KHATU as Tier 2 (indexable, not prebuilt).

### 5.3 City page `/cab-service-in-khatu-shyam-ji`
- City page system requires `MIN_CITY_ROUTES = 3` (Khatu will have Jaipur, Delhi, Delhi Airport, Jaipur Airport = 4 pairs each way → qualifies; verify).
- Extra block: Reengus Junction ↔ Khatu transfer (from `/public/transfers/reengus-khatu`), bookable via enquiry like 5.1; "Khatu se Salasar / Sikar / Jaipur" links where routes exist (Sikar ↔ Khatu: add only if the owner adds a fare — not in D4 → don't).
- Keywords: taxi in khatu, taxi service in khatu shyamji, khatu shyam taxi service contact number (→ phone shown top), taxi service in reengus (→ transfer block heading "Taxi from Reengus station to Khatu Shyam Ji").
- Links: `/cab-service-in-sikar` ↔ this page; Jaipur city page.

### 5.4 Guide `/guides/how-to-reach-khatu-shyam`
- Sections: by road from Jaipur (measured km/time), from Delhi (measured), by train (Reengus Junction is the nearest station — widely documented; 18 km measured from station to temple), by air (Jaipur airport + road), when it is crowded (mela/Ekadashi — general), where to book a cab (links). Sources line for non-measured facts (Indian Railways station name). ≥ 800 words, no filler; similarity < 0.35 to other guides (crawl check).
- Add to `src/content/guides/index.ts`, guide index page, route + city pages link to it.

### 5.5 Release new pages
- Prebuilt (Tier 1), sitemaps, IndexNow after deploy, OWNER_STEPS §3 Request Indexing list for the new URLs.

**Done when:** all pages 200 + `index, follow` locally; crawl (local) shows unique title/desc within limits, one H1, valid JSON-LD, internal links in ≥ 15; enquiry from the airport page and Khatu page reaches the owner alert in tests; fares on pages equal constants/API.

---

## STEP 6 — Google Business Profile kit (O6)

Create `docs/seo/GBP_KIT_21NOV.md` (owner copies; Hinglish instructions, English/Hindi post text):
1. **Profile check list:** categories (primary Taxi service; secondary Airport shuttle service, Car rental agency — only if true), service areas (Jaipur, Kota, Delhi, Sikar, Agra, Chandigarh, Ajmer, Khatu Shyam Ji, Noida), website `https://www.hellomycabs.com/`, phone `+91 96671 11921`, hours 24h, address exactly `company.ts`. Name: explain D5 risk; recommend no change now.
2. **Products (10):** Jaipur→Delhi, Delhi→Jaipur, Jaipur Airport Taxi, Jaipur→Khatu Shyam, Kota→Jaipur, Jaipur→Kota, Delhi→Agra, Delhi→Chandigarh, Jaipur→Sikar, Delhi Airport→Jaipur — each: name, "From ₹X" (from the API at the time of writing — record date), 2-line description, link with `?utm_source=gbp&utm_medium=product&utm_campaign=<slug>`.
3. **Posts — 4 weeks × 2 = 8 posts:** each 150–300 words, one route/topic, real fare from API, CTA "Book" → page with `utm_medium=post`, photo suggestion from the photo list. Topics: Jaipur↔Delhi, Airport, Khatu (+ mela tip), Kota students/parents, Delhi→Agra, one-way vs round-trip, Ertiga for families, Delhi→Chandigarh. No fake offers.
4. **Q&A (5):** fare includes toll?, advance needed?, airport waiting?, Khatu same-day return?, one-way available at night? — answers matching `fares-explained` and §D4.
5. **Review replies:** 3 templates (5★, 3★, 1★) in Hinglish, no incentives.
6. **Photo list (20):** what to shoot (office front with board, each car type outside/inside, driver with car — with consent, airport pickup spot, Khatu temple area parking), size/format tips.
7. **Weekly routine** lines (link to Phase 10).

Website: contact page — Google Maps embed (iframe `loading="lazy"`, `referrerPolicy`, title attr) pointing to `company.mapsUrl` query; only on `/contact`. Check CSP/headers allow it (read `next.config` headers); if CSP blocks it, use a static link card instead and note it.

UTM: confirm the site's analytics records `utm_*` (read `lib/analytics.ts`); if it drops them, record UTM source on the first page view (no PII) so WEEKLY can count GBP visits.

**Done when:** kit file complete with real prices and links (each link 200 locally/live); contact page renders map or link card; UTM visits recorded in a test.

---

## STEP 7 — Content (O7)

### 7.1 City pages (Jaipur, Kota, Delhi first; then Sikar, Agra, Chandigarh, Ajmer, Haridwar, Noida, Delhi Airport, Khatu)
- **Pickup areas** block: names only from (a) the owner (none yet), or (b) production bookings' pickup addresses aggregated read-only to **locality names** with ≥ 5 pickups in 180 days (script prints locality + count, no addresses). Store in `src/content/city-areas.generated.ts` (committed, regenerated by script). Heading "Pickup areas we serve in {City}". If < 5 localities qualify, hide the block.
- **Local taxi** block from `/fare/local` (8h/80km etc.) where the city has local service (check how `/fare/local` scopes cities; if global, show only on cities the backend says it serves locally — verify; otherwise omit).
- **Phone + WhatsApp + 24×7** in the first screen; description includes phone for "taxi service number" queries (fits 155).
- Kota: "Students & parents" note only if the owner confirms such service — not confirmed → omit (record).
- Delhi: "south delhi", "vasant kunj" keywords → only via the pickup-areas data; no invented locality text.
- Check: city-vs-city similarity < 0.40 in crawl; title/desc limits.

### 7.2 Home + About (brand)
- Home title starts with "Hello My Cab" (check current; change only if it does not), keeps ≤ 60.
- "Searched most" block: Jaipur–Delhi, Delhi–Jaipur, Jaipur Airport, Kota city, Jaipur–Khatu first.
- About: company facts **only** from code/owner (founding year, fleet/driver counts if present anywhere verified; otherwise production read-only counts of active drivers / completed trips as "since <month year>" — aggregate only, rounded down to the nearest 100, labelled with the date). Record the source.

### 7.3 Route pages (all indexable)
- First screen on mobile (375×812): from-price, km, hours, included chips, booking button, call/WhatsApp — verify with a Playwright screenshot of 3 routes (scratchpad), record.
- Order: top card → insights → driver facts (Step 2) → fare table → road/route → pickup areas A/B (from 7.1 data) → related routes + reverse + guide → FAQ (route-specific).
- "Airport pickup available" line on JAIPUR/DELHI routes linking the airport page / Delhi airport route.
- Similarity: run local crawl; target Tier 1 route pairs < 0.45 now (record actual). Update `quality-baseline.json` only when every Tier 1 page improves or stays (`qa:quality` passes against the old baseline first).

### 7.4 Guides (4 new besides 5.4)
`kota-jaipur-by-road`, `jaipur-airport-to-city`, `delhi-airport-to-jaipur`, `jaipur-sikar-by-road` — each ≥ 800 words of checkable content: measured km/time, route towns from the provider, toll count only from driver facts (Step 2) or omit, when to leave (general traffic advice clearly marked as advice), costs from the API, links both ways. `articleSchema` with `dateModified`. Similarity < 0.35 vs every other guide.

### 7.5 Internal links
- Every Tier 1 page ≥ 15 internal links in (crawl). Mechanisms: city page lists all its routes (both directions); route page links both cities, reverse, 4 related; home "Searched most"; footer: 6 Tier 1 cities + Airport + Khatu + Routes + Guides. No hidden links, no link blocks > 40 links.

**Done when:** local crawl: limits pass, links-in ≥ 15 for all Tier 1, similarity numbers recorded, `qa:quality` passes.

---

## STEP 8 — Citations and partners (O8)

`docs/seo/CITATIONS_21NOV.md`:
- Table: site, URL to sign up, category to pick, exact NAP to paste (from `company.ts`), website URL, description (≤ 250 chars, Hinglish-free English + Hindi line), status column. Sites: Justdial, Sulekha, IndiaMART, TradeIndia, Yellow Pages India, Bing Places, Apple Business Connect, LinkedIn company, YouTube channel, Facebook (check website link), Instagram (bio link), Quora (profile only).
- Partner list template: partner type, who, what link we ask for, page to link (Kota PG/hostels → `/cab-service-in-kota`; Jaipur hotels → airport page; Khatu dharamshala → Khatu page).
- "Mana" list (paid links, PBN, spam).
- `company.sameAs`: add a profile **only** after it exists and is checked (rule in `company.ts`).

**Done when:** file complete; every URL in it opens (HTTP 200/301).

---

## STEP 9 — Hindi scaffold (O9) — built, held

- `/hi/` routes for: home, 10 Tier 1 routes, Jaipur/Kota/Delhi city, airport, Khatu city.
- Text from a reviewed dictionary (`src/content/hi/*.ts`) — headings, labels, FAQ; numbers/fares from the API. No machine translation at build/runtime.
- `hreflang` en-IN ↔ hi-IN on both versions **only when** the Hindi page is indexable.
- Ship with `noindex, follow`, excluded from sitemaps, behind `HINDI_LIVE = false` in `indexing-tiers.ts`; gate comment: flip after Tier 1 ≥ 80% indexed **and** owner (or a Hindi reader) reviewed the copy.
- Tests: noindex while false; no hreflang while false; when true (test-only), hreflang pairs valid and a `hi.xml` sitemap appears.

**Done when:** tests pass; live build has `/hi/...` noindex and not in sitemaps.

---

## STEP 10 — Technical (O10)

1. **Tier 3 release tool:** `release-tier3.mjs` honours `FARE_HOLD`; add `--apply N` that edits `indexing-tiers.ts` (removes N routes) only when `--coverage` says the gate is met; otherwise refuses. Test both.
2. **New routes from demand:** `scripts/seo/new-routes.mjs` — pairs with ≥ 20 trips / 90 days (from `/public/route-insights/all`) not in the catalog → list for the owner (fare needed). Output to OWNER_STEPS §7. No pages created.
3. **HTML weight:** find what the ~325 KB inline script is (inspect `.next` HTML for one route page: RSC payload — which props are large; likely whole catalog/city lists passed to client components). Move large data server-side / pass only what the client component needs. Target Tier 1 HTML median < 300 KB with `inlineCss` on; verify mobile LCP ≤ 1.2 s on 5 Tier 1 pages (Lighthouse CLI or the existing speed script). If the target is not reached, record actual and what remains.
4. **Schema check:** run each page type (home, city, route, airport, guide, vehicle) through a local JSON-LD validator (existing `crawl-audit` parse) and record; note "Rich Results Test" as an owner/manual check list in OWNER_STEPS §4 with 6 URLs.
5. **404 map:** from `gsc-2026-11-20/drill-not-found-404`, for each URL decide: has a clear current equivalent → 301 (in `next.config` redirects or middleware, whichever the repo uses); else leave 404. Test each redirect.
6. **Monitoring:** `monitor-domains.mjs` checks apex http/https → www 301, www 200, api 200, cert days left (warn < 21) for `hellomycabs.com`, `www`, `api`. Add to `scripts/seo/weekly.md`.

**Done when:** each item done or recorded with numbers; tests pass.

---

## STEP 11 — Verification and release (O11)

1. Backend: typecheck, lint, full Jest (serial rerun for load failures) → commit by path → push → wait `/health` = new commit → check `/public/routes` has Khatu + Jaipur Airport pairs with prices; `/public/transfers/jaipur-airport` and `/reengus-khatu` 200; `/public/route-knowledge/JAIPUR/DELHI` shape; review job sends nothing (approved=false) — read-only count of `reviewRequestedAt` in last hour before/after.
2. Website: tsc, lint, test:seo, test:rating, build (artifact size < 200 MB after map removal) → commit by path → push → wait until the live airport page returns 200.
3. Live checks (record each):
   - New pages 200, `index, follow`, self canonical, title/desc limits, JSON-LD valid: `/jaipur-airport-taxi`, Jaipur→Khatu route (actual slug), `/cab-service-in-khatu-shyam-ji`, 5 guides.
   - `/hi/` sample → `noindex`, absent from sitemaps.
   - 10 Tier 1 pages still 200/index; Tier 3 sample still noindex; sitemap counts (expect 78 + new).
   - Price check: 10 route titles vs `/fare/oneway`.
   - Production crawl `--label rank-after` → compare with baseline (similarity, HTML median, links-in) and `qa:quality`.
   - `monitor-domains.mjs` all green.
4. IndexNow submit (all sitemap URLs).
5. Update `OWNER_STEPS_RANK_21NOV.md` Request Indexing list with the new URLs.
6. Ledger rows filled; commit docs.

---

## 12. Ledger rows (each: done / blocked / skipped + reason + evidence)

R0 baseline · R1 keywords.csv · R2 gsc-report diff · R3 SERP template · R4 coverage/gate · R5 survey script (dry-run counts) · R6 survey page fields · R7 aggregation ≥ 2 · R8 route page driver block · R9 fare-sanity + FARE_REVIEW · R10 FARE_HOLD · R11 Khatu city + aliases + parser/broadcast tests · R12 §D4 one-way fares · R13 transfers constants + endpoint · R14 price-equality test · R15 single distance · R16 reviewSettings in code · R17 review job behaviour + tests · R18 rating page Google button · R19 Google rating text (no schema) · R20 JAIPUR_AIRPORT city + zones evidence · R21 airport page · R22 airport enquiry flow · R23 Khatu route pages · R24 Khatu city page + Reengus transfer · R25 Khatu guide · R26 GBP kit · R27 contact map · R28 UTM capture · R29 city pickup areas data + block · R30 local taxi block · R31 home/about · R32 route page order + mobile screenshot · R33 4 guides · R34 internal links ≥ 15 · R35 citations file · R36 Hindi scaffold held · R37 Tier 3 tool + new-routes list · R38 HTML weight + LCP · R39 schema + 404 map + monitoring · R40 release, live checks, IndexNow, commits.

---

## 13. Owner file — `docs/seo/OWNER_STEPS_RANK_21NOV.md` (Hinglish)

§1 WhatsApp rating template — exact text to submit (AutoChatix / Meta):
```
Naam:     hmc_rate_ride_v1
Category: Utility   (Meta "Marketing" bana de to bhi theek — approve hone dein)
Language: English (en)

Body:
Namaste {{1}} 🙏

Aapki Hello My Cab ride ({{2}}) poori hui. Kaisi rahi? 10 second me rating dijiye:
{{3}}

Aapki rating se hum service aur behtar karte hain.

Reply STOP to opt out.

Sample:
{{1}} = Rohit
{{2}} = Jaipur to Delhi
{{3}} = https://www.hellomycabs.com/rate/66f1c2a9b4e5d6c7a8b9c0d1.AbCdEfGhIjKlMnOpQrStUv
```
"Approve ho gaya" bolte hi main code mein ek line badal ke push karunga — env kuch nahi.

§2 GBP review link (jab do) + har mahine Google rating/count.
§3 Request Indexing — new URLs (airport, Khatu, guides), 10 per day.
§4 Rich Results Test — 6 URLs.
§5 GBP kit (`GBP_KIT_21NOV.md`) — weekly.
§6 Driver survey — "bhej do" bolo to main `--send` chalaunga; driver WhatsApp template text (if needed).
§7 Fares — `FARE_REVIEW_21NOV.md` bharein; new demand routes list.
§8 Follow-ups not in this task: online payment for airport transfer; Kota students note; Sikar↔Khatu fare; GBP name decision (D5).
§9 Citations (`CITATIONS_21NOV.md`).
§10 Monthly: 12 search screenshots (SERP template).

---

## 14. Final report (Hinglish, to the owner)

Short: what is live (pages, fares, review system state), test counts, live check results, what is waiting on the owner (§1, §2, §6, §7, GBP, citations), numbers before/after (crawl similarity, HTML size, links-in), and next Monday's routine. No claims about rankings — only what was shipped and measured.
