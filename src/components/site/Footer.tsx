import { isIndexableCity, isIndexableGuide, isIndexableVehicle, isTier1Route } from '@/lib/indexing-tiers';
import { GUIDES, guidePath } from '@/content/guides';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPath, cityTitle, routePath, vehiclePath } from '@/lib/slug';
import { OWN_PAGE, citiesWithPages } from '@/lib/city-pages';
import { busiestFirst } from '@/lib/route-tiers';
import { Icon } from './Icons';
import { Wordmark } from './Brand';
import { company } from '@/lib/company';
import { FooterCol } from './FooterCol';

/**
 * The footer carries real links, not placeholders.
 *
 * Pages reachable only from a sitemap tend to sit unindexed for months — a crawler treats
 * a link as a vote that the page matters and a sitemap entry as a note that it exists.
 * Every route and city is linked from here as well as from /routes, so nothing is an
 * orphan.
 *
 * On a phone the four blocks used to stack, which made this the longest thing on the site:
 * fourteen hundred pixels of footer under every page, with the same phone number printed
 * twice in it. Routes and cities sit side by side now and the number appears once, in the
 * block with the name it belongs to. Each link is a 44px row rather than 20px of text —
 * the reason the rows are no longer separated by a gap is that the tap area now provides
 * the spacing itself.
 */
