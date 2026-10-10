import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Save a booking enquiry that has not become a booking yet.
 *
 * Fired while somebody is still filling the form, so it must be invisible: whatever
 * happens here, the answer is `{ ok: true }` and the form carries on. This is a marketing
 * follow-up, not the booking — nobody's trip may be held up because a lead did not save.
 */
/** A city key the way the funnel carries it: JAIPUR, DELHI_AIRPORT. */
const CITY = /^[A-Z][A-Z_]{1,39}$/;
/** The funnel's wall-clock time: 2026-10-12T06:00. */
const WHEN = /^\d{4}-\d\d-\d\dT\d\d:\d\d$/;

/**
 * The trip, copied onto the lead (10 Oct 2026) so it outlives the thirty-minute quote. Every
 * field is checked and anything that does not look right is simply left off — never refused,
 * because the lead itself must still save.
 */
function tripOf(b: Record<string, unknown>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (['one_way', 'round_trip', 'local'].includes(String(b.tripType))) out.tripType = String(b.tripType);
  if (CITY.test(String(b.pickup ?? ''))) out.pickup = String(b.pickup);
  if (CITY.test(String(b.drop ?? ''))) out.drop = String(b.drop);
  if (WHEN.test(String(b.when ?? ''))) out.when = String(b.when);
  if (WHEN.test(String(b.returnWhen ?? ''))) out.returnWhen = String(b.returnWhen);
  const hours = Number(b.hours);
  if (Number.isInteger(hours) && hours >= 1 && hours <= 24) out.hours = hours;
  if (/^[a-z0-9_]{2,30}$/.test(String(b.vehicleType ?? ''))) out.vehicleType = String(b.vehicleType);
  const fare = Number(b.fareRupees);
  if (Number.isInteger(fare) && fare >= 1 && fare <= 500_000) out.fareRupees = fare;
  return out;
}

export async function POST(request: Request) {
  // JSON from the form; a beacon from a closing page may arrive as text — read both.
  const raw = await request.text().catch(() => '');
  let body: Record<string, unknown> | null = null;
  try {
    body = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    body = null;
  }
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
        // `callback` is the "we'll call you" popup (CallbackFab): a number, no trip, button
        // pressed; `callback_typed` the same number typed and the button not pressed.
        stage: ['phone_typed', 'otp_sent', 'otp_verified', 'callback', 'callback_typed'].includes(
          String(body.stage),
        )
          ? body.stage
          : 'phone_typed',
        ...tripOf(body),
        // The page they were on — a path, nothing else (the backend refuses anything else).
        ...(typeof body.pagePath === 'string' && /^\/[\w\-/]*$/.test(body.pagePath)
          ? { pagePath: body.pagePath.slice(0, 200) }
          : {}),
      }),
      cache: 'no-store',
    });
  } catch {
    /* the form never waits on this, and never fails because of it */
  }
  return NextResponse.json({ ok: true });
}
