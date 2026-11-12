# hellomycabs.com — pages index karwana aur Google mein upar laana: jaanch + step-by-step plan

Date: **13 Nov 2026**. Status: **sirf plan, code mein koi badlav nahi.**

**Saboot kahan se liya:**
- Search Console ke 10 export (13 Nov 01:14–01:17, `~/Downloads/hellomycabs.com-*.zip`): Coverage + 5 drilldown, Performance (24 ghante / 7 din / 28 din / 3 mahine).
- Live site ka crawl: sitemap ke saare 145 URL, robots, headers, HTML.
- DNS (`dig`), AWS Amplify (sirf padha, `hmc-prod`).
- Website code (`hello-my-cabs-website`, HEAD `6c3ee86`), aur pichhla SEO kaam (`docs/seo/*`, 18 Oct).
- Bahar ki research (neeche Sources).

**Kya pakka nahi kiya ja sakta:** Google kisi page ko kab index karega, iski guarantee koi nahi de sakta. Ye plan wo sab theek karta hai jo humare haath mein hai.

---

## 0. Ek nazar mein — kya mila

| # | Asar | Kya hai | Saboot |
|---|---|---|---|
| **S1** | 🔴 Sabse bada | **`hellomycabs.com` (bina www) bilkul band hai** — DNS mein koi A record nahi, Amplify mein sirf `www` juda hai. Google ke paas homepage ka sabse bada roop yahi tha: 3 mahine mein **3,476 impressions** `http://hellomycabs.com/` par, aur 1,790 `https://www…` par. Ab Google jab apex kholta hai to kuch nahi milta. | `dig hellomycabs.com` → khaali; `curl` → connection fail; Amplify `d2ww272zq9wmdn` domain `hellomycabs.com` sub-domains: sirf `www`; GSC "Crawled – not indexed": `http://hellomycabs.com/` (last crawl 30 Oct) |
| **S2** | 🔴 Bada | **150 mein se sirf 1 page indexed.** 119 "Discovered – currently not indexed" (Google ne kabhi khola hi nahi), 27 "Crawled – currently not indexed" (khola, par rakha nahi). | GSC Coverage: 4 Oct se 148–149 not indexed, 1–2 indexed |
| **S3** | 🔴 Bada | **Homepage ki taakat do URL mein bant rahi hai** (http apex vs https www). Google ko ek pakka "asli" homepage nahi dikhta, isliye naya domain aur kamzor lagta hai. | GSC Pages: dono URL alag-alag rank |
| **S4** | 🟠 | **`api.hellomycabs.com/privacy` Google mein ja raha hai** (backend ka plain HTML page, Play Store ke liye). Duplicate privacy page, aur ek alag sub-domain index mein. | GSC: crawled 7 Sep; `curl` → 200, koi noindex nahi |
| **S5** | 🟠 | **145 pages ka bahut sa text same template se hai.** 258 page-pairs mein 50% se zyada text milta hai, aur 1,088 pairs mein 40% se zyada. Naye domain par Google aise "programmatic" pages ko der se kholta hai. | Live crawl, 5-word shingle Jaccard: sabse zyada 0.64 (jaipur–delhi innova vs tempo), 0.61 (delhi–agra vs agra–delhi) |
| **S6** | 🟠 | **Har page ~600 KB HTML** hai: 391 KB inline RSC payload (page ka data dobara JSON mein), 101 KB inline CSS, aur sirf 116 KB asli markup. Google ka crawler ek page par zyada bytes kharch karta hai, aur phone par bhi bhaari hai. | `kota-to-sikar-cab` ka breakdown |
| **S7** | 🟠 | **Jo keywords aa rahe hain unke liye page hi nahi hai:** "jaipur airport taxi" (pos 2, 49 imp), "taxi service in jaipur airport" (pos 1.8, 31), "taxi service in reengus" (49 imp), "taxi in khatu" (15), "khatu shyam taxi". Google abhi in par homepage dikha raha hai. | GSC Queries (28 din / 3 mahine) |
| **S8** | 🟠 | **Brand naam par bhi #1 nahi:** "hello my cab" average position **3.9**. Google ko brand ki pehchaan (entity) kamzor dikhti hai: Google Business Profile, social profiles, citations aur backlinks kam hain. | GSC Queries |
| **S9** | 🟡 | **Position 1–3 par impressions, par clicks lagbhag 0:** "jaipur delhi cab" pos 1.7 → 98 imp, 2 clicks; "one way taxi service in kota" pos 2.4 → 96 imp, 0 clicks. Yahan homepage dikh raha hai, route page nahi (wo index nahi). Title us search se match nahi karta. | GSC Queries |
| **S10** | 🟡 | Schema mein har route page par `Product` + `Offer` hai (taxi seva "product" nahi). `TaxiService` 155 baar (city page par do). Google merchant/product report mein galat item dikha sakta hai. Index ka seedha karan nahi, par saaf karna chahiye. | Live JSON-LD count |
| **S11** | 🟡 | Sitemap mein `lastmod` nahi (18 Oct ko galat tareekh ki wajah se hataya gaya tha). Sab URL ek hi sitemap mein hain, isliye GSC mein group-wise pata nahi chalta ki kaunsa hissa index ho raha hai. | live `sitemap.xml` |
| **S12** | 🟡 | 2 route-guide pages aur 6 nayi-route pairs par sirf 11–13 andar ke links aate hain (sabse kam). | Live crawl inbound count |
| **S13** | ℹ️ | GSC mein 1 "404", 1 "Blocked by robots.txt", 1 "Page with redirect". Export mein URL ki list khaali hai, isliye exact URL GSC mein khol kar dekhna hoga. "Page with redirect" shayad `http://www` → `https://www` hai, jo sahi hai. | Drilldown exports (rows 0) |

