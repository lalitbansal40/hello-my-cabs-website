// Offline meaningful regressions for actual source contracts, using existing TypeScript.
import assert from 'node:assert/strict';
import { sourceModules } from './source-modules.mjs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://127.0.0.1:43210/api/v1';
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.hellomycabs.com';
const files = {
  'app/sitemap': 'src/app/sitemap.ts',
  'app/sitemaps': 'src/app/sitemaps/sitemap.ts',
  'lib/sitemap-entries': 'src/lib/sitemap-entries.ts',
  'app/robots': 'src/app/robots.ts',
  'lib/env': 'src/lib/env.ts',
  'lib/company': 'src/lib/company.ts',
  'lib/schema': 'src/lib/schema.tsx',
  'lib/reviews': 'src/lib/reviews.ts',
  'lib/review-rules': 'src/lib/review-rules.ts',
  'lib/slug': 'src/lib/slug.ts',
  'lib/held-routes': 'src/lib/held-routes.ts',
  'lib/city-pages': 'src/lib/city-pages.ts',
  'lib/route-variants': 'src/lib/route-variants.ts',
  'lib/variant-pages': 'src/lib/variant-pages.ts',
  'content/guides': 'src/content/guides/index.ts',
  'content/chardham': 'src/content/chardham/index.ts',
  'content/rajasthan': 'src/content/rajasthan/index.ts',
};
const modules = await sourceModules(files, {
  'lib/api': `
    export const fromSlug = s => s.toUpperCase().replace(/-/g, '_');
    const routes = [['JAIPUR','DELHI'],['JAIPUR','AGRA'],['JAIPUR','KOTA'],['DELHI','AGRA'],['DELHI','NOIDA']].map(([pickup,drop]) => ({pickup,drop,fixed:true,fromRupees:100}));
    const vehicles = [{key:'dzire',label:'Dzire'},{key:'crysta',label:'Innova Crysta'}];
    const fare = {vehicles:vehicles.map(v => ({...v,price:100,fare:100,total:100}))};
    const catalog = () => globalThis.__hmcSeoFailCatalog ? Promise.reject(new Error('Catalog unavailable')) : Promise.resolve({routes:routes.filter(r => !(r.pickup==='DELHI' && r.drop==='NOIDA'))});
    export const api = {
      listedRoutes: catalog,
      routes: catalog,
      vehicles: async () => ({intercity:globalThis.__hmcSeoDuplicate ? [...vehicles,vehicles[0]] : vehicles,roundTripOnly:[]}),
      onewayFare: async () => fare,
      roundtripFare: async () => fare,
      reviews: async () => globalThis.__hmcSeoReviewCatalog,
    };`,
});
let passed = 0;
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const test = async (id, name, fn) => {
  if (only && only !== id) return;
  await fn();
  passed++;
  console.log(`  ✓ ${name}`);
};
try {
  const { default: sitemap } = await modules.load('app/sitemap');
  const { default: robots } = await modules.load('app/robots');
  const { env } = await modules.load('lib/env');
  const { routeRatingEligible, worthShowing } = await modules.load('lib/review-rules');
  const { routeReviews, cityReviews, siteReviews } = await modules.load('lib/reviews');
  const { JsonLd, serviceSchema, taxiServiceSchema, webPageSchema, breadcrumbSchema } =
    await modules.load('lib/schema');
  const summary = (count, average = 4.5) => ({
    count,
    average,
    driverCount: 0,
    driverAverage: null,
    cabCount: 0,
    cabAverage: null,
    tags: [],
  });
  const catalog = () => ({
    routes: [{ pickup: 'JAIPUR', drop: 'DELHI', ...summary(6) }],
    cities: [{ city: 'JAIPUR', ...summary(6) }],
    site: summary(10),
  });
  const schema = (rating) =>
    serviceSchema({
      name: 'Test journey',
      description: 'Test only',
      path: '/jaipur-to-delhi-cab',
      serviceType: 'Taxi',
      areaServed: ['Jaipur', 'Delhi'],
      offers: [{ name: 'Test fare', price: 100 }],
      rating,
    });

  await test(
    'sitemap-outage',
    'sitemap fails generation on unavailable catalog, preserving last ISR result',
    async () => {
      globalThis.__hmcSeoFailCatalog = true;
      try {
        await assert.rejects(sitemap(), /Catalog unavailable/);
      } finally {
        globalThis.__hmcSeoFailCatalog = false;
      }
    },
  );
  await test(
    'sitemap-dates',
    'only explicitly dated guide pages carry lastmod, not deployment dates',
    async () => {
      const pages = await sitemap();
      assert.ok(pages.length > 10);
      for (const page of pages) {
        if (page.lastModified)
          assert.ok(new URL(page.url).pathname.startsWith('/guides/'), page.url);
        assert.ok(page.url.startsWith('https://www.hellomycabs.com'));
        assert.ok(!page.url.includes('DELHI') && !page.url.includes('/booking'));
      }
      assert.ok(!pages.some((p) => p.url.endsWith('/delhi-to-noida-cab')));
      assert.ok(!pages.some((p) => /char-dham-yatra|rajasthan-tours/.test(p.url)));
      assert.ok(pages.some((p) => p.url.endsWith('/jaipur-to-delhi-round-trip-cab')));
    },
  );
  await test(
    'sitemap-dedup',
    'duplicate catalog vehicle rows never create duplicate sitemap URLs',
    async () => {
      globalThis.__hmcSeoDuplicate = true;
      try {
        const pages = await sitemap();
        assert.equal(new Set(pages.map((p) => p.url)).size, pages.length);
      } finally {
        globalThis.__hmcSeoDuplicate = false;
      }
    },
  );
  await test(
    'robots',
    'robots allows only exact approved production origin, never lookalike/preview',
    () => {
      for (const origin of [
        'https://preview.hellomycabs.com',
        'https://hellomycabs.com.attacker.invalid',
        'https://not-hellomycabs.com',
        'http://localhost:3000',
      ]) {
        env.siteUrl = origin;
        assert.equal(robots().rules.disallow, '/');
      }
      env.siteUrl = 'https://www.hellomycabs.com';
      assert.equal(robots().rules.allow, '/');
      // The full list first, then one file per kind (13 Nov 2026).
      assert.deepEqual(robots().sitemap, [
        'https://www.hellomycabs.com/sitemap.xml',
        ...['core', 'cities', 'routes', 'vehicles', 'guides'].map(
          (g) => `https://www.hellomycabs.com/sitemaps/sitemap/${g}.xml`,
        ),
      ]);
    },
  );
  await test(
    'review-coherent',
    'coherent route-specific counters can qualify; general rating never substitutes',
    () => {
      assert.equal(routeRatingEligible(catalog(), 'JAIPUR', 'DELHI'), true);
      assert.equal(routeRatingEligible(catalog(), 'JAIPUR', 'AGRA'), false);
    },
  );
  await test(
    'review-inconsistent',
    'route/site count contradictions suppress schema but preserve visible feedback',
    async () => {
      const all = catalog();
      all.site = summary(5);
      globalThis.__hmcSeoReviewCatalog = all;
      const result = await routeReviews('JAIPUR', 'DELHI');
      assert.equal(result.count, 6);
      assert.equal(result.eligibleForSchema, false);
      assert.equal(schema(result)[1].aggregateRating, undefined);
    },
  );
  await test(
    'review-sum',
    'sum of route counts cannot exceed the whole site, even when each fits separately',
    () => {
      const all = catalog();
      all.routes.push({ pickup: 'DELHI', drop: 'JAIPUR', ...summary(6) });
      assert.equal(routeRatingEligible(all, 'JAIPUR', 'DELHI'), false);
    },
  );
  await test('review-duplicate', 'duplicate route counters are rejected for markup', () => {
    const all = catalog();
    all.routes.push(all.routes[0]);
    all.site = summary(50);
    assert.equal(routeRatingEligible(all, 'JAIPUR', 'DELHI'), false);
  });
  await test(
    'review-marker',
    'explicit synthetic marker at catalog, site or route cannot produce review markup',
    () => {
      for (const target of ['catalog', 'site', 'route']) {
        const all = catalog();
        (target === 'catalog'
          ? all
          : target === 'site'
            ? all.site
            : all.routes[0]
        ).isSyntheticTestData = true;
        assert.equal(routeRatingEligible(all, 'JAIPUR', 'DELHI'), false);
      }
      assert.equal(worthShowing({ ...summary(6), isSyntheticTestData: true }), null);
    },
  );
  await test(
    'review-values',
    'nonfinite, fractional, out-of-range and contradictory review dimensions are rejected',
    () => {
      for (const bad of [
        { count: Infinity },
        { count: 5.5 },
        { average: NaN },
        { average: 6 },
        { driverCount: 20, driverAverage: 4 },
        { tags: [{ count: 10 }] },
      ]) {
        assert.equal(worthShowing({ ...summary(6), ...bad }), null);
      }
      assert.equal(worthShowing(summary(4)), null);
      assert.equal(worthShowing(summary(6)).count, 6);
    },
  );
  await test(
    'review-malformed',
    'malformed review data fails closed without taking down a fare page',
    () => {
      assert.equal(worthShowing({ ...summary(6), tags: {} }), null);
      const all = catalog();
      all.routes = [null];
      assert.equal(routeRatingEligible(all, 'JAIPUR', 'DELHI'), false);
    },
  );
  await test(
    'review-legacy',
    'legacy feedback without dimension counts retains its overall rating without inventing bars',
    () => {
      const legacy = worthShowing({ count: 6, average: 4.5, driverAverage: 4.8, cabAverage: 4.7 });
      assert.equal(legacy.count, 6);
      assert.equal(legacy.average, 4.5);
      assert.equal(legacy.driverCount, 0);
      assert.equal(legacy.driverAverage, null);
      assert.equal(legacy.cabAverage, null);
    },
  );
  await test(
    'review-catalog-marker',
    'explicitly marked test batches cannot enter visible server feedback',
    async () => {
      const all = catalog();
      all.isSyntheticTestData = true;
      globalThis.__hmcSeoReviewCatalog = all;
      assert.equal(await routeReviews('JAIPUR', 'DELHI'), null);
      assert.equal(await cityReviews('JAIPUR'), null);
      assert.equal(await siteReviews(), null);
    },
  );
  await test(
    'schema-evidence',
    'raw or marked counters never receive aggregateRating; checked route evidence remains supported',
    () => {
      assert.equal(schema(summary(6))[1].aggregateRating, undefined);
      assert.equal(
        schema({ ...summary(6), eligibleForSchema: true, isSyntheticTestData: true })[1]
          .aggregateRating,
        undefined,
      );
      assert.equal(
        schema({ ...summary(6), eligibleForSchema: true })[1].aggregateRating.ratingCount,
        6,
      );
    },
  );
  await test(
    'schema-city',
    'self-serving city TaxiService review markup is absent without removing visible reviews',
    () => {
      assert.equal(
        taxiServiceSchema({ city: 'Jaipur', path: '/cab-service-in-jaipur', rating: summary(6) })
          .aggregateRating,
        undefined,
      );
    },
  );
  await test(
    'schema-fares',
    'existing fare/GST offers remain unchanged and never assert real-time stock',
    () => {
      const [service, product] = schema(null);
      assert.equal(product.offers.lowPrice, 100);
      assert.equal(product.offers.offers[0].priceSpecification.valueAddedTaxIncluded, false);
      assert.equal(service.offers.availability, undefined);
      assert.equal(product.offers.offers[0].availability, undefined);
      assert.equal(service['@type'], 'Service');
      assert.equal(product['@type'], 'Product');
    },
  );
  await test(
    'schema-date',
    'WebPage has no invented modification timestamp but supports an explicit real revision',
    () => {
      assert.equal(webPageSchema({ path: '/x', name: 'x' }).dateModified, undefined);
      assert.equal(
        webPageSchema({ path: '/x', name: 'x', modified: new Date('2026-10-01T00:00:00Z') })
          .dateModified,
        '2026-10-01T00:00:00.000Z',
      );
    },
  );
  await test(
    'schema-breadcrumb',
    'breadcrumb uses ordered actual links on the preferred origin',
    () => {
      const trail = breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Routes', path: '/routes' },
      ]);
      assert.equal(trail.itemListElement[1].position, 2);
      assert.equal(trail.itemListElement[1].item, 'https://www.hellomycabs.com/routes');
    },
  );
  await test(
    'schema-script',
    'JSON-LD cannot break out of its script element and still parses to original text',
    () => {
      const value = { name: 'Test </script><script>alert(1)</script>' };
      const markup = renderToStaticMarkup(createElement(JsonLd, { data: value }));
      assert.equal((markup.match(/<script/g) ?? []).length, 1);
      const text = markup.match(/<script[^>]*>([\s\S]*)<\/script>/)[1];
      assert.deepEqual(JSON.parse(text), value);
    },
  );
  await test(
    'api-status',
    'public API rejects HTTP failures even with a misleading success body; caching and no-retry semantics remain',
    async () => {
      const originalFetch = globalThis.fetch;
      const real = await sourceModules({
        'lib/api': 'src/lib/api.ts',
        'lib/env': 'src/lib/env.ts',
        'lib/held-routes': 'src/lib/held-routes.ts',
      });
      try {
        const { api } = await real.load('lib/api');
        let calls = 0;
        globalThis.fetch = async (_url, init) => {
          calls++;
          assert.equal(init.next.revalidate, 86400);
          assert.deepEqual(init.next.tags, ['hmc-public-api']);
          return new Response(JSON.stringify({ ok: true, data: { routes: [] } }), { status: 503 });
        };
        await assert.rejects(api.routes(), /failed/);
        assert.equal(calls, 1);
        globalThis.fetch = async () =>
          new Response(JSON.stringify({ ok: true, data: { routes: [] } }), { status: 200 });
        assert.deepEqual(await api.routes(), { routes: [] });
      } finally {
        globalThis.fetch = originalFetch;
        real.close();
      }
    },
  );
  await test(
    'sitemap-groups',
    'group sitemaps split the full list exactly: every URL in one group, none in two, none extra',
    async () => {
      const { default: groupSitemap, generateSitemaps } = await modules.load('app/sitemaps');
      const ids = (await generateSitemaps()).map((g) => g.id);
      assert.deepEqual(ids, ['core', 'cities', 'routes', 'vehicles', 'guides']);
      const full = (await sitemap()).map((p) => p.url);
      const seen = new Map();
      for (const id of ids) {
        for (const page of await groupSitemap({ id: Promise.resolve(id) })) {
          assert.ok(!seen.has(page.url), `${page.url} in ${seen.get(page.url)} and ${id}`);
          seen.set(page.url, id);
        }
      }
      assert.deepEqual([...seen.keys()].sort(), [...full].sort());
      // Each kind where it belongs.
      assert.equal(seen.get('https://www.hellomycabs.com'), 'core');
      assert.equal(seen.get('https://www.hellomycabs.com/guides'), 'guides');
      assert.equal(seen.get('https://www.hellomycabs.com/jaipur-to-delhi-cab'), 'routes');
      assert.equal(seen.get('https://www.hellomycabs.com/cab-service-in-jaipur'), 'cities');
      assert.equal(seen.get('https://www.hellomycabs.com/dzire-taxi'), 'vehicles');
      // No group invents a date: only the guides carry one.
      for (const id of ids) {
        for (const page of await groupSitemap({ id: Promise.resolve(id) })) {
          if (id !== 'guides') assert.equal(page.lastModified, undefined, page.url);
        }
      }
    },
  );
  await test(
    'tier1-links',
    'Tier 1 links only pages that exist: listed routes, cities with a page, cars with a page',
    async () => {
      const t1 = await sourceModules(
        { 'lib/tier1': 'src/lib/tier1.ts', 'lib/slug': 'src/lib/slug.ts' },
        { 'lib/api': 'export const fromSlug = s => s;' },
      );
      try {
        const { tier1Links, tier1Paths } = await t1.load('lib/tier1');
        const links = tier1Links({
          routes: [
            { pickup: 'JAIPUR', drop: 'DELHI' },
            { pickup: 'KOTA', drop: 'JAIPUR' },
          ],
          cityPages: new Set(['KOTA', 'JAIPUR']),
          vehicles: new Set(['crysta']),
        });
        assert.deepEqual(links.routes.map((l) => l.href), ['/jaipur-to-delhi-cab', '/kota-to-jaipur-cab']);
        assert.deepEqual(links.cities.map((l) => [l.href, l.label]), [
          ['/cab-service-in-kota', 'Taxi service in Kota'],
          ['/cab-service-in-jaipur', 'Taxi service in Jaipur'],
        ]);
        assert.deepEqual(links.vehicles, [{ href: '/innova-crysta-taxi', label: 'Innova Crysta taxi' }]);
        assert.equal(tier1Paths(links)[0], '/');
      } finally {
        t1.close();
      }
    },
  );
  console.log(`${passed} SEO recovery tests passed`);
} finally {
  delete globalThis.__hmcSeoFailCatalog;
  delete globalThis.__hmcSeoDuplicate;
  delete globalThis.__hmcSeoReviewCatalog;
  modules.close();
}
