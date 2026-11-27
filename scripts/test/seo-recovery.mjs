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
  'lib/indexing-tiers': 'src/lib/indexing-tiers.ts',
  'lib/city-pages': 'src/lib/city-pages.ts',
  'lib/hindi': 'src/lib/hindi.ts',
  'content/hi': 'src/content/hi/index.ts',
  'lib/route-variants': 'src/lib/route-variants.ts',
  'lib/variant-pages': 'src/lib/variant-pages.ts',
  'content/guides': 'src/content/guides/index.ts',
  'content/chardham': 'src/content/chardham/index.ts',
  'content/rajasthan': 'src/content/rajasthan/index.ts',
};
const modules = await sourceModules(files, {
  'lib/api': `
    export const fromSlug = s => s.toUpperCase().replace(/-/g, '_');
    const routes = [['JAIPUR','DELHI'],['JAIPUR','AGRA'],['JAIPUR','KOTA'],['DELHI','AGRA'],['DELHI','NOIDA'],['AGRA','SIKAR']].map(([pickup,drop]) => ({pickup,drop,fixed:true,fromRupees:100}));
    const vehicles = [{key:'dzire',label:'Dzire'},{key:'crysta',label:'Innova Crysta'}];
    const fare = {vehicles:vehicles.map(v => ({...v,price:100,fare:100,total:100}))};
    const catalog = () => globalThis.__hmcSeoFailCatalog ? Promise.reject(new Error('Catalog unavailable')) : Promise.resolve({routes:routes.filter(r => !(r.pickup==='DELHI' && r.drop==='NOIDA'))});
    export const api = {
      listedRoutes: catalog,
      routes: catalog,
      routeInsights: async (a, b) => globalThis.__hmcInsights?.[a + '>' + b] ?? null,
      cityInsights: async () => null,
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
  // Above the 10-rating floor (MIN_REVIEWS, 20 Nov 2026).
  const catalog = () => ({
    routes: [{ pickup: 'JAIPUR', drop: 'DELHI', ...summary(12) }],
    cities: [{ city: 'JAIPUR', ...summary(12) }],
    site: summary(20),
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
        // (Route pages with our own trip figures are dated too — see 'sitemap-insights-date'.)
        assert.ok(page.url.startsWith('https://www.hellomycabs.com'));
        assert.ok(!page.url.includes('DELHI') && !page.url.includes('/booking'));
      }
      assert.ok(!pages.some((p) => p.url.endsWith('/delhi-to-noida-cab')));
      assert.ok(!pages.some((p) => /char-dham-yatra|rajasthan-tours/.test(p.url)));
      assert.ok(pages.some((p) => p.url.endsWith('/jaipur-to-delhi-round-trip-cab')));
    },
  );
  await test(
    'sitemap-insights-date',
    'a route page showing our trip figures carries their date as lastmod; one without carries none (20 Nov 2026)',
    async () => {
      globalThis.__hmcInsights = {
        'JAIPUR>DELHI': { demand: 179, asOf: '2026-11-20T10:00:00.000Z' },
        'JAIPUR>AGRA': { demand: null, asOf: '2026-11-20T10:00:00.000Z' },
      };
      try {
        const pages = await sitemap();
        const jd = pages.find((p) => p.url.endsWith('/jaipur-to-delhi-cab'));
        assert.equal(new Date(jd.lastModified).toISOString(), '2026-11-20T10:00:00.000Z');
        assert.equal(pages.find((p) => p.url.endsWith('/jaipur-to-agra-cab')).lastModified, undefined);
      } finally {
        delete globalThis.__hmcInsights;
      }
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
    'route/site count contradictions hide the visible rating too, not only the markup (20 Nov 2026)',
    async () => {
      const all = catalog();
      all.site = summary(10);
      globalThis.__hmcSeoReviewCatalog = all;
      assert.equal(await routeReviews('JAIPUR', 'DELHI'), null);
      assert.equal(await cityReviews('JAIPUR'), null);
      assert.equal(await siteReviews(), null);
      globalThis.__hmcSeoReviewCatalog = catalog();
      const ok = await routeReviews('JAIPUR', 'DELHI');
      assert.equal(ok.count, 12);
      assert.equal(ok.eligibleForSchema, true);
    },
  );
  await test(
    'review-sum',
    'sum of route counts cannot exceed the whole site, even when each fits separately',
    () => {
      const all = catalog();
      all.routes.push({ pickup: 'DELHI', drop: 'JAIPUR', ...summary(12) });
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
      assert.equal(worthShowing({ ...summary(12), isSyntheticTestData: true }), null);
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
        { tags: [{ count: 20 }] },
      ]) {
        assert.equal(worthShowing({ ...summary(12), ...bad }), null);
      }
      assert.equal(worthShowing(summary(9)), null);
      assert.equal(worthShowing(summary(12)).count, 12);
    },
  );
  await test(
    'review-malformed',
    'malformed review data fails closed without taking down a fare page',
    () => {
      assert.equal(worthShowing({ ...summary(12), tags: {} }), null);
      const all = catalog();
      all.routes = [null];
      assert.equal(routeRatingEligible(all, 'JAIPUR', 'DELHI'), false);
    },
  );
  await test(
    'review-legacy',
    'legacy feedback without dimension counts retains its overall rating without inventing bars',
    () => {
      const legacy = worthShowing({ count: 12, average: 4.5, driverAverage: 4.8, cabAverage: 4.7 });
      assert.equal(legacy.count, 12);
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
      assert.equal(schema(summary(12))[1].aggregateRating, undefined);
      assert.equal(
        schema({ ...summary(12), eligibleForSchema: true, isSyntheticTestData: true })[1]
          .aggregateRating,
        undefined,
      );
      assert.equal(
        schema({ ...summary(12), eligibleForSchema: true })[1].aggregateRating.ratingCount,
        12,
      );
    },
  );
  await test(
    'schema-city',
    'self-serving city TaxiService review markup is absent without removing visible reviews',
    () => {
      assert.equal(
        taxiServiceSchema({ city: 'Jaipur', path: '/cab-service-in-jaipur', rating: summary(12) })
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
        'lib/indexing-tiers': 'src/lib/indexing-tiers.ts',
      });
      try {
        const { api } = await real.load('lib/api');
        // api.routes() reads the catalogue and (since 21 Nov 2026) the insights for measured
        // km: each once, never retried.
        const calls = new Map();
        globalThis.fetch = async (url, init) => {
          const path = new URL(String(url)).pathname.replace(/^.*\/public/, '');
          calls.set(path, (calls.get(path) ?? 0) + 1);
          assert.equal(init.next.revalidate, 86400);
          assert.deepEqual(init.next.tags, ['hmc-public-api']);
          return new Response(JSON.stringify({ ok: true, data: { routes: [] } }), { status: 503 });
        };
        await assert.rejects(api.routes(), /failed/);
        assert.equal(calls.get('/routes'), 1);
        assert.ok((calls.get('/route-insights/all') ?? 0) <= 1);
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
        { 'lib/tier1': 'src/lib/tier1.ts', 'lib/slug': 'src/lib/slug.ts', 'lib/indexing-tiers': 'src/lib/indexing-tiers.ts', 'lib/city-pages': 'src/lib/city-pages.ts' },
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
  await test(
    'indexing-tiers',
    'focus set (27 Nov 2026 waves): every held route is noindex and out of every sitemap; Tier 1 never is; held routes unchanged',
    async () => {
      const tiers = await modules.load('lib/indexing-tiers');
      const held = await modules.load('lib/held-routes');
      const k = ([a, b]) => `${a}>${b}`;
      const t1 = tiers.TIER1_ROUTES.map(k);
      const t3 = tiers.TIER3_ROUTES.map(k);
      assert.equal(new Set(t1).size, t1.length, 'no duplicate Tier 1 route');
      assert.equal(new Set(t3).size, t3.length, 'no duplicate Tier 3 route');
      // 27 Nov 2026: Tier 3 = WAVE2 (29) + WAVE3 (22) + NO_DEMAND (14).
      assert.equal(t3.length, tiers.WAVE2_ROUTES.length + tiers.WAVE3_ROUTES.length + tiers.NO_DEMAND_ROUTES.length);
      assert.equal(t3.length, 69); // 65 on 27 Nov + 4 new catalogue routes (keyword files, Step 5)
      assert.ok(t1.every((r) => !t3.includes(r)), 'a route is in one tier only');
      for (const [a, b] of tiers.TIER3_ROUTES) {
        assert.equal(held.isThinRoute(a, b), true, `${a}>${b} noindex`);
        assert.equal(tiers.routeTier(a, b), 3);
      }
      for (const [a, b] of tiers.TIER1_ROUTES) {
        assert.equal(held.isThinRoute(a, b), false, `${a}>${b} indexable`);
        assert.equal(held.isHeldRoute(a, b), false);
        assert.equal(tiers.routeTier(a, b), 1);
      }
      assert.equal(tiers.routeTier('JAIPUR', 'CHANDIGARH'), 3);
      assert.equal(tiers.waveOf('JAIPUR', 'CHANDIGARH'), 3);
      for (const pair of [['DELHI', 'DELHI_AIRPORT'], ['DELHI_AIRPORT', 'DELHI'], ['DELHI', 'NOIDA'], ['NOIDA', 'DELHI'], ['NOIDA', 'DELHI_AIRPORT'], ['DELHI_AIRPORT', 'NOIDA']])
        assert.equal(held.isHeldRoute(...pair), true, 'the six held routes are unchanged');
      // 27 Nov 2026 (owner P5 default): the routes Google had crawled wait for Wave 2 too.
      for (const pair of [['JAIPUR', 'UDAIPUR'], ['DELHI', 'DEHRADUN'], ['NOIDA', 'JAIPUR']]) {
        assert.equal(held.isThinRoute(...pair), true);
        assert.equal(tiers.waveOf(...pair), 2);
      }
      // Nothing outside Wave 1 is indexable until a wave is released — fare-held included.
      for (const [a, b] of tiers.FARE_HOLD) assert.equal(tiers.isIndexableRoute(a, b), false, `${a}>${b} fare-held`);
      for (const [a, b] of tiers.TWIN_ROUTES) assert.equal(tiers.isIndexableRoute(a, b, [2, 3]), false, `${a}>${b} twin`);
      for (const [a, b] of tiers.NO_DEMAND_ROUTES) assert.equal(tiers.isIndexableRoute(a, b, [2, 3]), false, `${a}>${b} no demand`);
      assert.equal(tiers.isIndexableRoute('JAIPUR', 'UDAIPUR', [2]), true, 'a released wave opens');
      const urls = (await sitemap()).map((p) => p.url);
      assert.ok(!urls.some((u) => u.endsWith('/agra-to-sikar-cab')), 'Tier 3 is not in the sitemap');
      assert.ok(urls.some((u) => u.endsWith('/jaipur-to-delhi-cab')), 'Tier 1 is');
      const groups = await modules.load('app/sitemaps');
      for (const g of ['core', 'cities', 'routes', 'vehicles', 'guides']) {
        const list = await groups.default({ id: Promise.resolve(g) });
        assert.ok(!list.some((p) => p.url.endsWith('/agra-to-sikar-cab')), `not in the ${g} sitemap`);
      }
    },
  );
  await test(
    'quality-gate',
    'the Tier 1 content gate fails a regression and passes the committed baseline (20 Nov 2026)',
    async () => {
      const { spawnSync } = await import('node:child_process');
      const { mkdtempSync, writeFileSync, readFileSync, rmSync } = await import('node:fs');
      const { tmpdir } = await import('node:os');
      const { join } = await import('node:path');
      const base = JSON.parse(readFileSync('docs/seo/quality-baseline.json', 'utf8'));
      const dir = mkdtempSync(join(tmpdir(), 'hmc-gate-'));
      const crawl = (bump) => ({
        date: 'test',
        pages: Object.entries(base.pages).map(([path, b], i) => ({
          path,
          code: 200,
          words: b.words,
          maxSimilarity: i === 0 ? b.maxSimilarity + bump : b.maxSimilarity,
          mostSimilarTo: '/x',
        })),
      });
      const run = (data) => {
        const f = join(dir, `c${Math.random()}.json`);
        writeFileSync(f, JSON.stringify(data));
        return spawnSync(process.execPath, ['scripts/seo/quality-gate.mjs', f], { encoding: 'utf8' }).status;
      };
      try {
        assert.equal(run(crawl(0)), 0);
        assert.equal(run(crawl(0.05)), 1, 'similarity rose');
        const short = crawl(0);
        short.pages[1].words = Math.floor(short.pages[1].words * 0.5);
        assert.equal(run(short), 1, 'words dropped');
        const missing = crawl(0);
        missing.pages.pop();
        assert.equal(run(missing), 1, 'a Tier 1 page vanished');
      } finally {
        rmSync(dir, { recursive: true, force: true });
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
