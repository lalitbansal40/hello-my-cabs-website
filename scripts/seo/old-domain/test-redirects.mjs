/**
 * Proves verify-redirects.mjs tells a correct set of redirects from a broken one, against a
 * fake old domain on localhost — so on the day it matters, a pass means something.
 *
 *   node scripts/seo/old-domain/test-redirects.mjs
 *
 * Runs the verifier three times: against redirects built exactly from map.json (must pass),
 * then with one redirect sent to the wrong page, then with one answering 302 (both must
 * fail). Target pages are not fetched (SKIP_TARGETS=1) — the new site is not the thing being
 * tested here.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';

const map = JSON.parse(readFileSync(new URL('map.json', import.meta.url), 'utf8'));
const origin = map.newOrigin.replace(/\/+$/, '');
const table = new Map(map.redirects.map((r) => [r.from, r.to]));
const verifier = new URL('verify-redirects.mjs', import.meta.url).pathname;

async function run(mode) {
  const server = createServer((req, res) => {
    const path = req.url.split('?')[0];
    let to = table.get(path) ?? table.get(`${path}/`) ?? map.fallback;
    let status = 301;
    if (mode === 'wrong-target' && path === '/jaipur-to-delhi-taxi-service/') to = '/routes';
    if (mode === 'temporary' && path === '/delhi-to-jaipur-taxi/') status = 302;
    res.writeHead(status, { location: `${origin}${to}` }).end();
  });
  await new Promise((r) => server.listen(4400, r));
  // Async, not execFileSync: a blocking call would stop this process — and the fake server
  // in it — from ever answering the verifier.
  const ok = await new Promise((resolve) =>
    execFile(
      'node',
      [verifier],
      { env: { ...process.env, OLD_ORIGIN: 'http://localhost:4400', SKIP_TARGETS: '1' } },
      (err) => resolve(!err),
    ),
  );
  await new Promise((r) => server.close(r));
  return ok;
}

const results = {
  correct: await run('correct'),
  'wrong-target': await run('wrong-target'),
  temporary: await run('temporary'),
};
const pass = results.correct && !results['wrong-target'] && !results.temporary;
console.log(
  `correct map passes: ${results.correct} · wrong target caught: ${!results['wrong-target']} · 302 caught: ${!results.temporary}`,
);
process.exit(pass ? 0 : 1);
