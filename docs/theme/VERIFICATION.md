# HelloMyCabs theme verification

**22 October 2026: local code implementation and regression gates pass, including T15.** All18 final performance case medians pass the original gates. Earlier guide and round-trip failures and the reason for a whole-case controlled replacement remain recorded. Production and real-device acceptance are separate pending checks; no rounded percentage substitutes for evidence.

[Implementation](IMPLEMENTATION.md) · [Performance, ranges and trial history](PERFORMANCE.md) · [T01–T18 checklist](TRACEABILITY.md) · [Release/rollback](RELEASE.md) · [Machine summary](evidence/SUMMARY.json) · [Raw hashes](evidence/RAW_HASHES.json)

## Source and isolation

| Item | Observed value |
|---|---|
| Changed repository | `hello-my-cabs-website`, branch `main` |
| HEAD at local verification | `b424cbfff98fc18fd9572f83ccd5292791db9b98` |
| Baseline source SHA-256 | `ace8f731012c9bdb38309a535e2e2dec5efbef704ebdf4dc6b7f30ea682ae2f6` |
| Final tested source SHA-256 | `cf716c836e501cce559498930a4738a12d03361c70c9dd23c7754dbca0a7ad37` |
| Final optimized BUILD_ID | `2TdJpHMt1uQnjRfrNUw9A` |
| Source hash method | All `src` files sorted; hash each relative pathname followed by its bytes |
| Framework | Next16.3.4, React19.2.8, existing Tailwind4 and inlineCss |
| Local Node | v24.19.0; hosting uses Node22, not verified locally |
| Browser/auditor | Chrome155.0.8059.80, Puppeteer24.43.1, Lighthouse12.8.2, axe4.14.0 |
| Public data | 48 captured existing public responses, no new production API probe |
| Public inventory | 154 public pages,145 intended indexable;156 crawled with two invalid controls |
| Starting owner work | Untracked `docs/seo/CHATGPT_HANDOVER.md`, preserved |
| Git/release actions | Verification predates the owner-authorized local commit; no push/deployment |

The source hash and build ID cover the product used for the final matrices. The follow-up product fix limits Tailwind utility scanning to `src`, keeping audit/documentation class names out of production CSS. Product JS, image priority/geometry, typography and business flows are unchanged from the previous tested implementation. Later changes are audit scripts, inventory line references and documentation. Prior development replay/signed320 evidence retains its actual older-source provenance; full public/private/edge/boundary matrices were rerun on the new artifact. Backend, Ghoomo, Flutter, root plans/prompts, `.env`, hosting, auth/session/API contracts and business fare values are outside this change.

Baseline optimized server was on loopback3420, final optimized server3421, fixture43211; development3422 was used only for replay/debug checks. Fixture responses are captured public data or clearly synthetic private/write scenarios. They do not connect to a database or external service. The QR encodes nonpayable audit text, UPI links are zero-value/invalid, provider links use `.invalid`. Browser interception denies external requests and writes unless a case explicitly handles a synthetic local contract. Some denied *loopback* requests are expected and recorded. No real booking, lead, OTP, callback, review, driver survey, cancellation, payment or refund was created.

## Commands and exits

All commands run in the website repository. Logs are under `/private/tmp/hmc-theme/` and hashed. The final optimized build uses the existing variables with audit-only **process overrides**, not edits to `.env`:

```sh
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:43211/api/v1 NEXT_PUBLIC_SITE_URL=https://www.hellomycabs.com NEXT_PUBLIC_ANALYTICS_DOMAIN= npm run build
npm run lint
npx tsc --noEmit
node scripts/test/theme.mjs
npm run test:rating
npm run test:seo
node scripts/theme/tokens.mjs --check
node scripts/theme/contrast.mjs
git diff --check
```

