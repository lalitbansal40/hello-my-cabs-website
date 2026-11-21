/**
 * Which pages are offered to search engines first (owner, 20 Nov 2026 —
 * docs/seo/PLAN_INDEXING_20NOV.md, decision N3). The single source of truth: tier1.ts, the
 * thin-route list (held-routes.ts NOINDEX_THIN), the sitemaps and the tests read it.
 *
 * Why tiers: on 16 Nov Search Console knew 150 pages and had indexed 1; 119 had never even
 * been crawled. On a new domain Google crawls and trusts a few strong pages first. So:
 *
 *   Tier 1 — the pages people already search for (GSC queries), linked from the home page,
 *            pre-built, given real route data (route-insights), asked for first.
 *   Tier 2 — every other indexable page: variants, other cars and guides, the busiest
 *            pairs (route-tiers.ts BUSIEST) both ways, and the routes Google already crawled.
 *   Tier 3 — the remaining plain city pairs with no searches and no crawl yet. They stay on
 *            the site (bookable, linked from their cities and /routes) but are `noindex,
 *            follow` and out of every sitemap until the gate below releases them.
 *
 * Gate (two weeks after each release, from the weekly Search Console export):
 *   Tier 1 ≥ 80% indexed → release the next 20–25 Tier 3 routes (most impressions, then
 *   demand: `node scripts/seo/release-tier3.mjs`); 50–80% → improve the Tier 1 pages that are
 *   not indexed first; < 50% or "Discovered – not indexed" rising → release nothing.
 *
 * Keys are the backend's city keys, as everywhere else on the site.
 */

/** Tier 1 cities — a city page each. */
export const TIER1_CITIES: ReadonlyArray<string> = [
  'KOTA',
  'JAIPUR',
  'DELHI',
  'SIKAR',
  'AGRA',
  'CHANDIGARH',
];

/** Tier 1 one-way routes. */
export const TIER1_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['JAIPUR', 'DELHI'],
  ['DELHI', 'JAIPUR'],
  ['KOTA', 'JAIPUR'],
  ['JAIPUR', 'KOTA'],
  ['KOTA', 'DELHI'],
  ['DELHI', 'KOTA'],
  ['JAIPUR', 'DELHI_AIRPORT'],
  ['DELHI_AIRPORT', 'JAIPUR'],
  ['JAIPUR', 'AGRA'],
  ['DELHI', 'AGRA'],
  ['DELHI', 'CHANDIGARH'],
  ['DELHI', 'HARIDWAR'],
  ['JAIPUR', 'SIKAR'],
  ['SIKAR', 'JAIPUR'],
];

/** Tier 1 cars (backend vehicle keys). */
export const TIER1_VEHICLES: ReadonlyArray<string> = ['dzire', 'crysta', 'ertiga', 'tt_12'];

/** Tier 1 pages that are neither a city, a route nor a car. */
export const TIER1_OTHER_PATHS: ReadonlyArray<string> = [
  '/',
  '/routes',
  '/fares-explained',
  '/about',
  '/contact',
  '/guides',
  '/guides/jaipur-delhi-by-road',
  '/jaipur-to-delhi-round-trip-cab',
];

/**
 * Tier 3 — plain city-pair routes held out of the index for now (67 on 20 Nov 2026). From the
 * live sitemap: every plain route not in Tier 1, not a BUSIEST pair either way, and not one
 * Google had already crawled (Jaipur–Udaipur, Delhi–Dehradun, Noida–Jaipur stay indexable).
 */
