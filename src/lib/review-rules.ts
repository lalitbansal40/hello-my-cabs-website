/**
 * Fewer than this and there is no rating block, and no rating in the structured data.
 *
 * One rating at 5.0 reads as invented, and two or three swing on a single bad day — neither
 * tells a visitor anything true about the service. Five is where the average starts to mean
 * something. The same floor applies to the driver and car bars, each on its own count.
 */
export const MIN_REVIEWS = 5;

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
