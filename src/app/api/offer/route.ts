import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * The top strip's content, proxied.
 *
 * Read from the browser rather than baked into the build: every page here is prerendered,
 * and an offer that needed a rebuild to appear is an offer nobody would ever switch on.
 * Cached for a minute on our side so a busy day is not a thousand calls to the backend,
 * and short enough that turning it off is effectively immediate.
 */
export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch(`${env.apiBaseUrl}/public/offer`, { next: { revalidate: 60 } });
    const body = await res.json().catch(() => null);
    if (body?.ok) return NextResponse.json(body.data);
  } catch {
    /* falls through — a strip nobody can fetch simply does not appear */
  }
  return NextResponse.json({ on: false, text: '', code: '' });
}
