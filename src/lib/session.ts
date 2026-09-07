import { cache } from 'react';
import { cookies } from 'next/headers';
import { env } from './env';

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

/** What the backend tells us about the signed-in customer. */
export interface SessionUser {
  id: string;
  name?: string;
  phone: string;
  role: string;
  avatarUrl?: string;
}

/**
 * Who is signed in right now, or null.
 *
 * Wrapped in React's `cache` so the header, a guard and a page asking the same question
 * during one render make one call between them rather than three.
 *
 * ⚠️ That memo lasts for ONE REQUEST and must never be widened. This is per-person data:
 * a cache shared between requests would hand one customer another customer's name, which
 * is the worst class of bug this site could have. Hence `no-store` too — nothing about
 * this answer belongs in the data cache.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSession();
  if (!token) return null;

  try {
    const res = await fetch(`${env.apiBaseUrl}/auth/me`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      cache: 'no-store',
    });

    // 401 means the token is dead — the account was suspended, or an admin signed them
    // out. Holding on to the cookie would leave every later call failing with nothing to
    // explain it, so it goes.
    if (res.status === 401) {
      await clearSession();
      return null;
    }

    const body = await res.json().catch(() => null);
    if (!body?.ok) return null;

    const u = body.data.user as Record<string, unknown>;
    return {
      id: String(u._id ?? u.id ?? ''),
      name: typeof u.name === 'string' ? u.name : undefined,
      phone: String(u.phone ?? ''),
      role: String(u.role ?? ''),
      avatarUrl: typeof u.avatarUrl === 'string' ? u.avatarUrl : undefined,
    };
  } catch {
    // The backend being unreachable is not the same as being signed out, but there is
    // nothing better to render than the signed-out view for this one request.
    return null;
  }
});
