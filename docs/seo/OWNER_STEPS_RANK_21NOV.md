# Aapke karne ke kaam — ranking (21 Nov 2026)

Code ka kaam ho gaya (`LEDGER_RANK_21NOV.md`). Ye wo kaam hain jo sirf aapke account / aapke faisle se ho sakte hain. Kisi mein bhi env ya server par kuch nahi karna.

---

## 1. WhatsApp rating template (sabse pehle — 10 minute)

AutoChatix / Meta WhatsApp Manager mein naya template submit karein:

```
Naam:     hmc_rate_ride_v1
Category: Utility   (Meta "Marketing" kar de to bhi theek hai — approve hone dein)
Language: English (en)

Body:
Namaste {{1}} 🙏

Aapki Hello My Cab ride ({{2}}) poori hui. Kaisi rahi? 10 second me rating dijiye:
{{3}}

Aapki rating se hum service aur behtar karte hain.

Reply STOP to opt out.

Sample:
{{1}} = Rohit
{{2}} = Jaipur to Delhi
{{3}} = https://www.hellomycabs.com/rate/66f1c2a9b4e5d6c7a8b9c0d1.AbCdEfGhIjKlMnOpQrStUv
```

**Approve hote hi mujhe bas "template approve ho gaya" bolein** — main code mein ek line badal ke push karunga. Tab tak ye message kisi ko nahi jaayega (pehle jaa sakta tha — 21 Nov ko maine ise rok diya, kyunki bina approval bhejna number ki quality kharab karta).

**Zaroori baat:** abhi tak ek bhi customer booking "completed" nahi hui (saari trips driver-to-driver duties hain), isliye ye message tabhi jaayega jab website/app ki customer booking complete hogi. Reviews ka asli rasta abhi **Google Business Profile** hai (section 5).

## 2. Google review link + rating

- Google Business Profile → **"Ask for reviews"** / "Share review form" → link copy karke mujhe bhejein (`g.page/r/...`). Main code mein daal dunga — rating page aur booking page par "Google par review" button apne aap aa jaayega.
- Har mahine profile ki rating aur review count bata dein — website par "4.7 on Google · 156 reviews · October 2026" update karunga.

## 3. Search Console — naye pages ki Request Indexing

Deploy ke baad (main bataunga), roz ~10:

**Din 1:**
```
https://www.hellomycabs.com/jaipur-airport-taxi
https://www.hellomycabs.com/jaipur-to-khatu-shyam-ji-cab
https://www.hellomycabs.com/cab-service-in-khatu-shyam-ji
https://www.hellomycabs.com/khatu-shyam-ji-to-jaipur-cab
https://www.hellomycabs.com/guides/how-to-reach-khatu-shyam
https://www.hellomycabs.com/guides/jaipur-sikar-by-road
https://www.hellomycabs.com/guides/jaipur-delhi-airport-by-road
https://www.hellomycabs.com/delhi-to-khatu-shyam-ji-cab
https://www.hellomycabs.com/cab-service-in-kota
https://www.hellomycabs.com/jaipur-to-delhi-cab
```
Pichhli list (`OWNER_STEPS_20NOV.md` §2b) ke bache hue URLs bhi chalte rahein.

## 4. Rich Results Test (5 minute, ek baar)

https://search.google.com/test/rich-results — ye 6 URL ek-ek daal ke "Test URL". Har ek par "valid items" aana chahiye, koi error nahi. Screenshot mujhe bhej dein.
```
https://www.hellomycabs.com/
https://www.hellomycabs.com/jaipur-to-delhi-cab
https://www.hellomycabs.com/cab-service-in-kota
https://www.hellomycabs.com/jaipur-airport-taxi
https://www.hellomycabs.com/guides/how-to-reach-khatu-shyam
https://www.hellomycabs.com/innova-crysta-taxi
```

## 5. Google Business Profile — har hafte

Poora kit: **`docs/seo/GBP_KIT_21NOV.md`** — profile check, 10 products, 8 posts (4 hafte ke), Q&A, review jawab, 20 photos. Har Somvaar 2 posts + reviews ka jawab. Profile → Performance → "Website clicks" ka number mujhe bata dein (website par analytics chalu nahi hai, isliye GBP se kitne log aaye ye yahin se pata chalega).

