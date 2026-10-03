/**
 * The only route variants the site publishes — a route's round trip, and a route in one
 * particular car (PLAN_route_pages_seo.md, Phase 2, 3 Oct 2026).
 *
 * Kept short on purpose. A page per route × car × trip type would be thousands of pages that
 * differ only in a name, which is what search engines call doorway pages and demote a whole
 * site for. These exist where people search for exactly this (content/queries.json: "round
 * trip", "innova", "tempo traveller" on the busiest routes), and each page carries what is
 * different about it: the round trip over one to three days, or one car's fares, seats and
 * luggage on that road. Every one is linked from its route page, from the car's page and
 * from /routes, and is in the sitemap — nothing here is hidden.
 *
 * A variant whose route is not priced (or whose car is not on its fare) is not built: the
 * page builder checks the fare API and skips it.
 */
// ONE direction per pair. A round trip both ways has the same fares and the same billing,
// so Delhi→Agra and Agra→Delhi round-trip pages measured 94% the same text (3 Oct 2026) —
// two pages for one thing, which is the doorway pattern this list exists to avoid. Each
// pair keeps the direction most trips start from.
export const ROUND_TRIP_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['DELHI', 'AGRA'],
  ['DELHI', 'HARIDWAR'],
  ['DELHI', 'CHANDIGARH'],
  ['JAIPUR', 'DELHI'],
  ['JAIPUR', 'AGRA'],
  ['JAIPUR', 'AJMER'],
  ['JAIPUR', 'CHANDIGARH'],
];

/** The cars a route-by-car page is made for — the two people search for by name. */
export const CAR_VARIANT_VEHICLES = ['crysta', 'tt_12'] as const;

// One direction per pair here too — the reverse measured 90% the same.
export const CAR_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['JAIPUR', 'DELHI'],
  ['DELHI', 'AGRA'],
  ['DELHI', 'HARIDWAR'],
  ['JAIPUR', 'AGRA'],
];

const ROUND = new Set(ROUND_TRIP_ROUTES.map(([a, b]) => `${a}>${b}`));
const CAR = new Set(CAR_ROUTES.map(([a, b]) => `${a}>${b}`));

export const hasRoundTripPage = (pickup: string, drop: string) => ROUND.has(`${pickup}>${drop}`);
export const hasCarPage = (pickup: string, drop: string, vehicle: string) =>
  CAR.has(`${pickup}>${drop}`) && (CAR_VARIANT_VEHICLES as readonly string[]).includes(vehicle);
