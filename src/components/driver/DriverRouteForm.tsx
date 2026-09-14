'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Field';

/**
 * Eight questions about a road, for a driver on a phone.
 *
 * Written for someone who reads English as a second language, standing next to a car:
 * short questions, everyday words, choices to tap rather than paragraphs to type, and
 * every question skippable. The answers that matter most for the website — the stops, the
 * tolls, when to leave, what the road is like — are choices and numbers, because those
 * can be checked against other drivers and written up; typed notes are read by our team
 * and never published.
 */

type Slot = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
type Road = 'expressway' | 'highway' | 'single' | 'ghat';

export interface SurveyAnswer {
  stops?: { kind: 'food' | 'rest'; name: string; aboutKm?: number; note?: string }[];
  tolls?: { count?: number; approxRupees?: number; note?: string };
  bestTime?: Slot;
  worstTime?: Slot;
  timeNote?: string;
  roadType?: Road;
  roadNote?: string;
  realHours?: number;
  preferredVehicle?: string;
  otherNote?: string;
}

const SLOTS: { value: Slot; label: string }[] = [
  { value: 'early_morning', label: 'Early morning (before 7 am)' },
  { value: 'morning', label: 'Morning (7–11 am)' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
];

const ROADS: { value: Road; label: string }[] = [
  { value: 'expressway', label: 'Expressway' },
  { value: 'highway', label: 'Highway with a divider' },
  { value: 'single', label: 'Single road, no divider' },
  { value: 'ghat', label: 'Hills and bends (ghat)' },
];

const CARS = [
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'dzire', label: 'Dzire' },
  { value: 'ertiga', label: 'Ertiga' },
  { value: 'crysta', label: 'Innova Crysta' },
  { value: 'tempo', label: 'Tempo Traveller' },
];

interface StopRow {
  name: string;
  km: string;
}

const MAX_FOOD = 5;
const MAX_REST = 3;

const rowsFrom = (initial: SurveyAnswer | null, kind: 'food' | 'rest'): StopRow[] => {
  const rows = (initial?.stops ?? [])
    .filter((s) => s.kind === kind)
    .map((s) => ({ name: s.name, km: s.aboutKm != null ? String(s.aboutKm) : '' }));
  return rows.length ? rows : [{ name: '', km: '' }];
};

const num = (v: string) => {
  const n = Number(v);
  return v.trim() !== '' && Number.isFinite(n) ? n : undefined;
};

