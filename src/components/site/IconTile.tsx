import type { ReactNode } from 'react';

/**
 * The 48px tile a card wears above its title.
 *
 * One component because three different cards use it, and three copies of the same six
 * lines is three places to forget when one of them changes.
 *
 * The default is the site's line style — a red line drawing in a thin red ring, no filled
 * box (2 Oct 2026; it was a gold square, the stock look of a thousand landing pages). The
 * colour is decoration either way: whatever sits inside must never be the only thing
 * carrying a meaning.
 * That is why the whole tile is hidden from a screen reader — the meaning is in the
 * heading underneath it, every time.
 */
export function IconTile({
  children,
  tone = 'line',
}: {
  children: ReactNode;
  tone?: 'line' | 'gold' | 'accent' | 'clay';
}) {
  const tones = {
    line: 'rounded-full border-hmc-focus/40 bg-transparent text-hmc-link',
    gold: 'bg-hmc-gold-soft text-hmc-gold border-gold/20',
    accent: 'bg-hmc-primary/10 text-hmc-link-hover border-hmc-focus/20',
    clay: 'bg-hmc-warning-fill/10 text-hmc-warning border-hmc-warning/25',
  } as const;

  return (
    <span
      aria-hidden
      className={`mb-4 grid h-12 w-12 place-items-center rounded-[10px] border-2 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
