'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReviewSummary } from '@/lib/api';
import { env } from '@/lib/env';
import { worthShowing } from '@/lib/review-rules';
import { RatingSummary } from './RatingSummary';

/** Whose rating: a route, a city, or the whole site. */
export type RatingOf = { pickup: string; drop: string } | { city: string } | 'site';

function urlFor(of: RatingOf): string {
  const base = `${env.apiBaseUrl}/public/reviews`;
  if (of === 'site') return `${base}/site`;
  if ('city' in of) return `${base}?city=${encodeURIComponent(of.city)}`;
  return `${base}?pickup=${encodeURIComponent(of.pickup)}&drop=${encodeURIComponent(of.drop)}`;
}

/**
 * The rating block, always the latest count (owner, 9 Oct 2026).
 *
 * The page is cached for an hour, and so is what the server printed here. Rather than
 * rebuild pages more often — more compute on every page, every few minutes — the visitor's
 * browser asks the backend for this one block as it scrolls near: one small read, only for
 * people who get this far, and a new rating shows on the next visit.
 *
 * The server's figures render first, so the block is in the HTML for crawlers and for a
 * browser without JavaScript; this only replaces them. Below MIN_REVIEWS the block appears
 * or goes away with the fresh count. A failed request keeps what the server printed. The
 * page's structured data stays the server's — it changes on the hourly rebuild.
 */
export function LiveRatingSummary({
  initial,
  of,
  ...props
}: {
  initial: ReviewSummary | null;
  of: RatingOf;
  title: string;
  ratedBy: string;
}) {
  const [reviews, setReviews] = useState(initial);
  const anchor = useRef<HTMLDivElement>(null);
  const key = urlFor(of);

  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    let live = true;
    const load = () =>
      fetch(key, { headers: { accept: 'application/json' } })
        .then((r) => r.json())
        .then((body) => {
          if (live && body?.ok) setReviews(worthShowing(body.data));
        })
        .catch(() => {});
    // Not on load: most visitors never scroll this far, and the first screen comes first.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        load();
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
    };
  }, [key]);

  return (
    <div ref={anchor}>
      <RatingSummary reviews={reviews} {...props} />
    </div>
  );
}
