# Aapke kaam — keyword files (27 Nov 2026)

**Kiske liye:** owner. Aapki 4 keyword files par kaam ho gaya (§1). Neeche wo faisle hain jinke bina kuch pages ruke hain, aur kuch hafte-dar-hafte ke kaam.

---

## §1 Kya bana

- **Aapke 3,349 keywords** repo mein hain aur har ek hamare asli page se juda hai (`docs/seo/keywords.csv`, `source = owner-file`). Har hafte ki report batayegi inme se kitno ko Google par impressions mile. 27 Nov tak sirf 19 ko pichhle 3 mahine mein koi impression mila tha.
- **Wave 1 ke pages par gayab shabd jode** (sab sach, har page ke apne numbers ke saath):
  - City pages: "Outstation taxi from {shehar}", "Hourly and full-day taxi in {shehar}", "private cab".
  - Route pages: "door to door", "family" (sabse sasti 6-seater ka fare).
  - Khatu pages: "same-day darshan" (round trip ka asli fare).
  - Gaadi pages: "{gaadi} on rent in Jaipur with driver".
  - Airport page: "Jaipur Airport to {shehar} cab".
- **Naye routes (Wave 2 tak noindex):** Jodhpur ↔ Jaisalmer, Jodhpur ↔ Udaipur. In do ki naapi doori catalogue se 1–2% hi alag thi. Jodhpur ka city page bhi apne aap ban gaya (3 routes), wo bhi noindex.
- **Jaipur local sightseeing page** (`/jaipur-local-sightseeing-taxi`): aaj ke local package prices, noindex (Wave 2).
- **Jaipur railway station page** (`/jaipur-railway-station-taxi`): code taiyaar, **live nahi** (404) — station fares chahiye (§2, E1).
- **Hindi vaakya** (route/city par): bane hain, **chhupe** hain jab tak koi Hindi padhne wala na dekhe (E7).
- **Nahi bane (jaan-boojh kar):** 14 chhote shehron ke city pages (Tonk, Dausa, Alwar…) — na routes, na trips; Google inhe doorway spam maanta hai. Inka test bhi laga hai.

## §2 Faisle (abhi kya chal raha hai → aapke jawab se kya badlega)

| # | Faisla | Abhi | Aap batayein to |
|---|---|---|---|
| E1 | **Jaipur railway station → shehar zone fares** (Jaipur Junction / Durgapura / Gandhinagar se) | Station page band (404) | Airport jaisa format bhejein: Zone A (≤ 12 km), B (≤ 20), C (≤ 30) × Hatchback / Dzire / Ertiga / Crysta, waiting kitne minute free, raat ka charge. Page 1 din mein chalu (Wave 2 tak noindex) |
| E2 | **Local / sightseeing package price** | Aaj ka: 8 hr / 80 km Hatchback ₹2,500, Dzire ₹2,750, Ertiga ₹3,250, Crysta ₹5,000 (+ GST). Competitors ₹1,600–2,700 | Ye **aap khud admin panel se badal sakte hain** (pricing → local packages) — page apne aap naya price dikhayega |
| E3 | **Ludhiana → Chandigarh** (226 trips/90 din — sabse zyada) | Nahi joda: hamara per-km fare ₹2,300 (andaazan 118 km par), asli doori 100 km, competitors ₹1,100–1,600 | Fixed fare batayein (jaise Dzire ₹X) → route juda, Wave 2 mein |
| E4 | **Jaipur ↔ Pushkar** (64 trips) aur **Chandigarh ↔ Dehradun** (30) | Nahi jode: per-km fare galat doori par lagta (Pushkar: andaaza 171 km, asli 141–144; Chandigarh–Dehradun: andaaza 168, asli 192) | Do raaste: (a) dono ka **fixed fare** batayein; ya (b) "naapi doori wali table" chalu karne ki haan — isse **saare per-km routes ke price** naapi doori par aa jayenge (Pushkar sasta hoga, kuch routes mehnge). (a) aasaan hai |
| E5 | Haridwar ↔ Rishikesh / Dehradun | Nahi jode (25 km par ₹2,300 minimum fare) | Fixed fare |
| E6 | Salasar Balaji (55 trips mein naam) | Kuch nahi (backend mein shehar hi nahi) | Haan + fare → shehar aur route jodenge |
| E7 | Hindi padhne wala | Hindi vaakya chhupe | Naam batayein — main list bhejunga, wo theek karein, phir dikhenge |
| E8 | **hellomycab.com wapas lena** | — | Sabse bada kaam (`OWNER_STEPS_INDEX_RANK_27NOV.md` §0) |

