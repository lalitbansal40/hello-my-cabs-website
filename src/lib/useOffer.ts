'use client';

import { useEffect, useState } from 'react';

export interface Offer {
  on: boolean;
  text: string;
  code: string;
}

/**
 * The offer the desk has switched on (or not), fetched once per page.
 *
 * Two things on the home page show it — the strip across the top and the offer card beside
 * the booking card — and /api/offer is not cached by the browser, so each asking for itself
 * was two requests for one answer. One promise, shared; a failed fetch is "no offer".
 */
let pending: Promise<Offer> | null = null;

export function fetchOffer(): Promise<Offer> {
  pending ??= fetch('/api/offer')
    .then((r) => r.json() as Promise<Offer>)
    .catch(() => {
      pending = null; // a later page may try again
      return { on: false, text: '', code: '' };
    });
  return pending;
}

/** null while loading; then the offer (whose `on` may be false). */
export function useOffer(): Offer | null {
  const [offer, setOffer] = useState<Offer | null>(null);
  useEffect(() => {
    let live = true;
    fetchOffer().then((o) => live && setOffer(o));
    return () => {
      live = false;
    };
  }, []);
  return offer;
}

/** Put an offer code on the clipboard. False when the browser will not allow it — the code
 *  is on the screen to be read, so that is not an error worth showing. */
export async function copyCode(code: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    return false;
  }
}

