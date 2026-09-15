'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { company } from '@/lib/company';

const OUR_NUMBER = company.phoneHref.replace(/\D/g, '');

/**
 * Counts taps on our phone number, wherever it is on the site.
 *
 * For a cab company the call is a conversion as real as a booking form — often more of them
 * — and without this the website's worth would be measured on forms alone. One listener on
 * the document rather than an onClick on each of the twenty `tel:` links, most of which are
 * in server components.
 *
 * Only our own number counts (a customer tapping their driver's number on a booking page is
 * not a lead), and nothing about the visitor is sent: on a route page, the route; elsewhere,
 * nothing at all — a path like /booking/<id> must never leave the site.
 */
export function CallTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (!a || (a.getAttribute('href') ?? '').replace(/\D/g, '') !== OUR_NUMBER) return;
      const m = window.location.pathname.match(/^\/([a-z-]+)-to-([a-z-]+)-cab$/);
      const key = (s: string) => s.toUpperCase().replace(/-/g, '_');
      track('call_click', m ? { route: `${key(m[1])}-${key(m[2])}` } : {});
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
