'use client';

import { track } from '@/lib/analytics';
import { company } from '@/lib/company';
import { Icon } from './Icons';
import { CallbackFab } from './CallbackFab';
import { fabAway, useFabsVisible } from './useFabsVisible';

/**
 * The button half the customers actually want.
 *
 * A cab is booked on WhatsApp in this market far more often than through any form, and
 * this site had no way to start that conversation — only a phone number in the header,
 * which nobody taps on a laptop.
 *
 * Things it must not do: cover the sticky "Book" bar on a phone (they are both at the
 * bottom, and two targets in one place means neither is safe to press), appear the instant
 * the page loads, sit on the footer's links, or cover a field somebody is typing in — all
 * of which useFabsVisible answers, once, for this and the Call button together.
 */
export function WhatsAppFab() {
  const visible = useFabsVisible();

  const text = encodeURIComponent('Hi, I need a cab. Route: ');
  const href = company.whatsapp ? `https://wa.me/${company.whatsapp}?text=${text}` : null;

  // The Call button (and its "we'll call you" popup) sits above this one, on every page that
  // carries this one — rendered from here so no page can have one without the other.
  return (
    <>
      <CallbackFab visible={visible} />
      {/* No confirmed number, no button. A wa.me link to nothing opens an error page, which
          is worse than not offering it. */}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          aria-hidden={visible ? undefined : true}
          tabIndex={visible ? undefined : -1}
          onClick={() => track('whatsapp_click')}
          // bottom-24 on a phone clears the sticky Book bar (4.5rem + safe area); from `lg`
          // that bar is gone and this can sit where a floating button belongs.
          className={`group fixed bottom-24 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-[opacity,transform] duration-300 hover:scale-105 active:scale-95 motion-reduce:transition-none lg:bottom-6 lg:right-6 lg:h-14 lg:w-14 ${
            visible ? '' : fabAway
          }`}
        >
          {/* Inline, because one icon is not worth a request or a package. */}
          <Icon.whatsapp className="h-6 w-6 lg:h-7 lg:w-7" />
          <span
            aria-hidden
            className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-small font-semibold text-white opacity-0 shadow-[var(--shadow-soft)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
          >
            WhatsApp us
          </span>
        </a>
      ) : null}
    </>
  );
}
