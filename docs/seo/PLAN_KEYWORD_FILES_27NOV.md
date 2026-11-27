# Plan — aapki keyword files par ranking (27 Nov 2026)

**Kis par bana:**
- Aapki 4 keyword files (`~/Downloads/hellomycabs_*_v2_rebuilt.csv`, 27 Nov 09:32).
- Roadmap ke har URL ki live jaanch.
- Google India autocomplete (115 naye searches).
- Production ke 90 din ke duties (read-only ginti).
- Hamare live fares (`/fare/oneway`, `/fare/local`).
- Competitors ke search results.

**Saath ki file:** `KEYWORD_FILES_PAGE_DECISIONS_27NOV.csv` — roadmap ke saare 147 URLs, har ek ka faisla aur wajah.

**Kya pehle se chal raha hai:** `PLAN_INDEX_RANK_27NOV.md` (Wave 1 / gate, live). Ye plan usi ke andar chalega — wave aur gate ke niyam nahi badlenge.

> **Ek note:** Downloads mein "Triplesinfotech - Sheet1.csv" bhi thi. Wo keywords nahi, computer hardware vendors ki contact list hai (naam, phone, email). Maine use is kaam mein istemal nahi kiya.

---

## 0. Files mein kya hai, aur kitna bharosa karein

| File | Rows | Kya hai |
|---|---|---|
| `keyword_master` | 3,349 | Saare keywords: route 1,836 · city 960 · airport-locality 138 · vehicle 84 · railway 32 · sightseeing 30 · pilgrimage 40 · Hindi 25 |
| `priority_keywords` | 528 | P1 wale (master ka hissa) |
| `new_keywords` | 252 | Doosri research se naye (railway station, sightseeing, naye shehar) |
| `page_roadmap` | 147 | Har target URL, primary keyword, content requirements |

**Bharose ki seema (zaroori):**
- **Search volume, CPC aur difficulty ka ek bhi number nahi hai** (3,349 mein 0 bhare).
- Zyadatar rows khud likhti hain: "generated phrase candidate, exact demand not verified".
- 2,298 rows ka action hai: "Verify service and URL before page decision".

Isliye har faisla maine asli data se jaancha: Google autocomplete (log asal mein kya likhte hain), hamare apne duties (kya hum ye trip chalate hain), aur hamara fare (kya page par sahi aur competitive price hoga).

## 1. 147 roadmap URLs ki asliyat (live jaanch, 27 Nov)

| Sthiti | Ginti | Faisla |
|---|---|---|
| **Wave 1, live, index ke liye khula** | 30 | **Behtar karo (optimise)** — §A |
| Page hai, noindex (Wave 2/3 ka intezaar) | 45 | Wave ke saath khulega (gate) — §B |
| Page hai, **kabhi index nahi** (twin: Jaipur Airport→Agra jaisa, wahi raasta + wahi fare) | 11 | Keywords `/jaipur-airport-taxi` aur Jaipur route page par — §B |
| Page hai, sample packages (Char Dham, Rajasthan tours) | 2 | Aapke asli packages ke baad |
| **Page nahi hai** | 59 | Har ek ka faisla §C mein: 8 banenge (kuch fare ke baad), 13 baad mein, 38 nahi banenge |

## 2. Competitors kyun upar hain, hamare paas kya kami hai

