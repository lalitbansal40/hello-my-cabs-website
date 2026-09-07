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
  if (vehicle) return { kind: 'vehicle', vehicle: vehicle[1] };

  return null;
}

export const routePath = (pickup: string, drop: string) =>
  `/${pickup.toLowerCase().replace(/_/g, '-')}-to-${drop.toLowerCase().replace(/_/g, '-')}-cab`;

export const cityPath = (city: string) =>
  `/cab-service-in-${city.toLowerCase().replace(/_/g, '-')}`;

/** Tempo Traveller sits at /tempo-traveller-rental; the cars at /<name>-taxi. */
export const vehiclePath = (key: string) =>
  key.startsWith('tt_') || key === 'urbania'
    ? `/${key.replace(/_/g, '-')}-rental`
    : `/${key.replace(/_/g, '-')}-taxi`;

export const cityTitle = (key: string) =>
  key.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