## §3 Doori ki jaanch (27 Nov, Ola router — asli sadak)

| Route | Asli | Catalogue andaaza | Farak | Faisla |
|---|---|---|---|---|
| Jodhpur ↔ Jaisalmer | 287 km, ~4 h 20 min | 291 km | 1% | ✅ joda |
| Jodhpur ↔ Udaipur | 260 km, ~4 h | 256 km | 2% | ✅ joda |
| Jaipur ↔ Pushkar | 141–144 km, ~3 h | 171 km | +19–21% | ⛔ E4 |
| Chandigarh ↔ Dehradun | 192 km, ~4 h | 168 km | −12% | ⛔ E4 |
| Ludhiana ↔ Chandigarh | 100 km, ~2 h 10 min | 118 km | +17% | ⛔ E3 |

**Ek technical baat:** naapte waqt Google Maps API ne "permission denied (403)" diya; system apne aap Ola par chala gaya, isliye kaam nahi ruka. Google Cloud mein Maps key ka billing/permission dekh lein (ya bata dein, main batata hoon kya dekhna hai).

## §4 Keyword Planner (asli search volume)
Aapki files mein volume ka ek bhi number nahi hai. Google Ads account mein muft:
1. Google Ads → Tools → **Keyword Planner** → "Get search volume and forecasts".
2. Ye 100 keywords paste karein (`docs/seo/keywords.csv` mein `source = owner-file`, `wave = 1`, priority high wale pehle — main list alag file mein de dunga jab aap kahein).
3. Location: India → Download → file mujhe bhejein. Main priorities volume ke hisaab se dobara lagaunga.

## §5 GBP — naye posts
`GBP_POSTS_DEC2026.md` ke "Naye pages" hisse mein: Jodhpur → Jaisalmer, Jodhpur → Udaipur, Jaipur local 8 hr / 80 km. (Pushkar aur station wale posts tabhi jab E4 / E1 ho.) Service areas mein **Jodhpur** jodein.

## §6 Baad ke candidates (kya chahiye)
- Jodhpur / Udaipur city pages — Wave 3 (Jodhpur ka ban gaya hai, noindex).
- Bikaner / Pushkar / Jaisalmer / Bhilwara city pages — unke routes pehle.
- Agra–Mathura, Ajmer–Udaipur, Jaipur–Bikaner / Bhilwara — demand hai, doori jaanch + Wave 3.
- **Delhi → Rishikesh** (duties mein 311 baar): per-km ₹3,780 vs Delhi → Haridwar ₹2,920 — fixed fare chahiye.
- **Dehradun city page** (558 pickups) — Delhi ↔ Dehradun Wave 2 mein khulne ke baad.
- **Gurgaon → Jaipur** (50 trips): per-km ₹4,130 vs Delhi → Jaipur ₹2,800 — fare theek ho ya Delhi page par "Gurgaon pickup" line.

## §7 Char Dham / Rajasthan tours
Abhi sample packages hain (noindex). Asli packages aur price bhejein to page index ke laayak banega (wave ke saath).

## §8 Yaad rahe
- Request Indexing abhi **sirf Wave 1** ke 45 URL (`OWNER_STEPS_INDEX_RANK_27NOV.md` §2, 30 Nov – 4 Dec). Naye pages ke liye nahi.
- **Validate fix: 11 Dec 2026.**
- Har somvaar GSC export (folder naam 27 Nov jaise, "View data about indexed pages" ke saath).
