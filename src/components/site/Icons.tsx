/**
 * Inline SVGs rather than an icon package. A dependency for two dozen shapes costs a download
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
  /** A car with the roof sign — "cab", where `car` is just a vehicle. */
  taxi: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M9.5 6.5h5l-.6-2h-3.8l-.6 2Z" />
      <path d="M4 16.5v-3.4L6 9h12l2 4.1v3.4" />
      <path d="M3 16.5h18M8 13h.01M16 13h.01" />
      <circle cx="7.5" cy="18" r="1.6" />
      <circle cx="16.5" cy="18" r="1.6" />
    </svg>
  ),
  /** A temple: the spire, the flag on top, steps below. Drawn, not traced from a photo. */
  temple: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M12 2.5v3M12 2.5l3 1.2-3 1.2" />
      <path d="M8 13c0-4 2-6.5 4-7.5 2 1 4 3.5 4 7.5" />
      <path d="M5.5 13h13M6.5 13v6.5M17.5 13v6.5M3.5 21h17M10.5 21v-4.5a1.5 1.5 0 0 1 3 0V21" />
    </svg>
  ),
  diamond: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M6.5 4h11L21 9l-9 11L3 9l3.5-5Z" />
      <path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" />
    </svg>
  ),
  /** A tempo traveller — long, tall, many windows. */
  van: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M2.5 16.5V7.5a1.5 1.5 0 0 1 1.5-1.5h12.5l4 5v5.5" />
      <path d="M2 16.5h19.5M5.5 10h3M11 10h3.5M16.5 10l2.5.1" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  ),
  /** Two arrows, up and down — swap pickup and drop. */
  swap: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M8 20V5M4.5 8.5 8 5l3.5 3.5M16 4v15M12.5 15.5 16 19l3.5-3.5" />
    </svg>
  ),
  calendar: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  ),
  plus: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  x: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  phone: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6V17a2.5 2.5 0 0 1-2.5 2.5A15.5 15.5 0 0 1 2.5 6 2.5 2.5 0 0 1 5 3.5Z" />
    </svg>
  ),
  /** The WhatsApp glyph, filled — the same path the floating button uses. */
  whatsapp: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" stroke="none">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  ),
  /** A loop of two arrows — a round trip. */
  loop: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M4 10a8 8 0 0 1 14.2-4.5L20 7.5M20 3.5v4h-4" />
      <path d="M20 14a8 8 0 0 1-14.2 4.5L4 16.5M4 20.5v-4h4" />
    </svg>
  ),
  qr: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />
    </svg>
  ),
  card: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  ),
};