| # | Unke paas | Hamare paas | Kya karenge |
|---|---|---|---|
| G1 | **Google Business Profile posts** — "Jaipur Cabs 24Seven" ke posts Jaipur→Pushkar, Jaipur railway station, Khatu, Kota par khud results mein | GBP hai (4.7★, 156) par posts nahi | §D: har naye/maujooda route ka GBP post (index ka intezaar nahi karta) |
| G2 | **Alag page har intent ka**: Triveni `/railway-station-taxi/jaipur`, CabBazar `/taxi/cab/jaipur-local-sightseeing`, Uber/Triveni/CabBazar `jaipur-to-pushkar` | Ye pages nahi | §C: railway station, sightseeing (fare ke baad), Pushkar |
| G3 | **Purane domain, hazaron pages index** (CabBazar, Triveni, MMT, Uber) | 1 page index; purana domain hellomycab.com alag chal raha hai | `OWNER_STEPS_INDEX_RANK_27NOV.md` §0 (domain wapas) + Wave 1 |
| G4 | **Page par "outstation", "rental / on rent", "full day / hourly", "family", "luggage"** jaise shabd | City pages ke main text mein **"outstation" hi nahi** (autocomplete ka #1 modifier!), "rental", "hourly", "full day" bhi nahi | §A: sach likhte hue jodna |
| G5 | **Sasta local package**: Jaipur 8 hr/80 km sedan ₹1,600–2,700 | Hamara ₹2,500 (hatchback) / ₹2,750 (Dzire) | Aapka faisla (§E) |
| G6 | **Sasta route fare** Ludhiana→Chandigarh ₹1,100–1,600 | Hamara per-km ₹2,300 | Aapka faisla (§E) |
| G7 | Hindi/Roman Hindi keywords par pages | Hindi pages taiyaar, band (gate) | Wave 1 ≥ 80% ke baad |
| G8 | Spam (HackMD, Issuu) — competitors karte hain | — | **Hum nahi karenge** |

---

## §A — Wave 1 ke 30 pages behtar karna (abhi, ye index ke liye khule hain)

Keyword file ke shabdon ko har page ke asli text se milaya (`coverage`): kaun se shabd **bilkul nahi** aate.

| Page group | Gayab shabd (file ke kitne keywords mein) | Kya jodenge — sirf jo sach hai |
|---|---|---|
| **City pages** (Jaipur 41 kw, Delhi 44, Kota/Agra/Chandigarh/Sikar/Khatu 32-32) | **outstation** (3–7), rental (3–4), hourly, full day, affordable, private, phone | 1) H2 "Outstation taxi from {City}" (fare table pehle se hai, sirf heading aur ek line). 2) Local package hissa: "Hourly / full day taxi in {City} — 8 hr / 80 km" (`/fare/local` ke asli numbers). 3) "Private cab — the car is yours, no sharing" (sach hai). 4) "Contact number" pehle se jod diya (27 Nov). Title tail mein "Outstation" jab 60 akshar mein fit ho |
| **Route pages** (Jaipur↔Delhi 30-31, Jaipur→Agra 29, Jaipur→Kota 26) | passengers, door (to door), private, family, luggage, experienced, early, fixed, kiraya, Hindi (जयपुर से दिल्ली टैक्सी) | 1) "Door to door — pickup from your address, drop at the address in {B}" (sach). 2) Har gaadi ke saath **seats + bags** (catalog mein seats hain; bags sirf agar backend data mein ho, warna nahi). 3) "For a family of 6 — Ertiga ₹X" (FAQ mein pehle se group sawaal hai — "family" shabd jodna). 4) "Kiraya" / Hindi line: route page ke neeche ek Hindi vaakya ("जयपुर से दिल्ली टैक्सी का किराया ₹2,800 से") — hand-written, sirf Wave 1 routes, Hindi reader ki jaanch ke baad |
| **Khatu pages** (40 + 29 kw) | private, family, visit, package, darshan, hotel, Hindi | "Same-day darshan and back — the round-trip fare on this page" (round trip fare pehle se hai; koi naya package nahi banayenge). Hindi line (खाटू श्याम जी टैक्सी) |
| **Gaadi pages** (Dzire/Ertiga/Crysta/Tempo, 12-12 kw) | rental / **on rent in jaipur**, family, outstation, Rajasthan, tour | Har gaadi page par "{Car} on rent in Jaipur with driver" H2 + Jaipur se top 5 routes ka us gaadi ka fare (API) |
| **Jaipur Airport** (154 kw, 147 covered) | transfer, private, hotel, prepaid, Tonk, Hindi | Pehle se lagbhag poora. "Airport transfer" shabd heading mein; "prepaid" — sach: "fare is fixed before you land (pay a small advance online)" |
| **Home** (19 kw) | rental, intercity, private | "Intercity cab" ek line mein (sach) |

**Tests jo saath mein:** har Wave 1 city page par "outstation" aur local package hissa; route page par "door to door"; Hindi line sirf jab `HINDI_REVIEWED = true` (aapke reader ki jaanch). Overlap guard (`rank.mjs`) chalta rahega — naye vaakya har page ke apne numbers ke saath, warna samaanta badhegi.

## §B — Jo pages bane hue hain par ruke hain (56)

