/** "₹3,200" — grouped the Indian way. */
const money = (rupees: number) => `₹${Math.round(rupees).toLocaleString('en-IN')}`;

/**
 * A price, and — on a fixed route — the list price it is already below, struck through, with
 * the "10% off" it comes to (owner, 10 Oct 2026: the fare table's prices are 10% under the
 * list price). Display only: the price is what is charged, and Google's structured data and
 * the page titles carry only that (lib/schema.tsx).
 *
 * No list price (a per-km route, a local package, the discount switched off, an older
 * backend) → the price alone, exactly as before.
 */
export function PriceTag({
  price,
  listPrice,
  discountPercent,
  size = 'md',
  badge = true,
  className = '',
}: {
  price: number;
  listPrice?: number | null;
  discountPercent?: number | null;
  /** `lg` the vehicle cards, `md` a fare table, `sm` inline in a list. */
  size?: 'sm' | 'md' | 'lg';
  /** The "10% off" pill — off where a row of them would only be noise. */
  badge?: boolean;
  className?: string;
}) {
  const struck = listPrice && listPrice > price ? listPrice : null;
  const pct = struck ? discountPercent || Math.round((1 - price / struck) * 100) : 0;
  const priceClass =
    size === 'lg'
      ? 'text-title font-black'
      : size === 'md'
        ? 'font-display text-title'
        : 'font-semibold';
  const listClass = size === 'sm' ? 'text-label' : 'text-small';

  if (!struck) {
    return <span className={`${priceClass} tabular-nums ${className}`}>{money(price)}</span>;
  }
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 ${className}`}>
      <s className={`${listClass} tabular-nums text-faint`} aria-label={`was ${money(struck)}`}>
        {money(struck)}
      </s>
      <span className={`${priceClass} tabular-nums`} aria-label={`now ${money(price)}`}>
        {money(price)}
      </span>
      {badge ? (
        <span className="self-center rounded-full bg-success/10 px-1.5 py-0.5 text-label font-bold tracking-normal text-success">
          {pct}% off
        </span>
      ) : null}
    </span>
  );
}
