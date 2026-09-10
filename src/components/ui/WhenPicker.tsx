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
                // py-2 rather than py-1: this is a thumb target on a phone, and a chip
                // that only just fits the text is one that gets missed.
                'rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ' +
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
        Stacked on phones, side by side from 430px up.

        A native date input has an intrinsic minimum around 229px — the browser reserves
        room for dd/mm/yyyy and the picker button whatever you set. Next to the time select
        that made this row 356px, and with the card's padding the whole booking form could
        not go below 406px. On a 320px screen that pushed the hero 106px past the edge,
        where the section's overflow-hidden cut it off in silence: the headline, the
        paragraph and the form itself all ran off the right.

        430px is measured, not chosen: at 390 the two still did not fit and the hero ran 36px
        over; at 430 they do.
      */}
      <div className="flex flex-col gap-2.5 min-[430px]:flex-row">
        <input
          id={`${idPrefix}-date`}
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          aria-label="Pickup date"
          className={`${controlBase} w-full min-w-0 flex-1`}
        />
        <select
          id={`${idPrefix}-time`}
          value={time}
          onChange={(e) => onChange(`${date}T${e.target.value}`)}
          aria-label="Pickup time"
          className={`${controlBase} w-[8.5rem] shrink-0`}
        >
          {slots.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// 16px, not 15.5. Safari zooms the whole page when a focused input is under 16px, and the
// zoom does not come back on blur — the visitor is left on a page they have to pinch out
// of, which on the one form the site exists for is worse than half a pixel of type.
const controlBase =
  'min-w-0 rounded-[0.9rem] border border-line bg-surface-raised px-4 py-3.5 text-[16px] font-medium ' +
  'transition-colors hover:border-faint/60 focus:border-forest';
