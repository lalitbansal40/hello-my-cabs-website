/**
 * npm run audit:lighthouse — Lighthouse the way PageSpeed Insights runs it (8 Oct 2026).
 *
 *   node scripts/audit/lighthouse.mjs                      # local build on :3100, mobile
 *   node scripts/audit/lighthouse.mjs --desktop
 *   BASE_URL=https://www.hellomycabs.com node scripts/audit/lighthouse.mjs
 *   node scripts/audit/lighthouse.mjs --runs=5 --pages=/,/jaipur-to-delhi-cab
 *
 * Mobile is PSI's default: an emulated Moto G Power, slow 4G and 4× CPU, *simulated* (Lighthouse
 * "Lantern") — the same model that gave the live home page 84 on 7 Oct 2026. One run varies by
 * ±3–5, so each page is run three times and the MEDIAN is reported; that is the number a change
 * has to move before it is kept (PROMPT_mobile_speed.md).
 *
 * Prints per page: score, FCP, LCP, Speed Index, TBT, CLS, the LCP element, the JavaScript and
 * HTML transferred, and how many requests had started before the LCP. Writes /tmp/hmc-lighthouse.md.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.env.BASE_URL ?? 'http://localhost:3100').replace(/\/+$/, '');
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const desktop = process.argv.includes('--desktop');
const RUNS = Number(arg('runs') ?? 3);
const PAGES = (arg('pages') ?? '/,/jaipur-to-delhi-cab,/cab-service-in-jaipur').split(',');

const dir = mkdtempSync(join(tmpdir(), 'hmc-lh-'));
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

function run(url, i) {
  const out = join(dir, `r${i}.json`);
  execFileSync(
    'npx',
    [
      '-y',
      'lighthouse@12',
      url,
      '--only-categories=performance',
      '--output=json',
      `--output-path=${out}`,
      '--chrome-flags=--headless=new',
      '--quiet',
      ...(desktop ? ['--preset=desktop'] : []),
    ],
    { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore' },
  );
  const d = JSON.parse(readFileSync(out, 'utf8'));
  const a = d.audits;
  const m = a.metrics.details.items[0];
  const reqs = a['network-requests'].details.items;
  const lcpAt = m.observedLargestContentfulPaint;
  const el =
    a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.nodeLabel ?? '';
  return {
    score: Math.round(d.categories.performance.score * 100),
    fcp: m.firstContentfulPaint,
    lcp: m.largestContentfulPaint,
    si: m.speedIndex,
    tbt: m.totalBlockingTime,
    cls: m.cumulativeLayoutShift,
    js: reqs.filter((r) => r.resourceType === 'Script').reduce((n, r) => n + (r.transferSize ?? 0), 0),
    html: reqs.find((r) => r.resourceType === 'Document')?.transferSize ?? 0,
    beforeLcp: reqs.filter((r) => (r.networkRequestTime ?? 0) < lcpAt).length,
    el,
  };
}

const rows = [];
for (const p of PAGES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(run(`${BASE}${p}`, i));
  const pick = (k) => median(runs.map((r) => r[k]));
  const row = {
    page: p,
    score: pick('score'),
    scores: runs.map((r) => r.score).join('/'),
    fcp: pick('fcp'),
    lcp: pick('lcp'),
    si: pick('si'),
    tbt: pick('tbt'),
    cls: pick('cls'),
    js: pick('js'),
    html: pick('html'),
    beforeLcp: pick('beforeLcp'),
    el: runs[0].el,
  };
  rows.push(row);
  console.log(
    `${p}  score ${row.score} (${row.scores})  FCP ${(row.fcp / 1000).toFixed(2)}s  LCP ${(row.lcp / 1000).toFixed(2)}s  SI ${(row.si / 1000).toFixed(2)}s  TBT ${Math.round(row.tbt)}ms  CLS ${row.cls.toFixed(3)}  JS ${(row.js / 1024).toFixed(0)}KB  HTML ${(row.html / 1024).toFixed(0)}KB  req<LCP ${row.beforeLcp}  LCP el "${row.el.slice(0, 40)}"`,
  );
}
rmSync(dir, { recursive: true, force: true });

const md = [
  `# Lighthouse ${desktop ? 'desktop' : 'mobile'} — ${BASE} — ${new Date().toISOString().slice(0, 16)}`,
  '',
  `Median of ${RUNS} runs.`,
  '',
  '| page | score | runs | FCP | LCP | SI | TBT | CLS | JS KB | HTML KB | req<LCP | LCP element |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map(
    (r) =>
      `| ${r.page} | ${r.score} | ${r.scores} | ${(r.fcp / 1000).toFixed(2)} s | ${(r.lcp / 1000).toFixed(2)} s | ${(r.si / 1000).toFixed(2)} s | ${Math.round(r.tbt)} ms | ${r.cls.toFixed(3)} | ${(r.js / 1024).toFixed(0)} | ${(r.html / 1024).toFixed(0)} | ${r.beforeLcp} | ${r.el.slice(0, 40)} |`,
  ),
].join('\n');
writeFileSync('/tmp/hmc-lighthouse.md', md);
