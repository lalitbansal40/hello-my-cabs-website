'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiPhone } from './phone';

/**
 * Requesting a code and verifying it, in one place.
 *
 * The funnel and the sign-in page ask the same two questions, and when they each owned a
 * copy of this the two drifted: a resend cooldown in one, none in the other; a phone shape
 * in one, another in the other. Both of those cost sign-ins, and neither is visible to
 * whoever is testing the other screen.
 *
 * The caller decides what happens after a successful verify — the funnel makes a booking,
 * the sign-in page navigates — so this deliberately does not know about either.
 */
const RESEND_SECONDS = 30;

export function useOtp() {
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  /**
   * Whether the backend has never seen this number. It says so on the REQUEST, which is
   * the only moment we can use it: a successful verify deletes the code before it decides
   * a name is missing, so asking for the name after that error leaves the person holding a
   * code that no longer exists.
   */
  const [isNewUser, setIsNewUser] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_SECONDS);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1 && timer.current) clearInterval(timer.current);
        return c - 1;
      });
    }, 1000);
  }, []);

  /** Ask for a code. Returns true when one is on its way. */
  const sendCode = useCallback(
    async (phone: string): Promise<boolean> => {
      setBusy(true);
      setError('');
      try {
        const res = await fetch('/api/otp', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ phone: toApiPhone(phone) }),
        });
        const body = await res.json().catch(() => null);
        if (!body?.ok) {
          // The backend's wording is the right wording — it knows whether this was a bad
          // number, twelve requests in ten minutes, or a suspended account.
          setError(body?.error?.message ?? 'We could not send the code');
          return false;
        }
        setIsNewUser(Boolean(body.data?.isNewUser));
        setStage('code');
        startCooldown();
        return true;
      } catch {
        setError('Network problem — please try again');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [startCooldown],
  );

  /**
   * Check the code and start a session.
   *
   * Returns the signed-in user rather than a bare true, because the caller has to know the
   * role: this site is for customers, and a driver's account signs in perfectly well here
   * and then gets a 403 from every page it was signed in to reach.
   */
  const verifyCode = useCallback(
    async (phone: string, code: string, name?: string): Promise<{ role: string } | null> => {
      setBusy(true);
      setError('');
      try {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          // The same shape the code was requested for. Two shapes would put the code on
          // one account and the verification on another.
          body: JSON.stringify({ phone: toApiPhone(phone), code, name }),
        });
        const body = await res.json().catch(() => null);
        if (!body?.ok) {
          setError(body?.error?.message ?? 'That code is not right');
          return null;
        }
        return { role: String(body.data?.user?.role ?? '') };
      } catch {
        setError('Network problem — please try again');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { stage, setStage, busy, error, setError, cooldown, isNewUser, sendCode, verifyCode };
}
