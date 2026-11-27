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
 *   demand; since 27 Nov 2026 by waves: `node scripts/seo/release-wave.mjs`); 50–80% → improve the Tier 1 pages that are
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
  // 21 Nov 2026 (PROMPT_RANK_21NOV Step 5.3): "taxi in khatu", "taxi service in reengus" —
  // searched, and 73 + 47 duties in 180 days, but no page until now.
  'KHATU_SHYAM_JI',
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
  // 21 Nov 2026 (Step 5.2): the Khatu Shyam ji road from Jaipur, both ways.
  ['JAIPUR', 'KHATU_SHYAM_JI'],
  ['KHATU_SHYAM_JI', 'JAIPUR'],
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
  // 21 Nov 2026 (Step 5.1): "jaipur airport taxi" pos 2.4 with no page of its own.
  '/jaipur-airport-taxi',
  '/guides/how-to-reach-khatu-shyam',
];

/**
 * Tier 3 — plain city-pair routes held out of the index for now (67 on 20 Nov 2026). From the
 * live sitemap: every plain route not in Tier 1, not a BUSIEST pair either way, and not one
 * Google had already crawled (Jaipur–Udaipur, Delhi–Dehradun, Noida–Jaipur stay indexable).
 */
// 27 Nov 2026: no longer a hand list — every held plain route of the waves below
// (WAVE2 ∪ WAVE3 ∪ NO_DEMAND). Defined after them; see TIER3_ROUTES further down.

/**
 * Fares under review (21 Nov 2026): the pairs `scripts/seo/fare-sanity.mjs` flags as looking
 * wrong (docs/seo/FARE_REVIEW_21NOV.md) — 17 km for ₹3,000, A→B and B→A ₹1,800 apart, and so
 * on. The owner decides each one; until then a pair here is never made Tier 1 and never
 * released from Tier 3 (release-wave.mjs never offers it; isIndexableRoute refuses it). Nothing else changes for it: a pair that
 * is indexable today stays as it is. Remove a line once its fare is decided.
 */
export const FARE_HOLD: ReadonlyArray<readonly [string, string]> = [
  ['DELHI', 'DELHI_AIRPORT'],
  ['DELHI', 'NOIDA'],
  ['DELHI_AIRPORT', 'DELHI'],
  ['NOIDA', 'DELHI'],
  ['NOIDA', 'DELHI_AIRPORT'],
  ['DELHI_AIRPORT', 'NOIDA'],
  ['CHANDIGARH', 'HARIDWAR'],
  ['HARIDWAR', 'CHANDIGARH'],
  ['KOTA', 'AGRA'],
  ['AGRA', 'KOTA'],
  ['HARIDWAR', 'SIKAR'],
  ['SIKAR', 'HARIDWAR'],
  ['AGRA', 'AJMER'],
  ['AJMER', 'AGRA'],
  ['AJMER', 'SIKAR'],
  ['NOIDA', 'SIKAR'],
  ['SIKAR', 'NOIDA'],
  ['DELHI_AIRPORT', 'SIKAR'],
  ['SIKAR', 'DELHI_AIRPORT'],
  ['DELHI', 'SIKAR'],
  ['SIKAR', 'DELHI'],
  ['AGRA', 'SIKAR'],
  ['SIKAR', 'AGRA'],
];

/**
 * Twin routes (21 Nov 2026): bookable, priced, with a page — but the same road and the same
 * fare as a page that is already indexed (Jaipur Airport → Delhi is Jaipur → Delhi; Delhi
 * Airport → Khatu is Delhi → Khatu). Kept `noindex, follow` and out of the sitemaps for good,
 * not by the gate: a second page for one search is a duplicate, whatever the gate says. The
 * airport's own page (/jaipur-airport-taxi) lists them and links the Jaipur pages.
 */
const JAIPUR_AIRPORT_TWINS = ['DELHI', 'DELHI_AIRPORT', 'AGRA', 'AJMER', 'SIKAR', 'KOTA', 'KHATU_SHYAM_JI'] as const;
export const TWIN_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ...JAIPUR_AIRPORT_TWINS.flatMap((d) => [
    ['JAIPUR_AIRPORT', d] as const,
    [d, 'JAIPUR_AIRPORT'] as const,
  ]),
  ['DELHI_AIRPORT', 'KHATU_SHYAM_JI'],
  ['KHATU_SHYAM_JI', 'DELHI_AIRPORT'],
];


