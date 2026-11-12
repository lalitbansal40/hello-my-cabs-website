# Links and trust — plan (13 Nov 2026)

For Step 12 of `PROMPT_INDEX_AND_RANK_13NOV.md`.

A new domain is indexed slowly mostly because few real sites point at it. The links worth having come from people who actually use, host or write about the service. Nothing here is bought.

## Forbidden
- Paid links, link packages, PBNs, "1000 backlinks" offers.
- Comment or forum spam, automated directory blasts.
- Swapping links with unrelated sites.

These can cost the whole domain its ranking, and recovery takes months.

## Targets (owner works through the list; each with one honest line)

| # | Who | Why they would link | Page to link | Status |
|---|---|---|---|---|
| 1 | Hotels / guest houses in Jaipur that send guests to the airport or Delhi | "Our guests' taxi partner" page or booking note | `/cab-service-in-jaipur`, `/jaipur-to-delhi-cab` | ☐ |
| 2 | Dharamshalas and hotels at Khatu Shyam / Salasar (only if the service runs there, D4) | pilgrims ask them for cabs | `/cab-service-in-sikar` | ☐ |
| 3 | Kota coaching-area PG/hostel owners and parent groups | parents travel Kota ↔ Jaipur / Delhi | `/cab-service-in-kota`, `/kota-to-jaipur-cab` | ☐ |
| 4 | Corporate clients who book regularly | vendor or partner page | home | ☐ |
| 5 | Local news / city blogs (Jaipur, Kota) | a real story: fixed-fare one-way taxis, the driver app, the women's-safety rules, a festival-season advisory | home or a guide | ☐ |
| 6 | Travel bloggers who used the service | a trip write-up | the route they took | ☐ |
| 7 | Haridwar / Rishikesh hotels | Delhi ↔ Haridwar pickups | `/delhi-to-haridwar-cab` | ☐ |
| 8 | The Play Store listing | already ours; website field set | home | ☐ |

**Outreach line (template, edit per person):**
"Namaste — we run Hello My Cab, fixed-fare one-way taxis from Jaipur, Delhi and Kota. Your guests ask about cabs to <city>. If it helps them, here is our page with the real fares: <link>. Happy to give your desk a direct number."

## Content that earns links
Through the existing guides system (`src/content/guides`), real facts only, each with an honest `updated` date:

- **"Kota se Jaipur airport — subah ki flight ke liye kab niklein"**: drive time from the backend's route data, the advance-booking rule, the night-pickup rule.
- **"Delhi–Jaipur expressway: kaunsa rasta, kitna samay"**: only with the tolls and times drivers confirm (D3, `scripts/seo/pull-driver-data.mjs`).
- **"Jaipur se Khatu Shyam ji kaise jaayein"**: only once D4 confirms the service.

A draft road guide (`draft: true` in `src/content/guides/roads.ts`) goes live only when the owner or a driver confirms its `confirm` list.
