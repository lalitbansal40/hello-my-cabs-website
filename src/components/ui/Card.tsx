import { ComponentProps } from 'react';

export function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`rounded-card border border-hmc-line bg-hmc-page p-5 ${className}`}
      {...props}
    />
  );
}

export function Badge({ className = '', ...props }: ComponentProps<'span'>) {
  return (
    <span
   className={`inline-flex items-center rounded-full border border-hmc-line px-3 py-1 text-label font-semibold ${className}`}
      {...props}
    />
  );
}
