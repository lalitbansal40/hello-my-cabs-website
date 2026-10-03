import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getSession } from '@/lib/session';

/**
 * A UPI QR for a booking that was never paid — scanned from any phone, with any UPI app.
 *
 * The backend issues it on the booking's ONE payment row (the same one the payment link
 * pays), so paying by QR can never turn one booking into two charges; a second payment is
 * refunded there.
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
  const res = await fetch(`${env.apiBaseUrl}/bookings/${id}/qr`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return NextResponse.json(await res.json().catch(() => null), { status: res.status });
}
