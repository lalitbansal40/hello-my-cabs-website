import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { api } from '@/lib/api';
import { getSession } from '@/lib/session';
import { MAX_STOPS, dropWithStops } from '@/lib/stops';

/**
 * Place the booking.
 *
 * Runs here, not in the browser, for two reasons: the session cookie is httpOnly so only
 * the server can read it, and the coordinates POST /bookings requires are looked up here
 * from the city catalog rather than trusted from the client.
 *
 * No price is sent. The quote id is, and the backend charges what it stored against it.
 */
export async function POST(request: Request) {
  const token = await getSession();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_LOGGED_IN', message: 'Please verify your phone first' } },
      { status: 401 },
    );
  }

  const b = await request.json();
  const cities = await api.cities();
  const pickupCity = cities.find((c) => c.name === b.pickupCity);
  const dropCity = b.dropCity ? cities.find((c) => c.name === b.dropCity) : undefined;

  // A city the catalog does not place cannot be booked — the backend validates pickup and
  // drop as real coordinates, and inventing one would put the trip somewhere nobody asked
  // to go.
  if (!pickupCity?.lat || (b.dropCity && !dropCity?.lat)) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'CITY_NOT_MAPPED', message: 'We cannot book online for this city yet' },
      },
      { status: 400 },
    );
  }

  const drop = dropCity ?? pickupCity; // a local rental starts and ends in one city

  // Stops ride on the drop address: the desk and the driver both read it on the booking,
  // and the backend has no stops field. The fare is the direct route's — the desk confirms
  // what the stops add, by phone (owner's decision, 2 Oct 2026). Named from the catalogue
  // when it knows the city; otherwise as sent, since a note is still worth having.
  const stopLabels =
    b.tripType === 'local' || !Array.isArray(b.stops)
      ? []
      : (b.stops as unknown[])
          .map((s) => String(s).trim().slice(0, 60))
          .filter(Boolean)
          .slice(0, MAX_STOPS)
          .map((s) => cities.find((c) => c.name === s)?.label ?? s);
  const res = await fetch(`${env.apiBaseUrl}/bookings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    cache: 'no-store',
    body: JSON.stringify({
      tripType: b.tripType,
      vehicleType: b.vehicleType,
      pickup: {
        lat: pickupCity.lat,
        lng: pickupCity.lng,
        address: b.pickupAddress || pickupCity.label,
      },
      drop: {
        lat: drop.lat,
        lng: drop.lng,
        address: dropWithStops(dropCity?.label ?? pickupCity.label, stopLabels),
      },
      ...(b.tripType === 'local'
        ? { hours: b.hours ?? 8 }
        : { pickupCity: b.pickupCity, dropCity: b.dropCity }),
      paymentMethod: b.paymentMethod,
      // The website says so, and only a booking that says so gets Razorpay's callback
      // back to this site.
      ...(b.client === 'web' ? { client: 'web' } : {}),
      scheduledAt: b.scheduledAt,
      // A round trip is billed for every day until this, and a quote only redeems for the
      // same number of days.
      ...(b.returnAt ? { returnAt: b.returnAt } : {}),
      quoteId: b.quoteId,
    }),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
