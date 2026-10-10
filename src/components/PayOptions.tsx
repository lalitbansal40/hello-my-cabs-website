'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Icon } from './site/Icons';
import { type Device, type UpiLinks, deviceOf, pickUpiButtons } from '@/lib/upi-buttons';

/** A UPI app — the main way to pay on a phone: red-edged and tinted, so it reads as a button. */
const PAY_APP =
  'inline-flex min-h-12 items-center justify-between gap-2 rounded-xl border-2 border-accent bg-accent/10 px-4 py-3 text-body font-bold text-ink transition-colors hover:bg-accent/15 active:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

/** The other ways — QR, card: outlined, with what they are drawn beside them. */
const PAY_OTHER =
  'flex w-full min-h-12 items-center gap-3 rounded-xl border-2 border-ink/20 bg-surface-raised px-4 py-3 text-body font-bold text-ink transition-colors hover:border-ink/40 hover:bg-surface-alt active:bg-surface-alt disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

interface Qr {
  qrId: string;
  imageUrl: string;
  expiresAt: string;
  amount: number; // paise
  qrPng?: string;
  payeeName?: string;
  upiLinks?: UpiLinks;
  checkoutUrl?: string;
}

/** How often to ask whether the booking was paid while the options are on screen. */
const CHECK_EVERY_MS = 3000;

