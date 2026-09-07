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
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setOptions(data.cities ?? []);
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

  return (
    <div ref={boxRef} className="relative">
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        className="w-full rounded-2xl border border-line bg-surface-raised px-5 py-4 text-[16px] font-medium transition-colors placeholder:font-normal placeholder:text-faint hover:border-faint/60 focus:border-ink"
        placeholder={placeholder ?? 'Search a city'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null); // typing again means the old pick no longer stands
        }}
        onFocus={() => setOpen(true)}
      />
      {open && options.length > 0 ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-surface-raised p-1.5 shadow-[var(--shadow-deep)]"
        >
          {options.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                role="option"
                aria-selected={value?.name === c.name}
                className="flex w-full flex-col items-start rounded-xl px-4 py-3 text-left transition-colors hover:bg-surface-alt"
                onClick={() => {
                  onChange(c);
                  setQuery(c.label);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{c.label}</span>
                {c.state ? <span className="text-xs text-faint">{c.state}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
