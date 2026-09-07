import type { OnewayFare, RoundtripFare, Vehicle } from '@/lib/api';

/**
 * Every vehicle, both trip types, in one table.
 *
 * This is the reason a route page is worth having: a visitor comparing operators wants the
 * whole grid at once, and a search engine wants a page that says something no other page
 * says. Two separate tables would make them scroll to compare the only two numbers that
 * matter to them.
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
  const rows = vehicles.map((v) => {
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
  }).filter((r) => r.oneWay !== null || r.roundTrip !== null);

  if (rows.length === 0) return null;

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {['Vehicle', 'One way', 'Round trip'].map((h, i) => (
              <th
                key={h}
                className={
                  'pb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-faint ' +
                  (i > 0 ? 'text-right' : '')
                }
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-line last:border-0">
              <td className="py-5">
                <span className="font-display text-[1.15rem] leading-tight tracking-[-0.02em]">
                  {r.label}
                </span>
                <span className="mt-1 block text-[13px] text-muted">
                  {r.seats ? `${r.seats} seats` : 'Up to 4 seats'}
                  {r.roundOnly ? ' · round trip only' : ''}
                </span>
              </td>
              <td className="py-5 text-right">
                {r.oneWay ? (
                  <span className="font-display text-[1.35rem] tracking-tight">
                    ₹{r.oneWay.toLocaleString('en-IN')}
                  </span>
                ) : (
                  /* Saying why it is blank is more useful than an em dash. */
                  <span className="text-[13px] text-faint">Not on one way</span>
                )}
              </td>
              <td className="py-5 text-right">
                {r.roundTrip ? (
                  <span className="font-display text-[1.35rem] tracking-tight">
                    ₹{r.roundTrip.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-[13px] text-faint">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
