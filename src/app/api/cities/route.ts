import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

/**
 * City search for the picker.
 *
 * There are over six thousand cities. Shipping that list to every visitor would cost more
 * than the rest of the page put together, on a connection that is usually mobile data — so
 * the browser asks for the handful it needs and the filtering happens here, on a response
 * this server already has cached.
 */
export const revalidate = 86_400;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim().toLowerCase() ?? '';
  const cities = await api.cities().catch(() => []);

  const matches = q
    ? cities
        .filter((c) => c.label.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
        // A city whose name STARTS with what was typed is what the person meant; one that
        // merely contains it is a fallback. "delhi" should not lead with "New Delhi".
        .sort((a, b) => {
          const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
          const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
          return aStarts - bStarts || a.label.localeCompare(b.label);
        })
    : cities;

  return NextResponse.json({ cities: matches.slice(0, 20) });
}