| Check | Actual result | Evidence |
|---|---|---|
| Optimized build | Exit0;98 static generations; root/public static/ISR classifications retained | `build-source-scope.log` |
| ESLint | Exit0 | `lint-source-scope.log` |
| TypeScript | Exit0 | `types-source-scope.log` |
| Theme unit tests | Exit0;9 pass,0 fail;336 bootstrap parity combinations | `theme-source-scope.log` |
| Rating tests | Exit0;10 pass | `rating-source-scope.log` |
| SEO regressions | Exit0;20 pass | `seo-source-scope.log` |
| Generated palette | Exit0;39 roles/mode, no drift | `tokens-source-scope.log` |
| Contrast | Exit0;43 role pairs +27 actual composited-status cases per mode; fixed gold-stamp ink checked | `contrast-source-scope.log` |
| Whitespace/diff | Exit0 | Final cleanup record |
| Source/schema/fare comparison | Exit0;156 pages, no metadata/schema/Offer difference;30 critical/API files byte-identical | `contracts-source-scope.json` |
| Performance | Completed all27 baseline +54 final comparison raw reports;18/18 final cases pass; earlier failures retained | [Detailed medians/ranges](PERFORMANCE.md) |

The existing SEO tests include HTTP-catalog failure rejection. This task did not run another full unavailable-catalog build; it did not change the fetch/cache/ISR implementation. Do not import an older SEO-task build failure experiment as a new theme result.

## Reproduce browser and timing checks

Use a new evidence directory for every trial. Never overwrite or silently select favourable runs. These are **local-only** examples; start the fixture with the captured snapshot directory and run the optimized server built for it. Do not point a fixture browser suite at production or build a release with the loopback overrides.

```sh
node scripts/theme/fixture-server.mjs /private/tmp/hmc-theme/snapshot 43211
# In a separate terminal after the isolated build:
npm run start -- --hostname 127.0.0.1 --port 3421
BASE_URL=http://127.0.0.1:3421 node scripts/theme/browser.mjs --out=/absolute/new-browser-evidence
BASE_URL=http://127.0.0.1:3421 node scripts/theme/states.mjs --out=/absolute/new-state-evidence
BASE_URL=http://127.0.0.1:3421 node scripts/theme/edges.mjs --out=/absolute/new-edge-evidence
BASE_URL=http://127.0.0.1:3421 node scripts/theme/boundaries.mjs --out=/absolute/new-boundary-evidence
BASE_URL=http://127.0.0.1:3421 node scripts/theme/performance.mjs --baseline=/private/tmp/hmc-theme/baseline/performance/summary.json --out=/absolute/new-performance-evidence
node scripts/theme/footprint.mjs --before=http://127.0.0.1:3420 --after=http://127.0.0.1:3421 --out=/absolute/new-footprint-evidence
python3 scripts/seo/recovery-audit.py --base http://127.0.0.1:3421 --inventory /private/tmp/hmc-theme/source-inventory.json --out /absolute/new-crawl-evidence
```

Chrome path defaults to the installed macOS application; `CHROME_PATH` is an optional audit-tool override. `LIGHTHOUSE_CLI_PATH` can point to the cached exact12.8.2 CLI if npm lookup is unavailable. Neither is a product environment requirement. `--case=` filters state/edge cases; the harness now rejects a filter that executes zero cases. `performance.mjs --artifact=` identifies the baseline copy when it is outside the current `.next`. The default original CLI invocation and final cached CLI use the same Lighthouse version/settings.

The snapshot was extracted from the existing local public-fetch cache. On another computer, transfer the captured public snapshot deliberately; the fixture cannot invent the production catalog. Raw screenshots/JSON/PDF/traces stay outside source; [RAW_HASHES.json](evidence/RAW_HASHES.json) locates and verifies them. Export `/private/tmp/hmc-theme/` before temporary-file cleanup if long-term raw retention is needed.

## Final browser coverage

