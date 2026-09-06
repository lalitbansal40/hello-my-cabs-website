import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { setSession } from '@/lib/session';

/**
 * Verify an OTP and start a session.
 *
 * The token never reaches the browser as a value it can read: this route receives it from
 * the backend and writes it straight into an httpOnly cookie.
 */
export async function POST(request: Request) {
  const { phone, code, name } = await request.json();

  const res = await fetch(`${env.apiBaseUrl}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // `role` and `name` are only needed when the account does not exist yet; sending them
    // for an existing customer is harmless and saves asking whether they are new.
    body: JSON.stringify({ phone, code, role: 'CUSTOMER', name }),
    cache: 'no-store',
  });
  const body = await res.json();
  if (!body.ok) return NextResponse.json(body, { status: res.status });

  await setSession(body.data.accessToken);
  return NextResponse.json({ ok: true, data: { user: body.data.user } });
}
