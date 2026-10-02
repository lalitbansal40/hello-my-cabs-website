'use client';

import { useEffect, useState } from 'react';

/**
 * The Book bar's own element, slid away while the booking ticket (#book) is on screen.
 *
 * The bar exists to bring the ticket back when it is far above. On the first screen of the
 * home page it did the opposite: it sat over the ticket's own "See fares" button. Watched
 * with an IntersectionObserver — no scroll handler. Pages without a #book keep the bar.
 */
export function BookBarShell({ className, children }: { className: string; children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const target = document.getElementById('book');
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(target);
    return () => io.disconnect();
  }, []);
  return (
    // `inert` while away: off screen and out of the tab order, not just out of sight.
    <div data-sticky-book inert={hidden} className={`${className} ${hidden ? 'translate-y-full' : ''}`}>
      {children}
    </div>
  );
}
