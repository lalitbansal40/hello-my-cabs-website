# Measured performance and size

22 October2026. **18/18 final comparison cases pass.** The guide regression gates are now closed. The original27 baseline reports and all rejected/recheck trials remain unchanged. This is local lab evidence, not a live/field-CWV or real-device result.

The final product change limits Tailwind class detection to `src` using `source("../")` in `globals.css`. Audit scripts/reports no longer contribute utility candidates to public CSS. [Tailwind source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files). No font, image, priority, dimensions, theme policy, JS/business flow or threshold changed. Actual inline CSS fell from101667raw/19251gzip to100649raw/18953gzip bytes; guide HTML transfer fell by824bytes. This is a measured payload reduction and a source-boundary fix. Variable lazy-image scheduling still affects raw Lighthouse ranges; these runs do not prove that CSS size alone explains all timing variance.

Final source SHA-256 `cf716c836e501cce559498930a4738a12d03361c70c9dd23c7754dbca0a7ad37` / BUILD_ID `2TdJpHMt1uQnjRfrNUw9A`. The54 final reports all use this artifact: six initial post-fix guide reports,45 other path/theme reports and the latest three Light round-trip reports from the controlled comparison. No prior-source pass is reused. The first scoped Light round-trip failure remains recorded; its repeat was predefined after investigating observed-paint versus simulated-CPU inconsistency. The diagnostic control does not replace the original baseline gates. [Raw case data](evidence/PERFORMANCE.json) and [hashes](evidence/RAW_HASHES.json) locate bulky originals under `/private/tmp/hmc-theme/`; preserve/export them before OS temporary-file cleanup.


## Method and provenance


Optimized Next production servers: frozen baseline on3420; final artifact on3421; loopback snapshot API on43211. Same 48 public data responses and Node24.19.0. Lighthouse12.8.2, Chrome155.0.8059.80 (headless155), default mobile412×823/DPR1.75, simulated4× CPU/150ms RTT/1638.4kbps. Each case uses three fresh Chrome instances with cleared browser cache, `--disable-storage-reset`, preseeded explicit mode and callback-seen value. Every report has a proof captured inside the actual measured document. No post-close mode inference. Normal production compression settings stay unchanged.

The baseline remains the original pre-feature27. Source/build/configuration fingerprints accompany trials. A cached exact12.8.2 CLI replaced an npm launcher that timed out; no Lighthouse version change. Median values and full raw min/max ranges are retained. Server/optimizer caches were built/warmed separately; this is cold browser measurement, not cold AWS or field CWV.


## Final case medians

| Path | Mode | Score (3 raw) | LCP ms [raw min–max] | Δ LCP ms | TBT ms [raw min–max] | CLS | Gate |
|---|---|---:|---:|---:|---:|---:|---|
| `/` | light | 91 (91/91/92) | 3416.5 [3382.2–3426.1] | -70.2 | 33.5 [13.5–123.0] | 0.000000 | PASS |
| `/routes` | light | 94 (94/94/94) | 3062.4 [3058.4–3112.1] | -93.4 | 3.5 [2.5–50.0] | 0.000000 | PASS |
| `/jaipur-to-delhi-cab` | light | 92 (92/91/92) | 3374.2 [3361.8–3539.3] | -42.0 | 3.5 [1.5–4.0] | 0.000000 | PASS |
| `/jaipur-to-delhi-round-trip-cab` | light | 92 (92/92/92) | 3307.5 [3272.5–3320.3] | +53.8 | 32.0 [30.0–53.5] | 0.000000 | PASS |
| `/jaipur-to-delhi-airport-cab` | light | 93 (93/93/93) | 3224.3 [3141.7–3264.6] | -83.8 | 28.5 [7.0–51.7] | 0.000089 | PASS |
| `/cab-service-in-jaipur` | light | 93 (93/93/93) | 3245.0 [3237.1–3250.1] | -76.5 | 20.0 [15.5–22.5] | 0.000000 | PASS |
| `/innova-crysta-taxi` | light | 90 (90/93/90) | 3569.0 [3259.2–3578.3] | +56.9 | 18.5 [13.5–25.5] | 0.000000 | PASS |
| `/guides/one-way-or-round-trip` | light | 93 (88/93/93) | 3233.3 [3173.7–3946.6] | +135.1 | 37.0 [20.0–45.8] | 0.000000 | PASS |
| `/guides/jaipur-delhi-by-road` | light | 93 (92/93/93) | 3222.1 [3186.2–3283.7] | -97.1 | 35.0 [26.0–40.5] | 0.000000 | PASS |
| `/` | dark | 91 (91/92/91) | 3417.6 [3316.6–3429.9] | -69.1 | 39.5 [29.0–56.0] | 0.000000 | PASS |
| `/routes` | dark | 93 (93/93/94) | 3076.6 [2985.4–3132.4] | -79.3 | 68.0 [35.0–120.0] | 0.000000 | PASS |
| `/jaipur-to-delhi-cab` | dark | 92 (92/93/89) | 3250.1 [3212.3–3389.8] | -166.1 | 110.5 [22.0–189.0] | 0.000089 | PASS |
| `/jaipur-to-delhi-round-trip-cab` | dark | 94 (93/94/96) | 3035.7 [2395.5–3264.8] | -217.9 | 21.5 [20.5–165.0] | 0.000000 | PASS |
| `/jaipur-to-delhi-airport-cab` | dark | 93 (94/92/93) | 3236.8 [3106.4–3303.3] | -71.3 | 26.0 [15.0–102.0] | 0.000089 | PASS |
| `/cab-service-in-jaipur` | dark | 92 (92/92/91) | 3301.8 [3270.5–3319.5] | -19.6 | 46.1 [20.5–62.5] | 0.000000 | PASS |
| `/innova-crysta-taxi` | dark | 92 (91/92/93) | 3294.1 [3245.8–3454.9] | -217.9 | 45.5 [17.0–48.5] | 0.000000 | PASS |
| `/guides/one-way-or-round-trip` | dark | 93 (92/93/93) | 3213.0 [3170.6–3234.2] | +114.9 | 49.0 [17.5–107.5] | 0.000000 | PASS |
| `/guides/jaipur-delhi-by-road` | dark | 94 (94/88/94) | 3048.7 [3030.0–3449.1] | -270.5 | 30.5 [20.0–208.5] | 0.000000 | PASS |

