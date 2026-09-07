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
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const run = (now: number) => {
          const t = Math.min(1, (now - start) / 1100);
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
