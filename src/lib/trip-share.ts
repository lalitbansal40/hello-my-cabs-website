import type { Metadata } from 'next';
import { api } from './api';
import { cityTitle, routePath } from './slug';
import { rupees } from './seo';

/**
 * What a shared link to the booking funnel shows (10 Oct 2026).
 *
 * People share the fares page — `/booking?pickup=CHANDIGARH&drop=DELHI…` — far more than the
 * route page, and it used to show the home page's card: "Every road. One honest price." for a
 * link that is about one trip. This reads the trip out of the link and says it: the route, the
 * from-price and the distance, on the same card design every landing page uses (lib/og.tsx).
 *
 * The pages stay out of search (noindex) — this is the preview, not a landing page.
 */

export interface TripShare {
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  accent?: string;
  facts: string[];
  /** The route's own landing page, when there is one — what the card's og:url names. */
  landing?: string;
}

type Query = Record<string, string | undefined>;

/** A city key the way the funnel carries it: CHANDIGARH, DELHI_AIRPORT. Nothing else. */
const CITY = /^[A-Z][A-Z_]{1,39}$/;

/** The trip in the link, or null when there is no trip to describe. Never throws. */
export async function tripShare(q: Query): Promise<TripShare | null> {
  const tripType = q.tripType === 'round_trip' || q.tripType === 'local' ? q.tripType : 'one_way';
  const pickup = q.pickup && CITY.test(q.pickup) ? q.pickup : '';
  const drop = q.drop && CITY.test(q.drop) ? q.drop : '';
  if (!pickup) return null;
  const A = cityTitle(pickup);

  if (tripType === 'local') {
    const hours = Number(q.hours);
    const h = Number.isInteger(hours) && hours > 0 && hours <= 24 ? hours : null;
    return {
      title: `Local cab in ${A}${h ? ` for ${h} hours` : ''} | Hello My Cab`,
      description: `A cab with a driver in ${A}, hired by the hour. Fixed fare, no surge — see the price for every car.`,
      eyebrow: 'Local cab with a driver',
      headline: 'Cabs in',
      accent: A,
      facts: [h ? `${h} hours` : 'hourly', 'driver included', 'fixed fare'],
    };
  }

  if (!drop) return null;
  const B = cityTitle(drop);
  const { routes } = await api.routes().catch(() => ({ routes: [] }));
  const row = routes.find((r) => r.pickup === pickup && r.drop === drop);
  const from = row?.fromRupees ?? null;
  const round = tripType === 'round_trip';

  return {
    title: round
      ? `${A} to ${B} round trip cab | Hello My Cab`
      : `${A} to ${B} cab${from ? ` from ${rupees(from)}` : ''} | Hello My Cab`,
    description: round
      ? `${A} to ${B} and back with the same car and driver. Fixed fare — see the price for every car.`
      : `One way taxi from ${A} to ${B}${from ? ` from ${rupees(from)}` : ''}. Fixed fare, driver included — see the price for every car.`,
    eyebrow: round ? 'Round trip taxi' : 'Outstation taxi',
    headline: `${A} →`,
    accent: B,
    // The price only (10 Oct 2026) — no distance, no hours.
    facts: round ? ['there and back', 'fixed fare'] : [from ? `from ${rupees(from)}` : 'fixed fare'],
    landing: row ? routePath(pickup, drop) : undefined,
  };
}

/** Only the parameters the card reads, in a fixed order — one image URL per trip. */
function imageQuery(q: Query): string {
  const p = new URLSearchParams();
  for (const k of ['tripType', 'pickup', 'drop', 'hours'] as const) {
    if (q[k]) p.set(k, q[k]!);
  }
  return p.toString();
}

/**
 * The funnel page's metadata: still out of search, but with the trip's own title, description
 * and card. The site-wide openGraph fields are repeated because a page's `openGraph` replaces
 * the layout's rather than merging with it.
 */
export async function tripMetadata(q: Query): Promise<Metadata> {
  const robots = { index: false, follow: false };
  const share = await tripShare(q);
  if (!share) return { robots };
  return {
    title: { absolute: share.title },
    description: share.description,
    robots,
    openGraph: {
      type: 'website',
      siteName: 'Hello My Cab',
      locale: 'en_IN',
      title: share.title,
      description: share.description,
      ...(share.landing ? { url: share.landing } : {}),
      images: [
        {
          url: `/og/trip?${imageQuery(q)}`,
          width: 1200,
          height: 630,
          alt: share.title.replace(/ \| Hello My Cab$/, ' — Hello My Cab'),
        },
      ],
    },
    twitter: { card: 'summary_large_image' },
  };
}
