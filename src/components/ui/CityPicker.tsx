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
}: {
  id: string;
  value: City | null;
  onChange: (city: City | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value?.label ?? '');
  const [options, setOptions] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  /** Which row the arrow keys are on. -1 means none — the typed text still stands. */
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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
        className="w-full text-body rounded-2xl border border-line bg-surface-raised px-5 py-4 font-medium transition-colors placeholder:font-normal placeholder:text-faint hover:border-faint/60 focus:border-ink"
        placeholder={placeholder ?? 'Search a city'}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null); // typing again means the old pick no longer stands
        }}
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
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-surface-raised p-1.5 text-ink shadow-[var(--shadow-deep)]"
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
                    'flex w-full flex-col items-start rounded-xl px-4 py-3 text-left transition-colors ' +
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
                  <span className="font-medium">{c.label}</span>
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
