'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
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
  defaultVehicle,
}: {
  defaultPickup?: City;
  defaultDrop?: City;
  defaultTripType?: TripType;
  /** A car already chosen on this page (a route-by-car page): carried to the vehicle step. */
  defaultVehicle?: string;
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

  // Where the ticket's notches go: level with the tear line, which moves down as stops are
  // added and the trip type changes. Measured, not guessed, and written straight to the
  // card's style (no render needed for a shape).
  const formRef = useRef<HTMLFormElement>(null);
  const tearRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const form = formRef.current;
    const tear = tearRef.current;
    if (!form || !tear) return;
    const place = () => form.style.setProperty('--notch-y', `${tear.offsetTop + 1}px`);
    place();
    const ro = new ResizeObserver(place);
    ro.observe(form);
    return () => ro.disconnect();
  }, []);

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
    if (defaultVehicle && tripType !== 'local') params.set('vehicle', defaultVehicle);
    // Counted only once the form actually validated, so an abandoned half-filled widget
    // does not read as a trip somebody asked for.
    track('widget_submit', {
      tripType,
      route: drop ? `${pickup.name}-${drop.name}` : pickup.name,
    });
    startTransition(() => router.push(`/booking?${params}`));
  }

  return (
    // The shadow lives on a wrapper: the ticket's mask would cut a shadow of its own off.
    <div className="ticket-shadow">
      <form
        ref={formRef}
        onSubmit={submit}
        className="ticket flex flex-col pt-5 sm:pt-6"
        aria-labelledby="book-heading"
      >
        <div className="px-5 sm:px-7">
          {/* The page's own h1 says what this is; inside the ticket a small label is enough.
              The h2 stays for screen readers, which list a page by its headings. */}
          <h2 id="book-heading" className="sr-only">
            Book a cab
          </h2>
          <p className="hidden text-label font-bold uppercase text-faint sm:block">Your trip</p>

          {/* One control with three parts, not three buttons: the chosen part is white and
              underlined in red, the way a printed ticket marks its class. */}
          <div
            className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1 sm:mt-3"
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
                  // 44px: the size a thumb actually hits; the three fit in one row at 320.
                  'relative min-h-11 whitespace-nowrap rounded-lg px-1.5 text-small font-bold transition-colors ' +
                  "after:absolute after:inset-x-4 after:bottom-1.5 after:h-0.5 after:rounded-full after:content-[''] " +
                  (tripType === key
                    ? 'bg-surface-raised text-ink shadow-[var(--shadow-soft)] after:bg-accent'
                    : 'text-muted hover:bg-surface-raised/60 hover:text-ink after:bg-transparent')
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* From ●───⇄───● To. Side by side when the ticket is wide enough for two city
              names (a container query — the card is 452px on a landing page and full width
              on a phone); one above the other when it is not. The road and the swap sit
              between them either way. */}
          <div className="@container mt-5 short:mt-4">
            {tripType === 'local' ? (
              <div className="grid gap-4">
                <Place id="pickup" label="From" dot="start">
                  <CityPicker id="pickup" variant="line" value={pickup} onChange={setPickup} placeholder="Pickup city" />
                </Place>
                {/* Not a dropdown. There is one package, and below its included hours the
                    price is simply the package price — offering 4, 8, 10 and 12 sold a choice
                    the fare does not follow, and never said eighty kilometres was the limit. */}
                <div id="package" className="rounded-xl bg-surface px-4 py-3 text-body">
                  <span className="font-semibold">
                    {pkg ? `${pkg.includedHours} hours · ${pkg.includedKm} km` : 'Hourly package'}
                  </span>
                  {pkg ? (
                    <span className="ml-2 text-small text-muted">
                      from ₹{pkg.fromRupees.toLocaleString('en-IN')}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="grid items-end gap-x-3 gap-y-2 @min-[25rem]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <Place id="pickup" label="From" dot="start">
                  <CityPicker id="pickup" variant="line" value={pickup} onChange={setPickup} placeholder="Pickup city" />
                </Place>
                {/* The road, with the swap on it. */}
                <div className="flex items-center gap-2 @min-[25rem]:mb-2.5">
                  <span aria-hidden className="h-0.5 flex-1 rounded-full bg-road @min-[25rem]:w-4 @min-[25rem]:flex-none" />
                  <button
                    type="button"
                    onClick={swap}
                    aria-label="Swap pickup and drop"
                    title="Swap pickup and drop"
                    className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-road bg-surface-raised text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    <Icon.swap className="h-5 w-5 @min-[25rem]:rotate-90" />
                  </button>
                  <span aria-hidden className="h-0.5 flex-1 rounded-full bg-road @min-[25rem]:w-4 @min-[25rem]:flex-none" />
                </div>
                <Place id="drop" label="To" dot="end">
                  <CityPicker id="drop" variant="line" value={drop} onChange={setDrop} placeholder="Drop city" />
                </Place>
              </div>
            )}
          </div>

          {hasStops ? (
            <div className="mt-3 flex flex-col gap-2">
              {stops.map((stop, i) => (
                <div key={stop.id} className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <Place id={`stop-${i}`} label={`Stop ${i + 1}`} dot="stop">
                      <CityPicker
                        id={`stop-${i}`}
                        variant="line"
                        value={stop.city}
                        onChange={(c) =>
                          setStops((all) => all.map((s) => (s.id === stop.id ? { ...s, city: c } : s)))
                        }
                        placeholder="A city on the way"
                      />
                    </Place>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStops((all) => all.filter((s) => s.id !== stop.id))}
                    aria-label={`Remove stop ${i + 1}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-accent"
                  >
                    <Icon.x className="h-5 w-5" />
                  </button>
                </div>
              ))}

              {stops.length < MAX_STOPS ? (
                <button
                  type="button"
                  onClick={() => {
                    setStops((all) => [...all, { id: nextStopId, city: null }]);
                    setNextStopId((n) => n + 1);
                  }}
                  className="inline-flex min-h-11 w-fit items-center gap-1.5 text-small font-semibold text-accent underline-offset-4 hover:underline"
                >
                  <Icon.plus className="h-4 w-4" />
                  Add a stop on the way
                </button>
              ) : null}

              {stops.length > 0 ? (
                // Said where the decision is made, not discovered on the bill: the fare shown
                // next is for the direct route.
                <p className="text-small text-muted">
                  Our desk will confirm what the stops add to the fare, by phone.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* The tear line, notch to notch. Its position is measured (formRef effect) so the
            bites in the card's sides follow it when stops are added. */}
        <div ref={tearRef} aria-hidden className="ticket-tear mx-0 mt-4 sm:mt-5 short:mt-4" />

        <div className="px-5 pb-4 pt-3 sm:px-7 sm:pb-6 sm:pt-4">
          <label htmlFor="when-date" className="flex items-center gap-1.5 text-label font-bold uppercase text-faint">
            <Icon.calendar className="h-3.5 w-3.5" />
            When
          </label>
          <div className="mt-1.5">
            <WhenPicker
              idPrefix="when"
              value={when}
              onChange={setWhen}
              notBefore={earliest}
              earliestHint="Earliest pickup — about 2 hours from now"
            />
          </div>

          {/* A return leg only exists on a round trip, and asking for it on the other two
              would be asking for something that cannot be answered. */}
          {tripType === 'round_trip' ? (
            <div className="mt-3">
              <label htmlFor="return-date" className="flex items-center gap-1.5 text-label font-bold uppercase text-faint">
                <Icon.loop className="h-3.5 w-3.5" />
                Return
              </label>
              <div className="mt-1.5">
                <WhenPicker
                  idPrefix="return"
                  value={returnWhen}
                  onChange={setReturnWhen}
                  // Strictly after the pickup: the picker seeds the first slot it allows,
                  // and a return seeded AT the pickup failed "The return has to be after
                  // the pickup" before anyone had touched the form (3 Oct 2026, on the
                  // round-trip pages, which open on this tab).
                  notBefore={new Date((when ? new Date(when) : earliest).getTime() + 30 * 60_000)}
                  showQuickDays={false}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            // `key` on the message, so a second attempt with the SAME text shakes again —
            // without it React reuses the node and the animation never restarts.
            <p
              key={error}
              role="alert"
              className="shake mt-4 rounded-xl bg-danger/8 px-4 py-3 text-small font-semibold text-danger"
            >
              {error}
            </p>
          ) : null}

        </div>

        {/* The stub: the bottom of the ticket is the button, edge to edge. */}
        <button
          type="submit"
          disabled={pending}
          className="group flex min-h-14 w-full items-center justify-center gap-2.5 bg-accent px-6 py-4 font-display text-title text-white transition-colors duration-200 hover:bg-accent-dark disabled:opacity-70 short:py-3.5"
        >
          {pending ? (
            <span
              aria-hidden
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
            />
          ) : null}
          {pending ? 'Checking fares…' : 'See fares'}
          {pending ? null : (
            <Icon.arrow className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * A place on the ticket: a small label with the road's dot before it, and the city under
 * it. The dot is the road's end (start — filled, end — ringed) or a stop on the way.
 */
function Place({
  id,
  label,
  dot,
  children,
}: {
  id: string;
  label: string;
  dot: 'start' | 'end' | 'stop';
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="flex items-center gap-1.5 text-label font-bold uppercase text-faint">
        <span
          aria-hidden
          className={
            'inline-block size-2.5 rounded-full ' +
            (dot === 'start'
              ? 'bg-road'
              : dot === 'end'
                ? 'border-2 border-road'
                : 'size-2 bg-faint')
          }
        />
        {label}
      </label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
