/**
 * Where one city sits relative to another, from the coordinates the catalogue already
 * carries.
 *
 * This exists because a route page and its reverse were 97% the same text: the same
 * sentences with two names swapped. Direction is the first fact about a journey that is
 * genuinely different in each direction — Delhi is north-east of Jaipur, and Jaipur is
 * south-west of Delhi — and it costs nothing to say, because both cities' coordinates are
 * in the city list.
 *
 * ⚠️ This is the bearing of a straight line, not of a road. The wording it feeds must say
 * where a place IS ("Delhi is north-east of Jaipur"), never which way you drive ("head
 * north-east"), because the road bends and the two are not the same claim.
 */

const COMPASS = [
  'north',
  'north-east',
  'east',
  'south-east',
  'south',
  'south-west',
  'west',
  'north-west',
] as const;

export type Compass = (typeof COMPASS)[number];

/** Initial bearing from A to B, in degrees clockwise from north. */
function bearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const φ1 = from.lat * rad;
  const φ2 = to.lat * rad;
  const Δλ = (to.lng - from.lng) * rad;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) / rad + 360) % 360;
}

/**
 * `'north-east'`, or null when either city has no coordinates — which is a real case: the
 * catalogue holds cities an admin added by hand, and those have none.
 */
export function directionFrom(
  from: { lat: number | null; lng: number | null } | undefined,
  to: { lat: number | null; lng: number | null } | undefined,
): Compass | null {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;
  const deg = bearing({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
  return COMPASS[Math.round(deg / 45) % 8];
}

/**
 * Straight-line distance in km. Only ever used to say how much longer the ROAD is than the
 * crow flies — never presented as the journey, which is what the API's distance is for.
 */
export function crowKm(
  from: { lat: number | null; lng: number | null } | undefined,
  to: { lat: number | null; lng: number | null } | undefined,
): number | null {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;
  const rad = Math.PI / 180;
  const R = 6371;
  const dφ = (to.lat - from.lat) * rad;
  const dλ = (to.lng - from.lng) * rad;
  const a =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(from.lat * rad) * Math.cos(to.lat * rad) * Math.sin(dλ / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
