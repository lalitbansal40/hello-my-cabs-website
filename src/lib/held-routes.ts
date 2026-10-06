/**
 * Six short NCR routes held out of search until they are priced.
 *
 * They are 17–38 km hops priced as if they were intercity trips: Delhi to Delhi Airport is
 * 17 km for ₹3,000 (₹176 a km, against ₹14 on the rest of the network), and the same road
 * the other way is ₹2,300. An airport transfer across Delhi usually costs a fraction of
 * that. A page that ranks for "Delhi to Delhi Airport taxi" with that price on it loses
 * the click and teaches the searcher the site is expensive; a page that ranks with a price
 * nobody decided on is worse.
 *
 * So until the fares are set (FARE_SIGNOFF.md, section D, in the backend repo), these pages
 * still exist — a bookmark or a shared link still opens, and the route can still be booked
 * — but they are `noindex`, left out of the sitemap, and nothing on the site links to them.
 * Take a pair off this list the day its fare is decided.
 */
const HELD = [
  ['DELHI', 'DELHI_AIRPORT'],
  ['DELHI_AIRPORT', 'DELHI'],
  ['DELHI', 'NOIDA'],
  ['NOIDA', 'DELHI'],
  ['NOIDA', 'DELHI_AIRPORT'],
  ['DELHI_AIRPORT', 'NOIDA'],
] as const;

const HELD_ROUTES = new Set<string>(HELD.map(([a, b]) => `${a}>${b}`));

export function isHeldRoute(pickup: string, drop: string): boolean {
  return HELD_ROUTES.has(`${pickup}>${drop}`);
}

/**
 * Thin routes kept out of the index, NOT out of the site (7 Oct 2026, PLAN_seo_v3 Step 2).
 *
 * A route page with no searches and no content of its own — the same template as ninety
 * others, with the city names swapped — is what search engines call scaled near-duplicate
 * content, and enough of it holds a whole site down. A route listed here keeps its page,
 * its fares and every link to it (a visitor finds it from its city and the routes list), but
 * the page is `noindex, follow` and the sitemap leaves it out.
 *
 * Who goes on: `node scripts/seo/thin-routes.mjs <Search Console export>` prints routes with
 * no impressions in 28 days that are still 80%+ like another page. Add them only with the
 * owner's yes; take one off the day it earns impressions or content of its own.
 *
 * Empty on purpose until then.
 */
const NOINDEX_THIN: ReadonlyArray<readonly [string, string]> = [
  // ['SIKAR', 'HARIDWAR'],
];

const THIN_ROUTES = new Set<string>(NOINDEX_THIN.map(([a, b]) => `${a}>${b}`));

export function isThinRoute(pickup: string, drop: string): boolean {
  return THIN_ROUTES.has(`${pickup}>${drop}`);
}

/** Routes that belong in the sitemap and the index — neither held nor thin. */
export function indexable<T extends { pickup: string; drop: string }>(routes: T[]): T[] {
  return routes.filter((r) => !isHeldRoute(r.pickup, r.drop) && !isThinRoute(r.pickup, r.drop));
}

/** The routes the site may list and link to — everything but the held ones. */
export function listed<T extends { pickup: string; drop: string }>(routes: T[]): T[] {
  return routes.filter((r) => !isHeldRoute(r.pickup, r.drop));
}
