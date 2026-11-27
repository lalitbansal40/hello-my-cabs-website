# Detailed step-by-step plan — saari kamiyan poori karke top par aana (21 Nov 2026)

**Ye kis par bana hai:** `PLAN_RANK_21NOV.md` (research — kaun top par hai, kya kami hai) + `LEDGER_INDEXING_20NOV.md` (indexing ka kaam, jo live hai).
**Niyam jo har step par lagte hain:**
- Aapko env / server / kahin config mein kuch nahi karna — har setting **code mein**, deploy se apne aap (jaise Premium rollout tha).
- Koi fake review, fake number, fake fact, keyword bhara thin page nahi.
- Har step ke saath "**Ho gaya kab maanenge**" (check) likha hai. Check pass nahi = step poora nahi.
- Code ke har step par: tests + typecheck + lint + build; backend pehle push, deploy check, phir website.
- Commit mein Claude ka naam / Co-Authored-By nahi. Aapki PLAN/PROMPT files aur `CHATGPT_HANDOVER.md` stage nahi hongi.

Har step par **[Code]** = main karunga · **[Aap]** = sirf aapke account se ho sakta hai · **[Dono]** = aap jaankari doge, main lagaunga.

---

## Kami → step ka map (kuch chhoota nahi, ye check karne ke liye)

| Kami (research se) | Kis step mein |
|---|---|
| G1 Pages index nahi | Phase 0 (chal raha hai) + 1.4, 9.1 |
| G2 Jaipur Airport page nahi | Phase 4.1 |
| G3 Khatu Shyam / Reengus page nahi | Phase 4.2, 4.3, 4.4 |
| G4 Google Business Profile ka use nahi | Phase 5 |
| G5 Mehnga / galat "starting" price | Phase 2 |
| G6 Competitors ke ek route ke kai pages | Phase 6.4 (sirf guide, thin page nahi) |
| G7 Reviews / stars nahi | Phase 3 |
| G8 Backlinks / pehchaan kam | Phase 7 |
| G9 Guides / blog kam | Phase 6 |
| G10 Distance galat (expressway) | Phase 2.4 |
| G11 Hindi content nahi | Phase 8 |
| Route facts (toll, rukne ki jagah, pickup) nahi — driver survey ko 0 jawab | Phase 1.5 |
| Bade shehar wale keywords (page 2–4) | Phase 6.1–6.3, 5 (Maps pack) |
| HTML bhaari (median ~495 KB, inline script ~325 KB) | Phase 9.3 |
| Naapne ka system nahi | Phase 1.1–1.3 |

---

## Phase 0 — Jo chal raha hai, use poora karna (Hafta 1) [Aap]

0.1 Sitemaps submit — ✅ ho gaya. Kal check: Search Console → Sitemaps → sab 6 par **Success**.
0.2 Request Indexing: Din 1 (aaj), Din 2, Din 3 lists — `OWNER_STEPS_20NOV.md` §2b.
0.3 "Page with redirect" → **Validate fix** (apex redirect ab live hai).
0.4 Bing Webmaster Tools → Import from Google Search Console.
0.5 `_dmarc` ka duplicate TXT (`"v=DMARC1; p=none;"`) delete.

**Ho gaya kab:** Sitemaps Success; Day 1–3 ke 30 URL request ho chuke; Validate fix "Started".

---

## Phase 1 — Naapne ka system aur route facts (Hafta 1) [Code + Aap]

### 1.1 Keyword list [Code]
- File: `docs/seo/keywords.csv` — columns: `keyword, group, target_url, priority, impressions_3m, position_3m, last_checked`.
- Shuru mein ~80 keywords:
  - GSC `Queries.csv` (20 Nov) ke saare keywords jinke ≥ 10 impressions hain, unke target page ke saath (Jaipur↔Delhi → route page; Kota → `/cab-service-in-kota`; Airport → `/jaipur-airport-taxi`; Khatu → `/jaipur-to-khatu-shyam-cab`; Jaipur/Delhi shehar → city page; brand → `/`).
  - Har Tier 1 route ke 4 roop: "X to Y cab", "X to Y taxi", "X to Y one way taxi", "X to Y cab fare".
