import { Icon } from '@/components/site/Icons';

/**
 * What the fare covers and what it does not.
 *
 * The single most common complaint about a cab booking is a number that grew on the way.
 * Saying the exclusions plainly, on the page, before anyone books, is worth more than any
 * assurance further up.
 */
export function Included({
  nightCharge,
  airportSurcharge,
}: {
  nightCharge?: number;
  airportSurcharge?: number;
}) {
  const included = ['Driver allowance', 'Fuel', 'GST'];
  const extra = [
    'Toll, as it arises',
    'Parking, as it arises',
    'State entry tax, where it applies',
    ...(nightCharge ? [`Night allowance ₹${nightCharge}, after 10 pm`] : []),
    ...(airportSurcharge ? [`Airport surcharge ₹${airportSurcharge}`] : []),
  ];

  return (
    <div className="mt-8 grid gap-8 sm:grid-cols-2">
      {[
        ['In the fare', included, 'text-accent', Icon.check],
        ['Paid separately', extra, 'text-clay', Icon.tag],
      ].map(([head, items, tone, Ico]) => {
        const I = Ico as typeof Icon.check;
        return (
          <div key={head as string}>
            <h3 className="font-bold text-label uppercase text-faint">
              {head as string}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {(items as string[]).map((t) => (
                <li key={t} className="flex text-body items-start gap-2.5 text-ink/85">
                  <I className={`mt-1 h-4 w-4 shrink-0 ${tone as string}`} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
