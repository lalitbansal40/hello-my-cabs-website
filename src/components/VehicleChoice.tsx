'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { LocalPackage, OnewayFare, RoundtripFare, Vehicle } from '@/lib/api';
import { Button } from './ui/Button';
import { VehicleArt } from './site/VehicleArt';
import { Card } from './ui/Card';
import { track } from '@/lib/analytics';
import { istInstant } from '@/lib/when';

type Fare = OnewayFare | RoundtripFare | LocalPackage[];

interface Choice {
  key: string;
  label: string;
  rupees: number;
  seats?: number;
  note?: string;
}

/**
 * Pick a vehicle, and lock the price in.
 *
 * The list is filtered by what each vehicle is actually allowed to do. A Tempo Traveller
 * cannot be booked one-way, and offering it there would walk somebody through the whole
 * funnel into a booking the server refuses at the last step.
 */
export function VehicleChoice({
  tripType,
  pickup,
  drop,
  when,
  returnWhen,
  stops = [],
  hours,
  vehicles,
  fare,
  preferred,
}: {
  tripType: 'one_way' | 'round_trip' | 'local';
  pickup: string;
  drop?: string;
  when: string;
  returnWhen?: string;
  /** Stops on the way — carried to the next step, never sent with the quote (not priced). */
  stops?: string[];
  hours?: number;
  vehicles: { intercity: Vehicle[]; roundTripOnly: Vehicle[] };
  fare: Fare;
  /**
   * The vehicle the visitor already chose on the page they came from (a route-by-car
   * page). It is shown first and marked; nothing is chosen for them — they still pick.
   */
  preferred?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const allowed = [...vehicles.intercity, ...vehicles.roundTripOnly].filter((v) =>
    v.tripTypes.includes(tripType),
  );
  const seatsOf = (key: string) => allowed.find((v) => v.key === key)?.seats;

  let choices: Choice[] = [];
  if (Array.isArray(fare)) {
    choices = fare.map((p) => ({
      key: p.vehicle,
      label: p.label,
      rupees: p.examples.find((e) => e.hours === (hours ?? 8))?.fareRupees ?? p.baseFareRupees,
      seats: seatsOf(p.vehicle),
      note: `${p.includedHours} h / ${p.includedKm} km included`,
    }));
  } else {
    // One-way carries `total` (fare + any airport surcharge); round-trip carries only
    // `fare`. Show the one the customer actually pays.
    const rows = fare.vehicles as Array<{
      key: string;
      label: string;
      fare: number;
      total?: number;
    }>;
    choices = rows
      .filter((v) => allowed.some((a) => a.key === v.key))
      .map((v) => ({
        key: v.key,
        label: v.label,
        rupees: v.total ?? v.fare,
        seats: seatsOf(v.key),
        // The distance is a fact about the journey, not about the car, and printing it on
        // all eight cards said the same thing eight times. It is in the heading now. A
        // hill route still says so here, because that one does change the price.
        note:
          'hill' in fare
            ? [
                // A stay of more than a day says what it is being charged for.
                (fare.days ?? 1) > 1 ? `${fare.days} days · ${fare.billedKm} km billed` : null,
                fare.hill
                  ? (fare.days ?? 1) > 1
                    ? 'hill route'
                    : `${fare.billedKm} km · hill route`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || undefined
            : undefined,
      }));
  }

  async function choose(vehicleType: string) {
    setBusy(vehicleType);
    setError('');
    // Two events, not one: choosing a vehicle and successfully getting a price for it are
    // different things, and the gap between the counts is exactly the failure worth
    // knowing about.
    track('vehicle_select', { tripType, vehicleType, route: drop ? `${pickup}-${drop}` : pickup });
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tripType,
          vehicleType,
          ...(tripType === 'local'
            ? { hours: hours ?? 8 }
            : { pickupCity: pickup, dropCity: drop }),
          // A round trip is billed by the days the car is out, so the quote needs both ends.
          ...(tripType === 'round_trip' && returnWhen
            ? { pickupAt: istInstant(when), returnAt: istInstant(returnWhen) }
            : {}),
        }),
      });
      const body = await res.json();
      if (!body.ok) {
        // The server's wording is the right wording — a second copy here drifts from it.
        setError(body.error?.message ?? 'We could not price that just now');
        return;
      }
      track('quote_created', { tripType, vehicleType, route: drop ? `${pickup}-${drop}` : pickup });
      const p = new URLSearchParams({
        quoteId: body.data.quoteId,
        tripType,
        pickup,
        when,
        vehicleType,
      });
      // The name the customer was shown, carried forward so the next step can name the car
      // rather than print the internal key at them. A label is not a price: nothing is
      // decided by it, so the URL is a fine place for it.
      const label = choices.find((c) => c.key === vehicleType)?.label;
      if (label) p.set('vehicleLabel', label);
      // The quote holds for thirty minutes and the backend says exactly when it stops. That
      // figure was being thrown away here, so the next step had no idea how long the price
      // it was showing would last — and the first anyone learned of it was a booking
      // refused at the last tap.
      if (body.data.expiresAt) p.set('expiresAt', String(body.data.expiresAt));
      if (drop) p.set('drop', drop);
      // The return leg has to survive every step it passes through — collected once at the
      // widget and dropped here would be a question asked for nothing.
      if (returnWhen) p.set('returnWhen', returnWhen);
      // Stops too, for the same reason — they end up on the booking, for the desk.
      if (stops.length) p.set('stops', stops.join('|'));
      // What the price was made of, for the summary on the next step — only worth saying
      // when it is more than a day.
      if (body.data.days > 1) {
        p.set('days', String(body.data.days));
        if (body.data.billedKm) p.set('billedKm', String(body.data.billedKm));
      }
      if (hours) p.set('hours', String(hours));
      // What the trip costs and what paying online would take — both priced by the backend
      // with the quote, carried so the next step can offer online payment without ever
      // doing the sum itself. The booking is charged from the quote id, not from these.
      if (typeof body.data.totalRupees === 'number') {
        p.set('totalRupees', String(body.data.totalRupees));
      }
      if (typeof body.data.advanceRupees === 'number') {
        p.set('advanceRupees', String(body.data.advanceRupees));
      }
      router.push(`/booking/details?${p}`);
    } catch {
      setError('Network problem — please try again');
    } finally {
      setBusy(null);
    }
  }

  if (choices.length === 0) {
    return <p className="mt-8 text-muted">No vehicle is available for this trip.</p>;
  }

  // The car picked on the previous page goes first (a stable sort keeps the rest in order).
  if (preferred && choices.some((c) => c.key === preferred)) {
    choices = [...choices].sort((a, b) => Number(b.key === preferred) - Number(a.key === preferred));
  }
  // The cheapest is a fact from the prices on screen, nothing more.
  const cheapest = choices.length
    ? choices.reduce((a, b) => (b.rupees < a.rupees ? b : a)).key
    : null;
  const roundOnly = new Set(vehicles.roundTripOnly.map((v) => v.key));
  const groups =
    tripType === 'round_trip'
      ? [
          { title: null, items: choices.filter((c) => !roundOnly.has(c.key)) },
          { title: 'Round trips only', items: choices.filter((c) => roundOnly.has(c.key)) },
        ]
      : [{ title: null, items: choices }];

  return (
    <div className="mt-8">
      <h2 className="font-display text-h3">Choose a vehicle</h2>
      {error ? <p className="mt-3 text-small text-danger">{error}</p> : null}
      {/* The cards arrive one after another rather than all at once — four prices landing
          together is a wall; four landing in order is a list you read. `--i` drives the
          delay through the shared `.stagger` rule. The vans and the Urbania (round trips
          only) come after the cars, under their own heading. */}
      {groups.map((group) =>
        group.items.length ? (
          <div key={group.title ?? 'all'}>
            {group.title ? (
              <h3 className="mt-8 text-label font-bold uppercase text-faint">{group.title}</h3>
            ) : null}
            <ul className="stagger mt-4 flex flex-col gap-3">
              {group.items.map((c, i) => (
                <li key={c.key} className="enter" style={{ ['--i' as string]: i }}>
                  {/* One layout, always: the car, name and seats, then price and Select (below
                      on a phone, one row from sm up). The whole card chooses — Select is
                      still there, and is what the keyboard reaches. While one card is being
                      held it is the only one that looks live; the dimming lives on the Card,
                      not the <li>, whose entrance animation pins its opacity. */}
                  <Card
                    onClick={() => busy === null && choose(c.key)}
                    className={
                      'flex cursor-pointer flex-col gap-3 transition-all duration-200 hover:border-accent sm:flex-row sm:items-center sm:justify-between sm:gap-4 ' +
                      (busy === c.key
                        ? 'ring-2 ring-accent'
                        : busy !== null
                          ? 'pointer-events-none opacity-50'
                          : '')
                    }
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <VehicleArt
                        vehicleKey={c.key}
                        label={c.label}
                        className="h-12 w-[7.5rem] shrink-0 rounded-xl"
                        photoSizes="7.5rem"
                      />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-body font-bold">
                          {c.label}
                          {c.key === preferred ? (
                            <span className="rounded-full bg-accent/12 px-2 py-0.5 text-label font-bold tracking-normal text-accent">
                              Your pick
                            </span>
                          ) : null}
                          {c.key === cheapest ? (
                            <span className="rounded-full bg-success/12 px-2 py-0.5 text-label font-bold tracking-normal text-success">
                              Lowest fare
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-small text-muted">
                          {[c.seats ? `${c.seats} seats` : null, 'AC', c.note]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="text-title font-black tabular-nums">
                        ₹{c.rupees.toLocaleString('en-IN')}
                      </p>
                      <Button
                        onClick={(e) => {
                          // The card chooses too; one click must not choose twice.
                          e.stopPropagation();
                          choose(c.key);
                        }}
                        disabled={busy !== null}
                      >
                        {busy === c.key ? 'Holding…' : 'Select'}
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
      <p className="mt-4 text-small text-faint">
        Toll, parking and state taxes are extra. This price is held for 30 minutes.
      </p>
    </div>
  );
}
