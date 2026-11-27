# Plan — hellomycabs.com ke saare pages index karwana aur keywords par rank karwana (27 Nov 2026)

**Kis par bana:** aapke 27 Nov ke Search Console exports (Coverage + 5 drilldowns + Performance 24 ghante / 7 din / 28 din / 3 mahine), live site ki jaanch, Autochatix se tulna (code + 26 Nov ka uska GSC export), Google Autocomplete (India) se 341 searches, aur competitors ke search results.
**Saath ki file:** `KEYWORD_MAP_ROUTES_27NOV.csv` — saare 100 routes, har ek ke keywords, Google demand, abhi ka tier aur kya karna hai.
**Pichhle plans** (`PLAN_INDEXING_20NOV.md`, `PLAN_RANK_21NOV.md`) ki jagah nahi leta, unhe aage badhata hai. 21 Nov ka zyadatar kaam code mein ban chuka hai par **live nahi hai** (neeche 0.3).

---

## 0. Sabse pehle: sirf 1 page index kyun hai (saboot ke saath)

### 0.1 Search Console kya keh raha hai (data 23 Nov tak)

| Cheez | Ginti | Matlab |
|---|---|---|
| Indexed | **1** (sirf `https://www.hellomycabs.com/`) | 4 Oct se aaj tak 1–2 hi rahe |
| Crawled – currently not indexed | **29** — validation **Failed** | Google ne page padha, phir bhi **mana kar diya**. Isme hamare sabse zaroori pages hain, jo **21 Nov ko dobara crawl** hue aur phir bhi nahi liye gaye: `/jaipur-to-delhi-cab`, `/delhi-to-jaipur-cab`, `/jaipur-to-kota-cab`, `/kota-to-jaipur-cab`, `/jaipur-to-delhi-airport-cab`, `/routes` |
| Discovered – currently not indexed | **50** — "last crawled 1970" | Google ne in pages ko **kabhi khola hi nahi**: saare city pages (`/cab-service-in-jaipur`, kota, delhi…), `/about`, `/contact`, guides, aur privacy/terms tak |
| Page with redirect | 1 (`https://hellomycabs.com/`) | Sahi hai (apex → www) |
| Blocked by robots.txt | 1 (`http://www.hellomycabs.com/`, June ka purana crawl) | Purana; abhi CloudFront 301 deta hai |
| Not found (404) | 1 (`https://api.hellomycabs.com/`) | Sahi hai, ye website nahi hai |

**Search performance (3 mahine):** 7,199 impressions, 106 clicks. **Saare clicks homepage se.** Inme se **4,762 impressions `http://hellomycabs.com/` par** gaye, yaani us purane bare-domain wale page par jo 21 Nov tak band tha. Google abhi bhi purane address ko "main" maan raha hai. 21 Nov ka redirect apna asar dikhane mein 2–6 hafte leta hai.

**Jahan Google humein bina route page ke bhi top 3 mein dikha raha hai** (sirf homepage se):

