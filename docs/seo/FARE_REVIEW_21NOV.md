# Fare review — routes whose price looks wrong (21 Nov 2026)

Made by `scripts/seo/fare-sanity.mjs` from the public catalogue (2026-11-21). **Kuch bhi badla nahi gaya.** Har line ke aage "theek hai" ya naya fare likh dijiye — main wahi lagaunga. Tab tak ye routes Google ko nahi diye jaayenge (`FARE_HOLD`).

Catalogue median: ₹12.9/km (the "from" price, cheapest car, toll shown separately).

| Route | km | From price | ₹/km | Why flagged | Competitors (research) | Owner: theek / naya ₹ |
|---|---|---|---|---|---|---|
| Delhi → Delhi Airport | 17 | ₹3,000 | 176.5 | ₹176.5/km — over twice the usual ₹12.9/km; the other way is ₹2,300; under 40 km for ₹3,000 | — |  |
| Delhi → Noida | 26 | ₹4,100 | 157.7 | ₹157.7/km — over twice the usual ₹12.9/km; the other way is ₹2,700; under 40 km for ₹4,100 | — |  |
| Delhi Airport → Delhi | 17 | ₹2,300 | 135.3 | ₹135.3/km — over twice the usual ₹12.9/km; the other way is ₹3,000; under 40 km for ₹2,300 | — |  |
| Noida → Delhi | 26 | ₹2,700 | 103.8 | ₹103.8/km — over twice the usual ₹12.9/km; the other way is ₹4,100; under 40 km for ₹2,700 | — |  |
| Noida → Delhi Airport | 38 | ₹2,700 | 71.1 | ₹71.1/km — over twice the usual ₹12.9/km; under 40 km for ₹2,700 | — |  |
| Delhi Airport → Noida | 38 | ₹2,500 | 65.8 | ₹65.8/km — over twice the usual ₹12.9/km; under 40 km for ₹2,500 | — |  |
| Chandigarh → Haridwar | 207 | ₹8,400 | 40.6 | ₹40.6/km — over twice the usual ₹12.9/km; ₹40.6/km vs ₹12.9/km on roads of similar length | — |  |
| Haridwar → Chandigarh | 207 | ₹8,400 | 40.6 | ₹40.6/km — over twice the usual ₹12.9/km; ₹40.6/km vs ₹12.9/km on roads of similar length | — |  |
| Kota → Agra | 398 | ₹9,920 | 24.9 | the other way is ₹8,120; ₹24.9/km vs ₹15.0/km on roads of similar length | — |  |
| Haridwar → Sikar | 511 | ₹9,820 | 19.2 | the other way is ₹8,020; ₹19.2/km vs ₹12.1/km on roads of similar length | — |  |
| Agra → Ajmer | 448 | ₹3,200 | 7.1 | the other way is ₹5,000; only ₹7.1/km vs ₹14.3/km on roads of similar length — too cheap? | — |  |
| Ajmer → Sikar | 180 | ₹4,900 | 27.2 | ₹27.2/km — over twice the usual ₹12.9/km | — |  |
| Noida → Sikar | 317 | ₹6,500 | 20.5 | ₹20.5/km vs ₹11.9/km on roads of similar length | — |  |
| Sikar → Noida | 317 | ₹6,500 | 20.5 | ₹20.5/km vs ₹11.9/km on roads of similar length | — |  |
| Agra → Kota | 398 | ₹8,120 | 20.4 | the other way is ₹9,920 | — |  |
| Delhi Airport → Sikar | 285 | ₹5,600 | 19.6 | ₹19.6/km vs ₹12.0/km on roads of similar length | — |  |
| Sikar → Delhi Airport | 285 | ₹5,600 | 19.6 | ₹19.6/km vs ₹12.0/km on roads of similar length | — |  |
| Delhi → Sikar | 302 | ₹5,600 | 18.5 | ₹18.5/km vs ₹11.9/km on roads of similar length | — |  |
| Sikar → Delhi | 302 | ₹5,600 | 18.5 | ₹18.5/km vs ₹11.9/km on roads of similar length | — |  |
| Agra → Sikar | 374 | ₹6,470 | 17.3 | the other way is ₹5,070 | — |  |
| Sikar → Haridwar | 511 | ₹8,020 | 15.7 | the other way is ₹9,820 | — |  |
| Sikar → Agra | 374 | ₹5,070 | 13.6 | the other way is ₹6,470 | — |  |
| Ajmer → Agra | 448 | ₹5,000 | 11.2 | the other way is ₹3,200 | — |  |

23 routes flagged.
