import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { submitToIndexNow } from '@/lib/indexnow';

/**
 * Tell Bing that pages changed — every URL in the sitemap, or the ones named in the body.
 *
 * For the backend to call after a fare changes, or for a deploy to call after it goes live.
 * Guarded by the same secret as /api/revalidate: an open endpoint that makes this site
 * submit URLs on anybody's say-so is a way to get the key throttled or distrusted.
 *
 *   POST /api/indexnow?secret=…                 → the whole sitemap
 *   POST /api/indexnow?secret=…  {"urls":[…]}   → only those
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { urls?: unknown } | null;
  let urls = Array.isArray(body?.urls)
    ? body.urls.filter((u): u is string => typeof u === 'string')
    : [];

  if (urls.length === 0) {
    const xml = await fetch(`${env.siteUrl}/sitemap.xml`).then((r) => r.text());
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  }

  const result = await submitToIndexNow(urls);
  return NextResponse.json(
    { ok: result.ok, data: { status: result.status, submitted: result.submitted } },
    { status: result.ok ? 200 : 502 },
  );
}
