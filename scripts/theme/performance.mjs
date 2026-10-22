/** Local cold three-run baseline/theme comparison. Raw reports are never deleted.
 * BASE_URL=http://127.0.0.1:3420 node scripts/theme/performance.mjs --out=/absolute/baseline
 * BASE_URL=http://127.0.0.1:3421 node scripts/theme/performance.mjs --baseline=/absolute/baseline/summary.json --out=/absolute/after
 */
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const base = process.env.BASE_URL;
assert.ok(base && ['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Explicit local origin required');
const out = arg('out'); assert.ok(out, 'Explicit evidence directory required');
const baseline = arg('baseline') ? JSON.parse(readFileSync(arg('baseline'), 'utf8')) : null;
const allPaths = ['/', '/routes', '/jaipur-to-delhi-cab', '/jaipur-to-delhi-round-trip-cab', '/jaipur-to-delhi-airport-cab', '/cab-service-in-jaipur', '/innova-crysta-taxi', '/guides/one-way-or-round-trip', '/guides/jaipur-delhi-by-road'];
const excluded = arg('exclude')?.split(',') ?? [];
assert.ok(excluded.every(p => allPaths.includes(p)), 'Unknown excluded path');
const paths = (arg('path') ? [arg('path')] : allPaths).filter(p => !excluded.includes(p));
assert.ok(paths.length && paths.every(p => allPaths.includes(p)), 'At least one known path is required');
const modes = baseline ? (arg('mode') ? [arg('mode')] : ['light', 'dark']) : ['baseline'];
assert.ok(modes.every(m => ['baseline', 'light', 'dark'].includes(m)));
const median = xs => [...xs].sort((a, b) => a - b)[1];
const exec = promisify(execFile), results = [], failures = [];
mkdirSync(out, { recursive: true });
const cli = process.env.LIGHTHOUSE_CLI_PATH;
const cliVersion = cli ? JSON.parse(readFileSync(join(dirname(cli), '../package.json'), 'utf8')).version : 'npx-lighthouse@12';
if (cli) assert.ok(cliVersion.startsWith('12.'), 'Use the same Lighthouse major as the baseline');
const fingerprint = JSON.stringify({ base, baseline: arg('baseline') ?? null, paths, modes, runs: 3, cliVersion,
  buildId: readFileSync(join(arg('artifact') ?? '.next', 'BUILD_ID'), 'utf8').trim(),
  themeSource: baseline ? createHash('sha256').update(readFileSync('src/lib/theme.ts')).update(readFileSync('src/lib/theme-browser.ts')).digest('hex') : null });
const config = join(out, 'configuration.json');
if (existsSync(config)) assert.equal(readFileSync(config, 'utf8'), fingerprint, 'Output belongs to a different case/configuration');
else writeFileSync(config, fingerprint);
for (const mode of modes) for (const path of paths) {
  const stem = `${mode}-${path.replaceAll('/', '_')}`;
  const files = [0, 1, 2].map(n => join(out, `${stem}-r${n}.json`));
  const complete = process.argv.includes('--resume') && files.every(f => existsSync(f) && existsSync(f.replace('.json', '-theme.json')));
  if (!complete && files.some(existsSync)) {
    assert.ok(process.argv.includes('--resume'), 'Do not overwrite a prior trial; choose a fresh output or resume');
    const archive = join(out, `interrupted-${stem}-${Date.now()}`); mkdirSync(archive);
    for (const f of files.flatMap(f => [f, f.replace('.json', '-theme.json')])) if (existsSync(f)) renameSync(f, join(archive, f.slice(out.length + 1)));
  }
  const reports = [];
  for (const file of files) {
    if (!complete) {
      const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
      try {
        const p = await browser.newPage(); await p.goto(base + '/robots.txt');
        await p.evaluate(mode => {
          localStorage.setItem('hmc_callback_seen', String(Date.now()));
          if (mode === 'baseline') localStorage.removeItem('hmc:theme:v1'); else localStorage.setItem('hmc:theme:v1', mode);
        }, mode);
        const cdp = await p.createCDPSession(); await cdp.send('Network.clearBrowserCache'); await p.close();
        const observed = [];
        const watch = async target => {
          try {
            const page = typeof target.page === 'function' ? await target.page() : target;
            if (!page) return;
            const capture = async () => {
              if (page.url().replace(/\/$/, '') !== (base + path).replace(/\/$/, '')) return;
              try { observed.push(await page.$eval('html', e => ({ mode: e.dataset.themeMode ?? null, theme: e.dataset.theme ?? null, scheme: getComputedStyle(e).colorScheme }))); } catch { /* Closing audited target. */ }
            };
            page.on('domcontentloaded', capture); page.on('load', capture);
          } catch { /* Target detached while Lighthouse completed. */ }
        };
        for (const page of await browser.pages()) await watch(page);
        browser.on('targetcreated', watch);
        const flags = [base + path, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices', `--port=${new URL(browser.wsEndpoint()).port}`, '--disable-storage-reset'];
        await exec(cli ? process.execPath : 'npx', cli ? [cli, ...flags] : ['-y', 'lighthouse@12', ...flags], { timeout: 150000, maxBuffer: 4 * 1024 * 1024 });
        assert.ok(observed.length, 'Measured-document proof missing');
        writeFileSync(file.replace('.json', '-theme.json'), JSON.stringify(observed));
      } finally { await browser.close(); }
    }
    const report = JSON.parse(readFileSync(file, 'utf8'));
    const observed = JSON.parse(readFileSync(file.replace('.json', '-theme.json'), 'utf8'));
    assert.ok(!report.runtimeError && observed.length);
    assert.equal(new URL(report.requestedUrl).pathname, path);
    assert.ok(observed.every(s => mode === 'baseline' ? s.scheme === 'light' : s.mode === mode && s.theme === mode && s.scheme === mode), `Wrong measured theme ${mode} ${path}`);
    reports.push(report);
  }
  const metric = key => median(reports.map(r => r.audits[key].numericValue));
  const size = kind => median(reports.map(r => r.audits['resource-summary'].details.items.find(i => i.resourceType === kind)?.transferSize ?? 0));
  const row = { mode, path, runs: 3, performance: median(reports.map(r => Math.round(r.categories.performance.score * 100))), accessibility: median(reports.map(r => Math.round(r.categories.accessibility.score * 100))), bestPractices: median(reports.map(r => Math.round(r.categories['best-practices'].score * 100))), lcpMs: metric('largest-contentful-paint'), tbtMs: metric('total-blocking-time'), cls: metric('cumulative-layout-shift'), scriptBytes: size('script'), stylesheetBytes: size('stylesheet'), documentBytes: size('document'), scores: reports.map(r => Math.round(r.categories.performance.score * 100)) };
  if (baseline) {
    const before = baseline.results.find(r => r.path === path); assert.ok(before);
    row.lcpDeltaMs = row.lcpMs - before.lcpMs; row.tbtDeltaMs = row.tbtMs - before.tbtMs; row.scriptDeltaBytes = row.scriptBytes - before.scriptBytes;
    if (row.performance < before.performance - 1 || row.lcpDeltaMs > 150 || row.tbtDeltaMs > 50 || (before.tbtMs <= 200 && row.tbtMs > 200) || row.scriptDeltaBytes > 4096 || row.cls > Math.max(before.cls, 0.1) || (before.cls === 0 && row.cls !== 0) || row.cls - before.cls > 0.01 || row.accessibility < before.accessibility || row.bestPractices < before.bestPractices) failures.push(row);
  }
  results.push(row); console.log(JSON.stringify(row));
  writeFileSync(join(out, 'summary.json'), JSON.stringify({ base, rawReports: out, method: 'cold three-run medians', complete: results.length === paths.length * modes.length, passed: failures.length === 0, results, failures }, null, 2));
}
if (failures.length) process.exitCode = 1;
