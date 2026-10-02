'use client';

import { useEffect, useRef, useState } from 'react';
import type { City } from '@/lib/api';

/**
 * A searchable city input.
 *
 * Not a <select>: there are over six thousand cities, and a native dropdown of that size is
 * unusable on a phone — which is where most of this traffic is. Matches are fetched as the
 * person types, debounced, so the list never has to be downloaded.
 */
export function CityPicker({
  id,
  value,
  onChange,
  placeholder,
  variant = 'box',
}: {
  id: string;
  value: City | null;
  onChange: (city: City | null) => void;
  placeholder?: string;
  /**
   * `box` — a bordered field, as on every funnel page. `line` — written on the booking
   * ticket: no box, a rule underneath and the city set large, as a destination is printed on
   * a ticket. Only the look differs; the list, the keys and the sync are the same.
   */
  variant?: 'box' | 'line';
}) {
  const [query, setQuery] = useState(value?.label ?? '');
  const [options, setOptions] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  /** Which row the arrow keys are on. -1 means none — the typed text still stands. */
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /**
   * The box shows what was picked, even when the pick changes from OUTSIDE — the swap
   * button trades pickup and drop, and without this both boxes kept the names that were
   * typed into them while the trip underneath had turned round.
   *
   * Compared during render (React's "adjusting state when a prop changes"), not in an
   * effect, so there is no frame showing the old name. One exception: typing clears the
   * pick (onChange(null) below) — that null must not wipe what is being typed.
   */
  const [shown, setShown] = useState(value);
  const [typing, setTyping] = useState(false);
  if (value !== shown) {
    setShown(value);
    if (value) setQuery(value.label);
    else if (!typing) setQuery('');
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setOptions(data.cities ?? []);
        // A new set of matches invalidates whichever row the keyboard was on.
        setActive(-1);
      } catch {
        setOptions([]); // a failed lookup shows nothing, never a stale list
      }
    }, 200); // debounce: a keystroke is not a request
    return () => clearTimeout(t);
  }, [query, open]);

  // Clicking away closes the list. Without this it hangs over the rest of the form.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function choose(c: City) {
    setTyping(false);
    onChange(c);
    setQuery(c.label);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        className={
          variant === 'line'
            ? // 16px minimum is kept by text-title (18 → 22): Safari zooms a focused input under 16.
              'w-full min-h-11 border-0 border-b-2 border-line bg-transparent px-0 pb-1 pt-0.5 font-display text-title text-ink transition-colors placeholder:font-sans placeholder:text-body placeholder:font-normal placeholder:text-faint hover:border-faint focus:border-accent'
            : 'w-full text-body rounded-2xl border border-line bg-surface-raised px-5 py-4 font-medium transition-colors placeholder:font-normal placeholder:text-faint hover:border-faint/60 focus:border-ink'
        }
        placeholder={placeholder ?? 'Search a city'}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setTyping(true);
          if (value) onChange(null); // typing again means the old pick no longer stands
        }}
        onBlur={() => setTyping(false)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          // The list was reachable by mouse only. On a laptop that makes the first field
          // of the booking form a dead end for anyone not using one.
          if (e.key === 'Escape') {
            setOpen(false);
            setActive(-1);
            return;
          }
          if (!open || options.length === 0) return;

          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault(); // or the caret jumps to the end of the text
            setActive((i) => {
              const next = e.key === 'ArrowDown'
                ? (i + 1) % options.length
                : (i <= 0 ? options.length : i) - 1;
              // Keep the highlighted row in view when it walks past the visible window.
              listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
              return next;
            });
          } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            choose(options[active]);
          }
        }}
      />
      {open && options.length > 0 ? (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          /* `text-ink` here too. This list is its own layer and gets dropped into a dark
             hero and a light funnel page alike; inheriting from either one leaves it wrong
             on the other. */
          /* Half the visible height, not a fixed 288px: with the keyboard up on a phone
             the window is about 400px tall, and a list taller than that pushed the rows
             a person is reading behind the keys. */
          // The list used to appear in one frame, which on a phone reads as the page
          // jumping rather than as something opening under the finger.
          className="swap-in absolute z-30 mt-2 max-h-[50svh] w-full overflow-auto overscroll-contain rounded-2xl border border-line bg-surface-raised p-1.5 text-ink shadow-[var(--shadow-deep)]"
        >
          {options.map((c, i) => {
            const chosen = value?.name === c.name;
            return (
              <li key={c.name}>
                <button
                  type="button"
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={chosen}
                  /* Three states, and they had one appearance between them: aria-selected
                     was set but nothing showed it, so the city already picked looked like
                     every other row. */
                  className={
                    'flex min-h-11 w-full flex-col items-start justify-center rounded-xl px-4 py-2.5 text-left transition-colors ' +
                    (chosen
                      ? 'bg-forest text-white'
                      : i === active
                        ? 'bg-surface-alt'
                        : 'hover:bg-surface-alt')
                  }
                  // Mouse and keyboard agree on which row is live, so moving the pointer
                  // does not leave a second row highlighted somewhere else.
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(c)}
                >
                  <span className="text-body font-medium">{c.label}</span>
                  {c.state ? (
                    <span className={`text-small ${chosen ? 'text-white/60' : 'text-faint'}`}>
                      {c.state}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
