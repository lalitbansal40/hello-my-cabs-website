'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';

interface Qr {
  qrId: string;
  imageUrl: string;
  expiresAt: string;
  amount: number; // paise
}

/** How often to ask whether the QR was paid while it is on screen. */
const CHECK_EVERY_MS = 3000;

/**
 * Pay a booking by scanning a UPI QR — from this phone's screen with another phone, or from
 * a computer with the phone in hand.
 *
 * The payment page opens on the device that pays; when the money is on somebody else's
 * phone, or the UPI app will not open from the browser, a QR is the way through. It pays
 * the booking's one payment row (the same as the page), so it can never charge twice.
 * While it is up, the booking is checked every few seconds, and the page reloads into
 * "confirmed" the moment the money lands.
 */
export function PayByQr({ bookingId, guestToken }: { bookingId: string; guestToken?: string }) {
  const [qr, setQr] = useState<Qr | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const done = useRef(false);

  const expired = qr ? new Date(qr.expiresAt).getTime() <= now : false;

  async function show() {
    setBusy(true);
    setError('');
    try {
      // A booking made without an OTP has no session to ask with — its own token instead.
      const res = await fetch(
        guestToken
          ? `/api/guest-booking/${bookingId}/qr?g=${encodeURIComponent(guestToken)}`
          : `/api/bookings/${bookingId}/qr`,
        { method: 'POST' },
      );
      const body = await res.json().catch(() => null);
      const q = body?.data?.qr as Qr | undefined;
      if (!body?.ok || !q?.imageUrl) {
        // The backend knows why (already paid, cancelled, a cash booking) — its words.
        setError(body?.error?.message ?? 'We could not make the QR just now');
        return;
      }
      setQr(q);
      setNow(Date.now());
    } catch {
      setError('Network problem — please try again');
    } finally {
      setBusy(false);
    }
  }

  /** Was it paid? The same reads the payment-result page uses. */
  const paid = useCallback(async (): Promise<boolean> => {
    try {
      const res = guestToken
        ? await fetch(`/api/guest-booking/${bookingId}?g=${encodeURIComponent(guestToken)}`)
        : await fetch(`/api/bookings/${bookingId}/reconcile`, { method: 'POST' });
      const body = await res.json().catch(() => null);
      return body?.ok === true && body?.data?.paid === true;
    } catch {
      return false;
    }
  }, [bookingId, guestToken]);

  // While a QR is up: the clock every second, and "was it paid?" every few.
  useEffect(() => {
    if (!qr) return;
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(async () => {
      if (done.current) return;
      if (await paid()) {
        done.current = true;
        window.location.reload(); // the page then shows the booking confirmed
      }
    }, CHECK_EVERY_MS);
    return () => {
      clearInterval(clock);
      clearInterval(poll);
    };
  }, [qr, paid]);

  if (!qr || expired) {
    return (
      <div>
        <Button variant="ghost" onClick={show} disabled={busy}>
          {busy ? 'Making the QR…' : qr ? 'QR closed — get a new one' : 'Pay by UPI QR'}
        </Button>
        <p className="mt-2 text-small text-muted">
          Scan it from any phone with GPay, PhonePe, Paytm or any UPI app.
        </p>
        {error ? <p className="mt-2 text-small text-danger">{error}</p> : null}
      </div>
    );
  }

  const left = Math.max(0, new Date(qr.expiresAt).getTime() - now);
  const mm = Math.floor(left / 60000);
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  return (
    // White behind the code in dark mode too, or a scanner cannot read it.
    <div className="rounded-2xl border border-line bg-white p-5 text-center">
      <p className="font-bold text-black">
        Scan to pay ₹{Math.round(qr.amount / 100).toLocaleString('en-IN')}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- Razorpay's own QR image, served by Razorpay; not one of ours to optimise. */}
      <img
        src={qr.imageUrl}
        alt="UPI QR code to pay for this booking"
        width={260}
        height={260}
        className="mx-auto mt-3 h-[260px] w-[260px] object-contain"
      />
      <p className="mt-3 text-small text-black/60">
        Any UPI app — GPay, PhonePe, Paytm, BHIM. This page confirms on its own once you pay.
      </p>
      <p className="mt-1 text-small text-black/60 tabular-nums">
        The QR closes in {mm}:{ss}
      </p>
    </div>
  );
}