- **Ho gaya kab:** file commit; har keyword ka ek hi target URL (koi do pages ek keyword ke liye nahi ladte).

### 1.2 Weekly report script [Code]
- `scripts/seo/gsc-report.mjs` ko badhana: Search Console ke do export folder (pichhla, naya) do → har keyword aur har page ka impressions / clicks / position ka farak, aur `keywords.csv` ka `position_3m` update.
- Output: `docs/seo/WEEKLY.md` mein ek nayi tareekh wali line + table "sabse zyada upar / neeche gaye 10 keywords".
- Test: `scripts/test/seo-recovery.mjs` mein ek chhota fixture (2 fake CSV) → sahi farak.
- **Ho gaya kab:** test pass; 20 Nov export par chalakar table banti hai.

### 1.3 Competitor snapshot [Aap, mahine mein ek baar — 10 minute]
- Phone par Chrome **incognito**, location India, ye 12 search: jaipur to delhi cab, delhi to jaipur taxi, kota taxi service, one way taxi service in kota, jaipur airport taxi, taxi service in jaipur, delhi to agra cab, delhi to chandigarh taxi, jaipur to sikar taxi, kota to jaipur taxi, jaipur to khatu shyam taxi, hello my cab.
- Har ek ka screenshot `~/Downloads/serp-<tareekh>/` mein. Main `docs/seo/evidence/serp-<tareekh>.md` mein top 10 likh dunga.
- **Kyun:** mera search tool US se chalta hai; asli India ka result sirf aapke phone se.

### 1.4 Index status tracker [Code]
- `docs/seo/WEEKLY.md` mein har Somvaar: Tier 1 ke 32 mein se kitne "Indexed" (GSC Pages export se), "Discovered" ki ginti. Yahi Phase 9.1 ka gate hai.

### 1.5 Route facts drivers se [Code + Aap]
Abhi `/public/route-knowledge` top 6 routes par **0 drivers**. Survey page (`/driver/route/[token]`) bana hua hai par kisi ko bheja nahi gaya.
- [Code] Backend: script `scripts/send-route-survey.ts` — pichhle 90 din mein jin drivers ne Tier 1 route chalaya (completed duty), unme se top 5 har route par → app notification + WhatsApp (driver ko, approved template se) mein survey link. Ek driver ko ek route ka ek hi baar. Dry-run mode pehle (sirf ginti, koi message nahi).
- [Code] Survey mein: rukne ki jagah (dhaba/petrol/washroom), toll plaza ki ginti aur lagbhag rupaye, aam pickup ilaake, raste ki koi khaas baat (ghat, expressway, state border).
- [Code] Website: route page par "Drivers who run this road" block **sirf tab** jab ≥ 2 drivers ki baat mile (ek jaisi baat ko hi dikhana). `driver.generated.ts` already ye format padhta hai — wahan se.
- [Aap] Agar WhatsApp template naya chahiye to Meta mein approve (text main dunga). Ya aap 5–10 bharosemand drivers ko khud link bhej do.
- [Aap/Dono] Jo baat drivers se na mile, office se: Jaipur pickup points, Delhi airport T1/T3 pickup ka tareeka.
- **Ho gaya kab:** top 14 routes mein se ≥ 8 par ≥ 2 drivers ka jawab; un pages par block live.

---

## Phase 2 — Fare aur distance theek (Hafta 1–2) [Dono]

### 2.1 Galat fares ki puri list [Code]
- Script `scripts/seo/fare-sanity.mjs`: `/public/routes` padho, har route ka ₹/km nikaalo, aur flag karo:
  - ₹/km > 2× catalog ka median (jaise Delhi→Noida 26 km ₹4,100; Delhi→Delhi Airport 17 km ₹3,000),
  - A→B aur B→A ka farak > 20% (Kota↔Agra ₹9,920 / ₹8,120),
  - same doori ke route par > 1.8× farak (Delhi→Sikar ₹5,600 vs Jaipur→Delhi ₹2,800).
