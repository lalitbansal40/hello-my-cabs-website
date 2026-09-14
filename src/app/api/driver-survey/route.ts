import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Saves a driver's road survey answer.
 *
 * Passed through to the backend, which checks the signed link and every field. The one
 * check here is the shape of the token, so a malformed request never becomes a backend
 * URL with something unexpected in its path.
 */
const TOKEN = /^[\w-]{10,400}\.[\w-]{20,100}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
    answer?: unknown;
  } | null;
  if (!body || typeof body.token !== 'string' || !TOKEN.test(body.token)) {
    return NextResponse.json(
      { ok: false, error: { code: 'SURVEY_LINK_INVALID', message: 'This link is not valid.' } },
      { status: 400 },
    );
  }
  const res = await fetch(`${env.apiBaseUrl}/route-knowledge/${body.token}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body.answer ?? {}),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({
    ok: false,
    error: {
      code: 'REQUEST_FAILED',
      message: 'We could not save that just now. Please try again.',
    },
  }));
  return NextResponse.json(data, { status: res.status });
}
