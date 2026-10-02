/**
 * The company's logo: a car drawn in one red line, the windscreen in black, and the name
 * underneath — the hellomycab.com mark the owner sent on 2 Oct 2026.
 *
 * Drawn here as SVG rather than shipped as the image: the only copy we have is a
 * screenshot, and at header size a raster that small turns to a red smudge. A path is
 * sharp at every size and costs nothing to download. If the original artwork turns up,
 * it replaces these paths and nothing else changes.
 *
 * The colours are the brand tokens, so the mark follows the theme rather than holding its
 * own copy of the red.
 */

/** The car, on its own. 4:1 — give it a width and let the height follow. */
export function CarMark({
  className = '',
  tone = 'light',
}: {
  className?: string;
  /** `dark` = drawn on the black footer: the windscreen goes white so it does not vanish. */
  tone?: 'light' | 'dark';
}) {
  const red = 'var(--color-accent)';
  const glass = tone === 'dark' ? '#ffffff' : 'var(--color-ink)';
  return (
    <svg viewBox="0 0 120 30" className={className} aria-hidden>
      {/* The roof: a crescent, thickest at the crown, thin where it meets the body. */}
      <path d="M10 14.2C32 .2 80-1.4 114 16.8 82 5 34 5.4 10 15.8Z" fill={red} />
      <path d="M28.5 14.2C42 3.6 78 3.6 94 14.6Z" fill={glass} />
      {/* The waist line, heavy at the tail and running out to a point at the nose. */}
      <path d="M3 14.2 104 16l14 2.2-14-.2-101 .4Z" fill={red} />
      <path d="M5.5 6.8 11.5 6.6 20 14.6h-5.2Z" fill={red} />
      <path d="M14.5 19.4c9.5.6 18 3.2 23 7.6-6.5-3.2-14.5-5.2-23-5.9Z" fill={red} />
      <path d="M100.5 19.6c7.5.8 13.3 3.2 16.5 7.4-4.6-3-10.4-4.9-16.5-5.8Z" fill={red} />
    </svg>
  );
}

/**
 * The logo as the header and footer carry it: the car over the name.
 *
 * The name is text, not part of the drawing — sharp, selectable, and read as one name by a
 * screen reader. "my" and ".com" are red as in the logo; the rest is ink, or white on the
 * black footer (`tone="dark"`).
 */
export function Wordmark({
  className = '',
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const ink = tone === 'dark' ? 'text-white' : 'text-ink';
  return (
    <span
      role="img"
      aria-label="Hello My Cab"
      className={`inline-flex flex-col items-start leading-none ${className}`}
    >
      <CarMark tone={tone} className="-mb-0.5 h-auto w-[7.25rem] sm:w-[8.5rem]" />
      {/* Never across two lines: at 360px the old wordmark broke in two, and a logo that
          wraps reads as a broken header. */}
      <span
        aria-hidden
        className={`whitespace-nowrap text-[1.15rem] font-medium tracking-[-0.02em] sm:text-[1.35rem] ${ink}`}
      >
        hello<span className="text-accent">my</span>cab
        <span className="text-[0.8em] text-accent">.com</span>
      </span>
    </span>
  );
}

/**
 * The divider between sections: a hairline with the car on it — enough to stop two
 * sections reading as one long scroll, without another full-width band.
 */
export function MarkDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-5 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-line" />
      <CarMark className="h-auto w-12 opacity-60" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
