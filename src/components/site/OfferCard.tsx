'use client';

import Link from 'next/link';
import { useOffer } from '@/lib/useOffer';
import { CarMark } from './Brand';
import { Icon } from './Icons';

/**
 * The offers card beside the booking card.
 *
 * When the desk has an offer switched on, it is that offer — its words and its code, the
 * same one the strip at the top shows. When there is none, it says the three things that
 * are always true here. It never shows a discount nobody is giving: a "20% off" that the
 * booking then does not apply is the fastest way to lose the person who believed it.
 */
export function OfferCard({ className = '' }: { className?: string }) {
  const offer = useOffer();
  const live = offer?.on && offer.text;
  return (
    <section
      aria-label="Offers"
      className={`relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface-raised p-5 shadow-[var(--shadow-soft)] ${className}`}
    >
      {/* A big faint car in the corner — the logo's, not a photograph of a car we may not run. */}
      <CarMark className="pointer-events-none absolute -bottom-2 -right-6 h-auto w-48 opacity-[0.12]" />
      <div>
        <span className="inline-flex rounded-md bg-[#ffd27a] px-2.5 py-1 text-label font-black uppercase tracking-wider text-ink">
          Offers
        </span>
        {live ? (
          <p className="mt-3 text-pretty text-body font-bold">
            {offer.text}
            {offer.code ? (
              <span className="ml-2 inline-block rounded-md border border-dashed border-accent px-2 py-0.5 text-small font-black tracking-wider text-accent">
                {offer.code}
              </span>
            ) : null}
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-body font-bold">
            {['Best cabs', 'Fixed fares, no surge', 'Verified drivers'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon.check className="h-4 w-4 shrink-0 text-accent" />
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link
        href="/#book"
        className="relative mt-4 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-ink px-5 text-small font-black uppercase tracking-wide text-white transition-colors hover:bg-accent"
      >
        Book now
        <Icon.arrow className="h-4 w-4" />
      </Link>
    </section>
  );
}
