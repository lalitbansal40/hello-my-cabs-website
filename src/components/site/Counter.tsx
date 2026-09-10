'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts up when the number scrolls into view.
 *
 * The finished value is what the server renders, so the figure is in the HTML for a
 * crawler and for anyone whose script never runs — the animation only ever replaces a
 * number that is already correct. Anything else would be trading a fact for an effect.
 */
export function Counter({ to, suffix = '', decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        const already = first;
        first = false;
        if (!entry.isIntersecting) return;
        io.disconnect();
        // Already on screen when the page opened: leave it. Animating then meant the
        // figure the visitor was reading dropped to zero and climbed back — 6,216, 0,
        // 6,216 — which reads as a glitch, not as a flourish.
        if (already) return;
        const start = performance.now();
        const run = (now: number) => {
          // Clamped at both ends. The first animation frame is stamped with the time the
          // frame BEGAN, which can be earlier than the moment `start` was read — so t came
          // out negative, and 1 − (1 − t)³ with it: the hero showed "-218 cities" and "-0".
          const t = Math.max(0, Math.min(1, (now - start) / 1100));
          // Ease out: fast to begin with, settling at the end, the way a dial comes to rest.
          setValue(to * (1 - Math.pow(1 - t, 3)));
          if (t < 1) raf = requestAnimationFrame(run);
        };
        raf = requestAnimationFrame(run);
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
