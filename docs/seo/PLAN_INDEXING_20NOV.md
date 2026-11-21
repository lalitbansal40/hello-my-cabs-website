# Plan — hellomycabs.com ke saare pages index karwana (20 Nov 2026)

Status: **plan ready, code change abhi nahi hua.** 13 Nov ke kaam (`LEDGER_13NOV.md`) ke aage ka plan hai — jo ho chuka hai wo dobara nahi kiya jayega.

Repos: website `hello-my-cabs-website` (`e1c997c`), backend `hello-my-cab-backend` (`dd3da80`).

---

## 1. Abhi ki haalat (20 Nov exports + live check)

### Search Console (data 16 Nov tak)
| | Pages |
|---|---:|
| Known | 150 |
| **Indexed** | **1** |
| Discovered – currently not indexed (kabhi crawl hi nahi hue) | 119 |
| Crawled – currently not indexed | 27 |
| Page with redirect — `https://hellomycabs.com/` | 1 |
| 404 — `https://api.hellomycabs.com/` | 1 |
| Blocked by robots.txt — `http://www.hellomycabs.com/` (June ka crawl) | 1 |

Performance (3 mahine): **98 clicks / 6,424 impressions**. Lagbhag sab homepage par:
`http://hellomycabs.com/` (bina www) **4,334 impressions / 61 clicks**, `https://www.hellomycabs.com/` 2,202 / 38. Koi bhi route/city page Google mein nahi aata.

Top queries jahan homepage position 1–3 par hai par click nahi: "delhi jaipur cab" (2.1, 131 impr, 0 click), "jaipur delhi cab" (1.7, 123, 4), "one way taxi service in kota" (2.4, 105, 0), "jaipur airport taxi" (2.4, 64, 0), "taxi service in jaipur airport" (1.8, 45, 0). Kota queries kul ~600 impressions.

### Live check (20 Nov, Googlebot user-agent)
- Saare check kiye pages: **200, `index, follow`, self-canonical www** — technical setup sahi hai (13 Nov ka audit bhi yahi kehta hai: 145/145).
- HTML **400–700 KB** per page (route page ~610–700 KB; inline CSS + RSC payload).
- Route page cache-miss par **TTFB 0.75–0.85 s** (on-demand render); city/vehicle pages 0.13–0.18 s (pre-built).
- **Apex `hellomycabs.com` ka DNS mein koi A record nahi** — http aur https dono nahi khulte. Caddy redirect server par 13 Nov se tayyar hai.
- `www` → 200, `http://www` → 301 https, robots.txt + 6 sitemaps live (145 URLs).

### Production data (read-only)
- `ratings` collection: **0 documents**. Completed customer bookings: **4**.
- `reviewstats`: 105 rows, har ek **62,734 – 63,300** (site, city, route).
- Website har route/city page par dikhata hai: **"4.8 / 5 — Rated by 63,000+ travellers who booked a Jaipur to Delhi cab"** (schema se hata diya gaya tha 13 Nov ko, par visible text abhi bhi hai).

---

## 2. Pages index kyun nahi ho rahe — wajahein (sabse badi pehle)

| # | Wajah | Saboot | Asar |
|---|---|---|---|
| W1 | **Apex domain dead** | DNS A record nahi; Google ka #1 URL `http://hellomycabs.com/` (67% impressions) ab khulta nahi | Homepage ki saari authority ek mare hue URL par; Google ko site "toot rahi" dikhti hai; homepage se route pages tak link equity nahi jaata |
| W2 | **Nakli review counters** | 0 asli ratings, 4 completed bookings, par har page par "63,000+ travellers" | Google ki quality/spam policy (misleading claims) — puri site par trust girta hai. Customer ke liye bhi galat daawa (consumer law risk) |
| W3 | **Naye, kamzor site par bahut zyada milte-julte pages** | 145 indexable, 109 route-type; baseline mein 104 pairs > 0.80 similarity, Tier 1 pairs 0.45–0.62; 119 kabhi crawl hi nahi hue | Google ne pehle 27 crawl kiye, unhe "kam value" maana, baaki ki crawl demand hi nahi bani. Autochatix mein bhi yahi seekha: kam, gehre pages pehle index hue |
| W4 | **Route ke asli facts nahi** | `driver.generated.ts` khaali; D3 (route facts) abhi bhi pending | Har route page ka unique hissa sirf fare table + naam |
| W5 | **Bahar se signal kamzor** | Backlinks/citations nahi ke barabar; purana `hellomycab.com` (doosra business) brand query par compete karta hai | Crawl priority kam |
| W6 | **Bhari pages, cold render** | 600–700 KB HTML, route pages 0.8 s TTFB on cache miss | Crawl budget kam pages tak jata hai |
| W7 | **Search Console ke kaam baaki** | 13 Nov ka Step 3 (sitemap submit, Request Indexing, Bing, IndexNow) owner ke paas pending | Google ko "ye pages zaroori hain" ka seedha ishara nahi gaya |