/**
 * Waves (27 Nov 2026, docs/seo/PROMPT_INDEX_RANK_27NOV.md Steps 6 and 10). Wave 1 is the Tier 1
 * lists above — the ONLY pages offered for indexing. Every other route is `noindex, follow`
 * and out of the sitemaps, whatever list it is on (isIndexableRoute below), and the lists here
 * only say in which order they come back. From docs/seo/KEYWORD_MAP_ROUTES_27NOV.csv
 * (`action` column: Google India autocomplete demand + Search Console impressions, 27 Nov):
 *
 *   WAVE2_ROUTES      autocomplete ≥ 8 suggestions — opened when Wave 1 is ≥ 80% indexed and
 *                     "Discovered – not indexed" is not rising (scripts/seo/release-wave.mjs).
 *                     Includes the 13 routes that were indexable on 26 Nov (owner P5 default:
 *                     held until this wave) and Delhi ↔ Khatu Shyam Ji (47 + 14 duties/180 d).
 *   WAVE3_ROUTES      some demand — two weeks after Wave 2 passes the same gate.
 *   NO_DEMAND_ROUTES  no Google suggestion at all — stay held until a search shows up.
 *
 * FARE_HOLD and TWIN_ROUTES are never released by a wave.
 */
export const WAVE2_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['JAIPUR', 'JODHPUR'],
  ['JODHPUR', 'JAIPUR'],
  ['JAIPUR', 'AJMER'],
  ['AJMER', 'JAIPUR'],
  ['CHANDIGARH', 'DELHI'],
  ['DEHRADUN', 'DELHI'],
  ['DELHI', 'DEHRADUN'],
  ['AGRA', 'DELHI'],
  ['HARIDWAR', 'DELHI'],
  ['LUDHIANA', 'DELHI'],
  ['JAIPUR', 'UDAIPUR'],
  ['CHANDIGARH', 'DELHI_AIRPORT'],
  ['DELHI', 'LUDHIANA'],
  ['DELHI', 'AJMER'],
  ['AGRA', 'JAIPUR'],
  ['UDAIPUR', 'JAIPUR'],
  ['NOIDA', 'AGRA'],
  ['DELHI_AIRPORT', 'CHANDIGARH'],
  ['KOTA', 'AJMER'],
  ['DELHI_AIRPORT', 'AGRA'],
  ['CHANDIGARH', 'JAIPUR'],
  ['NOIDA', 'JAIPUR'],
  ['NOIDA', 'CHANDIGARH'],
  ['AGRA', 'DELHI_AIRPORT'],
  ['AJMER', 'KOTA'],
  ['DELHI', 'MOHALI'],
  ['MOHALI', 'DELHI'],
  ['DELHI', 'KHATU_SHYAM_JI'],
  ['KHATU_SHYAM_JI', 'DELHI'],
];

export const WAVE3_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['JAIPUR', 'NOIDA'],
  ['NOIDA', 'HARIDWAR'],
  ['CHANDIGARH', 'AGRA'],
  ['AJMER', 'DELHI'],
  ['JAIPUR', 'CHANDIGARH'],
  ['DELHI_AIRPORT', 'HARIDWAR'],
  ['AGRA', 'NOIDA'],
  ['AGRA', 'CHANDIGARH'],
  ['JAIPUR', 'HARIDWAR'],
  ['AGRA', 'HARIDWAR'],
  ['HARIDWAR', 'AGRA'],
  ['CHANDIGARH', 'NOIDA'],
  ['HARIDWAR', 'JAIPUR'],
  ['HARIDWAR', 'DELHI_AIRPORT'],
  ['DELHI_AIRPORT', 'AJMER'],
  ['AJMER', 'HARIDWAR'],
  ['DELHI_AIRPORT', 'KOTA'],
  ['NOIDA', 'AJMER'],
  ['HARIDWAR', 'NOIDA'],
  ['KOTA', 'DELHI_AIRPORT'],
  ['AJMER', 'NOIDA'],
  ['HARIDWAR', 'AJMER'],
];

export const NO_DEMAND_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['NOIDA', 'KOTA'],
  ['CHANDIGARH', 'KOTA'],
  ['CHANDIGARH', 'AJMER'],
  ['CHANDIGARH', 'SIKAR'],
  ['KOTA', 'NOIDA'],
  ['KOTA', 'CHANDIGARH'],
  ['KOTA', 'SIKAR'],
  ['KOTA', 'HARIDWAR'],
  ['AJMER', 'DELHI_AIRPORT'],
  ['AJMER', 'CHANDIGARH'],
  ['SIKAR', 'CHANDIGARH'],
  ['SIKAR', 'KOTA'],
  ['SIKAR', 'AJMER'],
  ['HARIDWAR', 'KOTA'],
];

/**
 * The waves already opened — `release-wave.mjs --apply` adds one here and nothing else. Empty
 * on 27 Nov 2026 (Wave 1: 1 of ~38 indexed).
 */
export const RELEASED_WAVES = [] as ReadonlyArray<2 | 3>;

/** Tier 3 = every route a wave holds back (27 Nov 2026: the waves replace the 20 Nov list). */
export const TIER3_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ...WAVE2_ROUTES,
  ...WAVE3_ROUTES,
  ...NO_DEMAND_ROUTES,
];

