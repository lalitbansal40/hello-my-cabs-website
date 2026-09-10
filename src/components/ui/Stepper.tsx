/** Where the customer is in the funnel. Four steps, and the last one is the OTP. */
const STEPS = ['Route', 'Vehicle', 'Details', 'Confirmed'] as const;

/**
 * `tone` exists because the funnel's masthead is dark now. The same component on ivory and
 * on forest needs two sets of colours; everything else about it is identical.
 *
 * Two forms, because four numbered steps do not fit across a phone: they wrapped, and
 * "Confirmed" dropped onto a line of its own under a dangling dash. Below `sm` the same
 * fact is one line — where you are, of how many, and what this step is called — over a bar
 * that fills as you go. From `sm` up it is the full list it always was.
 */
export function Stepper({
  current,
  tone = 'light',
}: {
  current: number;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  const pct = ((current + 1) / STEPS.length) * 100;

  return (
    <>
      {/* The list below carries this for a screen reader, on every width. The compact form
          is a second drawing of the same thing, so it is hidden from them. */}
      <div className="sm:hidden" aria-hidden>
        <p className="flex items-baseline gap-2 text-small">
          <span className={dark ? 'text-white/45' : 'text-faint'}>
            Step {current + 1} of {STEPS.length}
          </span>
          <span className="font-semibold">{STEPS[current]}</span>
        </p>
        <div className={`mt-2 h-1 rounded-full ${dark ? 'bg-white/15' : 'bg-line'}`}>
          <div
            className={`h-1 rounded-full transition-[width] duration-500 ${dark ? 'bg-accent' : 'bg-ink'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* sr-only rather than hidden: `display:none` would take the steps away from a screen
          reader on a phone, and the compact form above is hidden from them. */}
      <ol
        className="sr-only flex-wrap items-center gap-2 text-small sm:not-sr-only sm:flex"
        aria-label="Booking steps"
      >
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
              <span className={active ? 'font-semibold' : dark ? 'text-white/45' : 'text-faint'}>
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className={dark ? 'text-white/20' : 'text-line'}>—</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}
