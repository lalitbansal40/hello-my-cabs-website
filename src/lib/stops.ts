/**
 * Stops on the way — "Jaipur → Delhi via Ajmer".
 *
 * The backend has no stops field (2 Oct 2026). The owner's decision: they travel with the
 * booking as a note the desk reads, on the drop address (app/api/book), and the fare shown
 * is the direct route's — the desk confirms what the stops add, by phone.
 *
 * In URLs they are city names joined by `|` (no city name has one), from the booking card
 * through every step of the funnel to /api/book.
 */
export const MAX_STOPS = 3;

/** `stops` from a URL → names, at most MAX_STOPS, blanks dropped. */
export function parseStops(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_STOPS);
}

/**
 * The drop address with the stops on it, as the desk and the driver will read it:
 * "Churu, Rajasthan · via Ajmer, Pushkar". Cut to the 300 characters the backend accepts
 * (validators/booking.validator.ts, `place.address`).
 */
export function dropWithStops(dropLabel: string, stopLabels: string[]): string {
  const via = stopLabels.length ? ` · via ${stopLabels.join(', ')}` : '';
  return `${dropLabel}${via}`.slice(0, 300);
}
