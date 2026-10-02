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
