/**
 * Choosing the booking card's trip type from somewhere else on the page — the One way /
 * Round trip / Local strip under it, and the cards on the Luxury page.
 *
 * Same page: an event the card listens for, then a scroll to it. Another page: a link to
 * `/?trip=round_trip#book`, which the card reads once when it mounts. Kept out of the URL
 * on the same page so the back button does not fill with tab changes.
 */
export type TripType = 'one_way' | 'round_trip' | 'local';

export const TRIP_EVENT = 'hmc:trip';

export const isTripType = (v: unknown): v is TripType =>
  v === 'one_way' || v === 'round_trip' || v === 'local';

export function selectTrip(trip: TripType): void {
  window.dispatchEvent(new CustomEvent<TripType>(TRIP_EVENT, { detail: trip }));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('book')?.scrollIntoView({
    behavior: reduce ? 'auto' : 'smooth',
    block: 'start',
  });
}
