'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { City } from '@/lib/api';
import { CityPicker } from './ui/CityPicker';
import { WhenPicker } from './ui/WhenPicker';
import { Icon } from './site/Icons';
import { track } from '@/lib/analytics';

type TripType = 'one_way' | 'round_trip' | 'local';

/** What /api/local-package answers with — the pricing config flattened to one package. */
type HourlyPackage = {
  includedHours: number;
  includedKm: number;
  fromRupees: number;
  extraPerHour: number;
};

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
  // One package, not a choice. The API is asked rather than the numbers being copied here,
  // because they live in the pricing config and change there.
  const [pkg, setPkg] = useState<HourlyPackage | null>(null);
  const [when, setWhen] = useState('');
  const [returnWhen, setReturnWhen] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (tripType !== 'local' || pkg) return;
    let live = true;
    fetch('/api/local-package')
      .then((r) => r.json())
      .then((d) => live && d.package && setPkg(d.package))
      // The package is a detail on a line of copy, not something the form needs to work.
      // A failed fetch leaves that line out rather than blocking an hourly booking.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [tripType, pkg]);

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
    if (tripType === 'local') params.set('hours', String(pkg?.includedHours ?? 8));
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
      /**
       * `text-ink` is not decoration here — it is the fix for a real fault.
       *
       * This card is light and it sits inside the hero, which is `text-white`. With no
       * colour of its own it inherited that, so "Where to?" and the city names in the
       * picker were white on a near-white card: invisible. Only the city's state showed,
       * because that line sets its own grey — which is why the dropdown read as four rows
       * of "Rajasthan".
       *
       * A component that only looks right because of what happens to surround it will
       * eventually be put somewhere else. This one now carries its own.
       */
      // (`ring-gradient` paints the surface itself — a bg- class here would cover the
      // gradient border it draws with it.)
      className="ring-gradient rounded-[1.75rem] p-5 text-ink shadow-[var(--shadow-hero)] sm:p-7 short:p-5"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-title-lg short:text-title">Where to?</h2>
        <span className="font-semibold text-label uppercase text-faint">
          Free to check
        </span>
      </div>

      <div
        className="mt-5 flex gap-1 rounded-[0.9rem] bg-surface-alt p-1 short:mt-3"
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
              // min-h rather than more padding: the three of these sit in one row on a
              // 320px screen, and taller padding would push the text into wrapping. 44px is
              // the size a thumb actually hits — at 36px this row was the easiest thing on
              // the page to miss. The side padding is tight on a phone because the labels
              // do not wrap: "Round trip" over two lines made that one tab look different.
              'flex text-small flex-1 items-center justify-center rounded-[0.7rem] px-1.5 py-2.5 font-bold sm:px-3 transition-all duration-200 min-h-11 whitespace-nowrap ' +
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
      <div className="mt-5 flex flex-col gap-3.5 short:mt-3 short:gap-2">
        <Row icon={<Icon.dot className="h-[18px] w-[18px] text-accent" />} label="From" htmlFor="pickup">
          <CityPicker id="pickup" value={pickup} onChange={setPickup} placeholder="Pickup city" />
        </Row>

        {tripType === 'local' ? (
          // Not a dropdown. There is one package, and below its included hours the price
          // is simply the package price — offering 4, 8, 10 and 12 sold a choice the fare
          // does not follow, and never said that eighty kilometres was the limit.
          <Row icon={<Icon.clock className="h-[18px] w-[18px] text-muted" />} label="Package" htmlFor="package">
            <div
              id="package"
              className={`${control} flex items-baseline justify-between gap-3`}
            >
              <span>
                {pkg ? `${pkg.includedHours} hours · ${pkg.includedKm} km` : 'Hourly package'}
              </span>
              {pkg ? (
                <span className="shrink-0 text-small font-semibold text-muted">
                  from ₹{pkg.fromRupees.toLocaleString('en-IN')}
                </span>
              ) : null}
            </div>
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
        <p className="mt-5 text-small rounded-xl bg-danger/8 px-4 py-3 font-semibold text-danger">
          {error}
        </p>
      ) : null}

      {/* Above the button, not below it. These three lines are the answer to the hesitation
          that stops someone pressing it, and under the button they are read after the
          decision they were meant to help with. */}
      <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-small font-bold text-muted short:hidden">
        {['Fixed fare', 'No surge', 'Pay in cash'].map((t) => (
          // Breaking between the three is fine; breaking "Pay in / cash" is not.
          <li key={t} className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon.check className="h-4 w-4 text-accent" />
            {t}
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={pending}
        className="group text-body mt-4 flex w-full items-center justify-center gap-2.5 rounded-[0.9rem] bg-forest px-6 py-4 font-bold text-white shadow-[var(--shadow-lift)] transition-all duration-200 hover:bg-forest/90 active:scale-[0.99] disabled:opacity-70 short:mt-3 short:py-3.5"
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
  'w-full text-body rounded-[0.9rem] border border-line bg-surface-raised px-4 py-3.5 font-medium ' +
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
    //
    // Below sm there is no icon column at all. A dot, a pin and a clock in the margin cost
    // 32px of a 320px screen and said nothing the labels above the fields do not already
    // say; the width is worth more to a city name than to a decoration.
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="text-label font-bold uppercase text-faint sm:ml-8"
      >
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-3.5">
        <span className="hidden shrink-0 sm:block">{icon}</span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
