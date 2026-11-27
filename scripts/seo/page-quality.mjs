#!/usr/bin/env node
/**
 * Page weight and sameness of the pages we ask Google to index (27 Nov 2026,
 * docs/seo/PROMPT_INDEX_RANK_27NOV.md Steps 0, 2, 3, 9.7, 11).
 *
 *   node scripts/seo/page-quality.mjs <base-url> [--label name] [--paths a,b,c] [--out file]
 *
 * For each page: HTML bytes, gzip bytes, inline <style> bytes, <script> bytes, JSON-LD bytes,
 * how many times the organization JSON-LD appears (it must be once), words in <main>.
 * For the route pages: the masked 5-gram overlap (numbers → #) of every pair, the measure
 * the 25% budget in Step 3 uses. Writes docs/seo/evidence/page-quality-<label>.json.
 */
import { gzipSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { wave1Paths, wave1RoutePaths } from './lib/tiers.mjs';

export const BUDGET = { html: 150_000, gzip: 35_000 };

const strip = (html, tag) => html.replace(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, 'gi'), ' ');

/** Visible text of <main> (or the body) without script, style and svg. */
export function mainText(html) {
  const m = html.match(/<main[\s\S]*?<\/main>/i);
  let t = m ? m[0] : html;
  for (const tag of ['script', 'style', 'svg', 'noscript']) t = strip(t, tag);
  return t
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

const sum = (xs) => xs.reduce((a, b) => a + b, 0);

export function measure(html) {
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1].length);
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
  const ld = scripts.filter((m) => /application\/ld\+json/i.test(m[1]));
  const orgId = '#organization';
  const orgCount = html.split(orgId).length - 1;
  return {
    html: Buffer.byteLength(html),
    gzip: gzipSync(html).length,
    style: sum(styles),
    script: sum(scripts.map((m) => m[2].length)),
    jsonLd: sum(ld.map((m) => m[2].length)),
    jsonLdBlocks: ld.length,
    // The organization @id is referenced by several graphs; what matters is that the whole
    // JSON-LD text is not repeated in the RSC payload — see ldRepeated.
    orgIdMentions: orgCount,
    ldRepeated: ld.some((m) => {
      const probe = m[2].slice(0, 120);
      const esc = probe.replace(/"/g, '\\"');
      return probe.length > 40 && html.includes(esc);
    }),
    words: mainText(html).length,
    h1: (html.match(/<h1[\s>]/gi) || []).length,
  };
}

export const mask = (words) => words.map((w) => w.toLowerCase().replace(/\d[\d,.]*/g, '#'));

export function shingles(words, k = 5) {
  const s = new Set();
  for (let i = 0; i + k <= words.length; i++) s.add(words.slice(i, i + k).join(' '));
  return s;
}

export function overlap(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const uni = a.size + b.size - inter;
  return uni ? inter / uni : 0;
}

/** Every pair's masked overlap, highest first. */
export function overlapMatrix(texts) {
  const keys = Object.keys(texts);
  const sh = Object.fromEntries(keys.map((k) => [k, shingles(mask(texts[k]))]));
  const pairs = [];
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++)
      pairs.push({ a: keys[i], b: keys[j], overlap: +overlap(sh[keys[i]], sh[keys[j]]).toFixed(3) });
  return pairs.sort((x, y) => y.overlap - x.overlap);
}

/** Masked overlap of these paths on a running site (release-wave.mjs --check). */
export async function measureOverlap(base, paths) {
  const texts = {};
  for (const p of paths) {
    const res = await fetch(base.replace(/\/$/, '') + p);
    if (res.status === 200) texts[p] = mainText(await res.text());
  }
  return overlapMatrix(texts);
}

async function main() {
  const args = process.argv.slice(2);
  const base = (args.find((a) => !a.startsWith('--')) || 'https://www.hellomycabs.com').replace(/\/$/, '');
  const opt = (n) => {
    const i = args.indexOf(`--${n}`);
    return i >= 0 ? args[i + 1] : null;
  };
  const label = opt('label') || new Date().toISOString().slice(0, 10);
  const paths = opt('paths') ? opt('paths').split(',') : wave1Paths();
  const routes = new Set(opt('paths') ? paths.filter((p) => /-to-.*-cab$/.test(p)) : wave1RoutePaths());
  const pages = {};
  const texts = {};
  for (const p of paths) {
    const res = await fetch(base + p, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; HMC-page-quality)' } });
    const html = await res.text();
    pages[p] = { status: res.status, ...measure(html) };
    if (routes.has(p) && res.status === 200) texts[p] = mainText(html);
  }
  const pairs = overlapMatrix(texts);
  const over = Object.entries(pages).filter(([, m]) => m.html > BUDGET.html || m.gzip > BUDGET.gzip);
  const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] || 0;
  const report = {
    base,
    label,
    at: new Date().toISOString(),
    budget: BUDGET,
    summary: {
      pages: paths.length,
      htmlMedian: median(Object.values(pages).map((m) => m.html)),
      gzipMedian: median(Object.values(pages).map((m) => m.gzip)),
      overBudget: over.map(([p]) => p),
      maxOverlap: pairs[0] || null,
      pairsOver025: pairs.filter((x) => x.overlap > 0.25).length,
    },
    pages,
    pairs,
  };
  const out = opt('out') || `docs/seo/evidence/page-quality-${label}.json`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`wrote ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
