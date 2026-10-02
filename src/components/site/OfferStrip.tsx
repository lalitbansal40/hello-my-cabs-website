'use client';

import { useEffect, useState } from 'react';
import { fetchOffer, type Offer } from '@/lib/useOffer';

const DISMISS_KEY = 'hmc.offer.dismissed';

/**
 * The strip across the very top — a festival offer, a code, a notice.
 *
 * Fetched in the browser because the pages are prerendered: an offer that needed a
 * rebuild would never be switched on in time for the festival it is about.
 *
 * Nothing renders until there is something to say, so it can never leave a bar of empty
 * colour at the top of the page, and it can never shift the layout on arrival — it is
 * above the header, which is sticky, so the page below does not move.
 */
export function OfferStrip() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let live = true;
    // The shared fetch (lib/useOffer.ts) — the offer card beside the booking card asks for
    // the same thing. sessionStorage, not local: a new offer tomorrow deserves to be seen
    // again by somebody who waved this one away today. Read inside the fetch chain rather
    // than in the effect body, so no state is set while React is still rendering.
    fetchOffer().then((d) => {
      if (!live) return;
      try {
        if (sessionStorage.getItem(DISMISS_KEY)) setDismissed(true);
      } catch {
        /* private mode — showing it is the safe failure */
      }
      setOffer(d);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!offer?.on || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* nothing to remember it with; it comes back on the next page, which is fine */
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* no clipboard permission — the code is on the screen to be read */
    }
  };

  return (
    <div className="bg-clay text-white">
      <div className="mx-auto flex max-w-6xl 2xl:max-w-7xl items-center gap-3 px-5 py-2.5 text-small">
        <p className="min-w-0 flex-1 text-pretty font-semibold">
          {offer.text}
          {offer.code ? (
            <button
              onClick={copy}
              className="ml-2 rounded-full border border-white/35 px-2.5 py-0.5 text-label font-black tracking-wider transition-colors hover:bg-white/15"
            >
              {copied ? 'Copied ✓' : offer.code}
            </button>
          ) : null}
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss offer"
          className="shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