export const TIER3_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['JAIPUR', 'NOIDA'],
  ['JAIPUR', 'HARIDWAR'],
  ['DELHI', 'AJMER'],
  ['DELHI', 'SIKAR'],
  ['DELHI_AIRPORT', 'CHANDIGARH'],
  ['DELHI_AIRPORT', 'KOTA'],
  ['DELHI_AIRPORT', 'AGRA'],
  ['DELHI_AIRPORT', 'AJMER'],
  ['DELHI_AIRPORT', 'SIKAR'],
  ['DELHI_AIRPORT', 'HARIDWAR'],
  ['NOIDA', 'CHANDIGARH'],
  ['NOIDA', 'KOTA'],
  ['NOIDA', 'AGRA'],
  ['NOIDA', 'AJMER'],
  ['NOIDA', 'SIKAR'],
  ['NOIDA', 'HARIDWAR'],
  ['CHANDIGARH', 'DELHI_AIRPORT'],
  ['CHANDIGARH', 'NOIDA'],
  ['CHANDIGARH', 'KOTA'],
  ['CHANDIGARH', 'AGRA'],
  ['CHANDIGARH', 'AJMER'],
  ['CHANDIGARH', 'SIKAR'],
  ['CHANDIGARH', 'HARIDWAR'],
  ['KOTA', 'DELHI_AIRPORT'],
  ['KOTA', 'NOIDA'],
  ['KOTA', 'CHANDIGARH'],
  ['KOTA', 'AGRA'],
  ['KOTA', 'AJMER'],
  ['KOTA', 'SIKAR'],
  ['KOTA', 'HARIDWAR'],
  ['AGRA', 'DELHI_AIRPORT'],
  ['AGRA', 'NOIDA'],
  ['AGRA', 'CHANDIGARH'],
  ['AGRA', 'KOTA'],
  ['AGRA', 'AJMER'],
  ['AGRA', 'SIKAR'],
  ['AGRA', 'HARIDWAR'],
  ['AJMER', 'DELHI'],
  ['AJMER', 'DELHI_AIRPORT'],
  ['AJMER', 'NOIDA'],
  ['AJMER', 'CHANDIGARH'],
  ['AJMER', 'KOTA'],
  ['AJMER', 'AGRA'],
  ['AJMER', 'SIKAR'],
  ['AJMER', 'HARIDWAR'],
  ['SIKAR', 'DELHI'],
  ['SIKAR', 'DELHI_AIRPORT'],
  ['SIKAR', 'NOIDA'],
  ['SIKAR', 'CHANDIGARH'],
  ['SIKAR', 'KOTA'],
  ['SIKAR', 'AGRA'],
  ['SIKAR', 'AJMER'],
  ['SIKAR', 'HARIDWAR'],
  ['HARIDWAR', 'JAIPUR'],
  ['HARIDWAR', 'DELHI_AIRPORT'],
  ['HARIDWAR', 'NOIDA'],
  ['HARIDWAR', 'CHANDIGARH'],
  ['HARIDWAR', 'KOTA'],
  ['HARIDWAR', 'AGRA'],
  ['HARIDWAR', 'AJMER'],
  ['HARIDWAR', 'SIKAR'],
  ['UDAIPUR', 'JAIPUR'],
  ['DELHI', 'LUDHIANA'],
  ['LUDHIANA', 'DELHI'],
  ['DELHI', 'MOHALI'],
  ['MOHALI', 'DELHI'],
  ['DEHRADUN', 'DELHI'],
];

const key = (a: string, b: string) => `${a}>${b}`;
const TIER1_ROUTE_SET = new Set(TIER1_ROUTES.map(([a, b]) => key(a, b)));
const TIER3_ROUTE_SET = new Set(TIER3_ROUTES.map(([a, b]) => key(a, b)));

export function isTier1Route(pickup: string, drop: string): boolean {
  return TIER1_ROUTE_SET.has(key(pickup, drop));
}

export function isTier3Route(pickup: string, drop: string): boolean {
  return TIER3_ROUTE_SET.has(key(pickup, drop));
}

export type IndexingTier = 1 | 2 | 3;

/** A route's tier: 1, 3, or 2 for everything else that is indexable. */
export function routeTier(pickup: string, drop: string): IndexingTier {
  return isTier1Route(pickup, drop) ? 1 : isTier3Route(pickup, drop) ? 3 : 2;
}
