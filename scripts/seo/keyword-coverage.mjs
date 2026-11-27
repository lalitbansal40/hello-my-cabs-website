#!/usr/bin/env node
/**
 * How well each Wave 1 page carries the words of the owner's keyword file (27 Nov 2026,
 * docs/seo/PROMPT_KEYWORD_FILES_27NOV.md Steps 0, 3.7, 9).
 *
 *   node scripts/seo/keyword-coverage.mjs <base-url> [--label name]
 *
 * For every Wave 1 URL: the owner-file keywords whose target is that URL (via the keyword map,
 * scripts/seo/keyword-files-map.mjs — or the file's own Suggested_Target_URL before the map
 * exists), how many have all their significant words on the page (title + meta description +
 * the page's own text — see pageText), and the words that are missing, most frequent first. Writes
 * docs/seo/evidence/keyword-coverage-<label>.json.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseCsv } from './gsc-weekly.mjs';
import { wave1Paths } from './lib/tiers.mjs';
import { mainText } from './page-quality.mjs';

export const MASTER = 'docs/seo/evidence/keyword-files-2026-11-27/hellomycabs_keyword_master_v2_rebuilt.csv';

/** Words that say nothing about what a page must contain. */
export const STOP = new Set(
  'to in the a for of and with from near me my on at by service services taxi cab cabs booking book hire rent car one way price fare cost rates rate charges online best cheap cheapest number contact 24 hour x 7 24x7 is'.split(' '),
);

export const significant = (keyword) => keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));

/** { path → [keyword…] } for the Wave 1 paths. */
export function keywordsByPage(rows, wave1 = new Set(wave1Paths())) {
  const by = new Map();
  for (const r of rows) {
    const target = r.our_url !== undefined ? r.our_url : (() => {
      try {
        return new URL(r.Suggested_Target_URL).pathname.replace(/\/$/, '') || '/';
      } catch {
        return '';
      }
    })();
    if (!wave1.has(target)) continue;
    if (!by.has(target)) by.set(target, []);
    by.get(target).push((r.Keyword ?? r.keyword).toLowerCase());
  }
  return by;
}

/** Coverage of one page's text for its keywords. */
export function cover(text, keywords) {
  const t = text.toLowerCase();
  const missing = new Map();
  let full = 0;
  for (const k of keywords) {
    const absent = significant(k).filter((w) => !t.includes(w));
    if (!absent.length) full++;
    for (const w of absent) missing.set(w, (missing.get(w) ?? 0) + 1);
  }
  return { keywords: keywords.length, covered: full, missing: [...missing].sort((a, b) => b[1] - a[1]) };
}

/**
 * Title + description + the page's own text: the body without the site header, footer and nav
 * (27 Nov 2026 — route pages keep their hero, with the answer sentence, outside <main>, and a
 * reader and Google both see it). Comments React leaves between text nodes are removed.
 */
export function pageText(html) {
  const title = /<title>([^<]*)/.exec(html)?.[1] ?? '';
  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
  const body = (/<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? html)
    .replace(/<!-- -->/g, '')
    .replace(/<(header|footer|nav)\b[\s\S]*?<\/\1>/gi, ' ');
  return `${title} ${desc} ${mainText(`<main>${body}</main>`).join(' ')}`.replace(/&amp;/g, '&').replace(/&#x27;/g, "'");
}

async function main() {
  const args = process.argv.slice(2);
  const base = (args.find((a) => !a.startsWith('--')) ?? 'https://www.hellomycabs.com').replace(/\/$/, '');
  const i = args.indexOf('--label');
  const label = i >= 0 ? args[i + 1] : new Date().toISOString().slice(0, 10);
  const mapped = 'docs/seo/evidence/keyword-files-2026-11-27/keyword-map.csv';
  const rows = parseCsv(readFileSync(existsSync(mapped) ? mapped : MASTER, 'utf8'));
  const by = keywordsByPage(rows);
  const report = {};
  for (const [p, kws] of by) {
    const html = await (await fetch(base + p)).text();
    const c = cover(pageText(html), kws);
    report[p] = { ...c, missing: c.missing.slice(0, 15) };
  }
  const out = `docs/seo/evidence/keyword-coverage-${label}.json`;
  writeFileSync(out, JSON.stringify({ base, label, at: new Date().toISOString(), pages: report }, null, 1));
  let k = 0;
  let c = 0;
  for (const [p, r] of Object.entries(report).sort((a, b) => b[1].keywords - a[1].keywords)) {
    k += r.keywords;
    c += r.covered;
    console.log(`${p}  ${r.covered}/${r.keywords}  missing: ${r.missing.slice(0, 8).map(([w, n]) => `${w}(${n})`).join(' ')}`);
  }
  console.log(`\nAll Wave 1: ${c}/${k} keywords fully covered → ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
