import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { cityPath, cityTitle, readSlug, routePath, vehiclePath } from '@/lib/slug';
import { RoutePage } from './RoutePage';
import { CityPage } from './CityPage';
import { VehiclePage } from './VehiclePage';

/**
 * Every landing page the site publishes lives at the root, and two dynamic segments cannot
 * sit side by side there — so this one segment takes them all and hands off by shape.
 */
export const revalidate = 86_400;

/**
 * ONLY the slugs listed below exist.
 *
 * Without this, anyone could request /anywhere-to-anywhere-cab and the site would render a
 * page for it — thousands of near-identical URLs with nothing on them, which is precisely
 * what search engines demote an entire domain for. The list is the whitelist.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const { routes } = await api.routes().catch(() => ({ routes: [] }));

  // Only cities that ORIGINATE a priced route get a page — ten of them today. The catalog
  // holds over six thousand, and a page for a city with nothing to list is the empty
  // template this whole approach is trying to avoid.
  const origins = [...new Set(routes.map((r) => r.pickup))];

  const { intercity, roundTripOnly } = await api
    .vehicles()
    .catch(() => ({ intercity: [], roundTripOnly: [] }));

  return [
    ...routes.map((r) => ({ slug: routePath(r.pickup, r.drop).slice(1) })),
    ...origins.map((c) => ({ slug: cityPath(c).slice(1) })),
    ...[...intercity, ...roundTripOnly].map((v) => ({ slug: vehiclePath(v.key).slice(1) })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const landing = readSlug(slug);
  if (!landing) return {};

  const { routes } = await api.routes().catch(() => ({ routes: [] }));

  if (landing.kind === 'city') {
    const A = cityTitle(landing.city);
    const from = routes.filter((r) => r.pickup === landing.city);
    const cheapest = Math.min(...from.map((r) => r.fromRupees ?? Infinity));
    const price = Number.isFinite(cheapest) ? ` from ₹${cheapest.toLocaleString('en-IN')}` : '';
    return {
      title: `Cab service in ${A}${price} — outstation & hourly`,
      description: `Book an outstation cab from ${A} with a driver. ${from.length} routes with a fixed fare, plus hourly rentals. No surge, pay in cash.`,
      alternates: { canonical: `/${slug}` },
      openGraph: { title: `Cab service in ${A}${price}`, url: `/${slug}` },
    };
  }

  if (landing.kind === 'vehicle') {
    const { intercity, roundTripOnly } = await api
      .vehicles()
      .catch(() => ({ intercity: [], roundTripOnly: [] }));
    const v = [...intercity, ...roundTripOnly].find((x) => x.key === landing.vehicle);
    if (!v) return {};
    const roundOnly = v.tripTypes.length === 1;
    return {
      title: `${v.label} on hire — ${roundOnly ? 'round trips' : 'one way & round trip'}`,
      description: `Book a ${v.label} with a driver${v.seats ? `, seats ${v.seats}` : ''}. Fixed fare, no surge, pay in cash.${roundOnly ? ' Available on round trips only.' : ''}`,
      alternates: { canonical: `/${slug}` },
      openGraph: { title: `${v.label} on hire`, url: `/${slug}` },
    };
  }

  if (landing.kind !== 'route') return {};

  const row = routes.find((r) => r.pickup === landing.pickup && r.drop === landing.drop);
  const A = cityTitle(landing.pickup);
  const B = cityTitle(landing.drop);

  // The price in the title is the same figure the page shows. A number here that a visitor
  // cannot actually get is the kind of thing that earns a manual penalty, not just a lost
  // click.
  const price = row?.fromRupees ? ` from ₹${row.fromRupees.toLocaleString('en-IN')}` : '';
  const km = row?.distanceKm ? `${row.distanceKm} km · ` : '';

  return {
    title: `${A} to ${B} cab${price} — one way & round trip`,
    description: `${km}Book a ${A} to ${B} cab with a driver. Fixed fare, no surge, pay in cash. One-way and round-trip prices for every vehicle.`,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: `${A} to ${B} cab${price}`, url: `/${slug}` },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = readSlug(slug);
  if (!landing) notFound();

  if (landing.kind === 'route') {
    return <RoutePage pickup={landing.pickup} drop={landing.drop} />;
  }
  if (landing.kind === 'city') {
    return <CityPage city={landing.city} />;
  }

  return <VehiclePage vehicleKey={landing.vehicle} />;
}
