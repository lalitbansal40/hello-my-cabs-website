import { ImageResponse } from 'next/og';
import { api } from '@/lib/api';
import { cityTitle, readSlug } from '@/lib/slug';
import { hoursFor, rupees } from '@/lib/seo';

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

const Mark = () => (
  <svg width="64" height="64" viewBox="0 0 32 32">
    <path
      d="M6 24c0-7 4-10 10-10s10-3 10-10"
      fill="none"
      stroke="#00C26E"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeDasharray="0.1 5.2"
    />
    <circle cx="6" cy="24" r="3.6" fill="#00C26E" />
    <circle cx="26" cy="4" r="3.6" fill="none" stroke="#00C26E" strokeWidth="2.6" />
  </svg>
);

function Card({
  eyebrow,
  headline,
  accent,
  facts,
}: {
  eyebrow: string;
  headline: string;
  accent?: string;
  facts: string[];
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 84,
        background: 'linear-gradient(160deg, #10402F 0%, #0B2C22 60%, #08211A 100%)',
        color: 'white',
        fontFamily: 'serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <Mark />
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.55)', letterSpacing: 3 }}>
          {eyebrow.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 78, lineHeight: 1.05, letterSpacing: -2 }}>{headline}</div>
        {accent ? (
          <div style={{ fontSize: 78, lineHeight: 1.05, letterSpacing: -2, color: '#00C26E' }}>
            {accent}
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 28, marginTop: 34 }}>
          {facts.map((f) => (
            <div key={f} style={{ fontSize: 30, color: 'rgba(255,255,255,0.62)' }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        eyebrow="Cab service"
        headline="Cabs in"
        accent={A}
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
