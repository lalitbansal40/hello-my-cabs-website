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
  if (!s || (s.count ?? 0) < MIN_REVIEWS || s.average == null) return null;
  return {
    count: s.count!,
    average: s.average,
    driverCount: s.driverCount ?? 0,
    driverAverage: s.driverAverage ?? null,
    cabCount: s.cabCount ?? 0,
    cabAverage: s.cabAverage ?? null,
    tags: s.tags ?? [],
  };
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
