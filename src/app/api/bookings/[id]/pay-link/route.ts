import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getSession } from '@/lib/session';

/**
 * A fresh payment link for a booking that was never paid.
 *
 * The first link is issued once, at booking, and never stored — so a customer who closed
 * the tab had only a phone number to fall back on. The backend reuses the same payment
 * row, so this can never turn one booking into two charges.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSession();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_SIGNED_IN', message: 'Please sign in again' } },
      { status: 401 },
    );
  }

  const { id } = await params;
  const res = await fetch(`${env.apiBaseUrl}/bookings/${id}/pay-link`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return NextResponse.json(await res.json().catch(() => null), { status: res.status });
}
