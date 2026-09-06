import { env } from './env';

/**
 * The backend's public read API — the same server the driver app talks to, minus the auth.
 *
 * Everything here runs on the SERVER (these are called from server components), for two
 * reasons that both matter for ranking: the HTML a crawler receives already contains the
 * prices, and the browser never makes a second round trip to fill them in.
 *
 * Responses are cached for a day and revalidated in the background. Fares change rarely,
 * a route page is re-crawled several times daily, and none of that should reach Mongo.
 */
const DAY = 86_400;

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Every response is tagged so it can be purged on demand.
 *
 * A day-long cache is right for prices, which barely move — but the SHAPE of a response
 * changes when the backend ships, and without a way to purge, the site serves the old
 * shape for a full day with no recourse. That is not a hypothetical: adding coordinates to
 * the city list left this site unable to book until the cache aged out. See
 * /api/revalidate.
 */
export const CACHE_TAG = 'hmc-public-api';

async function get<T>(path: string, revalidate = DAY): Promise<T> {
  const res = await fetch(`${env.apiBaseUrl}/public${path}`, {
    next: { revalidate, tags: [CACHE_TAG] },
    headers: { accept: 'application/json' },
  });
  const body = await res.json().catch(() => null);
  if (!body?.ok) {
    throw new ApiError(body?.error?.code ?? 'REQUEST_FAILED', body?.error?.message ?? `GET ${path} failed`);
  }
  return body.data as T;
}

// ── shapes the backend actually returns ───────────────────────────────────────
export interface City {
  name: string; // JAIPUR — the key every other endpoint takes
  label: string; // Jaipur — the one a person reads
  state: string;
  hill: boolean;
  /**
   * The city centre. Null for a city an admin added by hand that is not in the catalog —
   * a booking needs real coordinates, so those cannot be booked online rather than being
   * sent somewhere invented.
   */
  lat: number | null;
  lng: number | null;
}

export interface Vehicle {
  key: string;
  label: string;
  seats?: number;
  tripTypes: Array<'one_way' | 'round_trip' | 'local'>;
}

export interface RouteSummary {
  pickup: string;
  drop: string;
  distanceKm: number | null;
  fromRupees: number | null;
  fixed: boolean;
}

export interface OnewayFare {
  pickup: string;
  drop: string;
  perKm: boolean;
  distanceKm?: number;
  airportSurcharge: number;
  vehicles: Array<{ key: string; label: string; fare: number; total: number }>;
}

export interface RoundtripFare {
  pickup: string;
  drop: string;
  distanceKm: number;
  billedKm: number;
  hill: boolean;
  minKmPerDay: number;
  nightCharge: number;
  vehicles: Array<{ key: string; label: string; fare: number }>;
}

export interface LocalPackage {
  vehicle: string;
  label: string;
  includedHours: number;
  includedKm: number;
  baseFareRupees: number;
  extraPerHour: number;
  extraPerKm: number;
  examples: Array<{ hours: number; fareRupees: number }>;
}

export const api = {
  cities: () => get<{ cityList: City[] }>('/cities').then((d) => d.cityList),
  vehicles: () => get<{ intercity: Vehicle[]; roundTripOnly: Vehicle[] }>('/vehicles'),
  /** The pairs with a real listed price — what the sitemap and route pages are built from. */
  routes: () => get<{ count: number; routes: RouteSummary[] }>('/routes'),
  onewayFare: (pickup: string, drop: string) =>
    get<OnewayFare>(`/fare/oneway?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`),
  roundtripFare: (pickup: string, drop: string) =>
    get<RoundtripFare>(`/fare/roundtrip?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`),
  localPackages: () => get<{ packages: LocalPackage[] }>('/fare/local').then((d) => d.packages),
};

/** JAIPUR → jaipur, DELHI_AIRPORT → delhi-airport. The slug every route URL uses. */
export const toSlug = (cityKey: string): string => cityKey.toLowerCase().replace(/_/g, '-');
/** delhi-airport → DELHI_AIRPORT. */
export const fromSlug = (slug: string): string => slug.toUpperCase().replace(/-/g, '_');
