import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CACHE_TAG } from '@/lib/api';

/**
 * Purge everything read from the backend.
 *
 * Call this after a backend deploy. Prices are cached for a day, which is right for
 * values that barely move — but a deploy can change the SHAPE of a response, and without
 * this the site would serve the old shape until the cache aged out on its own.
 *
 * Guarded by a shared secret: an open purge endpoint is a way to make every visitor's
 * next request hit the database.
 *
 * ⚠️ ON AMPLIFY THIS DOES NOTHING. Amplify Hosting supports time-based ISR but not
 * on-demand ISR, so this returns ok and purges no cache. There is no error to notice —
 * which is the danger, because a deploy script calling it would appear to succeed.
 *
 * What still works there is the 24-hour `revalidate` on each page, so a price change in
 * the backend reaches the site within a day rather than immediately. If that gap ever
 * matters, the fix is the host, not this file.
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  }
  // Next 16 wants the cache profile too. 'max' is the right one here: purge it
  // outright rather than shortening its life.
  revalidateTag(CACHE_TAG, 'max');
  return NextResponse.json({ ok: true, data: { purged: CACHE_TAG } });
}
