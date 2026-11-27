'use client';

import { useMemo, useState } from 'react';
import { Input } from '../ui/Field';
import { isValidMobile, toApiPhone, toLocalPhone } from '@/lib/phone';
import { track } from '@/lib/analytics';
import { company } from '@/lib/company';
import type { Transfer, TransferCar } from '@/lib/api';

/**
 * Ask for a fixed transfer — Jaipur Airport ↔ an area of the city, Reengus ↔ Khatu Shyam Ji
 * (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Steps 5.1, 5.3).
 *
 * There is no online payment for transfers yet, so this is the call-back request the site
 * already has (`/api/booking/lead`, stage `callback`): the owner is alerted, the trip rides
 * along on the lead, and we call back to confirm. The fare shown is the one the backend's
 * price list gives for the chosen area and car — nothing is computed here but the lookup.
 */
const CARS: { key: TransferCar; label: string }[] = [
  { key: 'hatchback', label: 'Hatchback · 4 seats' },
  { key: 'dzire', label: 'Dzire · 4 seats' },
  { key: 'ertiga', label: 'Ertiga · 6 seats' },
  { key: 'crysta', label: 'Innova Crysta · 6 seats' },
];

export function TransferForm({
  transfer,
  otherCity,
  otherLabel,
}: {
  transfer: Transfer;
  /** City key of the far end — JAIPUR for the airport, KHATU_SHYAM_JI for Reengus. */
  otherCity: string;
  otherLabel: string;
}) {
  const [toFixedEnd, setToFixedEnd] = useState(false);
  const [area, setArea] = useState(transfer.localities.length === 1 ? transfer.localities[0].name : '');
  const [car, setCar] = useState<TransferCar>('dzire');
  const [when, setWhen] = useState('');
  const [flight, setFlight] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const locality = transfer.localities.find((l) => l.name === area);
  const fare = useMemo(() => {
    if (!locality) return null;
    return transfer.zones.find((z) => z.zone === locality.zone)?.fares[car] ?? null;
  }, [locality, car, transfer.zones]);
  const isAirport = transfer.fromCity.endsWith('_AIRPORT');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const local = toLocalPhone(phone);
    if (!isValidMobile(local)) {
      setError('Please enter a 10-digit mobile number.');
      return;
    }
    setBusy(true);
    const details = [
      locality ? `${locality.name} (zone ${locality.zone}, ${locality.km} km)` : area ? `${area} (area not listed)` : '',
      flight.trim() ? `Flight ${flight.trim().slice(0, 12)}` : '',
      `${toFixedEnd ? 'To' : 'From'} ${transfer.from}`,
    ]
      .filter(Boolean)
      .join(' · ');
    await fetch('/api/booking/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        phone: toApiPhone(local),
        ...(name.trim() ? { name: name.trim().slice(0, 60) } : {}),
        stage: 'callback',
        tripType: 'one_way',
        pickup: toFixedEnd ? otherCity : transfer.fromCity,
        drop: toFixedEnd ? transfer.fromCity : otherCity,
        ...(when ? { when } : {}),
        vehicleType: car,
        ...(fare ? { fareRupees: fare } : {}),
        pickupAddress: details.slice(0, 200),
        pagePath: location.pathname,
      }),
    }).catch(() => {});
    track('callback_requested', { tripType: 'one_way', vehicleType: car });
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-3xl border border-hmc-line bg-hmc-card p-6">
        <p className="font-display text-title font-bold">Request received</p>
        <p className="mt-2 text-body text-hmc-secondary">
          We will call you shortly to confirm the car and the fare
          {fare ? ` (₹${fare.toLocaleString('en-IN')})` : ''}. In a hurry? Call{' '}
          <a href={company.phoneHref} className="font-semibold text-hmc-link">
            {company.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-hmc-line bg-hmc-card p-5 sm:p-6">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Direction</legend>
        {[false, true].map((to) => (
          <button
            key={String(to)}
            type="button"
            aria-pressed={toFixedEnd === to}
            onClick={() => setToFixedEnd(to)}
            className={`min-h-11 rounded-full border px-4 text-small font-semibold ${
              toFixedEnd === to ? 'border-hmc-focus bg-hmc-primary text-white' : 'border-hmc-line'
            }`}
          >
            {to ? `To ${transfer.from}` : `From ${transfer.from}`}
          </button>
        ))}
      </fieldset>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-small text-hmc-secondary">
          {toFixedEnd ? `Pickup area in ${otherLabel}` : `Drop area in ${otherLabel}`}
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="min-h-12 rounded-xl border border-hmc-control bg-hmc-page px-3 text-body"
          >
            {transfer.localities.length > 1 ? <option value="">Choose the area</option> : null}
            {transfer.localities.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
            {transfer.localities.length > 1 ? <option value="Other">Another area</option> : null}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-small text-hmc-secondary">
          Car
          <select
            value={car}
            onChange={(e) => setCar(e.target.value as TransferCar)}
            className="min-h-12 rounded-xl border border-hmc-control bg-hmc-page px-3 text-body"
          >
            {CARS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-small text-hmc-secondary">
          Date and time
          <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        {isAirport ? (
          <label className="flex flex-col gap-1.5 text-small text-hmc-secondary">
            Flight number (optional)
            <Input value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="For example 6E 2134" />
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5 text-small text-hmc-secondary">
          Your name (optional)
          <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="flex flex-col gap-1.5 text-small text-hmc-secondary">
          Mobile number
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
          />
        </label>
      </div>

      <p data-transfer-fare className="mt-5 text-body">
        {fare ? (
          <>
            Fixed fare <span className="font-display text-title font-black">₹{fare.toLocaleString('en-IN')}</span>{' '}
            <span className="text-small text-hmc-secondary">({transfer.includes.join(', ')} included)</span>
          </>
        ) : area === 'Other' ? (
          'We will tell you the fare for your area on the call.'
        ) : (
          'Choose the area to see the fixed fare.'
        )}
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-small font-semibold text-hmc-link">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-hmc-band px-6 font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Sending…' : 'Request a call back to book'}
      </button>
    </form>
  );
}
