/**
 * Inline SVGs rather than an icon package. A dependency for eleven shapes costs a download
 * on every visit, and these need to inherit colour and stroke weight from their context.
 */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Icon = {
  pin: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  dot: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  clock: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </svg>
  ),
  arrow: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  ),
  shield: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M12 3 5 6v6c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  tag: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  headset: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.6" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.6" />
      <path d="M19.5 19v.5a2.5 2.5 0 0 1-2.5 2.5h-3" />
    </svg>
  ),
  car: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M4 16v-3.2L6 8h12l2 4.8V16" />
      <path d="M3 16h18" />
      <circle cx="7.5" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
    </svg>
  ),
  star: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" stroke="none">
      <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" />
    </svg>
  ),
  check: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  ),
  route: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <circle cx="6" cy="18" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <path d="M8.4 18h5.1a3 3 0 0 0 0-6H10.5a3 3 0 0 1 0-6h5.1" />
    </svg>
  ),
};
