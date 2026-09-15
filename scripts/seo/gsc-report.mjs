/**
 * Search Console, read against our own page list — the weekly look at what Google does with
 * the site.
 *
 *   node scripts/seo/gsc-report.mjs <folder>
 *
 * <folder> is a Search Console "Performance → Export → Download CSV" unzipped: it holds
 * Pages.csv and Queries.csv (other files in it are ignored). Best with the last 28 days.
 *
 * Writes /tmp/hmc-gsc.md:
 *   1. Totals — clicks, impressions, CTR, how many of our pages Google showed at all
 *   2. The keywords we track (the plan's 30), with their position — or "not shown"
 *   3. Pages Google shows but nobody clicks (100+ impressions, CTR under 2%): title work
 *   4. Route pages by tier, with impressions and position; the ones Google has not shown
 *   5. Pages Google shows that are not in our sitemap (old URLs, parameters) — to check
 *
 * Our page list comes from the live sitemap (SITE_URL, default the production site).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/seo/gsc-report.mjs <folder with Pages.csv and Queries.csv>');
  process.exit(2);
}
const SITE = (process.env.SITE_URL ?? 'https://www.hellomycabs.com').replace(/\/+$/, '');

/** The keywords the plan tracks (PLAN_seo_top_rank.md, Appendix B). */
export const TRACKED = [
  'hello my cab',
  'hellomycabs',
  'hello my cab jaipur',
  'jaipur to delhi taxi',
  'jaipur to delhi cab',
  'delhi to jaipur taxi',
  'delhi to jaipur cab',
  'jaipur to delhi one way taxi',
  'jaipur to delhi airport taxi',
  'jaipur to agra taxi',
  'jaipur to ajmer taxi',
  'jaipur to chandigarh taxi',
  'jaipur to haridwar taxi',
  'jaipur to kota taxi',
  'jaipur to sikar taxi',
  'jaipur to jodhpur taxi',
  'jaipur to udaipur taxi',
  'delhi to agra cab',
  'delhi to haridwar taxi',
  'delhi to chandigarh taxi',
  'kota to jaipur taxi',
  'ajmer to jaipur taxi',
  'noida to jaipur cab',
  'taxi service in jaipur',
  'cab service in jaipur',
  'outstation cab jaipur',
  'one way taxi jaipur',
  'jaipur airport taxi',
  'tempo traveller on rent jaipur',
  'innova crysta on rent jaipur',
];

/** A small CSV reader: quoted fields, commas inside quotes, a header row. */
export function parseCsv(text) {
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

/** Search Console exports numbers as "1,234" and CTR as "3.2%". */
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
  query: (r['Top queries'] ?? r.Query ?? Object.values(r)[0]).toLowerCase().trim(),
  clicks: num(r.Clicks),
  impressions: num(r.Impressions),
  ctr: num(r.CTR),
  position: num(r.Position),
}));

const ours = await fetch(`${SITE}/sitemap.xml`)
  .then((r) => r.text())
  .then((x) => [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '') || '/'))
  .catch(() => []);

const TIER_A = new Set(['/jaipur-to-delhi-cab', '/delhi-to-jaipur-cab']);
const B_PAIRS = [
  ['delhi', 'agra'],
  ['delhi', 'chandigarh'],
  ['delhi', 'haridwar'],
  ['delhi', 'noida'],
  ['jaipur', 'agra'],
  ['jaipur', 'chandigarh'],
  ['jaipur', 'ajmer'],
  ['jaipur', 'delhi-airport'],
  ['jaipur', 'jodhpur'],
];
const TIER_B = new Set(B_PAIRS.flatMap(([a, b]) => [`/${a}-to-${b}-cab`, `/${b}-to-${a}-cab`]));
const tier = (p) => (TIER_A.has(p) ? 'A' : TIER_B.has(p) ? 'B' : 'C');

const sum = (xs, k) => xs.reduce((n, x) => n + x[k], 0);
const clicks = sum(pages, 'clicks');
const impressions = sum(pages, 'impressions');
const byPath = new Map(pages.map((p) => [p.path, p]));
const shownOurs = ours.filter((p) => byPath.get(p)?.impressions > 0);
const pos = (n) => (n ? n.toFixed(1) : '—');

const out = [];
out.push(`# Search Console — ${new Date().toISOString().slice(0, 10)} (${dir})`, '');
out.push('## 1. Totals', '');
out.push(
  `- Clicks **${clicks}** · impressions **${impressions}** · CTR **${impressions ? ((clicks / impressions) * 100).toFixed(2) : 0}%**`,
);
out.push(`- Our pages Google showed at least once: **${shownOurs.length} / ${ours.length}**`, '');

out.push(
  '## 2. Tracked keywords',
  '',
  '| keyword | position | impressions | clicks |',
  '|---|---|---|---|',
);
for (const k of TRACKED) {
  const q = queries.find((x) => x.query === k);
  out.push(
    q
      ? `| ${k} | ${pos(q.position)} | ${q.impressions} | ${q.clicks} |`
      : `| ${k} | not shown | 0 | 0 |`,
  );
}
out.push('');

out.push('## 3. Shown but not clicked (100+ impressions, CTR < 2%) — title/description work', '');
const weak = pages
  .filter((p) => p.impressions >= 100 && p.ctr < 2)
  .sort((a, b) => b.impressions - a.impressions);
out.push(
  ...(weak.length
    ? [
        '| page | impressions | CTR | position |',
        '|---|---|---|---|',
        ...weak.map((p) => `| ${p.path} | ${p.impressions} | ${p.ctr}% | ${pos(p.position)} |`),
      ]
    : ['None yet.']),
);
out.push('');

out.push(
  '## 4. Route pages by tier',
  '',
  '| page | tier | impressions | clicks | position |',
  '|---|---|---|---|---|',
);
const routes = ours.filter((p) => p.endsWith('-cab'));
for (const p of routes.sort(
  (a, b) =>
    tier(a).localeCompare(tier(b)) ||
    (byPath.get(b)?.impressions ?? 0) - (byPath.get(a)?.impressions ?? 0),
)) {
  const g = byPath.get(p);
  out.push(
    `| ${p} | ${tier(p)} | ${g?.impressions ?? 0} | ${g?.clicks ?? 0} | ${pos(g?.position)} |`,
  );
}
const unseen = routes.filter((p) => !byPath.get(p)?.impressions);
out.push('', `Not shown at all: **${unseen.length}** route page(s).`, '');

out.push('## 5. Shown by Google but not in our sitemap', '');
const stray = pages.filter((p) => ours.length && !ours.includes(p.path));
out.push(
  ...(stray.length ? stray.map((p) => `- ${p.path} (${p.impressions} impressions)`) : ['None.']),
);
out.push('');

writeFileSync('/tmp/hmc-gsc.md', out.join('\n'));
console.log(out.slice(0, 8).join('\n'));
console.log(`… written to /tmp/hmc-gsc.md`);
