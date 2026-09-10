'use client';

import { useEffect, useMemo } from 'react';

const SLOT_MINUTES = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** yyyy-mm-dd in the browser's own timezone. toISOString() would shift the day in IST. */
function toDateValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toTimeValue(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "09:30" → "9:30 AM". A 24-hour clock reads as a timetable, not a pickup. */
function label(time: string) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** The first slot at or after `from`, rounded up to the next half hour. */
function firstSlotAfter(from: Date) {
  const d = new Date(from);
  d.setSeconds(0, 0);
  const over = d.getMinutes() % SLOT_MINUTES;
  d.setMinutes(d.getMinutes() + (over === 0 ? 0 : SLOT_MINUTES - over));
  return d;
}

/**
 * Date and time as two fields rather than one `datetime-local`.
 *
 * A native datetime input renders as `dd/mm/yyyy, --:-- --` until it is filled, which on a
 * card this size reads as a field that failed to load. It also looks different in every
 * browser, so the one control nobody styled is the one that decides whether the rest looks
 * deliberate.
 *
 * Both fields carry a value from the moment the widget mounts, so the form is never asking
 * to be repaired before it can be used. Times are offered as slots because a pickup is
 * agreed to the half hour, not to the minute, and a list of valid choices cannot be typed
 * wrong.
 */
export function WhenPicker({
  idPrefix,
  value,
  onChange,
  notBefore,
  showQuickDays = true,
}: {
  idPrefix: string;
  /** `yyyy-mm-ddTHH:mm`, or '' before the defaults land. */
  value: string;
  onChange: (next: string) => void;
  /** Nothing at or before this instant may be picked. */
  notBefore: Date;
  showQuickDays?: boolean;
}) {
  const [date, time] = value ? value.split('T') : ['', ''];

  // Defaults are set after mount, not during render: the server and the browser do not
  // share a clock, and a value computed in both places is a hydration mismatch.
  useEffect(() => {
    if (value) return;
    const start = firstSlotAfter(notBefore);
    onChange(`${toDateValue(start)}T${toTimeValue(start)}`);
    // Runs once to seed the field; later edits come from the controls below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minDate = toDateValue(notBefore);

  // On the earliest allowed day the past is not on offer; on any later day the whole day is.
  const slots = useMemo(() => {
    const out: string[] = [];
    const cursor =
      date === minDate ? firstSlotAfter(notBefore) : new Date(`${date || minDate}T00:00:00`);
    const end = new Date(`${date || minDate}T00:00:00`);
    end.setDate(end.getDate() + 1);
    for (let t = new Date(cursor); t < end; t.setMinutes(t.getMinutes() + SLOT_MINUTES)) {
      out.push(toTimeValue(t));
    }
    return out;
  }, [date, minDate, notBefore]);

  function setDate(nextDate: string) {
    // Moving to a day whose slots no longer include the chosen time would leave the select
    // showing a value it does not contain, so the time follows the day back into range.
    const earliestOnDay = nextDate === minDate ? toTimeValue(firstSlotAfter(notBefore)) : '00:00';
    const keepsTime = Boolean(time) && time >= earliestOnDay;
    onChange(`${nextDate}T${keepsTime ? time : earliestOnDay}`);
  }

  const quickDays = useMemo(() => {
    const base = new Date(notBefore);
    return [
      { label: 'Today', value: toDateValue(base) },
      { label: 'Tomorrow', value: toDateValue(new Date(base.getTime() + DAY_MS)) },
    ];
  }, [notBefore]);

  return (
    <div className="min-w-0">
      {showQuickDays ? (
        <div className="mb-2 flex gap-2">
          {quickDays.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDate(d.value)}
              aria-pressed={date === d.value}
              className={
                // 44px tall: a thumb target on a phone. At 34px these were the easiest
                // thing on the form to miss.
                'inline-flex min-h-11 items-center rounded-full px-4 text-small font-bold transition-colors ' +
                (date === d.value
                  ? 'bg-forest text-white'
                  : 'bg-surface-alt text-muted hover:text-ink')
              }
            >
              {d.label}
            </button>
          ))}
        </div>
      ) : null}

      {/*
        Side by side only when THIS picker has the room — a container query, not a
        viewport one.

        A native date input has an intrinsic minimum around 229px whatever you set: the
        browser reserves room for dd/mm/yyyy and the picker button. The first fix put the
        two side by side from a 430px viewport, which was right for a phone and wrong for a
        tablet: at 768 the form sits in a 380px column, the date got about 154px, and its
        last digit disappeared under the calendar icon — "10/09/202". What matters is the
        width of the picker, so that is what decides. The threshold is measured: date at its
        minimum, the gap, and the time select — 22rem.
      */}
      <div className="@container">
        <div className="flex flex-col gap-2.5 @min-[22rem]:flex-row">
          <input
            id={`${idPrefix}-date`}
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            aria-label="Pickup date"
            className={`${controlBase} w-full min-w-0 flex-1 pr-3`}
          />
          <select
            id={`${idPrefix}-time`}
            value={time}
            onChange={(e) => onChange(`${date}T${e.target.value}`)}
            aria-label="Pickup time"
            // Full width when stacked; a half-width select under a full-width date read
            // as a mistake.
            className={`${controlBase} w-full shrink-0 @min-[22rem]:w-[8.5rem]`}
          >
            {slots.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// text-body never goes under 16px. Safari zooms the whole page when a focused input is under 16px, and the
// zoom does not come back on blur — the visitor is left on a page they have to pinch out
// of, which on the one form the site exists for is worse than half a pixel of type.
const controlBase =
  'min-h-12 min-w-0 rounded-[0.9rem] border border-line bg-surface-raised px-4 py-3 text-body font-medium ' +
  'transition-colors hover:border-faint/60 focus:border-forest';
