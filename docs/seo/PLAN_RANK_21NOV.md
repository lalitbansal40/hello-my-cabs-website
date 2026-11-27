# Plan — hellomycabs.com ko keywords aur 100 routes par top par laana (21 Nov 2026)

Pichhla kaam (indexing, `LEDGER_INDEXING_20NOV.md`) is plan ki neev hai. Wo kaam Google ko pages **index** karwata hai. Ye plan un pages ko **top 3** tak le jaane ka hai.

---

## 0. Abhi hum kahan hain (asli data)

**Search Console (3 mahine, 20 Nov export):** 6,543 impressions, 100 clicks. Saare clicks homepage se aaye, kyunki koi route ya city page index hi nahi tha.

| Keyword | Impressions | Hamari position | Matlab |
|---|---|---|---|
| hello my cab | 143 | 3.7 | Brand par bhi #1 nahi |
| delhi jaipur taxi / cab, jaipur delhi cab / taxi | 135 + 131 + 123 + 68 | **1.5–2.3** | Homepage se hi top 3 mein! Route page index hua to clicks badhenge |
| one way taxi service in kota | 105 | **2.4** | Top 3 |
| kota taxi service, best taxi service in kota, kota taxi | 110 + 88 + 52 | 8.8–9.4 | Page 1 ke neeche |
| jaipur airport taxi, taxi service in jaipur airport | 64 + 45 | **1.8–2.4** | Page hi nahi hai, phir bhi top 3 |
| jaipur airport taxi service | 36 | 10.3 | |
| taxi service in jaipur, jaipur taxi service | 128 + 98 | 22–32 | Page 3 |
| taxi service in delhi, delhi taxi service | 42 + 41 | 17–35 | Page 2–4 |
| taxi service in reengus, taxi in khatu, khatu shyamji | 52 + 17 + 15 | 9–17 | Page hi nahi hai |
| taxi service near me | 47 | 26 | Maps pack wala keyword |

**Saaf seekh:**
1. **Jaipur↔Delhi, Kota one-way aur Jaipur Airport par Google humein pehle se top 3 mein rakh raha hai, sirf homepage se.** Sahi page index hote hi yahan sabse jaldi clicks aayenge.
2. "Taxi service in Jaipur/Delhi" jaise bade shehar wale keywords par hum page 2–4 par hain. Yahan aggregators aur Google Maps ka local pack hai, isliye sabse zyada mehnat aur samay lagega.
3. Do keyword groups ka **page hi nahi hai**: Jaipur Airport aur Khatu Shyam / Reengus.

---

## 1. Research — in keywords par abhi kaun top par hai

> **Note:** Ye results ek web search tool se liye gaye hain, Google India ke asli result se thoda alag ho sakte hain. Plan ke Step 1.1 mein India se (incognito, mobile) har keyword ka asli top 10 note karna hai.

