# IMPLEMENTATION PROMPT — hellomycabs.com: get the pages indexed and climb the rankings

Prepared: **13 November 2026, IST**. Implements `docs/seo/PLAN_INDEX_AND_RANK_13NOV.md` (same folder; read §2a "Sudhaar" too).

**Before you start**
- Read **this whole prompt, that whole plan, and these existing docs**:
  - `docs/seo/IMPLEMENTATION_SUMMARY.md`
  - `docs/seo/POST_DEPLOY_CHECKLIST.md`
  - `scripts/seo/weekly.md`
- Then work step by step in the order of §3.
- `AGENTS.md` / `CLAUDE.md`: **this is Next.js 16 — read the relevant guide in `node_modules/next/dist/docs/` before writing any Next code** (metadata, sitemap, route handlers, caching).

**Ledger:** keep `docs/seo/LEDGER_13NOV.md`. For each item record:
- finding (S-number) → evidence (URL, `file:line`, measured value);
- change (`file:line`);
- test or check → result (before → after).

Also record every owner decision used, and every deviation from this prompt.

**This document is not proof that anything is implemented.**
- Every number below was measured on 13 Nov 2026: Search Console exports in `~/Downloads/hellomycabs.com-*-2026-11-13*.zip`, a live crawl of the 145 sitemap URLs, `dig`, and a read of the Amplify app.
- Re-measure before and after.
- **Nobody can guarantee Google indexes a page.** "Done" below means "we did everything in our control, and it is verified".

---

## 0. Findings and what "done" means

| ID | Finding | Done when |
|---|---|---|
| S1 | `hellomycabs.com` (apex) has **no DNS record** and is not on the Amplify domain association (only `www`). `http(s)://hellomycabs.com` fails to connect. Google had 3,476 impressions (3 months) on `http://hellomycabs.com/`. | `curl -sI http://hellomycabs.com/<path>` and `https://hellomycabs.com/<path>` each return one **301** to `https://www.hellomycabs.com/<path>` (path and query kept), valid TLS on the apex, no chain. `scripts/seo/monitor-domains.mjs` reports it green. |
| S2 | 1 of 150 pages indexed: 119 "Discovered – currently not indexed", 27 "Crawled – currently not indexed". | Everything in §3 is done and verified, the sitemaps are re-submitted, and Tier 1 has had indexing requested. Weekly tracking is running (Step 13). Target, not a promise: 30+ indexed by week 6. |
| S3 | Homepage signals are split between `http://hellomycabs.com/` and `https://www.hellomycabs.com/`. | Solved by S1. GSC Pages shows the apex's impressions moving to `https://www…` within 2–4 weeks (record weekly). |
| S4 | `https://api.hellomycabs.com/privacy` (backend plain HTML) is crawled and indexable; `api.` has no `X-Robots-Tag`. | Every `api.hellomycabs.com` response carries `X-Robots-Tag: noindex, nofollow`; `/privacy` there has a canonical to `https://www.hellomycabs.com/privacy`. Backend test proves both. |
| S5 | Route pages are heavily templated: 258 page-pairs > 50% shared text, 1,088 > 40% (5-word shingles). | Tier 1 pages (Step 4) are < 35% similar to every other page by the same measure (script committed). Each has ≥ 300 words that appear on no other page, all from real facts. |
| S6 | Each page is ~600 KB of HTML: ~391 KB inline RSC/script, ~101 KB inline CSS, ~116 KB markup. | Route/city page HTML ≤ 250 KB, with no LCP regression (`npm run audit:speed` before/after). |
| S7 | Demand with no page: "jaipur airport taxi" (pos 2.1, 49 imp), "taxi service in jaipur airport" (1.8, 31), "airport taxi service in jaipur" (2.1, 18), "taxi service in reengus" (16, 49), "taxi in khatu" (16.8, 15), "khatu shyam taxi…". | Pages exist **only if the service and fares are real (D4)**. They are in the sitemap, linked from home, `/routes` and the city page, and pass all SEO checks. |
| S8 | Brand query "hello my cab" sits at average position 3.9. | `Organization`/`TaxiService` entity is complete (logo, `sameAs` verified, contact). GBP is improved per Step 11. Citations are listed (owner). Brand position is tracked weekly. |
| S9 | Positions 1–3 but ~0 clicks for Jaipur–Delhi and Kota queries, because the homepage is shown in place of the unindexed route/city page. | Tier 1 titles/descriptions are revised with `src/content/routes/titles.ts` and the city/home equivalents, within the site rules (30–60 / 120–155 characters, only figures the page shows, no "best/cheapest/no. 1"). CTR is measured after 4 weeks. |
| S10 | Each route page has `Product` + `Offer` markup (owner decision D2, 9 Oct, for "Starting from ₹X"); a city page has `TaxiService` twice. | City page: exactly one `TaxiService` node for the city, plus the site's org node, with distinct `@id`s. `Product`: kept or replaced only per **D8**. Rich Results Test passes for Tier 1. |
| S11 | One flat sitemap; no `lastmod` (removed 18 Oct because build time is not a content date). | A sitemap index with group sitemaps (core, cities, routes, vehicles, guides). `lastmod` only where a real content-revision date exists (never build/render time). All groups "Success" in GSC. |
| S12 | Guides and 6 newer route pairs get the fewest internal links (11–13). | Each indexable page has ≥ 15 internal links in, by the crawl script. Tier 1 is linked from the homepage. |
| S13 | GSC shows 1 "404", 1 "Blocked by robots.txt", 1 "Page with redirect", but the exports list no URLs. | The owner reads the exact URLs in GSC. Each is diagnosed and fixed or explained in the ledger. Nothing is changed on a guess. |

