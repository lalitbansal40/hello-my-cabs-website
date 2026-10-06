import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { api } from '@/lib/api';
import { getSession } from '@/lib/session';
import { MAX_STOPS, dropWithStops } from '@/lib/stops';
import { isValidMobile } from '@/lib/phone';

/**
 * Bookings without a session, per address, per hour. The backend allows three an hour per
 * NUMBER; this stops one browser cycling through numbers. In memory, per server process —
 * a soft fence, not the only one.
 */
const GUEST_PER_HOUR = 6;
const guestHits = new Map<string, number[]>();
function guestAllowed(ip: string): boolean {
  const now = Date.now();
  const recent = (guestHits.get(ip) ?? []).filter((t) => now - t < 3600_000);
  if (recent.length >= GUEST_PER_HOUR) {
    guestHits.set(ip, recent);
    return false;
  }
  recent.push(now);
  guestHits.set(ip, recent);
  // Keep the map from growing for ever on a long-lived server.
  if (guestHits.size > 5000) guestHits.clear();
  return true;
}

/**
 * Place the booking.
 *
 * Runs here, not in the browser, for two reasons: the session cookie is httpOnly so only
 * the server can read it, and the coordinates POST /bookings requires are looked up here
 * from the city catalog rather than trusted from the client.
 *
 * No price is sent. The quote id is, and the backend charges what it stored against it.
 *
 * Signed in → the booking is made against the session (any account — drivers and admins
 * book too). Not signed in → it is made with the phone number alone, no OTP (owner's
 * decision, 2 Oct 2026): POST /public/bookings, which finds or makes the account and hands
 * back a token for this one booking (guestToken) instead of a session.
 */
export async function POST(request: Request) {
  const token = await getSession();
  const b = await request.json();

  const phone = String(b.phone ?? '').replace(/\D/g, '').slice(-10);
  if (!token) {
    if (!isValidMobile(phone)) {
      return NextResponse.json(
        { ok: false, error: { code: 'PHONE_INVALID', message: 'Enter a 10-digit mobile number' } },
        { status: 400 },
      );
    }
    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
    if (!guestAllowed(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'TOO_MANY_BOOKINGS',
            message: 'Too many bookings from here in the last hour — please call us to book',
          },
        },
        { status: 429 },
      );
    }
  }

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
  const res = await fetch(`${env.apiBaseUrl}${token ? '/bookings' : '/public/bookings'}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
    body: JSON.stringify({
      // Who it is for — only without a session; with one, the session says.
      ...(token
        ? {}
        : { phone, ...(b.name ? { name: String(b.name).trim().slice(0, 60) } : {}) }),
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
      // Online only — the website has no cash option (6 Oct 2026); whatever a stale page
      // sends, this never asks for cash.
      paymentMethod: 'online',
      // The whole fare now (4 Oct 2026), or an amount the customer chose — whole rupees,
      // checked against the minimum and the fare by the backend, which pays the driver what
      // was paid above the minimum at completion. Only well-formed values pass.
      ...(b.payFull === true ? { payFull: true } : {}),
      ...(b.payFull !== true && Number.isInteger(b.payAmountRupees) && b.payAmountRupees > 0
        ? { payAmountRupees: b.payAmountRupees }
        : {}),
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
