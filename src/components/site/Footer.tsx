import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPath, cityTitle, routePath } from '@/lib/slug';
import { Icon } from './Icons';
import { Wordmark } from './Brand';

/**
 * The footer carries real links, not placeholders.
 *
 * Pages reachable only from a sitemap tend to sit unindexed for months — a crawler treats
 * a link as a vote that the page matters and a sitemap entry as a note that it exists.
 * Every route and city is linked from here as well as from /routes, so nothing is an
 * orphan.
 */
export async function Footer() {
  const { routes } = await api.routes().catch(() => ({ routes: [] }));
  const topRoutes = routes.slice(0, 6);
  const origins = [...new Set(routes.map((r) => r.pickup))].slice(0, 7);

  return (
    <footer className="hero-ground grain relative mt-28 text-white">
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-12 border-b border-white/10 py-16 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 text-body max-w-xs text-white/55">
              Outstation cabs with a driver, at a fare agreed before you travel.
            </p>
            {/* A "4.8 / 5" under five filled stars stood here with nothing behind it. A
                star rating is a claim about other people's opinions, so it needs a source
                — put the real Play Store figure back the moment we have it. */}
            <a
              href="tel:+919667111921"
              className="mt-6 text-body inline-flex items-center gap-2 font-semibold text-white/70 transition-colors hover:text-accent min-h-11"
            >
              <Icon.headset className="h-4 w-4" />
              +91 96671 11921
            </a>
          </div>

          <FooterCol
            title="Routes"
            links={[
              ...topRoutes.map(
                (r) =>
                  [`${cityTitle(r.pickup)} → ${cityTitle(r.drop)}`, routePath(r.pickup, r.drop)] as [
                    string,
                    string,
                  ],
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

          <div>
            <h3 className="font-bold text-label uppercase text-white/40">
              Talk to us
            </h3>
            <p className="mt-4 text-body text-white/55">Every day, around the clock</p>
            <a
              href="tel:+919667111921"
       className="mt-1.5 block text-stat font-black transition-colors hover:text-accent"
            >
              +91 96671 11921
            </a>
          </div>
        </div>

        <div className="flex text-small flex-col gap-4 py-6 text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Hello My Cab. All rights reserved.</p>
          {/* The pages somebody looks for at the moment they are deciding whether to pay.
              A site that hides them reads as one that would rather not be asked. */}
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {(
              [
                // A plain link, not a conditional one: this footer is a server component on
                // 105 prerendered pages, and reading the session here would turn every one
                // of them into a page rendered on demand. Anybody not signed in is sent to
                // /login by the trips page itself.
                ['Your trips', '/bookings'],
                ['About', '/about'],
                ['Contact', '/contact'],
                ['Terms', '/terms'],
                ['Privacy', '/privacy'],
                ['Cancellation', '/refund'],
              ] as [string, string][]
            ).map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-white/70">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="font-bold text-label uppercase text-white/40">{title}</h3>
      <ul className="mt-4 text-body flex flex-col gap-2.5 text-white/55">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
