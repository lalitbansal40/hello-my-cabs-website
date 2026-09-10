import { Icon } from '../site/Icons';
import { formatWhen } from '@/lib/when';

/**
 * The trip being booked, repeated on the step that asks for money.
 *
 * The details page said "Your details" and nothing else. Somebody arrives there having
 * chosen a route, a time and a vehicle across two previous screens, and is asked for a
 * phone number with no reminder of what any of it was — at the exact point they are
 * deciding whether to go through with it. The shell already says the summary is "the one
 * thing worth repeating at every step"; this is that.
 *
 * The fare is here because it is the answer to the question actually being weighed. It
 * rides down from the quote rather than being recomputed: a second calculation would be a
 * second chance to disagree with the one the customer was shown.
 */
export function TripSummary({
  pickup,
  drop,
  when,
  returnWhen,
  vehicleLabel,
  fareRupees,
  hours,
  changeHref,
}: {
  pickup: string;
  drop?: string;
  when: string;
  returnWhen?: string;
  vehicleLabel?: string;
  fareRupees?: number;
  hours?: number;
  changeHref?: string;
}) {
  return (
    <section className="mb-8 rounded-2xl border border-line bg-surface-alt p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex text-title flex-wrap items-center gap-x-2 gap-y-1 font-bold">
            <span>{pickup}</span>
            {drop ? (
              <>
                <Icon.arrow className="h-4 w-4 shrink-0 text-muted" />
                <span>{drop}</span>
              </>
            ) : hours ? (
              <span className="text-muted">· {hours} hours</span>
            ) : null}
          </p>

          <dl className="mt-3 text-small space-y-1.5 text-ink-soft">
            <Line label="Pickup" value={formatWhen(when)} />
            {returnWhen ? <Line label="Return" value={formatWhen(returnWhen)} /> : null}
            {vehicleLabel ? <Line label="Vehicle" value={vehicleLabel} /> : null}
          </dl>
        </div>

        {fareRupees ? (
          <div className="shrink-0 text-right">
            <p className="font-display text-title-lg">
              ₹{fareRupees.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-label font-semibold uppercase text-faint">
              Fixed
            </p>
          </div>
        ) : null}
      </div>

      {changeHref ? (
        // A summary somebody cannot act on is decoration. If it is wrong, this is the way
        // back — and knowing the way back is most of what makes the summary reassuring.
        <a
          href={changeHref}
          className="mt-4 text-small inline-block font-semibold text-accent underline-offset-4 hover:underline inline-flex min-h-11 items-center"
        >
          Change something
        </a>
      ) : null}
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-[4.5rem] shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 font-medium">{value}</dd>
    </div>
  );
}

