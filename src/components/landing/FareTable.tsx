import type { OnewayFare, RoundtripFare, Vehicle } from '@/lib/api';
import { VehicleArt } from '../site/VehicleArt';
import { PriceTag } from '../ui/PriceTag';

/**
 * Every vehicle, both trip types, in one table.
 *
 * On a phone this used to be the same table inside a horizontal scroller, 544px wide on a
 * 375px screen. What showed was a column of vehicle names; the one-way and round-trip
 * prices sat off to the right with nothing to say they were there. A route page exists to
 * show a price, and on the device most of its visitors use it showed none.
 *
 * Both forms render on the server from the same rows, so the figures are in the HTML for
 * a crawler and can never disagree with each other. The one that does not fit is
 * display:none, which also keeps a screen reader from hearing every price twice.
 */
export function FareTable({
  oneway,
  roundtrip,
  vehicles,
}: {
  oneway: OnewayFare | null;
  roundtrip: RoundtripFare | null;
  vehicles: Vehicle[];
}) {
  const rows = vehicles
    .map((v) => {
      const ow = oneway?.vehicles.find((x) => x.key === v.key);
      const rt = roundtrip?.vehicles.find((x) => x.key === v.key);
      return {
        key: v.key,
        label: v.label,
        seats: v.seats,
        roundOnly: v.tripTypes.length === 1,
        oneWay: ow ? (ow.total ?? ow.fare) : null,
        roundTrip: rt ? rt.fare : null,
        // The list prices these are already below — fixed routes only (10 Oct 2026).
        oneWayList: ow?.listPrice ?? null,
        roundTripList: rt?.listPrice ?? null,
      };
    })
    .filter((r) => r.oneWay !== null || r.roundTrip !== null);

  if (rows.length === 0) return null;

  // The discount the struck prices show — 0 on a per-km route or with it switched off.
  const pct = oneway?.discountPercent || roundtrip?.discountPercent || 0;
  const seats = (r: (typeof rows)[number]) =>
    [r.seats ? `${r.seats} seats` : null, r.roundOnly ? 'round trip only' : null]
      .filter(Boolean)
      .join(' · ');
  // Saying why a price is missing is more useful than a dash.
  const missing = (r: (typeof rows)[number], trip: 'oneWay' | 'roundTrip') =>
    trip === 'oneWay' && r.roundOnly ? 'Not on one way' : '—';

  return (
    <>
      {/* One table for every screen (27 Nov 2026, docs/seo/PROMPT_INDEX_RANK_27NOV.md Step 3):
          the phone cards and the wide table used to both be in the HTML, one hidden by CSS —
          every price twice, and the same labels ("One way", "Round trip", "Book this route")
          repeated per car, which made route pages read alike. Three columns fit a 360px
          screen: the car and its seats, then the two prices stacked (list price above the
          fare). `data-fare-rows` is what scripts/launch-check.sh and audit/seo.mjs look for. */}
      <div role="region" aria-label="Vehicle fares" className="mt-8" data-fare-rows={rows.length}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hmc-line">
              {['Car', 'One way', 'Round trip'].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`pb-3 text-label font-bold uppercase text-hmc-label ${i > 0 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-hmc-line last:border-0">
                <th scope="row" className="py-4 pr-3 font-normal">
                  <span className="flex items-center gap-3 sm:gap-4">
                    <VehicleArt
                      vehicleKey={r.key}
                      label={r.label}
                      className="hidden h-9 w-[5.5rem] shrink-0 sm:block"
                      photoSizes="5.5rem"
                    />
                    <span>
                      <span className="font-display text-body font-bold sm:text-title">{r.label}</span>
                      <span className="mt-0.5 block text-small text-hmc-secondary">{seats(r)}</span>
                    </span>
                  </span>
                </th>
                {(
                  [
                    [r.oneWay, r.oneWayList, 'oneWay'],
                    [r.roundTrip, r.roundTripList, 'roundTrip'],
                  ] as const
                ).map(([value, list, trip]) => (
                  <td key={trip} className="py-4 pl-2 text-right align-middle">
                    {value ? (
                      <PriceTag
                        price={value}
                        listPrice={list}
                        discountPercent={pct}
                        badge={false}
                        className="flex-col items-end justify-end sm:flex-row sm:items-baseline"
                      />
                    ) : (
                      <span className="text-small text-hmc-label">{missing(r, trip)}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* One way to the booking card at the top, already set to this route. */}
        <a
          href="#book"
          className="mt-5 inline-flex min-h-12 items-center rounded-full bg-hmc-primary px-6 font-semibold text-white hover:bg-hmc-primary-hover"
        >
          Book this route
        </a>
      </div>
      {/* GST is on top of these (10 Oct 2026) — said once, under both forms; and the
          discount the struck prices show, said once rather than a pill on every price. */}
      <p className="mt-4 text-small text-hmc-secondary">
        {pct ? `Struck prices are the list fares — every fare here is already ${pct}% off. ` : ''}
        Fares are plus {oneway?.gstPercent ?? roundtrip?.gstPercent ?? 5}% GST.{' '}
        {/* A fixed route's one-way toll is added on the bill (12 Oct 2026). */}
        {oneway && !oneway.perKm && oneway.vehicles.some((v) => (v.tollRupees ?? 0) > 0)
          ? 'One way, the route’s toll is added on the bill; on a round trip, toll is paid on the road. Parking and state tax are paid as they come.'
          : 'Toll, parking and state tax are paid as they come.'}
      </p>
    </>
  );
}
