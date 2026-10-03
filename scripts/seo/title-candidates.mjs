/**
 * Which route pages Google shows but nobody clicks — and what their titles are missing.
 *
 *   node scripts/seo/title-candidates.mjs <folder>            # min 100 impressions
 *   node scripts/seo/title-candidates.mjs <folder> --min=50
 *
 * <folder> is a Search Console "Performance → Export → Download CSV" (last 28 days), unzipped:
 * Pages.csv and Queries.csv. The export does not join pages to queries, so a route's queries
 * are matched by its two city names — and the site's own record of what is searched for each
 * route (src/content/queries.json) is listed beside them.
 *
 * A candidate: a route page with ≥ --min impressions, average position 1–20, CTR under 2%.
 * Those are the pages where a better title is the cheapest gain there is — Google already
 * shows them; people choose another result.
 *
 * For each: the live title (SITE_URL, default the production site), the queries, the words
 * people type that the title does not carry, and a ready-to-edit entry for
 * src/content/routes/titles.ts. The script suggests; a person writes the title — every figure
 * in it must be one the page shows.
 *
 * Writes /tmp/hmc-title-candidates.md.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/seo/title-candidates.mjs <folder with Pages.csv and Queries.csv> [--min=100]');
  process.exit(2);
}
const MIN = Number(process.argv.find((a) => a.startsWith('--min='))?.slice(6) ?? 100);
const SITE = (process.env.SITE_URL ?? 'https://www.hellomycabs.com').replace(/\/+$/, '');
const MAX_CTR = 2; // per cent
const MAX_POS = 20;

/** A small CSV reader: quoted fields, commas inside quotes, a header row. */
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
function load(name) {
  const file = readdirSync(dir).find((f) => f.toLowerCase() === name.toLowerCase());
  if (!file) throw new Error(`${name} not found in ${dir}`);
  return parseCsv(readFileSync(join(dir, file), 'utf8').replace(/^﻿/, ''));
}

const pages = load('Pages.csv').map((r) => {
  const url = r['Top pages'] ?? r.Page ?? Object.values(r)[0];
  return {
    path: url.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/',
    clicks: num(r.Clicks),
    impressions: num(r.Impressions),
    ctr: num(r.CTR),
    position: num(r.Position),
  };
});
const queries = load('Queries.csv').map((r) => ({
  query: (r['Top queries'] ?? r.Query ?? Object.values(r)[0]).toLowerCase(),
  clicks: num(r.Clicks),
  impressions: num(r.Impressions),
}));
const recorded = JSON.parse(
  readFileSync(new URL('../../src/content/queries.json', import.meta.url), 'utf8'),
);

/** '/jaipur-to-delhi-cab' → { a: 'jaipur', b: 'delhi', key: 'JAIPUR-DELHI' } */
function routeOf(path) {
  if (path.endsWith('-round-trip-cab')) return null;
  const m = path.match(/^\/([a-z-]+)-to-([a-z-]+)-cab$/);
  if (!m) return null;
  const key = `${m[1].toUpperCase().replace(/-/g, '_')}-${m[2].toUpperCase().replace(/-/g, '_')}`;
  return { a: m[1].replace(/-/g, ' '), b: m[2].replace(/-/g, ' '), key };
}

/** The words a title for a route is judged on — what people add to the two city names. */
const WORDS = ['one way', 'taxi', 'cab', 'fare', 'price', 'innova', 'crysta', 'tempo', 'ertiga', 'round trip', 'airport', 'km', 'distance', 'booking', 'service'];

async function liveTitle(path) {
  try {
    const html = await fetch(SITE + path, { signal: AbortSignal.timeout(20_000) }).then((r) => r.text());
    return (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').replace(/&amp;/g, '&');
  } catch {
    return '(could not fetch)';
  }
}

const candidates = pages
  .filter((p) => routeOf(p.path))
  .filter((p) => p.impressions >= MIN && p.position > 0 && p.position <= MAX_POS && p.ctr < MAX_CTR)
  .sort((x, y) => y.impressions - x.impressions);

const out = [
  `# Title candidates — ${new Date().toISOString().slice(0, 10)}`,
  '',
  `Route pages with ≥ ${MIN} impressions, position ≤ ${MAX_POS}, CTR < ${MAX_CTR}%. ${candidates.length} found.`,
  '',
];
for (const p of candidates) {
  const r = routeOf(p.path);
  const title = await liveTitle(p.path);
  const fromGsc = queries
    .filter((q) => q.query.includes(r.a) && q.query.includes(r.b))
    .sort((x, y) => y.impressions - x.impressions)
    .slice(0, 12);
  const fromRecord = (recorded[r.key] ?? []).slice(0, 12);
  const all = [...fromGsc.map((q) => q.query), ...fromRecord];
  const missing = WORDS.filter((w) => all.some((q) => q.includes(w)) && !title.toLowerCase().includes(w));
  out.push(
    `## ${p.path}`,
    '',
    `${p.impressions} impressions · ${p.clicks} clicks · CTR ${p.ctr}% · position ${p.position}`,
    '',
    `**Title now:** ${title} (${title.length} chars)`,
    '',
    `**Searched (Search Console):** ${fromGsc.map((q) => `${q.query} (${q.impressions})`).join(', ') || '—'}`,
    '',
    `**Searched (recorded):** ${fromRecord.join(', ') || '—'}`,
    '',
    `**Typed but not in the title:** ${missing.join(', ') || '—'}`,
    '',
    '```ts',
    `  '${r.key}': {`,
    `    title: '', // 30–60 chars; {price} = the page's lowest one-way fare`,
    `    note: '${new Date().toISOString().slice(0, 10)}: ${p.impressions} impr, CTR ${p.ctr}%, pos ${p.position}; missing ${missing.join('/') || '—'}',`,
    '  },',
    '```',
    '',
  );
}
writeFileSync('/tmp/hmc-title-candidates.md', out.join('\n'));
console.log(out.join('\n'));
console.log('\n→ /tmp/hmc-title-candidates.md');