## Baseline medians

| Path | Score (3 raw) | LCP ms [raw min–max] | TBT ms [raw min–max] | CLS |
|---|---:|---:|---:|---:|
| `/` | 89 (61/91/89) | 3486.7 [3455.0–3806.6] | 145.7 [47.0–1716.0] | 0.000000 |
| `/routes` | 93 (93/92/93) | 3155.9 [3078.3–3158.8] | 116.0 [41.0–153.0] | 0.000000 |
| `/jaipur-to-delhi-cab` | 91 (91/91/87) | 3416.2 [3347.2–3500.7] | 121.9 [30.0–230.5] | 0.000089 |
| `/jaipur-to-delhi-round-trip-cab` | 93 (93/93/92) | 3253.7 [2564.8–3277.3] | 39.5 [21.5–201.3] | 0.000000 |
| `/jaipur-to-delhi-airport-cab` | 92 (91/92/92) | 3308.1 [3220.2–3308.6] | 115.0 [76.0–124.0] | 0.000089 |
| `/cab-service-in-jaipur` | 92 (92/92/88) | 3321.5 [3288.3–3328.1] | 80.9 [20.5–230.0] | 0.000000 |
| `/innova-crysta-taxi` | 88 (88/86/93) | 3512.1 [3248.7–3897.9] | 40.0 [19.5–248.5] | 0.000000 |
| `/guides/one-way-or-round-trip` | 93 (90/94/93) | 3098.2 [3078.3–3634.6] | 56.0 [29.0–97.2] | 0.000000 |
| `/guides/jaipur-delhi-by-road` | 92 (92/93/91) | 3319.2 [3198.8–3572.9] | 23.5 [15.0–72.0] | 0.000000 |


## Earlier investigations retained



- `performance-release`: npm launch timeout, no completed raw reports.
- `performance-final`: earlier two-row-at-all-mobile-widths UI trial, stopped to correct actual header/guide geometry and atomic store. Its raw reports and source copies are retained; it is not final evidence.
- `performance-final-compact`: complete54 current-source reports. Three initial case failures: Light round-trip and both guide themes.
- `recheck-round-light`, `recheck-guide-light`, `recheck-guide-dark`: whole-case triples after observed co-resident VM/browser/test contention, with records in `performance-contention.txt`. Round-trip passes; guide failures remain. No owner process was killed.
- Owner then explicitly confirmed laptop idle. `quiet-control-guide` plus `quiet-guide-light`/`quiet-guide-dark` are each complete triples. The control never replaces the original baseline. The latest guide triples are used even though earlier trials had better numbers.
- Prior comparison54 =15 unchanged initial passing triples +1 round-trip recheck triple +2 latest idle guide triples. Every selected row refers to one whole case; no best-of metric or discarded bad run.



The complete report before this CSS fix is preserved at `/private/tmp/hmc-theme/report-before-source-scope/`. Previous guide failures are historical results, not overwritten raw evidence. The new final cases have their own directories/fingerprints.

## Footprint

| Path | Δ HTML gzip bytes | Δ inline CSS gzip bytes | Δ RSC gzip bytes | Δ script gzip bytes |
|---|---:|---:|---:|---:|
| `/` | +5132 | +1402 | +3208 | -4842 |
| `/routes` | +5071 | +1402 | +3230 | -5354 |
| `/jaipur-to-delhi-cab` | +5326 | +1402 | +3451 | -4870 |
| `/jaipur-to-delhi-round-trip-cab` | +5088 | +1402 | +3176 | -4870 |
| `/jaipur-to-delhi-airport-cab` | +5803 | +1402 | +3351 | -4870 |
| `/cab-service-in-jaipur` | +5108 | +1402 | +3184 | -4870 |
| `/innova-crysta-taxi` | +5043 | +1402 | +3162 | -4870 |
| `/guides/one-way-or-round-trip` | +5166 | +1402 | +3261 | -4831 |
| `/guides/jaipur-delhi-by-road` | +4578 | +1402 | +3281 | -4831 |

Bootstrap501raw/320gzipbytes; added inline CSS1402gzipbytes against original baseline (<6KiB). Actual Lighthouse whole-page script maximum positive delta1853bytes (<3KiB target/<4KiB hard). Whole HTML script chunk recompression deltas can be negative because chunk/compression graphs changed; this does not make the feature free. CSS remains inlined, not zero-cost.

Fresh artifact with existing cache/dev/map exclusions: 119145507bytes (113.63MiB), growth6422805bytes (6.13MiB), below220MB/growth10MiB. Measured before runtime navigation/cache growth. Footprint columns use gzip-equivalent decompressed same-origin bodies and RSC-prefetch MIME checks, not a claimed change in server compression.

The original absolute LCP1500ms target still fails baseline and after. A feature regression pass does not satisfy that inherited speed target. Raw score/LCP/TBT/CLS ranges remain visible; no field performance/indexing guarantee follows. Real hosting/Node22/CSP/device/provider checks remain external.
