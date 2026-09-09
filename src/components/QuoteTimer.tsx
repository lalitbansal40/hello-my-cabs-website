'use client';

import { useEffect, useState } from 'react';

/**
 * How long the quoted price still holds.
 *
 * Deliberately silent for most of the half hour. A clock counting down from thirty minutes
 * next to a price is pressure, and pressure is not what this site sells — the whole point
 * of the fixed fare is that nobody has to hurry. It appears only when the time left is
 * genuinely short enough to matter, and it says what happens rather than just showing
 * digits.
 *
 * `Date.now()` never runs during render: React 19 treats that as impure, and this project
 * has already been bitten by it once.
 */
const SHOW_UNDER_MS = 10 * 60 * 1000;

export function QuoteTimer({
  expiresAt,
  onExpired,
}: {
  expiresAt: string;
  /** Told once, when the price stops being valid, so the form can say so before a tap does. */
  onExpired?: () => void;
}) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    if (!Number.isFinite(end)) return;

    let fired = false;
    const tick = () => {
      const ms = end - Date.now();
      setLeft(ms);
      if (ms <= 0 && !fired) {
        fired = true;
        onExpired?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  if (left === null || left > SHOW_UNDER_MS) return null;

  if (left <= 0) {
    return (
      <p className="rounded-xl bg-danger/10 px-4 py-3 text-[14px] font-semibold text-danger">
        This price has expired. Check the fare again to book at the current rate.
      </p>
    );
  }

  const mins = Math.floor(left / 60_000);
  const secs = Math.floor((left % 60_000) / 1000);

  return (
    <p className="rounded-xl bg-surface-alt px-4 py-3 text-[14px] text-ink-soft">
      This price is held for{' '}
      <strong className="tabular-nums">
        {mins}:{String(secs).padStart(2, '0')}
      </strong>
      . After that we will work it out again — nothing changes without telling you.
    </p>
  );
}