- Output: `docs/seo/FARE_REVIEW_21NOV.md` — route, km, fare, ₹/km, kyun flag hua, competitor ka fare (research se, jahan mila).
- **Ho gaya kab:** list aapke paas; har row ke aage aapka "theek hai / naya fare ₹…".

### 2.2 Fare badalna [Aap decide, Code lagaye]
- Aap har flagged route ka fare batao (ya "theek hai"). Main backend ke fare catalog (jahan se `/public/routes` aata hai) mein code se badlunga — **boot par apply** (env nahi), jaise Premium rollout.
- Sasti gaadi: jis route par Dzire se sasti gaadi (hatchback) chal sakti hai, uska fare bhi — tabhi title "From ₹X" dikha sakta hai.
- **Ho gaya kab:** `fare-sanity.mjs` dobara chale to sirf wahi flag bache jinhe aapne "theek hai" kaha; website title naya fare dikhata hai.

### 2.3 Title / meta mein sahi price [Code]
- Title already `X to Y Cab @ ₹fare | One Way Taxi, N km`. Badlav:
  - Price wahi jo booking widget pehli baar dikhata hai (test: dono same).
  - Agar `fromListRupees` (kata hua) > `fromRupees`, description mein "₹X (was ₹Y)" — sirf jab asli offer ho.
  - Meta description mein: fare, km, ghante, "toll & driver included" (jo sach mein included hai — `Included.tsx` se), aur ek USP ("552 trips in last 90 days" jahan insights hain).
- Test: har Tier 1 route ka title ≤ 60, description 120–155 (crawl-audit already check karta hai).
- **Ho gaya kab:** production crawl: 0 titles bahar 30–60, 0 descriptions bahar 120–155; title price = widget price.

### 2.4 Asli distance aur samay (G10) [Code]
- Backend `routeInsights.measure()` already `distanceSource: 'measured'` naapta hai. Badlav: jab measured distance ho, **wahi** page, title, schema, FAQ, fare table sab jagah (ek hi number). Catalog ka `distanceMeasured: false` wala estimate sirf fallback.
- Expressway wale routes (Jaipur–Delhi, Delhi–Agra Yamuna Exp., Delhi–Chandigarh, Kota–Jaipur via Delhi–Mumbai Exp. jahan lagu) — page par "via ___" naam, measured route se (provider ke route summary se, jaisa mile; khud se nahi likhna).
- Samay: measured duration ho to wahi, warna "≈ km/55 ghante" (abhi wala) + "traffic par nirbhar" line.
- **Ho gaya kab:** Jaipur→Delhi page par ek hi km har jagah; test: title km = page km = schema km.

---

## Phase 3 — Asli reviews (G7) (Hafta 1 se lagataar) [Code + Aap]

**Abhi kya hai:** after-ride review request ka code hai (`services/jobs.ts`), par:
- Hamara apna rating template (`RATING_TEMPLATE_NAME`) set nahi → apni rating link jaati hi nahi → `ratings` = 0.
- Google review link (`GBP_REVIEW_URL`, website `company.reviewUrl`) null.
- Zyada trips agent/WhatsApp duties hain jisme customer ka phone nahi hota.

### 3.1 Settings code mein [Code]
- `RATING_TEMPLATE_NAME` aur `GBP_REVIEW_URL` ko `config/` mein code default bana do (env sirf emergency off ke liye), jaisa Ghoomo ka review setting hai.
- **Ho gaya kab:** aapko env mein kuch nahi daalna; deploy ke baad `/health` ya admin panel mein dikhe ki kaunsa template/link chalu hai.

### 3.2 Template approve [Aap — ek baar]
- Meta WhatsApp Manager mein `hmc_rate_ride` template (text `TEMPLATE_hmc_rate_ride.md` mein hai) submit. Approve hote hi mujhe naam batao → main code default mein daal ke push.
- Google Business Profile → "Ask for reviews" → link copy karke mujhe do (`g.page/r/.../review`).
- **Ho gaya kab:** dono cheezein mere paas.

