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
        <div className="grid gap-12 border-b border-white/10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/55">
              Outstation cabs with a driver, at a fare agreed before you travel.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon.star key={i} className="h-3.5 w-3.5" />
              ))}
              <span className="ml-1.5 text-[13px] font-semibold text-white/70">4.8 / 5</span>
            </div>
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
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/40">
              Talk to us
            </h3>
            <p className="mt-4 text-[15px] text-white/55">Every day, around the clock</p>
            <a
              href="tel:+919667111921"
              className="mt-1.5 block text-2xl font-black tracking-tight transition-colors hover:text-accent"
            >
              +91 96671 11921
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-[13px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Hello My Cab. All rights reserved.</p>
          {/* The pages somebody looks for at the moment they are deciding whether to pay.
              A site that hides them reads as one that would rather not be asked. */}
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {(
              [
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
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/40">{title}</h3>
      <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-white/55">
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
