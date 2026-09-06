import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Locks in a price for a visitor who has not logged in.
 *
 * Proxied rather than called from the browser so the site talks to one origin — no CORS to
 * get wrong, and the API base stays a server concern.
 *
 * The body is passed straight through. There is no price in it, and there could not be: the
 * backend computes the fare itself and hands back an id. A price the browser could send is
 * a price the browser could edit.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${env.apiBaseUrl}/public/booking/quote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store', // a quote is a fresh price every time
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
