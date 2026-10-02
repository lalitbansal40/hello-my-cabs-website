'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { City } from '@/lib/api';
import { CityPicker } from './ui/CityPicker';
import { WhenPicker } from './ui/WhenPicker';
import { Icon } from './site/Icons';
import { track } from '@/lib/analytics';
import { TRIP_EVENT, isTripType, type TripType } from '@/lib/trip-select';
import { MAX_STOPS } from '@/lib/stops';

/** What /api/local-package answers with — the pricing config flattened to one package. */
type HourlyPackage = {
  includedHours: number;
  includedKm: number;
  fromRupees: number;
  extraPerHour: number;
};

/** Each tab says what it means in a few words, under its name — the screenshot the owner
 *  liked did this, and "Round trip" alone does not say the same car waits for you. */
const TRIPS: [TripType, string, string][] = [
  ['one_way', 'One way', 'Drop-off only'],
  ['round_trip', 'Round trip', 'Same cab back'],
  ['local', 'Local', 'By the hour'],
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
  // A stop is a city or a box still waiting for one (null). Each carries its own id so
  // removing the middle one does not hand its typed text to the box below it — the picker
  // keeps what was typed in its own state, keyed to its place in the list.
  const [stops, setStops] = useState<{ id: number; city: City | null }[]>([]);
  const [nextStopId, setNextStopId] = useState(1);
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

  // The trip type can be chosen from outside the card: `?trip=` on arrival (the Luxury
  // page's links), or the strip under the card on the same page (lib/trip-select.ts). Read
  // in an effect — the home page is prerendered, and the URL is the visitor's, not the
  // build's.
  //
  // The URL's choice goes through the same event as the strip's, so the tab changes in one
  // place — the listener — and never from the effect body itself.
  useEffect(() => {
    const onPick = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (isTripType(t)) setTripType(t);
    };
    window.addEventListener(TRIP_EVENT, onPick);
    const fromUrl = new URLSearchParams(window.location.search).get('trip');
    if (isTripType(fromUrl)) {
      window.dispatchEvent(new CustomEvent(TRIP_EVENT, { detail: fromUrl }));
    }
    return () => window.removeEventListener(TRIP_EVENT, onPick);
  }, []);

  // POST /bookings refuses anything under two hours out. Read once on mount rather than
  // during render — the clock is impure — and re-checked against the real time on submit.
  const [earliest] = useState(() => new Date(Date.now() + 2 * 60 * 60 * 1000 + 60_000));

  const hasStops = tripType !== 'local';

  function swap() {
    setPickup(drop);
    setDrop(pickup);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pickup) return setError('Choose a pickup city');
    if (tripType !== 'local' && !drop) return setError('Choose a drop city');
    const chosenStops = hasStops
      ? stops.map((s) => s.city).filter((c): c is City => c !== null)
      : [];
    if (hasStops && chosenStops.length !== stops.length) {
      return setError('Choose a city for each stop, or remove the empty one');
    }
    const names = chosenStops.map((s) => s.name);
    if (names.some((n) => n === pickup.name || n === drop?.name)) {
      return setError('A stop cannot be the pickup or the drop city');
    }
    if (new Set(names).size !== names.length) return setError('The same stop is added twice');
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
    if (names.length) params.set('stops', names.join('|'));
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
       * This card is light and it can sit inside a dark band. With no colour of its own it
       * inherited white from it, so the city names in the picker came out white on a
       * near-white card: invisible. A component that only looks right because of what
       * happens to surround it will eventually be put somewhere else. This one carries
       * its own.
       */
      // (`ring-gradient` paints the surface itself — a bg- class here would cover the
      // gradient border it draws with it.)
      className="ring-gradient rounded-[1.75rem] p-5 text-ink shadow-[var(--shadow-hero)] sm:p-7 short:p-5"
    >
      {/* The card's own heading, between two short red rules. */}
      <div className="text-center">
        {/* One line at 320 too: the rules shrink before the words wrap. */}
        <h2 className="flex items-center justify-center gap-2.5 whitespace-nowrap font-display text-title uppercase sm:gap-3 sm:text-title-lg short:text-title">
          <span aria-hidden className="h-0.5 w-5 shrink rounded-full bg-accent sm:w-12" />
          Outstation cabs
          <span aria-hidden className="h-0.5 w-5 shrink rounded-full bg-accent sm:w-12" />
        </h2>
        <p className="mt-1 text-small font-medium text-muted short:hidden">
          Fixed fare · no surge · free to check
        </p>
      </div>

      <div
        className="mt-5 grid grid-cols-3 gap-2 short:mt-3"
        role="group"
        aria-label="Trip type"
      >
        {TRIPS.map(([key, label, sub]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tripType === key}
            onClick={() => setTripType(key)}
            className={
              // min-h 44px: the size a thumb actually hits. The three sit in one row on a
              // 320px screen, so the line under the name only shows from `sm` up — under
              // that, "Round trip" and its line would not both fit without wrapping.
              // On a short laptop screen (`short`) the line under the name goes, so the
              // card's button stays on the first screen.
              'flex min-h-11 flex-col items-center justify-center rounded-2xl border px-1.5 py-2 text-center transition-all duration-200 sm:min-h-14 short:min-h-11 ' +
              (tripType === key
                ? 'border-accent bg-accent text-white shadow-[var(--shadow-soft)]'
                : 'border-line bg-surface-raised text-ink-soft hover:border-accent/50 hover:text-ink')
            }
          >
            <span className="whitespace-nowrap text-small font-bold">{label}</span>
            <span
              className={`hidden text-label font-medium tracking-normal sm:block short:hidden ${
                tripType === key ? 'text-white' : 'text-muted'
              }`}
            >
              {sub}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3.5 short:mt-3 short:gap-2">
        {/* Pickup and drop with the swap button between them — on the right edge, where a
            thumb reaches it and where it covers no text. */}
        <div className="relative flex flex-col gap-3.5 short:gap-2">
          <Row icon={<Icon.dot className="h-[18px] w-[18px] text-accent" />} label="From" htmlFor="pickup">
            <CityPicker id="pickup" value={pickup} onChange={setPickup} placeholder="Pickup city" />
          </Row>

          {tripType === 'local' ? (
            // Not a dropdown. There is one package, and below its included hours the price
            // is simply the package price — offering 4, 8, 10 and 12 sold a choice the fare
            // does not follow, and never said that eighty kilometres was the limit.
            <Row icon={<Icon.clock className="h-[18px] w-[18px] text-muted" />} label="Package" htmlFor="package">
              <div id="package" className={`${control} flex items-baseline justify-between gap-3`}>
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
            <>
              <Row icon={<Icon.pin className="h-[18px] w-[18px] text-accent" />} label="To" htmlFor="drop">
                <CityPicker id="drop" value={drop} onChange={setDrop} placeholder="Drop city" />
              </Row>
              <button
                type="button"
                onClick={swap}
                aria-label="Swap pickup and drop"
                title="Swap pickup and drop"
                // Centred on the seam between the two boxes: the label row above each box
                // is 1.4rem, so the seam sits half a gap above the second label.
                className="absolute right-3 top-[calc(50%+0.35rem)] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface-raised text-accent shadow-[var(--shadow-soft)] transition-colors hover:border-accent hover:bg-accent hover:text-white"
              >
                <Icon.swap className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {hasStops ? (
          <div className="flex flex-col gap-2.5">
            {stops.map((stop, i) => (
              <Row
                key={stop.id}
                icon={<Icon.dot className="h-[18px] w-[18px] text-muted" />}
                label={`Stop ${i + 1}`}
                htmlFor={`stop-${i}`}
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <CityPicker
                      id={`stop-${i}`}
                      value={stop.city}
                      onChange={(c) =>
                        setStops((all) => all.map((s) => (s.id === stop.id ? { ...s, city: c } : s)))
                      }
                      placeholder="Stop on the way"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStops((all) => all.filter((s) => s.id !== stop.id))}
                    aria-label={`Remove stop ${i + 1}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-alt hover:text-accent"
                  >
                    <Icon.x className="h-5 w-5" />
                  </button>
                </div>
              </Row>
            ))}

            {stops.length < MAX_STOPS ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:ml-8">
                <button
                  type="button"
                  onClick={() => {
                    setStops((all) => [...all, { id: nextStopId, city: null }]);
                    setNextStopId((n) => n + 1);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-accent/40 px-4 text-small font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/5"
                >
                  <Icon.plus className="h-4 w-4" />
                  Add stops
                </button>
                <span className="rounded-full bg-tile-tempo-from px-2 py-0.5 text-label font-black tracking-wide text-white">
                  NEW
                </span>
                <span className="text-small text-muted">Up to {MAX_STOPS} stops on the way</span>
              </div>
            ) : null}

            {stops.length > 0 ? (
              // Said where the decision is made, not discovered on the bill: the fare shown
              // next is for the direct route.
              <p className="text-small font-medium text-muted sm:ml-8">
                Our desk will confirm what the stops add to the fare, by phone.
              </p>
            ) : null}
          </div>
        ) : null}

        <Row
          icon={<Icon.calendar className="h-[18px] w-[18px] text-muted" />}
          label="Trip start"
          htmlFor="when-date"
        >
          <WhenPicker idPrefix="when" value={when} onChange={setWhen} notBefore={earliest} />
        </Row>

        {/* A return leg only exists on a round trip, and asking for it on the other two
            would be asking for something that cannot be answered. */}
        {tripType === 'round_trip' ? (
          <Row
            icon={<Icon.loop className="h-[18px] w-[18px] text-muted" />}
            label="Return"
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
        // `key` on the message, so a second attempt with the SAME text shakes again —
        // without it React reuses the node and the animation never restarts.
        <p
          key={error}
          role="alert"
          className="shake mt-5 text-small rounded-xl bg-danger/8 px-4 py-3 font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}

      {/* Above the button, not below it. These three lines are the answer to the hesitation
          that stops someone pressing it, and under the button they are read after the
          decision they were meant to help with. */}
      <ul className="mt-5 flex flex-wrap items-center justify-center gap-2 short:hidden">
        {['Verified drivers', 'Fixed fare', 'Pay in cash'].map((t) => (
          // Breaking between the three is fine; breaking "Pay in / cash" is not.
          <li
            key={t}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-alt px-3 py-1 text-small font-semibold text-ink-soft"
          >
            <Icon.check className="h-4 w-4 text-accent" />
            {t}
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={pending}
        className="group text-body mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-accent px-6 py-4 font-black uppercase tracking-wide text-white shadow-[var(--shadow-lift)] transition-all duration-200 hover:bg-accent-dark active:scale-[0.99] disabled:opacity-70 short:mt-3 short:py-3.5"
      >
        {pending ? 'Checking fares…' : 'Explore cabs'}
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
  'transition-colors placeholder:font-normal placeholder:text-faint hover:border-faint/60 focus:border-accent';

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
      <label htmlFor={htmlFor} className="text-label font-bold uppercase text-faint sm:ml-8">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-3.5">
        <span className="hidden shrink-0 sm:block">{icon}</span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