### 3.3 Kis-kis ko request jaaye [Code]
- Customer app / website bookings (phone hai): trip complete ke 2 ghante baad, din mein 9 se 9 ke beech (raat ko nahi).
- Agent bookings: agent ke customer ka phone hota hai to wahi; nahi to kuch nahi (driver/agent ko nahi).
- Ek phone ko 30 din mein ek hi baar. Opt-out ka respect (already hai).
- Rating page (`/rate/[token]`): 4–5 star dene wale ko "Google par bhi likhein?" button (GBP link); 1–3 star wale ko sirf "kya galat hua" — Google link nahi chhupana bhi nahi, par push bhi nahi. (Google ki policy: sirf achhe reviews maangna mana hai — isliye button sabko dikhega, bas 4–5 par upar.)
- Tests: timing, ek-baar, opt-out, no-phone.
- **Ho gaya kab:** tests pass; production mein pehle hafte ≥ 1 rating.

### 3.4 Website par dikhana [Code]
- Apni ratings: guard already live — ≥ 10 asli ratings hote hi route/city/home par apne aap.
- Google rating: `company.googleRating` = { 4.7, 156, 'Nov 2026' } — **text** mein home, city, contact page par ("4.7★ on Google, 156 reviews — Nov 2026"), schema mein nahi (Google khud ki rating schema mein ignore karta hai). Har mahine aap number batao, main update (ya script GBP se — API access ho to).
- [Aap] Ek baar confirm: GBP par abhi kitne reviews aur kya rating hai.
- **Ho gaya kab:** home par Google rating line; "Rate us on Google" contact page par.

### 3.5 Lakshya
- 30 din: 30 apni ratings, 20 naye Google reviews. 60 din: 100 / 50.

---

## Phase 4 — Naye pages jahan page hi nahi (G2, G3) (Hafta 2) [Code + Aap fares]

### 4.1 `/jaipur-airport-taxi` [Code; fares Aap]
- Keywords: jaipur airport taxi, taxi service in jaipur airport, airport taxi service in jaipur, jaipur airport taxi service, airport taxi.
- Content (sab asli):
  1. H1 "Jaipur Airport Taxi — fixed fare to city & outstation".
  2. **Shehar ke andar** fare table: Airport → Railway Station / Sindhi Camp / Malviya Nagar / Mansarovar / Vaishali Nagar / Jagatpura / Amer / C-Scheme — Dzire aur Ertiga. **Fare aap doge.** Agar aap "local package se hi" bolo to `/fare/local` ke package (8hr/80km) se.
  3. **Airport se outstation:** Jaipur Airport → Delhi, Delhi Airport, Agra, Ajmer, Sikar, Khatu Shyam, Kota — catalog fare + link route page par.
  4. Pickup ka tareeka: T1 / T2, driver kahan milega, flight late ho to wait kitna free (aap batao).
  5. FAQ 5–6 (sirf airport ke sawal).
  6. Booking widget (pickup = Jaipur Airport pehle se bhara).
- Backend: kya `JAIPUR_AIRPORT` city key hai? Nahi hai to city directory mein jodna (coordinates ke saath), taaki booking aur fare dono chalein. Delhi Airport jaisa pattern.
- Schema: `TaxiService` (areaServed Jaipur), `FAQPage`, `BreadcrumbList`.
- Links: home "Searched most", `/cab-service-in-jaipur`, Jaipur ke har route page ka "Airport pickup" line, footer.
- Sitemap (core/cities), IndexNow, Request Indexing.
- **Ho gaya kab:** page 200 + index,follow; crawl: unique title/desc, 1 H1, valid JSON-LD; booking airport se chalti hai.

### 4.2 `/jaipur-to-khatu-shyam-cab` [Code; fare Aap]
- **Dhyaan:** backend `constants/cityAliases.ts` mein abhi "KHATU SHYAM (JI)" → `SIKAR` alias hai — yaani Khatu ki bookings Sikar mein gin rahi hain. Naya `KHATU_SHYAM_JI` key banate waqt alias hatana, purani bookings waise hi rehne dena (data migration nahi), aur parser / fare / broadcast tests chalana (Khatu wali WhatsApp duties sahi city mein jaayein).
- Normal route page jaisa (RoutePage) — iske liye `KHATU_SHYAM_JI` city key + catalog mein Jaipur→Khatu, Khatu→Jaipur, Delhi→Khatu, Khatu→Delhi fares. **Fare aap doge** (competitors ₹1,200–1,500 Jaipur→Khatu).
- Khaas content: raasta (Jaipur → Chomu → Reengus → Khatu, ~80–90 km — measured distance se confirm), Ekadashi / Phalgun mela par bheed aur advance booking, mandir ke paas gaadi kahan rukti hai (drivers/aap se), wapsi (same-day round trip).
- **Ho gaya kab:** 4.1 jaise checks.

