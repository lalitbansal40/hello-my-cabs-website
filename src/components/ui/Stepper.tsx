/** Where the customer is in the funnel. Four steps, and the last one is the OTP. */
const STEPS = ['Route', 'Vehicle', 'Details', 'Confirmed'] as const;

/**
 * `tone` exists because the funnel's masthead is dark now. The same component on ivory and
 * on forest needs two sets of colours; everything else about it is identical.
 */
export function Stepper({
  current,
  tone = 'light',
}: {
  current: number;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
  <ol className="flex flex-wrap items-center gap-2 text-small" aria-label="Booking steps">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={
        'flex h-7 w-7 items-center justify-center rounded-full text-label font-bold ' +
                (done
                  ? 'bg-accent text-forest'
                  : active
                    ? dark
                      ? 'bg-white text-forest'
                      : 'bg-ink text-white'
                    : dark
                      ? 'border border-white/25 text-white/45'
                      : 'border border-line text-faint')
              }
            >
              {done ? '✓' : i + 1}
            </span>
            <span
              className={
                active
                  ? 'font-semibold'
                  : dark
                    ? 'text-white/45'
                    : 'text-faint'
              }
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className={dark ? 'text-white/20' : 'text-line'}>—</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
