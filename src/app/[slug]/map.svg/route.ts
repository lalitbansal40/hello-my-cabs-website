import { api } from '@/lib/api';
import { readSlug } from '@/lib/slug';
import { routeMapSvg } from '@/lib/route-map';
import { cityMapSvg } from '@/lib/city-map';
import { citiesWithPages } from '@/lib/city-pages';

/**
 * GET /jaipur-to-delhi-cab/map.svg — the route's map (lib/route-map.ts); and
 * GET /cab-service-in-jaipur/map.svg — every route out of the city (lib/city-map.ts, 7 Oct
 * 2026). For the <img> on the page and the image sitemap. Only for a route or city the site
 * publishes; anything else is a 404, the same as the page.
 */
export const revalidate = 86_400;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = readSlug(slug);
  if (landing?.kind === 'city') return cityMap(landing.city);
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
    measured: row.distanceMeasured === true,
  });
  return svgResponse(svg);
}

/** /cab-service-in-jaipur/map.svg — every listed route out of a city with a page (lib/city-map.ts). */
async function cityMap(key: string): Promise<Response> {
  const [{ routes }, cities] = await Promise.all([
    api.listedRoutes().catch(() => ({ routes: [] })),
    api.cities().catch(() => []),
  ]);
  const city = cities.find((c) => c.name === key);
  if (!city || !citiesWithPages(routes).has(key)) return svgResponse(null);
  const destinations = routes
    .filter((r) => r.pickup === key)
    .flatMap((r) => {
      const c = cities.find((x) => x.name === r.drop);
      return c ? [{ city: c, km: r.distanceKm }] : [];
    });
  return svgResponse(cityMapSvg({ city, destinations }));
}

function svgResponse(svg: string | null): Response {
  if (!svg) return new Response('Not found', { status: 404 });
  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
