import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/** The UPI QR for a booking made without an OTP — the token opens that one booking only. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = new URL(request.url).searchParams.get('g') ?? '';
  const res = await fetch(
    `${env.apiBaseUrl}/public/bookings/${encodeURIComponent(id)}/qr?g=${encodeURIComponent(g)}`,
    { method: 'POST', cache: 'no-store' },
  );
  return NextResponse.json(await res.json().catch(() => ({ ok: false })), { status: res.status });
}
