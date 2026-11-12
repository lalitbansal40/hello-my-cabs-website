# Ledger — indexing and ranking work (13 Nov 2026)

Implements `docs/seo/PROMPT_INDEX_AND_RANK_13NOV.md` / `PLAN_INDEX_AND_RANK_13NOV.md`.

**Repos:**
- website: main `6c3ee86` → this commit;
- backend: `dc43cd8` → `210522d` (pushed, deployed, live).

**Owner decisions** (asked 13 Nov, answered the same session):

| ID | Answer |
|---|---|
| D1 | **Yes: route A.** Caddy redirect added on the API server. The Hostinger DNS record is the owner's step. |
| D2 | Not asked. Default: the `api.` privacy page stays live with noindex + canonical; the owner may move the Play Console URL. |
| D3 | Not supplied. No route facts written; driver data endpoint returns none. |
| D4 | **No pages yet** (Jaipur Airport / Khatu) until fares and service are confirmed. |
| D5 | **List only.** `NOINDEX_THIN` unchanged. |
| D6 / D7 | Owner checklists written (`GBP_CHECKLIST.md`); `sameAs` unchanged. |
| D8 | **Keep `Product`** markup. |
| D9 (new) | HTML weight is the inlined CSS copied three times (see Step 7). Keep `inlineCss` (owner's 3 Oct trade-off) or trial it off with a measured LCP. Default: keep. |

## Step 0 — Baseline
- **GSC exports** saved: `evidence/gsc-2026-11-13/` (coverage summary, five drill-downs, performance 24 h / 7 d / 28 d / 3 m).
  - 1 indexed / 149 not.
  - 119 "Discovered – currently not indexed", 27 "Crawled – currently not indexed", 1 × 404, 1 × robots-blocked, 1 × redirect. The last three exports list no URLs.
- **New `scripts/seo/crawl-audit.py`** (Python stdlib; follows sitemap indexes; `--only`, `--label`). Baseline run: `evidence/crawl-2026-11-13-baseline.{json,md}`.
  - 145/145 pages 200, `index, follow`, self-canonical; titles 31–60, descriptions 126–155, all unique; one H1 each; 0 invalid JSON-LD.
  - HTML median 607,896 bytes (inline script median 391,472); words median 2,016.
  - 19 pages with < 15 internal links in.
  - 5-word-shingle similarity: 9 pairs > 0.6, 168 > 0.5, 2,995 > 0.35.
- **Hosts:** `evidence/hosts-2026-11-13-baseline.md`.
  - Apex: **no A record**; http and https both fail to connect.
  - `www` CNAME `d98w8qhcsn8q2.cloudfront.net` → 200.
  - `http://www` → 301 https.
  - `api.…/privacy` → 200 with no X-Robots-Tag.
  - Amplify `d2ww272zq9wmdn`: domain `hellomycabs.com`, sub-domain `www` only.
- **Domains** (`monitor-domains.mjs` → `evidence/domains-2026-11-13.md`): `hellomycab.com` (the old business site, not ours) still runs as a separate site with 117 sitemap pages and the title "Jaipur Taxi Service…". It competes for the brand query. Nothing to change here; `scripts/seo/old-domain/` is ready for the day it redirects.
- **Speed (live, `audit:speed`)** → `evidence/speed-2026-11-13-baseline.md`: every mobile page within budget (LCP 0.86–0.90 s, CLS ≤ 0.001, TBT ≤ 14 ms).
- **Existing reports on the 28-day export:**
  - `gsc-report` (58 clicks, 4,258 impressions, 1.36%; Google showed 2 of 145 pages);
  - `title-candidates` (0 candidates: no route page has impressions);
  - `thin-routes` (87 candidates, every one at 0 impressions because no route page is indexed).
  - Saved under `evidence/`.

## Step 1 — Apex → www (S1, S3) — server done; DNS is the owner's
- On 43.204.57.108: backup `/etc/caddy/Caddyfile.before-apex-20261113`. Added
  ```
  http://hellomycabs.com, https://hellomycabs.com {
      redir https://www.hellomycabs.com{uri} permanent
  }
  ```
  `caddy validate` → "Valid configuration"; `systemctl reload caddy` → active. The `api.hellomycabs.com` block is unchanged, and `https://api.hellomycabs.com/health` → 200 after the reload.
- **Checked on the server** (DNS not yet pointing): `curl -H 'Host: hellomycabs.com' http://127.0.0.1/kota-to-sikar-cab?x=1` → **301** `https://www.hellomycabs.com/kota-to-sikar-cab?x=1` (path and query kept, one hop).
- **Owner step:** Hostinger → DNS → `A  @  43.204.57.108`, TTL 300. Remove any other apex A/AAAA or parking record. **Do not touch** `www` or `api`.
  - Then: `dig +short A hellomycabs.com @8.8.8.8`, and `sudo systemctl reload caddy` on the server, so Caddy asks for the certificate at once.
  - Then the curl checks of prompt §5.5, and `node scripts/seo/monitor-domains.mjs`.
  - Caddy cannot get the apex certificate until the record exists; until then the API is unaffected.

## Step 2 — `api.hellomycabs.com` out of search (S4) — done, live
- **Backend `210522d`:**
  - `src/middleware/noindex.ts`, set first in `src/app.ts`: every response carries `X-Robots-Tag: noindex, nofollow`.
  - `src/routes/legal.route.ts`: `<meta name="robots" content="noindex, follow">`, and on `/privacy` `<link rel="canonical" href="https://www.hellomycabs.com/privacy">`. `/account-deletion` has no website twin, so it has no canonical.
- **Tests:** `src/__tests__/apiNoindex.test.ts` (7). Header on `/health`, `/privacy`, `/account-deletion`, unknown and unknown-API paths; the privacy canonical + meta; account-deletion has no canonical. With `health` and `link`: 15/15.
- **Full backend suite:**
  - 165/183 suites on the parallel run; the 18 failures timed out while the machine was busy.
  - Serial rerun: 17/18 pass. `diaryDetail` (2) fails only outside 09:00–19:00 IST (support hours; run at 02:18 IST), the same known time-of-day test.
  - Build and changed-file ESLint are clean.
- **Live after deploy** (02:23 IST): health `commit 210522d`, db connected; `/privacy` → `x-robots-tag: noindex, nofollow`, meta robots and canonical present; `/health` header present.
- **Reminder:** add `Disallow: /` to the API's robots only after Search Console shows `api.…/privacy` gone.

## Step 3 — Search Console / Bing / the 3 unlisted URLs — owner
Not done in this session (Google and Bing account actions). Instructions are in the release notes below and prompt §7. The 404 / robots-blocked / redirect URLs must be read in GSC; the exports carry no list.

## Step 4 — Tier 1 (S2, S5, S9, S12) — partly done
- **New `src/lib/tier1.ts`:** Tier 1 cities (Kota, Jaipur, Delhi, Sikar, Agra, Chandigarh), 13 routes and 2 cars, with GSC reasons. `tier1Links()` returns only pages that exist (listed routes, cities with a page, cars with a page).
- **Home page** (`src/app/page.tsx`): a "Searched most" link block under the route cards. Cities, routes and cars, labelled with the words the searches use ("Taxi service in Kota", "Kota to Jaipur cab"). It is a plain `nav`.
  - Before, the Kota routes, Jaipur–Sikar, Delhi-airport → Jaipur and the Sikar city page were not linked from the home page at all. Now they are.
  - Screenshots checked at 390 px and 1440 px.
- **City pages** (`CityPage.tsx`): "{City} by road: the guides" links the published road guides that start or end in that city (6 live guides; drafts excluded). Before, a guide was linked only from its own route pages and `/guides`.
- **Inbound links (local build, `evidence/crawl-2026-11-13-local-final.md`):**
  - pages with < 15 links in: **19 → 15**; road guides 11 → 13;
  - Tier 1 pages each +1 (from the home page; Kota routes 21–30 → 22–31).
  - The six Ludhiana / Mohali / Dehradun pairs stay at 12: those pickups have no city page, and every Delhi route page already links them.
- **Deviation:** an "Other routes to {B}" block on route pages was built and **removed**. The existing "{A} to {B}, in context" block already links every route into the drop city with its fare; the crawl showed 0 new links (`evidence/crawl-2026-11-13-local-after.*` is that attempt).
- **Not done — waiting for D3:**
  - Per-route facts: pickup points, road, tolls, stops, a real distance basis (Jaipur–Delhi shows 306 km against 269–280 km in public sources; the basis needs confirming).
  - Unique FAQ beyond what the data supports.
  - So the Tier 1 similarity target (< 0.35) is **not met**: Tier 1 pairs still reach 0.45–0.62. `pull-driver-data.mjs` returns 0 roads with approved driver data.
  - No filler was written.

## Step 5 — Jaipur Airport / Khatu Shyam — not built (D4 = "abhi nahi")

## Step 6 — Group sitemaps (S11)
- **Deviation from the prompt's sitemap index:** Next 16 builds no index from `generateSitemaps`. Turning `/sitemap.xml` into an index would also break the ten scripts and tests that read it as a list, and the URL Search Console already holds. So:
  - `/sitemap.xml` is unchanged (145 URLs). Its logic moved to `src/lib/sitemap-entries.ts`, which tags each entry with a group.
  - New `src/app/sitemaps/sitemap.ts` (`generateSitemaps`) serves `/sitemaps/sitemap/{core,cities,routes,vehicles,guides}.xml`, with 9 / 10 / 109 / 8 / 9 = 145 URLs. Each URL is in exactly one group.
  - `robots.ts` lists the full sitemap first, then the five groups.
  - A URL in both the full list and its group is allowed by the protocol, and gives Search Console per-group indexed counts.
- **`lastmod`:** unchanged rule. Only guides carry their own `updated` date; no build or render dates anywhere (tested).
- **IndexNow:** `scripts/seo/indexnow.mjs` already reads `/sitemap.xml` (the full list), so no change was needed. Submitting is an owner go-ahead (release notes).
- **Tests** (`scripts/test/seo-recovery.mjs`): robots lists the six sitemaps; new `sitemap-groups` (exact split, no duplicates, right group per kind, no invented dates); new `tier1-links`. **22/22 pass** (20 before).

## Step 7 — HTML weight (S6) — measured, not changed (D9)
- Route page `kota-to-sikar-cab`: 607,829 bytes = 100,736 inline `<style>` + 391,391 inline script + 115,702 markup.
- The inline script is the RSC payload (353,020 decoded). **It carries the same 96,969-byte stylesheet twice.** That is `experimental.inlineCss`, which copies the CSS into the HTML, the RSC payload and the prefetch data, as `next.config.ts` already says.
- No route or city list is in the client payload (`"pickup"` appears once on the route page, 0 on the home page).
- The stylesheet is the whole site's Tailwind output (949 class selectors). It cannot be cut per page without design risk.
- Speed is within budget (LCP ≤ 0.90 s mobile). The target ≤ 250 KB is therefore **not met**. Reaching it means turning `inlineCss` off, which cost 0.8 s of LCP on 3 Oct.
- **D9:** keep (default), or trial with `audit:speed` before and after.
- **Build artifact:** 114.3 MiB Amplify-equivalent (excluding `.next/cache`, `.next/dev`, `*.map`), against the 220 MB limit (110.1 MiB on 18 Oct).

## Step 8 — Schema (S10) — checked, no change
- City page: two `TaxiService` nodes with distinct `@id`s: the organisation (`/#organization`: logo, contactPoint, address, `sameAs`) and the city service (`…#service`, `provider` → org). Valid as linked nodes; no change.
- `Product` kept (D8). `test:rating` 10/10.

## Step 9 — Titles (S9)
- **Home:**
  - title "Hello My Cab — One Way Taxi & Outstation Cab Booking" (52) → "Hello My Cab — One Way Taxi Jaipur, Delhi, Kota & More" (54);
  - description now names Kota and 24×7 (154).
  - Reason: the home page is the only indexed page, shown at positions 1–3 for "jaipur delhi cab" and "one way taxi service in kota" with ~0 clicks, and its title named neither city. Brand kept first (brand query). 24×7 is `company.hours`.
- **Route and city titles:** unchanged. No route page has impressions yet (`title-candidates`: 0), so there is no evidence to write `titles.ts` overrides from (the file's own rule). Re-run weekly once they are indexed.

## Step 10 — Thin routes — list only (D5)
`evidence/thin-routes-2026-11-13.md`: 87 candidates. They are candidates only because no route page has been indexed yet, so 0 impressions says nothing. `NOINDEX_THIN` is unchanged. Re-run after indexing starts.

## Step 11–12 — Owner documents
- `docs/seo/GBP_CHECKLIST.md`: the existing profile, categories, service areas, posts, the review rule, a Kota profile only with a real address, a citations table, Play Store.
- `docs/seo/LINK_PLAN.md`: real link targets with an outreach line, what is forbidden, and guides that earn links (with their D3/D4 conditions).

## Step 13 — Weekly
- `scripts/seo/weekly.md` §7 (indexing, Tier 1, per-group sitemaps, domains).
- `docs/seo/WEEKLY.md` with the 13 Nov baseline line.

## Step 14 — Verification (website)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | clean |
| `npm run test:seo` | 22 passed |
| `npm run test:rating` | 10 passed |
| `npm run build` (production env shape) | ok; group sitemaps prerendered |
| Local crawl (`crawl-2026-11-13-local-final`) | 145/145 200, all title/description/H1/canonical/schema checks as baseline; < 15 inbound 19 → 15 |
| `scripts/seo-check.sh` local vs production | **identical results**. Gated checks 3 (near-duplicates), 4 (words per tier) and 11 (keyword phrase > 4 times on 12 route pages) fail on production too; they predate this work. Internal links 6,540 → 6,559. |
| Screenshots (390 / 1440) | home "Searched most" and city "by road" blocks render correctly |
| `git diff --check` | clean |

### Targets
| Measure | Before | After |
|---|---|---|
| Apex | connection fails | Caddy 301 ready (verified on server); **live once the owner adds the DNS record** |
| `api.` X-Robots-Tag | none | `noindex, nofollow` (live) |
| api `/privacy` canonical | none | `https://www.hellomycabs.com/privacy` (live) |
| Sitemaps | 1 flat | flat + 5 groups |
| Pages < 15 inbound | 19 | 15 |
| Tier 1 linked from home | 14 of 21 (Sikar city, Delhi-airport→Jaipur, the four Kota routes and Jaipur→Sikar were not) | 21 of 21 |
| Tier 1 max similarity | up to 0.62 | unchanged: needs D3 facts |
| Route HTML | 608 KB | unchanged: D9 |
| Indexed (GSC) | 1 | tracked weekly from here |

## Release notes for the owner (Hinglish)
- **Kya badla:**
  - API (`api.hellomycabs.com`) ab Google ko "index mat karo" bolta hai, aur privacy page asli website ke privacy page ki taraf ishara karta hai. Ye live hai.
  - Bina-www domain ka redirect server par taiyar hai.
  - Homepage par "Searched most" links ka block, jisme Kota, Jaipur–Delhi waghera sab hain.
  - City pages par road guides ke links.
  - Sitemap ab 5 hisson mein bhi hai.
  - Homepage ka title ab Jaipur, Delhi aur Kota bolta hai.
- **Aapke kaam:**
  1. Hostinger DNS: `A  @  43.204.57.108`. Phir mujhe batayein; main Caddy reload karke jaanch karunga.
  2. Search Console:
     - Domain property banayein;
     - Sitemaps mein `/sitemap.xml` aur paanch `/sitemaps/sitemap/*.xml` submit karein;
     - "Not found (404)", "Blocked by robots" aur "Page with redirect" ke exact URL mujhe bhejein;
     - deploy ke baad `/`, `/routes`, phir Kota, Jaipur–Delhi waghera Tier 1 pages "Request indexing" (din mein ~10).
  3. Bing Webmaster: GSC se import.
  4. `GBP_CHECKLIST.md`: categories, service areas, har hafte post, review link.
  5. Route facts (D3): har Tier 1 route ke pickup points, highway, toll plaza, khane ka ruka, aur Jaipur–Delhi ki asli doori kis point se kis point tak.
  6. Jaipur Airport aur Khatu ke fares (D4), jab taiyar hon.
  7. IndexNow submit karne ki haan.
- **Kab kya dekhein:**
  - hafta 1: apex redirect, sitemaps "Success";
  - hafta 3: Tier 1 mein se 10+ crawl / indexed;
  - hafta 6: 30+ indexed, Kota aur Jaipur–Delhi par apna page dikhe.
  - Guarantee koi nahi; har hafte `WEEKLY.md` mein line.
