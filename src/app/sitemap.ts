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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: env.siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ];

  try {
    const [{ routes }, veh] = await Promise.all([api.routes(), api.vehicles()]);
    const origins = [...new Set(routes.map((r) => r.pickup))];
    const allVehicles = [...veh.intercity, ...veh.roundTripOnly];
    return [
      ...staticPages,
      ...allVehicles.map((v) => ({
        url: `${env.siteUrl}${vehiclePath(v.key)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...origins.map((c) => ({
        url: `${env.siteUrl}${cityPath(c)}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...routes.map((r) => ({
        // Built by the same helper the pages and the links use, so the sitemap cannot
        // advertise a URL that does not resolve. It did exactly that before these pages
        // existed: ninety entries, every one a 404.
        url: `${env.siteUrl}${routePath(r.pickup, r.drop)}`,
        lastModified: now,
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
