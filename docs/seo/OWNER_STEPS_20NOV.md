# Aapke karne ke kaam — indexing (20 Nov 2026)

Ye sirf wo kaam hain jo aapke account se hi ho sakte hain. Baaki sab code/server se ho chuka hai (`LEDGER_INDEXING_20NOV.md`). Order mein karein.

---

## 1. Hostinger DNS — sabse pehle (2 minute)

Abhi `hellomycabs.com` (bina www) ka koi record nahi hai, isliye Google ka sabse bada URL (`http://hellomycabs.com/`, 67% impressions) khulta hi nahi. Server ka redirect tayyar hai.

1. Hostinger → **Domains** → `hellomycabs.com` → **DNS / Nameservers**.
2. **Add record**: Type `A`, Name `@`, Points to `43.204.57.108`, TTL `300`.
3. `@` ka koi aur `A` / `AAAA` / parking record ho to **delete**.
4. `www` aur `api` ke records **mat chhedo**.
5. Mujhe bata dijiye — main server par Caddy reload karke check karunga (`http(s)://hellomycabs.com/...` → ek 301 → `https://www.hellomycabs.com/...`).

## 2. Google Search Console

**a. Sitemaps** (Indexing → Sitemaps): ye 6 URL ek-ek karke submit karein:
```
https://www.hellomycabs.com/sitemap.xml
https://www.hellomycabs.com/sitemaps/sitemap/core.xml
https://www.hellomycabs.com/sitemaps/sitemap/cities.xml
https://www.hellomycabs.com/sitemaps/sitemap/routes.xml
https://www.hellomycabs.com/sitemaps/sitemap/vehicles.xml
https://www.hellomycabs.com/sitemaps/sitemap/guides.xml
```
Status "Success" aana chahiye. Ab sitemap mein ~78 pages hain (pehle 145) — 67 kam-demand routes jaan-boojh kar abhi bahar hain (Tier 3).

**b. Request Indexing** (upar search bar mein URL daalo → "Request indexing"). Google din mein ~10 deta hai:

- **Din 1:** `/` · `/jaipur-to-delhi-cab` · `/delhi-to-jaipur-cab` · `/cab-service-in-kota` · `/cab-service-in-jaipur` · `/kota-to-jaipur-cab` · `/jaipur-to-kota-cab` · `/routes` · `/cab-service-in-delhi` · `/jaipur-to-delhi-airport-cab`
- **Din 2:** `/kota-to-delhi-cab` · `/delhi-to-kota-cab` · `/delhi-airport-to-jaipur-cab` · `/jaipur-to-agra-cab` · `/delhi-to-agra-cab` · `/delhi-to-chandigarh-cab` · `/delhi-to-haridwar-cab` · `/jaipur-to-sikar-cab` · `/sikar-to-jaipur-cab` · `/cab-service-in-sikar`
- **Din 3:** `/cab-service-in-agra` · `/cab-service-in-chandigarh` · `/dzire-taxi` · `/innova-crysta-taxi` · `/ertiga-taxi` · `/tempo-traveller-12-seater-rental` · `/fares-explained` · `/guides/jaipur-delhi-by-road` · `/jaipur-to-delhi-round-trip-cab` · `/about`

(Har URL ke aage `https://www.hellomycabs.com` lagega.)

**c. Validate fix** (Indexing → Pages → neeche reasons): Step 1 ke baad "Page with redirect", "Not found (404)", "Blocked by robots.txt" — har ek kholo → **Validate fix**.

**d. Har hafte (Somvaar):** Pages → Export; Performance (3 months) → Export. Zip `~/Downloads` mein rehne do aur mujhe bata do — main `docs/seo/WEEKLY.md` bhar dunga aur gate ke hisaab se agle routes kholunga.

## 3. Bing Webmaster Tools (5 minute)

https://www.bing.com/webmasters → Sign in → **Import from Google Search Console** → `hellomycabs.com` select. Sitemaps apne aap aa jaayenge. (IndexNow main code se bhej chuka hoon.)

## 4. Google Business Profile

`GBP_CHECKLIST.md` ke hisaab se. Sabse zaroori: **Website** field → `https://www.hellomycabs.com/` (www ke saath). Service areas: Jaipur, Kota, Delhi, Sikar, Agra, Chandigarh.

## 5. Play Console

Dono apps (customer + driver) → Store presence → Store settings → **Website** → `https://www.hellomycabs.com/`.

## 6. Directory listings (jab time ho)

Justdial, Sulekha, IndiaMART, Google Maps — har jagah **same** naam, phone aur address (`src/lib/company.ts` wala) aur website `https://www.hellomycabs.com/`. Link khareedna nahi hai.

## 7. Jo maine nahi kiya — aapka faisla

- **Nakli review counters ka production rebuild:** website par ab koi rating number nahi dikhta (asli ratings 0 hain). Database ke `reviewstats` (62,734+) waise hi pade hain. Saaf karna ho to bolein — pehle backup lekar `scripts/rebuild-review-stats.ts` chalaunga.
- **Jaipur Airport / Khatu Shyam pages:** fares confirm karein to bana dunga.
- **Route ke asli facts** (pickup points, rukne ki jagah, toll): koi bhi aapke driver/office se mile to bhejein — wahi pages ko sach mein alag banayega.
