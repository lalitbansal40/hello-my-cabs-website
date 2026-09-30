import type { ReactNode } from 'react';

/**
 * The 48px tile a card wears above its title.
 *
 * One component because three different cards use it, and three copies of the same six
 * lines is three places to forget when one of them changes.
 *
 * The colour is decoration: gold on this ivory is 3.07:1, which is a UI ratio and not a
 * reading one, so whatever sits inside must never be the only thing carrying a meaning.
 * That is why the whole tile is hidden from a screen reader — the meaning is in the
 * heading underneath it, every time.
 */
export function IconTile({
  children,
  tone = 'gold',
}: {
  children: ReactNode;
  tone?: 'gold' | 'accent' | 'clay';
}) {
  const tones = {
    gold: 'bg-gold-soft text-gold border-gold/20',
    accent: 'bg-accent/10 text-accent-dark border-accent/20',
    clay: 'bg-clay/10 text-clay border-clay/25',
  } as const;

  return (
    <span
      aria-hidden
      className={`mb-4 grid h-12 w-12 place-items-center rounded-[10px] border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
