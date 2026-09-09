'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';
import { track } from '@/lib/analytics';
import { isValidMobile } from '@/lib/phone';
import { useOtp } from '@/lib/useOtp';
import { QuoteTimer } from './QuoteTimer';
import { SignOutButton } from './site/SignOutButton';

/**
 * Name, phone, pickup address — and only then the OTP.
 *
 * The order is the point. Asking somebody to prove who they are before they have seen a
 * price loses most of them; by here they know the fare and have filled the form in, so the
 * code is a step they finish rather than a wall they meet.
 */
export function DetailsForm(props: {
  /**
   * Set when a customer is already signed in. Their number is already proved, so the name,
   * phone and code steps are theirs to skip — the booking is made against their account
   * either way.
   */
  signedInAs?: { name?: string; phone: string };
  quoteId: string;
  /** When the quoted price stops holding. Absent on an older link. */
  expiresAt?: string;
  tripType: 'one_way' | 'round_trip' | 'local';
  vehicleType: string;
  pickup: string;
  drop?: string;
  when: string;
  returnWhen?: string;
  hours?: number;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  // The same hook the sign-in page uses. Two copies of this drifted apart once already —
  // a resend cooldown on one screen and none on the other — and neither is visible to
  // whoever is testing the other.
  const { stage: otpStage, busy, error, setError, cooldown, sendCode, verifyCode } = useOtp();
  const [booking, setBooking] = useState(false);
  /** Set when the price has run out — by the clock, or by the backend refusing it. */
  const [expired, setExpired] = useState(false);
  const signedIn = Boolean(props.signedInAs);
  const stage: 'details' | 'otp' | 'verified' = booking
    ? 'verified'
    : otpStage === 'code'
      ? 'otp'
      : 'details';

  // Back to the vehicle step with the same trip, so a fresh price is one tap away.
  const rebookHref = `/booking?${new URLSearchParams({
    tripType: props.tripType,
    pickup: props.pickup,
    when: props.when,
    ...(props.drop ? { drop: props.drop } : {}),
    ...(props.returnWhen ? { returnWhen: props.returnWhen } : {}),
    ...(props.hours ? { hours: String(props.hours) } : {}),
  })}`;

  async function sendOtp() {
    if (!name.trim()) return setError('Please enter your name');
    if (!isValidMobile(phone)) return setError('Enter a 10-digit mobile number');
    const ok = await sendCode(phone);
    if (ok) {
      // The step where a stranger is first asked for something personal — historically the
      // biggest drop in any booking flow, and the reason the price is shown before it.
      track('otp_requested', { tripType: props.tripType });
    }
  }

  async function verify() {
    const signedIn = await verifyCode(phone, code, name);
    if (!signedIn) return;
    track('otp_verified', { tripType: props.tripType });
    setBooking(true);
    await book();
  }

  async function book(paymentMethod: 'cash' | 'online' = 'cash') {
    setBooking(true);
    setError('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          quoteId: props.quoteId,
          tripType: props.tripType,
          vehicleType: props.vehicleType,
          pickupCity: props.pickup,
          dropCity: props.drop,
          hours: props.hours,
          pickupAddress: address,
          scheduledAt: new Date(props.when).toISOString(),
          ...(props.returnWhen ? { returnAt: new Date(props.returnWhen).toISOString() } : {}),
          paymentMethod,
        }),
      });
      const body = await res.json();
      if (!body.ok) {
        // A price that has run out is not a failure to explain away — it has a fix, and
        // the fix is one click. Everything already typed stays where it is: sending
        // somebody back to an empty form to retype their address is how a booking is lost
        // over a thirty-minute clock.
        if (body.error?.code === 'QUOTE_EXPIRED' || body.error?.code === 'QUOTE_MISMATCH') {
          setExpired(true);
        }
        setError(body.error?.message ?? 'The booking did not go through');
        // Back to the form. Leaving "Creating your booking…" on screen next to an error
        // tells somebody their trip is being made when it is not.
        setBooking(false);
        return;
      }
      // Online pays on a hosted page the backend created — no card details, and no
      // payment SDK, ever touch this site.
      track('booking_created', {
        tripType: props.tripType,
        vehicleType: props.vehicleType,
        paymentMethod,
      });
      const link = body.data?.payment?.paymentUrl;
      if (link) {
        window.location.href = link;
        return;
      }
      router.push(`/booking/${body.data.booking._id ?? body.data.booking.id}`);
      return;
    } finally {
      // Only cleared on the failure paths: on success the page is navigating away, and
      // dropping back to the form for that instant shows a filled-in booking form to
      // somebody who has just booked.
    }
  }

  return (
    <div className="mt-6">
      <h1 className="font-display text-[2.25rem] leading-tight tracking-[-0.025em]">
        Your details
      </h1>

      <div className="mt-6 flex flex-col gap-4">
        {props.expiresAt && !expired ? (
          <QuoteTimer expiresAt={props.expiresAt} onExpired={() => setExpired(true)} />
        ) : null}

        {expired ? (
          <div className="rounded-xl bg-danger/10 px-4 py-3.5">
            <p className="text-[14px] font-semibold text-danger">This price has expired</p>
            <p className="mt-1.5 text-[14px] text-ink-soft">
              Nothing you have typed is lost. Check the fare again and we will bring you straight
              back.
            </p>
            <Link className="mt-2 inline-block text-[14px] font-bold text-accent" href={rebookHref}>
              Check the fare again
            </Link>
          </div>
        ) : null}

        {props.signedInAs ? (
          <div className="rounded-xl border border-line bg-surface-alt px-4 py-3.5">
            <p className="text-[14px] text-ink-soft">
              Booking as <strong>{props.signedInAs.name || props.signedInAs.phone}</strong>
              {props.signedInAs.name ? (
                <span className="text-muted"> · {props.signedInAs.phone}</span>
              ) : null}
            </p>
            {/* A shared phone is the ordinary case here, not the exception. */}
            <p className="mt-1 text-[13px] text-muted">
              Not you? <SignOutButton className="font-semibold text-accent hover:underline" />
            </p>
          </div>
        ) : null}

        {/* A signed-in customer has already proved this number. Asking for it again at
            the step where people are most likely to leave is friction for nothing. */}
        {!signedIn ? (
          <>
            <Field label="Name" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={stage !== 'details'}
              />
            </Field>
            <Field label="Mobile number" htmlFor="phone" hint="We will text a code to this number">
              <Input
                id="phone"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                disabled={stage !== 'details'}
              />
            </Field>
          </>
        ) : null}

        <Field label="Pickup address" htmlFor="address" hint="House, hotel or landmark">
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>

        {stage === 'otp' ? (
          <Field
            label="OTP"
            htmlFor="code"
            hint={cooldown > 0 ? `Resend in ${cooldown}s` : 'You can resend the code'}
          >
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        {signedIn ? (
          // No code to send: the number on this account is already verified, and the
          // booking is made against it.
          <Button onClick={() => book()} disabled={booking || expired}>
            {booking ? 'Booking…' : 'Book this cab'}
          </Button>
        ) : stage === 'details' ? (
          <Button onClick={sendOtp} disabled={busy || expired}>
            {busy ? 'Sending…' : 'Send code'}
          </Button>
        ) : stage === 'otp' ? (
          <div className="flex gap-3">
            <Button onClick={verify} disabled={busy || expired || code.length < 4}>
              {busy ? 'Booking…' : 'Verify and book'}
            </Button>
            <Button variant="ghost" onClick={sendOtp} disabled={busy || cooldown > 0}>
              Resend
            </Button>
          </div>
        ) : (
          <p className="text-muted">Creating your booking…</p>
        )}
      </div>

      <p className="mt-6 text-sm text-faint">
        This is a cash booking — you pay the driver at the end of the trip. Toll, parking and state
        taxes are extra.
      </p>
    </div>
  );
}
