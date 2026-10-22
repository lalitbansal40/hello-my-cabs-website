# HelloMyCabs website appearance

Implemented in `hello-my-cabs-website`, based on `main` / `b424cbf`. This is a website enhancement; it requires no backend migration, mobile-app release, Ghoomo change or new environment variable. See [verification](VERIFICATION.md) and [release steps](RELEASE.md) before deployment. Functional checks and all18 [local performance comparison gates](PERFORMANCE.md) pass. Live/real-device acceptance remains external.

## Customer behaviour

- The upper header offers Auto, Light and Dark. The rating and driver survey use the same control in their smaller headers.
- Default Auto uses **the visitor device's local calendar/timezone**: Light from 06:00 inclusive until 18:00 exclusive, Dark otherwise. OS light/dark preference does not override this schedule. Cab pickup/IST/quote/payment time helpers are separate and unchanged.
- A manual choice stays selected indefinitely until changed. `localStorage['hmc:theme:v1']` stores only `auto`, `light` or `dark`. Missing/corrupt values mean Auto. No account cookie, API request or customer record stores this preference.
- Storage read/getter/write errors do not break the page. A denied write still preserves the manual choice in the current document. Clearing/deleting the key in another tab returns receiving tabs to Auto; unrelated keys and sessionStorage events are ignored.
- Auto has one timeout while visible, checking at the next boundary or within 60 seconds. Hidden documents and manual/disabled mode have no appearance clock. Visibility, focus, pageshow and navigation refresh the resolved appearance. Calendar arithmetic handles DST rather than adding a fixed 24 hours.

## Rendering and ownership

`src/lib/theme.ts` owns policy, typed snapshots, the shared feature flag, bootstrap text and an environment-injected runtime. `theme-browser.ts` supplies the document store, subscriptions, lifecycle listeners, native scheme/chrome updates and cleanup. `ThemeController` mounts it once; `ThemeToggle` reads stable snapshots with `useSyncExternalStore`. Mode/theme/DOM/clock changes publish one atomic snapshot to subscribers. Forms are not wrapped in a mode-dependent key/provider, so changing appearance repaints their existing DOM.

Root layout remains a Server Component. It emits static Light attributes and the existing font classes/lang/metadata/JSON-LD. A small synchronous script in `<head>` resolves storage/clock before body paint. Hydration suppression is limited to the root attributes. With JavaScript disabled, the site remains Light and controls reserve their footprint while hidden/disabled.

The **bootstrap/runtime owns the single `theme-color` meta tag**. It creates it outside Next's static viewport metadata. React owns its other metadata nodes; the observer never removes them. Mutating the old static viewport tag before hydration caused React to create a second tag; removing that transient node also broke subsequent React navigation. The owned tag avoids both problems. Native `color-scheme` comes from scoped appearance CSS. No-JS Light uses CSS/browser defaults without a dynamic chrome tag.

## Palette and surface migration

`src/design/web-theme.json` is the source for 39 roles per mode, including five shadows. `node scripts/theme/tokens.mjs` regenerates `web-theme.css`; `--check` detects drift. Document colours use `hmc-*` Tailwind utilities mapped to scoped custom properties. Dark uses warm charcoal surfaces, light warm text and readable red link tints while the brand red remains fixed.

Tailwind scans only `src` via `source("../")` in globals.css, so audit fixtures/reports cannot grow or destabilize the public utility set. The actual inline CSS reduction from the previous artifact is1018raw/298gzip bytes.

The migration includes pages, shared UI, guides, booking/auth/payment/status forms, loading/error states, native controls, custom hero/ticket/guide/focus/selection/autofill CSS and shadows. Decorative hairlines and identifiable input borders are separate roles. Contrast checks cover ordinary roles, actual alpha-composited status tints and the fixed yellow travel stamp. [The closed inventory](COLOUR_INVENTORY.json) lists all 102 starting candidates and additional dependencies with reasons for fixed exceptions.

Fixed exceptions are deliberate: original logo/icon red; the logo's white plaque in Dark; explicit inverse bands; original photos and overlays; OG/share artwork and generated external SVG maps; WhatsApp/provider branding; vehicle artwork's explicit dark-band variant; gold stamp with fixed dark text. No global white/black replacement, CSS filter, new font/theme photo or theme-dependent asset/share URL is introduced.

The QR panel has its own `data-theme="light"` scope, white background, dark instructions/countdown/download text and Light native scheme. QR bytes, quiet zone, dimensions, payment identity and payload are unchanged. Print resets the actual scoped variables to Light, pairs inverse bands to paper/ink, removes ticket masks and hides navigation/theme/FAB/sticky overlays. Forced colours stays native.

## Header and form details

The main header places a compact control beside desktop actions and a reserved 44px upper row below 390px and the existing action row on wider phones, outside the hamburger. Full navigation/account/phone use the coordinated `2xl` breakpoint to keep tablet widths usable. Radio labels, native arrow keys, Escape, focus return, outside pointer and popup/menu handoff share the `hmc-header-panel` event. Mobile navigation retains its portal, focus trap and scroll lock. Signed-link headers wrap safely.

Payment return now uses the existing `FunnelShell`, so successful/pending returns also expose the theme/support header; the paid heading is an h2 beneath the shell's h1. No payment source-of-truth or poll semantics changed. `DetailsForm` supplies a stable expiry callback, preventing its existing quote timer effect from restarting on each field edit. Quote expiry itself remains the same. Audit-discovered inherited accessibility fixes include valid rating dt/dd structure, keyboard-focusable horizontal rails/tables, visible route link names and enlarged-text route/fare-table reflow.

## Audit tools

- `scripts/test/theme.mjs`: policy, calendar/DST, 336 bootstrap combinations, scheduler/storage/replay/snapshot/rollback assertions.
- `scripts/theme/browser.mjs`: source-derived public/boundary matrix, first-content modes, chooser/drawer keyboard widths, no-JS and axe.
- `scripts/theme/states.mjs`: real mounted customer/private components with synthetic local data; values, caret, custom advance, OTP/QR/poll interval/request preservation, fault and pending/sent states.
- `scripts/theme/edges.mjs`: real cross-tab storage, denied storage, cold throttled frames, labelled resume/BFCache simulation, motion, soft navigation, print/forced colours and reflow.
- `scripts/theme/boundaries.mjs`: actual local Next error fallback, all three streamed loading boundaries and encoded call/reminder cases.
- `scripts/theme/fixture-server.mjs`: loopback-only public snapshot plus synthetic private/write contracts, no database, external fetch or real payment.
- `scripts/theme/performance.mjs`: cold three-run raw Lighthouse cases, actual measured-document theme proof and baseline gates.
- `scripts/theme/footprint.mjs`: same-origin HTML, inline CSS, shared script and RSC gzip-equivalent comparisons.

The only dependency change is explicit development-only `axe-core` 4.14.0 (the lockfile previously carried 4.13.0 transitively). No production/framework dependency was upgraded.

## Rollback

Set `THEME_ENABLED=false` in `src/lib/theme.ts`. Bootstrap/runtime then resolve Light, chooser renders nothing and appearance clocks stop. Stored Dark remains harmless; do not clear all browser storage or session/customer data. Run the tests/build and make a fresh normal release. The flag does not undo the semantic migration or the independent accessibility/timer fixes. For a wider regression, redeploy the previous successful website release. No database/payment rollback is involved.