**Jo pehle se sahi hai (dobara nahi chhedna):**
- 145/145 pages 200 dete hain; `index, follow`; canonical khud par.
- Title unique hain (31–60 akshar), description unique (126–155).
- Har page par ek H1; breadcrumb, FAQ aur TaxiService schema.
- robots.txt sab allow karta hai aur sitemap batata hai; `www` + HTTPS + HSTS lage hain.
- Server tez hai (median 330 ms).
- `/rajasthan-tours`, `/char-dham-yatra` aur `/photo-credits` jaan-boojh kar noindex hain (pichhla faisla).
- 18 Oct ka SEO recovery kaam (schema saaf, sitemap saaf, robots exact host) live hai.

**Saar:** pichhla kaam page ke andar ki galtiyan theek kar chuka hai. Ab rukawat **page ke bahar** hai:
1. domain ka adha hissa band hai (S1, S3, S4);
2. naya domain hai jiski pehchaan aur backlinks kam hain (S8);
3. 145 milte-julte pages ek saath hain (S5);
4. pages bhaari hain (S6).

Google aise naye domain ke pages ko "baad mein dekhenge" (Discovered) wali line mein daal deta hai.

---

## 1. Keyword research — GSC ke asli search se

3 mahine ke data se. **Imp** = kitni baar dikhe, **Pos** = average position, aur "Abhi kaunsa page" = Google kis URL ko dikha raha hai.

| Group | Keywords (Imp · Pos) | Abhi kaunsa page | Sahi page |
|---|---|---|---|
| **A. Jaipur ↔ Delhi** | delhi jaipur taxi (115 · 2.4), delhi jaipur cab (109 · 2.1), jaipur delhi cab (98 · 1.7), delhi jaipur one way cab (61 · 4.0), jaipur delhi taxi (46 · 1.6), jaipur to delhi taxi, taxi delhi to jaipur price | Homepage | `/jaipur-to-delhi-cab`, `/delhi-to-jaipur-cab` (dono "crawled – not indexed") |
| **B. Kota** | one way taxi service in kota (96 · 2.4), kota taxi service (85 · 8.9), best taxi service in kota (80 · 9.4), kota taxi (50 · 9.2), taxi service in kota (42 · 5.8), kota taxi booking (15 · 8.9), kota cab service, kota taxi service number, kota cabs | Homepage | `/cab-service-in-kota` (discovered – not indexed) |
| **C. Jaipur Airport** | jaipur airport taxi (49 · 2.1), taxi service in jaipur airport (31 · 1.8), jaipur airport taxi service (25 · 11), airport taxi service in jaipur (18 · 2.1), airport taxi | Homepage | **Page hi nahi hai** → naya `/jaipur-airport-taxi` |
| **D. Jaipur shehar** | taxi service in jaipur (112 · 31.7), jaipur taxi service (81 · 20), one way taxi service in jaipur (34 · 17), cab service in jaipur (28 · 35), one way taxi service jaipur (23 · 22) | Homepage | `/cab-service-in-jaipur` |
| **E. Delhi** | taxi service in delhi (36 · 34), delhi taxi service (31 · 22), one way taxi service delhi (16 · 3.6), south delhi taxi service (16 · 22.5), taxi service vasant kunj (14 · 3.7), cab service in delhi | Homepage | `/cab-service-in-delhi` |
| **F. Khatu Shyam / Reengus / Sikar** | taxi service in reengus (49 · 16), taxi in khatu (15 · 16.8), khatu shyam taxi service contact number, taxi service khatu shyam ji, hello my taxi sikar | Homepage | **Page nahi** → naya `/khatu-shyam-ji-taxi` (+ `/jaipur-to-khatu-shyam-cab`); `/cab-service-in-sikar` |
| **G. Aam (generic)** | one way taxi service (28 · 6), one way taxi (24 · 3.7), one way cab booking (12 · 3.5), taxi service near me (31 · 28), taxi, oneway taxi | Homepage | Homepage + `/routes` |
| **H. Brand** | hello my cab (126 · 3.9, 19% CTR), hello cab, hello my cab delhi, hello my taxi sikar | Homepage | Homepage — **pos 1 chahiye** |

