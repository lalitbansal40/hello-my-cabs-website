/**
 * A route's title and description, written by hand from Search Console — when the default
 * one ([slug]/page.tsx) is shown but not clicked.
 *
 * How an entry gets here (scripts/seo/title-candidates.mjs prints the list):
 *   - the page has 100+ impressions in the last 28 days, sits in positions 1–20, and its
 *     click-through rate is under 2% — people see it and choose another result;
 *   - the queries it is shown for say what the title is missing (a car, "fare", "km",
 *     "airport", "round trip"…).
 *
 * Rules, the same as everywhere on the site: every figure in a title is one the page shows
 * (the price is the fare table's), 30–60 characters, 120–155 for a description, no
 * "best"/"cheapest"/"no. 1", and nothing that is not true of this route.
 *
 * Keyed `PICKUP-DROP` with the backend's city keys. Leave a field out to keep the default.
 * Take an entry out when the default does better — it is a fix, not a permanent fork.
 */
export interface RouteTitle {
  /** {price} is replaced with the route's lowest one-way fare, as the page shows it. */
  title?: string;
  description?: string;
  /** When and why — so the next person knows what it was answering. */
  note: string;
}

export const ROUTE_TITLES: Record<string, RouteTitle> = {};

export const routeTitle = (pickup: string, drop: string): RouteTitle | null =>
  ROUTE_TITLES[`${pickup}-${drop}`] ?? null;