## 6. Drivers se route ki jaankari (aap "haan" bolein to main bhejunga)

Survey ab har complete duty ke baad driver ko apne aap jaata hai. Purane drivers ke liye ek baar: **23 drivers, 11 routes** (pichhle 90 din mein un routes par chalne wale) — har driver ko ek app notification, ek route ka link. Aap bolein "survey bhej do" → main ek command chalaunga.

- Jawab aane par admin app → **Route answers** mein approve/reject karein. Jo baat 2+ approved drivers ki milti hai wahi website par aati hai (rukne ki jagah, toll, pickup areas).
- Driver ko reward dena ho to admin panel mein "route survey reward" set karein (abhi ₹0).

## 7. Fares — aapka faisla

- **`docs/seo/FARE_REVIEW_21NOV.md`** — 23 routes jinka fare galat lag raha hai (jaise Delhi → Delhi Airport 17 km ₹3,000, Delhi → Noida 26 km ₹4,100, Delhi → Sikar ₹5,600 jabki Jaipur → Delhi ₹2,800). Har line ke aage "theek hai" ya naya fare likh dein. Tab tak ye routes Google ko aage nahi badhaye jaayenge.
- **Naye routes jinki maang hai par page nahi:** `docs/seo/evidence/new-routes-2026-11-21.txt` — pichhle 90 din mein 20+ trips wale 100 pairs (jaise Mumbai → Surat 228, Ludhiana → Chandigarh 163, Jaipur → Pushkar 70, Chandigarh → Shimla 57, Delhi → Vrindavan 52). Jinhe bechna hai unka fare bata dein — page ban jaayega.
- **Maine jo fares tay kiye (aapke kehne par):** Jaipur Airport ↔ shehar (zone A/B/C, Dzire ₹549/₹649/₹849), Khatu Shyam ji (Jaipur ↔ Khatu ₹1,199 hatchback / ₹1,349 Dzire; Delhi ↔ Khatu ₹3,099 / ₹3,399; Reengus ↔ Khatu ₹549 Dzire). Badalne hon to bata dein — ek file mein hain.

## 8. Baad ke kaam (is baar nahi kiye — aapka faisla chahiye)

- Airport transfer ka **online payment** (abhi call-back request se booking hoti hai).
- Kota ke liye "students & parents" wali line — aap confirm karein ki ye service aap sach mein dete hain.
- Sikar ↔ Khatu route ka fare.
- **GBP ka naam** — "Hello My Cab -Taxi service in jaipur" mein keyword hai (Google ki policy ke khilaaf; suspend ka risk). Kit §1 dekhein.
- **Website analytics** (Plausible) — chalu karne ke liye account + Amplify mein ek value chahiye. Aapne env mana kiya hai, isliye band hai.
- **Purani site hellomycab.com** — abhi bhi alag chal rahi hai (117 pages, title "Jaipur Taxi Service"). Ye usi naam par Google mein humse ladti hai. Agar ye aapke control mein aa sake to use hellomycabs.com par redirect karwana sabse bada faayda hoga.

## 9. Listings (jab time ho)

**`docs/seo/CITATIONS_21NOV.md`** — Justdial, Sulekha, IndiaMART, TradeIndia, Bing Places, Apple, LinkedIn, YouTube… har jagah same naam/phone/address/website (copy-paste text diya hai). Profile ban jaaye to link mujhe bhejein.

## 10. Har mahine

- 12 search ke screenshot (`docs/seo/evidence/SERP_TEMPLATE.md` mein tareeka) — phone, incognito.
- Search Console: Pages + Performance export (Somvaar wala routine, `scripts/seo/weekly.md` §9).

## 11. Hindi pages

`/hi/…` pages ban gaye hain par Google se chhupe hain (noindex). Inhe kholne ke do shart: (1) Tier 1 ke 80% pages index ho jaayein, (2) koi Hindi padhne wala (aap ya jise aap kahein) `src/content/hi/index.ts` ki Hindi padh ke theek kar de. Tab main ek line badal ke chalu kar dunga.
