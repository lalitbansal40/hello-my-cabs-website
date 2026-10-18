import type { ReviewSummary } from './api';

/**
 * Fewer than this and there is no rating block, and no rating in the structured data.
 *
 * One rating at 5.0 reads as invented, and two or three swing on a single bad day — neither
 * tells a visitor anything true about the service. Five is where the average starts to mean
 * something. The same floor applies to the driver and car bars, each on its own count.
 */
export const MIN_REVIEWS = 5;

/**
 * A summary worth showing, in the shape the page reads — or null. Fills in what a backend
 * from before 9 Oct 2026 does not send (driver/car counts, tags), so an old response can
 * never break a page. Here rather than in lib/reviews.ts so the browser can use it too.
 */
export function worthShowing(s?: Partial<ReviewSummary> | null): ReviewSummary | null {
  if (!s || s.isSyntheticTestData === true || !validSummary(s) || (s.count ?? 0) < MIN_REVIEWS)
    return null;
  return {
    count: s.count!,
    average: s.average ?? null,
    driverCount: s.driverCount ?? 0,
    driverAverage: (s.driverCount ?? 0) > 0 ? (s.driverAverage ?? null) : null,
    cabCount: s.cabCount ?? 0,
    cabAverage: (s.cabCount ?? 0) > 0 ? (s.cabAverage ?? null) : null,
    tags: s.tags ?? [],
  };
}

/** Public summaries describe counts, never provenance of individual production records. */
function validSummary(s: Partial<ReviewSummary>): boolean {
  if (!s || typeof s !== 'object') return false;
  const count = s.count ?? 0;
  const validCount = (n: number) => Number.isSafeInteger(n) && n >= 0;
  const validAverage = (average: number | null | undefined, n: number) =>
    n === 0
      ? average == null
      : typeof average === 'number' && Number.isFinite(average) && average >= 1 && average <= 5;
  if (!validCount(count) || !validAverage(s.average, count)) return false;
  for (const [n, average] of [
    [s.driverCount, s.driverAverage],
    [s.cabCount, s.cabAverage],
  ] as const) {
    // Older public summaries omitted dimension counts. Keep their overall feedback;
    // without a count there is no supported driver/car bar to show.
    if (n == null) continue;
    if (!validCount(n) || n > count || !validAverage(average, n)) return false;
  }
  return (
    (s.tags == null || Array.isArray(s.tags)) &&
    (s.tags ?? []).every(
      (t) => t && typeof t === 'object' && validCount(t.count) && t.count <= count,
    )
  );
}

export interface ReviewCatalog {
  routes: Array<ReviewSummary & { pickup: string; drop: string }>;
  cities: Array<ReviewSummary & { city: string }>;
  site?: ReviewSummary;
  isSyntheticTestData?: boolean;
}

/**
 * Fail closed for markup when counters contradict the backend's own scope contract.
 * A trip contributes at most once to a route and once to the site. This does not certify
 * individual reviews as genuine; it prevents known-inconsistent/test totals earning stars.
 * Visible unmarked feedback is retained for owner reconciliation, without DB mutation.
 */
export function routeRatingEligible(
  catalog: ReviewCatalog | null | undefined,
  pickup: string,
  drop: string,
): boolean {
  if (
    !catalog ||
    catalog.isSyntheticTestData === true ||
    !catalog.site ||
    catalog.site.isSyntheticTestData === true ||
    !validSummary(catalog.site) ||
    !Array.isArray(catalog.routes) ||
    !Array.isArray(catalog.cities)
  )
    return false;
  const seen = new Set<string>();
  let total = 0;
  for (const route of catalog.routes) {
    if (!route || typeof route.pickup !== 'string' || typeof route.drop !== 'string') return false;
    const key = `${route.pickup}>${route.drop}`;
    if (seen.has(key) || route.isSyntheticTestData === true || !validSummary(route)) return false;
    seen.add(key);
    total += route.count;
  }
  if (!Number.isSafeInteger(total) || total > catalog.site.count) return false;
  if (
    catalog.cities.some(
      (city) =>
        !city ||
        city.isSyntheticTestData === true ||
        !validSummary(city) ||
        city.count > catalog.site!.count,
    )
  )
    return false;
  return catalog.routes.some(
    (route) => route.pickup === pickup && route.drop === drop && route.count >= MIN_REVIEWS,
  );
}

/**
 * What a customer can tick about a trip — the backend's list (constants/ratingTags.ts), in its
 * order. The keys are stored with each rating; never rename one.
 */
export const RATING_TAGS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'safe_driving', label: 'Safe Driving' },
  { key: 'polite', label: 'Polite Behaviour' },
  { key: 'on_time', label: 'On Time' },
  { key: 'clean', label: 'Clean Interiors' },
  { key: 'navigation', label: 'Good Navigation Skills' },
  { key: 'well_dressed', label: 'Well Dressed' },
];
