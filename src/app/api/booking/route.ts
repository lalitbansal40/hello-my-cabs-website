import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getSession } from '@/lib/session';

/** Read one booking. The session cookie is httpOnly, so only the server can use it. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  const token = await getSession();
  if (!id || !token) {
    return NextResponse.json({ ok: false, error: { code: 'NOT_LOGGED_IN' } }, { status: 401 });
  }
  const res = await fetch(`${env.apiBaseUrl}/bookings/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
