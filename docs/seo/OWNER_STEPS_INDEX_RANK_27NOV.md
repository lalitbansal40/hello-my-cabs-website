# Aapke kaam — index aur ranking (27 Nov 2026)

**Kiske liye:** owner. Website ka kaam ho gaya hai (§1). Neeche wo kaam hain jo sirf aap kar sakte hain — Google Search Console, Google Business Profile, listings aur kuch faisle. Har kaam ke saath taareekh likhi hai.

---

## §0 Sabse bada kaam — purana domain hellomycab.com wapas lena

**hellomycab.com** (bina "s") 2017 se isi business ki site hai: Google mein **124 pages index**, wahi phone number, wahi routes. Aaj (27 Nov) bhi wo chal rahi hai ("Jaipur Taxi Service … One Way Taxi Service", 117 pages). Domain (GoDaddy, 2029 tak) aur hosting (Hostinger) ka control kho gaya hai.

Google ki nazar se: ek purani, jaani-pehchani site aur ek nayi site — dono same business, same number, same routes. Nayi site ko Google "doosri copy" maan kar kam bharosa deta hai. **Ye 1 page index hone ka ek bada kaaran ho sakta hai** (27 Nov ke plan mein ye chhoot gaya tha — ab jod diya hai).

Control wapas aate hi poora 301 redirect ka kaam taiyaar hai: `scripts/seo/old-domain/README.md` (124 purane URL → naye pages, ek command se, jaanch ke saath). Uske baad Search Console mein **Change of address**.

**Aapka kaam:** GoDaddy account (jis email/phone par 2017 mein liya tha) aur Hostinger account wapas paane ki koshish — GoDaddy support ko "domain ownership recovery" ke liye registrant ke documents ke saath. Jaise hi login mile, mujhe batayein; baaki main 1 ghante mein kar dunga.

## §1 Kya live hua (27 Nov 2026)

- **Index ke liye sirf 45 mazboot pages** (Wave 1): home, routes, fares, about, contact, 7 city pages, Jaipur Airport, 16 routes, 1 round trip, 4 gaadi pages, 10 guides. Baaki saare pages site par khulte hain aur booking hoti hai, par Google se kaha gaya hai abhi index na kare (`noindex`). Wo lehron (waves) mein khulenge.
- **Pages halke:** HTML lagbhag aadha (550 → 240 KB median), phone par speed waisi hi ya behtar.
- **Route pages kam ek jaise:** fare table ek baar (pehle dugni), FAQ 20 se 8, aam vivran chhota.
- **Har Wave 1 page ko 45 andar ke links** (pehle 29 pages ko 15 se kam).
- **Jaipur Airport, Khatu Shyam ji pages, Khatu guide** — 21 Nov wala kaam ab live.
- Teen guides bina description ke jaa rahe the — theek.
- Ranking ka koi vaada nahi; ye sab Google ko achhe pages dikhane ki taiyaari hai.

## §2 Google Search Console (sabse zaroori)

**30 Nov se (release ke 3–4 din baad)** — URL Inspection → URL daalein → **Request indexing**. Roz 10:

**Din 1 (30 Nov):**
1. https://www.hellomycabs.com/
2. https://www.hellomycabs.com/jaipur-to-delhi-cab
3. https://www.hellomycabs.com/delhi-to-jaipur-cab
4. https://www.hellomycabs.com/jaipur-airport-taxi
5. https://www.hellomycabs.com/kota-to-jaipur-cab
6. https://www.hellomycabs.com/jaipur-to-kota-cab
7. https://www.hellomycabs.com/cab-service-in-kota
8. https://www.hellomycabs.com/cab-service-in-jaipur
9. https://www.hellomycabs.com/jaipur-to-khatu-shyam-ji-cab
10. https://www.hellomycabs.com/cab-service-in-khatu-shyam-ji

