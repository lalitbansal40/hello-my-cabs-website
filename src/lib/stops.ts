/**
 * Stops on the way — "Jaipur → Delhi via Ajmer".
 *
 * A one-way trip through stops is priced leg by leg (backend priceRoute, 12 Oct 2026): the
 * quote and the booking carry them. They also still travel as a note on the drop address
 * (app/api/book), which is what the desk and the driver read. A round trip with stops is
 * not priced with them — the desk confirms those by phone.
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

/** One leg of a trip through stops, as the quote priced it (fare without its toll). */
export interface Leg {
  from: string;
  to: string;
  fare: number;
}

/** `legs` from a URL — "JAIPUR>CHANDIGARH:6010;CHANDIGARH>DELHI:2810" → legs; bad → none. */
export function parseLegs(raw: string | null | undefined): Leg[] | undefined {
  if (!raw) return undefined;
  const legs = raw.split(';').map((part) => {
    const m = /^([A-Z][A-Z_]{1,39})>([A-Z][A-Z_]{1,39}):(\d{1,7})$/.exec(part);
    return m ? { from: m[1], to: m[2], fare: Number(m[3]) } : null;
  });
  return legs.length > 1 && legs.every(Boolean) && legs.length <= MAX_STOPS + 1
    ? (legs as Leg[])
    : undefined;
}