export function DriverRouteForm({
  token,
  pickupLabel,
  initial,
  answeredBefore,
}: {
  token: string;
  pickupLabel: string;
  initial: SurveyAnswer | null;
  answeredBefore: boolean;
}) {
  const [food, setFood] = useState<StopRow[]>(() => rowsFrom(initial, 'food'));
  const [rest, setRest] = useState<StopRow[]>(() => rowsFrom(initial, 'rest'));
  const [tollCount, setTollCount] = useState(initial?.tolls?.count?.toString() ?? '');
  const [tollRupees, setTollRupees] = useState(initial?.tolls?.approxRupees?.toString() ?? '');
  const [bestTime, setBestTime] = useState<Slot | undefined>(initial?.bestTime);
  const [worstTime, setWorstTime] = useState<Slot | undefined>(initial?.worstTime);
  const [roadType, setRoadType] = useState<Road | undefined>(initial?.roadType);
  const [hours, setHours] = useState(initial?.realHours?.toString() ?? '');
  const [car, setCar] = useState<string | undefined>(initial?.preferredVehicle);
  const [other, setOther] = useState(initial?.otherNote ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const stops = [
      ...food.map((r) => ({ kind: 'food' as const, ...r })),
      ...rest.map((r) => ({ kind: 'rest' as const, ...r })),
    ]
      .filter((r) => r.name.trim().length >= 2)
      .map((r) => ({ kind: r.kind, name: r.name.trim(), aboutKm: num(r.km) }));
    const answer: SurveyAnswer = {
      stops,
      tolls: { count: num(tollCount), approxRupees: num(tollRupees) },
      bestTime,
      worstTime,
      roadType,
      realHours: num(hours),
      preferredVehicle: car,
      otherNote: other.trim() || undefined,
    };
    setBusy(true);
    try {
      const res = await fetch('/api/driver-survey', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, answer }),
      });
      const body = await res.json().catch(() => null);
      if (!body?.ok) {
        setError(
          body?.error?.message === 'Please answer at least one question'
            ? 'Please answer at least one question.'
            : (body?.error?.message ?? 'We could not save that. Please try again.'),
        );
        return;
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('No internet connection. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <p className="font-display text-title-lg">Thank you</p>
        <p className="mt-2 text-body text-muted">
          Your answer is saved. Our team will check it. If you open this link again in the next few
          days, you can change your answer.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-6">
      {answeredBefore ? (
        <p className="rounded-xl bg-surface p-4 text-small text-muted">
          You answered before. Your answer is filled in below — change anything and send it again.
        </p>
      ) : null}

      <Question n={1} title="Good places to eat on this road">
        <StopRows
          rows={food}
          setRows={setFood}
          max={MAX_FOOD}
          placeholder="Name of the dhaba or hotel"
          pickupLabel={pickupLabel}
          addLabel="Add another place to eat"
        />
      </Question>

      <Question n={2} title="A place for tea and a clean washroom">
        <StopRows
          rows={rest}
          setRows={setRest}
          max={MAX_REST}
          placeholder="Name of the place"
          pickupLabel={pickupLabel}
          addLabel="Add another place"
        />
      </Question>

      <Question n={3} title="Tolls">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-small text-muted">
            How many toll plazas?
            <Input
              inputMode="numeric"
              value={tollCount}
              onChange={(e) => setTollCount(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="For example 4"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-small text-muted">
            About how much in total for a car? (₹)
            <Input
              inputMode="numeric"
              value={tollRupees}
              onChange={(e) => setTollRupees(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="For example 650"
            />
          </label>
        </div>
      </Question>

      <Question n={4} title="When is the best time to leave?">
        <Chips options={SLOTS} value={bestTime} onChange={setBestTime} />
        <p className="mt-4 text-small font-semibold">And the worst time to leave?</p>
        <Chips options={SLOTS} value={worstTime} onChange={setWorstTime} />
      </Question>

      <Question n={5} title="What is the road like, most of the way?">
        <Chips options={ROADS} value={roadType} onChange={setRoadType} />
      </Question>

      <Question n={6} title="How many hours does it really take?">
        <label className="flex flex-col gap-1.5 text-small text-muted">
          With normal stops, start to finish
          <Input
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value.replace(/[^\d.]/g, '').slice(0, 4))}
            placeholder="For example 5.5"
          />
        </label>
      </Question>

      <Question n={7} title="Which car is best for this road?">
        <Chips options={CARS} value={car} onChange={setCar} />
      </Question>

      <Question n={8} title="Anything else we should know?">
        <textarea
          value={other}
          onChange={(e) => setOther(e.target.value.slice(0, 300))}
          rows={3}
          placeholder="Road work, a bad stretch, a diversion…"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-body placeholder:text-faint focus:border-accent"
        />
        <p className="mt-1 text-small text-faint">Only our team reads this.</p>
      </Question>

      {error ? <p className="text-small text-danger">{error}</p> : null}
      <Button type="submit" disabled={busy} className="min-h-14 w-full text-body">
        {busy ? 'Sending…' : 'Send my answer'}
      </Button>
    </form>
  );
}

function Question({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-line bg-surface p-5">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="text-body font-bold">
        <span className="text-muted">{n}. </span>
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            // Tapping the chosen one again clears it — every question can be left unanswered.
            onClick={() => onChange(on ? undefined : o.value)}
            className={`min-h-11 rounded-full border px-4 text-small font-semibold transition-colors ${
              on ? 'border-forest bg-forest text-white' : 'border-line bg-surface text-ink'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function StopRows({
  rows,
  setRows,
  max,
  placeholder,
  pickupLabel,
  addLabel,
}: {
  rows: StopRow[];
  setRows: (r: StopRow[]) => void;
  max: number;
  placeholder: string;
  pickupLabel: string;
  addLabel: string;
}) {
  const update = (i: number, patch: Partial<StopRow>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_12rem]">
          <Input
            aria-label={placeholder}
            value={r.name}
            onChange={(e) => update(i, { name: e.target.value.slice(0, 60) })}
            placeholder={placeholder}
          />
          <Input
            aria-label={`About how many km from ${pickupLabel}`}
            inputMode="numeric"
            value={r.km}
            onChange={(e) => update(i, { km: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder={`km from ${pickupLabel}`}
          />
        </div>
      ))}
      {rows.length < max ? (
        <button
          type="button"
          onClick={() => setRows([...rows, { name: '', km: '' }])}
          className="inline-flex min-h-11 items-center self-start text-small font-semibold text-accent"
        >
          + {addLabel}
        </button>
      ) : null}
    </div>
  );
}