Technical cheezein (canonical, robots, noindex, sitemap, schema validity, 404s, internal links, mobile speed) **pehle se sahi hain** — unme koi badi galti nahi mili. Isliye ye plan **trust + quality + focus + signals** par hai.

---

## 3. Owner ke faisle chahiye (bas ye 5)

| ID | Sawaal | Meri salah |
|---|---|---|
| **N1** | Apex DNS: Hostinger → DNS → `A @ 43.204.57.108` (TTL 300), koi aur apex A/AAAA/parking record hatao. `www`/`api` mat chhedo. | **Zaroori.** Ye sirf aap kar sakte ho (2 minute). Baaki main karunga. |
| **N2** | Nakli review counters: (a) website par rating block tabhi dikhe jab asli ratings ≥ 10 hon, aur (b) production `reviewstats` ko asli `ratings` se rebuild karna (backup ke saath) | **Dono haan.** Bina iske baaki mehnat ka asar kam rahega. |
| **N3** | "Focus set": pehle sirf ~30 strong pages index karwana; ~85 kam-demand route pages ko kuch hafton ke liye `noindex, follow` + sitemap se bahar (pages users ke liye chalte rahenge) | **Haan** (13 Nov ka D5 "list only" badalna). Autochatix wala batch/gate tareeka. |
| **N4** | Route ke asli, unique data ke liye backend ka **aggregate** data public karna — jaise pichhle 90 din mein us route par kitni bookings/requirements aayi, gaadiyon ka mix, aam fare range (koi naam/number nahi, minimum sample ke saath) | **Haan.** Ye bina kuch gadhe asli unique content deta hai. |
| **N5** | Jaipur Airport / Khatu Shyam pages (D4): fares aur service confirm karke page banana? | Queries hain (jaipur airport taxi ~250 impr). Fares confirm ho to **haan**, warna baad mein. |

Baaki saare kaam main code/server se karunga.

---

## 4. Step-by-step plan

### Phase A — Neev (Din 0–2)

**A1. Apex → www (W1)** — owner N1, phir main:
1. `dig +short A hellomycabs.com @8.8.8.8` → `43.204.57.108`.
2. Server par `sudo systemctl reload caddy` (certificate turant). Backup `/etc/caddy/Caddyfile.before-apex-20261113` pehle se hai.
3. Check: `curl -I http://hellomycabs.com/`, `https://hellomycabs.com/`, `https://hellomycabs.com/kota-to-sikar-cab?x=1` → ek hop 301 → `https://www.hellomycabs.com/...` (path + query same); `https://api.hellomycabs.com/health` 200.
4. `node scripts/seo/monitor-domains.mjs` → evidence `docs/seo/evidence/hosts-<date>-apex-live.md`.
5. Website `robots`/canonical mein kuch nahi badlega (pehle se www).

**A2. Nakli review counters hatao (W2)** — owner N2, phir:
1. **Website** (`RatingSummary.tsx`, `LiveRatingSummary.tsx`, `page.tsx`, `CityPage.tsx`, `RoutePage.tsx`):
   - Rating block sirf tab dikhe jab `count >= MIN_PUBLIC_RATINGS` (10) **aur** route count ≤ site count (consistency check, jo 13 Nov ko schema ke liye bana tha, ab visible text par bhi).
   - Warna block ki jagah ek saaf line: "Abhi naye hain — har poori trip ke baad customer rating dete hain" (koi number nahi).
   - "Rated by 63,000+ travellers" jaisi koi bhi copy hard-coded nahi rahe — `grep -rn "Rated by\|travellers who booked"` se check.
   - Test: `scripts/test/rating-summary.mjs` mein naye cases (0 ratings → block nahi; inconsistent counts → block nahi; ≥10 consistent → dikhe).
