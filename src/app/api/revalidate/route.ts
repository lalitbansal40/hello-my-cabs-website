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
