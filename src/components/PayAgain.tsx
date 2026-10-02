'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

/**
 * A second run at a payment that never finished.
 *
 * The link Razorpay issues at booking is shown once and never stored, so a customer who
 * closed the tab had nothing but a phone number to fall back on. The backend hands back a
 * new link on the SAME payment row — one booking can never turn into two charges.
 */
export function PayAgain({ bookingId, guestToken }: { bookingId: string; guestToken?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function go() {
    setBusy(true);
    setError('');
    try {
      // A booking made without an OTP has no session to ask with — its own token instead.
      const res = await fetch(
        guestToken
          ? `/api/guest-booking/${bookingId}/pay-link?g=${encodeURIComponent(guestToken)}`
          : `/api/bookings/${bookingId}/pay-link`,
        { method: 'POST' },
      );
      const body = await res.json().catch(() => null);
      const url = body?.data?.paymentUrl as string | undefined;
      if (!body?.ok || !url) {
        // The backend's wording is the right wording — it knows why (already paid,
        // cancelled, a cash booking) and a guess here would only be a worse sentence.
        setError(body?.error?.message ?? 'We could not open the payment page just now');
        setBusy(false);
        return;
      }
      window.location.href = url;
    } catch {
      setError('Network problem — please try again');
      setBusy(false);
    }
  }

  return (
    <div>
      <Button onClick={go} disabled={busy}>
        {busy ? 'Opening payment…' : 'Pay again'}
      </Button>
      {error ? <p className="mt-2 text-small text-danger">{error}</p> : null}
    </div>
  );
}
