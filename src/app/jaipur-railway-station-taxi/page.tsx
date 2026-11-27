import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, type Transfer } from '@/lib/api';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { Faq } from '@/components/site/Faq';
import { TransferForm } from '@/components/landing/TransferForm';
import { company } from '@/lib/company';
import { env } from '@/lib/env';
import { JsonLd, ORG_ID, SITE_ID, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { cityTitle, routePath } from '@/lib/slug';
import { isThinRoute } from '@/lib/held-routes';
import { isReleasedPath } from '@/lib/indexing-tiers';
import { fitDescription, rupees } from '@/lib/seo';

/**
 * Jaipur railway station taxi (27 Nov 2026, docs/seo/PROMPT_KEYWORD_FILES_27NOV.md Step 6).
 *
 * "jaipur railway station taxi", "… prepaid taxi", "jaipur airport to railway station taxi fare"
 * (Google India autocomplete, 27 Nov) — Triveni and CabBazar rank with a station page; we had
 * none. The airport page's pattern: every price from the backend transfer
 * `jaipur-railway-station` (the owner's station → city zone fares, decision E1). **No transfer,
 * no page** — a 404, never a page without prices or with invented ones. Held with Wave 2
 * (lib/indexing-tiers.ts WAVE2_PATHS): `noindex, follow` and out of the sitemaps until then.
 * The stations are named, nothing is claimed about platforms, exits or prepaid counters.
 */
const PATH = '/jaipur-railway-station-taxi';
export const revalidate = 86_400;

const night = (t: Transfer) =>
  t.night ? `${t.night.fromHour > 12 ? t.night.fromHour - 12 : t.night.fromHour} pm–${t.night.toHour} am` : '';

export async function generateMetadata(): Promise<Metadata> {
  const t = await api.transfer('jaipur-railway-station');
  if (!t) return { robots: { index: false, follow: false } };
  const from = t.zones[0]?.fares.dzire;
  const title = `Jaipur Railway Station Taxi @ ₹${from} | Fixed Fare Cab`;
  return {
    title: { absolute: title },
    description: fitDescription(
      `Jaipur railway station taxi from ₹${from} to the city, ${t.includes.join(', ').toLowerCase()} included.`,
      `${t.freeWaitMinutes} min free waiting if the train is late.`,
      'Outstation from the station at Jaipur fares. Call 24×7.',
    ),
    alternates: { canonical: PATH },
    openGraph: { title, url: PATH, images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Hello My Cab — one way taxi with a fixed fare' }] },
    ...(isReleasedPath(PATH) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function JaipurRailwayStationPage() {
  const [t, all] = await Promise.all([
    api.transfer('jaipur-railway-station'),
    api.routes().catch(() => ({ count: 0, routes: [] })),
  ]);
  if (!t) notFound();
  // Outstation from the station is a trip from Jaipur: the Jaipur routes and their fares.
  const outstation = all.routes
    .filter((r) => r.pickup === 'JAIPUR' && r.fromRupees && !isThinRoute(r.pickup, r.drop))
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  const byZone = (z: string) => t.localities.filter((l) => l.zone === z).map((l) => l.name);
  const zoneA = t.zones[0];

  const faq = [
    {
      q: 'How much is a taxi from Jaipur railway station to the city?',
      a: `A fixed fare by area: ${t.zones
        .map((z) => `up to ${z.upToKm} km by road (${byZone(z.zone).slice(0, 3).join(', ')}…) ${rupees(z.fares.dzire)} in a Dzire`)
        .join('; ')}. ${t.includes.join(', ')} included.`,
    },
    {
      q: 'What if my train is late?',
      a: `Waiting is free for ${t.freeWaitMinutes} minutes after the train arrives; after that it is ${rupees(t.waitingRupeesPer30Min)} for every 30 minutes. Give us the train number when you book.`,
    },
    ...(t.night ? [{ q: 'Is there a night charge?', a: `${rupees(t.night.extraRupees)} extra for a pickup between ${night(t)}.` }] : []),
    ...(outstation.length
      ? [
          {
            q: 'Can I go straight from the station to another city?',
            a: `Yes — ${outstation
              .slice(0, 6)
              .map((r) => `${cityTitle(r.drop)} from ${rupees(r.fromRupees!)}`)
              .join(', ')}, one way. The same fare as from anywhere in Jaipur.`,
          },
        ]
      : []),
    {
      q: 'How do I book?',
      a: `Fill in the form on this page, call ${company.phone} or WhatsApp us. We call back to confirm the car and the fare before the trip.`,
    },
  ];

  const schema = [
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Jaipur taxi', path: '/cab-service-in-jaipur' },
      { name: 'Jaipur railway station taxi', path: PATH },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'TaxiService',
      '@id': `${env.siteUrl}${PATH}#service`,
      name: `${company.name} — Jaipur railway station taxi`,
      url: `${env.siteUrl}${PATH}`,
      provider: { '@id': ORG_ID },
      isPartOf: { '@id': SITE_ID },
      areaServed: { '@type': 'City', name: 'Jaipur' },
      offers: t.zones.map((z) => ({
        '@type': 'Offer',
        name: `Jaipur railway station ↔ city, up to ${z.upToKm} km, Dzire`,
        priceCurrency: 'INR',
        price: z.fares.dzire,
        url: `${env.siteUrl}${PATH}`,
      })),
    },
    faqSchema(faq),
  ];

  return (
    <>
      <Header />
      <JsonLd data={schema} />
      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter pb-section-sm pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-small text-hmc-secondary [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
          <Link href="/" className="hover:text-hmc-link">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cab-service-in-jaipur" className="hover:text-hmc-link">
            Jaipur
          </Link>
          <span className="mx-2">/</span>
          <span className="text-hmc-content">Railway station taxi</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-start">
          <section>
            <h1 className="font-display text-balance text-h1">
              Jaipur Railway Station Taxi — fixed fares to the city and outstation
            </h1>
            <p className="mt-4 max-w-measure text-pretty text-lead text-hmc-secondary">
              {zoneA ? `From ${rupees(zoneA.fares.dzire)} in a Dzire to the nearest areas, ${t.includes.join(', ').toLowerCase()} included. ` : ''}
              Pickup at {t.from}, one fixed price by area — and outstation straight from the station at the Jaipur fare.
            </p>
            <p className="mt-4 text-body">
              Call{' '}
              <a href={company.phoneHref} className="font-semibold text-hmc-link">
                {company.phone}
              </a>{' '}
              · {company.hours.toLowerCase()}
            </p>
          </section>
          <TransferForm transfer={t} otherCity="JAIPUR" otherLabel="Jaipur" />
        </div>

        <section className="section-gap">
          <h2 className="font-display text-balance text-h2">Station to the city: fixed fare by area</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-body">
              <thead className="text-small text-hmc-label">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Areas</th>
                  <th className="py-2 pr-4 font-semibold">Hatchback</th>
                  <th className="py-2 pr-4 font-semibold">Dzire</th>
                  <th className="py-2 pr-4 font-semibold">Ertiga</th>
                  <th className="py-2 font-semibold">Crysta</th>
                </tr>
              </thead>
              <tbody>
                {t.zones.map((z) => (
                  <tr key={z.zone} className="border-t border-hmc-line align-top">
                    <td className="py-3 pr-4">
                      <span className="font-semibold">Up to {z.upToKm} km</span>
                      <span className="block text-small text-hmc-secondary">{byZone(z.zone).join(', ')}</span>
                    </td>
                    <td className="py-3 pr-4">{rupees(z.fares.hatchback)}</td>
                    <td className="py-3 pr-4 font-semibold">{rupees(z.fares.dzire)}</td>
                    <td className="py-3 pr-4">{rupees(z.fares.ertiga)}</td>
                    <td className="py-3">{rupees(z.fares.crysta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-6 grid gap-3 text-body sm:grid-cols-3">
            <li className="rounded-2xl border border-hmc-line bg-hmc-card p-4">
              <span className="font-semibold">Included:</span> {t.includes.join(', ')}.
            </li>
            <li className="rounded-2xl border border-hmc-line bg-hmc-card p-4">
              <span className="font-semibold">Train late?</span> {t.freeWaitMinutes} minutes free, then {rupees(t.waitingRupeesPer30Min)} per 30 minutes.
            </li>
            {t.night ? (
              <li className="rounded-2xl border border-hmc-line bg-hmc-card p-4">
                <span className="font-semibold">Night:</span> +{rupees(t.night.extraRupees)} for a pickup {night(t)}.
              </li>
            ) : null}
          </ul>
        </section>

        {outstation.length ? (
          <section className="section-gap">
            <h2 className="font-display text-balance text-h2">From Jaipur railway station to other cities</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {outstation.map((r) => (
                <li key={r.drop}>
                  <Link href={routePath(r.pickup, r.drop)} className="flex min-h-11 flex-col rounded-2xl border border-hmc-line bg-hmc-card p-4 hover:border-hmc-content">
                    <span className="font-semibold">Jaipur station to {cityTitle(r.drop)} cab</span>
                    <span className="text-small text-hmc-secondary">from {rupees(r.fromRupees!)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="section-gap">
          <h2 className="font-display text-balance text-h2">Jaipur railway station taxi, answered</h2>
          <Faq items={faq} />
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
