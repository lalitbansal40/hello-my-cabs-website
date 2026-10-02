import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Save a booking enquiry that has not become a booking yet.
 *
 * Fired while somebody is still filling the form, so it must be invisible: whatever
 * happens here, the answer is `{ ok: true }` and the form carries on. This is a marketing
 * follow-up, not the booking — nobody's trip may be held up because a lead did not save.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.phone) return NextResponse.json({ ok: true });

  try {
    await fetch(`${env.apiBaseUrl}/public/booking/lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        phone: String(body.phone),
        ...(body.name ? { name: String(body.name).slice(0, 60) } : {}),
        ...(body.quoteId ? { quoteId: String(body.quoteId) } : {}),
        ...(body.pickupAddress ? { pickupAddress: String(body.pickupAddress).slice(0, 200) } : {}),
        // `callback` is the "we'll call you" popup (CallbackFab): a number, no trip.
        stage: ['phone_typed', 'otp_sent', 'otp_verified', 'callback'].includes(body.stage)
          ? body.stage
          : 'phone_typed',
      }),
      cache: 'no-store',
    });
  } catch {
    /* the form never waits on this, and never fails because of it */
  }
  return NextResponse.json({ ok: true });
}
