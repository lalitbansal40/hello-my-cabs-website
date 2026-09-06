'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { City } from '@/lib/api';
import { Button } from './ui/Button';
import { CityPicker } from './ui/CityPicker';
import { Field, Input, Select } from './ui/Field';

type TripType = 'one_way' | 'round_trip' | 'local';

/**
 * The one place a trip is described. It sits on the home page, on every route page and on
 * every city page, so it exists once — three copies would drift, and the drift would be a
 * customer being quoted for a trip they did not ask for.
 *
 * It does not hold the booking. It puts the trip in the URL and hands off to /booking, so
 * the back button, a refresh and a shared link all behave.
 */
export function BookingWidget({
  defaultPickup,
  defaultDrop,
  defaultTripType = 'one_way',
}: {
  defaultPickup?: City;
  defaultDrop?: City;
  defaultTripType?: TripType;
}) {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>(defaultTripType);
  const [pickup, setPickup] = useState<City | null>(defaultPickup ?? null);
  const [drop, setDrop] = useState<City | null>(defaultDrop ?? null);
  const [hours, setHours] = useState(8);
  const [when, setWhen] = useState('');
  const [error, setError] = useState('');

  // POST /bookings refuses anything under two hours out. Stopping it here means the
  // customer is told in the form rather than by a 422 after they have filled it all in.
  //
  // Read once, on mount: the clock is impure, and calling it during render makes the
  // component's output depend on when React happened to re-run it. A picker bound a few
  // minutes stale is harmless — submit re-checks against the real time below.
  const [earliest] = useState(() =>
    new Date(Date.now() + 2 * 60 * 60 * 1000 + 60_000).toISOString().slice(0, 16),
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pickup) return setError('Pickup sheher chunein');
    if (tripType !== 'local' && !drop) return setError('Drop sheher chunein');
    if (!when) return setError('Kab jaana hai, wo chunein');
    if (new Date(when).getTime() < Date.now() + 2 * 60 * 60 * 1000) {
      return setError('Booking kam se kam 2 ghante pehle karni hoti hai');
    }
    const params = new URLSearchParams({ tripType, pickup: pickup.name, when });
    if (tripType !== 'local' && drop) params.set('drop', drop.name);
    if (tripType === 'local') params.set('hours', String(hours));
    router.push(`/booking?${params}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Trip type">
        {(
          [
            ['one_way', 'Ek taraf'],
            ['round_trip', 'Aana-jana'],
            ['local', 'Ghante ke hisaab se'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tripType === key}
            onClick={() => setTripType(key)}
            className={
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors ' +
              (tripType === key
                ? 'bg-ink text-white'
                : 'border border-line text-muted hover:bg-surface-alt')
            }
          >
            {label}
          </button>
        ))}
      </div>

      <Field label="Kahan se" htmlFor="pickup">
        <CityPicker id="pickup" value={pickup} onChange={setPickup} placeholder="Pickup sheher" />
      </Field>

      {tripType === 'local' ? (
        <Field label="Kitne ghante" htmlFor="hours" hint="Package me 8 ghante / 80 km shaamil">
          <Select id="hours" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
            {[4, 8, 10, 12].map((h) => (
              <option key={h} value={h}>
                {h} ghante
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label="Kahan tak" htmlFor="drop">
          <CityPicker id="drop" value={drop} onChange={setDrop} placeholder="Drop sheher" />
        </Field>
      )}

      <Field label="Kab" htmlFor="when" hint="Kam se kam 2 ghante baad">
        <Input
          id="when"
          type="datetime-local"
          min={earliest}
          value={when}
          onChange={(e) => setWhen(e.target.value)}
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit">Daam dekhein</Button>
    </form>
  );
}
