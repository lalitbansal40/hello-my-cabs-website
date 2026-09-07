import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getSession } from '@/lib/session';

/**
 * Cancel a booking. Proxied so the session token stays in its httpOnly cookie and never
 * has to be readable by the page.
 *
 * POST only, and never reachable by a link or a prefetch: cancelling is not reversible.
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
  const { reason } = (await request.json().catch(() => ({}))) as { reason?: string };

  const res = await fetch(`${env.apiBaseUrl}/bookings/${id}/cancel`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    // The backend caps the reason at 300 characters; trimming here keeps a long note from
    // failing the whole cancellation on a validation error.
    body: JSON.stringify({ reason: reason?.slice(0, 300) || undefined }),
    cache: 'no-store',
  });
  return NextResponse.json(await res.json().catch(() => null), { status: res.status });
}
