import { api } from '@/lib/api';
import { readSlug } from '@/lib/slug';
import { routeMapSvg } from '@/lib/route-map';

/**
 * GET /jaipur-to-delhi-cab/map.svg — the route's map (lib/route-map.ts), for the <img> on
 * the route page and the image sitemap. Only for a route the site publishes; anything else
 * is a 404, the same as the page.
 */
export const revalidate = 86_400;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = readSlug(slug);
  if (landing?.kind !== 'route') return new Response('Not found', { status: 404 });
  const [{ routes }, cities] = await Promise.all([
    api.routes().catch(() => ({ routes: [] })),
    api.cities().catch(() => []),
  ]);
  const row = routes.find((r) => r.pickup === landing.pickup && r.drop === landing.drop);
  const from = cities.find((c) => c.name === landing.pickup);
  const to = cities.find((c) => c.name === landing.drop);
  if (!row || !from || !to) return new Response('Not found', { status: 404 });

  // The faint dots: the other cities the site has routes for — places a reader knows.
  const served = new Set(routes.flatMap((r) => [r.pickup, r.drop]));
  const svg = routeMapSvg({
    from,
    to,
    others: cities.filter((c) => served.has(c.name)),
    km: row.distanceKm,
  });
  if (!svg) return new Response('Not found', { status: 404 });
  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
