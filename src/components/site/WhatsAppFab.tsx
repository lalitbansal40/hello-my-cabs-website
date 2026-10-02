'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { company } from '@/lib/company';
import { Icon } from './Icons';

/**
 * The button half the customers actually want.
 *
 * A cab is booked on WhatsApp in this market far more often than through any form, and
 * this site had no way to start that conversation — only a phone number in the header,
 * which nobody taps on a laptop.
 *
 * Two things it must not do: cover the sticky "Book" bar on a phone (they are both at the
 * bottom, and two targets in one place means neither is safe to press), and appear the
 * instant the page loads, when three other things are already arriving.
 */
export function WhatsAppFab() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Late enough that the hero has finished introducing itself.
    const t = setTimeout(() => setShown(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // No confirmed number, no button. A wa.me link to nothing opens an error page, which is
  // worse than not offering it.
  if (!shown || !company.whatsapp) return null;

  const text = encodeURIComponent('Hi, I need a cab. Route: ');
  const href = `https://wa.me/${company.whatsapp}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={() => track('whatsapp_click')}
      // bottom-24 on a phone clears the sticky Book bar (4.5rem + safe area); from `lg`
      // that bar is gone and this can sit where a floating button belongs.
      className="enter fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none lg:bottom-6 lg:right-6"
    >
      {/* Inline, because one icon is not worth a request or a package. */}
      <Icon.whatsapp className="h-7 w-7" />
    </a>
  );
}
