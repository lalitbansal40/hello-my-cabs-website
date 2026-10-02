import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPath, cityTitle, routePath, vehiclePath } from '@/lib/slug';
import { citiesWithPages } from '@/lib/city-pages';
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
  const topRoutes = routes.slice(0, 6);
  const origins = [...citiesWithPages(routes)].slice(0, 7);
  // The vehicle pages were reachable from city pages and nowhere else — not from the home
  // page, not from a route page, not from here. A page with one way in is a page that gets
  // crawled last and ranked accordingly.
  const fleet = [...veh.intercity, ...veh.roundTripOnly].slice(0, 6);

  return (
    <footer className="hero-ground grain relative mt-section-sm text-white">
      {/* The road along the top edge — the dashed red line the ticket and the steps use. */}
      <div
        aria-hidden
        className="h-1.5 bg-[repeating-linear-gradient(90deg,var(--color-accent)_0_28px,transparent_28px_44px)]"
      />
      <div className="relative mx-auto max-w-6xl 2xl:max-w-7xl px-gutter">
        <div className="grid gap-x-6 gap-y-10 border-b border-white/10 py-12 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark tone="dark" />
            <p className="mt-4 max-w-xs text-body text-white/55">
              Outstation cabs with a driver, at a fare agreed before you travel.
            </p>
            {/* A "4.8 / 5" under five filled stars stood here with nothing behind it. A
                star rating is a claim about other people's opinions, so it needs a source
                — put the real Play Store figure back the moment we have it. */}
            <p className="mt-8 text-label font-bold uppercase text-white/55">Talk to us</p>
            <a
              href={company.phoneHref}
              className="mt-1 inline-flex min-h-11 items-center gap-2.5 text-title-lg font-black transition-colors hover:text-accent"
            >
              <Icon.phone className="h-5 w-5 text-accent" />
              {company.phone}
            </a>
            <p className="text-small text-white/60">Every day, around the clock</p>
            {/* How the money works, in one line: the question asked most before booking. */}
            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Icon.check className="h-4 w-4 text-accent" />
                Pay by UPI or cash
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon.check className="h-4 w-4 text-accent" />
                Driver and fuel included
              </span>
            </p>
            {/* The company's registered details, the moment they are filled in (company.ts).
                Until then nothing — never a placeholder address. */}
            {company.registeredAddress || company.email ? (
              <div className="mt-6 text-small text-white/55">
                <p className="text-label font-bold uppercase text-white/55">Registered office</p>
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
          <div className="col-span-full grid grid-cols-1 gap-x-6 sm:grid-cols-3 sm:gap-y-10 lg:col-span-3 lg:contents">
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
                ['All routes', '/routes'],
              ]}
            />
            <FooterCol
              title="Cities"
              links={[
                ...origins.map((c) => [cityTitle(c), cityPath(c)] as [string, string]),
                ['How it works', '/#how'],
              ]}
            />
            <FooterCol
              title="Vehicles"
              links={[
                ...fleet.map((v) => [v.label, vehiclePath(v.key)] as [string, string]),
                ['Luxury cars', '/luxury-car'],
                ['Char Dham Yatra', '/char-dham-yatra'],
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
          <p>© {new Date().getFullYear()} Hello My Cab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
