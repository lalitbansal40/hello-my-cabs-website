# Appearance release and rollback

Local verification does not establish a successful deployment, real device acceptance, provider payment success or Google indexing improvement. The owner authorized a local commit after this verification snapshot; Git history records the resulting commit. Push and deployment are separate actions and have not been performed by this task.

**Current local gates:** functional checks and all18 accepted performance cases pass. [Performance results](PERFORMANCE.md) retain earlier failures, raw ranges and the controlled replacement. The inherited absolute1500ms LCP target remains unmet; live/real-device acceptance is still required.

## Fresh website release

1. Review the website diff and [verification evidence](VERIFICATION.md). Preserve the owner's unrelated `docs/seo/CHATGPT_HANDOVER.md`. Backend, Ghoomo and Flutter changes are not part of this release.
2. Commit/push only when authorized. Use the existing production settings: real `https://www.hellomycabs.com` canonical origin and real API. There is **no new theme environment variable or secret**.
3. **Do not upload the local `.next` audit artifact.** It embeds loopback snapshot settings. Let the normal Amplify workflow build fresh with production settings and its existing Node22/cache/map exclusions.
4. Confirm Amplify shows Successful and the exact intended deployed commit. Check logs/runtime, artifact size and the real canonical/API origins. An elapsed estimate does not prove success.
5. Confirm CSP permits the emitted synchronous bootstrap. An existing restrictive policy may require the exact bootstrap hash/nonce through the hosting policy; do not broadly enable arbitrary inline scripts. The local server's absence of restrictive CSP is not live CSP acceptance.

AWS documentation checked 22 October 2026: [SSR support/runtime features](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-supported-features.html), [SSR build-output limit](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html), [Next.js deployment support](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html). The SSR limit remains 220MB; current docs list Node22 among supported runtimes. The documented Next support range still ends at15 while this repository already uses16.3.4. This inherited platform compatibility requires the real build/deployment check; appearance work does not change framework/runtime/hosting configuration.

## Read-only live smoke

1. Fresh visitor Auto at day/night; saved Light during night and Dark during day; return to Auto. Use device-local time, not a changed cab pickup time.
2. Hard refresh/deep link/soft navigation: first content already has the selected theme, no hydration error, exactly one effective theme-colour meta, matching native scheme, no lost form state.
3. Main header at phone/tablet/desktop; theme remains outside the hamburger. Rating/driver headers, radio keys, Escape/focus return, outside pointer, mobile drawer and restored scroll all work.
4. Read-only home/routes/route variants/city/vehicle/guides/tourism/legal/error pages. Confirm titles/canonical/robots/sitemap/OG/maps/photos and fare amounts remain correct. Unknown URLs still404.
5. Existing private account/booking ownership and noindex/no-store policies stay intact. Do not type a valid real phone into callback/booking fields as a supposedly read-only check: those existing fields can save leads automatically.
6. Safely observe existing payment return/QR behaviour only with the appropriate test access and authorization. Do not create a real transaction, cancel/refund or send customer messages merely to inspect colours.

## Owner device and visual acceptance

- Real iOS/Safari and Android: native date/time/select, autofill, keyboard, safe areas, landscape, enlarged text and first-screen booking CTA. Chromium emulation is not these devices.
- Real QR scanner and provider/UPI app return: white panel/quiet zone, correct identity/amount, session restoration, no duplicated payment. The audit QR is deliberately **not payable** and proves no hardware/provider result.
- Real assistive technology/high-contrast and printer settings: focus/readability, selected controls, essential fare/payment details and return to Dark after printing.
- Review representative Light/Dark screens; sign off the palette/header spacing and preserve the original logo/photos.
- Record deployed commit/time/results independently. Fix any confirmed regression before broad rollout; no indexing/performance guarantee follows from a local Lighthouse result.

## Rollback procedure

1. For appearance alone, set the shared `THEME_ENABLED=false`; do not create a separate bootstrap flag. Stored Dark must resolve Light with no chooser or Auto timer. `node scripts/test/theme.mjs` includes this contract.
2. Run generator check, contrast, lint, TypeScript, rating/SEO/theme tests and a fresh build with real settings. Check a stored-Dark browser and print.
3. Commit/push/deploy the rollback through the normal authorized workflow and verify its exact release. Do not clear localStorage wholesale, touch auth/payment records or roll back unrelated SEO/business work.
4. For a wider issue, redeploy the previous successful W artifact/source release. Capture the failing URL/mode/time/device and console evidence first when feasible.
