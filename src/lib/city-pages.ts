/**
 * Which cities get a page of their own.
 *
 * A city page lists the routes out of that city, and a city with one route out of it would
 * be a page that says one thing — the thin, near-empty template the rest of this site is
 * built to avoid. So a city needs at least three routes starting there. Jodhpur, with only
 * Jaipur, is reached through its route page and has no city page yet.
 *
 * Every link to a city page goes through this, and so do the pages that exist: a link to a
 * city with no page would be a 404.
 */
export const MIN_CITY_ROUTES = 3;

export function citiesWithPages(routes: ReadonlyArray<{ pickup: string }>): Set<string> {
  const counts = new Map<string, number>();
  for (const r of routes) counts.set(r.pickup, (counts.get(r.pickup) ?? 0) + 1);
  return new Set([...counts].filter(([, n]) => n >= MIN_CITY_ROUTES).map(([c]) => c));
}
