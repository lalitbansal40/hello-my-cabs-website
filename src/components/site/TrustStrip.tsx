import { Icon } from './Icons';

/**
 * The band under the hero: what this company is, in five figures you can check.
 *
 * Every number is counted from the live catalogue and passed in by the page — nothing here
 * is a round number somebody liked the look of. A strip like this is usually where a site
 * puts "10,000+ happy customers", and that is exactly why a visitor's eye slides off it.
 *
 * It scrolls sideways on a phone rather than wrapping into three ragged lines.
 */
export function TrustStrip({
  cities,
  routes,
  vehicles,
}: {
  cities: number;
  routes: number;
  vehicles: number;
}) {
  const items = [
    { icon: Icon.car, label: `${vehicles} vehicle types` },
    { icon: Icon.pin, label: `${cities.toLocaleString('en-IN')} cities` },
    { icon: Icon.route, label: `${routes.toLocaleString('en-IN')} priced routes` },
    { icon: Icon.headset, label: '24×7 support' },
    { icon: Icon.tag, label: 'Fixed fare, no surprises' },
    { icon: Icon.shield, label: 'Verified drivers' },
  ];

  return (
    <div className="border-b border-line bg-surface-alt/60">
      <ul className="mx-auto flex max-w-6xl 2xl:max-w-7xl gap-7 overflow-x-auto px-5 py-4 text-small font-semibold text-muted [scrollbar-width:none] sm:justify-center sm:gap-10 [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <li key={it.label} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <it.icon className="h-4 w-4 text-accent" />
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