| Suite | Result | Actual scope |
|---|---|---|
| `browser-source-scope` | Pass155 records | 140 views:35 paths ×Light/Dark ×360/1280; six first-content cases; eight chooser widths; no-JS |
| `states-source-scope` | Pass124 records | Actual mounted booking/auth/payment/account/rating/driver components;40 private-state views;58 private axe records; Android/iOS UA payment choices and synthetic faults |
| `edges-source-scope` | Pass7 cases | Actual two-tab storage/error handling, lifecycle simulation, throttled cold frames, motion/navigation, print/forced colours and14 responsive sizes |
| New edge-suite switch observer | Pass, part of7 cases | PerformanceObserver captured zero switch shifts with unchanged scroll/document height/form values |
| `strict-final` (prior source; runtime unchanged) | Pass1 case | Actual Next development Strict Mode replay: two storage-listener adds/one removal/one active; one Auto clock |
| `softnav-final-dev` (prior source; runtime unchanged) | Pass1 case | Development default-motion geometry/navigation; current production soft navigation also passes in new edge suite |
| Pending funnel, included in new124 state records | Pass4 records | Actual OTP-verification and cancellation pending flows, exactly one request each, values retained, axe |
| `boundaries-source-scope` | Pass9 cases | Actual Next error fallback in both themes; selection/details/detail streamed loading in both; encoded call/malformed call/reminder |

All listed suites have zero failures. Rejected early trials remain under the raw root: the metadata duplication/removal, rapidly edited quote callback, header geometry, accessibility findings and incorrect harness selectors were investigated and corrected before the final suites. Earlier invalid zero-case filtered run was not accepted. The streaming-boundary harness uses unique synthetic delay keys so a prior successful data-cache result cannot bypass the intended loading UI.

Public paths include home/routes, Jaipur–Delhi/Agra, round-trip/airport, Jaipur/Agra city, Dzire/Innova/van, guide index and all three guide families, tourism/Char Dham/luxury, About/Contact/fare explanation/legal/credits, login/account/booking/details, booking return, invalid signed links and true404 controls. Full source crawl covers remaining catalog pages; it does not substitute for private-state browser checks.

Private scenarios include all eight booking statuses; paid/pending/dropped return; guest; ownership/notfound; rated/ineligible/eligible; driver new/approved/rejected; stale/reopened link; empty account; custom advance1500; QR expired/payment-link unavailable/error. Synthetic phone emulation shows five Android and three iOS UPI choices and the closed/show-QR interactions; it never opens a provider/app or proves a real device/payment.

### Schedule, storage and first content

- Exact05:59:59.999,06:00,17:59:59.999,18:00, midnight, overseas zones and DST dates tested against runtime/bootstrap. Manual choice beats schedule/OS preference; no booking timezone helper changed.
- Real two-tab write/remove/clear; unrelated key/sessionStorage ignored; corrupt values and getter/read/write denial remain usable. Current-document manual selection survives a denied write. Sentinel unrelated storage survives changes/navigation.
- Visible Auto has one ≤60s/boundary timeout; hidden/manual/disabled has zero. Replay cleans up listeners/clocks. Focus/pageshow/clock-jump/hidden-wake tests are labelled **simulations**, not real laptop sleep or a proven browser-managed BFCache restore.
- Six cold-frame cases check actual body RGB as well as attributes: Light252/249/244, Dark21/19/22. The throttled4× CPU/150ms-network Dark case has no opposite-content frame. Native scheme and a single effective theme-colour meta match. No hydration/page errors in final paths.
- No-JS is readable static Light; no enabled misleading chooser. Root stays server/static; no theme cookie/request or form remount.

### Navigation and form continuity

Radio/arrow/Space, Escape/focus return, outside pointer, menu/account/chooser handoff and drawer scroll lock pass. Main chooser checked at320/390/768/1024/1180/1280/1440/1920; signed320 fieldsets remain inside viewport (left60/right300); long signed header checked at1920.

