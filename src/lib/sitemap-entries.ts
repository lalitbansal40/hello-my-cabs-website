import type { MetadataRoute } from 'next';
import { hindiEnglishPaths, hiPath } from '@/lib/hindi';
import { HI_CITY } from '@/content/hi';
import { HINDI_LIVE, isIndexableCity, isIndexableGuide, isIndexableVariantPath, isIndexableVehicle } from '@/lib/indexing-tiers';
import { RAJASTHAN_IS_SAMPLE } from '@/content/rajasthan';
import { api } from '@/lib/api';
import { cityPath, routePath, vehiclePath } from '@/lib/slug';
import { env } from '@/lib/env';
import { GUIDES, guidePath } from '@/content/guides';
import { CHARDHAM_IS_SAMPLE } from '@/content/chardham';
import { OWN_PAGE, citiesWithPages } from '@/lib/city-pages';
import { publishedVariants } from '@/lib/variant-pages';
import { indexable } from '@/lib/held-routes';

/**
 * Built from the backend's route list, which returns only the pairs carrying a real listed
 * price — around 90 of the ~30,000 combinations 175 cities could make.
 *
 * That restraint is the point. A page per combination, differing only in two swapped city
 * names, is what search engines demote an entire site for; a sitemap advertising thousands
 * of them invites exactly that inspection. Pairs earn a page by having something to say.
 *
 * The routes held out of search until they are priced (lib/held-routes.ts) are left out:
 * a sitemap entry for a `noindex` page is a contradiction Search Console reports as an error.
 */

// A deploy/render timestamp is not a content revision. Only explicitly dated
// editorial guide records below have reliable day-level modification dates.
// Omit lastModified elsewhere until a trustworthy content/fare revision is available.

/** The sitemap groups (13 Nov 2026) — one file each, so Search Console reports each part's indexing separately. */
export const SITEMAP_GROUPS = ['core', 'cities', 'routes', 'vehicles', 'guides'] as const;
export type SitemapGroup = (typeof SITEMAP_GROUPS)[number];

/**
 * Every page the site asks to have indexed, tagged with its group. `/sitemap.xml` lists all
 * of them (unchanged, because Search Console and the site's own checks read it); the group
 * sitemaps (app/sitemaps/sitemap.ts) list one group each. A URL in both the full list and
 * its group is allowed by the protocol; no URL is in two groups.
 */
export async function sitemapEntries(): Promise<
  Array<{ group: SitemapGroup; entry: MetadataRoute.Sitemap[number] }>
> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: env.siteUrl, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${env.siteUrl}/routes`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // /luxury-car: noindex since 27 Nov 2026 (not Wave 1), so not listed.
    // Only once the packages are real (content/chardham): until then the page is noindex,
    // and a noindex page in the sitemap is a contradiction search consoles flag.
    ...(CHARDHAM_IS_SAMPLE
      ? []
      : [
          {
            url: `${env.siteUrl}/char-dham-yatra`,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
          },
        ]),
    // The same for Rajasthan Tours (content/rajasthan) — in only once its packages are real.
    ...(RAJASTHAN_IS_SAMPLE
      ? []
      : [
          {
            url: `${env.siteUrl}/rajasthan-tours`,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
          },
        ]),
    // The written pages. They rarely change and they are not what anyone searches for, but
    // they are what a person checks before paying — and they are in the fallback list
    // deliberately. If the upstream catalog fails, generation fails rather than
    // replacing the last complete ISR sitemap with a partial list.
    // Legal pages (terms, privacy, refund) stay indexable but are not listed (27 Nov 2026,
    // owner P10 default): the sitemaps carry only the pages we ask Google to crawl first.
    ...(['/about', '/contact'] as const).map((path) => ({
      url: `${env.siteUrl}${path}`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
    // The rules every route page links to, written 7 Oct 2026.
    {
      url: `${env.siteUrl}/fares-explained`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // The guides carry their own dates — the day they were last actually revised, which is
    // what lastmod is for.
    {
      url: `${env.siteUrl}/guides`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...GUIDES.filter((g) => isIndexableGuide(g.slug)).map((g) => ({
      url: `${env.siteUrl}${guidePath(g.slug)}`,
      lastModified: new Date(g.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  const [{ routes }, veh] = await Promise.all([api.listedRoutes(), api.vehicles()]);
  // A route page that shows our own trip figures changes when they do: its lastmod is the
  // date of those figures (route-insights asOf, 20 Nov 2026). Others carry no date — no build
  // or render dates, the rule since 13 Nov.
  const insightsDate = new Map<string, Date>();
  await Promise.all(
    indexable(routes).map(async (r) => {
      const i = await api.routeInsights(r.pickup, r.drop);
      if (i && i.demand != null) insightsDate.set(`${r.pickup}>${r.drop}`, new Date(i.asOf));
    }),
  );
  // A route's round trip and its by-car pages (lib/route-variants.ts) — the same list the
  // pages are built from.
  const variants = await publishedVariants(routes);
  const origins = [...citiesWithPages(routes)];
  const allVehicles = [...veh.intercity, ...veh.roundTripOnly];
  const tag = (group: SitemapGroup) => (entry: MetadataRoute.Sitemap[number]) => ({ group, entry });
  const isGuide = (url: string) => url === `${env.siteUrl}/guides` || url.startsWith(`${env.siteUrl}/guides/`);
  const tagged = [
    ...staticPages.map((e) => ({ group: (isGuide(e.url) ? 'guides' : 'core') as SitemapGroup, entry: e })),
    ...allVehicles
      .filter((v) => isIndexableVehicle(v.key))
      .map((v) => ({
        url: `${env.siteUrl}${vehiclePath(v.key)}`,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
      .map(tag('vehicles')),
    ...origins
      .filter((c) => isIndexableCity(c))
      .map((c) => ({
        url: `${env.siteUrl}${cityPath(c)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        // The city's route map (app/[slug]/map.svg) — its picture, for image search.
        images: [`${env.siteUrl}${cityPath(c)}/map.svg`],
      }))
      .map(tag('cities')),
    // Places with a page of their own instead of a city page (lib/city-pages.ts OWN_PAGE,
    // 21 Nov 2026: Jaipur Airport) — listed once the catalogue has their routes.
    ...Object.entries(OWN_PAGE)
      .filter(([city]) => routes.some((r) => r.pickup === city))
      .map(([, path]) => ({ url: `${env.siteUrl}${path}`, changeFrequency: 'weekly' as const, priority: 0.8 }))
      .map(tag('cities')),
    // Not the thin routes kept out of the index (lib/held-routes.ts NOINDEX_THIN) — a
    // sitemap entry for a noindex page is a contradiction Search Console reports.
    ...indexable(routes)
      .map((r) => ({
        // Built by the same helper the pages and the links use, so the sitemap cannot
        // advertise a URL that does not resolve. It did exactly that before these pages
        // existed: ninety entries, every one a 404.
        url: `${env.siteUrl}${routePath(r.pickup, r.drop)}`,
        ...(insightsDate.has(`${r.pickup}>${r.drop}`)
          ? { lastModified: insightsDate.get(`${r.pickup}>${r.drop}`) }
          : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        // The route's map (app/[slug]/map.svg) — the page's picture, for image search.
        images: [`${env.siteUrl}${routePath(r.pickup, r.drop)}/map.svg`],
      }))
      .map(tag('routes')),
    ...variants
      .filter((v) => isIndexableVariantPath(v.path))
      .map((v) => ({
        url: `${env.siteUrl}${v.path}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        // The route's map — the same road (app/[slug]/map.svg).
        images: [`${env.siteUrl}${routePath(v.pickup, v.drop)}/map.svg`],
      }))
      .map(tag('routes')),
  ];
  // The Hindi copies (lib/hindi.ts) — only once HINDI_LIVE; until then they are noindex and a
  // sitemap entry for them would contradict that.
  if (HINDI_LIVE) {
    for (const en of hindiEnglishPaths(HI_CITY)) {
      tagged.push({ group: 'core', entry: { url: `${env.siteUrl}${hiPath(en)}`, changeFrequency: 'weekly', priority: 0.5 } });
    }
  }
  // One entry per URL, the first group to name it keeping it.
  return [...new Map(tagged.map((t) => [t.entry.url, t])).values()];
}
