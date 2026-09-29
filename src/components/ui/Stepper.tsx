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
                  'flex h-7 w-7 items-center justify-center rounded-full text-label font-bold transition-colors duration-300 ' +
                  (done
                    ? 'bg-accent text-forest'
                    : active
                      ? (dark ? 'bg-white text-forest' : 'bg-ink text-white') +
                        ' ring-2 ring-accent/30'
                      : dark
                        ? 'border border-white/25 text-white/45'
                        : 'border border-line text-faint')
                }
              >
                {done ? (
                  // Drawn rather than typed. A ✓ character simply appears; a stroke that
                  // draws itself is the difference between "this is done" and "this was
                  // always done". Where motion is off the path is there, fully drawn.
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                    <path
                      className="tick-draw"
                      d="M5 12.5 10 17.5 19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={active ? 'font-semibold' : dark ? 'text-white/45' : 'text-faint'}>
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                // The dash used to be one dead colour the whole way across, so on a laptop
                // the only sign of progress was which circle was filled. Now the run behind
                // you is the accent, and it fills as you go.
                <span
                  className={
                    'transition-colors duration-500 ' +
                    (done ? 'text-accent' : dark ? 'text-white/20' : 'text-line')
                  }
                >
                  —
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}