| Keyword | Top par aane wali sites |
|---|---|
| jaipur to delhi one way cab | Uber Intercity, MakeMyTrip, **oneway.cab** (2 pages), Gozo Cabs, WTI Cabs, **Triveni Cabs**, chhoti local sites (jaipurtodelhicabs.com, travelgujju) |
| delhi to agra one way cab | oneway.cab (2 pages), Gozo, **CabBazar**, Savaari, WTI, Triveni, Suri Tours, eTaxiGo, GTC Cabs |
| delhi to chandigarh one way cab | Uber (4 blog pages), MakeMyTrip, CabBazar, EaseMyTrip, **Triveni (4 pages)**, oneway.cab |
| kota to jaipur taxi | MakeMyTrip, **Jaipur Cabs 24Seven ki Google Business Profile posts**, Uber, CabBazar, oneway.cab, EaseMyTrip, Rajputana Cabs, rome2rio |
| jaipur to sikar taxi | **Jaipur Cabs 24Seven GBP post (#1)**, oneway.cab, Goibibo, MakeMyTrip, CabBazar, Rajputana Cabs, HurryUp Cabs, Savaari blog |
| one way taxi service in kota | ~10 chhoti one-way sites (chikucab, onesidetaxi, matrixcab, saarthi.cab, bookoneway.cab, oneside.taxi, zeotaxi, hiremetaxi) — **koi bada naam nahi** |
| taxi service in jaipur (one way) | CabBazar, onesidetaxi, Rajputana Cab, mscabsjaipur, devtouristcompany, omtaxizone, ktscabs, cabjaipur, 24cabservice |
| jaipur airport taxi | MakeMyTrip (airport page), Welcome Pickups, **Savaari (airport page)**, Rajputana Cabs, Triveni (airport page), jaipurday, shubhyatracabs |
| jaipur to khatu shyam taxi | MakeMyTrip, taxirajasthan, eagletours, **CabBazar**, khatu.org guide, mykhatutrip guide, HurryUp Cabs, omtaxizone, magickworld guide |

### 1.1 Un sites ke paas kya hai jo hamare paas nahi

| # | Unke paas | Hamare paas | Kitna zaroori |
|---|---|---|---|
| G1 | **Pages Google index mein hain**, kuch saal purane | Route/city pages abhi index ho rahe hain | 🔴 Sabse pehle (pichhle plan mein chal raha hai) |
| G2 | **Jaipur Airport** ke alag pages (MMT, Savaari, Triveni) | Page nahi hai | 🔴 Hum pehle se #2 par hain bina page ke |
| G3 | **Khatu Shyam / Reengus** pages (CabBazar ₹1,335, HurryUp ₹1,200, MMT ₹1,487) + "how to reach" guides | Page nahi hai | 🔴 Bhakton ka bada traffic |
| G4 | **Google Business Profile** — Jaipur Cabs 24Seven ki GBP posts "kota to jaipur taxi" aur "jaipur to sikar taxi" par **organic** result mein aa rahi hain | GBP **hai** ("Hello My Cab -Taxi service in jaipur", 4.7★, 156 reviews, Oct 2026) par posts, products, service areas aur review link ka use nahi ho raha; website par rating bhi nahi dikhti (`company.googleRating`, `reviewUrl` = null) | 🔴 Sabse sasta aur tez rasta |
| G5 | **Sasti "starting" price** title mein: Delhi→Agra ₹1,499–2,149, Jaipur→Sikar ₹1,400–1,600, Kota→Jaipur ₹1,999–2,249, Jaipur→Delhi ₹1,899–2,312 | Delhi→Agra ₹2,915, Jaipur→Sikar ₹2,200, Kota→Jaipur ₹2,950, Jaipur→Delhi ₹2,800 | 🟠 Click aur booking dono par asar |
| G6 | **Ek route ke kai pages** (Triveni: `/delhi-to-chandigarh`, `/one-way-cab/…`, `/distance/…`; oneway.cab: `/…-taxi` aur `/…/fare`) | Ek route = ek page | 🟡 Hum ye **copy nahi** karenge (thin pages = wapas indexing problem). Iski jagah ek "distance guide" sirf top routes ke liye |
| G7 | **Reviews / ratings dikhte hain** (stars, count) | Asli ratings 0 — kuch nahi dikhta | 🟠 Asli reviews chahiye |
| G8 | **Backlinks aur purana domain** (CabBazar, oneway.cab, Savaari, Gozo saalon purane; listings har jagah) | Bahut kam | 🟠 Lamba kaam |
| G9 | **Guides / blog** ("how to reach Khatu Shyam", "Jaipur to Sikar road trip", distance guides) | 1–2 guides | 🟡 |
| G10 | **Expressway wali distance** (Jaipur–Delhi ~280 km, 3.5–4.5 ghante) | 306 km (estimate, measured nahi) | 🟡 Galat lagta hai |
| G11 | Hindi mein content (kuch sites Google Translate se Hindi dikhati hain) | Sirf English | 🟡 Baad mein |

### 1.2 Jahan hum unse aage hain (inhe aur mazboot karna hai)

- **Asli trips ka data:** "Delhi→Jaipur: 552 trips in 90 days, kaun si gaadi, kis samay" — kisi competitor ke paas ye nahi. (Live hai.)
- **Fixed all-inclusive fare, title mein:** hamara title pattern already competitor jaisa hai (`Jaipur to Delhi Cab @ ₹2,800 | One Way Taxi, 306 km`).
- **Tez site:** Tier 1 pages 0.11–0.30 sec mein khulte hain.
- **Apni driver network + app.**

### 1.3 Fares jo galat dikhte hain (customer aur Google dono ke liye)

Catalog (`/public/routes`) mein ye rate saaf galat lagte hain. Page par yahi "@ ₹…" title mein jaata hai:

| Route | Distance | Hamara fare | Kyun galat lagta hai |
|---|---|---|---|
| Delhi → Delhi Airport | 17 km | ₹3,000 | MMT airport cab ₹360 se |
| Delhi → Noida | 26 km | ₹4,100 | Delhi→Jaipur (306 km) ₹2,800 se zyada |
| Noida → Delhi / Delhi Airport | 26–38 km | ₹2,700 | |
| Delhi Airport → Delhi | 17 km | ₹2,300 | |
| Delhi → Sikar | 302 km | ₹5,600 | Jaipur→Delhi (306 km) ₹2,800 — double |
| Chandigarh → Haridwar | 207 km | ₹8,400 | Delhi→Haridwar (228 km) ₹2,920 |
| Kota → Agra / Agra → Kota | 398 km | ₹9,920 / ₹8,120 | Dono taraf alag, aur bahut zyada |

**Ye aapka faisla hai** (fare aap tay karte hain). Main sirf list de raha hoon. Jab tak theek na ho, inhe Tier 1 mein nahi laayenge.

---

## 2. Step-by-step plan

**Order ka niyam:** pehle jo keywords pe hum pehle se top 3 mein hain unka asli page (sabse jaldi faayda), phir naye pages jahan page hi nahi hai, phir Google Business Profile, phir reviews aur backlinks, aur aakhir mein bade shehar wale mushkil keywords.

### Step 1 — Naapne ka system (Hafta 1, mera kaam)

1.1 **Keyword tracker:** `docs/seo/keywords.csv` — har keyword: group, target URL, impressions, position (GSC se), aur top 3 competitor (India incognito se, mahine mein ek baar, aap ya main). Pehle 40 keywords (upar wali table + har Tier 1 route ka "X to Y cab / taxi / one way").
1.2 **Weekly script:** `scripts/seo/gsc-report.mjs` ko Queries.csv + Pages.csv se har keyword ka "pichhle hafte vs is hafte" nikaalne ke liye badhana. Somvaar ko aap export dete ho, main `WEEKLY.md` bharunga.
1.3 **Lakshya (goal) har group ka**, neeche Step 9 mein.

### Step 2 — Jahan pehle se top 3 hain: unke pages ko jeetne laayak banana (Hafta 1–2)

Groups: Jaipur↔Delhi, Kota one-way, Delhi one-way, Delhi↔Agra, Delhi↔Chandigarh, Jaipur↔Sikar, Kota↔Jaipur.

2.1 **Request indexing** (aap, OWNER_STEPS §2b) — chal raha hai.
2.2 **Homepage se in pages ko seedha link** — "Searched most" block already hai; Jaipur–Delhi, Kota, Airport upar.
2.3 **Expressway distance aur time** (G10): Jaipur–Delhi aur Delhi–Agra jaise routes par `distanceSource: 'measured'` wali asli distance (backend insights already naapta hai). Title mein bhi wahi km. Ek hi number har jagah (page, title, schema).
2.4 **Title mein "starting" price** (G5) — fare aap decide karein. Agar koi sasti gaadi (hatchback/Dzire) ka fare kam hai to title mein "From ₹X" wahi ho. **Sirf wahi price jo booking mein sach mein milta hai.**
2.5 **Route page ka upar ka hissa** (pehli screen par): fare table (Dzire / Ertiga / Crysta / Tempo), "kya shamil hai" (toll, driver, state tax), booking form, phone/WhatsApp. Competitors ki tarah ye sab pehli screen par.
2.6 **Route facts** jo competitors likhte hain par hamare driver se confirm ho: pickup ke aam ilaake (Jaipur: Sindhi Camp, Railway Station, Airport, Jagatpura, Mansarovar, Vaishali Nagar; Delhi: IGI T1/T3, Gurgaon, Noida), raste ke toll plaza aur rukne ki jagah. **Aapse / drivers se facts chahiye** (Step 10).

### Step 3 — Naye pages jahan page hi nahi hai (Hafta 2)

3.1 **`/jaipur-airport-taxi`** (G2): airport se Jaipur shehar ke ilaakon tak fare (aapse fare chahiye), airport se outstation (Delhi, Agra, Sikar, Khatu, Kota, Ajmer) ke links, terminal T1/T2 pickup kaise, flight late ho to kya. Schema: `TaxiService` + `FAQPage`.
3.2 **`/jaipur-to-khatu-shyam-cab`** + **`/khatu-shyam-ji-taxi`** (G3): Jaipur→Khatu (~80–90 km, Chomu–Reengus raasta), Delhi→Khatu, Reengus station se Khatu (18 km), Ekadashi/Phalgun mela ke time bheed aur advance booking. Fare aapse.
3.3 **Guide:** `/guides/how-to-reach-khatu-shyam` (train Reengus tak + taxi, road, plane Jaipur tak) — competitors ki guides yahi rank karti hain.
3.4 **Sitemap + IndexNow + Request Indexing** in naye pages ka.
3.5 **Mana:** "taxi in vasant kunj", "taxi service jagatpura" jaise alag-alag ilaake ke pages **nahi** — un ilaakon ke naam city page ke "pickup areas" hisse mein.

### Step 4 — Google Business Profile (G4) — sabse zaroori bahar ka kaam (Hafta 1–4, aap + main)

4.1 **GBP pehle se hai** (4.7★, 156 reviews) — details theek karna (address `src/lib/company.ts` jaisa hi). Category: "Taxi service", extra: "Airport shuttle service", "Car rental agency".
4.2 **Service areas:** Jaipur, Kota, Delhi, Sikar, Agra, Chandigarh, Khatu Shyam ji.
4.3 **Website:** `https://www.hellomycabs.com/`. **Products/Services** mein top 10 route — har ek ka fare aur hamare page ka link.
4.4 **Har hafte 2–3 posts** ("Jaipur to Sikar taxi ₹X, Dzire/Ertiga", asli gaadi ki photo, page ka link). Competitor (Jaipur Cabs 24Seven) inhi posts se organic results mein aa raha hai. Main har hafte posts ka text aur photo list bana dunga, aap post karenge.
4.5 **Asli photos:** office, gaadiyan, drivers (unki marzi se) — 20+ photos.
4.6 **Reviews maangna:** har completed trip ke baad WhatsApp par GBP review link (Step 5).

### Step 5 — Asli reviews (G7) (Hafta 2 se lagataar)

5.1 Backend: trip complete hone ke baad customer ko WhatsApp par **rating link** (app/website ka rating jo `Rating` collection mein jaata hai) + GBP review link. **Koi fake review nahi.**
5.2 Website par rating tabhi dikhegi jab asli ratings ≥ 10 hon (guard already live hai). 10 hote hi stars apne aap aa jaayenge.
5.3 Lakshya: 2 mahine mein 100 asli ratings, 50 GBP reviews.

### Step 6 — Backlinks aur pehchaan (G8) (Hafta 2–12, zyada aapka kaam)

6.1 **Same NAP har jagah** (naam, phone, address): Justdial, Sulekha, IndiaMART, Yellow Pages India, TradeIndia, Bing Places, Apple Maps, Facebook page, Instagram, LinkedIn company page. Har ek mein website link.
6.2 **Partner links:** Ghoomo Rajasthan footer (ho gaya), driver/agent partners ki apni sites ya WhatsApp catalog mein link.
6.3 **Local:** Kota coaching hostels/PGs (students Kota↔Jaipur/Delhi jaate hain), Jaipur hotels ke travel desk, Khatu Shyam dharamshalas — inke websites/listings par "taxi partner" link. Sach mein partnership ho tabhi.
6.4 **Mana:** link khareedna, PBN, spam (competitors HackMD/Slideshare pe spam karte hain — hum nahi).

### Step 7 — Content jo rank kare (G9, G11) (Hafta 3–8)

7.1 **Guides** sirf top routes ke liye, har guide asli jaankari wali: "Jaipur to Delhi by road: expressway vs NH-48", "Delhi to Agra: Yamuna Expressway toll aur rukne ki jagah", "Kota to Jaipur: raasta aur samay", "Jaipur to Sikar/Khatu". Har guide route page ko link kare.
7.2 **City pages ko mazboot:** Jaipur, Kota, Delhi — local pickup ilaake, local taxi (8hr/80km) ka fare, airport/station se, top routes ki table. Yahi "taxi service in jaipur" jaise bade keywords ke liye.
7.3 **Hindi pages** (baad mein, Hafta 8+): top 10 route + 3 city ke Hindi version (`/hi/...`, hreflang). Sirf jab English pages index ho jaayein.

### Step 8 — Baaki routes kholna (Hafta 4+)

8.1 Gate (indexing-tiers.ts): Tier 1 ≥ 80% indexed → `release-tier3.mjs` se agle 25 routes, GSC impressions aur trips ke hisaab se.
8.2 Galat fare wale routes (§1.3) tabhi jab fare theek ho.
8.3 Naye route sirf jahan asli maang ho (trips ≥ 20 in 90 din), jaise Jaipur→Khatu, Jaipur→Pushkar, Delhi→Khatu.

### Step 9 — Lakshya aur samay

| Group | Abhi | 4 hafte | 8 hafte | 12 hafte |
|---|---|---|---|---|
| Jaipur↔Delhi (route page) | homepage pos 1.5–2.3 | page index | route page top 5 | **top 3, 30+ clicks/mahina** |
| Kota one-way / Kota taxi | 2.4 / 8.8–9.4 | city page index | top 5 | top 3 |
| Jaipur Airport | 1.8–2.4 (homepage) | page live + index | top 3 | top 3 |
| Khatu Shyam / Reengus | 9–17, page nahi | page live | top 10 | top 5 |
| Delhi↔Agra, Delhi↔Chandigarh, Jaipur↔Sikar, Kota↔Jaipur | index nahi | index | top 10 | top 5 |
| Taxi service in Jaipur / Delhi | 22–35 | 20–30 | 15–20 | top 10 + Maps pack (GBP) |
| hello my cab (brand) | 3.7 | 2 | **1** | 1 |

Ye andaaze hain, vaade nahi. Google ka samay hum tay nahi kar sakte.

### Step 10 — Aapse kya chahiye (bina iske kuch steps ruk jaayenge)

1. **Fares:** §1.3 ke galat fares theek karna; Jaipur Airport (shehar ke ilaakon tak) aur Khatu Shyam ke fares; har Tier 1 route par sabse sasti gaadi ka fare.
2. **Route facts** top 14 routes ke: pickup points, toll plaza, rukne ki jagah — kisi driver/office se.
3. **GBP** verify aur har hafte posts (text main dunga).
4. **Photos:** office, gaadiyan, drivers.
5. **Directory listings** (Step 6.1).
6. **Somvaar ko GSC export.**

---

## 3. Kya nahi karenge (penalty se bachne ke liye)

- Nakli reviews / ratings, nakli address, keyword bhare thin pages, har ilaake ka alag page, link khareedna, cloaking, AI se bina jaanch ke bhara hua content.
- Wahi price title mein jo booking mein na mile.
- Tier 3 routes gate se pehle kholna.

## 4. Mera agla kaam (aap "haan" bolein to)

Is plan se **detailed prompt** (`PROMPT_RANK_21NOV.md`), phir code ka kaam: Step 1 (tracker), 2.3/2.5 (distance, fare table), 3 (Airport + Khatu pages — fares aane par), 5.1 (review WhatsApp), 7 (guides). GBP, directories aur fares aapke haath mein.

---

**Sources (research, 21 Nov 2026):**
[Uber Jaipur–Delhi](https://www.uber.com/in/en/r/intercity/jaipur-rajasthan-to-delhi-new-delhi/) · [MakeMyTrip Jaipur–Delhi](https://www.makemytrip.com/car-rental/jaipur-new_delhi-cab-services.html) · [oneway.cab Jaipur–Delhi](https://oneway.cab/jaipur/jaipur-to-delhi-taxi) · [Gozo Jaipur–Delhi](https://www.gozocabs.com/book-taxi/jaipur-delhi) · [WTI Jaipur–Delhi](https://www.wticabs.com/outstation-cabs/jaipur-to-delhi) · [Triveni Jaipur–Delhi](https://www.trivenicabs.in/distance/jaipur-to-delhi) · [oneway.cab Delhi–Agra](https://oneway.cab/delhi/delhi-to-agra-taxi) · [CabBazar Delhi–Agra](https://cabbazar.com/route/delhi-to-agra) · [Savaari Delhi–Agra](https://www.savaari.com/delhi/delhi-to-agra-cabs) · [Triveni Delhi–Agra](https://www.trivenicabs.in/delhi-to-agra) · [CabBazar Delhi–Chandigarh](https://cabbazar.com/route/delhi-to-chandigarh.html) · [Triveni Delhi–Chandigarh](https://www.trivenicabs.in/one-way-cab/delhi-to-chandigarh) · [Jaipur Cabs 24Seven GBP — Kota](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/3417986987249947703/) · [Jaipur Cabs 24Seven GBP — Sikar](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/7422181089200173953/) · [Rajputana Cabs Jaipur–Kota](https://rajputanacabs.in/jaipur-kota-taxi/) · [Rajputana Cabs Jaipur–Sikar](https://rajputanacabs.in/jaipur-to-sikar-taxi/) · [HurryUp Jaipur–Sikar](https://hurryupcabs.com/cabs/outstation/jaipur-to-sikar) · [chikucab Kota](https://chikucab.com/cab-service-in-kota.html) · [onesidetaxi Kota](https://www.onesidetaxi.com/Kota/book-taxi) · [saarthi.cab Kota](https://saarthi.cab/city/Kota) · [CabBazar Jaipur](https://cabbazar.com/city/jaipur) · [KTS Cabs Jaipur](https://www.ktscabs.com/oneway-taxi-in-jaipur) · [MakeMyTrip Jaipur Airport](https://www.makemytrip.com/car-rental/jaipur-airport-taxi.html) · [Savaari Jaipur Airport](https://www.savaari.com/jaipur/airport-taxi) · [Triveni Jaipur Airport](https://www.trivenicabs.in/airport-service/jaipur) · [CabBazar Jaipur–Khatu](https://cabbazar.com/taxi/jaipur-to-khatu-shyam-ji) · [HurryUp Jaipur–Khatu](https://hurryupcabs.com/cabs/outstation/jaipur-to-khatu-shyam-ji) · [MakeMyTrip Jaipur–Khatu](https://www.makemytrip.com/car-rental/jaipur-khatu_shyam-cab-services.html) · [mykhatutrip guide](https://mykhatutrip.com/news/how-to-go-to-khatu-shyam-from-delhi-and-jaipur)
