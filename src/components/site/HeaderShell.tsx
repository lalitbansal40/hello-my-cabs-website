'use client';

import { useEffect, useState } from 'react';
import { OfferStrip } from './OfferStrip';

/**
 * The bar itself: white, always — the page under it is light now (the dark hero it used to
 * sit on is gone), so a see-through bar would only put text over text.
 *
 * Once the page has moved, a soft shadow lifts it off the content. The scroll handler is
 * passive and does one boolean; nothing here reads layout, so it cannot force a reflow
 * while somebody is flicking down the page.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 8);
      });
    };
    onScroll(); // a reload halfway down the page starts with the shadow
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <OfferStrip />
      <header
      className={`sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? 'shadow-[var(--shadow-soft)]' : ''
      }`}
    >
      {children}
      {/*
        How far down the page you are, drawn by the scroll itself — no listener, no state.
        Where the browser has no scroll timeline the bar simply stays at zero width, which
        is indistinguishable from not having it.
      */}
      <div
        aria-hidden
        // scale-x-0 is the resting state, not the animation's: without a scroll timeline
        // there is no animation at all, and a bar left at its natural width would sit
        // across the header permanently claiming the page was fully read.
        className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent"
      />
      </header>
    </>
  );
}