**Din 2 (1 Dec):**
1. https://www.hellomycabs.com/delhi-to-agra-cab
2. https://www.hellomycabs.com/delhi-to-chandigarh-cab
3. https://www.hellomycabs.com/delhi-to-haridwar-cab
4. https://www.hellomycabs.com/jaipur-to-agra-cab
5. https://www.hellomycabs.com/jaipur-to-sikar-cab
6. https://www.hellomycabs.com/sikar-to-jaipur-cab
7. https://www.hellomycabs.com/kota-to-delhi-cab
8. https://www.hellomycabs.com/delhi-to-kota-cab
9. https://www.hellomycabs.com/jaipur-to-delhi-airport-cab
10. https://www.hellomycabs.com/delhi-airport-to-jaipur-cab

**Din 3 (2 Dec):**
1. https://www.hellomycabs.com/cab-service-in-delhi
2. https://www.hellomycabs.com/cab-service-in-sikar
3. https://www.hellomycabs.com/cab-service-in-agra
4. https://www.hellomycabs.com/cab-service-in-chandigarh
5. https://www.hellomycabs.com/about
6. https://www.hellomycabs.com/contact
7. https://www.hellomycabs.com/routes
8. https://www.hellomycabs.com/fares-explained
9. https://www.hellomycabs.com/guides/how-to-reach-khatu-shyam
10. https://www.hellomycabs.com/guides/jaipur-delhi-by-road

**Din 4 (3 Dec):**
1. https://www.hellomycabs.com/khatu-shyam-ji-to-jaipur-cab
2. https://www.hellomycabs.com/jaipur-to-delhi-round-trip-cab
3. https://www.hellomycabs.com/dzire-taxi
4. https://www.hellomycabs.com/innova-crysta-taxi
5. https://www.hellomycabs.com/ertiga-taxi
6. https://www.hellomycabs.com/tempo-traveller-12-seater-rental
7. https://www.hellomycabs.com/guides
8. https://www.hellomycabs.com/guides/delhi-agra-by-road
9. https://www.hellomycabs.com/guides/jaipur-delhi-airport-by-road
10. https://www.hellomycabs.com/guides/jaipur-sikar-by-road

(Baaki 5 guides — delhi-chandigarh, delhi-haridwar, jaipur-agra, one-way-or-round-trip, group-travel — 4 Dec ko.)

**Sitemaps:** Sitemaps → wahi 6 sitemap dobara submit karein (30 Nov ko, ek baar).

**"Validate fix" — sirf 11 Dec 2026 ko** (release ke 14 din baad), "Crawled – currently not indexed" aur "Discovered – currently not indexed" dono par. Pehle dabaya to dobara "Failed" aayega (pichhli baar yahi hua tha).

**Removals:** Removals → New request → Temporarily remove URL → `https://api.hellomycabs.com/privacy` (ye page pehle se noindex hai; ye Google se jaldi hatane ke liye hai).

**Har mahine:** Links report ka screenshot.

## §3 Faisle jo aapke hain

| # | Faisla | Abhi kya hai | Aap kya keh sakte hain |
|---|---|---|---|
| P3 | Route pages se **Product schema** hatana | Rakha hai (aapka 9 Oct ka faisla) | "Hata do" → ek line badal ke push. Kyun: Google taxi service ko Product rich result nahi deta; dukaan jaisa markup bina dukaan ke spam jaisa lag sakta hai |
| D1 | Route **title** "Cab @ ₹X \| One Way Taxi" | Waisa hi rakha (aapka 9 Oct ka faisla) | Plan "Taxi @ ₹X \| One Way Cab" kehta tha (autocomplete mein "taxi" zyada). Dono shabd pehle se hain; badalna ho to batayein |
| P4 | Gaadi aur round-trip wale route pages (jaise `/jaipur-to-delhi-innova-crysta`) | noindex (khulte hain, Google se bahar) | Wapas chahiye to batayein |
| P5 | 13 routes jo pehle indexable the (Jaipur–Jodhpur, Jaipur–Ajmer, Jaipur–Udaipur…) | Wave 2 tak ruke | — |
| P9 | `/luxury-car` | noindex | — |
| P10 | Terms / Privacy / Refund | index hote hain, sitemap mein nahi | — |
| — | **Inline CSS band** (3 Oct ko on kiya tha) | Band — naap mein phone par speed waisi ya behtar, page aadha | Ise wapas on karna ho to naya naap chahiye |

