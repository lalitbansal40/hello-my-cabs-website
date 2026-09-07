import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

/**
 * Sign out of this browser, and only this browser.
 *
 * The backend's own logout raises tokenVersion, which ends every session on the account —
 * including the customer's app. That is the right behaviour for a driver handing on a
 * phone, and the wrong behaviour here: a customer signs out of a shared laptop and finds
 * the app on their own phone has signed out too, with no explanation.
 *
 * Dropping the cookie is enough. It is httpOnly, so nothing in the page can read it, and
 * once it is gone this browser holds nothing. A "sign out everywhere" is a separate,
 * clearly labelled thing, and it does not exist yet.
 *
 * POST rather than GET on purpose: a crawler following a link, or a browser prefetching
 * one, would otherwise sign people out for them.
 */
export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true, data: { signedOut: true } });
}
