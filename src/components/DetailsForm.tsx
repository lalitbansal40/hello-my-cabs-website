'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PayOptions } from './PayOptions';
import { Button } from './ui/Button';
import { Field, Input, PhoneInput } from './ui/Field';
import { track } from '@/lib/analytics';
import { isValidMobile } from '@/lib/phone';
import { istInstant } from '@/lib/when';
import { QuoteTimer } from './QuoteTimer';
import { SignOutButton } from './site/SignOutButton';
import { Icon } from './site/Icons';

/** "₹1,234" — grouped the Indian way, the same as every other price on the site. */
const money = (rupees: number) => `₹${Math.round(rupees).toLocaleString('en-IN')}`;

/**
 * A mobile number, and the booking is made. No OTP (owner's decision, 2 Oct 2026).
 *
 * The code was the step where people left: by here they had seen the price and chosen the
 * car, and were then asked to wait for an SMS. Now the number is all that is required —
 * the name and the pickup address help the desk and the driver, but are optional. A number
 * we do not know becomes an account, and its owner sees the booking later by signing in
 * with that number and a code. The page that follows opens with a token for this one
 * booking, not a session (see /api/book).
 *
 * Signed in (any account — drivers and admins book too), nothing is asked but the address.
 */
export function DetailsForm(props: {
  /**
   * Set when somebody is already signed in — any account. Their number is already proved,
   * so the name and phone are not asked; the booking is made against their account.
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
  /** Stops on the way — they go to the booking as a note for the desk (lib/stops.ts). */
  stops?: string[];
  hours?: number;
  /**
   * What the trip costs and the least that can be paid online now (₹500 up to ₹2,500, else
   * 20% — 6 Oct 2026) — both straight from the quote the backend priced. Absent on an older
   * link, and then the booking cannot be made from here: a booking must never show a number
   * this page worked out for itself.
   */
  totalRupees?: number;
  advanceRupees?: number;
  /**
   * GST on the fare (5%, on top — 10 Oct 2026), from the same quote. All of it is paid with
   * the online payment, whatever share of the fare is chosen; the driver collects fare only.
   * Absent (a link from before, or a backend without it): no tax line, nothing added.
   */
  gstRupees?: number;
  gstPercent?: number;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  /**
   * How much is paid now (6 Oct 2026 — the website has no cash option): the minimum (the
   * default), an amount of the customer's own between it and the fare, or the full fare.
   */
  const [payChoice, setPayChoice] = useState<'minimum' | 'custom' | 'full'>('minimum');
  /** The custom amount as typed — whole rupees. */
  const [customText, setCustomText] = useState('');
  /**
   * Booked online: every way to pay — a UPI app, our QR, card — is shown here, in place of
   * the form (4 Oct 2026), instead of the page leaving for Razorpay.
   */
  const [payFor, setPayFor] = useState<{ id: string; guest?: string } | null>(null);
  /** The last enquiry saved, so a blur on every tab-away does not save it again. */
  const savedLead = useRef('');
  // Every number here comes from the quote the backend priced. Nothing is worked out on
  // this page: a fare shown and a fare charged have to be the same number.
  const minimum = props.advanceRupees ?? 0;
  const total = props.totalRupees ?? 0;
  const canPayOnline = minimum > 0 && total > 0;
  const custom = /^\d+$/.test(customText.trim()) ? Number(customText.trim()) : NaN;
  /** Why the custom amount cannot be paid, or '' when it can (or is not chosen). */
  const customProblem =
    payChoice !== 'custom'
      ? ''
      : !customText.trim()
        ? `Enter an amount between ${money(minimum)} and ${money(total)}`
        : Number.isNaN(custom)
          ? 'Whole rupees only — no paise, commas or symbols'
          : custom < minimum
            ? `At least ${money(minimum)}`
            : custom > total
              ? `At most ${money(total)} — the full fare`
              : '';
  /** What is paid now, and what is left for the driver — both from the backend's quote. */
  const payNow =
    payChoice === 'full' ? total : payChoice === 'custom' && !customProblem ? custom : minimum;
  const payingFull = payNow === total;
  const leftForDriver = Math.max(0, total - payNow);
  const gst = props.gstRupees && props.gstRupees > 0 ? props.gstRupees : 0;
  /** " + ₹160 GST" after an amount paid now — the tax rides with every choice. */
  const plusGst = gst ? ` + ${money(gst)} GST` : '';
  const bookLabel = !canPayOnline
    ? 'Book this cab'
    : customProblem
      ? 'Enter the amount to pay'
      : `Book and pay ${money(payNow + gst)}`;
  /** Set when the price has run out — by the clock, or by the backend refusing it. */
  const [expired, setExpired] = useState(false);
  const signedIn = Boolean(props.signedInAs);

  // Back to the vehicle step with the same trip, so a fresh price is one tap away.
  const rebookHref = `/booking?${new URLSearchParams({
    tripType: props.tripType,
    pickup: props.pickup,
    when: props.when,
    ...(props.drop ? { drop: props.drop } : {}),
    ...(props.returnWhen ? { returnWhen: props.returnWhen } : {}),
    // An expired price must not cost the stops: they come back with the fresh quote.
    ...(props.stops?.length ? { stops: props.stops.join('|') } : {}),
    ...(props.hours ? { hours: String(props.hours) } : {}),
  })}`;

  /**
   * Save the enquiry, quietly.
   *
   * A person who types their number, sees a price and leaves is the warmest lead this
   * business has. Saved the moment the number is whole, again when the page is left (closed,
   * another app, the screen locked — none of which fires a blur), and once more just before
   * the booking is placed, with the name and address.
   *
   * The trip travels with it (10 Oct 2026): the quote behind this page dies in thirty minutes,
   * and a lead saved after that used to arrive with no route at all.
   *
   * Never awaited and never allowed to fail out loud: this is a follow-up, not the booking,
   * and nobody's trip may be held up by it.
   */
  // 'otp_verified' is the backend's name for "about to book" — the stage names predate the
  // booking losing its OTP and are kept so the desk's lead list reads the same.
  function leadBody(stage: 'phone_typed' | 'otp_verified') {
    return JSON.stringify({
      phone,
      name: name.trim() || props.signedInAs?.name,
      quoteId: props.quoteId,
      pickupAddress: address.trim(),
      stage,
      tripType: props.tripType,
      pickup: props.pickup,
      ...(props.drop ? { drop: props.drop } : {}),
      when: props.when,
      ...(props.returnWhen ? { returnWhen: props.returnWhen } : {}),
      ...(props.hours ? { hours: props.hours } : {}),
      vehicleType: props.vehicleType,
      ...(total > 0 ? { fareRupees: Math.round(total) } : {}),
    });
  }

  function saveLead(stage: 'phone_typed' | 'otp_verified') {
    if (!isValidMobile(phone)) return;
    // One save per number per stage — the blur fires on every tab away from the field.
    const key = `${phone}:${stage}`;
    if (savedLead.current === key) return;
    savedLead.current = key;
    void fetch('/api/booking/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: leadBody(stage),
      // Carries on if the page goes away mid-request.
      keepalive: true,
    }).catch(() => {});
  }

  // The number is the whole lead: saved the moment it is complete, not when the field loses
  // focus — on a phone, people leave without ever tapping anywhere else.
  useEffect(() => {
    if (!signedIn && isValidMobile(phone)) saveLead('phone_typed');
    // saveLead reads the latest render's values; the number is the only trigger wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  // Leaving the page — closed, switched away, locked — sends what was typed, with whatever
  // name and address were added since. A beacon is the one request a closing page still sends.
  const lastBeacon = useRef('');
  const bookedRef = useRef(false);
  useEffect(() => {
    if (signedIn) return;
    const onLeave = () => {
      if (bookedRef.current || !isValidMobile(phone)) return;
      const body = leadBody('phone_typed');
      if (lastBeacon.current === body) return;
      lastBeacon.current = body;
      const blob = new Blob([body], { type: 'application/json' });
      if (!navigator.sendBeacon?.('/api/booking/lead', blob)) {
        void fetch('/api/booking/lead', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onLeave();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onLeave);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, name, address, signedIn]);

  async function book() {
    if (!signedIn && !isValidMobile(phone)) {
      setError('Enter a 10-digit mobile number');
      return;
    }
    if (!canPayOnline) {
      setError('We could not load the price — please check the fare again');
      return;
    }
    if (customProblem) {
      setError(customProblem);
      return;
    }
    const paymentMethod = 'online';
    // Saved BEFORE the booking call, or a payment abandoned on Razorpay's page leaves
    // nothing behind. (A booking that goes through closes it as converted.)
    saveLead('otp_verified');
    // Booking now: leaving for the payment app is not an abandoned enquiry.
    bookedRef.current = true;
    setBooking(true);
    setError('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          // Without a session the number is who the booking is for; with one, the session.
          ...(signedIn ? {} : { phone, ...(name.trim() ? { name: name.trim() } : {}) }),
          quoteId: props.quoteId,
          tripType: props.tripType,
          vehicleType: props.vehicleType,
          pickupCity: props.pickup,
          dropCity: props.drop,
          hours: props.hours,
          pickupAddress: address,
          // Read as India, the same way the quote read them — the booking has to land on
          // the same number of days as the price it is redeeming.
          scheduledAt: istInstant(props.when),
          ...(props.returnWhen ? { returnAt: istInstant(props.returnWhen) } : {}),
          ...(props.stops?.length ? { stops: props.stops } : {}),
          paymentMethod,
          // The amount this page shows is the amount sent: the whole fare as `payFull`,
          // anything else as `payAmountRupees` — the minimum too, so a price that moved
          // since the quote is refused by the backend rather than charged differently.
          // The driver is paid what was paid above the minimum at completion.
          ...(payingFull ? { payFull: true } : { payAmountRupees: payNow }),
          // Only the website says this, and only a booking that says it gets Razorpay's
          // callback back to this site. The app returns to the app instead.
          client: 'web',
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
        // Not booked after all: leaving now is an enquiry again.
        bookedRef.current = false;
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
      if (body.data?.payment?.paymentUrl) {
        // Online: every way to pay, here on this page — a UPI app, the QR, or card.
        setPayFor({
          id: body.data.booking._id ?? body.data.booking.id,
          guest: body.data.guestToken as string | undefined,
        });
        setBooking(false);
        return;
      }
      const id = body.data.booking._id ?? body.data.booking.id;
      // Booked without a session: the page opens with this booking's own token.
      const guest = body.data.guestToken as string | undefined;
      router.push(guest ? `/booking/${id}?g=${encodeURIComponent(guest)}` : `/booking/${id}`);
      return;
    } finally {
      // Only cleared on the failure paths: on success the page is navigating away, and
      // dropping back to the form for that instant shows a filled-in booking form to
      // somebody who has just booked.
    }
  }

  if (payFor) {
    const bookingHref = payFor.guest
      ? `/booking/${payFor.id}?g=${encodeURIComponent(payFor.guest)}`
      : `/booking/${payFor.id}`;
    return (
      <div className="mt-6 flex flex-col gap-5">
        <div className="rounded-xl bg-success/10 px-4 py-3.5">
          <p className="font-semibold text-small text-ink">Your booking is made</p>
          <p className="mt-1.5 text-small text-ink-soft">
            {payingFull
              ? `Pay ${money(payNow)} to confirm it — the whole fare, nothing to the driver.`
              : `Pay ${money(payNow)} to confirm it. ${money(leftForDriver)} goes to the driver at the end of the trip.`}
          </p>
        </div>
        <PayOptions
          bookingId={payFor.id}
          guestToken={payFor.guest}
          autoShow
          onPaid={() => router.push(bookingHref)}
        />
        <a
          className="inline-flex min-h-11 items-center gap-1.5 self-center text-small font-semibold text-accent hover:underline"
          href={bookingHref}
        >
          See the booking
          <Icon.arrow className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* No heading here. The page shell already says "Your details" as its h1; this
          said it again, as a second h1, directly underneath. */}
      <div className="flex flex-col gap-4">
        {props.expiresAt && !expired ? (
          <QuoteTimer expiresAt={props.expiresAt} onExpired={() => setExpired(true)} />
        ) : null}

        {expired ? (
          <div className="rounded-xl bg-danger/10 px-4 py-3.5">
            <p className="font-semibold text-small text-danger">This price has expired</p>
            <p className="mt-1.5 text-small text-ink-soft">
              Nothing you have typed is lost. Check the fare again and we will bring you straight
              back.
            </p>
            <Link
              className="mt-2 text-small inline-block font-bold text-accent inline-flex min-h-11 items-center"
              href={rebookHref}
            >
              Check the fare again
            </Link>
          </div>
        ) : null}

        {props.signedInAs ? (
          <div className="rounded-xl border border-line bg-surface-alt px-4 py-3.5">
            <p className="text-ink-soft text-small">
              Booking as <strong>{props.signedInAs.name || props.signedInAs.phone}</strong>
              {props.signedInAs.name ? (
                <span className="text-muted"> · {props.signedInAs.phone}</span>
              ) : null}
            </p>
            {/* A shared phone is the ordinary case here, not the exception. */}
            <p className="mt-1 text-small text-muted">
              Not you? <SignOutButton className="font-semibold text-accent hover:underline" />
            </p>
          </div>
        ) : null}

        {/* Signed in, the account is who the booking is for — nothing to ask. */}
        {!signedIn ? (
          <>
            <Field
              label="Mobile number"
              htmlFor="phone"
              hint="Your booking details come to this number. No OTP needed."
            >
              <PhoneInput
                id="phone"
                // The one field that is needed — the cursor is in it when the page opens.
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                // Saved the moment it is complete (the effect above); the blur stays as a
                // second chance for a browser that skips the effect's timing.
                onBlur={() => saveLead('phone_typed')}
                disabled={booking}
              />
            </Field>
            <Field label="Name (optional)" htmlFor="name">
              <Input
                id="name"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                disabled={booking}
              />
            </Field>
          </>
        ) : null}

        <Field label="Pickup address (optional)" htmlFor="address" hint="House, hotel or landmark">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={booking}
          />
        </Field>

        {/* How much now — the website has no cash option (6 Oct 2026). Every number is the
            quote's: without it this page would have to work the minimum out for itself, and
            a price shown here must always be the price that is charged. */}
        {canPayOnline ? (
          <fieldset className="rounded-xl border border-line p-4">
            <legend className="px-1 text-small font-bold text-ink">How much to pay now</legend>
            {gst ? (
              // The fare, its tax and the total — the three numbers the bill will carry.
              <dl className="mb-3 flex flex-wrap gap-x-5 gap-y-1 rounded-lg bg-surface-alt px-3 py-2.5 text-small">
                <div className="flex gap-1.5">
                  <dt className="text-muted">Fare</dt>
                  <dd className="font-semibold tabular-nums text-ink">{money(total)}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-muted">GST ({props.gstPercent ?? 5}%)</dt>
                  <dd className="font-semibold tabular-nums text-ink">{money(gst)}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-muted">Total</dt>
                  <dd className="font-bold tabular-nums text-ink">{money(total + gst)}</dd>
                </div>
              </dl>
            ) : null}
            <label className="flex cursor-pointer items-start gap-3 py-1.5">
              <input
                type="radio"
                name="payChoice"
                className="mt-1"
                checked={payChoice === 'minimum'}
                onChange={() => setPayChoice('minimum')}
                disabled={booking}
              />
              <span className="text-body">
                <span className="font-semibold text-ink">
                  Minimum {money(minimum)}
                  {plusGst}
                </span>
                <span className="block text-small text-muted">
                  {money(Math.max(0, total - minimum))} to the driver at the end of the trip
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 py-1.5">
              <input
                type="radio"
                name="payChoice"
                className="mt-1"
                checked={payChoice === 'custom'}
                onChange={() => setPayChoice('custom')}
                disabled={booking}
              />
              <span className="text-body">
                <span className="font-semibold text-ink">Choose an amount</span>
                <span className="block text-small text-muted">
                  Anything from {money(minimum)} to {money(total)}
                  {gst ? `, plus ${money(gst)} GST` : ''}
                </span>
              </span>
            </label>
            {payChoice === 'custom' ? (
              <div className="ml-7 mt-1 mb-2">
                <label htmlFor="payCustom" className="sr-only">
                  Amount to pay now, in rupees
                </label>
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-body font-medium text-faint"
                  >
                    ₹
                  </span>
                  <Input
                    id="payCustom"
                    inputMode="numeric"
                    autoComplete="off"
                    className="pl-9 tabular-nums"
                    // The minimum as the hint of a starting point, never as the value.
                    placeholder={String(minimum)}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.replace(/[^\d]/g, '').slice(0, 7))}
                    aria-invalid={Boolean(customText && customProblem)}
                    aria-describedby="payCustomNote"
                    disabled={booking}
                  />
                </div>
                <p
                  id="payCustomNote"
                  aria-live="polite"
                  className={`mt-1.5 text-small ${customText && customProblem ? 'text-danger' : 'text-muted'}`}
                >
                  {customProblem
                    ? customProblem
                    : `${money(leftForDriver)} to the driver at the end of the trip`}
                </p>
              </div>
            ) : null}
            <label className="flex cursor-pointer items-start gap-3 py-1.5">
              <input
                type="radio"
                name="payChoice"
                className="mt-1"
                checked={payChoice === 'full'}
                onChange={() => setPayChoice('full')}
                disabled={booking}
              />
              <span className="text-body">
                <span className="font-semibold text-ink">
                  Full fare {money(total)}
                  {plusGst}
                </span>
                <span className="block text-small text-muted">Nothing to pay the driver</span>
              </span>
            </label>
            <p className="mt-2 text-small text-faint">
              The minimum is ₹500 for a fare up to ₹2,500, and 20% above that.
              {gst
                ? ` The ${props.gstPercent ?? 5}% GST on the whole fare is paid now, with it — the driver collects the fare only.`
                : ''}{' '}
              Any UPI app, a QR or a card — on the next screen.
            </p>
          </fieldset>
        ) : (
          // An older link without the price in it: no way to say what would be charged.
          <div className="rounded-xl bg-danger/10 px-4 py-3.5">
            <p className="font-semibold text-small text-ink">We could not load the price</p>
            <Link
              className="mt-1 text-small inline-flex min-h-11 items-center font-bold text-accent"
              href={rebookHref}
            >
              Check the fare again
            </Link>
          </div>
        )}

        {error ? <p className="text-small text-danger">{error}</p> : null}

        {/* On a phone the button stays in reach while the form scrolls under it (sticky
            within the form, so it settles into its place at the end). */}
        <div className="max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-5 max-sm:bg-surface/95 max-sm:px-5 max-sm:py-3 max-sm:backdrop-blur">
          <Button
            className="w-full"
            onClick={() => book()}
            disabled={booking || expired || !canPayOnline || Boolean(customProblem)}
          >
            {booking ? 'Booking…' : bookLabel}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-small text-faint">
        We may message you about this enquiry. Reply STOP to opt out.
      </p>

      <p className="mt-4 text-small text-faint">
        {canPayOnline
          ? payingFull
            ? `${money(total + gst)}${gst ? ' with GST' : ''} is taken now and nothing is left to pay the driver.`
            : `${money(payNow + gst)}${gst ? ' with GST' : ''} is taken now and ${money(leftForDriver)} goes to the driver at the end of the trip.`
          : null}{' '}
        Toll, parking and state taxes are extra.
      </p>
    </div>
  );
}