## §4 Rich Results Test (5 minute)
https://search.google.com/test/rich-results par ye 6 URL ek-ek karke daalein; "No errors" aana chahiye:
`/`, `/jaipur-to-delhi-cab`, `/jaipur-airport-taxi`, `/cab-service-in-kota`, `/guides/how-to-reach-khatu-shyam`, `/jaipur-to-khatu-shyam-ji-cab`.

## §5 About page ke liye chahiye
About page par ab office ka pata aur Google Maps link hai. Ye bhejein to wahan jud jaayenge (code mein `src/lib/company.ts`, ek-ek line):
- Office ki asli photo (bahar se, board ke saath).
- Founder ka naam jaise aap dikhana chahein.
- (Marzi ho to) GST / registration number.

## §6 Analytics — abhi site par kuch bhi gina nahi jaata
Do mein se ek:
- **Plausible** (pasand — cookie nahi, banner nahi): plausible.io par account → site `www.hellomycabs.com` → mujhe batayein. Main code mein ek line lagaunga.
- **GA4** (muft): analytics.google.com → Admin → Create property "Hello My Cab" → Web stream `https://www.hellomycabs.com` → **Measurement ID** (`G-…`) mujhe bhejein. Ye page khulne ke baad load hoga (speed par asar nahi) aur driver/rating jaise token wale pages par kabhi nahi.

Env mein kuch nahi karna.

## §7 Bing Webmaster Tools (10 minute)
bing.com/webmasters → **Import from Google Search Console** → hellomycabs.com → wahi 6 sitemaps. (Bing ka data ChatGPT/Copilot search mein bhi jaata hai. IndexNow pehle se chalta hai.)

## §8 Driver route survey
23 drivers, 11 raaste (dry run). Aap "bhej do" kahein to main bhejunga. Inke jawab aane par route pages sach mein alag banenge (abhi har route par ye hissa khaali hai).

## §9 Baad ke faisle (is kaam mein nahi)
- 23 galat fares (`FARE_REVIEW_21NOV.md`) — inke routes tab tak noindex.
- Delhi Airport ↔ Delhi / railway station / Noida transfer fares (bahut search hota hai; abhi fare galat lagta hai).
- Jaipur sightseeing / full-day aur tempo traveller packages (search mein dikhte hain).
- Naye routes (`evidence/new-routes-2026-11-21.txt`: Gurgaon→Jaipur, Jaipur→Pushkar, Delhi→Vrindavan…).
- Ghoomo Rajasthan tour pages se route pages ke links (`PARTNERS_27NOV.md` §1).
- App mein "website share link" aur "review link bhejein" button.
- GBP review link (D2) aur GBP ka naam (D5).
- Hindi pages (tayyar hain, band) — Wave 1 ≥ 80% index aur kisi Hindi padhne wale ki jaanch ke baad.

## §10 Google Business Profile — har hafte
`GBP_POSTS_DEC2026.md`: December ke 12 posts (hafte mein 3), 17 products (ek baar), profile ki jaanch. Har hafte 2 nayi asli photos, har review ka jawab 48 ghante mein. Somvaar ko Performance → Website clicks ka screenshot.

## §11 Listings (11 sites)
`CITATIONS_21NOV.md` — Justdial, Sulekha, IndiaMART, Bing Places, Apple Business Connect, Facebook, Instagram, LinkedIn, TradeIndia, YouTube, Quora. Naam/pata/phone **bilkul website jaisa**. Profile ban jaaye to link bhejein — main site ke schema (`sameAs`) mein jodunga.

## §12 Partners, brand line, videos
`PARTNERS_27NOV.md`.

## §13 Har somvaar (15 minute)
Search Console se export, `docs/seo/evidence/gsc-<taareekh>/` mein (folder ke naam 27 Nov jaise):
- **Pages:** Export (summary) + har "not indexed" reason ka drill-down + **"View data about indexed pages"** ka export (iske bina Wave 1 ki ginti sirf andaaza hai).
- **Performance:** 7 din aur 28 din.
- GBP Performance screenshot.
Main `WEEKLY.md` bharunga aur batunga agli wave kab khulegi (jab Wave 1 ke ≥ 80% index hon aur "Discovered" na badhe).

## §14 Har mahine
`evidence/SERP_TEMPLATE.md` ke 12 search, India se, phone par incognito — screenshot.