1. **45 Wave 2/3 pages** (Jaipur→Ajmer, Jaipur→Jodhpur, Jaipur→Udaipur, Delhi→Dehradun, Noida→Jaipur…): file ke keywords inhi pages ke hain. Ye **gate se** khulenge (`release-wave.mjs`: Wave 1 ≥ 80% index aur "Discovered" na badhe). Khulne se pehle har page par §A wale sudhaar.
2. **11 twins** (Jaipur Airport → Agra/Ajmer/Delhi/Kota/Sikar/Khatu, Delhi Airport → Khatu…): wahi raasta, wahi fare — doosra page duplicate hoga. **Kabhi index nahi.** Unke keywords ("jaipur airport to agra cab") ke liye `/jaipur-airport-taxi` ke "From Jaipur Airport to other cities" hisse mein har jagah ka naam + fare + Jaipur route page ka link (pehle se hai — heading mein "Jaipur Airport to {city} cab" shabd jodna).
3. **Delhi Airport city page, Noida city page** — fares review mein (`FARE_REVIEW_21NOV.md`), aapke faisle tak noindex.
4. **Char Dham / Rajasthan tours** — sample packages; aap asli packages dein to index.

## §C — Naye pages (59 roadmap URL) — har ek ka faisla

Poori list CSV mein. Saar:

### C1. Banenge — Wave 2 ke saath (8)

| Page | Saboot | Kaise | Kya chahiye |
|---|---|---|---|
| `/jaipur-railway-station-taxi` | Autocomplete 8 ("jaipur railway station taxi / service / prepaid", "airport to railway station fare"); Triveni, CabBazar, GBP posts rank karte hain | Airport page jaisa: station (Jaipur Jn, Durgapura, Gandhinagar) se shehar ke ilaakon tak fixed fare + outstation station se (Jaipur ka fare) + "platform exit pickup" sirf agar sach ho | **Aapka faisla: station → shehar zone fares** (airport zones jaisa) aur station pickup kaise hota hai |
| `/jaipur-to-pushkar-cab` + `/pushkar-to-jaipur-cab` | 26 + 38 duties/90 din; autocomplete 8; Pushkar 104 baar duty text mein | Backend `demandRoutes` mein Pushkar jodna → catalogue route (per-km "priced on distance") → page apne aap | Fare ₹2,570 se (Uber ₹2,808, Triveni ₹3,300) — **competitive**; aapki haan |
| `/jodhpur-to-jaisalmer-cab` | 66 duties; autocomplete 9 | Same | ₹4,370 per-km vs ₹3,300–4,600 — upar wale sire par; aap chahein to fixed fare |
| `/chandigarh-to-dehradun-cab` | 30 duties; autocomplete 8 | Same | ₹2,540 per-km |
| `/jodhpur-to-udaipur-cab` | 29 duties; autocomplete 6 | Same | per-km |
| `/ludhiana-to-chandigarh-cab` | **226 duties (sabse zyada)**; autocomplete 9 | Same | **Fare pehle:** hamara ₹2,300 vs ₹1,100–1,600 — is fare par page click nahi layega |
| `/jaipur-local-sightseeing-taxi` | Autocomplete ("jaipur sightseeing taxi / package / fare", "city tour", "full day", "one day"); CabBazar, Triveni, Rajputana rank | 8 hr / 80 km aur 12 hr / 120 km (`/fare/local`), aam route (Amer, Hawa Mahal, City Palace, Jal Mahal, Nahargarh — sirf jagah ke naam, timings nahi), gaadi choose | **Aapka faisla:** package price (hamara ₹2,500–2,750 vs ₹1,600–2,700) aur kya driver guide ka kaam karega ya nahi |

### C2. Baad mein (13) — demand hai, par pehle route/fare chahiye
- **City pages Jodhpur (195 pickups/90 din) aur Udaipur (150):** tabhi jab un shehron se ≥ 3 routes priced hon (city page unhi routes ki list hota hai). Wave 3.
- **Bikaner (97), Pushkar (80), Jaisalmer (78), Bhilwara (71) city pages:** baad mein, routes ke baad.
- **Agra→Mathura (14), Ajmer→Udaipur (17), Jaipur→Bikaner/Bhilwara (18-18):** Wave 3 ke saath.
- **Haridwar↔Dehradun, Haridwar→Rishikesh:** chhote raaste par minimum fare (₹2,300 for 25 km) galat lagta hai — pehle fare.

