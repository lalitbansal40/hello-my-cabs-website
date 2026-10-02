import { Icon } from './Icons';

/**
 * Three things that are always true, said under the heading — where somebody deciding
 * whether to trust a cab site is looking, rather than half a page down.
 *
 * Nothing here needs a number to back it. A rating joins them only from real reviews
 * (lib/reviews.ts), never one written here.
 */
const FACTS = [
  { icon: Icon.headset, text: '24×7 desk' },
  { icon: Icon.shield, text: 'Verified drivers' },
  { icon: Icon.tag, text: 'No surge' },
] as const;

export function HeroTrust({
  rating,
  className = '',
}: {
  rating?: { avg: number; count: number } | null;
  className?: string;
}) {
  return (
    <ul className={`mt-3 flex-wrap gap-2 ${className}`} aria-label="Why book with us">
      {FACTS.map(({ icon: I, text }) => (
        <li
          key={text}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1.5 text-small font-semibold text-ink-soft ring-1 ring-line"
        >
          <I className="h-4 w-4 text-accent" />
          {text}
        </li>
      ))}
      {rating ? (
        <li className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1.5 text-small font-semibold text-ink-soft ring-1 ring-line">
          <Icon.star className="h-4 w-4 text-accent" />
          {rating.avg.toFixed(1)} from {rating.count.toLocaleString('en-IN')} trips
        </li>
      ) : null}
    </ul>
  );
}
