'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { LocalPackage, OnewayFare, RoundtripFare, Vehicle } from '@/lib/api';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

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
  hours,
  vehicles,
  fare,
}: {
  tripType: 'one_way' | 'round_trip' | 'local';
  pickup: string;
  drop?: string;
  when: string;
  hours?: number;
  vehicles: { intercity: Vehicle[]; roundTripOnly: Vehicle[] };
  fare: Fare;
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
      note: `${p.includedHours} ghante / ${p.includedKm} km shaamil`,
    }));
  } else {
    // One-way carries `total` (fare + any airport surcharge); round-trip carries only
    // `fare`. Show the one the customer actually pays.
    const rows = fare.vehicles as Array<{ key: string; label: string; fare: number; total?: number }>;
    choices = rows
      .filter((v) => allowed.some((a) => a.key === v.key))
      .map((v) => ({
        key: v.key,
        label: v.label,
        rupees: v.total ?? v.fare,
        seats: seatsOf(v.key),
        note:
          'hill' in fare && fare.hill
            ? `${fare.billedKm} km · pahadi route`
            : 'distanceKm' in fare && fare.distanceKm
              ? `${fare.distanceKm} km`
              : undefined,
      }));
  }

  async function choose(vehicleType: string) {
    setBusy(vehicleType);
    setError('');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tripType,
          vehicleType,
          ...(tripType === 'local' ? { hours: hours ?? 8 } : { pickupCity: pickup, dropCity: drop }),
        }),
      });
      const body = await res.json();
      if (!body.ok) {
        // The server's wording is the right wording — a second copy here drifts from it.
        setError(body.error?.message ?? 'Daam nikalne me dikkat aayi');
        return;
      }
      const p = new URLSearchParams({
        quoteId: body.data.quoteId,
        tripType,
        pickup,
        when,
        vehicleType,
      });
      if (drop) p.set('drop', drop);
      if (hours) p.set('hours', String(hours));
      router.push(`/booking/details?${p}`);
    } catch {
      setError('Network dikkat — dobara koshish karein');
    } finally {
      setBusy(null);
    }
  }

  if (choices.length === 0) {
    return <p className="mt-8 text-muted">Is trip ke liye abhi koi gaadi maujood nahi.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold">Gaadi chunein</h2>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <ul className="mt-4 flex flex-col gap-3">
        {choices.map((c) => (
          <li key={c.key}>
            <Card className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold">
                  {c.label}
                  {c.seats ? <span className="font-normal text-faint"> · {c.seats} seats</span> : null}
                </p>
                {c.note ? <p className="mt-0.5 text-sm text-muted">{c.note}</p> : null}
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-black">₹{c.rupees.toLocaleString('en-IN')}</p>
                <Button onClick={() => choose(c.key)} disabled={busy !== null}>
                  {busy === c.key ? 'Ruko…' : 'Chunein'}
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-faint">
        Toll, parking aur state tax alag se lagenge. Daam 30 minute ke liye tay hai.
      </p>
    </div>
  );
}
