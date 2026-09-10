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
 *
 * On a phone the four blocks used to stack, which made this the longest thing on the site:
 * fourteen hundred pixels of footer under every page, with the same phone number printed
 * twice in it. Routes and cities sit side by side now and the number appears once, in the
 * block with the name it belongs to. Each link is a 44px row rather than 20px of text —
 * the reason the rows are no longer separated by a gap is that the tap area now provides
 * the spacing itself.
 */
export async function Footer() {
  const { routes } = await api.routes().catch(() => ({ routes: [] }));
  const topRoutes = routes.slice(0, 6);
  const origins = [...new Set(routes.map((r) => r.pickup))].slice(0, 7);

  return (
    <footer className="hero-ground grain relative mt-section-sm text-white">
      <div className="relative mx-auto max-w-6xl 2xl:max-w-7xl px-gutter">
        <div className="grid gap-x-6 gap-y-10 border-b border-white/10 py-12 sm:py-16 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-body text-white/55">
              Outstation cabs with a driver, at a fare agreed before you travel.
            </p>
            {/* A "4.8 / 5" under five filled stars stood here with nothing behind it. A
                star rating is a claim about other people's opinions, so it needs a source
                — put the real Play Store figure back the moment we have it. */}
            <p className="mt-8 text-label font-bold uppercase text-white/40">Talk to us</p>
            <a
              href="tel:+919667111921"
              className="mt-1 inline-flex min-h-11 items-center gap-2.5 text-title-lg font-black transition-colors hover:text-accent"
            >
              <Icon.headset className="h-5 w-5 text-accent" />
              +91 96671 11921
            </a>
            <p className="text-small text-white/45">Every day, around the clock</p>
          </div>

          {/* Two columns on a phone as well: one column of fifteen links is a scroll, and
              these are the links a person came down here looking for. */}
          <div className="col-span-full grid grid-cols-2 gap-x-6 lg:col-span-2 lg:contents">
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
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-small text-white/35 sm:flex-row-reverse sm:items-center sm:justify-between">
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
                  className="flex min-h-11 items-center transition-colors hover:text-white/70"
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

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-label font-bold uppercase text-white/40">{title}</h3>
      <ul className="mt-1 flex flex-col text-body text-white/55">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="flex min-h-11 items-center py-1 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