### 4.3 `/cab-service-in-khatu-shyam` ya `/khatu-shyam-ji-taxi` [Code]
- Ek hi city-style page (do nahi): keywords "taxi in khatu", "taxi service in khatu shyamji", "khatu shyam taxi service contact number", "taxi service in reengus".
- Reengus station se Khatu (18 km) — fare aap batao; Khatu se Salasar, Sikar, Jaipur, Delhi ke links.
- `/cab-service-in-sikar` se link, aur ulta.
- **Ho gaya kab:** 4.1 jaise checks.

### 4.4 Guide `/guides/how-to-reach-khatu-shyam` [Code]
- Train (Reengus Jn), road (Jaipur/Delhi se), plane (Jaipur airport + taxi). Sirf woh baatein jo jaanchi ja sakein; source line.
- `src/content/guides/index.ts` mein jodna; route + city page ko link.

### 4.5 Naye pages ka index [Code + Aap]
- Tier 1 list (`indexing-tiers.ts`) mein jodna → prebuilt; sitemap; IndexNow; aap Request Indexing.

---

## Phase 5 — Google Business Profile (G4) (Hafta 1–12) [Aap, main content dunga]

5.1 **Profile theek** [Aap]:
- Naam exactly "Hello My Cab" + jo abhi hai (keyword bharna GBP policy ke khilaaf hai — naam mat badlo agar abhi "-Taxi service in jaipur" laga hai to ye Google suspend kar sakta hai; dheere se asli naam par laana behtar). **Ye aapka faisla** — risk main bata raha hoon.
- Primary category "Taxi service"; secondary "Airport shuttle service", "Car rental agency", "Tour operator" (sirf jo sach hai).
- Service areas: Jaipur, Kota, Delhi, Sikar, Agra, Chandigarh, Ajmer, Khatu Shyam ji, Noida.
- Website: `https://www.hellomycabs.com/` (www ke saath). Phone `+91 96671 11921`. Ghante: 24 ghante.
- Address bilkul `src/lib/company.ts` jaisa.
5.2 **Products / Services** [Dono]: 10 product — top 10 route, har ek: naam "Jaipur to Delhi Cab", price "₹2,800 se", photo, link route page (UTM `?utm_source=gbp&utm_medium=product`). Main ek sheet `docs/seo/GBP_PRODUCTS.md` dunga (copy-paste).
5.3 **Weekly posts** [Dono]: har hafte 2–3 post. Main har Somvaar `docs/seo/GBP_POSTS_<week>.md` dunga: text (150–300 shabd), kaunsi photo, link (UTM `?utm_source=gbp&utm_medium=post`). Topics ghumte rahenge: ek route + fare, airport, Khatu mela, ek driver/gaadi ki kahani, offer (agar asli ho).
5.4 **Photos** [Aap]: 20+ asli — office bahar/andar, har gaadi type, drivers (marzi se), Khatu/airport pickup. Har mahine 4 nayi.
5.5 **Q&A** [Dono]: 5 aam sawal khud poocho aur jawab do (fare, toll, advance, airport, Khatu). Text main dunga.
5.6 **Reviews ka jawab** [Aap]: har review ka 48 ghante mein jawab (achha/bura dono). Template main dunga.
5.7 **Website par GBP** [Code]: contact page par Google Maps embed (lazy, sirf contact page), `mapsUrl` link, `sameAs` already hai.
5.8 **Naapna** [Code]: UTM wale visits analytics se `WEEKLY.md` mein.
- **Ho gaya kab:** 10 products live, har hafte ≥ 2 posts, 20+ photos, Q&A 5.

---

## Phase 6 — Content jo rank kare (G6, G9, bade shehar keywords) (Hafta 2–8) [Code]

