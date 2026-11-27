import type { Metadata } from 'next';
import { hreflangFor } from '@/lib/hindi';
import Link from 'next/link';
import { api, type Transfer } from '@/lib/api';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { SupportCard } from '@/components/site/SupportCard';
import { Faq } from '@/components/site/Faq';
import { TransferForm } from '@/components/landing/TransferForm';
import { company } from '@/lib/company';
import { env } from '@/lib/env';
import { JsonLd, ORG_ID, SITE_ID, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { cityTitle, routePath } from '@/lib/slug';
import { isThinRoute } from '@/lib/held-routes';
import { fitDescription, rupees } from '@/lib/seo';

/**
 * Jaipur Airport taxi (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Step 5.1).
 *
 * "jaipur airport taxi" (64 impressions, position 2.4), "taxi service in jaipur airport" (45,
 * 1.8), "airport taxi service in jaipur" (27, 2.0) — Google already put the home page near
 * the top for these with no page about them. This is that page.
 *
 * Every price comes from the backend: the city transfer (constants/airportTransfers.ts — areas
 * placed by MEASURED road distance from the terminal) and the outstation fares (the catalogue,
 * the same as from Jaipur). Nothing about how the airport itself works is claimed beyond what
 * the service does: the call-back, the waiting rule, the night rule.
 */
const PATH = '/jaipur-airport-taxi';
export const revalidate = 86_400;

const night = (t: Transfer) =>
  t.night ? `${t.night.fromHour > 12 ? t.night.fromHour - 12 : t.night.fromHour} pm–${t.night.toHour} am` : '';

export async function generateMetadata(): Promise<Metadata> {
  const t = await api.transfer('jaipur-airport');
  const from = t?.zones[0]?.fares.dzire;
  const title = from ? `Jaipur Airport Taxi @ ₹${from} | Fixed Fare Cab 24×7` : 'Jaipur Airport Taxi | Fixed Fare Cab 24×7';
  return {
    title: { absolute: title },
    description: fitDescription(
      ...[
        from ? `Jaipur Airport taxi from ₹${from} to the city, parking & GST included.` : 'Jaipur Airport taxi to the city at a fixed fare.',
        t ? `${t.freeWaitMinutes} min free waiting after landing.` : '',
        'Outstation from the airport at Jaipur fares. Call 24×7.',
      ].filter(Boolean),
    ),
    alternates: { canonical: PATH, ...hreflangFor(PATH, true) },
    openGraph: { title, url: PATH, images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Hello My Cab — one way taxi with a fixed fare' }] },
  };
}

export default async function JaipurAirportPage() {
  const [t, all] = await Promise.all([
    api.transfer('jaipur-airport'),
    api.routes().catch(() => ({ count: 0, routes: [] })),
  ]);
  if (process.env.NEXT_PHASE === 'phase-production-build' && !t) {
    // As the route pages: never publish this page without its prices.
    throw new Error('No Jaipur Airport transfer prices at build time — refusing to publish the page without them');
  }
  const outstation = all.routes
    .filter((r) => r.pickup === 'JAIPUR_AIRPORT' && r.fromRupees)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  const jaipurRow = (drop: string) => all.routes.find((r) => r.pickup === 'JAIPUR' && r.drop === drop);
  const zoneA = t?.zones[0];
  const byZone = (z: string) => t?.localities.filter((l) => l.zone === z).map((l) => l.name) ?? [];

  const faq = t
    ? [
        {
          q: 'How much is a taxi from Jaipur Airport to the city?',
          a: `A fixed fare by area: ${t.zones
            .map((z) => `up to ${z.upToKm} km by road (${byZone(z.zone).slice(0, 3).join(', ')}…) ${rupees(z.fares.dzire)} in a Dzire`)
            .join('; ')}. ${t.includes.join(', ')} included.`,
        },
        {
          q: 'Is airport parking included?',
          a: `Yes. The fare includes ${t.includes.join(', ').toLowerCase()} — the price you are told is the price you pay, apart from waiting beyond the free time${t.night ? ' and the night charge' : ''}.`,
        },
        {
          q: 'What if my flight is late?',
          a: `Waiting is free for ${t.freeWaitMinutes} minutes after the flight lands; after that it is ${rupees(t.waitingRupeesPer30Min)} for every 30 minutes. Give us the flight number when you book so the pickup is planned around the landing.`,
        },
        ...(t.night
          ? [
              {
                q: 'Is there a night charge?',
                a: `${rupees(t.night.extraRupees)} extra for a pickup between ${night(t)}.`,
              },
            ]
          : []),
        ...(outstation.length
          ? [
              {
                q: 'Can I go straight from Jaipur Airport to another city?',
                a: `Yes — ${outstation
                  .slice(0, 6)
                  .map((r) => `${cityTitle(r.drop)} from ${rupees(r.fromRupees!)}`)
                  .join(', ')}, one way. The same fare as from Jaipur city.`,
              },
            ]
          : []),
        {
          q: 'How do I book?',
          a: `Fill in the form on this page, call ${company.phone} or WhatsApp us. We call back to confirm the car and the fare before the trip.`,
        },
      ]
    : [];

  const schema = [
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Jaipur taxi', path: '/cab-service-in-jaipur' },
      { name: 'Jaipur Airport taxi', path: PATH },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'TaxiService',
      '@id': `${env.siteUrl}${PATH}#service`,
      name: `${company.name} — Jaipur Airport taxi`,
      url: `${env.siteUrl}${PATH}`,
      provider: { '@id': ORG_ID },
      isPartOf: { '@id': SITE_ID },
      areaServed: { '@type': 'City', name: 'Jaipur' },
      ...(t
        ? {
            offers: t.zones.map((z) => ({
              '@type': 'Offer',
              name: `Jaipur Airport ↔ city, up to ${z.upToKm} km, Dzire`,
              priceCurrency: 'INR',
              price: z.fares.dzire,
              priceSpecification: {
                '@type': 'PriceSpecification',
                price: z.fares.dzire,
                priceCurrency: 'INR',
                valueAddedTaxIncluded: true,
              },
              url: `${env.siteUrl}${PATH}`,
            })),
          }
        : {}),
    },
    ...(faq.length ? [faqSchema(faq)] : []),
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
          <span className="text-hmc-content">Airport taxi</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-start">
          <section>
            <h1 className="font-display text-balance text-h1">
              Jaipur Airport Taxi — fixed fares to the city and outstation
            </h1>
            <p className="mt-4 max-w-measure text-pretty text-lead text-hmc-secondary">
              {zoneA
                ? `From ${rupees(zoneA.fares.dzire)} in a Dzire to the nearest areas, ${t!.includes.join(', ').toLowerCase()} included. `
                : ''}
              A Jaipur Airport cab at one fixed price by area, decided before you land — and outstation straight from the terminal at the Jaipur fare.
            </p>
            <p className="mt-4 text-body">
              Call{' '}
              <a href={company.phoneHref} className="font-semibold text-hmc-link">
                {company.phone}
              </a>{' '}
              · {company.hours.toLowerCase()}
            </p>
          </section>
          {t ? (
            <TransferForm transfer={t} otherCity="JAIPUR" otherLabel="Jaipur" />
          ) : (
            <p className="rounded-3xl border border-hmc-line bg-hmc-card p-6 text-body">
              Prices are loading. Please call {company.phone} to book.
            </p>
          )}
        </div>

        {t ? (
          <section className="section-gap">
            <h2 className="font-display text-balance text-h2">Airport transfer to the city: fixed fare by area</h2>
            <p className="mt-4 max-w-measure text-pretty text-body text-hmc-secondary">
              The same price either way — to the airport or from it — and you know the fare when you book. Areas are placed by the road distance from the terminal, measured, not guessed.
            </p>
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
                <span className="font-semibold">Flight late?</span> {t.freeWaitMinutes} minutes free after landing, then {rupees(t.waitingRupeesPer30Min)} per 30 minutes.
              </li>
              {t.night ? (
                <li className="rounded-2xl border border-hmc-line bg-hmc-card p-4">
                  <span className="font-semibold">Night:</span> +{rupees(t.night.extraRupees)} for a pickup {night(t)}.
                </li>
              ) : null}
            </ul>
            <p className="mt-4 text-small text-hmc-secondary">
              Further than {t.zones.at(-1)!.upToKm} km? That is an outstation trip (below) or a{' '}
              <Link href="/cab-service-in-jaipur" className="font-semibold text-hmc-link">
                Jaipur local taxi
              </Link>
              .
            </p>
          </section>
        ) : null}

        {outstation.length ? (
          <section className="section-gap">
            <h2 className="font-display text-balance text-h2">From Jaipur Airport to other cities</h2>
            <p className="mt-4 max-w-measure text-pretty text-body text-hmc-secondary">
              Straight from the terminal, one way, at the same fare as from Jaipur city. Toll and GST are on the bill as on every route.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {outstation.map((r) => {
                const city = jaipurRow(r.drop);
                const href = !isThinRoute('JAIPUR', r.drop) && city ? routePath('JAIPUR', r.drop) : routePath(r.pickup, r.drop);
                return (
                  <li key={r.drop}>
                    <Link href={href} className="flex min-h-11 flex-col rounded-2xl border border-hmc-line bg-hmc-card p-4 hover:border-hmc-content">
                      <span className="font-semibold">Jaipur Airport to {cityTitle(r.drop)} cab</span>
                      <span className="text-small text-hmc-secondary">
                        from {rupees(r.fromRupees!)}
                        {r.distanceKm ? ` · about ${r.distanceKm} km from Jaipur` : ''}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {faq.length ? (
          <section className="section-gap">
            <h2 className="font-display text-balance text-h2">Jaipur Airport taxi, answered</h2>
            <Faq items={faq} />
          </section>
        ) : null}

        <p className="mt-10 text-body">
          Around Jaipur:{' '}
          <Link href="/cab-service-in-jaipur" className="font-semibold text-hmc-link">
            Cab service in Jaipur
          </Link>{' '}
          ·{' '}
          <Link href="/guides/jaipur-delhi-airport-by-road" className="font-semibold text-hmc-link">
            Jaipur to Delhi Airport by road
          </Link>
        </p>

        <SupportCard className="mt-section-sm" />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
