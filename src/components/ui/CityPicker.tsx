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
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base placeholder:text-faint focus:border-accent"
        placeholder={placeholder ?? 'Sheher likhein'}
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
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface shadow-lg"
        >
          {options.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                role="option"
                aria-selected={value?.name === c.name}
                className="flex w-full flex-col items-start px-4 py-2.5 text-left hover:bg-surface-alt"
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
