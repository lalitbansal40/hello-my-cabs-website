import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { cityPath, routePath, vehiclePath } from '@/lib/slug';
import { env } from '@/lib/env';

/**
 * Built from the backend's route list, which returns only the pairs carrying a real listed
 * price — around 90 of the ~30,000 combinations 175 cities could make.
 *
 * That restraint is the point. A page per combination, differing only in two swapped city
 * names, is what search engines demote an entire site for; a sitemap advertising thousands
 * of them invites exactly that inspection. Pairs earn a page by having something to say.
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
const POLICY_UPDATED = new Date('2026-09-01');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: env.siteUrl, lastModified: BUILT, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${env.siteUrl}/routes`,
      lastModified: BUILT,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // The written pages. They rarely change and they are not what anyone searches for, but
    // they are what a person checks before paying — and they are in the fallback list
    // deliberately, so a backend outage cannot take the policies out of the sitemap.
    ...(['/about', '/contact', '/terms', '/privacy', '/refund'] as const).map((path) => ({
      url: `${env.siteUrl}${path}`,
      lastModified: POLICY_UPDATED,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];

  try {
    const [{ routes }, veh] = await Promise.all([api.routes(), api.vehicles()]);
    const origins = [...new Set(routes.map((r) => r.pickup))];
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
      })),
      ...routes.map((r) => ({
        // Built by the same helper the pages and the links use, so the sitemap cannot
        // advertise a URL that does not resolve. It did exactly that before these pages
        // existed: ninety entries, every one a 404.
        url: `${env.siteUrl}${routePath(r.pickup, r.drop)}`,
        lastModified: BUILT,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // A backend hiccup must not produce an EMPTY sitemap — submitting one tells Google the
    // pages are gone. Better to serve just the home page until the next revalidation.
    return staticPages;
  }
}
