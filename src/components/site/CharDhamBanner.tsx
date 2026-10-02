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

/**
 * Saffron sky, a low sun, two ranges of snow peaks and a temple at the front — drawn, not
 * traced. A CSS background rather than inline SVG: it is cropped to the banner's shape
 * (`cover`, anchored left where the temple is), and as a background its clipped edges are
 * not elements hanging past the screen's edge.
 */
const MOUNTAINS = `url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 640 320%22%3E%3Cdefs%3E%3ClinearGradient id=%22s%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%237a1d17%22/%3E%3Cstop offset=%22.55%22 stop-color=%22%23d0461f%22/%3E%3Cstop offset=%221%22 stop-color=%22%23f08a3c%22/%3E%3C/linearGradient%3E%3ClinearGradient id=%22f%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%238c3a2c%22/%3E%3Cstop offset=%221%22 stop-color=%22%236b2a20%22/%3E%3C/linearGradient%3E%3ClinearGradient id=%22n%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%234a1c17%22/%3E%3Cstop offset=%221%22 stop-color=%22%232a1210%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22640%22 height=%22320%22 fill=%22url%28%23s%29%22/%3E%3Ccircle cx=%22470%22 cy=%22118%22 r=%2254%22 fill=%22%23ffd27a%22 opacity=%22.9%22/%3E%3Ccircle cx=%22470%22 cy=%22118%22 r=%2280%22 fill=%22%23ffd27a%22 opacity=%22.15%22/%3E%3Cpath d=%22M0 190 70 120l50 40 70-90 70 80 60-55 70 70 70-60 70 65 70-50 40 30v170H0Z%22 fill=%22url%28%23f%29%22/%3E%3Cpath d=%22m190 70-25 31 15-5 12 10 11-11 13 6Zm130 25-20 24 14-4 9 9 10-10 9 5Zm140 10-20 23 14-4 9 8 9-9 9 5ZM70 120l-15 16 11-3 7 6 8-6 7 4Z%22 fill=%22%23fff4ec%22/%3E%3Cpath d=%22m0 250 90-65 80 45 80-55 80 60 90-45 100 50 120-40v120H0Z%22 fill=%22url%28%23n%29%22/%3E%3Cg fill=%22%231a0d0c%22%3E%3Crect x=%22186%22 y=%22286%22 width=%22148%22 height=%2210%22/%3E%3Crect x=%22196%22 y=%22276%22 width=%22128%22 height=%2210%22/%3E%3Crect x=%22206%22 y=%22226%22 width=%22108%22 height=%2250%22/%3E%3Cpath d=%22M216 226c0-50 30-78 44-100 14 22 44 50 44 100Z%22/%3E%3Crect x=%22252%22 y=%22112%22 width=%2216%22 height=%2216%22 rx=%223%22/%3E%3Crect x=%22258.5%22 y=%2284%22 width=%223%22 height=%2230%22/%3E%3C/g%3E%3Cpath d=%22m261.5 84 22.5 7-22.5 7Z%22 fill=%22%23ff9b3d%22/%3E%3Cpath d=%22M248 276v-26a12 12 0 0 1 24 0v26Z%22 fill=%22%23ff9b3d%22 opacity=%22.55%22/%3E%3Crect y=%22296%22 width=%22640%22 height=%2224%22 fill=%22%23120807%22/%3E%3C/svg%3E")`;

function Mountains() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-20 bg-cover bg-left"
      style={{ backgroundImage: MOUNTAINS }}
    />
  );
}
