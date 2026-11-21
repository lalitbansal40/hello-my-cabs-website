import type { RouteInsights as Insights } from '@/lib/api';
import { vehicleName } from '@/lib/vehicle-name';
import { rupees } from '@/lib/seo';

/**
 * "On this route, from our own trips" — what Hello My Cab actually saw over the last 90 days
 * (backend services/routeInsights.ts, 20 Nov 2026, owner decision N4).
 *
 * Every line is drawn only when the backend sends it: a figure needs 20 trips behind it, so a
 * quiet route shows less, or nothing. Nothing here is written by hand and nothing is about a
 * person — counts, shares, a rounded fare range and a measured distance, with the date.
 */
export function RouteInsights({
  insights,
  title,
  labels,
}: {
  insights: Insights | null;
  title: string;
  /** Vehicle key → the name the catalogue serves today. */
  labels?: Record<string, string>;
}) {
  if (!insights) return null;
  const { demand, vehicleMix, fareRange, timeOfDay, weekendShare, distance, topDrops } = insights;
  const lines: Array<{ label: string; value: string }> = [];
  if (demand != null) {
    lines.push({
      label: insights.city ? 'Trips from here' : 'Trips on this route',
      value: `${demand.toLocaleString('en-IN')} bookings and driver requirements in the last ${insights.windowDays} days`,
    });
  }
  if (fareRange) {
    lines.push({
      label: 'What people usually paid',
      value: `${rupees(fareRange.lowRupees)} – ${rupees(fareRange.highRupees)} (the middle half of agent bookings)`,
    });
  }
  if (distance) {
    const h = Math.floor(distance.durationMin / 60);
    const m = distance.durationMin % 60;
    lines.push({
      label: 'Measured by road',
      value: `${distance.distanceKm} km, about ${h ? `${h} h ` : ''}${m ? `${m} min` : ''}`.trim(),
    });
  }
  if (timeOfDay) {
    const parts = (
      [
        ['morning', 'Morning (5–12)'],
        ['afternoon', 'Afternoon (12–5)'],
        ['evening', 'Evening (5–10)'],
        ['night', 'Night (10–5)'],
      ] as const
    )
      .map(([k, label]) => ({ label, share: timeOfDay[k] }))
      .filter((p) => p.share > 0)
      .sort((a, b) => b.share - a.share);
    if (parts.length) {
      lines.push({
        label: 'When trips start',
        value: parts.map((p) => `${p.label} ${p.share}%`).join(' · '),
      });
    }
  }
  if (weekendShare != null) {
    lines.push({ label: 'On weekends', value: `${weekendShare}% of trips` });
  }
  if (topDrops && topDrops.length) {
    lines.push({ label: 'Where trips from here go most', value: topDrops.join(', ') });
  }
  if (!lines.length && !(vehicleMix && vehicleMix.length)) return null;

  const asOf = new Date(insights.asOf).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  return (
    <section className="reveal section-gap" aria-labelledby="route-insights" data-route-insights>
      <h2 id="route-insights" className="font-display text-balance text-h2">
        {title}
      </h2>
      <div className="mt-8 grid gap-8 rounded-3xl border border-hmc-line bg-hmc-card p-6 sm:p-8 md:grid-cols-2">
        {lines.length ? (
          <dl className="grid gap-5">
            {lines.map((l) => (
              <div key={l.label}>
                <dt className="text-label font-bold uppercase text-hmc-label">{l.label}</dt>
                <dd className="mt-1 text-body text-hmc-content">{l.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {vehicleMix && vehicleMix.length ? (
          <div>
            <h3 className="text-label font-bold uppercase text-hmc-label">Cars asked for</h3>
            <ul className="mt-4 grid gap-3">
              {vehicleMix.map((v) => (
                <li key={v.vehicle} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
                  <span className="text-small text-hmc-content">{vehicleName(v.vehicle, labels)}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-hmc-line" aria-hidden="true">
                    <span className="block h-full rounded-full bg-hmc-primary" style={{ width: `${v.share}%` }} />
                  </span>
                  <span className="text-small font-semibold tabular-nums text-hmc-content">{v.share}%</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-small text-hmc-label">
        From Hello My Cab bookings and driver requirements, last {insights.windowDays} days, as of {asOf}
        {distance ? `; distance measured ${new Date(distance.measuredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}` : ''}.
      </p>
    </section>
  );
}
