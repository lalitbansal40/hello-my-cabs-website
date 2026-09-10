import type { OnewayFare, RoundtripFare, Vehicle } from '@/lib/api';

/**
 * Every vehicle, both trip types — as a table where there is room for one, and as a card
 * per vehicle where there is not.
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
      };
    })
    .filter((r) => r.oneWay !== null || r.roundTrip !== null);

  if (rows.length === 0) return null;

  const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const seats = (r: (typeof rows)[number]) =>
    [r.seats ? `${r.seats} seats` : null, r.roundOnly ? 'round trip only' : null]
      .filter(Boolean)
      .join(' · ');
  // Saying why a price is missing is more useful than a dash.
  const missing = (r: (typeof rows)[number], trip: 'oneWay' | 'roundTrip') =>
    trip === 'oneWay' && r.roundOnly ? 'Not on one way' : '—';

  return (
    <>
      {/* Phone: a card per vehicle, both prices labelled and in view. */}
      <ul className="mt-8 flex flex-col gap-3 sm:hidden">
        {rows.map((r) => (
          <li key={r.key} className="rounded-2xl border border-line bg-surface-raised p-5">
            <p className="font-display text-title">{r.label}</p>
            <p className="mt-0.5 text-small text-muted">{seats(r)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4">
              {(
                [
                  ['One way', r.oneWay, 'oneWay'],
                  ['Round trip', r.roundTrip, 'roundTrip'],
                ] as const
              ).map(([name, value, trip]) => (
                <div key={name}>
                  <dt className="text-label font-bold uppercase text-faint">{name}</dt>
                  <dd className="mt-1">
                    {value ? (
                      <span className="font-display text-title">{rupees(value)}</span>
                    ) : (
                      <span className="text-small text-faint">{missing(r, trip)}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {/* Wider: the table, where comparing across rows is the point. */}
      <div className="mt-8 hidden sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {['Vehicle', 'One way', 'Round trip'].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`pb-4 text-label font-bold uppercase text-faint ${i > 0 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-line last:border-0">
                <th scope="row" className="py-5 pr-4 font-normal">
                  <span className="font-display text-title">{r.label}</span>
                  <span className="mt-1 block text-small text-muted">{seats(r)}</span>
                </th>
                {([r.oneWay, r.roundTrip] as const).map((value, i) => (
                  <td key={i} className="py-5 text-right">
                    {value ? (
                      <span className="font-display text-title">{rupees(value)}</span>
                    ) : (
                      <span className="text-small text-faint">
                        {missing(r, i === 0 ? 'oneWay' : 'roundTrip')}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
