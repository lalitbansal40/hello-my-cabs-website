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
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : hint ? (
        <p className="text-sm text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

const control =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-base ' +
  'placeholder:text-faint focus:border-accent';

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: ComponentProps<'select'>) {
  return <select className={`${control} ${className}`} {...props} />;
}