/**
 * Wave 1 guides (27 Nov 2026): the road guides of Wave 1 routes and the two that belong to no
 * route. A guide for a held route (Jaipur–Ajmer) waits with its route.
 */
export const TIER1_GUIDES: ReadonlyArray<string> = [
  'jaipur-delhi-by-road',
  'delhi-agra-by-road',
  'delhi-chandigarh-by-road',
  'delhi-haridwar-by-road',
  'jaipur-agra-by-road',
  'jaipur-delhi-airport-by-road',
  'jaipur-sikar-by-road',
  'how-to-reach-khatu-shyam',
  'one-way-or-round-trip',
  'group-travel-which-vehicle',
];

const key = (a: string, b: string) => `${a}>${b}`;
const FARE_HOLD_SET = new Set(FARE_HOLD.map(([a, b]) => key(a, b)));

export function isFareHeld(pickup: string, drop: string): boolean {
  return FARE_HOLD_SET.has(key(pickup, drop));
}

const TIER1_ROUTE_SET = new Set(TIER1_ROUTES.map(([a, b]) => key(a, b)));
const TIER3_ROUTE_SET = new Set(TIER3_ROUTES.map(([a, b]) => key(a, b)));

export function isTier1Route(pickup: string, drop: string): boolean {
  return TIER1_ROUTE_SET.has(key(pickup, drop));
}

export function isTier3Route(pickup: string, drop: string): boolean {
  return TIER3_ROUTE_SET.has(key(pickup, drop));
}

const TWIN_SET = new Set(TWIN_ROUTES.map(([a, b]) => key(a, b)));
const NO_DEMAND_SET = new Set(NO_DEMAND_ROUTES.map(([a, b]) => key(a, b)));
const WAVE_SETS: Record<2 | 3, Set<string>> = {
  2: new Set(WAVE2_ROUTES.map(([a, b]) => key(a, b))),
  3: new Set(WAVE3_ROUTES.map(([a, b]) => key(a, b))),
};

/** Which wave a route belongs to: 1 (Tier 1), 2, 3, or null (no-demand, fare-held, twin, unlisted). */
export function waveOf(pickup: string, drop: string): 1 | 2 | 3 | null {
  const k = key(pickup, drop);
  if (TIER1_ROUTE_SET.has(k)) return 1;
  if (WAVE_SETS[2].has(k)) return 2;
  if (WAVE_SETS[3].has(k)) return 3;
  return null;
}

/**
 * THE rule (27 Nov 2026): a route page is offered to search engines only if it is in Wave 1
 * or in a wave already released — and never if its fare is held, it is a twin, or nobody
 * searches for it. Everything else stays on the site, bookable and linked, as `noindex, follow`.
 */
export function isIndexableRoute(pickup: string, drop: string, released: ReadonlyArray<2 | 3> = RELEASED_WAVES): boolean {
  const k = key(pickup, drop);
  if (FARE_HOLD_SET.has(k) || TWIN_SET.has(k) || NO_DEMAND_SET.has(k)) return false;
  if (TIER1_ROUTE_SET.has(k)) return true;
  return released.some((w) => WAVE_SETS[w].has(k));
}

/** City pages offered for indexing: the Tier 1 cities only. */
export const isIndexableCity = (city: string): boolean => TIER1_CITIES.includes(city);
/** Car pages offered for indexing: the Tier 1 cars only. */
export const isIndexableVehicle = (vehicle: string): boolean => TIER1_VEHICLES.includes(vehicle);
/** Round-trip / by-car route pages: only those named in TIER1_OTHER_PATHS. */
export const isIndexableVariantPath = (path: string): boolean => TIER1_OTHER_PATHS.includes(path);
/** Guides: the Wave 1 list. */
export const isIndexableGuide = (slug: string): boolean => TIER1_GUIDES.includes(slug);

export type IndexingTier = 1 | 2 | 3;

/** A route's tier: 1, 3, or 2 for everything else that is indexable. */
export function routeTier(pickup: string, drop: string): IndexingTier {
  return isTier1Route(pickup, drop) ? 1 : isTier3Route(pickup, drop) ? 3 : 2;
}

/**
 * Hindi pages (/hi/…, 21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Step 9) — built, held.
 *
 * While false: every /hi page is `noindex, follow`, out of every sitemap, and no page carries
 * an hreflang link to it. Flip to true only when BOTH hold:
 *   1. Tier 1 is ≥ 80% indexed (the gate above) — a second language before the first is
 *      indexed spreads the same crawl thinner;
 *   2. the Hindi in src/content/hi/index.ts has been read and corrected by a Hindi reader
 *      (the owner or someone he names) — it was written without one.
 */
export const HINDI_LIVE = false as boolean;

