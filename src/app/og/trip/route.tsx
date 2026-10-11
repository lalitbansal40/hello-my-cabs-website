import { ImageResponse } from 'next/og';
import { OgCard, OgRouteCard } from '@/lib/og';
import { ogCities } from '@/lib/og-cities';
import { tripShare } from '@/lib/trip-share';

/**
 * GET /og/trip?tripType=&pickup=&drop=&hours= — the card a shared link to the booking funnel
 * shows (lib/trip-share.ts): the route, the from-price and the distance, on the same design as
 * every landing page's card. Anything it cannot read gets the site's own card.
 */
const size = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const q = Object.fromEntries(new URL(request.url).searchParams) as Record<string, string>;
  const share = await tripShare(q);
  const image = new ImageResponse(
    share ? (
      // Each city's photo, the route and the price (12 Oct 2026).
      <OgRouteCard eyebrow={share.eyebrow} cities={ogCities(share.cities)} facts={share.facts} />
    ) : (
      <OgCard eyebrow="Hello My Cab" headline="Every road." accent="One honest price." facts={[]} />
    ),
    size,
  );
  // A day: the from-price moves rarely, and WhatsApp fetches a card once per link anyway.
  image.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
  return image;
}
