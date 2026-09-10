import { ComponentProps } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

const base =
 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-small min-h-11 font-bold ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest/90',
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
