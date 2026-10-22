// Loopback-only theme fixture. Public responses are captured snapshots; private/write responses are synthetic and never leave this process.
// node scripts/theme/fixture-server.mjs DIRECTORY 43211
// No credentials, database, external fetch, booking creation or real pricing calculations.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import QRCode from 'qrcode';

const [directory, portText] = process.argv.slice(2);
const port = Number(portText);
if (!directory || !Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('Provide snapshot directory and an unprivileged port');
}
const unavailable = process.argv.includes('--unavailable');
const requests = new Map();
const read = (name) => JSON.parse(readFileSync(resolve(directory, `${name}.json`), 'utf8'));
const allFares = read('fares_all').data.routes;
const qrPng = await QRCode.toDataURL('HELLOMYCABS LOCAL THEME TEST - NOT A PAYMENT', { margin: 4, width: 320 });
const user = { _id: '000000000000000000000099', name: 'Theme Fixture Customer', phone: '919000000000', role: 'CUSTOMER' };
const statuses = ['PAYMENT_PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'PAYMENT_FAILED'];
const booking = id => ({ _id: id, bookingNo: id.endsWith('1') ? undefined : 1, tripType: 'one_way', pickupCity: 'JAIPUR', dropCity: 'DELHI', vehicleType: 'dzire', pickup: { address: 'Local fixture pickup' }, drop: { address: 'Local fixture drop' }, scheduledAt: new Date(Date.now() + 40 * 86400000).toISOString(), status: statuses[(Number(id.slice(-1)) || 1) - 1] ?? 'CONFIRMED', fareEstimate: 400000, bookingAmount: 50000, gstAmount: 20000, gstPercent: 5, paymentMethod: 'online', createdAt: new Date().toISOString() });
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
  const auth = request.headers.authorization ?? '';
  const ok = data => send(200, { ok: true, data });
  const fail = (status = 404) => send(status, { ok: false, error: { code: 'LOCAL_THEME_FIXTURE', message: 'Synthetic unavailable test state' } });
  const id = url.pathname.match(/\/bookings\/([^/]+)/)?.[1];
  if (url.pathname === '/api/v1/auth/me' && auth.includes('theme-slow-user')) return void setTimeout(() => ok({ user }), 1800);
  if (url.pathname === '/api/v1/auth/me') return auth ? ok({ user }) : fail(401);
  if (url.pathname === '/api/v1/auth/otp/request' && request.method === 'POST') return ok({ isNewUser: false });
  if (url.pathname === '/api/v1/auth/otp/verify' && request.method === 'POST') return ok({ user, accessToken: 'theme-user' });
  if (url.pathname === '/api/v1/bookings/mine') return ok({ bookings: auth.includes('empty') ? [] : statuses.map((_, i) => booking('00000000000000000000000' + (i + 1))) });
  if (url.pathname.includes('/cancel-preview')) return ok({ paidOnline: 70000, cancellationFee: 0, refundAmount: 70000 });
  if (url.pathname.endsWith('/reconcile') && request.method === 'POST') return ok({ paid: id?.endsWith('2'), booking: booking(id), amountPaid: 50000, gstPaid: 20000, billUrl: null, dropped: id?.endsWith('8') });
  if (url.pathname.endsWith('/qr') && request.method === 'POST') return ok({ qr: { qrId: 'theme-nonpayable', imageUrl: qrPng, qrPng, upiUri: 'upi://pay?pa=local-fixture@example.invalid&pn=Nonpayable%20theme%20fixture&am=0', amount: 70000, payeeName: 'LOCAL THEME FIXTURE - NOT PAYABLE', expiresAt: new Date(Date.now() + 30 * 60000).toISOString() } });
  if (url.pathname.endsWith('/pay-link') && request.method === 'POST') return ok({ paymentUrl: 'https://example.invalid/local-theme-gateway' });
  if (url.pathname === '/api/v1/public/booking/quote' && request.method === 'POST') return ok({ quoteId: 'theme-quote', expiresAt: new Date(Date.now() + 30 * 60000).toISOString(), totalRupees: 4000, fareRupees: 3800, tollRupees: 200, advanceRupees: 500, minAdvanceRupees: 500, gstRupees: 200, gstPercent: 5 });
  if (['/api/v1/public/bookings', '/api/v1/bookings'].includes(url.pathname) && request.method === 'POST') return ok({ booking: booking('000000000000000000000001'), guestToken: 'theme-guest', payment: { paymentUrl: 'https://example.invalid/local-theme-gateway' } });
  if (id?.startsWith('theme-slow') && /^\/api\/v1\/bookings\/[^/]+$/.test(url.pathname)) return void setTimeout(() => ok({ booking: booking(id), billUrl: null }), 1800);
  if (url.pathname === '/api/v1/public/fare/oneway' && url.searchParams.get('pickup') === 'THEME_ERROR') return ok({ vehicles: null });
  if (url.pathname === '/api/v1/public/fare/oneway' && url.searchParams.get('pickup')?.startsWith('THEME_SLOW')) return void setTimeout(() => ok(allFares.find(r => r.pickup === 'JAIPUR' && r.drop === 'DELHI').oneway), 1800);
  if (id === 'theme-missing') return fail(404);
  if (id === 'theme-other-owner') return fail(403);
  if (/^\/api\/v1\/bookings\/[^/]+$/.test(url.pathname)) return auth ? ok({ booking: booking(id), billUrl: null }) : fail(401);
  if (/^\/api\/v1\/public\/bookings\/[^/]+$/.test(url.pathname)) return ok({ booking: booking(id), driverName: null, paid: id?.endsWith('2'), amountPaid: 50000, gstPaid: 20000, billUrl: null });
  if (url.pathname.startsWith('/api/v1/public/reviews/rate/')) return url.pathname.endsWith('theme-invalid') ? fail() : ok({ from: 'Jaipur', to: 'Delhi', date: new Date().toISOString(), completed: !url.pathname.endsWith('theme-ineligible'), alreadyRated: url.pathname.endsWith('theme-rated'), googleReviewUrl: null });
  if (url.pathname.startsWith('/api/v1/route-knowledge/form/')) return url.pathname.endsWith('theme-invalid') ? fail() : ok({ pickupLabel: 'Jaipur', dropLabel: 'Delhi', driverFirstName: 'Fixture', answer: url.pathname.endsWith('theme-new') ? null : { actualKm: 306, roadCondition: 'good', note: 'Synthetic existing answer' }, status: url.pathname.endsWith('theme-new') ? null : url.pathname.endsWith('theme-rejected') ? 'rejected' : 'approved' });
  if (url.pathname.startsWith('/api/v1/public/booking/lead') || url.pathname.startsWith('/api/v1/public/reviews/rate') || url.pathname.startsWith('/api/v1/route-knowledge')) return request.method === 'POST' ? ok({ synthetic: true }) : fail();

  if (request.method !== 'GET')
    return send(405, { ok: false, error: { code: 'READ_ONLY_FIXTURE' } });
  if (url.pathname.startsWith('/api/v1/public/lead/theme-')) return url.pathname.endsWith('theme-stale') ? fail(404) : ok({ quoteId: 'theme-quote', quoteExpired: url.pathname.endsWith('theme-reopen'), pickupCity: 'JAIPUR', dropCity: 'DELHI', tripType: 'one_way', vehicleType: 'dzire', when: new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 16) });
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
