'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { track } from '@/lib/analytics';
import { company } from '@/lib/company';
import { formatWhen } from '@/lib/when';
import { vehicleName } from '@/lib/vehicle-name';

/** How often to ask, and for how long, before saying "not yet" instead of spinning on. */
const EVERY_MS = 2000;
const GIVE_UP_MS = 60_000;

interface Booking {
  bookingNo?: number;
  vehicleType?: string;
  pickup?: { address?: string };
  drop?: { address?: string };
  scheduledAt?: string;
  fareEstimate?: number;
  status?: string;
}

const money = (paise: number) => `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;

/**
 * The wait after Razorpay, and the answer at the end of it.
 *
 * Three states, one component: checking, paid, not paid. The money is read from the
 * backend (which reads it from Razorpay), never from the URL the browser came back on.
 */
export function PaymentResult({ bookingId, cancelled }: { bookingId: string; cancelled: boolean }) {
  const [state, setState] = useState<'checking' | 'paid' | 'unpaid'>(
    // Razorpay already said the customer walked away: waiting a minute for money nobody
    // sent only makes them watch a spinner for nothing.
    cancelled ? 'unpaid' : 'checking',
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [billUrl, setBillUrl] = useState<string | null>(null);
  const [payAgainBusy, setPayAgainBusy] = useState(false);
  const [error, setError] = useState('');
  /** Set once, so a success is counted once however many times the page polls. */
  const counted = useRef(false);

  const check = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reconcile`, { method: 'POST' });
      const body = await res.json().catch(() => null);
      if (!body?.ok) return false;
      const d = body.data as {
        paid?: boolean;
        amountPaid?: number;
        billUrl?: string | null;
        booking?: Booking;
      };
      if (d.booking) setBooking(d.booking);
      if (!d.paid) return false;
      setAmountPaid(d.amountPaid ?? 0);
      setBillUrl(d.billUrl ?? null);
      setState('paid');
      if (!counted.current) {
        counted.current = true;
        // No booking id: the props whitelist is deliberate, and a booking id would be
        // one person's identifier sitting in an analytics event for no gain.
        track('payment_success', { paymentMethod: 'online' });
      }
      return true;
    } catch {
      // A dropped request is not an answer — keep asking until the clock runs out.
      return false;
    }
  }, [bookingId]);

  useEffect(() => {
    let stopped = false;
    const startedAt = Date.now();
    let timer = 0;
    const tick = async () => {
      if (stopped) return;
      const done = await check();
      if (done || stopped) return;
      // Razorpay already said this one was abandoned: ask once for the booking's own
      // details (a second attempt may have gone through) and stop there, rather than
      // making somebody watch a spinner for money nobody sent.
      if (cancelled) return;
      if (Date.now() - startedAt >= GIVE_UP_MS) {
        setState('unpaid');
        return;
      }
      timer = window.setTimeout(tick, EVERY_MS);
    };
    // Nothing runs in the effect body itself: the first ask is scheduled like every
    // other one, so no state is set while React is still rendering.
    timer = window.setTimeout(tick, 0);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [cancelled, check]);

  async function payAgain() {
    setPayAgainBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay-link`, { method: 'POST' });
      const body = await res.json().catch(() => null);
      const url = body?.data?.paymentUrl as string | undefined;
      if (!body?.ok || !url) {
        setError(body?.error?.message ?? 'We could not open the payment page just now');
        setPayAgainBusy(false);
        return;
      }
      window.location.href = url;
    } catch {
      setError('Network problem — please try again');
      setPayAgainBusy(false);
    }
  }

  async function checkAgain() {
    setState('checking');
    setError('');
    const startedAt = Date.now();
    const tick = async () => {
      const done = await check();
      if (done) return;
      if (Date.now() - startedAt >= GIVE_UP_MS) {
        setState('unpaid');
        return;
      }
      window.setTimeout(tick, EVERY_MS);
    };
    void tick();
  }

  if (state === 'checking') {
    return (
      <div className="py-10 text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-line border-t-accent motion-reduce:animate-none"
          aria-hidden
        />
        <p className="mt-5 text-title font-bold text-ink">Checking your payment…</p>
        <p className="mt-2 text-body text-muted">
          Please don&apos;t close this page — it can take a few seconds.
        </p>
      </div>
    );
  }

  const route = `${booking?.pickup?.address ?? '—'} → ${booking?.drop?.address ?? '—'}`;
  const due = Math.max(0, (booking?.fareEstimate ?? 0) - amountPaid);

  if (state === 'paid') {
    return (
      <div className="py-4">
        <div className="text-center">
          {/* The one moment on this site where something has genuinely just happened: money
              has moved and a trip exists. The tick draws itself over four tenths of a
              second — and where motion is off it is simply there, because a confirmation
              must never depend on an animation having run. */}
          <div
            className="enter enter-1 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent-dark"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7">
              <path
                className="tick-draw"
                d="M5 12.5 10 17.5 19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="enter enter-2 mt-4 text-display font-black text-ink">
            Your booking is confirmed
          </h1>
          <p className="enter enter-3 mt-2 text-body text-muted">
            We have your payment. The driver&apos;s details reach you before the trip.
          </p>
        </div>

        <Card className="enter enter-4 mt-6 flex flex-col gap-3">
          {booking?.bookingNo ? (
            <Row label="Booking" value={`#${booking.bookingNo}`} />
          ) : null}
          <Row label="Route" value={route} />
          {booking?.vehicleType ? (
            <Row label="Vehicle" value={vehicleName(booking.vehicleType)} />
          ) : null}
          {booking?.scheduledAt ? (
            <Row label="Pickup" value={formatWhen(booking.scheduledAt)} />
          ) : null}
          <Row label="Paid now" value={money(amountPaid)} strong />
          <Row label="Due to driver" value={money(due)} />
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          {billUrl ? (
            <a
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 font-semibold text-surface hover:opacity-90"
              href={billUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download receipt (PDF)
            </a>
          ) : null}
          <Link
            className="inline-flex items-center justify-center rounded-full border border-line px-5 py-3 font-semibold text-ink hover:border-ink"
            href={`/booking/${bookingId}`}
          >
            View booking
          </Link>
          <Link
            className="inline-flex items-center justify-center px-2 py-3 font-semibold text-muted hover:text-ink"
            href="/"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <Card className="border-danger/30 bg-danger/5">
        <p className="text-title font-black text-danger">Payment not completed</p>
        <p className="mt-2 text-body text-ink-soft text-pretty">
          Your booking is not confirmed yet. If money was taken it comes back on its own
          within five working days — or you can try the payment again.
        </p>
        {booking?.bookingNo ? (
          <p className="mt-3 text-small text-muted">
            Booking #{booking.bookingNo} · {route}
          </p>
        ) : null}
      </Card>

      {error ? <p className="mt-4 text-small text-danger">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={payAgain} disabled={payAgainBusy}>
          {payAgainBusy ? 'Opening payment…' : 'Pay again'}
        </Button>
        <Button variant="ghost" onClick={checkAgain} disabled={payAgainBusy}>
          Check again
        </Button>
        <a
          className="inline-flex items-center justify-center px-2 py-3 font-semibold text-muted hover:text-ink"
          href={company.phoneHref}
        >
          Call {company.phone}
        </a>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-small text-muted">{label}</span>
      <span className={`text-body text-ink ${strong ? 'font-black' : 'font-semibold'}`}>
        {value}
      </span>
    </div>
  );
}
