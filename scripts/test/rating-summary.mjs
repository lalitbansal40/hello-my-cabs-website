/**
 * node scripts/test/rating-summary.mjs — the rating block and its markup, with test numbers.
 *
 * The site has no test runner, and the numbers here must never reach a page: they live in this
 * file only. It transpiles the few modules involved (TypeScript's own transpiler, no new
 * dependency) into a temp folder, renders RatingSummary to HTML and builds the route schema,
 * and checks what a visitor and a crawler would get. Not part of `next build`.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

// lib/env.ts insists on these; nothing here calls them.
process.env.NEXT_PUBLIC_API_BASE_URL ||= 'http://localhost:4000/api/v1';
process.env.NEXT_PUBLIC_SITE_URL ||= 'https://www.hellomycabs.com';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(join(root, 'package.json'));
const ts = require('typescript');
const out = mkdtempSync(join(tmpdir(), 'hmc-rating-'));

// Every module the block and the schema need, and nothing that calls the API.
const files = {
  'lib/review-rules': 'src/lib/review-rules.ts',
  'lib/env': 'src/lib/env.ts',
  'lib/company': 'src/lib/company.ts',
  'lib/schema': 'src/lib/schema.tsx',
  'components/site/Icons': 'src/components/site/Icons.tsx',
  'components/landing/RatingSummary': 'src/components/landing/RatingSummary.tsx',
};
for (const [name, src] of Object.entries(files)) {
  let code = ts.transpileModule(readFileSync(join(root, src), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const here = dirname(name);
  code = code.replace(/from ['"](@\/|\.\/)([^'"]+)['"]/g, (_, kind, p) => {
    const target = kind === '@/' ? p : join(here, p);
    const rel = join(out, target) + '.mjs';
    return `from ${JSON.stringify(pathToFileURL(rel).href)}`;
  });
  // react/jsx-runtime and react-dom resolve from the site's own node_modules.
  code = code.replace(/from ['"](react[^'"]*)['"]/g, (_, m) => `from ${JSON.stringify(pathToFileURL(require.resolve(m)).href)}`);
  mkdirSync(join(out, dirname(name)), { recursive: true });
  writeFileSync(join(out, name) + '.mjs', code);
}

const { RatingSummary, travellers, ratingWord, part, share, starFill } = await import(pathToFileURL(join(out, 'components/landing/RatingSummary.mjs')).href);
const { serviceSchema } = await import(pathToFileURL(join(out, 'lib/schema.mjs')).href);
const { renderToStaticMarkup } = await import(pathToFileURL(require.resolve('react-dom/server')).href);
const { createElement: h } = await import(pathToFileURL(require.resolve('react')).href);

// TEST NUMBERS — this file only.
const fixture = {
  count: 9293,
  average: 4.9,
  driverCount: 9000,
  driverAverage: 4.8,
  cabCount: 9100,
  cabAverage: 4.9,
  tags: [
    { key: 'safe_driving', label: 'Safe Driving', count: 5400 },
    { key: 'polite', label: 'Polite Behaviour', count: 4200 },
    { key: 'on_time', label: 'On Time', count: 3900 },
    { key: 'clean', label: 'Clean Interiors', count: 2500 },
    { key: 'navigation', label: 'Good Navigation Skills', count: 1800 },
    { key: 'well_dressed', label: 'Well Dressed', count: 2 },
  ],
};
const render = (reviews) =>
  renderToStaticMarkup(h(RatingSummary, { title: 'What travellers say about Jaipur to Delhi cabs', reviews, ratedBy: 'who booked a Jaipur to Delhi cab' }));

let ok = 0;
const t = (name, fn) => { fn(); ok++; console.log(`  ✓ ${name}`); };

t('the block: score, word, bars, rated-by, chips', () => {
  const html = render(fixture);
  assert.match(html, />4\.9</);
  assert.match(html, /Excellent/);
  assert.match(html, /Driver rating[\s\S]*4\.8/);
  assert.match(html, /Cab rating[\s\S]*4\.9/);
  assert.match(html, /9,000\+ travellers/);
  assert.match(html, /who booked a Jaipur to Delhi cab/);
  for (const c of ['Safe Driving', 'Polite Behaviour', 'On Time', 'Clean Interiors', 'Good Navigation Skills']) assert.ok(html.includes(c), c);
  assert.ok(!html.includes('Well Dressed'), 'a tag ticked twice is not shown');
});
t('the score on top: five stars filled to the average, a segment bar per star', () => {
  const html = render(fixture);
  assert.ok(html.indexOf('>4.9<') < html.indexOf('Driver rating'), 'score before the bars');
  assert.match(html, /aria-label="4\.9 out of 5 stars"/);
  assert.equal(part(4.8, 0), 1);
  assert.equal(part(4.8, 3), 1);
  assert.ok(Math.abs(part(4.8, 4) - 0.8) < 1e-9);
  assert.equal(part(3.2, 4), 0);
  // Gold across the star's own width, not its box: none, full, and the fifth of 4.9.
  assert.equal(starFill(0), 0);
  assert.equal(starFill(1), 85.4);
  assert.equal(starFill(0.9), 78.3);
  assert.match(html, /width:78\.3%/);
});
t('each tag with the share of raters who ticked it', () => {
  const html = render(fixture);
  assert.match(html, /Safe Driving[\s\S]*?58%/); // 5400 of 9293
  assert.match(html, /Good Navigation Skills[\s\S]*?19%/);
  assert.equal(share(5400, 9293), 58);
  assert.equal(share(10, 0), 0);
  assert.equal(share(120, 100), 100, 'never over 100');
});
t('nothing about any reviewer', () => {
  const html = render(fixture);
  assert.ok(!/blockquote|<img/.test(html));
});
t('nothing to show → nothing rendered (the loader passes null below MIN_REVIEWS)', () => {
  assert.equal(render(null), '');
  assert.equal(render({ ...fixture, average: null }), '');
});
t('a bar needs its own five ratings', () => {
  const html = render({ ...fixture, driverCount: 4 });
  assert.ok(!html.includes('Driver rating'));
  assert.ok(html.includes('Cab rating'));
});
t('no chips → no chips column', () => {
  assert.ok(!render({ ...fixture, tags: [] }).includes('What travellers say most'));
});
t('rated-by rounds down, never up', () => {
  assert.equal(travellers(1), '1 traveller');
  assert.equal(travellers(37), '37 travellers');
  assert.equal(travellers(600), '600 travellers');
  assert.equal(travellers(640), '600+ travellers');
  assert.equal(travellers(2340), '2,000+ travellers');
  assert.equal(travellers(9293), '9,000+ travellers');
});
t('the word under the score', () => {
  assert.equal(ratingWord(4.9), 'Excellent');
  assert.equal(ratingWord(4.3), 'Very Good');
  assert.equal(ratingWord(3.6), 'Good');
  assert.equal(ratingWord(3.2), 'Average');
});
t('schema: Service + Product, price range, rating only on the Product', () => {
  const offers = [{ name: 'Dzire — one way', price: 3200 }, { name: 'Innova — one way', price: 5400 }];
  const base = { name: 'Jaipur to Delhi taxi', description: 'x', path: '/jaipur-to-delhi-cab', serviceType: 'Outstation taxi service', areaServed: ['Jaipur', 'Delhi'], offers, image: '/jaipur-to-delhi-cab/map.svg', photo: '/jaipur-to-delhi-cab/opengraph-image/card' };
  const [service, product] = serviceSchema({ ...base, rating: fixture });
  assert.equal(service['@type'], 'Service');
  assert.equal(service.aggregateRating, undefined);
  assert.equal(product['@type'], 'Product');
  assert.deepEqual(product.offers && { lowPrice: product.offers.lowPrice, highPrice: product.offers.highPrice, offerCount: product.offers.offerCount, priceCurrency: product.offers.priceCurrency }, { lowPrice: 3200, highPrice: 5400, offerCount: 2, priceCurrency: 'INR' });
  assert.deepEqual(product.aggregateRating, { '@type': 'AggregateRating', ratingValue: 4.9, ratingCount: 9293, bestRating: 5, worstRating: 1 });
  assert.match(product.image[0], /opengraph-image\/card$/);
  assert.match(product.image[1], /map\.svg$/);
  const [, noRating] = serviceSchema({ ...base, rating: null });
  assert.equal(noRating.aggregateRating, undefined);
  assert.equal(Array.isArray(serviceSchema({ ...base, offers: [] })), false, 'no price → no Product');
});

rmSync(out, { recursive: true, force: true });
console.log(`${ok} passed`);