2. **Backend** (production write — sirf N2 ke baad):
   - `reviewstats` ka JSON backup `docs/evidence/` ke bahar private jagah (scratch) par.
   - `scripts/rebuild-review-stats.ts` chala kar `ratings` se dobara banao → sab counters 0 (aaj ki haqeeqat).
   - Public review API: count < 10 par `rating: null` bheje (website ke saath double guard).
   - Test: backend `reviews.test.ts` mein "0 ratings → null".
3. **Live check:** 5 pages par "63,000" text nahi; `curl` + grep.

**A3. Search Console safai (W7)** — owner ke account se, main exact list doonga:
1. Property `hellomycabs.com` (Domain property) — owner, already hai.
2. **Sitemaps** → submit karo: `https://www.hellomycabs.com/sitemap.xml` aur 5 group sitemaps (`/sitemaps/sitemap/{core,cities,routes,vehicles,guides}.xml`). Status "Success" + discovered count note karo.
3. **Removals** nahi karna (koi URL hatana nahi hai).
4. Issues mein "Page with redirect", "Not found (404)", "Blocked by robots.txt" → **"Validate fix"** (A1 ke baad).
5. Bing Webmaster Tools → "Import from Google Search Console" (1 click) → sitemap auto.
6. **IndexNow**: `node scripts/seo/indexnow.mjs --submit` (Bing/Yandex; Google nahi) — main chala dunga, key file pehle se setup.

### Phase B — Focus set (Din 2–4) (W3) — owner N3

**B1. Tier 1 — pehle index karwane wale ~30 pages** (sab sitemap mein hain, check kiya):
- Hubs: `/`, `/routes`, `/fares-explained`, `/about`, `/contact`
- Cities (6): `/cab-service-in-{kota,jaipur,delhi,sikar,agra,chandigarh}`
- Routes (15): `/jaipur-to-delhi-cab`, `/delhi-to-jaipur-cab`, `/kota-to-jaipur-cab`, `/jaipur-to-kota-cab`, `/kota-to-delhi-cab`, `/delhi-to-kota-cab`, `/jaipur-to-delhi-airport-cab`, `/delhi-airport-to-jaipur-cab`, `/jaipur-to-agra-cab`, `/delhi-to-agra-cab`, `/delhi-to-chandigarh-cab`, `/delhi-to-haridwar-cab`, `/jaipur-to-sikar-cab`, `/sikar-to-jaipur-cab`, `/jaipur-to-delhi-round-trip-cab`
- Vehicles (4): `/dzire-taxi`, `/innova-crysta-taxi`, `/ertiga-taxi`, `/tempo-traveller-12-seater-rental`
- Guides (2): `/guides`, `/guides/jaipur-delhi-by-road`
- (N5 haan ho to) `/jaipur-airport-taxi`, `/khatu-shyam-taxi`

`src/lib/tier1.ts` ko isi list ka "source of truth" banana (abhi 13 routes + 2 cars + 6 cities).

**B2. Tier 2 (~30) — pehle batch ke baad**: baaki route variants (innova/tempo/round-trip), baaki guides, baaki vehicles, Noida/Haridwar/Ajmer city pages, Tier 1 ke ulte routes jo upar nahi.

**B3. Tier 3 (~85) — kam demand wale route pairs** (e.g. `agra-to-sikar-cab`, `sikar-to-noida-cab`, `haridwar-to-kota-cab`, `chandigarh-to-sikar-cab` …; GSC mein 0 impressions, kabhi crawl nahi):
1. `src/lib/indexing-tier.ts` mein list; page `robots: noindex, follow` (page chalta rahega, links follow honge).
2. Sitemap (full + group) se bahar — `sitemap-entries.ts` tier dekhe.
3. Internal links waise hi (users ke liye) — directory page par rehte hain.
4. Test: `seo-recovery.mjs` — Tier 3 noindex + sitemap mein nahi; Tier 1/2 index + sitemap mein.
5. Jab Tier 1 ka ≥ 80% index ho jaye → Tier 2 sitemap mein; phir Tier 3 batch-wise (20–25 pages) wapas `index`.

