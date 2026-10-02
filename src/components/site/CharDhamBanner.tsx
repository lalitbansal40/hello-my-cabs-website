import Image from 'next/image';
import Link from 'next/link';

/**
 * The Char Dham banner — on the home page beside the booking card, and at the top of the
 * Char Dham page.
 *
 * The picture is an illustration drawn here, not a photograph: we have no photograph of
 * the temples of our own, and a stock picture captioned "Kedarnath" that is not Kedarnath
 * is a lie on the page (lib/images.ts). It is 2 kB of SVG — nothing for the first paint
 * to wait on. When the owner sends a real photograph, pass it as `photo` and it takes the
 * illustration's place; nothing else changes.
 */
export function CharDhamBanner({
  photo,
  heading = 'h2',
  showButton = true,
  className = '',
}: {
  /** A real photograph of the yatra (public/img/…). Replaces the illustration. */
  photo?: string;
  /** `h1` on the Char Dham page, where this banner is the page's title. */
  heading?: 'h1' | 'h2';
  showButton?: boolean;
  className?: string;
}) {
  const H = heading;
  return (
    <section
      aria-label="Char Dham Yatra"
      className={`relative isolate flex min-h-[15rem] overflow-hidden rounded-3xl bg-[#7a1d17] shadow-[var(--shadow-lift)] sm:min-h-[17rem] ${className}`}
    >
      {photo ? (
        <Image src={photo} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="-z-10 object-cover" />
      ) : (
        <Mountains />
      )}
      {/* The words sit on the right, over a dark wash — white on it is well over 4.5 at
          every width. On a phone the wash comes up from the bottom instead, where the
          words are. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent sm:bg-gradient-to-l sm:from-black/80 sm:via-black/45"
      />
      <div className="ml-auto flex w-full flex-col items-start justify-end gap-2 p-5 text-white sm:w-[62%] sm:items-end sm:justify-center sm:p-7 sm:text-right">
        <span className="rounded-full bg-ink px-3 py-1 text-label font-black uppercase tracking-[0.18em] text-white ring-1 ring-white/25">
          ★ Exclusive ★
        </span>
        <H className="font-display text-h3 uppercase leading-tight sm:text-title-lg">
          Char Dham <span className="text-[#ffd27a]">Yatra</span>
        </H>
        <p className="max-w-xs text-small font-medium text-white sm:text-body">
          Yamunotri, Gangotri, Kedarnath, Badrinath — by cab, with a driver who knows the hills.
        </p>
        {showButton ? (
          <Link
            href="/char-dham-yatra"
            className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-small font-black uppercase tracking-wide text-accent shadow-[var(--shadow-soft)] transition-colors hover:bg-accent hover:text-white"
          >
            Book now
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/** Saffron sky, a low sun, two ranges of snow peaks and a temple at the front. Drawn, not traced. */
function Mountains() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 640 320"
      preserveAspectRatio="xMinYMid slice"
      className="absolute inset-0 -z-20 h-full w-full"
    >
      <defs>
        <linearGradient id="dham-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a1d17" />
          <stop offset=".55" stopColor="#d0461f" />
          <stop offset="1" stopColor="#f08a3c" />
        </linearGradient>
        <linearGradient id="dham-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8c3a2c" />
          <stop offset="1" stopColor="#6b2a20" />
        </linearGradient>
        <linearGradient id="dham-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a1c17" />
          <stop offset="1" stopColor="#2a1210" />
        </linearGradient>
      </defs>
      <rect width="640" height="320" fill="url(#dham-sky)" />
      <circle cx="470" cy="118" r="54" fill="#ffd27a" opacity=".9" />
      <circle cx="470" cy="118" r="80" fill="#ffd27a" opacity=".15" />
      <path d="M0 190 70 120l50 40 70-90 70 80 60-55 70 70 70-60 70 65 70-50 40 30v170H0Z" fill="url(#dham-far)" />
      <path
        d="m190 70-25 31 15-5 12 10 11-11 13 6Zm130 25-20 24 14-4 9 9 10-10 9 5Zm140 10-20 23 14-4 9 8 9-9 9 5ZM70 120l-15 16 11-3 7 6 8-6 7 4Z"
        fill="#fff4ec"
      />
      <path d="m0 250 90-65 80 45 80-55 80 60 90-45 100 50 120-40v120H0Z" fill="url(#dham-near)" />
      <g fill="#1a0d0c">
        <rect x="186" y="286" width="148" height="10" />
        <rect x="196" y="276" width="128" height="10" />
        <rect x="206" y="226" width="108" height="50" />
        <path d="M216 226c0-50 30-78 44-100 14 22 44 50 44 100Z" />
        <rect x="252" y="112" width="16" height="16" rx="3" />
        <rect x="258.5" y="84" width="3" height="30" />
      </g>
      <path d="m261.5 84 22.5 7-22.5 7Z" fill="#ff9b3d" />
      <path d="M248 276v-26a12 12 0 0 1 24 0v26Z" fill="#ff9b3d" opacity=".55" />
      <rect y="296" width="640" height="24" fill="#120807" />
    </svg>
  );
}
