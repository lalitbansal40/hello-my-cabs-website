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
    if (!name.trim()) return setError('Naam likhein');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('10 digit ka mobile number likhein');
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
        setError(body.error?.message ?? 'OTP bhejne me dikkat aayi');
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
        setError(body.error?.message ?? 'Code galat hai');
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
        setError(body.error?.message ?? 'Booking nahi ho paayi');
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
      <h1 className="text-2xl font-bold tracking-tight">Aapki details</h1>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="Naam" htmlFor="name">
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={stage !== 'details'} />
        </Field>
        <Field label="Mobile number" htmlFor="phone" hint="Isi par OTP aayega">
          <Input
            id="phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            disabled={stage !== 'details'}
          />
        </Field>
        <Field label="Pickup ka pata" htmlFor="address" hint="Ghar / hotel / landmark">
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>

        {stage === 'otp' ? (
          <Field label="OTP" htmlFor="code" hint={cooldown > 0 ? `Dobara bhejein ${cooldown}s baad` : 'Dobara bhej sakte hain'}>
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
            {busy ? 'Ruko…' : 'OTP bhejein'}
          </Button>
        ) : stage === 'otp' ? (
          <div className="flex gap-3">
            <Button onClick={verify} disabled={busy || code.length < 4}>
              {busy ? 'Ruko…' : 'Verify karke book karein'}
            </Button>
            <Button variant="ghost" onClick={sendOtp} disabled={busy || cooldown > 0}>
              Dobara bhejein
            </Button>
          </div>
        ) : (
          <p className="text-muted">Booking ban rahi hai…</p>
        )}
      </div>

      <p className="mt-6 text-sm text-faint">
        Abhi cash booking ho rahi hai — paise driver ko dene hain. Toll, parking aur state
        tax alag.
      </p>
    </div>
  );
}
