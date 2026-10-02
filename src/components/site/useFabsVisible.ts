'use client';

import { useEffect, useState } from 'react';

/** Long enough that the page has introduced itself; the same for both buttons. */
const ARRIVE_AFTER_MS = 1200;

/**
 * Whether the round Call and WhatsApp buttons at the bottom right should show.
 *
 * Both read this one answer, so they arrive together (they used to come 2.5 s apart) and
 * step aside together:
 *  - at the footer, where they sat on top of its links and its own large phone number;
 *  - while somebody is typing on a phone — the keyboard pushes them up over the very field
 *    being filled in;
 *  - while somebody scrolls DOWN on a phone, reading. A floating button sits over whatever
 *    passes under it, and on a phone the route cards' prices pass right under it. They
 *    come back on any scroll up, and a second after the scrolling stops.
 * An IntersectionObserver for the footer, focus events and the visual viewport for the
 * keyboard, and one passive scroll listener (phones only) for the direction.
 */
export function useFabsVisible(): boolean {
  const [arrived, setArrived] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const [typing, setTyping] = useState(false);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setArrived(true), ARRIVE_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { threshold: 0 });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Only where there is an on-screen keyboard; a laptop's focus is not in the way.
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    const isField = (el: Element | null) =>
      !!el && (el.matches('input:not([type=radio]):not([type=checkbox]):not([type=button])') || el.matches('textarea, select'));
    const sync = () => {
      const vv = window.visualViewport;
      const squeezed = vv ? vv.height < window.innerHeight * 0.75 : false;
      setTyping(squeezed || isField(document.activeElement));
    };
    // focusout fires before the next element has focus — look once the dust settles.
    const later = () => setTimeout(sync, 0);
    document.addEventListener('focusin', sync);
    document.addEventListener('focusout', later);
    window.visualViewport?.addEventListener('resize', sync);
    return () => {
      document.removeEventListener('focusin', sync);
      document.removeEventListener('focusout', later);
      window.visualViewport?.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    let lastY = window.scrollY;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const y = window.scrollY;
      // A few pixels of jitter is not a direction.
      if (Math.abs(y - lastY) > 6) {
        setReading(y > lastY);
        lastY = y;
      }
      clearTimeout(idle);
      idle = setTimeout(() => setReading(false), 1000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idle);
    };
  }, []);

  return arrived && !atFooter && !typing && !reading;
}

/** The classes for a button that may step aside: faded, lowered, and untouchable. */
export const fabAway = 'pointer-events-none translate-y-3 opacity-0';
