import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Locks in a price for a visitor who has not logged in.
 *
 * Proxied rather than called from the browser so the site talks to one origin — no CORS to
 * get wrong, and the API base stays a server concern.
 *
 * There is no price in the body, and there could not be: the backend computes the fare
 * itself and hands back an id. A price the browser could send is a price the browser could
 * edit. Only the fields a quote is made of are forwarded.
 */
const FIELDS = ['tripType', 'vehicleType', 'pickupCity', 'dropCity', 'hours'] as const;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'We could not read that request' } },
      { status: 400 },
    );
  }
  const out: Record<string, unknown> = {};
  for (const k of FIELDS) if (body[k] !== undefined) out[k] = body[k];
  // Stops on a one-way trip are priced leg by leg (12 Oct 2026) — city keys, at most three.
  if (body.tripType === 'one_way' && Array.isArray(body.stops) && body.stops.length) {
    const stops = body.stops.filter((s): s is string => typeof s === 'string' && /^[A-Z][A-Z_]{1,39}$/.test(s));
    if (stops.length !== body.stops.length || stops.length > 3) {
      return NextResponse.json(
        { ok: false, error: { code: 'BAD_STOPS', message: 'Choose the stops on the way again' } },
        { status: 400 },
      );
    }
    out.stops = stops;
  }
  // No return time any more (12 Oct 2026): a round trip is priced for the day.
  const res = await fetch(`${env.apiBaseUrl}/public/booking/quote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(out),
    cache: 'no-store', // a quote is a fresh price every time
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
