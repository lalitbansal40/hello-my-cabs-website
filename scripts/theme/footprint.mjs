/** Same-origin read-only HTML/inline-CSS/shared-script/RSC gzip-equivalent comparison. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
const arg = k => process.argv.find(a => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const origins = { before: arg('before'), after: arg('after') }, out = arg('out'); assert.ok(out); mkdirSync(out, { recursive: true });
for (const origin of Object.values(origins)) assert.ok(origin && ['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
const paths = ['/', '/routes', '/jaipur-to-delhi-cab', '/jaipur-to-delhi-round-trip-cab', '/jaipur-to-delhi-airport-cab', '/cab-service-in-jaipur', '/innova-crysta-taxi', '/guides/one-way-or-round-trip', '/guides/jaipur-delhi-by-road'];
const size = b => ({ raw: Buffer.byteLength(b), gzipEquivalent: gzipSync(b).length });
const results = {};
for (const [kind, origin] of Object.entries(origins)) {
  results[kind] = [];
  for (const path of paths) {
    const response = await fetch(origin + path); assert.equal(response.status, 200);
    const html = await response.text(); const css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
    const sources = [...new Set([...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m => m[1]))];
    const scripts = [];
    for (const src of sources) {
      const url = new URL(src, origin); assert.equal(url.origin, origin);
      const r = await fetch(url); assert.equal(r.status, 200); const b = Buffer.from(await r.arrayBuffer());
      scripts.push({ src, ...size(b), sha256: createHash('sha256').update(b).digest('hex') });
    }
    const rscResponse = await fetch(origin + path + '?_rsc=theme-footprint', { headers: { RSC: '1', 'Next-Router-Prefetch': '1' } });
    assert.equal(rscResponse.status, 200); assert.ok(rscResponse.headers.get('content-type')?.includes('text/x-component'));
    const rsc = await rscResponse.text();
    const slug = path.replaceAll('/', '_'); writeFileSync(`${out}/${kind}-${slug}.html`, html); writeFileSync(`${out}/${kind}-${slug}.rsc`, rsc);
    results[kind].push({ path, html: size(html), inlineCss: size(css), rsc: size(rsc), scripts, scriptGzipTotal: scripts.reduce((n, s) => n + s.gzipEquivalent, 0) });
  }
}
const deltas = paths.map(path => {
  const a = results.after.find(r => r.path === path), b = results.before.find(r => r.path === path);
  return { path, htmlGzip: a.html.gzipEquivalent - b.html.gzipEquivalent, inlineCssGzip: a.inlineCss.gzipEquivalent - b.inlineCss.gzipEquivalent, rscGzip: a.rsc.gzipEquivalent - b.rsc.gzipEquivalent, scriptGzip: a.scriptGzipTotal - b.scriptGzipTotal };
});
const themeSource = readFileSync('src/lib/theme.ts', 'utf8');
// Runtime string is measured by the pure source loader in tests; HTML extracts the actual emitted copy.
const afterHtml = readFileSync(`${out}/after-_.html`, 'utf8');
const bootstrap = [...afterHtml.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes("hmc:theme:v1")); assert.ok(bootstrap && themeSource.includes('THEME_BOOTSTRAP'));
const gates = { bootstrap: size(bootstrap).gzipEquivalent <= 1024, cssTarget: deltas.every(d => d.inlineCssGzip <= 6144), jsTarget: deltas.every(d => d.scriptGzip <= 3072), jsHard: deltas.every(d => d.scriptGzip <= 4096) };
writeFileSync(`${out}/result.json`, JSON.stringify({ method: 'gzip-equivalent decompressed response bodies; RSC prefetch header; all HTML script chunks including shared chunks; no production writes', results, deltas, bootstrap: size(bootstrap), gates }, null, 2));
console.log(JSON.stringify({ deltas, bootstrap: size(bootstrap), gates }, null, 2));
if (!gates.bootstrap || !gates.cssTarget || !gates.jsHard) process.exitCode = 1;