Kyun: 145 milte-julte pages ek naye site par ek saath dene se Google sabko "baad mein" rakh deta hai (119 kabhi crawl nahi hue). Kam aur behtar pages se crawl demand banti hai, phir site ki trust se baaki pages bhi aate hain.

### Phase C — Tier 1 ko sach mein unique banana (Hafta 1–3) (W3, W4)

**C1. Asli data blocks (owner N4)** — backend:
1. Naya public read-only endpoint `GET /api/v1/public/route-insights?from=JAIPUR&to=DELHI` (cached 24 h):
   - pichhle 90 din: is route par booking/requirement ki ginti (agent + WhatsApp + customer), sabse zyada maangi gaadi (mix %), aam fare range (p25–p75, sirf agar ≥ 20 samples), din ke kis hisse mein zyada (subah/dopahar/raat), weekday vs weekend.
   - **Koi naam, number, address nahi.** Minimum sample 20, warna field `null`.
   - Test: PII nahi; threshold; cache.
2. Website `RoutePage.tsx` / `CityPage.tsx`: "Is route par Hello My Cab ka data" section — numbers + source line ("pichhle 90 din, Hello My Cab bookings aur driver requirements, <date> ko update").
3. Ye har Tier 1 page ko asli, alag, update hone wala content deta hai — bina kuch gadhe.

**C2. Asli distance / time / toll** — backend ke maps provider (Ola/Google/Mappls) se Tier 1 routes ka measured distance + duration, ek baar compute karke `content/routes/measured.ts` mein (source + date ke saath). Toll ka number tabhi jab provider de; warna nahi. 13 Nov ka "306 km vs 269–280 km" sawaal isse sulajhta hai.

**C3. Repeated boilerplate kam karo:**
1. Har route page par dohraye policies (cancellation, toll/parking, night charge, waiting) → ek jagah `/fares-explained` par; route page par 1–2 line summary + link.
2. "{City} pickup notes" jo har destination par same hai → city page par, route page par sirf link.
3. Target: `scripts/seo/crawl-audit.py` mein Tier 1 pairs **< 0.35**, koi bhi indexable pair **< 0.6**.

**C4. Route FAQ asli sawaalon se** — owner/support se 5–8 asli customer sawaal per Tier 1 route (WhatsApp/call logs se). Jo nahi mila wo nahi likhna.

**C5. Kota pe zor** (~600 impressions): `/cab-service-in-kota` par Kota ke andar ki jagahen (Kota Junction, coaching areas) sirf owner-confirmed; "one way taxi from Kota" section jo Kota ke saare routes link kare. Naya doorway page nahi banana.

**C6. QA gate (CI):** `npm run test:seo` mein naya test — Tier 1 pages ka main-content word count ≥ 900 **aur** pairwise similarity < 0.35; fail ho to build fail.

### Phase D — Crawl ko aasaan banana (Hafta 1–2) (W6)

1. **Tier 1 pre-build**: `[slug]/page.tsx` ke `generateStaticParams` mein saare Tier 1 routes (abhi sirf kuch) — cache miss TTFB 0.8 s → ~0.15 s. Amplify artifact size check (220 MB limit, abhi 114 MiB).
2. **RSC payload**: route page par duplicate inline CSS (~97 KB do baar) — `inlineCss` trial ek branch par, `audit:speed` se LCP before/after; agar LCP < 1.2 s mobile rahe to off (D9 ka measured faisla).
3. `stale-while-revalidate` theek hai; `lastmod` sirf asli content badalne par (C1 data roz badlega → `lastmod` = data date, honest).

### Phase E — Bahar ke signals (Hafta 1–4) (W5)

