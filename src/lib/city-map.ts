import type { City } from './api';

/**
 * A map of every route out of a city, as an SVG (7 Oct 2026) — the city page's picture.
 *
 * The same honesty as the route map (lib/route-map.ts): the cities at their real coordinates
 * from the backend's catalogue, a straight line to each destination with its km, and a
 * caption saying the lines are not the roads. A destination's name is written only where it
 * has room; its dot is always drawn.
 */
const W = 720;
const H = 480;
const PAD = 80;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function cityMapSvg({
  city,
  destinations,
}: {
  city: City;
  /** Each destination with the km its route prints. */
  destinations: Array<{ city: City; km: number | null }>;
}): string | null {
  if (city.lat == null || city.lng == null) return null;
  const places = destinations.filter((d) => d.city.lat != null && d.city.lng != null);
  if (places.length === 0) return null;

  const kx = Math.cos((city.lat * Math.PI) / 180);
  const pts = [city, ...places.map((d) => d.city)];
  const xs = pts.map((c) => c.lng! * kx);
  const ys = pts.map((c) => c.lat!);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 0.4);
  const scale = Math.min((W - 2 * PAD) / span, (H - 2 * PAD) / span);
  const X = (c: City) => W / 2 + (c.lng! * kx - cx) * scale;
  const Y = (c: City) => H / 2 - (c.lat! - cy) * scale;

  const ox = X(city);
  const oy = Y(city);

  // Destinations that land on top of each other (Delhi, Delhi Airport and Noida from Jaipur)
  // become one marker with all their names — three dots on one spot read as one anyway.
  type Mark = { x: number; y: number; names: string[]; kms: number[] };
  const marksAt: Mark[] = [];
  for (const d of [...places].sort((a, b) => (a.km ?? 0) - (b.km ?? 0))) {
    const x = X(d.city);
    const y = Y(d.city);
    const near = marksAt.find((m) => Math.hypot(m.x - x, m.y - y) < 22);
    if (near) {
      near.names.push(d.city.label);
      if (d.km) near.kms.push(d.km);
    } else {
      marksAt.push({ x, y, names: [d.city.label], kms: d.km ? [d.km] : [] });
    }
  }

  // Labels are boxes: each tries right, left, above and below its dot, and takes the first
  // spot that overlaps nothing already drawn (the centre's own name included).
  type Box = { x0: number; y0: number; x1: number; y1: number };
  const boxes: Box[] = [
    { x0: ox - 60, y0: oy - 14, x1: ox + 60, y1: oy + 40 }, // the centre and its name
  ];
  const hits = (b: Box) =>
    b.x0 < 8 || b.x1 > W - 8 || b.y0 < 8 || b.y1 > H - 40 ||
    boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  const textW = (t: string, size: number) => t.length * size * 0.56;

  const lines: string[] = [];
  const marks: string[] = [];
  for (const m of marksAt) {
    lines.push(
      `<line x1="${ox.toFixed(1)}" y1="${oy.toFixed(1)}" x2="${m.x.toFixed(1)}" y2="${m.y.toFixed(1)}" stroke="#d6402a" stroke-opacity="0.55" stroke-width="2.5" stroke-dasharray="2 8" stroke-linecap="round"/>`,
    );
    marks.push(`<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="6" fill="#1f1a1a"/>`);
    boxes.push({ x0: m.x - 7, y0: m.y - 7, x1: m.x + 7, y1: m.y + 7 });
  }
  for (const m of marksAt) {
    const name = m.names.join(' · ');
    // One marker for several places carries their range, never one place's figure for all.
    const lo = Math.min(...m.kms);
    const hi = Math.max(...m.kms);
    const sub = m.kms.length === 0 ? '' : lo === hi ? `${lo} km` : `${lo}–${hi} km`;
    const w = Math.max(textW(name, 15), textW(sub, 12));
    const h = sub ? 32 : 18;
    const spots: Array<{ box: Box; tx: number; ty: number; anchor: string }> = [
      { box: { x0: m.x + 10, y0: m.y - 20, x1: m.x + 10 + w, y1: m.y - 20 + h }, tx: m.x + 10, ty: m.y - 6, anchor: 'start' },
      { box: { x0: m.x - 10 - w, y0: m.y - 20, x1: m.x - 10, y1: m.y - 20 + h }, tx: m.x - 10, ty: m.y - 6, anchor: 'end' },
      { box: { x0: m.x - w / 2, y0: m.y - 14 - h, x1: m.x + w / 2, y1: m.y - 14 }, tx: m.x, ty: m.y - 14 - h + 14, anchor: 'middle' },
      { box: { x0: m.x - w / 2, y0: m.y + 10, x1: m.x + w / 2, y1: m.y + 10 + h }, tx: m.x, ty: m.y + 24, anchor: 'middle' },
    ];
    const spot = spots.find((sp) => !hits(sp.box));
    if (!spot) continue;
    boxes.push(spot.box);
    marks.push(
      `<text x="${spot.tx.toFixed(1)}" y="${spot.ty.toFixed(1)}" font-size="15" font-weight="700" fill="#1f1a1a" text-anchor="${spot.anchor}">${esc(name)}</text>` +
        (sub
          ? `<text x="${spot.tx.toFixed(1)}" y="${(spot.ty + 17).toFixed(1)}" font-size="12" fill="#8a7d75" text-anchor="${spot.anchor}">${sub}</text>`
          : ''),
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(
    `Map of the routes from ${city.label}`,
  )}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
<title>${esc(`Routes from ${city.label} — map`)}</title>
<rect width="${W}" height="${H}" rx="24" fill="#fbf7f3"/>
<g stroke="#efe6de" stroke-width="1">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="${H}"/>`).join('')}${[1, 2, 3, 4, 5].map((i) => `<line x1="0" y1="${i * 80}" x2="${W}" y2="${i * 80}"/>`).join('')}</g>
${lines.join('')}
${marks.join('')}
<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="11" fill="#d6402a"/><circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="4" fill="#fff"/>
<text x="${ox.toFixed(1)}" y="${(oy + 32).toFixed(1)}" font-size="22" font-weight="800" fill="#1f1a1a" text-anchor="middle">${esc(city.label)}</text>
<g transform="translate(${W - 44} 44)"><path d="M0 -18 L7 6 L0 1 L-7 6 Z" fill="#1f1a1a"/><text y="22" font-size="12" font-weight="700" fill="#1f1a1a" text-anchor="middle">N</text></g>
<text x="24" y="${H - 22}" font-size="12" fill="#8a7d75">Lines join the cities; the roads are longer. Hello My Cab</text>
</svg>`;
}
