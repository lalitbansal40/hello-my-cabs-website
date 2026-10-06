import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { cityPath, routePath, vehiclePath } from '@/lib/slug';
import { env } from '@/lib/env';
import { GUIDES, guidePath } from '@/content/guides';
import { CHARDHAM_IS_SAMPLE } from '@/content/chardham';
import { citiesWithPages } from '@/lib/city-pages';
import { publishedVariants } from '@/lib/variant-pages';

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
export const revalidate = 86_400;

/**
 * When these pages last actually changed.
 *
 * This used to be `new Date()` — every URL claiming it had changed today, every day. A
 * crawler that checks a few of those and finds the same page stops believing the field,
 * and then stops believing it on the day something really did change. `BUILD_TIME` is
 * stamped once when the site is built, which is the only moment any of this content can
 * change: the fares come from the backend at build time and the pages are prerendered.
 */
const BUILT = new Date(process.env.BUILD_TIME ?? Date.now());

/** The policy pages carry their own date on the page; the sitemap says the same thing. */
const POLICY_UPDATED = new Date('2026-10-06');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: env.siteUrl, lastModified: BUILT, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${env.siteUrl}/routes`,
      lastModified: BUILT,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Real fleet, real fares — searchable from the day it went up.
    { url: `${env.siteUrl}/luxury-car`, lastModified: BUILT, changeFrequency: 'monthly', priority: 0.7 },
    // Only once the packages are real (content/chardham): until then the page is noindex,
    // and a noindex page in the sitemap is a contradiction search consoles flag.
    ...(CHARDHAM_IS_SAMPLE
      ? []
      : [
          {
            url: `${env.siteUrl}/char-dham-yatra`,
            lastModified: BUILT,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
          },
        ]),
    // The written pages. They rarely change and they are not what anyone searches for, but
    // they are what a person checks before paying — and they are in the fallback list
    // deliberately, so a backend outage cannot take the policies out of the sitemap.
    ...(['/about', '/contact', '/terms', '/privacy', '/refund'] as const).map((path) => ({
      url: `${env.siteUrl}${path}`,
      lastModified: POLICY_UPDATED,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
    // The rules every route page links to, written 7 Oct 2026.
    {
      url: `${env.siteUrl}/fares-explained`,
      lastModified: new Date('2026-10-07'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // The guides carry their own dates — the day they were last actually revised, which is
    // what lastmod is for.
    {
      url: `${env.siteUrl}/guides`,
      lastModified: BUILT,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...GUIDES.map((g) => ({
      url: `${env.siteUrl}${guidePath(g.slug)}`,
      lastModified: new Date(g.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  try {
    const [{ routes }, veh] = await Promise.all([api.listedRoutes(), api.vehicles()]);
    // A route's round trip and its by-car pages (lib/route-variants.ts) — the same list the
    // pages are built from.
    const variants = await publishedVariants(routes);
    const origins = [...citiesWithPages(routes)];
    const allVehicles = [...veh.intercity, ...veh.roundTripOnly];
    return [
      ...staticPages,
      ...allVehicles.map((v) => ({
        url: `${env.siteUrl}${vehiclePath(v.key)}`,
        lastModified: BUILT,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...origins.map((c) => ({
        url: `${env.siteUrl}${cityPath(c)}`,
        lastModified: BUILT,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        // The city's route map (app/[slug]/map.svg) — its picture, for image search.
        images: [`${env.siteUrl}${cityPath(c)}/map.svg`],
      })),
      ...routes.map((r) => ({
        // Built by the same helper the pages and the links use, so the sitemap cannot
        // advertise a URL that does not resolve. It did exactly that before these pages
        // existed: ninety entries, every one a 404.
        url: `${env.siteUrl}${routePath(r.pickup, r.drop)}`,
        lastModified: BUILT,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        // The route's map (app/[slug]/map.svg) — the page's picture, for image search.
        images: [`${env.siteUrl}${routePath(r.pickup, r.drop)}/map.svg`],
      })),
      ...variants.map((v) => ({
        url: `${env.siteUrl}${v.path}`,
        lastModified: BUILT,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // A backend hiccup must not produce an EMPTY sitemap — submitting one tells Google the
    // pages are gone. Better to serve just the home page until the next revalidation.
    return staticPages;
  }
}