1. **Google Business Profile** (`GBP_CHECKLIST.md`): website link `https://www.hellomycabs.com/` (www), services, areas.
2. **Play Store listing**: website field → `https://www.hellomycabs.com/` (driver + customer app).
3. **Ghoomo Rajasthan** site (apna brand): footer/relevant pages se Tier 1 Rajasthan routes (`/jaipur-to-delhi-cab`, `/cab-service-in-jaipur`) ke contextual links — natural, kam.
4. **Citations** (`LINK_PLAN.md`): Justdial, Sulekha, IndiaMART, Google Maps listing — same NAP.
5. **Mana**: link khareedna, PBN, fake reviews, Indexing API (sirf JobPosting ke liye hai), automated "request indexing".

### Phase F — Google ko batana + naapna (Din 2 se lagatar)

**F1. Request Indexing** (GSC URL Inspection, ~10/din limit) — A1 + A2 + B live hone ke baad:
- Din 1: `/`, `/jaipur-to-delhi-cab`, `/delhi-to-jaipur-cab`, `/cab-service-in-kota`, `/cab-service-in-jaipur`, `/kota-to-jaipur-cab`, `/jaipur-to-kota-cab`, `/routes`, `/cab-service-in-delhi`, `/jaipur-to-delhi-airport-cab`
- Din 2: `/kota-to-delhi-cab`, `/delhi-to-kota-cab`, `/delhi-airport-to-jaipur-cab`, `/jaipur-to-agra-cab`, `/delhi-to-agra-cab`, `/delhi-to-chandigarh-cab`, `/delhi-to-haridwar-cab`, `/jaipur-to-sikar-cab`, `/sikar-to-jaipur-cab`, `/cab-service-in-sikar`
- Din 3: `/cab-service-in-agra`, `/cab-service-in-chandigarh`, `/dzire-taxi`, `/innova-crysta-taxi`, `/ertiga-taxi`, `/tempo-traveller-12-seater-rental`, `/fares-explained`, `/guides/jaipur-delhi-by-road`, `/jaipur-to-delhi-round-trip-cab`, `/about`
- Phase C ke baad jo page bada badla, use dobara (ek baar).

**F2. Har hafte** (`docs/seo/WEEKLY.md` + `scripts/seo/weekly.md`): GSC Coverage + Performance export → `docs/seo/evidence/gsc-<date>/`; `gsc-report.mjs`; Tier-wise indexed count (group sitemaps se).

**F3. Gate (Autochatix wala):**

| Tier 1 indexed (2 hafte baad) | Faisla |
|---|---|
| ≥ 80% | Tier 2 sitemap mein daalo |
| 50–80% | ruko, jo nahi hue unka content (C1–C4) aur gehra |
| < 50% | ruko, quality dobara audit; naye pages band |
| "Discovered" badh raha | ruko |

Tier 3 isi gate se 20–25 ke batch mein wapas.

---

## 5. Kitna time — sachchi baat

- A1 + A2 ke 1–2 hafte mein homepage www par shift + kuch Tier 1 crawl.
- Tier 1 ka zyada hissa: **3–6 hafte** (C ke baad).
- Saare 145: **2–3 mahine**, batch gates ke saath. Google ki koi guarantee nahi; sitemap/Request Indexing sirf ishara hai.

## 6. Kya bilkul nahi karna

Nakli reviews/ratings, auto-generated filler text, nayi doorway pages (city × har cheez), link khareedna, Indexing API ka galat use, pages ko delete/redirect karna sirf isliye ki index nahi hue, fares/policies bina owner ke badalna.

## 7. Done ki pehchaan

- [ ] Apex 301 → www, monitor evidence saved
- [ ] Website par koi nakli rating number nahi; backend counters asli
- [ ] 6 sitemaps GSC + Bing mein "Success"; IndexNow submitted
- [ ] Tier 3 noindex + sitemap bahar; tests green
- [ ] Tier 1 par asli data block + measured distance; similarity < 0.35; word count ≥ 900; CI gate
- [ ] Tier 1 pre-built; TTFB < 0.3 s cache miss
- [ ] Request Indexing 30 URLs (3 din)
- [ ] Har hafte export + WEEKLY.md line; gate faisle ledger mein
- [ ] Tier 1 ≥ 80% indexed → Tier 2 → Tier 3 batches

## 8. Ledger (har step ka saboot)

`docs/seo/LEDGER_INDEXING_<date>.md` — har step: kya kiya, commit, test output, live curl, GSC screenshot/export path. Kuch skip hua to wajah ke saath.