### C3. Nahi banenge (38)
- **14 shehron ke city pages** (Tonk 5, Dausa 2, Hanumangarh 1, Pali 11, Mount Abu 7, Sri Ganganagar 7, Chittorgarh 14, Kishangarh 20, Sawai Madhopur 22, Nagaur 28, Bharatpur 30, Beawar 31, Alwar 33, Jhunjhunu 40 pickups): na routes, na kaafi trips — sirf shehar ka naam badla hua page = **doorway** (Google ki spam policy). Inke keywords Jaipur city page ke "pickup towns" hisse se.
- **24 routes** jahan duties 0–10 (Delhi→Udaipur 0, Jaipur→Ringas 0, Ajmer→Pushkar 0, Jaipur→Dausa 2…): demand saabit nahi. `jaipur-to-ringas` / `ringas-to-khatu` ka kaam Khatu page ka Reengus transfer hissa pehle se karta hai.

### C4. Files mein nahi, par hamare data se — candidate
- **Delhi → Rishikesh** (duty text mein 311 baar; per-km ₹3,780) — Delhi→Haridwar (₹2,920) se mel khaata fare chahiye.
- **Dehradun city page** (558 pickups/90 din — sabse zyada) — Delhi↔Dehradun Wave 2 mein hai; uske baad.
- **Salasar Balaji** (duty text mein 55; autocomplete 8 "jaipur to salasar") — backend mein city hi nahi; city key + fare (aapka) chahiye.
- **Gurgaon → Jaipur** (50 duties) — per-km ₹4,130 vs Delhi→Jaipur ₹2,800: Delhi route ka twin; ya fare theek ho ya Delhi page par "Gurgaon pickup" line.

## §D — Google Business Profile (index ka intezaar nahi)
Competitors ke GBP posts in keywords par khud rank karte hain. GBP ko website ke index hone ki zaroorat nahi:
1. December ke 12 posts (`GBP_POSTS_DEC2026.md`) ke saath **4 naye**: Jaipur→Pushkar (fare haan ke baad), Jaipur railway station pickup (fare ke baad), Jaipur local 8 hr / 80 km (package ke baad), Jodhpur→Jaisalmer.
2. Products mein wahi 4.
3. Service areas mein Pushkar, Jodhpur.

## §E — Aapke faisle (inke bina §C ke 4 page rukenge)

| # | Faisla | Kyun |
|---|---|---|
| E1 | Jaipur **railway station → shehar zone fares** (Jaipur Jn / Durgapura / Gandhinagar) aur pickup ka tareeka | Station page ki neev |
| E2 | Jaipur **local / sightseeing package** price (8 hr / 80 km ₹2,500–2,750 rakhein ya kam karein) + guide ya nahi | Competitors ₹1,600–2,700 |
| E3 | **Ludhiana → Chandigarh** fare (226 trips!) | ₹2,300 vs ₹1,100–1,600 |
| E4 | **Pushkar, Jodhpur–Jaisalmer, Chandigarh–Dehradun, Jodhpur–Udaipur** per-km par hi chalein ya fixed fare | Page ka title fare yahi hoga |
| E5 | Haridwar–Rishikesh/Dehradun (chhota raasta) fare | Minimum fare galat lagta hai |
| E6 | Salasar Balaji ko city banana + fare | 55 trips, search hai |
| E7 | Hindi reader (route/city ke Hindi vaakya jaanchne ke liye) | Hindi keywords |
| E8 | Purana domain hellomycab.com wapas lena | `OWNER_STEPS_INDEX_RANK_27NOV.md` §0 — sabse bada lever |

## §F — Kram (step by step)

