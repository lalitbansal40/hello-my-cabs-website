# Measured distances — Jaipur Airport zones and Khatu Shyam Ji (21 Nov 2026)

How: locality coordinates from OpenStreetMap Nominatim (the backend's own `nominatimSearch`, one request a second); road distance from the backend's configured router (`resolveRoadRoute`, provider **Ola**, `distanceSource: measured`) from the JAI terminal (26.8242, 75.8122). Scripts were one-off (scratchpad); results below are what `hello-my-cab-backend/src/constants/airportTransfers.ts` uses.

## Jaipur Airport → locality (road km)

| Locality | km | Zone (A ≤ 12 · B ≤ 20 · C ≤ 30) |
|---|---|---|
| Jagatpura | 7.9 | A |
| Durgapura | 9.3 | A |
| Malviya Nagar | 9.4 | A |
| Sanganer | 11.3 | A |
| Pratap Nagar | 12.5 | B |
| Gopalpura | 12.7 | B |
| Mansarovar | 13.9 | B |
| Raja Park | 14.4 | B |
| Sitapura | 15.7 | B |
| MI Road | 16.0 | B |
| Hawa Mahal | 16.4 | B |
| Jaipur Railway Station | 16.7 | B |
| C-Scheme | 17.2 | B |
| Civil Lines | 17.3 | B |
| Sindhi Camp | 17.7 | B |
| Bani Park | 18.4 | B |
| Vaishali Nagar | 19.6 | B |
| Vidhyadhar Nagar | 24.2 | C |
| Amer | 24.3 | C |
| Jhotwara | 25.0 | C |

Not listed: **Murlipura** — the geocoder put it 73 km away (wrong match); left out rather than guessed. Tonk Road is a road, not a point — left out.

## Khatu Shyam Ji (temple 27.3596, 75.4005)

| From | km | Drive (router) | Passes (polyline within 2 km) |
|---|---|---|---|
| Reengus Junction | 19 | 23 min | — |
| Jaipur | 82 | 1 h 38 min | Chomu, Reengus |
| Jaipur Airport | 97 | 2 h 10 min | — |
| Delhi | 282 | 4 h 34 min | Behror, Kotputli, Shahpura, Reengus |
| Delhi Airport | 271 | 4 h 20 min | — |
| Sikar | 47 | 51 min | — |

Jaipur Airport → Jaipur (city centre point): 21 km, 44 min.
