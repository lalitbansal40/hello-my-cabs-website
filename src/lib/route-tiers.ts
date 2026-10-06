/**
 * The busiest routes — the ones the SEO plan gives the most room (scripts/audit/seo.mjs,
 * TIER_A and TIER_B_PAIRS; keep the two lists the same). Both directions count.
 *
 * Used to switch on the blocks that cost an extra fare request per page and are worth it
 * only where people book most: two- and three-day round trips (2 Oct 2026).
 */
const BUSIEST: ReadonlyArray<readonly [string, string]> = [
  ['JAIPUR', 'DELHI'],
  ['DELHI', 'AGRA'],
  ['DELHI', 'CHANDIGARH'],
  ['DELHI', 'HARIDWAR'],
  ['DELHI', 'NOIDA'],
  ['JAIPUR', 'AGRA'],
  ['JAIPUR', 'CHANDIGARH'],
  ['JAIPUR', 'AJMER'],
  ['JAIPUR', 'DELHI_AIRPORT'],
  ['JAIPUR', 'JODHPUR'],
];

const SET = new Set(BUSIEST.flatMap(([a, b]) => [`${a}>${b}`, `${b}>${a}`]));

export function isBusiestRoute(pickup: string, drop: string): boolean {
  return SET.has(`${pickup}>${drop}`);
}

/**
 * The busiest routes, busiest first — both directions of each pair, in the list's order —
 * then the rest as given (6 Oct 2026: the home page's "Popular" block listed the first six
 * of the catalogue, all from Jaipur, rather than the routes people book).
 */
export function busiestFirst<T extends { pickup: string; drop: string }>(routes: T[]): T[] {
  const rank = new Map<string, number>();
  BUSIEST.forEach(([a, b], i) => {
    rank.set(`${a}>${b}`, i * 2);
    rank.set(`${b}>${a}`, i * 2 + 1);
  });
  const at = (r: T) => rank.get(`${r.pickup}>${r.drop}`) ?? Number.POSITIVE_INFINITY;
  return routes
    .map((r, i) => ({ r, i }))
    .sort((x, y) => at(x.r) - at(y.r) || x.i - y.i)
    .map(({ r }) => r);
}