| Step | Kab | Kya | Kaun |
|---|---|---|---|
| 1 | Hafta 1 | §A Wave 1 ke 30 pages par gayab shabd (outstation, local/hourly, door to door, family, on rent) — tests ke saath; deploy; IndexNow | Main |
| 2 | Hafta 1 | `keywords.csv` mein aapki 3,349 keywords jodna (target URL humare asli URL par map, wave column) — weekly report inhe track karegi | Main |
| 3 | Hafta 1 | GBP: Pushkar / Jodhpur–Jaisalmer posts (fare haan ke baad) | Aap |
| 4 | Hafta 1–2 | §E ke faisle | Aap |
| 5 | Hafta 2 | Backend: Pushkar, Jodhpur–Jaisalmer, Chandigarh–Dehradun, Jodhpur–Udaipur (aur Ludhiana–Chandigarh fare ke baad) catalogue mein; website par apne aap route pages — **noindex, Wave 2 list mein** | Main |
| 6 | Hafta 2 | `/jaipur-railway-station-taxi` aur `/jaipur-local-sightseeing-taxi` (E1, E2 ke baad) — noindex, Wave 2 | Main |
| 7 | Gate ke baad | Wave 2 khulega (`release-wave.mjs`): purane 29 + ye naye pages; Request Indexing list | Main + Aap |
| 8 | Wave 3 | Jodhpur / Udaipur city pages (routes ke baad), Agra–Mathura, Ajmer–Udaipur… | Main |
| 9 | Har mahine | Keyword Planner se top 100 keywords ka asli volume (Google Ads account mein muft) — file mein volume nahi hai | Aap |

**Naye page abhi index ke liye kyun nahi?** Google ne Wave 1 ke 45 mein se 1 page hi index kiya hai. Abhi aur pages kholna wahi galti dohrana hoga jisse 150 pages ek saath "Discovered" mein atke the. Naye pages ban kar booking ke kaam aayenge, GBP aur andar ke links se jude rahenge, aur gate khulte hi index ke liye jayenge.

## §G — Kya nahi karenge
- 14 chhote shehron ke naam-badle city pages (doorway).
- File ke har "generated phrase" ka alag page (ek keyword group = ek page).
- Aisa fare ya package jo booking mein na mile; tour timings, train timings (badalte rehte hain).
- Gate se pehle naye pages index karna.
- HackMD/Issuu/Payhip spam, link khareedna.

---

**Sources (27 Nov 2026):**
[CabBazar Jaipur local sightseeing](https://cabbazar.com/taxi/cab/jaipur-local-sightseeing) · [CabBazar Jaipur](https://cabbazar.com/city/jaipur.html) · [Triveni local taxi Jaipur](https://www.trivenicabs.in/local-taxi/jaipur) · [Rajputana Cabs Jaipur sightseeing](https://rajputanacabs.in/?p=192) · [Triveni Jaipur railway station taxi](https://www.trivenicabs.in/railway-station-taxi/jaipur) · [Triveni Jaipur Junction](https://www.trivenicabs.in/jaipur-junction-station-taxi) · [Jaipur Cabs 24Seven GBP — station](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/7547459044653058423/) · [Uber Jaipur→Pushkar](https://www.uber.com/in/en/r/intercity/jaipur-rajasthan-to-pushkar-rajasthan) · [Triveni Jaipur→Pushkar](https://www.trivenicabs.in/one-way-cab/jaipur-to-pushkar) · [CabBazar Jaipur→Pushkar](https://cabbazar.com/taxi/jaipur-to-pushkar) · [Jaipur Cabs 24Seven GBP — Pushkar](https://business.google.com/v/jaipur-cabs-24seven/017813826439385604567/3a25/_/lp/2174386882746760906/) · [oneway.cab Ludhiana→Chandigarh](https://oneway.cab/ludhiana/ludhiana-to-chandigarh-taxi) · [CabBazar Ludhiana→Chandigarh](https://cabbazar.com/route/ludhiana-to-chandigarh.html) · [Rajputana Chandigarh→Ludhiana](https://rajputanacabs.in/chandigarh-to-ludhiana-taxi/) · [Triveni Jodhpur→Jaisalmer](https://www.trivenicabs.in/one-way-cab/jodhpur-to-jaisalmer) · [Rajputana Jodhpur→Jaisalmer](https://rajputanacabs.in/jodhpur/jodhpur-to-jaisalmer-taxi/) · [CabBazar Udaipur](https://cabbazar.com/city/udaipur) · [Elite Udaipur Cab GBP](https://business.google.com/v/elite-udaipur-cab/04798534283116810067/466e/_) · [Google spam policies (doorways)](https://developers.google.com/search/docs/essentials/spam-policies)
