import { cookies } from 'next/headers';

/**
 * The customer's access token, in an httpOnly cookie.
 *
 * Not localStorage. A token there is readable by any script that ends up on the page —
 * one bad dependency, one injected tag — and it is the customer's whole account. httpOnly
 * means the browser can send it and no script can read it.
 */
const COOKIE = 'hmc_session';

export async function setSession(accessToken: string) {
  (await cookies()).set(COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // survives the return trip from the payment page
    path: '/',
    // Six months. The token itself never expires — the backend revokes by version, not by
    // time — so a week-long cookie was only ever an arbitrary logout: on the eighth day a
    // customer would be asked for an OTP again while the credential in their hand was
    // still perfectly valid.
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function getSession(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
