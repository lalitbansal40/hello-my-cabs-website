'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

/**
 * Name, phone, pickup address — and only then the OTP.
 *
 * The order is the point. Asking somebody to prove who they are before they have seen a
 * price loses most of them; by here they know the fare and have filled the form in, so the
 * code is a step they finish rather than a wall they meet.
 */
export function DetailsForm(props: {
  quoteId: string;
  tripType: 'one_way' | 'round_trip' | 'local';
  vehicleType: string;
  pickup: string;
  drop?: string;
  when: string;
  hours?: number;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'details' | 'otp' | 'verified'>('details');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  async function sendOtp() {
    if (!name.trim()) return setError('Please enter your name');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a 10-digit mobile number');
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const body = await res.json();
      if (!body.ok) {
        // The OTP endpoint allows 12 requests in ten minutes. Say so plainly instead of
        // letting somebody tap a dead button.
        setError(body.error?.message ?? 'We could not send the code');
        return;
      }
      setStage('otp');
      setCooldown(30);
      const tick = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) clearInterval(tick);
          return c - 1;
        });
      }, 1000);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone, code, name }),
      });
      const body = await res.json();
      if (!body.ok) {
        setError(body.error?.message ?? 'That code is not right');
        return;
      }
      setStage('verified');
      await book();
    } finally {
      setBusy(false);
    }
  }

  async function book(paymentMethod: 'cash' | 'online' = 'cash') {
    setBusy(true);
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
          paymentMethod,
        }),
      });
      const body = await res.json();
      if (!body.ok) {
        setError(body.error?.message ?? 'The booking did not go through');
        return;
      }
      // Online pays on a hosted page the backend created — no card details, and no
      // payment SDK, ever touch this site.
      const link = body.data?.payment?.paymentUrl;
      if (link) {
        window.location.href = link;
        return;
      }
      router.push(`/booking/${body.data.booking._id ?? body.data.booking.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <h1 className="font-display text-[2.25rem] leading-tight tracking-[-0.025em]">Your details</h1>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="Name" htmlFor="name">
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={stage !== 'details'} />
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
        <Field label="Pickup address" htmlFor="address" hint="House, hotel or landmark">
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>

        {stage === 'otp' ? (
          <Field label="OTP" htmlFor="code" hint={cooldown > 0 ? `Resend in ${cooldown}s` : 'You can resend the code'}>
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

        {stage === 'details' ? (
          <Button onClick={sendOtp} disabled={busy}>
            {busy ? 'Sending…' : 'Send code'}
          </Button>
        ) : stage === 'otp' ? (
          <div className="flex gap-3">
            <Button onClick={verify} disabled={busy || code.length < 4}>
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
        This is a cash booking — you pay the driver at the end of the trip. Toll, parking and
        state taxes are extra.
      </p>
    </div>
  );
}
