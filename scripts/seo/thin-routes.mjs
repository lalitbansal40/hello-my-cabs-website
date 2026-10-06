/**
 * Which route pages to keep out of the index — a list for the owner, nothing changed.
 *
 *   node scripts/seo/thin-routes.mjs <folder>                 # against the live site
 *   SITE_URL=http://localhost:3100 node scripts/seo/thin-routes.mjs <folder>
 *
 * <folder> is a Search Console "Performance → Export" (last 28 days), unzipped: Pages.csv.
 *
 * A candidate (PLAN_seo_v3 Step 2, 7 Oct 2026) is a one-way route page that
 *   - had NO impressions in those 28 days, and
 *   - is still 80% or more like another route page (word-bigram Dice over the main text —
 *     the same measure as seo:check 3; header, footer and booking form left out).
 * Both, not either: a page people see stays indexed however similar it is, and a page with
 * content of its own stays indexed however quiet it is.
 *
 * Prints ready-to-paste lines for NOINDEX_THIN in src/lib/held-routes.ts. Add them only with
 * the owner's yes. Writes /tmp/hmc-thin-routes.md as well.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/seo/thin-routes.mjs <folder with Pages.csv>');
  process.exit(2);
}
const SITE = (process.env.SITE_URL ?? 'https://www.hellomycabs.com').replace(/\/+$/, '');
const SIMILAR = 0.8;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some((f) => f !== '')) rows.push(row);
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ''])));
}
const num = (s) => Number(String(s ?? '').replace(/[,%]/g, '')) || 0;

const file = readdirSync(dir).find((f) => f.toLowerCase() === 'pages.csv');
if (!file) throw new Error(`Pages.csv not found in ${dir}`);
const impressions = new Map(
  parseCsv(readFileSync(join(dir, file), 'utf8').replace(/^﻿/, '')).map((r) => {
    const url = r['Top pages'] ?? r.Page ?? Object.values(r)[0];
    return [url.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/', num(r.Impressions)];
  }),
);

const get = async (path) => (await fetch(`${SITE}${path}`)).text();
const visible = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>|<form[\s\S]*?<\/form>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
function bigrams(text) {
  const w = text.split(' ').filter(Boolean);
  const m = new Map();
  for (let i = 0; i < w.length - 1; i++) m.set(`${w[i]} ${w[i + 1]}`, (m.get(`${w[i]} ${w[i + 1]}`) ?? 0) + 1);
  return m;
}
function dice(a, b) {
  let shared = 0;
  let total = 0;
  for (const [, n] of a) total += n;
  for (const [, n] of b) total += n;
  for (const [k, n] of a) shared += Math.min(n, b.get(k) ?? 0);
  return total ? (2 * shared) / total : 0;
}

const sitemap = await get('/sitemap.xml');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
  .filter((p) => /^\/[a-z-]+-to-[a-z-]+-cab$/.test(p) && !p.endsWith('-round-trip-cab'));

const grams = new Map();
for (const p of routes) grams.set(p, bigrams(visible(await get(p))));

const rows = [];
for (const p of routes) {
  if ((impressions.get(p) ?? 0) > 0) continue;
  let best = { r: 0, other: '' };
  for (const q of routes) {
    if (q === p) continue;
    const r = dice(grams.get(p), grams.get(q));
    if (r > best.r) best = { r, other: q };
  }
  if (best.r >= SIMILAR) rows.push({ p, ...best });
}

const key = (p) => {
  const [, a, b] = p.match(/^\/([a-z-]+)-to-([a-z-]+)-cab$/);
  return [a.toUpperCase().replace(/-/g, '_'), b.toUpperCase().replace(/-/g, '_')];
};
const lines = rows
  .sort((x, y) => y.r - x.r)
  .map(({ p, r, other }) => {
    const [a, b] = key(p);
    return `  ['${a}', '${b}'], // 0 impressions, ${(r * 100).toFixed(0)}% like ${other}`;
  });

const out = [
  `# Thin routes — ${new Date().toISOString().slice(0, 10)}`,
  '',
  `${routes.length} route pages; ${rows.length} with no impressions in the export and ≥ ${SIMILAR * 100}% like another.`,
  '',
  'For NOINDEX_THIN in src/lib/held-routes.ts (only with the owner’s yes):',
  '',
  '```ts',
  ...lines,
  '```',
].join('\n');
console.log(out);
writeFileSync('/tmp/hmc-thin-routes.md', out);
