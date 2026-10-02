'use client';

import { useState } from 'react';
import { copyCode, useOffer } from '@/lib/useOffer';

/**
 * Our three promises, numbered — beside the booking card, where the hesitation is.
 *
 * It replaced an "OFFERS / Best cabs / Best prices" card that was a competitor's layout with
 * our name on it. These are the things this business already keeps on every trip (the FAQ
 * and "Why us" say the same), so nothing here needs a number to back it.
 *
 * When the desk has an offer switched on, it rides across the top in red with its code —
 * the same offer as the strip above the header, from the same fetch.
 */
const PROMISES = [
  ['Fixed fare', 'What you are quoted is what you pay — no surge, no recalculation.'],
  ['Cash to the driver', 'Nothing to pay when you book. Pay online only if you prefer.'],
  ['Verified drivers', 'Aadhaar, licence and RC checked by a person before the first trip.'],
] as const;

export function PromiseCard({ className = '' }: { className?: string }) {
  const offer = useOffer();
  const [copied, setCopied] = useState(false);
  const live = offer?.on && offer.text;

  return (
    <section
      aria-label="Our promise"
      className={`flex h-full flex-col overflow-hidden rounded-3xl bg-surface-raised ring-1 ring-line ${className}`}
    >
      {live ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 bg-accent px-5 py-3 text-small font-semibold text-white">
          {offer.text}
          {offer.code ? (
            <button
              type="button"
              onClick={async () => {
                if (await copyCode(offer.code)) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="min-h-11 rounded-md border border-dashed border-white/70 px-2.5 font-bold tracking-wider transition-colors hover:bg-white/15"
            >
              {copied ? 'Copied ✓' : offer.code}
            </button>
          ) : null}
        </p>
      ) : null}
      <div className="flex-1 p-5">
        <p className="text-label font-bold uppercase text-faint">Our promise</p>
        <ol className="mt-3 space-y-3">
          {PROMISES.map(([head, body], i) => (
            <li key={head} className="flex gap-3">
              <span className="font-display text-title leading-none text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block text-body font-bold leading-snug">{head}</span>
                <span className="block text-small text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
