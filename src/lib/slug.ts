import { fromSlug } from './api';

/**
 * The site keeps its landing pages at the root — /jaipur-to-delhi-cab, /cab-service-in-jaipur,
 * /innova-crysta-taxi. Two dynamic segments cannot sit side by side at the root in the App
 * Router, so one segment takes them all and this decides which is which.
 *
 * Anything that matches none of these shapes is not a page. It must 404 rather than render
 * an empty template: a URL that answers 200 with nothing on it is exactly what search
 * engines demote a site for.
 */
export type Landing =
  | { kind: 'route'; pickup: string; drop: string }
  | { kind: 'city'; city: string }
  | { kind: 'vehicle'; vehicle: string }
  | null;

export function readSlug(slug: string): Landing {
  const route = /^([a-z0-9-]+)-to-([a-z0-9-]+)-cab$/.exec(slug);
  if (route) return { kind: 'route', pickup: fromSlug(route[1]), drop: fromSlug(route[2]) };

  const city = /^cab-service-in-([a-z0-9-]+)$/.exec(slug);
  if (city) return { kind: 'city', city: fromSlug(city[1]) };

  const vehicle = /^([a-z0-9-]+)-(?:taxi|rental)$/.exec(slug);
  // Back to the key the API uses: the URL says tt-12-rental, the vehicle is tt_12. Without
  // this the lookup missed and the page rendered blank with a 200 — a URL that answers
  // successfully with nothing on it, which is worse than a 404.
  if (vehicle) return { kind: 'vehicle', vehicle: vehicleKeyFromSlug(vehicle[1]) };

  return null;
}

export const routePath = (pickup: string, drop: string) =>
  `/${pickup.toLowerCase().replace(/_/g, '-')}-to-${drop.toLowerCase().replace(/_/g, '-')}-cab`;

export const cityPath = (city: string) =>
  `/cab-service-in-${city.toLowerCase().replace(/_/g, '-')}`;

/**
 * The larger vehicles are rented, the cars are taxis — and the URL should read the way
 * somebody would search for it. "crysta-taxi" is the internal key; nobody types that.
 */
const VEHICLE_SLUG: Record<string, string> = {
  crysta: 'innova-crysta',
  tt_12: 'tempo-traveller-12-seater',
  tt_14: 'tempo-traveller-14-seater',
  tt_16: 'tempo-traveller-16-seater',
  urbania: 'force-urbania',
};
const SLUG_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(VEHICLE_SLUG).map(([k, v]) => [v, k]),
);

export const vehiclePath = (key: string) =>
  key.startsWith('tt_') || key === 'urbania'
    ? `/${VEHICLE_SLUG[key] ?? key.replace(/_/g, '-')}-rental`
    : `/${VEHICLE_SLUG[key] ?? key.replace(/_/g, '-')}-taxi`;

export const vehicleKeyFromSlug = (slug: string) => SLUG_TO_KEY[slug] ?? slug.replace(/-/g, '_');

export const cityTitle = (key: string) =>
  key.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
