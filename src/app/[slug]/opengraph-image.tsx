import { ImageResponse } from 'next/og';
import { api } from '@/lib/api';
import { cityTitle, isAirport, readSlug } from '@/lib/slug';
import { rupees } from '@/lib/seo';
import { OgCard } from '@/lib/og';
import { vehicleName } from '@/lib/vehicle-name';

/**
 * The card a landing page shows when its link is shared.
 *
 * Every one of these pages used to share the site's generic card — the same headline for
 * ninety different journeys. On WhatsApp, which is where a link about a cab actually
 * travels in this country, the card is most of the message: "Jaipur → Delhi, from ₹3,200" is
 * an answer, and "Every road. One honest price." is a slogan. The route on one line and the
 * price alone (10 Oct 2026) — the distance and the hours are on the page.
 *
 * The figures come from the same API the page prints, so the card cannot quote a price the
 * page does not show.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The card's alt text, per page (7 Oct 2026) — it used to say "Hello My Cab" on every one of
 * them. The words are the page's own: the route and its from-price, the city, the car.
 */
export async function generateImageMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  // Plain in the docs, but a promise (or absent while the build collects page data) in
  // practice — take either, and the generic alt when there is no slug.
  const slug = (await params)?.slug;
  const landing = slug ? readSlug(slug) : null;
  const { routes } = await api.routes().catch(() => ({ routes: [] }));
  let alt = 'Hello My Cab — outstation taxi with a fixed fare';
  if (landing?.kind === 'route' || landing?.kind === 'routeRound' || landing?.kind === 'routeCar') {
    const A = cityTitle(landing.pickup);
    const B = cityTitle(landing.drop);
    const row = routes.find((r) => r.pickup === landing.pickup && r.drop === landing.drop);
    alt =
      landing.kind === 'routeRound'
        ? `${A} to ${B} round trip taxi — Hello My Cab`
        : landing.kind === 'routeCar'
          ? `${A} to ${B} by ${vehicleName(landing.vehicle)} — Hello My Cab`
          : `${A} to ${B} taxi${row?.fromRupees ? ` from ${rupees(row.fromRupees)}` : ''} — Hello My Cab`;
  } else if (landing?.kind === 'city') {
    const from = routes.filter((r) => r.pickup === landing.city);
    const cheapest = Math.min(...from.map((r) => r.fromRupees ?? Infinity));
    alt = `Taxi service in ${cityTitle(landing.city)}${
      Number.isFinite(cheapest) ? ` from ${rupees(cheapest)}` : ''
    } — Hello My Cab`;
  } else if (landing?.kind === 'vehicle') {
    alt = `${vehicleName(landing.vehicle)} with a driver — Hello My Cab`;
  }
  return [{ id: 'card', alt, size, contentType }];
}

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
        inline
        eyebrow="Outstation taxi"
        headline={`${A} →`}
        accent={B}
        // The price only (10 Oct 2026) — the distance and the hours are on the page.
        facts={[row?.fromRupees ? `from ${rupees(row.fromRupees)}` : 'fixed fare']}
      />,
      size,
    );
  }

  // A route's round trip and its by-car pages: the route's card, saying which one it is.
  if (landing?.kind === 'routeRound' || landing?.kind === 'routeCar') {
    return new ImageResponse(
      <Card
        inline
        eyebrow={landing.kind === 'routeRound' ? 'Round trip taxi' : `By ${vehicleName(landing.vehicle)}`}
        headline={`${cityTitle(landing.pickup)} →`}
        accent={cityTitle(landing.drop)}
        facts={[landing.kind === 'routeRound' ? 'there and back' : 'driver included', 'fixed fare']}
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
