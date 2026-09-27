'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { company } from '@/lib/company';

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
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </a>
  );
}
