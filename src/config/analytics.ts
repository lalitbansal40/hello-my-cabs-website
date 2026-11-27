/**
 * Site analytics — in code, not env (27 Nov 2026, docs/seo/PROMPT_INDEX_RANK_27NOV.md P6: the
 * owner sets nothing on the server). Production had NO analytics on 21 Nov 2026 (R28): the
 * Plausible domain was never set on Amplify, so no visit, GBP click or route page was counted.
 *
 *   PLAUSIBLE_DOMAIN  preferred (components/site/Analytics.tsx says why: ~1 kB, no cookie, no
 *                     consent banner). Needs a Plausible account for www.hellomycabs.com; then
 *                     set 'www.hellomycabs.com' here and deploy.
 *   GA4_ID            the free alternative ('G-XXXXXXXXXX'). Loaded only after the page is idle
 *                     (lazyOnload) so it cannot slow the first paint, on public pages only.
 *
 * Both null → nothing is loaded (the env value NEXT_PUBLIC_ANALYTICS_DOMAIN still works as before).
 */
export const ANALYTICS = {
  PLAUSIBLE_DOMAIN: null as string | null,
  GA4_ID: null as string | null,
};
