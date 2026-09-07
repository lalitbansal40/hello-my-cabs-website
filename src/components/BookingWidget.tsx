'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { City } from '@/lib/api';
import { CityPicker } from './ui/CityPicker';
import { WhenPicker } from './ui/WhenPicker';
import { Icon } from './site/Icons';
import { track } from '@/lib/analytics';

type TripType = 'one_way' | 'round_trip' | 'local';

const TRIPS: [TripType, string][] = [
  ['one_way', 'One way'],
  ['round_trip', 'Round trip'],
  ['local', 'Hourly'],
];

/**
 * The one place a trip is described. It sits on the home page, on every route page and on
 * every city page, so it exists once — three copies would drift, and the drift would be a
 * customer quoted for a trip they did not ask for.
 *
 * It does not hold the booking. It puts the trip in the URL and hands off to /booking, so
 * the back button, a refresh and a shared link all behave.
 *
 * Sized generously on purpose: this is the reason the page exists, and a cramped form
 * reads as an afterthought no matter how good the rest of the page looks.
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
  const [returnWhen, setReturnWhen] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  // POST /bookings refuses anything under two hours out. Read once on mount rather than
  // during render — the clock is impure — and re-checked against the real time on submit.
  const [earliest] = useState(() => new Date(Date.now() + 2 * 60 * 60 * 1000 + 60_000));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pickup) return setError('Choose a pickup city');
    if (tripType !== 'local' && !drop) return setError('Choose a drop city');
    if (!when) return setError('Choose when you want to travel');
    if (new Date(when).getTime() < Date.now() + 2 * 60 * 60 * 1000) {
      return setError('Bookings need at least two hours’ notice');
    }
    if (tripType === 'round_trip') {
      if (!returnWhen) return setError('Choose when you want to come back');
      if (new Date(returnWhen).getTime() <= new Date(when).getTime()) {
        return setError('The return has to be after the pickup');
      }
    }
    const params = new URLSearchParams({ tripType, pickup: pickup.name, when });
    if (tripType !== 'local' && drop) params.set('drop', drop.name);
    if (tripType === 'round_trip') params.set('returnWhen', returnWhen);
    if (tripType === 'local') params.set('hours', String(hours));
    // Counted only once the form actually validated, so an abandoned half-filled widget
    // does not read as a trip somebody asked for.
    track('widget_submit', {
      tripType,
      route: drop ? `${pickup.name}-${drop.name}` : pickup.name,
    });
    startTransition(() => router.push(`/booking?${params}`));
  }

  return (
    <form
      onSubmit={submit}
      className="ring-gradient rounded-[1.75rem] p-6 shadow-[var(--shadow-hero)] sm:p-7"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[1.55rem] leading-[1.15] tracking-[-0.02em]">Where to?</h2>
        <span className="text-[12px] font-semibold uppercase tracking-wider text-faint">
          Free to check
        </span>
      </div>

      <div
        className="mt-5 flex gap-1 rounded-[0.9rem] bg-surface-alt p-1"
        role="group"
        aria-label="Trip type"
      >
        {TRIPS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tripType === key}
            onClick={() => setTripType(key)}
            className={
              'flex-1 rounded-[0.7rem] px-3 py-2.5 text-[13.5px] font-bold transition-all duration-200 ' +
              (tripType === key
                ? 'bg-forest text-white shadow-[var(--shadow-soft)]'
                : 'text-muted hover:bg-white/60 hover:text-ink')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* The two cities read as one journey — a rail down the left, pickup above drop.
          Two separate boxes make the reader assemble that themselves. */}
      <div className="mt-5 flex flex-col gap-3.5">
        <Row icon={<Icon.dot className="h-[18px] w-[18px] text-accent" />} label="From" htmlFor="pickup">
          <CityPicker id="pickup" value={pickup} onChange={setPickup} placeholder="Pickup city" />
        </Row>

        {tripType === 'local' ? (
          <Row icon={<Icon.clock className="h-[18px] w-[18px] text-muted" />} label="Duration" htmlFor="hours">
            <select
              id="hours"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className={control}
            >
              {[4, 8, 10, 12].map((h) => (
                <option key={h} value={h}>
                  {h} hours
                </option>
              ))}
            </select>
          </Row>
        ) : (
          <Row icon={<Icon.pin className="h-[18px] w-[18px] text-danger" />} label="To" htmlFor="drop">
            <CityPicker id="drop" value={drop} onChange={setDrop} placeholder="Drop city" />
          </Row>
        )}

        <Row
          icon={<Icon.clock className="h-[18px] w-[18px] text-muted" />}
          label="Pickup time"
          htmlFor="when-date"
        >
          <WhenPicker idPrefix="when" value={when} onChange={setWhen} notBefore={earliest} />
        </Row>

        {/* A return leg only exists on a round trip, and asking for it on the other two
            would be asking for something that cannot be answered. */}
        {tripType === 'round_trip' ? (
          <Row
            icon={<Icon.arrow className="h-[18px] w-[18px] rotate-180 text-muted" />}
            label="Return time"
            htmlFor="return-date"
          >
            <WhenPicker
              idPrefix="return"
              value={returnWhen}
              onChange={setReturnWhen}
              notBefore={when ? new Date(when) : earliest}
              showQuickDays={false}
            />
          </Row>
        ) : null}
      </div>

      {error ? (
        <p className="mt-5 rounded-xl bg-danger/8 px-4 py-3 text-[14px] font-semibold text-danger">
          {error}
        </p>
      ) : null}

      {/* Above the button, not below it. These three lines are the answer to the hesitation
          that stops someone pressing it, and under the button they are read after the
          decision they were meant to help with. */}
      <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-bold text-muted">
        {['Fixed fare', 'No surge', 'Pay in cash'].map((t) => (
          <li key={t} className="flex items-center gap-1.5">
            <Icon.check className="h-4 w-4 text-accent" />
            {t}
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={pending}
        className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-[0.9rem] bg-forest px-6 py-4 text-[15.5px] font-bold text-white shadow-[var(--shadow-lift)] transition-all duration-200 hover:bg-forest/90 active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? 'Checking fares…' : 'See fares'}
        {pending ? null : (
          <Icon.arrow className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}

/**
 * Taller than a default input on purpose — this is a form people fill in on a phone.
 * 16px for the same reason: Safari zooms the page on a focused input under that, and does
 * not zoom back out.
 */
const control =
  'w-full rounded-[0.9rem] border border-line bg-surface-raised px-4 py-3.5 text-[16px] font-medium ' +
  'transition-colors placeholder:font-normal placeholder:text-faint hover:border-faint/60 focus:border-forest';

function Row({
  icon,
  label,
  htmlFor,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    // The icon is aligned to the FIELD, not nudged down from the label with a magic
    // margin — that margin broke the moment a label wrapped to two lines.
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="ml-8 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint"
      >
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-3.5">
        <span className="shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
