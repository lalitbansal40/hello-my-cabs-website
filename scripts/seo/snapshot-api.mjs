// Loopback-only, read-only public snapshot server for offline production-build audits.
// node scripts/seo/snapshot-api.mjs DIRECTORY 43211 [--unavailable]
// No credentials, database, external fetch, booking creation or real pricing calculations.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [directory, portText] = process.argv.slice(2);
const port = Number(portText);
if (!directory || !Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('Provide snapshot directory and an unprivileged port');
}
const unavailable = process.argv.includes('--unavailable');
const requests = new Map();
const read = (name) => JSON.parse(readFileSync(resolve(directory, `${name}.json`), 'utf8'));
const allFares = read('fares_all').data.routes;
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const key = request.method + ' ' + url.pathname;
  requests.set(key, (requests.get(key) ?? 0) + 1);
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3421');
  const send = (status, body) => {
    response.statusCode = status;
    response.end(JSON.stringify(body));
  };
  if (request.method !== 'GET')
    return send(405, { ok: false, error: { code: 'READ_ONLY_FIXTURE' } });
  if (url.pathname === '/__audit/stats')
    return send(200, { unavailable, requests: Object.fromEntries(requests) });
  if (!url.pathname.startsWith('/api/v1/public/')) return send(404, { ok: false });
  if (unavailable) return send(503, { ok: false, error: { code: 'LOCAL_AUDIT_OUTAGE' } });
  const path = url.pathname.slice('/api/v1/public/'.length);
  try {
    if (path === 'reviews/site')
      return send(200, { ok: true, data: read('reviews_all').data.site });
    if (path === 'reviews') {
      const data = read('reviews_all').data;
      const row = url.searchParams.has('city')
        ? data.cities.find((r) => r.city === url.searchParams.get('city'))
        : data.routes.find(
            (r) =>
              r.pickup === url.searchParams.get('pickup') &&
              r.drop === url.searchParams.get('drop'),
          );
      return row ? send(200, { ok: true, data: row }) : send(404, { ok: false });
    }
    const name = (path + url.search).replaceAll('/', '_').replaceAll('?', '_').replaceAll('&', '_');
    try {
      return send(200, read(name));
    } catch {
      /* Exact captured response first. */
    }
    if (
      ['fare/oneway', 'fare/roundtrip'].includes(path) &&
      !url.searchParams.has('stops') &&
      !url.searchParams.has('pickupAt')
    ) {
      const row = allFares.find(
        (r) =>
          r.pickup === url.searchParams.get('pickup') && r.drop === url.searchParams.get('drop'),
      );
      const kind = path === 'fare/oneway' ? 'oneway' : 'roundtrip';
      // Never synthesize multi-day or quote prices. A missing snapshot stays missing.
      if (row?.[kind] && (!url.searchParams.has('days') || url.searchParams.get('days') === '1'))
        return send(200, { ok: true, data: row[kind] });
    }
    return send(404, { ok: false, error: { code: 'NO_CAPTURED_PUBLIC_RESPONSE' } });
  } catch {
    return send(500, { ok: false, error: { code: 'INVALID_SNAPSHOT' } });
  }
});
server.listen(port, '127.0.0.1', () =>
  console.log(`Read-only snapshot API at127.0.0.1:${port}; unavailable=${unavailable}`),
);
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