Actual DetailsForm retains name/phone/addresses/custom advance, caret3..8, quote expiry and polling intervals when changing mode. OTP entry/cooldown/send/verify-pending, cancellation typed reason/pending, open callback and callback/rating/driver pending/sent states preserve values and exactly-one synthetic requests. All one-way/round-trip/local widgets retain cities/stops/time/vehicle values.

The full white QR panel, image/payload ID/quiet zone, exactly-one QR POST, polling/expiry interval identities, amount and download instructions remain intact in Dark. PayOptions and return-state tests never create a real payment. External provider DOM remains provider-owned.

## Accessibility, print, assets and limits

There are **zero serious/critical axe violations in final audited views**. Nonblocking findings remain: public matrix has `region` moderate in120 views, `heading-order` moderate28, `landmark-unique` moderate4 and `empty-table-header` minor6; private axe has region44/heading-order33. Additional fault/pending views also retain moderate landmark/heading findings. These are counts of affected audit views, not unique bugs. They are reported rather than treating Lighthouse100 as WCAG certification.

Final checks use reduced motion for stable exhaustive colour audits, plus separate settled default-motion/soft-navigation checks. Hero/title animation frames are not rewritten for axe. Contrast covers both complete palettes and alpha composites; logo white plaque, inverse bands, photos/OG/maps/provider branding and gold-stamp ink are explicit fixed exceptions.

Responsive sizes include320/360/375/390/430/768/820/1024/1180/1280/1440/1920 and667×375/844×390 landscape. No horizontal page overflow. 200% root text at820 tested;320 CSS pixels is the layout-equivalent400%-zoom reflow width for1280. This does **not** establish actual Safari/browser-menu400% zoom or native keyboard/safe-area behaviour. Focusable fare comparison/table/rail regions preserve intentional internal scrolling.

Print emulation produces the PDF with Light native scheme and Light page/paper, dark footer text, hidden header/FAB/sticky/menu controls and stored Dark unchanged; switching back restores Dark. Forced colours retains native `forced-color-adjust:auto`. Real printer/assistive technology/device checks remain external.

Logo/photos/font choices/preloads/image priority/geometry/OG/maps remain fixed. The source/schema/fare comparison confirms identical title/description/H1/canonical/directives/schema/Offer fields for156 pages, including amount/currency/tax. `api`, `session`, `env`, `schema`, booking-time/UPI helpers, all API routes, `next.config.ts` and `amplify.yml` are among30 byte-identical critical files. Crawl has145 sitemap entries, zero orphan/unreachable/broken-link/broken-fragment/schema findings; unknown controls404. No indexing outcome is claimed.

## Performance and next action

See [all medians, raw ranges, budgets and trial selection](PERFORMANCE.md). Bootstrap320bytes gzip, added inline CSS1402bytes gzip, maximum positive Lighthouse script delta1853bytes, fresh artifact113.63MiB/growth6.13MiB meet their budgets. **All18 final performance/size/CLS/TBT/accessibility/best-practices cases pass original gates.** Guide Light/Dark LCP deltas are+135.1/+114.9ms. Controlled Light round-trip median3307.5ms is+53.8ms against the original3253.7ms; diagnostic control3300.2ms does not replace the baseline. A prior same-source Light round-trip triple failed (+289.8ms); observed-paint versus simulated-CPU inconsistency prompted the predefined controlled comparison. That entire latest triple is used, including all three92 scores. No favourable single run or individual metric was selected. The original absolute LCP1500ms target still fails baseline and after.

T15 is closed for the accepted local comparison. Raw variability and earlier failures remain visible; this is no universal performance guarantee. No image priority, geometry, font, production compression setting or gate was changed. Remaining external acceptance: fresh real-origin Amplify/Node22 build, exact deployed commit, CSP/live read-only checks, iOS/Safari/Android native controls/autofill/keyboard/safe areas, authorized provider/UPI return and real QR scan, assistive technology/print and owner visual approval. [Release instructions](RELEASE.md) cover those steps and rollback.
