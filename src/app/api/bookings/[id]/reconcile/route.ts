import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getSession } from '@/lib/session';

/**
 * Ask the backend whether this booking's payment has actually landed.
 *
 * The page that waits after Razorpay calls this every couple of seconds. It is the only
 * honest answer available: Razorpay's webhook and the customer's browser come back by
 * different roads, and either can arrive first. Nothing in the returning URL is trusted.
 *
 * Proxied so the session token stays in its httpOnly cookie, and POST only so a prefetch
 * or a pasted link can never trigger it.
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
  const res = await fetch(`${env.apiBaseUrl}/bookings/${id}/reconcile`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return NextResponse.json(await res.json().catch(() => null), { status: res.status });
}
