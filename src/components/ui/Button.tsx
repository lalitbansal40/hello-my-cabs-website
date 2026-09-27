import { ComponentProps } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

/**
 * `active:scale` is not decoration. On a slow connection the answer to a tap is seconds
 * away, and a button that does nothing under the finger reads as a button that did not
 * register — which is how one booking becomes three.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-small min-h-11 font-bold ' +
  'transition-all duration-200 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-forest text-white hover:bg-forest/90 hover:-translate-y-0.5 ' +
    'hover:shadow-[0_10px_28px_-10px_rgba(0,194,110,0.55)] motion-reduce:hover:translate-y-0',
  ghost: 'border border-line bg-surface text-ink hover:bg-surface-alt',
  danger: 'bg-danger text-white hover:opacity-90',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ComponentProps<'button'> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
