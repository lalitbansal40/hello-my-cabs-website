// Independent expected URL inventory from public API snapshots and actual source helpers.
// Usage: node scripts/seo/catalog-inventory.mjs SNAPSHOT_DIRECTORY OUTPUT.json
// Snapshots are read-only public responses: routes.json, vehicles.json, fares_all.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sourceModules } from '../test/source-modules.mjs';

const [snapshotDirectory, output] = process.argv.slice(2);
if (!snapshotDirectory || !output) throw new Error('Provide snapshot directory and output JSON');
const read = (name) => {
  const body = JSON.parse(readFileSync(resolve(snapshotDirectory, `${name}.json`), 'utf8'));
  if (!body.ok || !body.data) throw new Error(`Invalid public snapshot: ${name}`);
  return body.data;
};
const routes = read('routes').routes;
const vehicles = read('vehicles');
const fares = read('fares_all').routes;
const modules = await sourceModules(
  {
    'lib/slug': 'src/lib/slug.ts',
    'lib/held-routes': 'src/lib/held-routes.ts',
    'lib/city-pages': 'src/lib/city-pages.ts',
    'lib/route-variants': 'src/lib/route-variants.ts',
    'lib/variant-pages': 'src/lib/variant-pages.ts',
    'content/guides': 'src/content/guides/index.ts',
    'content/chardham': 'src/content/chardham/index.ts',
    'content/rajasthan': 'src/content/rajasthan/index.ts',
  },
  {
    'lib/api': `
    const fares = ${JSON.stringify(fares)};
    export const fromSlug = s => s.toUpperCase().replace(/-/g, '_');
    const fare = (p, d, kind) => {
      const row = fares.find(r => r.pickup === p && r.drop === d)?.[kind];
      if (!row) throw new Error('No snapshot fare for ' + p + '-' + d);
      return Promise.resolve(row);
    };
    export const api = {
      onewayFare: (p,d) => fare(p,d,'oneway'),
      roundtripFare: (p,d) => fare(p,d,'roundtrip'),
    };`,
  },
);
try {
  const slug = await modules.load('lib/slug');
  const { indexable, listed, isHeldRoute, isThinRoute } = await modules.load('lib/held-routes');
  const { citiesWithPages } = await modules.load('lib/city-pages');
  const { publishedVariants } = await modules.load('lib/variant-pages');
  const { GUIDES, guidePath } = await modules.load('content/guides');
  const { CHARDHAM_IS_SAMPLE } = await modules.load('content/chardham');
  const { RAJASTHAN_IS_SAMPLE } = await modules.load('content/rajasthan');
  const rows = [];
  const add = (path, type, index = true) => rows.push({ path, type, index });
  for (const path of [
    '/',
    '/routes',
    '/luxury-car',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/refund',
    '/fares-explained',
    '/guides',
  ]) {
    add(path, path === '/' ? 'home' : path === '/routes' ? 'directory' : 'static');
  }
  for (const g of GUIDES) add(guidePath(g.slug), 'guide');
  add('/char-dham-yatra', 'sample', !CHARDHAM_IS_SAMPLE);
  add('/rajasthan-tours', 'sample', !RAJASTHAN_IS_SAMPLE);
  add('/photo-credits', 'credits', false);
  for (const r of routes) {
    add(
      slug.routePath(r.pickup, r.drop),
      r.pickup.endsWith('_AIRPORT') || r.drop.endsWith('_AIRPORT') ? 'airport' : 'one-way',
      !isHeldRoute(r.pickup, r.drop) && !isThinRoute(r.pickup, r.drop),
    );
  }
  for (const v of await publishedVariants(routes))
    add(v.path, v.vehicle ? 'route-car' : 'round-trip');
  // Page generation uses raw routes; sitemap/navigation use listed routes. Keep both so
  // any future policy-induced city divergence is detected, rather than hidden.
  const sitemapCities = citiesWithPages(listed(routes));
  for (const city of citiesWithPages(routes))
    add(slug.cityPath(city), 'city', sitemapCities.has(city));
  for (const v of [...vehicles.intercity, ...vehicles.roundTripOnly])
    add(slug.vehiclePath(v.key), 'vehicle');
  const unique = new Map(rows.map((r) => [r.path, r]));
  if (unique.size !== rows.length) throw new Error('Duplicate source-generated URL');
  writeFileSync(
    output,
    JSON.stringify(
      {
        provenance:
          'Existing public Next fetch-cache snapshots; no database reads/writes; not new live API proof',
        sourceRouteCount: routes.length,
        indexableRouteCount: indexable(routes).length,
        pages: [...unique.values()].sort((a, b) => a.path.localeCompare(b.path)),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `${rows.length} generated public URLs; ${rows.filter((r) => r.index).length} intended indexable`,
  );
} finally {
  modules.close();
}
