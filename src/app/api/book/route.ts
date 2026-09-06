import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { api } from '@/lib/api';
import { getSession } from '@/lib/session';

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
      { ok: false, error: { code: 'NOT_LOGGED_IN', message: 'Pehle OTP se verify karein' } },
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
      { ok: false, error: { code: 'CITY_NOT_MAPPED', message: 'Is sheher ke liye online booking abhi nahi ho paati' } },
      { status: 400 },
    );
  }

  const drop = dropCity ?? pickupCity; // a local rental starts and ends in one city
  const res = await fetch(`${env.apiBaseUrl}/bookings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    cache: 'no-store',
    body: JSON.stringify({
      tripType: b.tripType,
      vehicleType: b.vehicleType,
      pickup: { lat: pickupCity.lat, lng: pickupCity.lng, address: b.pickupAddress || pickupCity.label },
      drop: { lat: drop.lat, lng: drop.lng, address: dropCity?.label ?? pickupCity.label },
      ...(b.tripType === 'local' ? { hours: b.hours ?? 8 } : { pickupCity: b.pickupCity, dropCity: b.dropCity }),
      paymentMethod: b.paymentMethod,
      scheduledAt: b.scheduledAt,
      quoteId: b.quoteId,
    }),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
