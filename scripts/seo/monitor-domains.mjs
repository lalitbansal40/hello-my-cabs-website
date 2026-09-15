/**
 * The three domains that carry this business's name, and what each is doing today.
 *
 *   node scripts/seo/monitor-domains.mjs
 *
 * Run it monthly (and after any domain change). Writes /tmp/hmc-domains.md.
 *
 * - hellomycabs.com — the site. The bare domain must reach www through one 301, not a 302.
 * - hellomycab.com — the business's own site since 2017, out of our control. Is it still up,
 *   and still competing? The day it redirects here, scripts/seo/old-domain/verify-redirects.mjs
 *   takes over.
 * - hellomycab.co — lapsed, registered by someone else on 7 Aug 2026, serves a casino. Is it
 *   still doing that, and still pretending to be a cab site to search engines?
 */
import { writeFileSync } from 'node:fs';

const UA_BROWSER =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const UA_GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

/** One request (a second try if the first fails — these hosts are slow now and then). */
async function peek(url, ua = UA_BROWSER, tries = 2) {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': ua },
      signal: AbortSignal.timeout(30_000),
    });
    const text = res.status === 200 ? await res.text() : '';
    const title = text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
    return { ok: true, status: res.status, location: res.headers.get('location') ?? '', title };
  } catch (e) {
    if (tries > 1) return peek(url, ua, tries - 1);
    return { ok: false, status: 0, location: '', title: `(failed: ${e.message})` };
  }
}

/** A title can hold a `|`, which would split the markdown table. */
const cell = (s) => (s || '—').replace(/\|/g, '\\|');

const rows = [];
const add = (what, r, verdict) =>
  rows.push(`| ${what} | ${r.status} | ${cell(r.location)} | ${cell(r.title)} | ${verdict} |`);

// hellomycabs.com — the bare domain must redirect permanently to www.
for (const url of ['http://hellomycabs.com/', 'https://hellomycabs.com/']) {
  const r = await peek(url);
  const ok = (r.status === 301 || r.status === 308) && r.location.startsWith('https://');
  add(url, r, ok ? '✓ permanent' : r.status === 302 ? '✗ 302 — set 301 in Amplify' : '✗ check');
}
const www = await peek('https://www.hellomycabs.com/');
add(
  'https://www.hellomycabs.com/',
  www,
  www.status === 200 ? '✓ live' : www.ok ? '✗ not 200' : '? no answer — run again',
);

// hellomycab.com — our old site.
const old = await peek('https://hellomycab.com/');
const oldSitemap = await fetch('https://hellomycab.com/page-sitemap.xml', {
  signal: AbortSignal.timeout(15_000),
})
  .then((r) => (r.ok ? r.text() : ''))
  .then((t) => (t.match(/<loc>/g) ?? []).length)
  .catch(() => 0);
add(
  'https://hellomycab.com/',
  old,
  (old.status === 301 || old.status === 308) && old.location.includes('hellomycabs.com')
    ? '✓ redirects to the new site'
    : old.status === 200
      ? `✗ still a separate site (${oldSitemap} pages in its sitemap) — see old-domain/README.md`
      : '? down or changed — check',
);

// hellomycab.co — the lapsed domain. Compare what a browser and Googlebot are shown.
const coBrowser = await peek('https://hellomycab.co/');
const coBot = await peek('https://hellomycab.co/', UA_GOOGLEBOT);
add(
  'https://hellomycab.co/ (browser)',
  coBrowser,
  !coBrowser.ok
    ? '? no answer — run again'
    : /cab|taxi/i.test(coBrowser.title)
      ? '? a cab title — check by hand'
      : '✗ not ours',
);
add(
  'https://hellomycab.co/ (Googlebot)',
  coBot,
  !coBot.ok || !coBrowser.ok
    ? '? no answer — run again'
    : coBot.title && coBot.title !== coBrowser.title
      ? '✗ shows search engines a different page — report as cloaking'
      : 'same page as a browser',
);

const out = [
  `# Domains — ${new Date().toISOString().slice(0, 10)}`,
  '',
  '| URL | status | location | title | verdict |',
  '|---|---|---|---|---|',
  ...rows,
  '',
].join('\n');
writeFileSync('/tmp/hmc-domains.md', out);
console.log(out);
