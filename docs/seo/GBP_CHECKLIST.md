# Google Business Profile + citations — owner checklist (13 Nov 2026)

For Step 11 of `PROMPT_INDEX_AND_RANK_13NOV.md`. Every step is done by the owner in Google's own tools. Nothing here is automated, and nothing may be invented.

**The profile that exists:** "Hello My Cab -Taxi service in jaipur", 4.7★, 156 reviews. Its Website link is this site. Knowledge Graph id `/g/11txkmqf6s`, already in `src/lib/company.ts` `sameAs`.

**Why this matters:**
- Searches like "kota taxi service" and "taxi service near me" show the Maps pack before the web results.
- The brand query "hello my cab" sits at average position 3.9. The old `hellomycab.com` site (not ours, 117 pages, `scripts/seo/monitor-domains.mjs`) competes for the same name.
- A complete, active profile is the strongest "this is the company" signal we control.

## A. The profile (business.google.com)
1. **Primary category:** Taxi service.
   **Secondary:** only what is true, e.g. "Airport shuttle service" (if airport pickups are offered) or "Car rental agency" (only if cars are rented with a driver as a service).
2. **Service areas:** the cities actually served, up to 20. Jaipur, Delhi, Kota, Sikar, Ajmer, Agra, Noida, Chandigarh, Haridwar… — never a whole state.
3. **Hours:** 24 hours, every day (the site says "Every day, around the clock").
4. **Phone:** +91 96671 11921, exactly as on the site.
   **Website:** `https://www.hellomycabs.com` (with www and https).
5. **Services:** one entry per real service with its "from" fare as the site shows it. One way taxi; round trip; airport transfer; Tempo Traveller (round trip).
6. **Photos:** cars (outside and inside), the office, drivers **with their consent**. At least 10, then 2–3 new ones a month. No stock photos.
7. **Description (750 characters):** what the site's home page says, in plain words: fixed fare, no return fare on one way, small advance, 24×7, the cities. No "best" or "no. 1".
8. **Q&A:** add 4–5 real questions people ask the desk (advance, toll, GST, night pickup) with the site's answers.
9. **Booking link:** `https://www.hellomycabs.com/routes` or the home page.

## B. Activity (weekly, ~10 minutes)
1. One **post** a week: a route with its real fare, a festival or mela note, an airport note. Link to the matching page: `/cab-service-in-kota`, `/jaipur-to-delhi-cab`, …
2. **Answer every review**, good or bad, by name, within 2 days.

## C. Reviews — the only allowed way
1. Get the profile's review link: Profile → "Ask for reviews" → copy.
2. Send it **after a completed trip** in the existing customer message (WhatsApp/SMS), once. The owner decides the wording.
3. **Never:**
   - offer a discount, cash or anything for a review;
   - write one yourself or ask staff, drivers or family to;
   - gate reviews (asking only happy customers).

   These break Google's policy and can remove the profile.

## D. A second profile (only if true)
A Kota profile only if there is a **real, staffed address in Kota** that customers can visit or that receives post for verification. Otherwise Kota stays a service area of the Jaipur profile.

## E. Citations — same name, address, phone everywhere
The address must match `src/lib/company.ts` word for word. Create or claim each, then record its URL here.

| Site | URL (fill in) | Done |
|---|---|---|
| Justdial | | ☐ |
| Sulekha | | ☐ |
| Bing Places (import from Google) | | ☐ |
| Apple Business Connect | | ☐ |
| Facebook page (exists: profile in `sameAs`) | https://www.facebook.com/people/Hello-My-Cab/100095184243227/ | ☑ |
| Instagram (exists) | https://www.instagram.com/hellomycabjaipur | ☑ |
| YouTube channel (if made) | | ☐ |

Each verified URL can go into `company.sameAs` (owner decision D7). Check it is really this business before adding it.

## F. Play Store
Listing → Store settings → Website: `https://www.hellomycabs.com`.
Privacy policy URL: `https://www.hellomycabs.com/privacy` (decision D2). The `api.` copy stays live with noindex + canonical either way.
