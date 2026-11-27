import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { company } from '@/lib/company';
import { HI, HI_CITY } from '@/content/hi';
import { TIER1_CITIES, TIER1_ROUTES } from '@/lib/indexing-tiers';
import { hiPath, hindiRobots, hreflangFor } from '@/lib/hindi';
import { cityPath, routePath } from '@/lib/slug';

/** The Hindi home page (held — see HINDI_LIVE). */
export const revalidate = 86_400;

export const metadata: Metadata = {
  title: { absolute: HI.home.title },
  description: HI.home.lead,
  alternates: { canonical: '/hi', ...hreflangFor('/', true) },
  ...(hindiRobots() ? { robots: hindiRobots() } : {}),
};

export default function HindiHome() {
  const routes = TIER1_ROUTES.filter(([a, b]) => HI_CITY[a] && HI_CITY[b]);
  const cities = TIER1_CITIES.filter((c) => HI_CITY[c]);
  return (
    <>
      <Header />
      <main lang="hi" className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter pb-section-sm pt-8">
        <p className="text-small">
          <Link href="/" lang="en" className="text-hmc-link">
            {HI.langNote}
          </Link>
        </p>
        <h1 className="font-display mt-4 text-balance text-h1">{HI.home.h1}</h1>
        <p className="mt-4 max-w-measure text-lead text-hmc-secondary">{HI.home.lead}</p>
        <p className="mt-4 text-body">
          <a href={company.phoneHref} className="font-semibold text-hmc-link">
            {company.phone}
          </a>{' '}
          · 24×7
        </p>
        <h2 className="font-display mt-10 text-h2">{HI.home.routes}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {routes.map(([a, b]) => (
            <li key={`${a}>${b}`}>
              <Link href={hiPath(routePath(a, b))} className="text-hmc-link">
                {HI.route.h1(HI_CITY[a], HI_CITY[b])}
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="font-display mt-10 text-h2">{HI.home.cities}</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {cities.map((c) => (
            <li key={c}>
              <Link href={hiPath(cityPath(c))} className="text-hmc-link">
                {HI.city.h1(HI_CITY[c])}
              </Link>
            </li>
          ))}
          <li>
            <Link href={hiPath('/jaipur-airport-taxi')} className="text-hmc-link">
              {HI.airport.h1}
            </Link>
          </li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
