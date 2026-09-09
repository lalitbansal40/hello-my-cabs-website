import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

/**
 * Who is signed in, for the header to ask after it has loaded.
 *
 * This route exists because the header cannot ask on the server. Reading the session
 * cookie in a server component opts that route into dynamic rendering, and the header is
 * on every page — including the ninety route pages, the ten city pages and the eight
 * vehicle pages. Measured: doing it there took the build from 105 prerendered pages to
 * none, and turned /[slug] and /routes from static into server-rendered-on-demand. That is
 * the whole of the SEO work, undone by one call.
 *
 * So the header stays static and the account menu asks from the browser instead.
 */
export async function GET() {
  const user = await getCurrentUser();

  // 200 with null, never 401. This is "who are you", not "let me in" — answering 401 to
  // every signed-out visitor fills their console with errors for a question that was
  // answered correctly.
  return NextResponse.json(
    { ok: true, data: { user } },
    {
      // One person's identity must never be handed to the next visitor from a cache.
      headers: { 'cache-control': 'no-store, private' },
    },
  );
}