**Already right — do not touch:**
- All 145 URLs return 200, `index, follow`, and a self canonical.
- Titles and descriptions are unique and within limits.
- One H1 per page; breadcrumb / FAQ / TaxiService schema.
- `robots.ts` exact-host production check; HSTS; `www` + HTTPS.
- `inlineCss` (it halved LCP; only trim unused CSS).
- `/rajasthan-tours`, `/char-dham-yatra`, `/photo-credits` stay noindex.
- The 18 Oct recovery work (sitemap without fake dates, review-integrity rules, JSON-LD escaping).

**Out of scope (do not implement):**
- buying links, PBNs, link packages;
- fake reviews or addresses;
- keyword-stuffed thin pages (e.g. a page per Delhi neighbourhood);
- cloaking;
- a Hindi/hreflang site (a separate decision);
- the Ghoomo site;
- the old domain `hellomycab.com` (out of our control; `scripts/seo/old-domain/` exists for the day it redirects).

---

## 1. Repositories, access and hard rules

| Repo | Path | Notes |
|---|---|---|
| Website (Next.js 16.3.4, React 19, Tailwind 4) | `/Users/lalitbansal/Documents/hellomycab/hello-my-cabs-website` | Main HEAD `6c3ee86`; hosted on Amplify app `d2ww272zq9wmdn` (account 848349337949, profile `hmc-prod`), auto-build from GitHub `main` |
| Backend (Node/TS, Express 5) | `/Users/lalitbansal/Documents/hellomycab/hello-my-cab-backend` | Main `dc43cd8`; **a push to `main` auto-deploys to production** (GitHub Actions → EC2 43.204.57.108) |

1. **Git:**
   - Never `git stash`, `git reset --hard`, `git clean` or `git checkout -- <file>`.
   - Keep unrelated changes.
   - In the website repo, these are someone else's work: leave them alone and never commit them: untracked `docs/seo/CHATGPT_HANDOVER.md`, and the deleted `public/img/monument.jpg` and `public/img/open-road.jpg`. In the backend repo: `PLAN_agent_booking_manual_fare_instant_close_refresh_lag.md`, `PROMPT_agent_booking_manual_fare_instant_close_refresh_lag.md`.
2. **Commits:**
   - Commit or push only when the owner asks.
   - No `Co-Authored-By` trailer.
   - A website push to `main` deploys the public site; a backend push deploys the API. Both are production changes.
3. **Production and outside services.** Each of these needs the owner's explicit go-ahead in this session:
   - DNS changes (Hostinger);
   - server config (Caddy on 43.204.57.108, `/etc/caddy/Caddyfile`);
   - Amplify domain or console changes;
   - Search Console / Bing Webmaster / Google Business Profile / Play Console actions;
   - IndexNow submissions;
   - production DB reads.

   Read-only `curl` of the public site and `aws … get/list` on `hmc-prod` are fine. **Never use the `default` AWS profile.**
