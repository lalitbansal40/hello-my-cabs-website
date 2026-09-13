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
 * edit. Only the fields a quote is made of are forwarded, and the two dates only when they
 * are real times — the backend checks them again, but a malformed date is better stopped
 * with a plain message here than turned into a validation error nobody can read.
 */
const FIELDS = ['tripType', 'vehicleType', 'pickupCity', 'dropCity', 'hours'] as const;

const isTime = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

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
  if (
    body.tripType === 'round_trip' &&
    (body.pickupAt !== undefined || body.returnAt !== undefined)
  ) {
    if (!isTime(body.pickupAt) || !isTime(body.returnAt)) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'BAD_DATES', message: 'Choose the pickup and return times again' },
        },
        { status: 400 },
      );
    }
    out.pickupAt = body.pickupAt;
    out.returnAt = body.returnAt;
  }
  const res = await fetch(`${env.apiBaseUrl}/public/booking/quote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(out),
    cache: 'no-store', // a quote is a fresh price every time
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
