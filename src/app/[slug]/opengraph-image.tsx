import { ImageResponse } from 'next/og';
import { api } from '@/lib/api';
import { cityTitle, isAirport, readSlug } from '@/lib/slug';
import { hoursFor, rupees } from '@/lib/seo';
import { OgCard } from '@/lib/og';

/**
 * The card a landing page shows when its link is shared.
 *
 * Every one of these pages used to share the site's generic card — the same headline for
 * ninety different journeys. On WhatsApp, which is where a link about a cab actually
 * travels in this country, the card is most of the message: "Jaipur → Delhi, ₹3,200,
 * 306 km" is an answer, and "Every road. One honest price." is a slogan.
 *
 * The figures come from the same API the page prints, so the card cannot quote a price the
 * page does not show.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Hello My Cab';

/** The shared card (lib/og.tsx) — the same design as the home page's. */
const Card = OgCard;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = readSlug(slug);
  const { routes } = await api.routes().catch(() => ({ routes: [] }));

  if (landing?.kind === 'route') {
    const row = routes.find((r) => r.pickup === landing.pickup && r.drop === landing.drop);
    const A = cityTitle(landing.pickup);
    const B = cityTitle(landing.drop);
    return new ImageResponse(
      <Card
        eyebrow="Outstation taxi"
        headline={`${A} →`}
        accent={B}
        facts={[
          row?.fromRupees ? `from ${rupees(row.fromRupees)}` : 'fixed fare',
          ...(row?.distanceKm ? [`${row.distanceKm} km`, hoursFor(row.distanceKm)] : []),
        ]}
      />,
      size,
    );
  }

  if (landing?.kind === 'city') {
    const A = cityTitle(landing.city);
    const from = routes.filter((r) => r.pickup === landing.city);
    const cheapest = Math.min(...from.map((r) => r.fromRupees ?? Infinity));
    return new ImageResponse(
      <Card
        eyebrow={isAirport(landing.city) ? 'Airport taxi' : 'Cab service'}
        headline={isAirport(landing.city) ? A : 'Cabs in'}
        accent={isAirport(landing.city) ? 'pickup & drop' : A}
        facts={[
          `${from.length} priced routes`,
          ...(Number.isFinite(cheapest) ? [`from ${rupees(cheapest)}`] : []),
          'one way · round trip · hourly',
        ]}
      />,
      size,
    );
  }

  if (landing?.kind === 'vehicle') {
    const { intercity, roundTripOnly } = await api
      .vehicles()
      .catch(() => ({ intercity: [], roundTripOnly: [] }));
    const v = [...intercity, ...roundTripOnly].find((x) => x.key === landing.vehicle);
    const roundOnly = v ? v.tripTypes.length === 1 : false;
    return new ImageResponse(
      <Card
        eyebrow={roundOnly ? 'On rent, with a driver' : 'Taxi, with a driver'}
        headline={v?.label ?? 'Our fleet'}
        facts={[
          ...(v?.seats ? [`${v.seats} seats`] : []),
          roundOnly ? 'round trips' : 'one way · round trip · hourly',
          'fixed fare',
        ]}
      />,
      size,
    );
  }

  // A slug that is none of the three cannot be reached — the segment refuses unknown
  // slugs — but an image route still has to return something.
  return new ImageResponse(
    <Card eyebrow="Hello My Cab" headline="Every road." accent="One honest price." facts={[]} />,
    size,
  );
}
