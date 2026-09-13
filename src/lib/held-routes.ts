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

/** The routes the site may list and link to — everything but the held ones. */
export function listed<T extends { pickup: string; drop: string }>(routes: T[]): T[] {
  return routes.filter((r) => !isHeldRoute(r.pickup, r.drop));
}