### 6.1 City pages mazboot (Jaipur, Kota, Delhi pehle; phir Sikar, Agra, Chandigarh)
Keywords: taxi service in jaipur, jaipur taxi service, cab service in jaipur, one way taxi service in jaipur; kota taxi service, best taxi service in kota, kota taxi, taxi service in kota, kota taxi booking, kota taxi service number; taxi service in delhi, delhi taxi service, south delhi taxi service, one way taxi service delhi, vasant kunj taxi service.
- Title test: "Taxi Service in Kota @ ₹… | One Way & Local Cab" → keyword pehle, already hai. Description mein phone number (log "taxi service number" dhoondhte hain).
- Naye hisse:
  1. **Pickup areas** — ilaakon ke naam (Kota: Talwandi, Kunhari, Vigyan Nagar, Railway Station, Nayapura, Coaching area / Indira Vihar; Jaipur: jaise 4.1; Delhi: South Delhi, Vasant Kunj, Dwarka, Karol Bagh, Connaught Place, IGI Airport, Gurgaon) — **sirf wahi jahan se hum sach mein pickup karte hain, aap confirm karo**. Alag page nahi.
  2. **Local taxi** (8hr/80km, 12hr/120km) — `/fare/local` se, jo city par lagu ho.
  3. **Shehar ke aas-paas** ke route table (already) + insights block (live).
  4. **Kota ke liye khaas:** coaching students aur parents ke liye (Kota↔Jaipur/Delhi, raat ki train ke baad pickup) — sirf asli service.
  5. **Phone + WhatsApp** pehli screen par, "24×7".
- **Ho gaya kab:** crawl: city pages words +, similarity city-vs-city < 0.4; title/desc rules pass.

### 6.2 Homepage (brand + generic: "hello my cab", "one way taxi", "one way cab booking")
- Brand pos 3.7 → 1: home title mein "Hello My Cab" pehle (abhi dekhna), Organization schema `alternateName` (already), GBP aur Play Store `sameAs` (already), About page mein company ki asli kahani (kab shuru, kitni gaadiyan, kitne driver — aap number do).
- "One way taxi" generic: home par chhota "How one-way works" (fares-explained ko link) — already ho to bas link check.

### 6.3 Route pages — competitor wali kami poori
Har Tier 1 route page par (sab asli data se):
1. Pehli screen: fare (sabse sasti gaadi), km, ghante, "included" chips, booking widget, phone/WhatsApp. (Check: mobile par bina scroll fare + button.)
2. Fare table sab gaadiyon ki (already `FareTable.tsx`) — "included / extra" saaf.
3. Insights block (live) — demand, gaadi mix, samay.
4. Driver facts (Phase 1.5) jab mile.
5. Raasta (via ___), toll ginti (driver/measured se).
6. Pickup points (A shehar) aur drop points (B shehar) — city page jaisa.
7. Ulta route + related routes + guide ka link.
8. FAQ — sirf route ke apne sawal (boilerplate hat chuka).
- **Similarity target:** Tier 1 route pairs < 0.45 pehle, phir < 0.35 (asli facts ke saath). Quality gate baseline update jab sudhar ho.

### 6.4 Guides (G6/G9) — thin page nahi, asli guide
Pehle se 7 guides hain (jaipur-delhi, delhi-agra, delhi-chandigarh, delhi-haridwar, jaipur-agra, jaipur-ajmer, one-way-or-round-trip, group-travel). Naye:
- `kota-jaipur-by-road` (Kota ka sabse bada route)
- `jaipur-sikar-khatu-by-road`
- `how-to-reach-khatu-shyam` (4.4)
- `jaipur-airport-to-city` (airport ke liye support)
- `delhi-airport-to-jaipur` (T1/T3 se nikalna, expressway)
- Har guide: route page ko link, route page se guide ko link, `articleSchema`, author = company, `dateModified`.
- **Ho gaya kab:** 5 naye guide live, har ek ≥ 800 shabd asli jaankari, similarity < 0.35 dusre guides se.

