import { ComponentProps, ReactNode } from 'react';

/**
 * A labelled control. The label is a real <label>, tied by id — a placeholder is not a
 * label: it disappears the moment somebody types, and screen readers skip it.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* The same micro-caps label the booking widget puts over From and To, so a form
          field reads the same wherever it appears. */}
      <label htmlFor={htmlFor} className="text-label font-bold uppercase text-muted">
        {label}
      </label>
      {children}
      {error ? (
    <p className="text-small text-danger">{error}</p>
      ) : hint ? (
    <p className="text-small text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

const control =
 'w-full rounded-xl border border-line bg-surface px-4 py-3 text-body ' +
  'placeholder:text-faint focus:border-accent';

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: ComponentProps<'select'>) {
  return <select className={`${control} ${className}`} {...props} />;
}

/**
 * The ten digits, with the country code printed beside them rather than typed.
 *
 * Every number this site sends carries 91 in front of it, but nothing on screen said so —
 * people typed +91 into the box themselves, or wondered whether they should have. The
 * prefix is decoration: the input still holds ten digits and `toApiPhone` still adds the
 * code.
 */
export function PhoneInput({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-body font-medium text-faint"
      >
        +91
      </span>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        className={`${control} pl-14 tabular-nums ${className}`}
        {...props}
      />
    </div>
  );
}