| Keyword | Impr. (3 mahine) | Position |
|---|---|---|
| delhi jaipur taxi / delhi jaipur cab / jaipur delhi taxi / cab | 150 + 136 + 68 + 123 | **1.5–2.3** |
| one way taxi service in kota | 122 | **2.5** |
| jaipur airport taxi / taxi service in jaipur airport / airport taxi service in jaipur | 82 + 55 + 28 | **1.8–2.4** |
| delhi jaipur one way cab | 84 | 4.0 |
| hello my cab (brand) | 147 | 3.7 (brand par bhi #1 nahi) |
| kota taxi service / best taxi service in kota / kota taxi | 121 + 90 + 62 | 8.8–9.5 |
| taxi service in reengus / taxi in khatu / taxi service in khatu shyamji | 59 + 17 + 15 | 8.7–17 |
| taxi service in jaipur / jaipur taxi service | 137 + 114 | 24–32 |
| taxi service in delhi / delhi taxi service | 44 + 45 | 17–35 |

### 0.2 Autochatix se tulna — dono saal 2026 ke naye domain hain, phir itna farak kyun

| | Autochatix | Hello My Cab |
|---|---|---|
| Domain bana | 12 Apr 2026 | 10 Jun 2026 |
| Indexed (23 Nov) | **256** | **1** |
| Discovered – not indexed | **2** | **50** |
| Ek page ka HTML | **83 KB** (script 27 KB) | **620–690 KB** (script 390–445 KB, inline CSS 100 KB) |
| Pages kaise | Static HTML; har page alag vishay (feature, industry, guide, comparison, tool) | Next.js; **shehar × shehar ka jaal** — har page ka template ek jaisa, sirf shehar, km aur fare badalte hain |
| Shuruaat | 10 achhe pages index hue, phir unhe gehra kiya, phir batches mein naye pages | Oct mein ek saath ~150 pages Google ke saamne |

**Seekh:** domain ki umar asli farak nahi hai. Farak 4 cheezon ka hai: (1) page kis type ka hai (alag vishay vs city-pair template), (2) page ka wazan aur saaf-suthrapan, (3) shuruaat kitne pages se hui, (4) bahar ke signals. Autochatix ki gate rule ("80% index hone tak naye pages nahi") hum pehle se apna chuke hain. Wahi yahan bhi poori sakhti se chalegi.

### 0.3 Asli kaaran — sabse bade se chhote tak

| # | Kaaran | Saboot |
|---|---|---|
| **K1** | **Google ne site ko "kam bharose wali" maan liya hai (site-level quality)** | Oct ke shuru mein Google ne ~27 pages crawl kiye, ek bhi index nahi kiya, aur baaki 50 kabhi khole hi nahi. Google ke Gary Illyes ke mutabik bahut saare "crawled – not indexed" pages poori site ki quality ki samasya dikhate hain, aur Martin Splitt ke mutabik "discovered – not indexed" ka sabse aam kaaran bhi quality hai. City × city template wale pages par Google ki doorway-pages policy khaas nazar rakhti hai. |
| **K2** | **21 Nov tak address ki ulajhan** | Bare domain band tha (DNS hi nahi tha), `api.hellomycabs.com/privacy` index mein tha, aur `http://www` June mein robots se blocked dikha. Google ka pehla imprint isi ulajhan par bana. 21 Nov ko theek hua, par Google ko waqt lagega. |
| **K3** | **21 Nov ka sudhaar live hi nahi hua** | Website aur backend dono mein 21 Nov ka kaam commit nahi hua (`LEDGER_RANK_21NOV.md` R1–R37 local par). Live page abhi bhi "306 km" (anumaan) dikhata hai, jabki naapi hui doori 295 km hai. Jaipur Airport page, Khatu pages, Google rating aur fare hold, kuch bhi live nahi hai. |
| **K4** | **Page bahut bhari hai, asli text ka hissa chhota** | 690 KB HTML: 100 KB inline CSS, 68 KB SVG map ke circles React payload mein, aur sab kuch do baar (HTML + RSC payload). Google 15 MB tak padh leta hai, isliye ye seedha "index mat karo" ka kaaran nahi hai. Lekin crawl mehnga hota hai, aur boilerplate har page ko ek jaisa banata hai. |
| **K5** | **Pages ek jaise lagte hain** | 5-shabd tukdon ka overlap: Jaipur–Delhi vs Delhi–Agra **29%** (number hata kar 37%), Jaipur–Delhi vs Kota–Jaipur 15%. Har route par **20 FAQ**, zyadatar same template ke. Service ke liye **Product schema** laga hai, jiske liye Google koi rich result nahi deta. |
| **K6** | **Bahar ke signals lagbhag zero** | Na directory listings hain, na asli backlinks. GBP (4.7★, 156 reviews) website ke kaam nahi aa raha. Competitor "Jaipur Cabs 24Seven" ke **GBP posts khud Google results mein** Jaipur→Delhi, Kota→Jaipur, Khatu Shyam aur "taxi service in jaipur for outstation" par aa rahe hain. |
| **K7** | **Demand se zyada pages** | 100 routes mein se **20 ke liye Google par koi search hi nahi** (noida→kota, sikar→agra…); 23 ka fare galat hai (`FARE_REVIEW_21NOV.md`); upar se gaadi wale variant pages (`/jaipur-to-delhi-innova-crysta`, `…-tempo-traveller-12-seater`, `…-round-trip-cab`) asli route page ki taakat baant dete hain. |
| **K8** | **"Validate fix" bahut jaldi dabaya** | "Crawled – not indexed" par validation **Failed**. Jab tak naya kaam live na ho aur 2 hafte na beet jaayein, validation dobara mat chalayiye. |

**Kya problem NAHI hai (jaanch li):** robots.txt (sab allow, 6 sitemaps), canonical (har page apna www URL), status (200), redirects (apex/http → 1 baar 301 → https www), server rendering (poora text HTML mein hai, 1,450–3,170 shabd `<main>` mein), sitemaps (6 ke 6 "Success", 78 URL), `noindex` galti se kisi Tier 1 page par nahi hai.

---

## 1. Lakshya aur kaam ka kram

**Lakshya:** (1) Tier 1 ke ~35 pages 6 hafte mein ≥ 80% index, (2) phir lehron (waves) mein baaki demand wale routes, (3) jahan hum pehle se top 3 hain wahan asli page se clicks, (4) 12 hafte mein city keywords par top 10 aur Maps pack.

**Kram ka niyam:** pehle jo ban chuka hai wo live karo → phir page ko "index hone laayak" banao (halka, alag, saaf) → phir pages ki ginti ghatao → phir bahar ke signals (GBP, listings, links) → tab Google se dobara crawl maango → phir keywords → phir naye pages, gate ke saath.

| Phase | Kab | Kaun |
|---|---|---|
| A — jo bana hai use jaanch kar live karna | Din 0–2 | Main |
| B — page diet: halka, alag, saaf | Hafta 1 | Main |
| C — pages ki chhatai (prune) | Hafta 1 | Main (aapki 2 haan chahiye) |
| D — bahar ke signals: GBP, listings, links, brand | Hafta 1 se lagataar | **Zyadatar aap**, text main dunga |
| E — Google ko bulana: request indexing, sitemaps, Bing | Hafta 1–2 | Aap (GSC) + main |
| F — keyword targeting har page par | Hafta 2–4 | Main |
| G — lehron mein routes kholna (gate ke saath) | Hafta 4+ | Main, data ke hisaab se |
| H — naapna, har hafte faisla | Har somvaar | Aap export, main report |

---

## Phase A — 21 Nov ka kaam jaanch kar live karna (Din 0–2)

A1. **Pura diff padhna:** website ke 34 badle/naye files aur backend ke 22 files (`git status`, list `LEDGER_RANK_21NOV.md` mein). Har file ka kaam ledger ki row se milana.
A2. **Website:** `tsc`, `lint`, `test:seo`, `test:rating`, `test:rank`, aur `next build` (artifact size limit ke andar). Local crawl script se 78 pages: 0 errors, har Tier 1 par `index, follow`, Tier 3/held/twin par `noindex, follow`.
A3. **Backend:** `tsc`, eslint aur poori Jest suite. Saaf worktree mein ye jaanch ki commit akele build hota hai.
A4. **Bache hue 21 Nov rows:** R32 (route page ka kram + mobile screenshot), R33 (4 guides), R34 (har Tier 1 par ≥ 15 andar ke links), R38 (HTML weight + LCP; neeche Phase B1 mein badha diya hai), R39 (schema + 404 map + monitoring), R40 (release).
A5. **Release kram:** backend pehle (naye `/public/transfers`, Khatu/Jaipur Airport fares), `/health` par commit check, phir website. Live jaanch: `/jaipur-airport-taxi` 200 aur fare dikhe; `/jaipur-to-delhi-cab` par 295 km dikhe; `/cab-service-in-jaipur-airport` 308 → `/jaipur-airport-taxi`; sitemap mein naye pages; Tier 3 abhi bhi noindex.
A6. **Rokna:** Hindi (`HINDI_LIVE = false`) aur Tier 3 abhi band rahenge.
A7. **Commit sirf path se**, aapki PLAN/PROMPT files aur `CHATGPT_HANDOVER.md` kabhi nahi.

## Phase B — page diet: halka, alag, saaf (Hafta 1)

### B1. Wazan (lakshya: route page HTML ≤ 150 KB, gzip ≤ 35 KB; abhi 690 KB / 110 KB)
1. **Inline CSS (100 KB) hatana** → ek cached CSS file (`inlineCss` band). Ye D9 ka purana faisla palatna hai, isliye aapki haan chahiye. Faayda: har page se 100 KB kam, aur CSS browser/CDN cache mein.
2. **Route ka SVG map** (68 KB React payload) → server par bani static `map.svg` file (`/[slug]/map.svg` pehle se hai) `<img>` se, `width/height` aur `alt` ke saath. React tree mein hazaron circles nahi.
3. **JSON-LD ek hi baar:** schema ko server component mein seedha `<script type="application/ld+json">` bana kar dena, client payload mein dobara nahi.
4. **Client components kam:** jo hissa interactive nahi hai (fare table, FAQ text, route facts) wo server-only. Sirf booking form aur theme toggle client mein.
5. **Fonts/images:** fonts `display: swap` aur sirf use hone wale weights; hero image `priority` + sahi `sizes`; baaki lazy.
6. **Naap:** local Lighthouse (mobile) Tier 1 ke 5 pages par, pehle aur baad mein. Lakshya: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms, SEO 100. (PageSpeed API ka quota aaj khatam tha.) `evidence/` mein report.
7. **Test:** `scripts/test` mein budget check: koi Tier 1 page 150 KB se bhaari ho to build fail.

### B2. Har Tier 1 route page sach mein alag ho (lakshya: number hata kar kisi bhi do Tier 1 pages ka overlap < 25%)
Har route par ye **route-specific** hisse, sab asli data se (kuch bhi gadha hua nahi):
1. **Fare table har gaadi ka** (Hatchback/Dzire/Ertiga/Crysta/Tempo) — API se, wahi jo booking mein milta hai.
2. **Doori aur samay naapa hua** (R15 overlay): ek hi number title, H1, table, FAQ aur schema mein.
3. **Raasta:** polyline se raaste ke shehar/kasbe (jaise Jaipur→Khatu: Chomu, Reengus; Delhi→Khatu: Behror, Kotputli, Shahpura, Reengus), aur expressway ya highway ka naam tabhi jab polyline se pakka ho.
4. **Toll:** backend `tolls.ts` ki rakam, "fare mein shamil" saaf likha.
5. **Drivers ki jaankari** (route survey, ≥ 2 drivers ki sahmati): rukne ki jagah, achha/bura samay, pickup/drop ilaake. Survey bhejna Phase D6 mein.
6. **Asli maang** ("is route par 90 din mein X trips, sabse zyada kaun si gaadi, kis samay") — pehle se live hai, har route ka apna.
7. **Ulti disha ka farak:** jaise Delhi Airport→Jaipur par flight late hone par kya hota hai, aur Jaipur→Delhi Airport par terminal T1/T3 ka drop.
8. **FAQ 20 se ghata kar 6–8**, sirf route-specific (fare, doori, samay, toll, gaadi, airport/station pickup, one way vs round trip). Saare routes par same rehne wale sawaal `/fares-explained` par ek jagah, aur route page se link.
9. **Test:** `scripts/test/rank.mjs` mein shingle-overlap check: Tier 1 ke kisi bhi do pages ka overlap 25% se upar ho to fail. Saath mein `evidence/overlap-<date>.json`.

### B3. Schema saaf
1. **Product schema hatana** (D8 palatna, aapki haan chahiye): service ke liye Google Product rich result nahi deta, aur bina asli product ke Product/Offer spammy lag sakta hai. `TaxiService` + `Service` (`offers`: har gaadi ka fare, `priceCurrency INR`) rehenge, saath mein `BreadcrumbList`, `WebPage` aur `Organization`.
2. **FAQPage** sirf un 6–8 sawaalon ka jo page par dikhte hain (Google ab aam sites ko FAQ rich result nahi deta, par schema ka text page se match hona chahiye).
3. **AggregateRating schema nahi** jab tak apni asli ratings ≥ 10 na hon (guard pehle se hai). Google rating sirf text mein.
4. **LocalBusiness (`TaxiService`) ka address/phone** `company.ts` aur GBP se akshar-akshar mile (NAP).
5. Har badlav ke baad Rich Results Test aur Schema validator par 5 pages (aap ya main, browser se).

### B4. Bharose wale pages (E-E-A-T) — Discovered list mein ye bhi atke hain
1. **`/about`:** company ka kanooni naam, registration/GST (agar public karna chahein), office ka pata aur photo, kab se chal rahi hai, "3,200+ verified drivers" (taareekh ke saath), founder/team ka naam (aapki marzi), aur driver app ka Play Store link.
2. **`/contact`:** NAP, map (R27), WhatsApp, 24×7 phone, aur Google rating line.
3. **Har page ke footer mein** wahi NAP, aur `/about`, `/contact`, `/fares-explained` ke links.
4. **Driver verification ka tareeka** (`/about` par): KYC, Driver License, RC ki jaanch — app mein jo asal mein hota hai, wahi.
5. **Privacy/Terms/Refund** indexable rahein par **sitemap se bahar** (crawl budget sirf kaam ke pages par).

### B5. Chhoti cheezein (koi na chhoote)
- Har page par sirf ek `<h1>`. Title ≤ 60 akshar, description 140–160, dono unique (test).
- `og:title/description/image` har Tier 1 par, image 1200×630.
- Saari images par sahi `alt` (route/gaadi ka naam), `width/height`, WebP/AVIF.
- Custom 404 page **404 status** de (soft 404 nahi) aur Tier 1 pages ke links rakhe.
- Trailing slash ek hi tarah (abhi bina slash). Uppercase/`?utm` waale URLs par canonical saaf.
- `lastmod` sirf asli content badalne par badle (har build par nahi).
- Favicon/manifest 200 dein. `/robots.txt` mein sitemaps rahein.
- Breadcrumb dikhe bhi aur schema mein bhi.
- Mobile par fare table pehli screen par aaye (competitors ki tarah); "Call / WhatsApp" button sticky ho.
- `hreflang` sirf jab Hindi live ho (abhi band).
- **Analytics:** live par koi analytics nahi chal raha (R28). Measurement ID secret nahi hota, isliye use **code mein** rakha ja sakta hai, env ki zaroorat nahi. Aap GA4 property banakar ID bhejein (Autochatix ka `PHASE1_ANALYTICS_SETUP.md` jaisa). Bina iske GBP aur route pages se aane wale log gin nahi sakte.

## Phase C — pages ki chhatai (Hafta 1)

Google ko kam par mazboot pages dikhane hain (Autochatix bhi 10 pages se shuru hua tha).

C1. **Index mein rehne wala set, Wave 1 (~35 URL):** home, `/routes`, `/fares-explained`, `/about`, `/contact`, 7 city pages (Jaipur, Kota, Delhi, Sikar, Agra, Chandigarh, Khatu Shyam ji), `/jaipur-airport-taxi`, 14 Tier 1 routes + Jaipur↔Khatu, `/jaipur-to-delhi-round-trip-cab`, 4 gaadi pages (Dzire, Crysta, Ertiga, Tempo 12), `/guides`, 3 guides (Jaipur–Delhi by road, how to reach Khatu Shyam, ek aur Tier 1 guide).
C2. **Noindex + sitemap se bahar:**
   - 14 routes jinke liye Google par koi search nahi (CSV mein "Noindex rakho").
   - 23 galat fare wale (FARE_HOLD, pehle se).
   - Twins (pehle se).
   - **Gaadi × route variant pages:** `/jaipur-to-delhi-innova-crysta`, `/jaipur-to-delhi-tempo-traveller-12-seater`, `/delhi-to-agra-innova-crysta` jaise. Inki jagah asli route page par "Innova Crysta / Tempo Traveller se" hissa (anchor) aayega, aur variant page ka canonical asli route page ki taraf. **Aapki haan chahiye**, kyunki ye URL abhi live hain.
   - Round-trip variants (Jaipur–Delhi round trip ko chhod kar): round trip ka fare route page par ek hissa.
   - `luxury-car`, `force-urbania-rental`, `tempo-traveller-14/16-seater-rental`: noindex jab tak alag demand na dikhe (autocomplete mein nahi aate).
C3. **Andar ke links** sirf index wale pages ki taraf mazboot: home "Searched most", city pages se un shehar ke Tier 1 routes, route se ulti disha + 3 paas ke Tier 1 routes + city page, aur breadcrumb. Noindex pages ke links `nofollow` nahi (link hone do), par home/footer se hata do.
C4. **Test:** sitemap = index wala set (koi noindex URL sitemap mein nahi, koi Tier 1 bahar nahi); har Tier 1 par ≥ 15 andar ke links (R34).

## Phase D — bahar ke signals (Hafta 1 se lagataar) — sabse bada lever

Naye domain ko Google tab bharosa deta hai jab bahar se pehchaan dikhe. Is hisse ka zyadatar kaam aapke haath mein hai. Main har cheez ka text taiyaar dunga.

### D1. Google Business Profile (GBP) — sabse tez faayda
Competitor ke GBP posts khud result mein aa rahe hain (Jaipur→Delhi, Kota→Jaipur, Jaipur→Khatu, "taxi service in jaipur for outstation"). Hum bhi yahi karenge, aur website link ke saath (kit `GBP_KIT_21NOV.md` taiyaar hai):
1. Profile ka naam, category ("Taxi service" + "Airport shuttle service"), 24 ghante, aur pata/phone **website jaisa hi**. Website field: `https://www.hellomycabs.com/`.
2. **Service areas:** Jaipur, Kota, Delhi, Sikar, Khatu Shyam ji, Agra, Chandigarh, Ajmer, Jaipur Airport.
3. **Products:** har Tier 1 route ek product — naam "Jaipur to Delhi Taxi", fare "₹X se", photo, aur hamare route page ka link (UTM ke saath).
4. **Posts: hafte mein 3**, har post ek route ka (fare, gaadi, asli photo, page ka link). 8 post ka text kit mein hai; main har mahine 12 naye dunga.
5. **Photos:** 20+ asli (office, gaadiyan, drivers ki marzi se). Har hafte 2 nayi.
6. **Q&A:** kit ke 5 sawaal.
7. **Reviews:** har trip ke baad review link (GBP "Ask for reviews" link → `gbpReviewUrl`, D2 abhi pending). Har review ka jawab 48 ghante mein (templates kit mein).
8. **Naap:** GBP → Performance → Website clicks, har somvaar.

### D2. Directory listings (NAP ek jaisa) — `CITATIONS_21NOV.md`
Justdial, Sulekha, IndiaMART, Bing Places, Apple Business Connect, Facebook page, Instagram, LinkedIn company, Yellow Pages India, TradeIndia, Quora profile. Har jagah website link, wahi naam/pata/phone, wahi description. Profile ban jaane par `sameAs` schema mein jodna (tab, pehle nahi).

### D3. Asli backlinks
1. **Ghoomo Rajasthan** se link (footer mein ho gaya); Ghoomo ke tour pages se jahan taxi ki baat ho, wahan sahi route page ka link. **Niyam:** Ghoomo par hellomycabs jaise route pages kabhi nahi banenge (duplicate domain).
2. **Driver app:** Play Store listing ke "Website" field mein site; app ke "share duty/route" link website ke route page par khulein (asli visits + brand signal). Isme app ka chhota code change hoga, aapki haan par.
3. **Partners, sirf asli rishta ho tab:** Kota coaching hostels/PG (Kota page ka link), Jaipur hotels ki travel desk (airport page), Khatu dharamshala (Khatu page), travel agents jo humse cab lete hain.
4. **YouTube/Instagram:** Jaipur–Delhi expressway, Jaipur–Khatu raaste ke chhote videos asli drivers se, description mein route page ka link. Ye content GBP posts mein bhi kaam aata hai.
5. **Local khabar/PR:** "3,200 drivers ka Rajasthan ka driver network" jaisi asli kahani local portals par.
6. **Mana:** link khareedna, PBN, aur HackMD/Issuu/Payhip par spam (competitors ye karte hain — `hackmd.io/@lakshyacabs11`, `issuu.com/rajawat12`; hum nahi).

### D4. Brand searches badhana
"hello my cab" par hum 3.7 par hain. 3,200 drivers aur unke customers ko WhatsApp broadcast/app mein site ka link dena, visiting card/gaadi sticker par `hellomycabs.com`, aur GBP naam mein brand saaf. Brand searches Google ke liye bharose ka sabse saaf signal hain.

### D5. Route survey bhejna (driver facts ke liye)
`scripts/send-route-survey.ts --send` (dry-run: 23 drivers, 11 roads). Aapki haan par bhejunga. Jawab aane par B2.5 ke blocks bharenge.

### D6. Reviews ka asli raasta
Customer bookings abhi 0 hain, isliye app wala rating request kisi tak nahi pahunchta (R0). Reviews GBP link se maangne honge: drivers ko trip ke baad customer ko dikhane ke liye link (app mein "Review link bhejein" button — chhota app kaam, aapki haan par).

## Phase E — Google ko bulana (Hafta 1–2, Phase A–C live hone ke baad)

E1. **Pehle 3–4 din ruko** taaki CDN cache saaf ho aur naye pages stable hon. Live crawl script se 0 errors confirm karo.
E2. **URL Inspection → "Request indexing"**, roz ~10 (Google ki seema), is kram mein:
   1. `/` · `/jaipur-to-delhi-cab` · `/delhi-to-jaipur-cab` · `/jaipur-airport-taxi` · `/kota-to-jaipur-cab` · `/jaipur-to-kota-cab` · `/cab-service-in-kota` · `/cab-service-in-jaipur` · `/jaipur-to-khatu-shyam-ji-cab` · `/cab-service-in-khatu-shyam-ji`
   2. `/delhi-to-agra-cab` · `/delhi-to-chandigarh-cab` · `/delhi-to-haridwar-cab` · `/jaipur-to-agra-cab` · `/jaipur-to-sikar-cab` · `/sikar-to-jaipur-cab` · `/kota-to-delhi-cab` · `/delhi-to-kota-cab` · `/jaipur-to-delhi-airport-cab` · `/delhi-airport-to-jaipur-cab`
   3. `/cab-service-in-delhi` · `/cab-service-in-sikar` · `/cab-service-in-agra` · `/cab-service-in-chandigarh` · `/about` · `/contact` · `/routes` · `/fares-explained` · `/guides/how-to-reach-khatu-shyam` · `/guides/jaipur-delhi-by-road`
E3. **Sitemaps dobara submit** (wahi 6). Sitemap mein sirf index wala set aur sahi `lastmod`.
E4. **Validation:** "Crawled – not indexed" aur "Discovered" par **"Validate fix" sirf 2 hafte baad**, jab naye pages crawl ho chuke hon.
E5. **Removals:** `api.hellomycabs.com/privacy` ke liye GSC Removals (temporary), kyunki wo pehle se noindex hai.
E6. **Bing Webmaster Tools:** GSC se import, sitemaps, IndexNow (script pehle se). Bing ka data ChatGPT/Copilot search ko bhi jaata hai.
E7. **Links report** (GSC → Links) ka screenshot har mahine, taaki pata chale bahar se kaun link kar raha hai.

## Phase F — keyword targeting (Hafta 2–4)

### F1. Har route page ka keyword formula (CSV ke har route par lagu)
Autocomplete se route ke saath sabse zyada likhe jaane wale shabd: **fare/price (519), airport (185), service (122), one way (≈90), time (81), distance (77), booking (76)**, phir innova, IGI, railway station, Delhi Cantt, greater noida. Isliye:

| Jagah | Formula | Udaharan |
|---|---|---|
| Title (≤ 60) | `{A} to {B} Taxi @ ₹{from} \| One Way Cab, {km} km` | `Jaipur to Delhi Taxi @ ₹2,800 \| One Way Cab, 295 km` |
| Meta description | Fare by car + time + "toll & tax included" + Call 24×7 | — |
| H1 | `{A} to {B} Taxi Service — One Way Cab from ₹{from}` | — |
| H2s | "{A} to {B} taxi fare" (table) · "Distance & travel time" · "Route, tolls & stops" · "Pickup points in {A}" · "One way or round trip" · "Innova Crysta / Tempo Traveller for {A} to {B}" · "FAQs" | Har H2 ek search phrase ko jawab |
| URL | Abhi wala (`/jaipur-to-delhi-cab`) **badalna nahi** | URL badalne se jo thoda signal hai wo bhi jaata hai |
| Pehla paragraph | Primary + "cab" dono shabd, fare, km, samay | — |
| Image alt | `{A} to {B} taxi — {gaadi}` | — |

Niyam: "taxi" aur "cab" dono istemal hon, par bhar-bhar ke nahi. Har keyword ka **ek hi target page** ho (CSV ka `url` column). "sharing taxi", "ola/uber", "train ticket" jaise shabd hum target nahi karenge, kyunki wo service hum nahi dete.

### F2. City aur aam keywords → target page

| Keyword group (autocomplete + GSC) | Target page | Page par kya chahiye |
|---|---|---|
| taxi service in jaipur, cab service in jaipur, jaipur taxi service, taxi in jaipur, … contact number, … near me | `/cab-service-in-jaipur` | Outstation fares table, local 8 hr/80 km (`/fare/local`), airport + railway station pickup, Khatu Shyam ji link, **phone number upar**, pickup ilaake |
| taxi service in jaipur for outstation, outstation cab jaipur | `/cab-service-in-jaipur` (outstation hissa) | Top routes ki table, fare ke saath |
| taxi service in jaipur for sightseeing / full day / one day | `/cab-service-in-jaipur` ka "Local / full day" hissa | Sirf jo package asal mein milta hai. Alag sightseeing page tab jab aap package aur fare tay karein |
| jaipur airport taxi, taxi service in jaipur airport, airport taxi service in jaipur, jaipur airport cab | `/jaipur-airport-taxi` | Zone fares (R13), T1/T2 pickup, flight late, outstation from airport |
| kota taxi service, one way taxi service in kota, best taxi service in kota, kota taxi, kota taxi service number, kota taxi booking | `/cab-service-in-kota` | One way fares table (Kota→Jaipur/Delhi), railway station pickup, phone upar, coaching students ke liye Kota↔Jaipur/Delhi |
| taxi service in delhi, delhi taxi service, cab service in delhi, … for outstation, … airport, … ncr | `/cab-service-in-delhi` | Outstation table, Delhi Airport pickup (fare theek hone par), NCR pickup ilaake |
| taxi service in reengus, taxi in khatu, taxi service in khatu shyamji, khatu cab service | `/cab-service-in-khatu-shyam-ji` + `/jaipur-to-khatu-shyam-ji-cab` + guide | Reengus station → Khatu transfer fare, mela ke din ki salah |
| taxi service in sikar / agra / chandigarh | apne city page | Wahi pattern |
| one way taxi, one way cab, one way cab booking, one way taxi service, online cab service | `/` (home) | Top routes, "one way fare = sirf ek taraf ka" ki samjhaish |
| hello my cab, hello cab, hello my cab delhi, hello my taxi sikar | `/` + `/about` + GBP | Brand naam H1/title mein (pehle se) |
| taxi service near me, cabs near me, local taxi near me | **GBP / Maps pack** | Website se ye nahi jeeta jaata; GBP D1 |
| vasant kunj / south delhi taxi service | `/cab-service-in-delhi` ka pickup areas hissa | Alag ilaake ka page **nahi** (doorway) |

### F3. Naye page jinki maang dikhi — sirf aapke fare aur haan ke baad, aur gate ke baad
- **Jaipur sightseeing / local full day taxi** — autocomplete mein "for sightseeing", "full day", "for one day" baar-baar aata hai. Package aur fare chahiye.
- **Tempo traveller in Jaipur / Delhi** — "tempo traveller jaipur rent", "… contact number". City-wise tempo page, fare `tt_12` se.
- **Delhi Airport ↔ Delhi railway station / Delhi Cantt / Noida transfer** — bahut search hai, par hamara fare abhi galat hai (₹3,000 for 17 km). Fare theek hone par, Jaipur Airport jaisa zone page.
- **Naye routes** (`evidence/new-routes-2026-11-21.txt`, ≥ 20 trips/90 din): Jaipur→Pushkar 70, Gurgaon→Jaipur 74, Delhi→Vrindavan 52, Chandigarh→Shimla 57, Ludhiana→Chandigarh 163, Ludhiana→Amritsar 131… Fare aapka; Wave 3 ke baad.
- **Hindi pages** — scaffold taiyaar hai (`HINDI_LIVE`); Tier 1 ≥ 80% index aur kisi Hindi padhne wale ki jaanch ke baad.

### F4. Content jo rank aur link dono laaye (Hafta 3–8)
Guides sirf top routes par, har ek asli jaankari wala aur route page ko link karta: "Jaipur to Delhi by road — expressway vs NH-48 (naapa hua)", "How to reach Khatu Shyam" (bana hai), "Kota to Jaipur by road", "Delhi to Agra — Yamuna Expressway toll", "Jaipur Airport se shehar tak". Mahine mein 2, quality pehle, ginti baad mein.

## Phase G — routes ko lehron mein kholna (Hafta 4+)

| Wave | Pages | Kab kholna |
|---|---|---|
| **Wave 1** | C1 ka set (~35) | Abhi (Phase A–C ke saath) |
| **Wave 2** | 27 routes (CSV: "Wave 2"): Jaipur↔Jodhpur, Jaipur↔Ajmer, Chandigarh→Delhi, Delhi↔Dehradun, Agra→Delhi, Haridwar→Delhi, Ludhiana↔Delhi, Jaipur↔Udaipur, Delhi→Ajmer, Agra→Jaipur, Noida→Agra/Jaipur/Chandigarh, Delhi Airport↔Chandigarh/Agra, Kota↔Ajmer, Delhi↔Mohali… | Jab Wave 1 ka **≥ 80% indexed** ho aur "Discovered" na badh raha ho. Har route par B2 wale blocks pehle se bhare hon |
| **Wave 3** | 22 routes (kam demand) | Wave 2 ka ≥ 80% index hone ke 2 hafte baad |
| Hold | 23 galat fare + 14 bina search wale + twins | Fare theek hone / demand dikhne par |

Gate ki jaanch `gsc-weekly.mjs --coverage` se, aur kholna `release-tier3.mjs --apply` se (dono pehle se bane hain).

## Phase H — naapna aur har hafte faisla

H1. **Har somvaar aap:** GSC se Coverage + Performance (7 din, 28 din) export, aur GBP Performance ka screenshot. **Main:** `gsc-weekly.mjs` se `WEEKLY.md` + `keywords.csv` update.
H2. **Mahine mein ek baar:** `SERP_TEMPLATE.md` ke 12 search, India se incognito phone par.
H3. **Faisla rules:**
- 2 hafte baad Tier 1 < 30% index → URL Inspection se 5 page ka "Google-selected canonical" aur "Page fetch" dekhna; overlap aur wazan dobara naapna.
- 4 hafte baad bhi < 30% → **route template ko Autochatix jaisa halka static HTML** banana (Next.js ka static export ya alag lean template) — sabse bada technical kadam, data ke baad.
- ≥ 80% → agli wave.
- Koi page index hua par impressions nahi → title/H1 ko CSV ke primary keyword ke hisaab se badalna.
- Manual action report mein kuch aaye → turant sab rok kar jawab.

H4. **Lakshya (andaaze hain, vaade nahi — Google ka samay hum tay nahi karte):**

| Group | Abhi | 4 hafte | 8 hafte | 12 hafte |
|---|---|---|---|---|
| Wave 1 indexed | 1 / ~35 | 30–50% | ≥ 80% | ≥ 90% + Wave 2 khuli |
| Jaipur↔Delhi | homepage pos 1.5–2.3 | route page index | route page top 5 | top 3, 30+ clicks/mahina |
| Jaipur Airport | 1.8–2.4 (home) | page index | top 3 | top 3 |
| Kota one way / Kota taxi | 2.5 / 8.8–9.5 | city page index | top 5 | top 3 |
| Khatu / Reengus | 8.7–17, page nahi | pages index | top 10 | top 5 |
| Delhi–Agra/Chandigarh/Haridwar, Jaipur–Agra/Sikar | index nahi | index | top 10 | top 5 |
| Taxi service in Jaipur / Delhi | 24–35 | 20–30 | 15–20 | top 10 + Maps pack |
| Brand "hello my cab" | 3.7 | 2 | 1 | 1 |

---

## 2. Kya nahi karna (penalty se bachne ke liye)
- Har ilaake/mohalle ka alag page (doorway), keyword bhare pages, AI se bina jaanch ka bhara content.
- Nakli reviews/ratings, nakli address, aur title mein aisa fare jo booking mein na mile.
- Link khareedna, PBN, aur HackMD/Issuu/Payhip par spam.
- Ghoomo par hellomycabs jaise route pages (duplicate).
- URL badalna (`/jaipur-to-delhi-cab` jaise).
- Gate se pehle Tier 3 kholna, aur bina kaam ke "Validate fix" dabana.

## 3. Aapse kya chahiye (bina iske ye steps ruk jaayenge)

| # | Faisla / kaam | Kis step ke liye |
|---|---|---|
| 1 | **Haan:** 21 Nov ka kaam jaanch ke baad live karna | A |
| 2 | **Haan:** inline CSS band (D9 palatna) aur Product schema hatana (D8 palatna) | B1, B3 |
| 3 | **Haan:** gaadi/round-trip variant pages noindex + canonical route page par | C2 |
| 4 | GA4 property bana kar Measurement ID bhejna (code mein jaayega, env nahi) | B5 |
| 5 | `/about` ke liye: company ka kanooni naam, office photo, (marzi ho to) GST/registration, founder ka naam | B4 |
| 6 | GBP: profile theek karna, products, hafte mein 3 posts, photos, review link (text main dunga) | D1 |
| 7 | 11 directory listings banana (`CITATIONS_21NOV.md`) | D2 |
| 8 | **Haan:** route survey bhejna (23 drivers) | D5 |
| 9 | Fares: 23 galat fares (`FARE_REVIEW_21NOV.md`), Delhi Airport transfers, aur sightseeing/tempo ke package — jab aap tay karein | F3, Wave 2+ |
| 10 | Phase A–C live hone ke baad roz 10 "Request indexing" (E2 ki list), aur 2 hafte baad validation | E |
| 11 | Har somvaar GSC export + GBP screenshot | H |
| 12 | (Baad mein) app mein "share link website par" aur "review link bhejein" button ki haan | D3, D6 |

## 4. Mera agla kaam (aap "haan" bolein to)
Is plan se **step-by-step detailed prompt** (`PROMPT_INDEX_RANK_27NOV.md`), aur phir kram se: Phase A (live), B (diet), C (chhatai), F1–F2 (har page ka keyword formula), aur GBP posts ka pehle mahine ka text. GBP, listings, GSC aur fares aapke haath mein rahenge.

---

## 5. Research ke sources

**Google / indexing:**
[Page indexing report (Google)](https://support.google.com/webmasters/answer/7440203?hl=en) · [Spam policies — doorway abuse (Google)](https://developers.google.com/search/docs/essentials/spam-policies) · [Doorway pages update (Google, 2015)](https://developers.google.com/search/blog/2015/03/an-update-on-doorway-pages) · [Gary Illyes: crawled-not-indexed aur site quality (SEJ)](https://www.searchenginejournal.com/google-explains-crawled-not-indexed/521311/) · [Page ko indexing ke liye quality checks paar karne hote hain (SER)](https://www.seroundtable.com/google-pass-quality-checks-for-indexing-31309.html) · [100% indexing kyun mumkin nahi (Search Engine Land)](https://searchengineland.com/100-percent-indexing-impossible-385773) · [City landing pages doorway ban sakte hain (SER)](https://www.seroundtable.com/google-city-landing-pages-doorway-pages-28670.html) · [Ahrefs: crawled-not-indexed](https://ahrefs.com/blog/crawled-currently-not-indexed/) · [Ahrefs: discovered-not-indexed](https://ahrefs.com/blog/discovered-currently-not-indexed/)

**Competitors (search results, 27 Nov):**
[Uber Jaipur→Delhi](https://www.uber.com/en-IN/blog/intercity-to-delhi) · [MakeMyTrip Jaipur→Delhi](https://www.makemytrip.com/car-rental/jaipur-new_delhi-cab-services.html) · [oneway.cab Jaipur→Delhi](https://oneway.cab/jaipur/jaipur-to-delhi-taxi) · [CabBazar Jaipur→Delhi ₹2,741](https://cabbazar.com/route/jaipur-to-delhi.html) · [EaseMyTrip Jaipur→Delhi](https://www.easemytrip.com/cabs/jaipur-to-new-delhi-cab-booking/) · [Triveni Jaipur→Delhi](https://www.trivenicabs.in/one-way-cab/jaipur-to-delhi) · [Rajputana Cabs Jaipur→Delhi](https://rajputanacabs.in/jaipur-to-delhi-taxi/) · [Jaipur Cabs 24Seven GBP — Jaipur→Delhi](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/427360260629881321/) · [GBP — Outstation Jaipur](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/5023309706812426106/) · [GBP — Jaipur→Kota](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/3417986987249947703/) · [GBP — Jaipur→Khatu](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/4692212366258986404/) · [Savaari Jaipur](https://www.savaari.com/Jaipur/book-taxi) · [Triveni outstation Jaipur](https://www.trivenicabs.in/outstation-cabs/jaipur) · [CabBazar Jaipur](https://cabbazar.com/city/jaipur) · [oneway.cab Kota→Jaipur](https://oneway.cab/kota/kota-to-jaipur-taxi) · [CabBazar one way Kota](https://cabbazar.com/one-way-cab-in-kota) · [MakeMyTrip Jaipur→Kota](https://www.makemytrip.com/car-rental/jaipur-kota-cab-services.html) · [CabBazar Jaipur→Khatu](https://cabbazar.com/taxi/jaipur-to-khatu-shyam-ji) · [HurryUp Jaipur→Khatu](https://hurryupcabs.com/cabs/outstation/jaipur-to-khatu-shyam-ji) · [KDCab Jaipur→Khatu](https://kdcab.com/jaipur-to-khatu-shyam-taxi/) · Spam ke udaharan (copy nahi karna): [hackmd lakshyacabs](https://hackmd.io/@lakshyacabs11/jaipur-to-kota-taxi), [issuu rajawat12](https://issuu.com/rajawat12/docs/delhi_to_jaipur_cab)

**Hamara apna data:** `~/Downloads/hellomycabs.com-*-2026-11-27*.zip` (Coverage, 5 drilldowns, Performance ×4), `~/Downloads/autochatix.com-Coverage-2026-11-26.zip`, Autochatix `autochatix-public/PHASE*_*.md` aur `seo-growth-research-2026-11-10/`, live crawl (27 Nov), Google Autocomplete (India, en) 341 searches → `KEYWORD_MAP_ROUTES_27NOV.csv`.

---

## Addendum (27 Nov 2026, implementation) — K9: purana domain

Is plan ki diagnosis (K1–K8) mein ek bada kaaran chhoot gaya tha: **hellomycab.com** (bina "s") 2017 se isi business ki site hai — Google mein 124 pages index, wahi phone, wahi routes — aur 27 Nov ko bhi alag site ke roop mein live hai (`scripts/seo/monitor-domains.mjs`). Domain/hosting ka control kho gaya hai. Ek hi business ki do sites mein Google purani ko asli maanta hai; nayi ko kam bharosa milta hai. 301 redirect ka poora kaam taiyaar hai (`scripts/seo/old-domain/`); owner ko domain wapas lena hai (`OWNER_STEPS_INDEX_RANK_27NOV.md` §0). Ye kaam baaki sab se upar hai.
