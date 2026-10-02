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
  const [atTicket, setAtTicket] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    const target = document.getElementById('book');
    const footer = document.querySelector('footer');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === target) setAtTicket(e.isIntersecting);
          else setAtFooter(e.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );
    if (target) io.observe(target);
    // And at the footer, where it only covered the links somebody scrolled down to reach.
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);
  const hidden = atTicket || atFooter;
  return (
    // `inert` while away: off screen and out of the tab order, not just out of sight.
    <div data-sticky-book inert={hidden} className={`${className} ${hidden ? 'translate-y-full' : ''}`}>
      {children}
    </div>
  );
}