### 6.5 Internal links
- Crawl audit mein 29 pages ke < 15 internal links in hain (sabse kam `/cab-service-in-sikar` 5, `/cab-service-in-ajmer` 5, `/kota-to-delhi-cab` 10). Fix: city page ↔ uske saare routes, route ↔ dono city, home "Searched most" mein Kota/Sikar, footer mein top 6 city + Airport + Khatu.
- **Ho gaya kab:** Tier 1 ka har page ≥ 15 internal links in (crawl).

---

## Phase 7 — Backlinks aur pehchaan (G8) (Hafta 2–12) [Aap, main list + text dunga]

7.1 **Citations (same naam / phone / address / website)** — main `docs/seo/CITATIONS.md` checklist dunga (har site ka link, kya bharna hai, copy-paste text):
Justdial, Sulekha, IndiaMART, TradeIndia, Yellow Pages India, Bing Places, Apple Business Connect, Facebook page (already), Instagram (already), LinkedIn company page, YouTube channel (gaadiyon / route ke chhote videos), Pinterest (optional), Quora (asli jawab, link sirf jahan kaam ka ho).
7.2 **Partner links** [Aap]: Ghoomo footer (✅), aapke agents/partners ki sites, Kota coaching ke PG/hostel listing, Jaipur hotels ka travel desk, Khatu dharamshala — sirf asli partnership.
7.3 **Local news / PR** [Aap, optional]: Kota ya Jaipur ke local news portal par "one-way taxi app" ki khabar (asli launch / milestone par).
7.4 **Play Store** [Aap]: dono apps ki listing mein website link (OWNER_STEPS §5).
7.5 **Mana:** link khareedna, PBN, HackMD/Slideshare spam, comment spam.
7.6 **Naapna** [Code]: GSC → Links export mahine mein ek baar → `WEEKLY.md`.
- **Ho gaya kab:** 10 citations live (har ek mein website), 3 asli partner links.

---

## Phase 8 — Hindi (G11) (Hafta 8+, gate ke baad) [Code]

8.1 Shart: Tier 1 English pages ≥ 80% index.
8.2 `/hi/` ke saath sirf: home, top 10 route, Jaipur/Kota/Delhi city, Airport, Khatu — **haath se jaanchi** Hindi (machine translation seedha nahi), `hreflang` en-IN / hi-IN dono taraf, alag sitemap `hi.xml`.
8.3 Keywords Hindi mein (जयपुर से दिल्ली टैक्सी, खाटू श्याम टैक्सी) — GSC mein dekhna aate hain ya nahi.
- **Ho gaya kab:** 15 Hindi pages, hreflang valid (crawl), index.

---

## Phase 9 — Technical (Hafta 2–6) [Code]

9.1 **Tier 3 kholna** — gate (Tier 1 ≥ 80% indexed, "Discovered" ghat raha) → `release-tier3.mjs` → 25-25 routes. Galat-fare routes (Phase 2) sirf fare theek hone ke baad.
9.2 **Naye routes** sirf jahan ≥ 20 trips / 90 din (insights) — Jaipur→Khatu, Jaipur→Pushkar, Delhi→Khatu, Jaipur→Jodhpur/Udaipur already. List script se.
9.3 **HTML halka karna** (median ~495 KB, inline script ~325 KB — Google ke liye bhaari):
- Pata lagana inline script mein kya hai (RSC payload: poora fare catalog / city list har page par?). Sirf us page ka data bhejo.
- Lakshya: Tier 1 HTML < 300 KB, LCP mobile ≤ 1.2 s (inlineCss on rehte hue).
- **Ho gaya kab:** crawl median HTML < 300 KB; Lighthouse mobile LCP ≤ 1.2 s on 5 Tier 1 pages.
9.4 **Schema** — har route page: `TaxiService` (provider = ORG, areaServed A+B, offers fare), `FAQPage`, `BreadcrumbList`; city: `TaxiService` + `FAQPage`; guide: `Article`. Rich Results Test 5 pages par (main karunga, result `evidence/` mein).
9.5 **Core Web Vitals** GSC report har mahine; mobile usability.
9.6 **404 / redirects** — GSC "Not found" list ke purane URLs ko sahi page par 301 (agar purane URL ka naya roop hai).
9.7 **Monitoring** — `monitor-domains.mjs` har hafte (apex, www, api, cert expiry 19 Feb 2027 se pehle renew check).

