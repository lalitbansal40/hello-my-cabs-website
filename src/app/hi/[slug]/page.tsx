import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { api } from '@/lib/api';
import { company } from '@/lib/company';
import { HI, HI_CITY, hiCity } from '@/content/hi';
import { TIER1_CITIES, TIER1_ROUTES } from '@/lib/indexing-tiers';
import { hiPath, hindiRobots, hreflangFor } from '@/lib/hindi';
import { readSlug, routePath } from '@/lib/slug';
import { JsonLd, faqSchema } from '@/lib/schema';
import { rupees } from '@/lib/seo';

/**
 * Hindi copies of the Tier 1 pages (21 Nov 2026, PROMPT_RANK_21NOV Step 9) — HELD: noindex,
 * out of the sitemaps, no hreflang, until HINDI_LIVE (lib/indexing-tiers.ts). Rendered on
 * first visit and kept a day (not built ahead: the deploy size limit), and only for the
 * pages listed — any other /hi/… is a 404, never an empty template.
 */
export const revalidate = 86_400;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Page =
  | { kind: 'route'; a: string; b: string; en: string }
  | { kind: 'city'; city: string; en: string }
  | { kind: 'airport'; en: string };

function pageFor(slug: string): Page | null {
  if (slug === 'jaipur-airport-taxi') return { kind: 'airport', en: '/jaipur-airport-taxi' };
  const l = readSlug(slug);
  if (l?.kind === 'route' && TIER1_ROUTES.some(([a, b]) => a === l.pickup && b === l.drop) && hiCity(l.pickup) && hiCity(l.drop)) {
    return { kind: 'route', a: l.pickup, b: l.drop, en: `/${slug}` };
  }
  if (l?.kind === 'city' && TIER1_CITIES.includes(l.city) && hiCity(l.city)) return { kind: 'city', city: l.city, en: `/${slug}` };
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = pageFor(slug);
  if (!p) return {};
  const all = await api.routes().catch(() => ({ count: 0, routes: [] }));
  let title: string = HI.airport.title;
  if (p.kind === 'route') {
    const row = all.routes.find((r) => r.pickup === p.a && r.drop === p.b);
    title = HI.route.title(HI_CITY[p.a], HI_CITY[p.b], row?.fromRupees ? rupees(row.fromRupees) : '');
  } else if (p.kind === 'city') {
    const from = Math.min(...all.routes.filter((r) => r.pickup === p.city).map((r) => r.fromRupees ?? Infinity));
    title = HI.city.title(HI_CITY[p.city], Number.isFinite(from) ? rupees(from) : '');
  }
  return {
    title: { absolute: title },
    alternates: { canonical: hiPath(p.en), ...hreflangFor(p.en, true) },
    ...(hindiRobots() ? { robots: hindiRobots() } : {}),
  };
}

export default async function HindiPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = pageFor(slug);
  if (!p) notFound();
  const [all, transfer] = await Promise.all([
    api.routes().catch(() => ({ count: 0, routes: [] })),
    p.kind === 'airport' ? api.transfer('jaipur-airport') : Promise.resolve(null),
  ]);

  let body: React.ReactNode = null;
  let faq: { q: string; a: string }[] = [];
  if (p.kind === 'route') {
    const A = HI_CITY[p.a];
    const B = HI_CITY[p.b];
    const row = all.routes.find((r) => r.pickup === p.a && r.drop === p.b);
    const fare = await api.onewayFare(p.a, p.b).catch(() => null);
    const price = row?.fromRupees ? rupees(row.fromRupees) : null;
    faq = [
      ...(price ? [{ q: HI.route.q1(A, B), a: HI.route.a1(price) }] : []),
      ...(row?.distanceKm ? [{ q: HI.route.q2(A, B), a: HI.route.a2(row.distanceKm) }] : []),
      { q: HI.route.q3, a: HI.route.a3 },
    ];
    body = (
      <>
        <h1 className="font-display mt-4 text-balance text-h1">{HI.route.h1(A, B)}</h1>
        <p className="mt-4 max-w-measure text-lead text-hmc-secondary">{HI.route.lead(A, B, row?.distanceKm ?? null, price)}</p>
        {fare?.vehicles?.length ? (
          <>
            <h2 className="font-display mt-10 text-h2">{HI.route.fares}</h2>
            <table className="mt-4 w-full max-w-lg text-left text-body">
              <thead className="text-small text-hmc-label">
                <tr>
                  <th className="py-2">{HI.route.car}</th>
                  <th className="py-2">{HI.route.fare}</th>
                </tr>
              </thead>
              <tbody>
                {fare.vehicles.map((v) => (
                  <tr key={v.key} className="border-t border-hmc-line">
                    <td className="py-2" lang="en">
                      {v.label}
                    </td>
                    <td className="py-2 font-semibold">{rupees(v.total ?? v.fare)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
        <p className="mt-6">
          <Link href={routePath(p.a, p.b)} className="font-semibold text-hmc-link">
            {HI.route.book}
          </Link>
        </p>
      </>
    );
  } else if (p.kind === 'city') {
    const A = HI_CITY[p.city];
    const routes = all.routes.filter((r) => r.pickup === p.city && r.fromRupees).sort((x, y) => (x.fromRupees ?? 0) - (y.fromRupees ?? 0));
    body = (
      <>
        <h1 className="font-display mt-4 text-balance text-h1">{HI.city.h1(A)}</h1>
        <p className="mt-4 max-w-measure text-lead text-hmc-secondary">{HI.city.lead(A)}</p>
        <h2 className="font-display mt-10 text-h2">{HI.city.routes(A)}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {routes.map((r) => (
            <li key={r.drop}>
              <Link href={routePath(r.pickup, r.drop)} className="text-hmc-link">
                {A} → {hiCity(r.drop) ?? r.drop}
              </Link>{' '}
              · {rupees(r.fromRupees!)} से
            </li>
          ))}
        </ul>
      </>
    );
  } else {
    body = (
      <>
        <h1 className="font-display mt-4 text-balance text-h1">{HI.airport.h1}</h1>
        <p className="mt-4 max-w-measure text-lead text-hmc-secondary">{HI.airport.lead}</p>
        {transfer ? (
          <>
            <h2 className="font-display mt-10 text-h2">{HI.airport.zones}</h2>
            <ul className="mt-4 space-y-2 text-body">
              {transfer.zones.map((z) => (
                <li key={z.zone}>
                  <span className="font-semibold">{rupees(z.fares.dzire)}</span> ·{' '}
                  <span lang="en">{transfer.localities.filter((l) => l.zone === z.zone).map((l) => l.name).join(', ')}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="mt-6">
          <Link href="/jaipur-airport-taxi" className="font-semibold text-hmc-link">
            {HI.route.book}
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <Header />
      {faq.length ? <JsonLd data={faqSchema(faq)} /> : null}
      <main lang="hi" className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter pb-section-sm pt-8">
        <p className="text-small">
          <Link href={p.en} lang="en" className="text-hmc-link">
            {HI.langNote}
          </Link>
        </p>
        {body}
        <p className="mt-6 text-body">
          {HI.route.call}:{' '}
          <a href={company.phoneHref} className="font-semibold text-hmc-link">
            {company.phone}
          </a>{' '}
          · 24×7
        </p>
        {faq.length ? (
          <section className="mt-10">
            <h2 className="font-display text-h2">{HI.route.faq}</h2>
            {faq.map((f) => (
              <div key={f.q} className="mt-4">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-1 text-hmc-secondary">{f.a}</p>
              </div>
            ))}
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
