/** Where the customer is in the funnel. Four steps, and the last one is the OTP. */
const STEPS = ['Route', 'Gaadi', 'Details', 'Confirm'] as const;

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm" aria-label="Booking steps">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ' +
                (done
                  ? 'bg-accent text-white'
                  : active
                    ? 'bg-ink text-white'
                    : 'border border-line text-faint')
              }
            >
              {done ? '✓' : i + 1}
            </span>
            <span className={active ? 'font-semibold' : 'text-faint'}>{label}</span>
            {i < STEPS.length - 1 ? <span className="text-line">—</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
