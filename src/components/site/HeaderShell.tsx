'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OfferStrip } from './OfferStrip';

/**
 * The bar itself: see-through over the hero, solid once you have moved.
 *
 * On the home page the header sits ON the dark hero, so a solid bar there draws a line
 * across the first thing anybody sees. Everywhere else the content starts right under it
 * and a see-through bar would put text over text — hence the path check rather than a
 * prop, which every page would have had to remember to pass.
 *
 * The scroll handler is passive and does one boolean; nothing here reads layout, so it
 * cannot force a reflow while somebody is flicking down the page.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const onHero = usePathname() === '/';
  const [scrolled, setScrolled] = useState(!onHero);

  useEffect(() => {
    if (!onHero) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll(); // a reload halfway down the page must not start see-through
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [onHero]);

  return (
    <>
      <OfferStrip />
      <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? 'border-white/[0.08] bg-[#0b2c22]/80 backdrop-blur-2xl'
          : 'border-transparent bg-transparent'
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
        className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent/70"
      />
      </header>
    </>
  );
}
