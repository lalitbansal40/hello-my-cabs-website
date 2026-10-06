import type { City } from './api';

/**
 * A small map of a route, as an SVG (6 Oct 2026).
 *
 * Route pages had no picture at all, so nothing of theirs could appear in image results and
 * a reader had no idea which way the trip ran. Photographs of a place we would have to
 * caption untruthfully (lib/images.ts), so this draws only what is known: the two cities at
 * their real coordinates (the backend's city catalogue), a straight line between them, the
 * other cities we serve that fall inside the frame as faint dots, and a north arrow. The
 * caption says the line is not the road.
 *
 * Served as an image (`/[slug]/map.svg`) so it has a URL, an alt text and a place in the
 * sitemap; the page shows it with an <img>.
 */
const W = 640;
const H = 400;
const PAD = 70;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function routeMapSvg({
  from,
  to,
  others,
  km,
  measured = false,
}: {
  from: City;
  to: City;
  /** Other served cities; those inside the frame are drawn faintly. */
  others: City[];
  km?: number | null;
  /** A measured road distance prints as it is; an estimate says "about". */
  measured?: boolean;
}): string | null {
  if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) return null;
  const midLat = ((from.lat + to.lat) / 2) * (Math.PI / 180);
  const kx = Math.cos(midLat); // a degree of longitude is shorter than one of latitude
  const px = (lng: number) => lng * kx;

  // The frame: the two cities, with room around them in proportion to the trip.
  const x0 = Math.min(px(from.lng), px(to.lng));
  const x1 = Math.max(px(from.lng), px(to.lng));
  const y0 = Math.min(from.lat, to.lat);
  const y1 = Math.max(from.lat, to.lat);
  const span = Math.max(x1 - x0, y1 - y0, 0.4);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const scale = Math.min((W - 2 * PAD) / span, (H - 2 * PAD) / span);
  const X = (lng: number) => W / 2 + (px(lng) - cx) * scale;
  const Y = (lat: number) => H / 2 - (lat - cy) * scale;

  const inFrame = (c: City) => {
    if (c.lat == null || c.lng == null) return false;
    const x = X(c.lng);
    const y = Y(c.lat);
    return x > 20 && x < W - 20 && y > 20 && y < H - 20;
  };
  const ax = X(from.lng);
  const ay = Y(from.lat);
  const bx = X(to.lng);
  const by = Y(to.lat);
  // A faint city is drawn only where its name has room: clear of the two ends (whose labels
  // are large) and of every faint city already placed — Delhi Airport and Noida sit on top
  // of Delhi at this scale.
  const placed: Array<[number, number]> = [
    [ax, ay],
    [bx, by],
    // The distance label, half way along the line.
    [(ax + bx) / 2, (ay + by) / 2 - 21],
  ];
  const clear = (x: number, y: number, r: number) =>
    placed.every(([px2, py2]) => Math.hypot(px2 - x, py2 - y) > r);
  const near: City[] = [];
  for (const c of others) {
    if (near.length >= 12 || c.name === from.name || c.name === to.name || !inFrame(c)) continue;
    const x = X(c.lng!);
    const y = Y(c.lat!);
    if (!clear(x, y, 90)) continue;
    placed.push([x, y]);
    near.push(c);
  }
  // Labels sit on the outer side of each end, so they never cross the line.
  const anchor = (x: number, other: number) => (x <= other ? 'end' : 'start');
  const dx = (x: number, other: number) => (x <= other ? -14 : 14);

  const dots = near
    .map((c) => {
      const x = X(c.lng!).toFixed(1);
      const y = Y(c.lat!).toFixed(1);
      return `<circle cx="${x}" cy="${y}" r="3.5" fill="#b8aca4"/><text x="${x}" y="${(Number(y) - 8).toFixed(1)}" font-size="13" fill="#8a7d75" text-anchor="middle">${esc(c.label)}</text>`;
    })
    .join('');

  const midX = (ax + bx) / 2;
  const midY = (ay + by) / 2;
  // "about" while the km is the estimate; a measured road distance prints as it is.
  const kmLabel = km ? `${measured ? '' : 'about '}${km} km by road` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(
    `Map: ${from.label} to ${to.label}${km ? `, ${km} km` : ''}`,
  )}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
<title>${esc(`${from.label} to ${to.label} — route map`)}</title>
<rect width="${W}" height="${H}" rx="24" fill="#fbf7f3"/>
<g stroke="#efe6de" stroke-width="1">${[1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="${H}"/>`).join('')}${[1, 2, 3, 4].map((i) => `<line x1="0" y1="${i * 80}" x2="${W}" y2="${i * 80}"/>`).join('')}</g>
${dots}
<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="#d6402a" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/>
<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="9" fill="#d6402a"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3.5" fill="#fff"/>
<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="9" fill="#1f1a1a"/><circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="3.5" fill="#fff"/>
<text x="${(ax + dx(ax, bx)).toFixed(1)}" y="${(ay + 6).toFixed(1)}" font-size="22" font-weight="800" fill="#1f1a1a" text-anchor="${anchor(ax, bx)}">${esc(from.label)}</text>
<text x="${(bx + dx(bx, ax)).toFixed(1)}" y="${(by + 6).toFixed(1)}" font-size="22" font-weight="800" fill="#1f1a1a" text-anchor="${anchor(bx, ax)}">${esc(to.label)}</text>
${kmLabel ? `<g><rect x="${(midX - 85).toFixed(1)}" y="${(midY - 34).toFixed(1)}" width="170" height="26" rx="13" fill="#fff" stroke="#efe6de"/><text x="${midX.toFixed(1)}" y="${(midY - 16).toFixed(1)}" font-size="14" font-weight="700" fill="#1f1a1a" text-anchor="middle">${esc(kmLabel)}</text></g>` : ''}
<g transform="translate(${W - 44} 44)"><path d="M0 -18 L7 6 L0 1 L-7 6 Z" fill="#1f1a1a"/><text y="22" font-size="12" font-weight="700" fill="#1f1a1a" text-anchor="middle">N</text></g>
<text x="24" y="${H - 22}" font-size="12" fill="#8a7d75">The line joins the two cities; the road is longer. Hello My Cab</text>
</svg>`;
}
