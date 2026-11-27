import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { Faq } from '@/components/site/Faq';
import { BookingWidget } from '@/components/BookingWidget';
import { company } from '@/lib/company';
import { env } from '@/lib/env';
import { JsonLd, ORG_ID, SITE_ID, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { isReleasedPath } from '@/lib/indexing-tiers';
import { fitDescription, rupees } from '@/lib/seo';

/**
 * Jaipur local sightseeing taxi (27 Nov 2026, docs/seo/PROMPT_KEYWORD_FILES_27NOV.md Step 7).
 *
 * "jaipur sightseeing taxi", "jaipur city tour taxi", "jaipur full day taxi", "jaipur one day
 * taxi" (Google India autocomplete, 27 Nov); CabBazar, Triveni and Rajputana Cabs rank with a
 * page each. This is the hourly package the site already sells (`/fare/local`, the prices the
 * admin panel sets — owner decision E2 keeps today's), said for the sightseeing day.
 *
 * Honest by construction: the places are only the names people ask the driver for — no
 * opening hours, no ticket prices, no itinerary sold as a tour, and the driver is said NOT to
 * be a licensed guide. Held with Wave 2 (lib/indexing-tiers.ts WAVE2_PATHS): `noindex, follow`,
 * out of the sitemaps until then. No packages from the API → 404, never a page without prices.
 */
const PATH = '/jaipur-local-sightseeing-taxi';
export const revalidate = 86_400;

/** Names only — what visitors usually ask the driver to cover. */
const PLACES = ['Amer Fort', 'Hawa Mahal', 'City Palace', 'Jal Mahal', 'Nahargarh Fort', 'Albert Hall'];

export async function generateMetadata(): Promise<Metadata> {
  const packages = await api.localPackages().catch(() => []);
  if (!packages.length) return { robots: { index: false, follow: false } };
  const low = Math.min(...packages.map((p) => p.baseFareRupees));
  const p0 = packages[0];
  const title = `Jaipur Sightseeing Taxi @ ₹${low.toLocaleString('en-IN')} | ${p0.includedHours} Hr / ${p0.includedKm} Km`;
  return {
    title: { absolute: title },
    description: fitDescription(
      `Jaipur local sightseeing taxi with a driver: ${p0.includedHours} hours / ${p0.includedKm} km from ${rupees(low)}, plus GST.`,
      'Amer Fort, Hawa Mahal, City Palace — you choose the stops.',
      'Call 24×7.',
    ),
    alternates: { canonical: PATH },
    openGraph: { title, url: PATH, images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Hello My Cab — one way taxi with a fixed fare' }] },
    ...(isReleasedPath(PATH) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function JaipurSightseeingPage() {
  const [packages, cities] = await Promise.all([
    api.localPackages().catch(() => []),
    api.cities().catch(() => []),
  ]);
  if (!packages.length) notFound();
  const jaipur = cities.find((c) => c.name === 'JAIPUR');
  const low = [...packages].sort((a, b) => a.baseFareRupees - b.baseFareRupees)[0];

  const faq = [
    {
      q: 'How much is a full-day sightseeing taxi in Jaipur?',
      a: `${low.includedHours} hours and ${low.includedKm} km from ${rupees(low.baseFareRupees)} in a ${low.label}, plus GST; ${packages
        .filter((p) => p !== low)
        .map((p) => `${p.label} ${rupees(p.baseFareRupees)}`)
        .join(', ')}. Each extra hour is charged as the table shows.`,
    },
    {
      q: 'Which places can we cover?',
      a: `You decide the stops — most people ask for ${PLACES.slice(0, -1).join(', ')} and ${PLACES.at(-1)}. Entry tickets are yours to buy; check each place's own timings before you go.`,
    },
    {
      q: 'Is the driver a guide?',
      a: 'No — the driver drives and waits while you visit. For history and explanations at the monuments, hire a licensed guide there.',
    },
    {
      q: 'How do I book?',
      a: `Choose "Local" in the booking form on this page, or call ${company.phone} / WhatsApp us.`,
    },
  ];

  const schema = [
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Jaipur taxi', path: '/cab-service-in-jaipur' },
      { name: 'Jaipur local sightseeing taxi', path: PATH },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'TaxiService',
      '@id': `${env.siteUrl}${PATH}#service`,
      name: `${company.name} — Jaipur local sightseeing taxi`,
      url: `${env.siteUrl}${PATH}`,
      provider: { '@id': ORG_ID },
      isPartOf: { '@id': SITE_ID },
      areaServed: { '@type': 'City', name: 'Jaipur' },
      offers: packages.map((p) => ({
        '@type': 'Offer',
        name: `${p.label}, ${p.includedHours} h / ${p.includedKm} km`,
        priceCurrency: 'INR',
        price: p.baseFareRupees,
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
          <span className="text-hmc-content">Local sightseeing taxi</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-start">
          <section>
            <h1 className="font-display text-balance text-h1">
              Jaipur Local Sightseeing Taxi — {low.includedHours} hours / {low.includedKm} km from {rupees(low.baseFareRupees)}
            </h1>
            <p className="mt-4 max-w-measure text-pretty text-lead text-hmc-secondary">
              A car and driver for the day in Jaipur, booked by the hour: you choose the stops, the driver
              waits while you visit. Plus GST; parking and any toll are paid as they come.
            </p>
            <p className="mt-4 text-body">
              Call{' '}
              <a href={company.phoneHref} className="font-semibold text-hmc-link">
                {company.phone}
              </a>{' '}
              · {company.hours.toLowerCase()}
            </p>
          </section>
          <BookingWidget defaultPickup={jaipur} defaultTripType="local" />
        </div>

        <section className="section-gap">
          <h2 className="font-display text-balance text-h2">Full-day and half-day taxi fares in Jaipur</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-body">
              <thead className="text-small text-hmc-label">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Car</th>
                  <th className="py-2 pr-4 font-semibold">
                    {low.includedHours} h / {low.includedKm} km
                  </th>
                  {low.examples
                    .filter((e) => e.hours > low.includedHours)
                    .map((e) => (
                      <th key={e.hours} className="py-2 pr-4 font-semibold">
                        {e.hours} hours
                      </th>
                    ))}
                  <th className="py-2 font-semibold">Extra hour</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.vehicle} className="border-t border-hmc-line">
                    <td className="py-3 pr-4 font-semibold">{p.label}</td>
                    <td className="py-3 pr-4">{rupees(p.baseFareRupees)}</td>
                    {p.examples
                      .filter((e) => e.hours > p.includedHours)
                      .map((e) => (
                        <td key={e.hours} className="py-3 pr-4">
                          {rupees(e.fareRupees)}
                        </td>
                      ))}
                    <td className="py-3">{rupees(p.extraPerHour)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section-gap">
          <h2 className="font-display text-balance text-h2">Places people usually ask for</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {PLACES.map((p) => (
              <li key={p} className="rounded-full border border-hmc-line bg-hmc-card px-4 py-2 text-body">
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-measure text-body text-hmc-secondary">
            The driver is not a licensed guide, and entry tickets are yours to buy — check each place&rsquo;s
            own timings before you go. Going further, to Ajmer or Khatu Shyam ji?{' '}
            <Link href="/cab-service-in-jaipur" className="font-semibold text-hmc-link">
              Outstation taxi from Jaipur
            </Link>
            .
          </p>
        </section>

        <section className="section-gap">
          <h2 className="font-display text-balance text-h2">Jaipur sightseeing taxi, answered</h2>
          <Faq items={faq} />
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
