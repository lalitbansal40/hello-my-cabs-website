import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * A booking made without an OTP, read with the token that came back with it.
 *
 * Read-only, no phone numbers (backend: GET /public/bookings/:id?g=). A pending online
 * payment is checked with Razorpay on the way, so this is also what the page Razorpay
 * returns a guest to asks.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = new URL(request.url).searchParams.get('g') ?? '';
  const res = await fetch(
    `${env.apiBaseUrl}/public/bookings/${encodeURIComponent(id)}?g=${encodeURIComponent(g)}`,
    { cache: 'no-store' },
  );
  return NextResponse.json(await res.json().catch(() => ({ ok: false })), { status: res.status });
}