**Seekh:**
1. Kota aur Jaipur Airport mein Google humein pehle se **pos 2** deta hai, sirf homepage se. Asli page index hua to clicks aayenge. Ye sabse jaldi faayda dene wale groups hain.
2. Jaipur aur Delhi shehar wale bade keywords par hum 20–35 par hain. Yahan bade players hain (aggregators, Justdial, Google Maps pack), isliye mehnat aur samay lagega.
3. Khatu Shyam / Reengus ek naya mauka hai: bahut bhakt aate hain, aur competitors ke alag pages hain (CabBazar, HurryUp Cabs, Jaipur Cabs 24Seven ki GBP posts).
4. Aaj ke aankde chhote hain: 3 mahine mein 5,193 impressions, 73 clicks. Plan ka maksad pehle **index**, phir **position**, phir **clicks** hai.

**Competitors jo in keywords par dikhte hain:** oneway.cab, CabBazar, HurryUp Cabs, Rajputana Cabs, Triveni Cabs, TaxiBazaar, MakeMyTrip/EaseMyTrip, aur Google Business Profile wali local cab companies. Inke route pages par asli fare, distance, toll aur route ki baatein hain, aur kai Google Business Profile posts se bhi rank karte hain.

---

## 2. Step-by-step plan

**Order ka niyam:** pehle domain theek (bina iske baaki sab bekaar), phir Google ko saaf signal, phir sabse zyada maang wale pages ko mazboot banana, phir naye pages, aur aakhir mein bahar ki pehchaan (Business Profile, backlinks). Har step ke saath "kaise naapenge".

