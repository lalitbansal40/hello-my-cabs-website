import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { cityTitle, readSlug, routePath } from '@/lib/slug';
import { RoutePage } from './RoutePage';

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
  return routes.map((r) => ({ slug: routePath(r.pickup, r.drop).slice(1) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const landing = readSlug(slug);
  if (landing?.kind !== 'route') return {};

  const { routes } = await api.routes().catch(() => ({ routes: [] }));
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

  // City and vehicle pages arrive in the next two tasks. Until they do, these slugs are not
  // in generateStaticParams, so nothing can reach here.
  notFound();
}