export async function Footer() {
  const [{ routes }, veh] = await Promise.all([
    api.listedRoutes().catch(() => ({ routes: [] })),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
  ]);
  // The busiest, not the catalogue's first six (all from Jaipur) — lib/route-tiers.ts.
  // 27 Nov 2026 (PROMPT_INDEX_RANK_27NOV Step 5.3): the footer is on every page, so it links
  // only the pages offered for indexing (Wave 1, lib/indexing-tiers.ts); /routes lists the rest.
  // All of them (16 on 27 Nov 2026), busiest first: the footer is the one block on every page,
  // and it is how each Wave 1 route gets the 15+ links in that a page needs to be crawled early.
  const topRoutes = busiestFirst(routes.filter((r) => isTier1Route(r.pickup, r.drop)));
  const origins = [...citiesWithPages(routes)].filter(isIndexableCity).slice(0, 7);
  // The vehicle pages were reachable from city pages and nowhere else — not from the home
  // page, not from a route page, not from here. A page with one way in is a page that gets
  // crawled last and ranked accordingly.
  const fleet = [...veh.intercity, ...veh.roundTripOnly].filter((v) => isIndexableVehicle(v.key)).slice(0, 6);

  return (
    <footer className="hero-ground grain relative mt-section-sm text-white">
      {/* The road along the top edge — the dashed red line the ticket and the steps use. */}
      <div
        aria-hidden
        className="h-1.5 bg-[repeating-linear-gradient(90deg,var(--color-accent)_0_28px,transparent_28px_44px)]"
      />
      <div className="relative mx-auto max-w-6xl 2xl:max-w-7xl px-gutter">
        <div className="grid gap-x-6 gap-y-10 border-b border-white/10 py-12 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Wordmark tone="dark" />
            <p className="mt-4 max-w-xs text-body text-white/55">
              Outstation cabs with a driver, at a fare agreed before you travel.
            </p>
            {/* Our Rajasthan tours brand — the same company (owner, 20 Oct 2026). A plain link
                from every page of this site is how search engines first find the new one. */}
            <p className="mt-3 max-w-xs text-small text-white/70">
              Touring Rajasthan?{' '}
              <a href="https://ghoomorajasthan.com" className="font-semibold text-white underline underline-offset-4 hover:text-hmc-link">
                Ghoomo Rajasthan
              </a>{' '}
              — our Rajasthan tours brand.
            </p>
            {/* A "4.8 / 5" under five filled stars stood here with nothing behind it. A
                star rating is a claim about other people's opinions, so it needs a source
                — put the real Play Store figure back the moment we have it. */}
            <p className="mt-8 text-label font-bold uppercase text-white/55">Talk to us</p>
            <a
              href={company.phoneHref}
              className="mt-1 inline-flex min-h-11 items-center gap-2.5 text-title-lg font-black transition-colors hover:text-hmc-link"
            >
              <Icon.phone className="h-5 w-5 text-hmc-link" />
              {company.phone}
            </a>
            <p className="text-small text-white/60">Every day, around the clock</p>
            {/* How the money works, in one line: the question asked most before booking. */}
            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Icon.check className="h-4 w-4 text-hmc-link" />
                Pay by UPI or card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon.check className="h-4 w-4 text-hmc-link" />
                Driver and fuel included
              </span>
            </p>
            {/* The company's address (the Business Profile's) and email, when filled in
                (company.ts). Never a placeholder address. */}
            {company.registeredAddress || company.email ? (
              <div className="mt-6 text-small text-white/55">
                <p className="text-label font-bold uppercase text-white/55">Office</p>
                {company.registeredAddress ? <p className="mt-1">{company.registeredAddress}</p> : null}
                {company.email ? (
                  <a href={`mailto:${company.email}`} className="mt-1 inline-flex min-h-11 items-center hover:text-white hover:underline">
                    {company.email}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* On a phone, three rows you open (FooterCol); from `sm`, three open columns. */}
          <div className="col-span-full grid grid-cols-1 gap-x-6 sm:grid-cols-2 sm:gap-y-10 lg:col-span-4 lg:contents">
            <FooterCol
              title="Routes"
              links={[
                ...topRoutes.map(
                  (r) =>
                    [
                      `${cityTitle(r.pickup)} → ${cityTitle(r.drop)}`,
                      routePath(r.pickup, r.drop),
                    ] as [string, string],
                ),
                ['Jaipur ⇄ Delhi round trip', '/jaipur-to-delhi-round-trip-cab'],
                ['All routes', '/routes'],
              ]}
            />
            <FooterCol
              title="Cities"
              links={[
                ...origins.map((c) => [cityTitle(c), cityPath(c)] as [string, string]),
                // Places with their own page (21 Nov 2026): Jaipur Airport.
                ...Object.entries(OWN_PAGE)
                  .filter(([c]) => routes.some((r) => r.pickup === c))
                  .map(([c, href]) => [`${cityTitle(c)} taxi`, href] as [string, string]),
                ['How it works', '/#how'],
                ['How fares work', '/fares-explained'],
              ]}
            />
            <FooterCol
              title="Vehicles"
              links={[
                ...fleet.map((v) => [v.label, vehiclePath(v.key)] as [string, string]),
                ['Rajasthan Tours', '/rajasthan-tours'],
                ['Char Dham Yatra', '/char-dham-yatra'],
              ]}
            />
            {/* The road guides offered for indexing (27 Nov 2026, TIER1_GUIDES). */}
            <FooterCol
              title="Road guides"
              links={[
                ...GUIDES.filter((g) => isIndexableGuide(g.slug)).map((g) => [g.title.split(/[:?]/)[0], guidePath(g.slug)] as [string, string]),
                ['All guides', '/guides'],
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-small text-white/55 sm:flex-row-reverse sm:items-center sm:justify-between">
          {/* The pages somebody looks for at the moment they are deciding whether to pay.
              A site that hides them reads as one that would rather not be asked. Three
              across on a phone, so six links are two tidy rows rather than a ragged wrap. */}
          <ul className="grid grid-cols-3 gap-x-4 sm:flex sm:flex-wrap sm:gap-x-6">
            {(
              [
                // A plain link, not a conditional one: this footer is a server component on
                // 105 prerendered pages, and reading the session here would turn every one
                // of them into a page rendered on demand. Anybody not signed in is sent to
                // /login by the trips page itself.
                ['Your trips', '/bookings'],
                ['Guides', '/guides'],
                ['About', '/about'],
                ['Contact', '/contact'],
                ['Terms', '/terms'],
                ['Privacy', '/privacy'],
                ['Cancellation', '/refund'],
                ['Photo credits', '/photo-credits'],
              ] as [string, string][]
            ).map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-11 items-center underline-offset-4 transition-colors hover:text-white/80 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            © {new Date().getFullYear()} Hello My Cab. All rights reserved.{' '}
            {/* Autochatix runs our WhatsApp booking automation (owner, 28 Nov 2026). Inline in the
                same <p> because this row is a flex row: a new <p> would add a third column. A plain,
                followed link with the brand name as its text. */}
            · WhatsApp booking automation by{' '}
            <a
              href="https://autochatix.com/"
              className="underline-offset-4 transition-colors hover:text-white/80 hover:underline"
            >
              Autochatix
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