4. **Secrets:** never print `.env` values, keys or tokens. The IndexNow key is public by design (it is served at `/<key>.txt`).
5. **Truth rules for content** (the site's own, see `src/content/routes/titles.ts` and `src/lib/seo.ts`):
   - every fare, distance, time and claim must be real and shown on the page;
   - no invented stops, tolls, reviews or photos;
   - no "best/cheapest/no. 1";
   - titles 30–60 characters, descriptions 120–155;
   - built with `fitTitle` where the code already does.
6. **Diff hygiene:**
   - Scoped diffs; no repo-wide reformatting; no new packages unless the step says so.
   - Run Prettier/ESLint only on files you touch (`npx eslint <files>`).

---

## 2. Owner decisions (record each answer in the ledger before the step that needs it)

| ID | Question | Default if unanswered |
|---|---|---|
| D1 | Apex redirect: **A** = Hostinger A record `hellomycabs.com → 43.204.57.108` plus a Caddy `redir` block (Caddy issues the certificate); **B** = add the apex to Amplify's domain association with an apex → www 301 and the Hostinger record Amplify asks for. | **A** (fast, one hop, no cross-account dependency). Nothing is changed until the owner says yes to DNS + server. |
| D2 | Switch the Play Console privacy URL to `https://www.hellomycabs.com/privacy`? | Keep the `api.` page live with noindex + canonical; no redirect. |
| D3 | Who supplies per-route facts (pickup points, highway, tolls, food stops, real distance from the usual pickup to the usual drop)? | Use only what the backend's `/public/route-knowledge` gives (`pull-driver-data.mjs`) plus facts the owner writes. Otherwise leave the section out; never fill it. |
| D4 | Jaipur Airport and Khatu Shyam: is the service real, and what are the fares? | No page until both are confirmed. |
| D5 | Noindex the low-demand one-way pairs (no impressions in 90 days and no bookings)? Needs a read-only backend booking report. | Use `thin-routes.mjs` on the GSC export (impressions + similarity), and **print the list only**. Add nothing to `NOINDEX_THIN` without a yes. |
| D6 | GBP: categories, service areas, a Kota profile (only with a real Kota base), the review-request flow. | Owner actions only; the prompt supplies the checklist. |
| D7 | Any further genuine social or citation profiles for `sameAs`? | Add only URLs checked to be this company. |
| D8 | Keep the route `Product` markup (owner D2, 9 Oct) or move the fares to `Service.offers` only? | **Keep** (owner's earlier decision); fix only the duplicate city `TaxiService`. |

---

## 3. Order of work

1. Step 0 — baseline and the measuring scripts.
2. Step 1 — apex 301 (needs D1).
3. Step 2 — `api.` noindex (backend).
4. Step 3 — Search Console / Bing setup (owner) and the S13 URLs.
5. Step 4 — Tier 1 pages: real facts and internal links.
6. Step 5 — Jaipur Airport / Khatu pages (needs D4).
7. Step 6 — sitemap index, groups, `lastmod`, IndexNow.
8. Step 7 — lighter HTML.
9. Step 8 — schema clean-up (D8).
10. Step 9 — Tier 1 titles and descriptions.
11. Step 10 — Tier 2 / thin routes (needs D5).
12. Step 11 — Google Business Profile and citations (owner checklist).
13. Step 12 — links and trust (owner + content).
14. Step 13 — indexing requests and the weekly routine.
15. Step 14 — verification, ledger, release notes.

After every code step:
- `npx tsc --noEmit`;
- `npm run lint` (or ESLint on the changed files, if the repo-wide lint has an old backlog; record which);
- `npm run test:seo`, `npm run test:rating`;
- `npm run build` (the build must pass with the real production env shape; see `amplify.yml`).

Update the ledger.

---

## 4. Step 0 — Baseline (record everything in the ledger)

1. **GSC exports.**
   - Copy the unzipped exports to `docs/seo/evidence/gsc-2026-11-13/`. Strip nothing (no personal data; they are aggregate).
   - Record: Coverage (149 not indexed / 1 indexed), each issue's count, the 27 crawled-not-indexed and 119 discovered URL lists, the top 40 queries and the 4 pages.
2. **Live crawl script.**
   - Add `scripts/seo/crawl-audit.py`, a Python 3 stdlib port of the 13 Nov audit. For every sitemap URL:
     - code, X-Robots-Tag, title / description and their lengths, meta robots, canonical, H1 count, H2 count, word count;
     - JSON-LD `@type` list (and invalid JSON), inbound internal links;
     - HTML bytes split into inline script / inline style / markup;
     - pairwise 5-word-shingle Jaccard over the visible text.
   - It writes `docs/seo/evidence/crawl-<date>.json` and a markdown summary.
   - Run it against production now (the baseline) and again in Step 14.
   - Respect the site: one request at a time, 300 ms apart, a plain User-Agent naming the audit.
3. **Hosts.**
   - Run `node scripts/seo/monitor-domains.mjs` and record its output.
   - Run `dig +short A hellomycabs.com`, `dig +short CNAME www.hellomycabs.com`, and `curl -sI` for every combination of {http, https} × {apex, www} plus `https://api.hellomycabs.com/privacy`.
   - Record: `aws --profile hmc-prod amplify list-domain-associations --app-id d2ww272zq9wmdn` (read-only).
4. **Speed.** Run `npm run audit:speed` (and `audit:lighthouse` if it runs locally) on `/`, `/jaipur-to-delhi-cab`, `/cab-service-in-kota`, `/kota-to-sikar-cab`, `/dzire-taxi`.
5. **Existing reports.**
   - `node scripts/seo/gsc-report.mjs <28-day folder>`
   - `node scripts/seo/title-candidates.mjs <28-day folder>`
   - `node scripts/seo/thin-routes.mjs <28-day folder>`

   Record their outputs; nothing is changed by them.

**Done when:** the ledger has the baseline tables, and the crawl script and its first JSON are committed under `docs/seo/evidence/`.

---

## 5. Step 1 — Apex → www, one 301 (S1, S3) — **needs D1 = yes**

**Route A (default):**
1. On 43.204.57.108, first read `/etc/caddy/Caddyfile` and back it up as `/etc/caddy/Caddyfile.before-apex-<date>`. Keep the existing `api.hellomycabs.com` block byte-for-byte.
2. Add:
   ```
   hellomycabs.com {
       redir https://www.hellomycabs.com{uri} permanent
   }
   ```
   Then `caddy validate --config /etc/caddy/Caddyfile` and `sudo systemctl reload caddy` (reload, not restart).
3. Hostinger DNS (owner, or with their screen-share):
   - `A  @  43.204.57.108`, TTL 300;
   - remove any stale apex `A`/`AAAA`/parking record;
   - **do not touch** the `www` CNAME (`d98w8qhcsn8q2.cloudfront.net`) or `api`.
4. Wait for DNS (`dig +short A hellomycabs.com @8.8.8.8`). Caddy obtains the certificate on the first HTTPS hit; watch `journalctl -u caddy` for the ACME success.
5. Verify, and paste the output:
   ```
   for u in http://hellomycabs.com/ https://hellomycabs.com/ https://hellomycabs.com/kota-to-sikar-cab?x=1; do curl -sI "$u" | sed -n '1p;/^location/Ip'; done
   ```
   Each must be `301` with `location: https://www.hellomycabs.com/…`, the same path and query.
6. Server load: these are a handful of redirects per minute. Note it in the ledger; no change to the API.

**Route B (only if D1 = B):**
- `aws amplify update-domain-association` adding the `""` prefix to the existing association.
- An Amplify redirect rule `https://hellomycabs.com/<*>` → `https://www.hellomycabs.com/<*>` 301.
- Add the DNS record Amplify gives in Hostinger.
- Same verification.

**Done when:** the verification passes, `monitor-domains.mjs` is green, and GSC URL Inspection → "Test live URL" on `http://hellomycabs.com/` shows the redirect (owner).

---

## 6. Step 2 — Keep `api.hellomycabs.com` out of search (S4) — backend

1. `src/app.ts`: early in the middleware chain, before the routes and after `requestLog`, add `res.setHeader('X-Robots-Tag', 'noindex, nofollow')` for every response.
   - It must also be on errors and 404s.
   - Use a tiny named middleware in `src/middleware/noindex.ts`.
2. `src/routes/legal.route.ts`: add `<link rel="canonical" href="https://www.hellomycabs.com/privacy">` (and the terms equivalent if served) in the `<head>`. The page content is unchanged.
3. **Do NOT add `Disallow: /` to the api robots.txt yet.** Google must be able to fetch the page to see the noindex. Add it later only when the URL has left the index (ledger note + reminder in Step 13).
4. Tests, `src/__tests__/apiNoindex.test.ts`:
   - `GET /health`, `GET /privacy` and an unknown path each carry the header;
   - `/privacy` HTML contains the canonical.
5. Run the full backend jest suite. If it overlaps a heavy local job, rerun failures serially (`--runInBand`) before calling them real; machine load caused false timeouts on 12 Nov.
6. **Deploying = pushing backend `main`** (the owner must ask). After deploy:
   - check `curl -sI https://api.hellomycabs.com/privacy | grep -i x-robots-tag`;
   - check `curl -s https://api.hellomycabs.com/health` shows the new commit.

**Done when:** tests pass, and after deploy the header and canonical are live.

---

## 7. Step 3 — Search Console, Bing, and the three unlisted URLs (S13) — owner actions, you guide

1. **GSC Domain property** for `hellomycabs.com` (DNS TXT at Hostinger) if only the URL-prefix property exists. Keep the URL-prefix property too.
2. In GSC → Pages, open "Not found (404)", "Blocked by robots.txt" and "Page with redirect", and **copy the exact URLs** into the ledger. Diagnose each:
   - **404:** an old URL? Map it to its new page only if one truly matches (301 via `next.config.ts` `redirects()`); otherwise let it 404.
   - **Blocked:** which robots? `www` allows everything, so it is probably `api.` or an old host. Explain.
   - **Redirect:** expected if it is `http://www` → `https://www`.
3. **Bing Webmaster Tools:** import from GSC; submit the sitemap index (Step 6).
4. **Done when:** the three URLs are written down with a verdict, and the Domain property and Bing are confirmed by the owner.

---

## 8. Step 4 — Tier 1: make 25 pages clearly the best answer (S2, S5, S9, S12)

**Tier 1 list** (put it in code as `src/lib/tier1.ts`, exported, so the sitemap, homepage links and the crawl script share it):

```
/  /routes
/cab-service-in-kota  /cab-service-in-jaipur  /cab-service-in-delhi  /cab-service-in-sikar
/cab-service-in-agra  /cab-service-in-chandigarh
/jaipur-to-delhi-cab  /delhi-to-jaipur-cab  /jaipur-to-delhi-airport-cab  /delhi-airport-to-jaipur-cab
/kota-to-jaipur-cab  /jaipur-to-kota-cab  /kota-to-delhi-cab  /delhi-to-kota-cab
/jaipur-to-agra-cab  /delhi-to-agra-cab  /delhi-to-chandigarh-cab  /delhi-to-haridwar-cab
/jaipur-to-sikar-cab  /dzire-taxi  /innova-crysta-taxi
(+ /jaipur-airport-taxi, /khatu-shyam-ji-taxi, /jaipur-to-khatu-shyam-cab once Step 5 ships them)
```

**For each Tier 1 route page:**
1. **Driver facts.** Run `node scripts/seo/pull-driver-data.mjs` (it reads the public `/public/route-knowledge` endpoint and applies the approval rules). Review the diff with the owner and `--write` only on a yes.
   - `driver.generated.ts` is empty today. If the endpoint returns nothing, record that, and that D3 is needed.
2. **Hand-written facts (D3)** in `src/content/routes/index.ts` (the hand-written file):
   - usual pickup points, the road (expressway / NH number), toll plazas by name;
   - a food stop drivers use, the time-of-day traffic note, the season note.
   - Only from the owner or desk; cite the source in a comment (`// source: desk, 14 Nov`).
3. **Distance honesty.** `/jaipur-to-delhi-cab` says 306 km; public sources say 269–280 km by NH48 / the expressway.
   - Find where the distance comes from (backend route data or `content/routes`). Show "~X km from <usual pickup> to <usual drop> via <road>", from the backend's real figure. If unsure, show the backend's figure with its basis ("by our route, Jaipur city to central Delhi").
   - **Never pick a number to match competitors.** Ask the owner when the basis is unclear.
4. **City FAQ.** `src/lib/city-faq.ts` / `route-faq.ts`: each Tier 1 page gets ≥ 3 questions that appear on no other page, answered from real rules and fares. Example for Kota: "Kota Junction se Jaipur airport subah ki flight ke liye kab niklein?", answered from the real drive time.
5. **Internal links.**
   - Homepage: a "Popular routes & cities" block linking every Tier 1 page with plain descriptive anchors ("Kota taxi service", "Jaipur to Delhi cab").
   - `/routes`: Tier 1 first in each group.
   - Every city page links its Tier 1 routes; every Tier 1 route links its reverse and its two nearest Tier 1 siblings.
   - Use the existing components (`RouteDetail`, the city page lists). Do not add a site-wide footer mega-menu.
6. **Check:** the Step 0 crawl script on a local production build (`npm run build && npm start` with production env shape), Tier 1 only. Each Tier 1 page is < 35% similar to every other page and has ≥ 300 unique words. Fix with real content, never with filler.

**Done when:** the Tier 1 checks pass, every fact has a source comment, and the ledger lists each page's similarity before → after.

---

## 9. Step 5 — Jaipur Airport and Khatu Shyam pages (S7) — **needs D4**

1. **Find how a page can exist.** City pages come from `citiesWithPages` (backend priced routes, `MIN_CITY_ROUTES = 3`); `DELHI_AIRPORT` is a backend city key with its own text in `src/content/cities/index.ts`.
   - Check the backend for `JAIPUR_AIRPORT`, `KHATU`, `REENGUS` keys: `src/constants/cityAliases.ts`, `whatsappCities.ts`, and the public route list the site reads.
   - **Preferred:** the owner adds the city keys and real fares in the admin (or backend config), and the site's existing city/route machinery builds the pages (`cab-service-in-jaipur-airport`, `jaipur-to-khatu-shyam-cab`, …) with booking working end to end.
   - Then add `/jaipur-airport-taxi` and `/khatu-shyam-ji-taxi` as **301s** (`next.config.ts` `redirects()`) to the generated slugs, **or** give the generated pages those slugs if `src/lib/slug.ts` allows an override. Pick one URL per page; never two live copies.
   - **Fallback (only if the owner declines backend keys):** a hand-written page like `/luxury-car` (`src/app/<slug>/page.tsx`) with real fares from the owner, wired to the booking widget.
2. **Content (real only):**
   - **Jaipur Airport:** terminals (T1/T2), meeting point, flight-delay rule (from the real policy), fixed fares to city areas and outstation (backend), 24×7.
   - **Khatu Shyam:** route Jaipur → Chomu → Ringas/Reengus → Khatu (distance from the backend's route), Reengus station pickup, same-day round trip and Salasar Balaji combination **only if offered**, mela/Ekadashi crowd note.
3. Text in `src/content/cities/index.ts` (`arrival` / `drop`) in the existing voice. FAQ entries. Schema via the existing builders (`taxiServiceSchema`, breadcrumb, FAQ).
4. Add them to Tier 1 (`src/lib/tier1.ts`), the sitemap group, homepage links, `/routes`, and the Jaipur/Sikar city pages.
5. **Done when:** pages render with real fares, booking reaches the fare step in a read-only browser check (`audit:seo:browser` style; no booking created), and the SEO checks pass. Or, without D4, the ledger says "not built — awaiting D4".

---

## 10. Step 6 — Sitemap index, groups, honest `lastmod`, IndexNow (S11, S12)

1. **Read the Next 16 docs for `generateSitemaps` / sitemap index** in `node_modules/next/dist/docs/` first.
   - Split `src/app/sitemap.ts` into groups: `core` (home, routes, luxury, about, contact, policies, fares-explained), `cities`, `routes` (one-way, airport, round-trip, route-car), `vehicles`, `guides`.
   - `robots.ts` must point at the index URL that Next produces. Verify the exact paths in a local build, and that `/sitemap.xml` still resolves (keep it as the index, or keep the old URL working, because GSC already has it).
   - Keep every existing exclusion: held routes, thin routes, sample packages, noindex pages.
2. **`lastmod`:**
   - Guides keep their explicit dates.
   - Route and city pages get one **only** from a real revision date: the date their hand-written content entry was last edited (add a `revised: 'YYYY-MM-DD'` field when you edit an entry in Step 4/5), or a fare-change date if the backend exposes one.
   - Otherwise omit. Never `new Date()`, build or render time.
3. **IndexNow:** after the owner approves a deploy, run `node scripts/seo/indexnow.mjs --dry-run`, then (with a yes) without `--dry-run`. It already verifies the live key file first. Extend it to read the sitemap **index** (all group files).
4. **Inbound links:** re-run the crawl script. Every indexable page must have ≥ 15 internal links in; fix the guides and the newer pairs (Jodhpur, Udaipur, Ludhiana, Mohali, Dehradun) through their city pages and related-route lists.
5. **Tests:** extend `scripts/test/seo-recovery.mjs` with:
   - the index lists all groups;
   - no URL in two groups;
   - no held/thin/noindex URL in any group;
   - `lastmod` absent or equal to a recorded revision date.

**Done when:** the tests pass, a local build serves the index and groups, and (after deploy) each group shows "Success" in GSC (owner).

---

## 11. Step 7 — Lighter HTML (S6)

1. Measure what fills the ~391 KB inline script on `/kota-to-sikar-cab`. In a local production build, save the HTML and list the largest `self.__next_f.push` chunks; identify which client component's props they are (e.g. the booking widget receiving every city or every route fare, or `VehicleChoice` receiving the whole fleet).
2. Keep that data on the server. Pass the client component only what the page needs (this route's fares, this route's vehicles). Where a component needs a large list only after interaction (city search), fetch it from an existing API route when the user opens it. Booking behaviour must not change.
3. CSS: confirm Tailwind 4's content detection covers only `src/`. Remove styles nothing uses only with a check that every page still renders the same (screenshot diff via `npm run audit:shots`, before and after). **Keep `inlineCss: true`.**
4. Check the Amplify artifact size printed by the build (`du -sh .next`) stays under its 220 MB limit.
5. **Done when:** route/city HTML ≤ 250 KB; `audit:speed` LCP is the same or better; screenshots are unchanged; the booking fare step works in the browser check.

---

## 12. Step 8 — Schema clean-up (S10, S8)

1. City page: find why `TaxiService` appears twice (site org node `@type: TaxiService` when `company.postalAddress` exists, plus `taxiServiceSchema` for the city). Make them distinct, linked nodes:
   - the org: `@id ORG_ID`;
   - the city service: `@id …#service`, `provider: {@id: ORG_ID}`.
   - If both are `TaxiService` with different `@id`s, that is valid. Confirm with the Rich Results Test / Schema validator, and change only if the validator flags a problem.
2. `Product`: per **D8** (default keep). If D8 says move: delete the `Product` node in `src/lib/schema.tsx` (around line 221), and put the `AggregateOffer` on the `Service` node (`offers`). The rating sits only where the page shows its rating block (existing rule).
3. `Organization`: complete it, without inventing anything:
   - `logo` (the site's `/logo.png`), `url`, `alternateName` (`company.alternateNames`);
   - `contactPoint` (`company.phone`, `contactType: customer service`, `areaServed: IN`, `availableLanguage: ["en","hi"]`);
   - `sameAs` from `company.sameAs`; add new profiles only under D7, after checking each.
4. **Done when:** Rich Results Test and the validator pass for `/`, `/routes`, one city, one route and one vehicle page (paste the summaries); `test:seo` passes.

---

## 13. Step 9 — Tier 1 titles and descriptions (S9)

1. Use the existing machinery:
   - route pages: `src/content/routes/titles.ts` overrides (`{price}` placeholder), as its header explains;
   - city, vehicle and home pages: where their metadata is built (`[slug]/page.tsx` `generateMetadata`, `src/app/page.tsx`), using `fitTitle`.
2. Write the drafts below truthfully (the price must be the page's own lowest fare via `{price}`). Each entry gets a `note` saying which GSC queries it answers.

   | Page | Draft title | Draft description idea |
   |---|---|---|
   | `/` | One Way Taxi & Outstation Cab — Jaipur, Delhi, Kota \| Hello My Cab (trim to ≤ 60 with `fitTitle` tails) | one way + outstation, Jaipur–Delhi from {price}, Kota, Agra, Chandigarh, fixed fare, no return charge, 24×7 |
   | `/cab-service-in-kota` | Kota Taxi Service — One Way Cab from {price}, 24×7 | Kota one way to Jaipur / Ajmer / Sikar from real fares, fixed before you leave |
   | `/jaipur-to-delhi-cab` | Jaipur to Delhi Cab {price} — One Way Taxi, No Return Fare | real km + basis, hours, GST/toll rule, small advance |
   | `/delhi-to-jaipur-cab` | Delhi to Jaipur Cab {price} — One Way Taxi, Fixed Fare | same pattern |
   | `/cab-service-in-jaipur` | Taxi Service in Jaipur — One Way & Outstation Cab \| 24×7 | real top routes + prices |
   | `/jaipur-airport-taxi` (if built) | Jaipur Airport Taxi — Pickup & Drop, Fixed Fare 24×7 | terminals, real fares |
   | `/khatu-shyam-ji-taxi` (if built) | Khatu Shyam Ji Taxi from Jaipur & Reengus — One Way Fare | real route and fare |

3. Lengths 30–60 / 120–155; no "best/cheapest/no. 1"; nothing the page does not show. `test:seo` must check these.
4. **Done when:** the Tier 1 metadata is updated, checks pass, and the ledger lists old → new for each. CTR is measured in Step 13 after 4 weeks; if the default did better, take the override out (the file's own rule).

---

## 14. Step 10 — Tier 2 / thin routes (S5) — **needs D5**

1. Run `node scripts/seo/thin-routes.mjs <28-day GSC folder>` (impressions 0 **and** ≥ 80% similar), and, with D5 approval, a read-only backend report of bookings per route for 90 days.
2. A candidate = no impressions **and** no bookings **and** not in Tier 1. Print the list for the owner.
3. **Only with a yes:** add the pairs to `NOINDEX_THIN` in `src/lib/held-routes.ts`. They leave the sitemap automatically and render `noindex, follow`, still bookable and linked.
4. Ledger note: re-check in 6–8 weeks, then bring them back group by group with real facts (Step 4 method).
5. **Never delete or redirect** these pages.

---

## 15. Step 11 — Google Business Profile and citations (S8) — owner checklist (you prepare, they act)

Write `docs/seo/GBP_CHECKLIST.md` with exact steps.

**The existing profile:** "Hello My Cab -Taxi service in jaipur", 4.7★, 156 reviews.
1. Primary category "Taxi service"; secondary only if true ("Car rental agency", "Airport shuttle service").
2. Service areas: cities actually served (Jaipur, Kota, Delhi, Sikar, Ajmer, Agra…), up to 20, never a whole state.
3. 24×7 hours; services with real "from" fares; booking link `https://www.hellomycabs.com`; photos (cars, drivers with consent, office).
4. A weekly post: a route offer, a Khatu mela note, airport.
5. Q&A seeded with real questions.
6. **Reviews:** a review link, sent after completed trips by the existing customer messages. The owner decides the channel. **Never offer anything for a review; never write one.**
7. A Kota profile only with a real staffed address there.
8. **Citations (same name, address, phone everywhere, matching `company.ts` word for word):** Justdial, Sulekha, Bing Places, Apple Business Connect, Facebook page, Instagram bio link, YouTube. Record each URL; add to `sameAs` under D7 once verified.
9. **Play Store listing:** website field `https://www.hellomycabs.com`.

---

## 16. Step 12 — Links and trust (S8) — ongoing, owner + content

1. Write `docs/seo/LINK_PLAN.md`, a list of real, relevant link targets with an outreach line each:
   - local news/blogs (Kota parents' travel, Khatu mela);
   - hotels and dharamshalas (Khatu, Haridwar) for partner pages;
   - corporate and coaching tie-ups;
   - travel bloggers who used the service.
2. **Guides that deserve links** (real facts only, through the existing `src/content/guides` system with honest `revised` dates), for example:
   - "Jaipur se Khatu Shyam kaise jaayein" (only with D4);
   - "Kota se Jaipur airport — subah ki flight";
   - "Delhi–Jaipur expressway: toll aur samay" (real tolls from D3).
3. **Forbidden:** bought links, PBNs, link packages, comment spam, automated directory blasts.

---

## 17. Step 13 — Indexing requests and the weekly routine (S2)

1. After the Step 1 + 2 deploys (owner), GSC URL Inspection → "Request indexing":
   - `/` and `/routes` first;
   - then Tier 1 in this order: Kota, Jaipur–Delhi pair, Jaipur Airport, Khatu, the rest;
   - about 10 a day, Google's limit.
   - Log each request date in the ledger.
2. GSC Pages → "Discovered" and "Crawled – not indexed" → **Validate fix** after Steps 4–6 are live.
3. **Weekly (Monday), following `scripts/seo/weekly.md`:**
   - export 28 days, run `gsc-report.mjs` and `title-candidates.mjs`;
   - add one line to `docs/seo/WEEKLY.md`: indexed count, Tier 1 indexed, top-10 query positions, clicks, CTR, brand position.
   - Extend `weekly.md` with the Tier 1 and indexed-count lines.
4. A Tier 1 page still "Crawled – not indexed" after 4 weeks: rewrite with more real facts (re-check similarity), strengthen its links, request again.
5. **Reminder for later:** once `api.hellomycabs.com/privacy` has left the index, add `Disallow: /` to the API's robots.

---

## 18. Step 14 — Verification, ledger, release notes

### Commands (paste results)
**Website:**
- `npx tsc --noEmit`
- `npm run lint` (or ESLint on changed files; record the repo-wide backlog if any)
- `npm run test:seo`
- `npm run test:rating`
- `npm run build` (record `du -sh .next` and the build's page counts)
- `bash scripts/seo-check.sh http://localhost:3100` against a local `npm start`
- the crawl script against the local build
- `npm run audit:speed`, `npm run audit:shots` (before/after), `npm run audit:seo:browser` (read-only)
- `git diff --check`

**Backend (Step 2):** `npm run build`, `npx tsc --noEmit`, ESLint on changed files, jest (rerun failures serially).

**After the owner-approved deploys:** `bash scripts/seo/after-deploy.sh`, `node scripts/seo/monitor-domains.mjs`, the crawl script against production, and the curl checks of Steps 1–2.

### Targets (before → after)
| Measure | Before (13 Nov) | After |
|---|---|---|
| Apex `http(s)://hellomycabs.com` | connection fails | one 301 to `https://www`, path kept |
| `api.` X-Robots-Tag | none | `noindex, nofollow` |
| Indexed pages (GSC) | 1 | tracked weekly; target 10+ by week 3, 30+ by week 6 (not guaranteed) |
| Tier 1 max similarity | up to 0.64 | < 0.35 |
| Route HTML size | ~608 KB | ≤ 250 KB |
| Pages with < 15 inbound links | 15+ | 0 |
| Sitemap | 1 flat file, no lastmod | index + 5 groups, honest lastmod |
| "hello my cab" position | 3.9 | tracked; target ≤ 2 |
| Kota / Jaipur-airport queries landing on | homepage | their own page |

### Ledger and notes
- **Ledger:** every S-number with evidence → change → check → before/after; D1–D8 answers; deviations; "not done — waiting for D#" items.
- **Release notes for the owner (Hinglish, short):**
  - kya badla;
  - aapke kaam (DNS, GSC requests, GBP, reviews, Play Console privacy URL);
  - kab kya dekhein (hafta 1/3/6).

---

## 19. Final checklist (every box needs evidence in the ledger)
- [ ] Step 0: GSC evidence saved; crawl script and baseline JSON committed; hosts, speed and existing reports recorded.
- [ ] Step 1: apex 301 live and verified (or "waiting for D1").
- [ ] Step 2: `api.` noindex + canonical, tested and live (or waiting for the deploy go-ahead).
- [ ] Step 3: Domain property, Bing, and the 3 GSC URLs with verdicts.
- [ ] Step 4: Tier 1 file; real facts with sources; similarity < 35%; ≥ 300 unique words; homepage and city links.
- [ ] Step 5: Jaipur Airport / Khatu pages live with real fares (or "waiting for D4").
- [ ] Step 6: sitemap index and groups; honest lastmod; IndexNow extended; tests; inbound ≥ 15.
- [ ] Step 7: HTML ≤ 250 KB; LCP not worse; screenshots unchanged; booking works.
- [ ] Step 8: city schema valid; Product per D8; Organization complete; validators pass.
- [ ] Step 9: Tier 1 titles/descriptions old → new, within the rules.
- [ ] Step 10: thin list printed; `NOINDEX_THIN` changed only with a yes.
- [ ] Step 11: `GBP_CHECKLIST.md` written; owner progress noted.
- [ ] Step 12: `LINK_PLAN.md` written; guides only with real facts.
- [ ] Step 13: request log; weekly routine running; api robots reminder.
- [ ] Step 14: all commands run and results pasted; targets table filled; release notes written.
- [ ] Nothing committed, pushed or deployed, no DNS, server, GSC, GBP or Play change, and no IndexNow submission without the owner's explicit go-ahead. No `Co-Authored-By`. The other people's files are untouched.