const money = (paise: number) => `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;

/**
 * Every way to pay a booking, in one place (4 Oct 2026):
 *  - a UPI app on this phone — Google Pay, PhonePe, Paytm, BHIM or any — opened straight on
 *    the amount;
 *  - our own large QR, to scan from another phone (first and open on a computer);
 *  - card / netbanking / wallet — Razorpay's hosted page.
 *
 * All of them pay the booking's ONE payment row (the backend's QR, its UPI string and its
 * link), so it can never be charged twice — the backend shuts the others once one is paid
 * and refunds a second payment. While the options are up the booking is checked every few
 * seconds; paid, the page reloads into "confirmed" (or [onPaid] runs).
 */
export function PayOptions({
  bookingId,
  guestToken,
  autoShow = false,
  onPaid,
}: {
  bookingId: string;
  guestToken?: string;
  /** Show the options straight away (the booking form, right after the booking is made). */
  autoShow?: boolean;
  /** What to do once it is paid; by default the page reloads into "confirmed". */
  onPaid?: () => void;
}) {
  const [qr, setQr] = useState<Qr | null>(null);
  const [busy, setBusy] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [device, setDevice] = useState<Device>('desktop');
  const [qrOpen, setQrOpen] = useState(false);
  const done = useRef(false);
  const autoShown = useRef(false);

  const expired = qr ? new Date(qr.expiresAt).getTime() <= now : false;
  const q = guestToken ? `?g=${encodeURIComponent(guestToken)}` : '';
  const base = guestToken ? `/api/guest-booking/${bookingId}` : `/api/bookings/${bookingId}`;

  async function load() {
    // The device is read here, in the browser, before the options first show: the server
    // cannot know it, and the options are not on screen until this has run.
    setDevice(deviceOf(navigator.userAgent, window.matchMedia('(pointer: coarse)').matches));
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${base}/qr${q}`, { method: 'POST' });
      const body = await res.json().catch(() => null);
      const got = body?.data?.qr as Qr | undefined;
      if (!body?.ok || !got?.imageUrl) {
        // The backend knows why (already paid, cancelled, a cash booking) — its words.
        setError(body?.error?.message ?? 'We could not get the payment options just now');
        return;
      }
      setQr(got);
      setNow(Date.now());
    } catch {
      setError('Network problem — please try again');
    } finally {
      setBusy(false);
    }
  }

  /** Card / netbanking / wallet: the booking's hosted page — kept, or a fresh link. */
  async function payByCard() {
    if (qr?.checkoutUrl) {
      window.location.href = qr.checkoutUrl;
      return;
    }
    setCardBusy(true);
    setError('');
    try {
      const res = await fetch(`${base}/pay-link${q}`, { method: 'POST' });
      const body = await res.json().catch(() => null);
      const url = body?.data?.paymentUrl as string | undefined;
      if (!body?.ok || !url) {
        setError(body?.error?.message ?? 'We could not open the payment page just now');
        setCardBusy(false);
        return;
      }
      window.location.href = url;
    } catch {
      setError('Network problem — please try again');
      setCardBusy(false);
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

  // Right after booking: the options are the next thing on screen, not one more tap.
  useEffect(() => {
    if (!autoShow || autoShown.current) return;
    autoShown.current = true;
    void load();
    // load() is a plain function of this render; running it once on mount is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoShow]);

  // While the options are up: the clock every second, and "was it paid?" every few.
  useEffect(() => {
    if (!qr) return;
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(async () => {
      if (done.current) return;
      if (await paid()) {
        done.current = true;
        if (onPaid) onPaid();
        else window.location.reload(); // the page then shows the booking confirmed
      }
    }, CHECK_EVERY_MS);
    return () => {
      clearInterval(clock);
      clearInterval(poll);
    };
  }, [qr, paid, onPaid]);

  if (!qr || expired) {
    return (
      <div>
        <Button onClick={load} disabled={busy}>
          {busy
            ? 'Getting the payment options…'
            : qr
              ? 'The QR closed — get a new one'
              : 'Pay now — UPI app, QR or card'}
        </Button>
        {error ? <p className="mt-2 text-small text-danger">{error}</p> : null}
      </div>
    );
  }

  const apps = pickUpiButtons(device, qr.upiLinks);
  const onPhone = device !== 'desktop';
  const showQr = !onPhone || qrOpen;
  const left = Math.max(0, new Date(qr.expiresAt).getTime() - now);
  const mm = Math.floor(left / 60000);
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  const qrSrc = qr.qrPng ?? qr.imageUrl;

  const qrCard = (
    // White behind the code in dark mode too, or a scanner cannot read it.
    <div className="rounded-2xl border border-line bg-white p-5 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- a data URL of our own QR, or Razorpay's own poster; neither is ours to optimise. */}
      <img
        src={qrSrc}
        alt="UPI QR code to pay for this booking"
        className="mx-auto aspect-square w-[min(80vw,320px)] object-contain"
      />
      <p className="mt-3 text-small text-black/60">
        Scan with any UPI app — GPay, PhonePe, Paytm, BHIM — on any phone.
      </p>
      <p className="mt-1 text-small text-black/60 tabular-nums">The QR closes in {mm}:{ss}</p>
      {qr.qrPng ? (
        <a
          className="mt-2 inline-block text-small font-semibold text-black/70 underline hover:text-black"
          href={qr.qrPng}
          download="hello-my-cab-payment-qr.png"
        >
          Save the QR
        </a>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-title font-black text-ink">Pay {money(qr.amount)}</p>
        {qr.payeeName ? (
          <p className="mt-1 text-small text-muted">Paying: {qr.payeeName}</p>
        ) : null}
        <p className="mt-1 text-small text-muted">Choose any one way to pay.</p>
      </div>

      {/* 1. A UPI app on this phone. */}
      {onPhone && apps.length ? (
        <div>
          <p className="text-small font-bold text-ink">Pay with a UPI app</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {apps.map((a) => (
              <a
                key={a.key}
                href={a.href}
                // A button, and it has to look like one (10 Oct 2026): the brand's red, a
                // pressed state, an arrow that says it goes somewhere.
                className={PAY_APP}
              >
                <span>{a.label}</span>
                <Icon.arrow className="h-4 w-4 shrink-0 text-accent" />
              </a>
            ))}
          </div>
          <p className="mt-2 text-small text-muted">
            Nothing opened? Use the QR below, or pay by card.
          </p>
        </div>
      ) : null}

      {/* 2. Our large QR — first and open on a computer, a tap away on a phone. */}
      <div>
        <p className="text-small font-bold text-ink">
          {onPhone ? 'Pay from another phone' : 'Scan to pay'}
        </p>
        <div className="mt-2">
          {showQr ? (
            qrCard
          ) : (
            <button type="button" className={PAY_OTHER} onClick={() => setQrOpen(true)}>
              <Icon.qr className="h-5 w-5 shrink-0 text-ink" />
              <span className="flex-1 text-left">Show the QR — scan it from another phone</span>
              <Icon.arrow className="h-4 w-4 shrink-0 text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Card / netbanking / wallet — Razorpay's page. */}
      <div>
        <p className="text-small font-bold text-ink">Card, netbanking or wallet</p>
        <button type="button" className={`mt-2 ${PAY_OTHER}`} onClick={payByCard} disabled={cardBusy}>
          <Icon.card className="h-5 w-5 shrink-0 text-ink" />
          <span className="flex-1 text-left">
            {cardBusy ? 'Opening the payment page…' : 'Pay by card / netbanking'}
          </span>
          <Icon.arrow className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>

      <p className="text-center text-small text-muted">
        This page confirms on its own once you pay.
      </p>
      {error ? <p className="text-small text-danger">{error}</p> : null}
    </div>
  );
}
