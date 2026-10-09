import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Saves a customer's rating from the link sent after a ride (app/rate/[token]).
 *
 * Passed through to the backend, which checks the signed link and every field. The one check
 * here is the shape of the token, so a malformed request never becomes a backend URL with
 * something unexpected in its path.
 */
const TOKEN = /^[a-f0-9]{24}\.[\w-]{22}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
    rating?: unknown;
  } | null;
  if (!body || typeof body.token !== 'string' || !TOKEN.test(body.token)) {
    return NextResponse.json(
      { ok: false, error: { code: 'RATING_LINK_INVALID', message: 'This link is not valid.' } },
      { status: 400 },
    );
  }
  const res = await fetch(`${env.apiBaseUrl}/public/reviews/rate/${body.token}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body.rating ?? {}),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({
    ok: false,
    error: { code: 'REQUEST_FAILED', message: 'We could not save that just now. Please try again.' },
  }));
  return NextResponse.json(data, { status: res.status });
}