### STEP 1 — Apex domain chalu karo, sab ek jagah bhejo (S1, S3) — 🔴 pehle din
1. **Faisla (D1):** `hellomycabs.com` aur `http://…` ko `https://www.hellomycabs.com` par **301** bhejna.
   - **Rasta A (sujhav, sabse saral):** Hostinger DNS mein `hellomycabs.com` ka **A record → 43.204.57.108** (naya API server, jahan Caddy already Let's Encrypt chalata hai). Caddy mein ek block:
     ```
     hellomycabs.com {
         redir https://www.hellomycabs.com{uri} permanent
     }
     ```
     Caddy khud SSL le leta hai. Server config ka badlav hai, isliye aapki manzoori chahiye.
   - **Rasta B:** Amplify (`d2ww272zq9wmdn`) mein domain association mein apex (`""` prefix) jodo, saath mein Amplify ka "apex → www 301" niyam. Hostinger par apex ke liye ALIAS/ANAME ya Amplify ka diya record chahiye. Ghoomo par yahi cross-account wala rasta atka tha, isliye Rasta A tez hai.
2. **Jaanch:** `curl -I http://hellomycabs.com/kota-to-sikar-cab` aur `https://hellomycabs.com/…` dono → `301 Location: https://www.hellomycabs.com/kota-to-sikar-cab` (path ke saath, ek hi hop).
3. GSC mein `http://hellomycabs.com/` → URL Inspection → "Test live URL" → redirect dikhe.
4. **Naapna:** 2–4 hafte mein GSC Pages mein `http://hellomycabs.com/` ke impressions `https://www` par shift hon.

### STEP 2 — `api.hellomycabs.com` ko Google se bahar rakho (S4) — backend, chhota
1. Backend (`src/app.ts`): **har** response par `X-Robots-Tag: noindex, nofollow` header (ek middleware). API ka koi page search mein nahi chahiye.
2. `/privacy` (`src/routes/legal.route.ts`): HTML mein `<link rel="canonical" href="https://www.hellomycabs.com/privacy">`.
   - Page band nahi karna, kyunki Play Store listing ka privacy link yahi ho sakta hai.
   - **Owner (D2):** Play Console mein privacy URL `https://www.hellomycabs.com/privacy` kar dein; tab `/privacy` ko 301 bhi kar sakte hain.
3. `api.hellomycabs.com/robots.txt` → `User-agent: * Disallow: /`. **Ye noindex header lagne aur Google ke page hata dene ke baad hi.** Pehle block kiya to Google noindex padh hi nahi payega.
4. **Jaanch:** `curl -I https://api.hellomycabs.com/privacy` → `x-robots-tag: noindex`.

### STEP 3 — Search Console theek se set karo (S13) — owner + main, 1 ghanta
1. **Domain property** (`hellomycabs.com`, DNS TXT se) banao, agar abhi sirf URL-prefix hai. Isse apex, http, www aur api sab ek jagah dikhenge.
2. 404, robots-blocked aur redirect waale 3 URL GSC mein khol kar likh lo; tabhi theek karo (andaze se kuch nahi badalna).
3. Sitemap dobara submit karo (Step 6 ke baad naye group-sitemaps).
4. Bing Webmaster Tools mein site jodo (GSC se import). Bing/Yandex ke liye **IndexNow** (Step 6.4). Google IndexNow nahi padhta, par Bing aur ChatGPT search waghera ke liye faydemand hai.

### STEP 4 — Pehle 25 "priority" pages chuno aur unhe sabse mazboot banao (S2, S5, S9)
Naye domain par Google pehle kuch pages par bharosa karta hai, phir baaki par. 145 ek saath dhakelne ki jagah **Tier 1** ko sabse achha banao.

**Tier 1 (≈25 pages; GSC maang + business ke hisaab se):**
- `/` (homepage), `/routes`
- Shehar: `/cab-service-in-kota`, `/cab-service-in-jaipur`, `/cab-service-in-delhi`, `/cab-service-in-sikar`, `/cab-service-in-agra`, `/cab-service-in-chandigarh`
- Route: `/jaipur-to-delhi-cab`, `/delhi-to-jaipur-cab`, `/jaipur-to-delhi-airport-cab`, `/delhi-airport-to-jaipur-cab`, `/kota-to-jaipur-cab`, `/jaipur-to-kota-cab`, `/kota-to-delhi-cab`, `/delhi-to-kota-cab`, `/jaipur-to-agra-cab`, `/delhi-to-agra-cab`, `/delhi-to-chandigarh-cab`, `/delhi-to-haridwar-cab`, `/jaipur-to-sikar-cab`
- Naye (Step 5): `/jaipur-airport-taxi`, `/khatu-shyam-ji-taxi`, `/jaipur-to-khatu-shyam-cab`
- Gaadi: `/dzire-taxi`, `/innova-crysta-taxi`

**Har Tier 1 page par (template ke upar asli, us route ki apni jaankari):**
1. **Us route ke asli facts**, jo kisi aur page par na hon:
   - pickup ke aam points (Jaipur: Sindhi Camp, railway station, airport T2; Kota: Kota Junction, coaching area/Landmark City);
   - rasta (expressway ya NH), toll plaza ke naam aur lagbhag rakam, khane ke ruke (dhaba/food court);
   - kitna samay, din vs raat, aur kis season mein bheed.
   - Ye backend ke asli trips aur drivers se aaye, **mann se nahi bharna** (D3).
2. **Distance sach ho.** Jaipur–Delhi par hum 306 km likhte hain; competitors 269–280 km likhte hain (Delhi–Jaipur Expressway / NH48). Pickup/drop point ke hisaab se saaf likho ("Jaipur shehar se Delhi Connaught Place, NH48 se ~280 km; expressway se ~300 km"). Galat number bharosa todta hai (D3).
3. **Asli reviews / photos:** us route par chali gaadi ya driver ki photo (owner ke photo), aur us route ke asli customer reviews, jinka source pakka ho (18 Oct ki review-provenance shart).
4. **Us shehar ki FAQ:** maslan Kota mein "coaching student ke parent ke liye drop", "Kota se Jaipur airport subah ki flight". Sab pages par same FAQ nahi.
5. **Andar ke links:** homepage, `/routes` aur shehar wale page se Tier 1 pages ko upar, saaf anchor text ke saath ("Kota taxi service", "Jaipur to Delhi cab"). Tier 1 pages aapas mein bhi juden.
6. **Naapna:** Tier 1 ka text-overlap (Step 0 wala script) **< 35%** ho; har page par kam se kam 300 shabd sirf us route ke.

### STEP 5 — Naye pages, jinki maang already aa rahi hai (S7)
1. **`/jaipur-airport-taxi`** (group C):
   - Jaipur International Airport (T1/T2) pickup aur drop;
   - shehar ke elaakon ke fixed fare (Malviya Nagar, Mansarovar, Vaishali Nagar, C-Scheme…) aur bahar ke sheharon ke one-way fare;
   - flight late hone par kya hota hai, aur raat 24×7.
   - Fare backend ke asli rates se (D4).
2. **`/khatu-shyam-ji-taxi`** + **`/jaipur-to-khatu-shyam-cab`** (group F):
   - Jaipur → Chomu → Ringas/Reengus → Khatu (~90–95 km);
   - Reengus station se Khatu, darshan ka samay aur ekadashi/phalgun mela ki bheed;
   - round-trip same-day option, aur Salasar Balaji ke saath combo.
   - **Tabhi banana jab ye seva sach mein di jaati ho** (D4).
3. Shehar page `/cab-service-in-sikar` mein Reengus/Khatu ka hissa jodo.
4. Har naya page sitemap, `/routes` aur homepage ke links mein jode; schema `TaxiService` + `BreadcrumbList` + `FAQPage`.
5. **Mana:** keyword bhar ke pages (maslan "taxi service vasant kunj" ke liye alag thin page) **nahi** banane. Delhi ke elaakon ka zikr `/cab-service-in-delhi` mein ek "pickup areas" hisse se karo.

### STEP 6 — Sitemap aur crawl signal saaf (S11, S12)
1. **Sitemap index** + group sitemaps:
   `sitemap-core.xml` (home, routes, about, contact, policies), `sitemap-cities.xml`, `sitemap-routes.xml`, `sitemap-vehicles.xml`, `sitemap-guides.xml`.
   GSC mein har group ka "indexed" alag dikhega.
2. **`lastmod`** wapas, par sirf **asli** content badalne ki tareekh se (content file ka commit date / fare badalne ki tareekh). Build ki tareekh nahi (wahi galti 18 Oct ko pakdi gayi thi).
3. Kam links wale pages (guides, Jodhpur/Udaipur/Ludhiana/Mohali/Dehradun pairs) ko related routes aur shehar pages se jodo.
4. **IndexNow** (Bing): deploy par badle URL ping karne ki script (`scripts/seo/indexnow.mjs`), key file `public/<key>.txt`.
5. **Naapna:** GSC Sitemaps → har group "Success", aur "Discovered" ka count hafte-dar-hafte ghate.

### STEP 7 — Pages halke karo (S6)
1. Har page ka 391 KB inline RSC payload ka matlab hai ki koi bada data client component ko prop mein ja raha hai: poori city list, saare routes ke fare, ya booking widget ka catalogue.
   - `RoutePage` / `CityPage` / `BookingWidget` mein dekho ki kaunsa prop bada hai.
   - Bada data server par rakho; client ko sirf us page ki zaroori cheez do.
   - City search ke liye list ko `/api/...` se tab lao jab user box kholta hai.
2. Inline CSS (101 KB) sahi faisla tha (LCP 1.6 s → 0.8 s), par CSS mein bina use ka style hatao (Tailwind content paths check karo).
3. **Lakshya:** route page HTML ≤ 250 KB (aaj 608 KB); LCP pehle jaisa ya behtar.
4. **Naapna:** `npm run audit:speed` / `audit:lighthouse` pehle aur baad mein; PageSpeed Insights field data 28 din baad.

### STEP 8 — Schema saaf (S10)
1. Route aur gaadi pages se `Product` hatao.
   - Fare `Service` → `offers` (`Offer`: `price`, `priceCurrency`, `priceSpecification` "from"), ya `TaxiService` → `hasOfferCatalog`.
   - Taxi ek seva hai, product nahi; merchant listing report mein galat item nahi aayega.
2. City page par `TaxiService` ek hi baar.
3. **`Organization`** schema homepage par:
   - `name` "Hello My Cab", `alternateName` ["HelloMyCab", "Hello My Cabs"], `logo`, `url`;
   - `sameAs`: Google Business Profile, Play Store app, Instagram/Facebook/YouTube/LinkedIn (jo asli hon);
   - `contactPoint` (support phone).
   - Brand position (S8) ke liye zaroori.
4. Rich Results Test aur Schema validator par Tier 1 pages check karo.

### STEP 9 — Title / description sudhaar (S9) — CTR ke liye
Abhi ke title saaf hain; inhe **search ke shabdon** aur **bharose** ke hisaab se thoda badalna hai. ≤ 60 akshar, description ≤ 155. Har badlav GSC mein 4 hafte naapo (CTR).

| Page | Abhi | Naya (draft) |
|---|---|---|
| `/` | Hello My Cab — One Way Taxi & Outstation Cab Booking | **One Way Taxi & Outstation Cab — Jaipur, Delhi, Kota \| Hello My Cab** |
| `/` description | One way taxi and outstation cab booking with a driver — fixed fare… | **Book one way taxi & outstation cab with driver. Jaipur–Delhi from ₹2,800, Kota, Agra, Chandigarh. Fixed fare, no return charge, 24×7.** |
| `/cab-service-in-kota` | Taxi Service in Kota @ ₹2,950 \| One Way & Local Cab | **Kota Taxi Service — One Way Cab from ₹2,950, 24×7** |
| `/jaipur-to-delhi-cab` | Jaipur to Delhi Cab @ ₹2,800 \| One Way Taxi, 306 km | **Jaipur to Delhi Cab ₹2,800 — One Way Taxi, No Return Fare** (distance title se hata kar description mein, sahi number ke saath) |
| `/delhi-to-jaipur-cab` | (same pattern) | **Delhi to Jaipur Cab ₹2,800 — One Way Taxi, Fixed Fare** |
| `/cab-service-in-jaipur` | (dekhna) | **Taxi Service in Jaipur — One Way & Outstation Cab \| 24×7** |
| `/jaipur-airport-taxi` (naya) | — | **Jaipur Airport Taxi — Pickup & Drop, Fixed Fare 24×7** |
| `/khatu-shyam-ji-taxi` (naya) | — | **Khatu Shyam Ji Taxi from Jaipur & Reengus — One Way Fare** |

1. Brand naam aakhir mein, jahan jagah ho; shuru mein woh shabd jo log search karte hain.
2. Price title mein tabhi, jab woh asli aur aaj ka ho (`revalidate` 24 h). Purana price = bharosa tootna.
3. Description mein ek "kyon hum" (fixed fare, no return fare, 24×7, chhota advance) aur ek CTA.
4. `npm run seo:titles` (pehle se hai) se 145 ke candidate banao; Tier 1 haath se.

### STEP 10 — Tier 2 / kam maang wale pages ka faisla (S5) — owner decision D5
81 one-way pairs mein se kai (maslan `sikar-to-noida`, `haridwar-to-kota`, `kota-to-haridwar`) ki GSC mein ek bhi impression nahi hai, aur ye ek-doosre se 50–60% milte hain.
- **Sujhav:** jin pairs par **pichhle 90 din mein na booking na impression**, unhe abhi `noindex, follow` + sitemap se bahar.
  - Page rahega, links chalenge, aur booking bhi ho sakti hai.
  - Tier 1 mazboot hone ke baad (6–8 hafte) group-wise wapas sitemap mein, asli facts ke saath.
- Isse Google ki nazar mein site "kam par achhe pages" wali banti hai.
- Booking data backend se chahiye: ek read-only report, **aapki permission ke baad**.
- **Mana:** pages delete ya redirect nahi; bina data ke andaze se noindex bhi nahi.

### STEP 11 — Google Business Profile aur local pehchaan (S8) — owner, sabse bada bahari kaam
Taxi keywords ("kota taxi service", "taxi service near me") par Google pehle **Maps ka local pack** dikhata hai. Bina Business Profile ke hum wahan nahi aate.
1. **Google Business Profile** (agar nahi hai to banao; hai to verify karo):
   - category "Taxi service" (primary), "Car rental agency" / "Taxi stand" (secondary);
   - asli office address + service areas (Jaipur, Kota, Delhi, Sikar…; poora state nahi chalta);
   - phone, website `https://www.hellomycabs.com`, ghante 24×7;
   - photos (gaadiyan, office, driver), services list with fare, Q&A.
   - **Har hafte 1–2 post:** route offer, Khatu mela, airport.
2. **Reviews:** har completed booking ke baad customer ko Google review link (app/WhatsApp/SMS). **Kabhi nakli review nahi.** Google aur policy dono ke khilaf hai.
3. Agar Kota mein asli office/driver base hai to wahan alag verified profile (Kota group B ke liye bahut kaam ka). Nakli address par profile nahi.
4. **Citations / NAP** (naam, pata, phone har jagah ek jaisa): Justdial, Sulekha, IndiaMART (agar fit ho), Bing Places, Apple Business Connect, Facebook page, Instagram, YouTube.
5. **Play Store listing** mein website link, aur website ke footer mein app link + `Organization.sameAs`.

### STEP 12 — Backlinks aur bharosa (S8) — 2–3 mahine, lagatar
1. Asli, kaam ke links: local news/blog (Kota coaching parents ke liye safar guide, Khatu mela guide), tourism bloggers, hotel/dharamshala partners (Khatu, Haridwar), corporate clients, college/coaching tie-ups.
2. Humare `/guides` ko behtar banao, kyunki log inhe link karte hain: "Jaipur se Khatu Shyam kaise jaayein", "Kota se Jaipur airport subah ki flight", "Delhi–Jaipur expressway toll 2026".
3. **Mana:** paid link farms, PBN, "1000 backlinks", Fiverr packages. Naya domain inse penalty kha sakta hai.
4. Social: Instagram/YouTube shorts (route video, gaadi ki safai), har post mein website link.

### STEP 13 — Index karwana: haath se + har hafte (S2)
1. Step 1–2 deploy hone ke baad GSC URL Inspection → "Request indexing":
   - pehle homepage aur `/routes`, phir Tier 1 (din mein ~10, Google ki seema);
   - order: Kota → Jaipur–Delhi → Jaipur airport → Khatu → baaki.
2. Coverage → "Discovered" aur "Crawled – not indexed" → **Validate fix** (Step 4–6 ke baad).
3. **Har hafte (Monday) ek line ki report `docs/seo/WEEKLY.md` mein:** indexed count, Tier 1 mein kitne indexed, top 10 query positions, clicks.
4. Jo page 4 hafte baad bhi "Crawled – not indexed" rahe, uska content dobara likho (overlap check), title aur andar ke link badlo, phir request.

### STEP 14 — Naapna aur lakshya
| Kab (Step 1 deploy se) | Lakshya (guarantee nahi) |
|---|---|
| 1 hafta | apex/http 301 sahi; api noindex; sitemaps "Success"; Tier 1 request ho gaye |
| 2–3 hafte | Tier 1 mein se 10+ crawl; indexed 1 → 10+; "hello my cab" pos ≤ 2 |
| 4–6 hafte | indexed 30+; Kota aur Jaipur airport queries par apna page dikhe (homepage nahi); CTR 1.4% → 3%+ |
| 8–12 hafte | indexed 80+ (Tier 2 wapas); clicks 25/maheene → 200+/maheene; Business Profile se calls |

---

## 2a. Sudhaar (prompt likhte waqt code padh kar, 13 Nov)
- **Google Business Profile pehle se hai:** "Hello My Cab -Taxi service in jaipur", 4.7★, 156 reviews, website yahi site. Saath mein `Organization`/`TaxiService` schema ke `sameAs` mein Play Store, GBP (kgmid), Instagram aur Facebook already hain (`src/lib/company.ts`). Isliye Step 11 "banao" nahi, **behtar karo** hai: categories, service areas, posts, reviews ka flow, aur Kota mein asli base ho to wahan alag profile. S8 ka karan GBP ka na hona nahi, balki backlinks/citations ki kami aur domain ka adha band hona (S1) hai.
- **Route pages par `Product` schema owner ka faisla (D2, 9 Oct) tha**, jo "Starting from ₹X" line ke liye lagaya gaya. Step 8 mein use hatana ab **owner decision D8** hai, default nahi.
- **Pehle se bana tooling** (dobara nahi banana):
  - IndexNow (`src/lib/indexnow.ts`, `scripts/seo/indexnow.mjs`, key file `public/`);
  - weekly routine (`scripts/seo/weekly.md`, `gsc-report.mjs`, `title-candidates.mjs`);
  - title override (`src/content/routes/titles.ts`);
  - thin-route noindex list (`NOINDEX_THIN` in `src/lib/held-routes.ts` + `thin-routes.mjs`);
  - driver road facts (`pull-driver-data.mjs` → `driver.generated.ts`, abhi khaali);
  - domain monitor (`monitor-domains.mjs`), aur after-deploy checks.
- **City/airport pages backend ke priced routes se bante hain** (`citiesWithPages`, kam se kam 3 route). Jaipur Airport ya Khatu ka page ya to backend mein city + fares jodne se banega, ya hand-written page se. Dekho prompt Step 5.

## 3. Owner ke faisle

- **D1:** apex redirect — Rasta A (API server Caddy, sujhav) ya Rasta B (Amplify apex). Dono mein Hostinger DNS badalna hai.
- **D2:** Play Console privacy URL `www` par shift karna.
- **D3:** route ke asli facts (pickup points, toll, ruke, distance) kaun dega: drivers/desk se ek baar ki list.
- **D4:** Jaipur Airport aur Khatu Shyam pages ke fare. Kya Khatu seva sach mein chalti hai?
- **D5:** kam maang wale ~50 pairs ko abhi noindex (sujhav). Backend booking data padhne ki permission.
- **D6:** Google Business Profile ka access / naya banana, office address, aur review maangne ka tareeka.
- **D7:** social profiles (jo asli hon) ke link, `sameAs` ke liye.

## 4. Kya NAHI karna
- Nakli reviews, nakli address, keyword bhare thin pages, paid/PBN backlinks, cloaking.
- Pages delete ya redirect karna bina data ke.
- `lastmod` mein build date.
- Pehle se sahi cheezein dobara chhedna (canonical, robots, H1, inline CSS ka faisla).
- Ek hi din mein 145 ke 145 title badalna. Tier 1 se shuru karo aur naapo.

## 5. Kaam ka order (saransh)
1. **Din 1:** Step 1 (apex 301), Step 2 (api noindex), Step 3 (GSC domain property, Bing).
2. **Hafta 1:** Step 9 (Tier 1 titles), Step 8 (schema), Step 6 (sitemaps + lastmod + IndexNow), Step 13 (request indexing).
3. **Hafta 1–2:** Step 5 (Jaipur airport, Khatu pages), Step 4 (Tier 1 asli content — D3 ka data chahiye), Step 11 (Business Profile).
4. **Hafta 2–3:** Step 7 (pages halke), Step 10 (Tier 2 faisla).
5. **Lagatar:** Step 12 (backlinks), Step 13 (weekly), Step 11 (posts/reviews).

---

### Sources
- [Ahrefs — Discovered, currently not indexed](https://ahrefs.com/blog/discovered-currently-not-indexed/)
- [Prerender — avoid "discovered currently not indexed"](https://prerender.io/blog/how-to-avoid-discovered-currently-not-indexed/)
- [Victorious — Search Console indexing errors](https://victorious.com/blog/search-console-indexing-errors/)
- [BrightLocal — service-area listing in Google Business Profile](https://www.brightlocal.com/learn/google-business-profile/getting-started/how-to-set-up-and-optimize-a-service-area-listing-in-google-business-profile/)
- [Google Business Profile guidelines (support.google.com)](https://support.google.com/business/answer/3038177?hl=en)
- Competitor pages: [oneway.cab Jaipur–Delhi](https://oneway.cab/jaipur/jaipur-to-delhi-taxi), [CabBazar Kota](https://cabbazar.com/one-way-cab-in-kota), [HurryUp Cabs Jaipur–Khatu](https://hurryupcabs.com/cabs/outstation/jaipur-to-khatu-shyam-ji), [Triveni Cabs Delhi–Jaipur fare guide](https://www.trivenicabs.in/blog/delhi-to-jaipur-cab-fare-guide-2026), [CabBazar Jaipur–Reengus](https://cabbazar.com/taxi/cab/jaipur-to-reengus)