---

## Phase 10 — Har hafte ka routine (Somvaar, 30 minute) [Dono]

1. [Aap] GSC Pages + Performance export → `~/Downloads`.
2. [Code] `gsc-report.mjs` → `WEEKLY.md`: index count, top movers, keywords.csv update.
3. [Code] Gate check → Tier 3 release (agar gate mila).
4. [Code] Agle hafte ke GBP posts ka text.
5. [Aap] GBP posts, reviews ka jawab, 10 Request Indexing (naye/badle pages).
6. [Code] Production crawl + quality gate; koi regression to fix.
7. Mahine mein ek baar: competitor snapshot (1.3), Links export, fares review.

---

## Lakshya aur samay (andaaze — vaade nahi)

| Group | Abhi | 4 hafte | 8 hafte | 12 hafte |
|---|---|---|---|---|
| Jaipur↔Delhi route pages | homepage pos 1.5–2.3 | index | top 5 | **top 3** |
| Kota one-way / Kota taxi service | 2.4 / 8.8–9.4 | city page index | top 5 | top 3 |
| Jaipur Airport | 1.8–2.4 (bina page) | page live + index | top 3 | top 3 |
| Khatu Shyam / Reengus | 9–17 | pages live | top 10 | top 5 |
| Delhi↔Agra, Delhi↔Chandigarh, Jaipur↔Sikar, Kota↔Jaipur | index nahi | index | top 10 | top 5 |
| Taxi service in Jaipur / Delhi | 22–35 | 20–30 | 15–20 | top 10 + Maps pack |
| hello my cab | 3.7 | 2 | 1 | 1 |
| Clicks / mahina (sab) | ~33 | 60 | 150 | 300+ |

## Order (kaun pehle) — ek nazar mein

| Hafta | Code (main) | Aap |
|---|---|---|
| 1 | 1.1, 1.2, 1.4, 2.1, 3.1, 3.3, 1.5 (dry run) | Phase 0, 3.2 (template + GBP review link), 2.2 (fares), 5.1 |
| 2 | 2.3, 2.4, 4.1–4.5, 3.4, 6.5 | Airport/Khatu fares, 5.2 products, 5.4 photos, 1.3 snapshot |
| 3–4 | 6.1, 6.3, 9.3, 9.4, 1.5 (bhejna) | 5.3 posts, 7.1 citations, pickup areas confirm |
| 5–8 | 6.2, 6.4, 9.1, 9.6 | 5.3, 7.1–7.4, reviews ka jawab |
| 8+ | Phase 8, 9.2 | routine |

## Aapse chahiye (list, ek jagah)

1. Flagged fares ka faisla (2.2) — list Hafta 1 mein dunga.
2. Jaipur Airport → shehar ke ilaakon ke fare; airport par wait kitna free (4.1).
3. Jaipur↔Khatu, Delhi↔Khatu, Reengus→Khatu fare (4.2, 4.3).
4. Meta template approve + uska naam; GBP review link (3.2).
5. GBP: naam ka faisla, categories, service areas, products, photos, posts (Phase 5).
6. Pickup ilaake jahan se sach mein pickup hota hai — Jaipur, Kota, Delhi (6.1).
7. Company ke asli number (kab shuru, gaadiyan, drivers) — About page (6.2).
8. Citations (7.1), partner links (7.2).
9. Har Somvaar GSC export; mahine mein ek baar 12 search screenshots.

## Kya nahi karenge

Fake reviews / ratings / address / trips; ilaake-ilaake ke thin pages; ek route ke kai thin pages (competitors jaisa); link khareedna; GBP naam mein keyword; title mein wo price jo booking mein na mile; Tier 3 gate se pehle; bina jaanch Hindi machine translation.

---

**Agla kadam:** aap "haan" bolo to iska detailed prompt (`PROMPT_RANK_21NOV.md`) aur phir Hafta 1 ka code (1.1, 1.2, 1.4, 2.1, 3.1, 3.3, 1.5 dry-run).
