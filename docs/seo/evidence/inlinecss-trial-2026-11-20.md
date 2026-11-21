# inlineCss trial — 20 Nov 2026 (local build, mobile = 4x CPU + slow 4G)

build-inline exit=0
artifact-inline KB 142040
inline /jaipur-to-delhi-cab bytes=679303
inline /kota-to-jaipur-cab bytes=588211
inline /cab-service-in-kota bytes=509466
inline /delhi-to-agra-cab bytes=660766
inline / bytes=618253
speed-inline exit=1
build-noinline exit=0
artifact-noinline KB 65088
noinline /jaipur-to-delhi-cab bytes=373856
noinline /kota-to-jaipur-cab bytes=282764
noinline /cab-service-in-kota bytes=204019
noinline /delhi-to-agra-cab bytes=355319
noinline / bytes=312752
speed-noinline exit=1
35:    inlineCss: true,


## inlineCss: true
| page | device | LCP | CLS | TBT | TTFB | JS kB | img kB | total kB | LCP element |
|---|---|---|---|---|---|---|---|---|---|
| home | phone-390 | 1.34 s | 0.000 | 346 ms | 572 ms | 177 | 72 | 488 | button.inline-flex | ✗
| home | tab-768 | 0.53 s | 0.000 | 3 ms | 158 ms | 177 | 206 | 622 | img.-z-10 |
| home | lap-1440 | 0.35 s | 0.000 | 26 ms | 109 ms | 192 | 53 | 575 | img.-z-10 |
| route | phone-390 | 1.60 s | 0.000 | 253 ms | 565 ms | 177 | 12 | 478 | p.rise | ✗
| route | tab-768 | 0.09 s | 0.000 | 0 ms | 12 ms | 187 | 67 | 542 | h1.rise |
| route | lap-1440 | 0.45 s | 0.000 | 0 ms | 18 ms | 187 | 12 | 487 | h1.rise |
| city | phone-390 | 1.05 s | 0.000 | 172 ms | 565 ms | 187 | 0 | 433 | p.rise |
| city | tab-768 | 0.24 s | 0.000 | 0 ms | 12 ms | 187 | 0 | 434 | p.mt-1.5 |
| city | lap-1440 | 0.12 s | 0.000 | 0 ms | 16 ms | 187 | 0 | 433 | button.inline-flex |
| vehicle | phone-390 | 0.99 s | 0.001 | 105 ms | 564 ms | 187 | 0 | 420 | p.rise |
| vehicle | tab-768 | 0.23 s | 0.000 | 0 ms | 50 ms | 187 | 0 | 420 | p.mt-1.5 |
| vehicle | lap-1440 | 0.11 s | 0.000 | 0 ms | 45 ms | 187 | 0 | 420 | button.inline-flex |
| routes | phone-390 | 0.93 s | 0.000 | 104 ms | 564 ms | 178 | 0 | 468 | p.rise |
| routes | tab-768 | 0.06 s | 0.000 | 0 ms | 6 ms | 188 | 0 | 632 | p.rise |
| routes | lap-1440 | 0.04 s | 0.000 | 0 ms | 6 ms | 188 | 0 | 590 | p.rise |

## inlineCss: false
| page | device | LCP | CLS | TBT | TTFB | JS kB | img kB | total kB | LCP element |
|---|---|---|---|---|---|---|---|---|---|
| home | phone-390 | 1.77 s | 0.000 | 460 ms | 564 ms | 177 | 72 | 432 | button.inline-flex | ✗
| home | tab-768 | 0.12 s | 0.000 | 0 ms | 7 ms | 177 | 206 | 566 | img.-z-10 |
| home | lap-1440 | 0.16 s | 0.000 | 0 ms | 13 ms | 192 | 53 | 520 | img.-z-10 |
| route | phone-390 | 1.79 s | 0.000 | 358 ms | 566 ms | 187 | 12 | 432 | p.rise | ✗
| route | tab-768 | 0.10 s | 0.000 | 0 ms | 8 ms | 187 | 67 | 487 | h1.rise |
| route | lap-1440 | 0.10 s | 0.000 | 0 ms | 18 ms | 187 | 12 | 432 | h1.rise |
| city | phone-390 | 1.93 s | 0.000 | 434 ms | 565 ms | 187 | 0 | 377 | p.rise | ✗
| city | tab-768 | 0.56 s | 0.000 | 2 ms | 140 ms | 187 | 0 | 377 | p.mt-1.5 |
| city | lap-1440 | 0.31 s | 0.000 | 2 ms | 66 ms | 187 | 0 | 377 | button.inline-flex |
| vehicle | phone-390 | 1.92 s | 0.000 | 557 ms | 565 ms | 187 | 0 | 365 | button.relative | ✗
| vehicle | tab-768 | 0.21 s | 0.000 | 0 ms | 8 ms | 187 | 0 | 365 | p.mt-1.5 |
| vehicle | lap-1440 | 0.14 s | 0.000 | 0 ms | 11 ms | 187 | 0 | 365 | button.inline-flex |
| routes | phone-390 | 1.89 s | 0.000 | 303 ms | 564 ms | 178 | 0 | 395 | p.rise | ✗
| routes | tab-768 | 0.25 s | 0.000 | 3 ms | 53 ms | 188 | 0 | 455 | p.rise |
| routes | lap-1440 | 0.28 s | 0.000 | 0 ms | 109 ms | 188 | 0 | 535 | p.rise |

Decision: keep inlineCss true — off halves HTML and artifact but mobile LCP rises to 1.77–1.93 s (> 1.2 s rule).
