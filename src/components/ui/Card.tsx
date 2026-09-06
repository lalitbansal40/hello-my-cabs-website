import { ComponentProps } from 'react';

export function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-5 ${className}`}
      {...props}
    />
  );
}

export function Badge({ className = '', ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-line px-3 py-1 text-xs font-semibold ${className}`}
      {...props}
    />
  );
}
