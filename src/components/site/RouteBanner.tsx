import { cityImage } from '@/content/city-images';
import { cityTitle } from '@/lib/slug';
import { Icon } from './Icons';
import { CityPhoto } from './CityPhoto';

/** Height of each photo, by where it sits: a page's masthead, or the summary card. */
const SIZES = {
  // 96px on a phone, 160px from sm up — the masthead of the fares page and the route pages.
  lg: {
    box: 'h-24 w-32 sm:h-40 sm:w-[13.375rem]',
    sizes: '(min-width: 640px) 214px, 128px',
  },
  // The trip summary on the details step: one small row above the trip.
  sm: { box: 'h-16 w-[5.375rem] sm:h-20 sm:w-[6.75rem]', sizes: '108px' },
} as const;

/**
 * Three or four cities (a trip through stops, 12 Oct 2026) in the same row: smaller, so the
 * row still fits a 360px phone with its arrows — 3 × 84px or 4 × 64px — and grows from sm up.
 */
const MANY = {
  lg: {
    3: { box: 'h-16 w-[5.25rem] sm:h-28 sm:w-[9.5rem]', sizes: '(min-width: 640px) 152px, 84px' },
    4: { box: 'h-[2.625rem] w-14 sm:h-24 sm:w-32', sizes: '(min-width: 640px) 128px, 56px' },
  },
  sm: {
    3: { box: 'h-14 w-[4.75rem] sm:h-16 sm:w-[5.375rem]', sizes: '86px' },
    4: { box: 'h-[2.625rem] w-14 sm:h-14 sm:w-[4.75rem]', sizes: '76px' },
  },
} as const;

/**
 * A photograph of each end of the trip beside its name — Hawa Mahal for Jaipur, India Gate
 * for Delhi (owner, 10 Oct 2026). A city with no photo shows nothing on its side; a local
 * trip, with no drop, shows the one.
 *
 * Never the page's Largest Contentful Paint, and never in its way: the photos are small next
 * to the heading, fetched only once the page has loaded (CityPhoto), and sized up front so
 * nothing moves when they arrive (the 29 Sep 2026 hero photo that became the LCP is the
 * warning — RoutePage.tsx). Credits for
 * every photo are on /photo-credits (content/city-images.ts).
 */
export function RouteBanner({
  pickup,
  drop,
  stops = [],
  size = 'lg',
  tone = 'dark',
  className = '',
}: {
  pickup: string;
  drop?: string;
  /** Cities on the way, in order (keys) — each with its photo between the two ends. */
  stops?: string[];
  size?: keyof typeof SIZES;
  /** `dark` on the red-black mastheads, `light` on a card. */
  tone?: 'dark' | 'light';
  className?: string;
}) {
  // Only the cities that have a photo — and an arrow only between two of them.
  const ends = [pickup, ...(drop ? stops : []), drop]
    .filter((k): k is string => Boolean(k))
    .map((key) => ({ key, img: cityImage(key) }))
    .filter((e): e is { key: string; img: NonNullable<typeof e.img> } =>
      Boolean(e.img),
    );
  if (!ends.length) return null;

  const n = Math.min(ends.length, 4);
  const s = n >= 3 ? MANY[size][n as 3 | 4] : SIZES[size];
  const caption = tone === 'dark' ? 'text-white/70' : 'text-muted';

  return (
    <div className={`flex items-center ${n >= 3 ? 'gap-1.5 sm:gap-3' : 'gap-3 sm:gap-4'} ${className}`}>
      {ends.slice(0, 4).map(({ key, img }, i) => (
        <div key={key} className="contents">
          {i > 0 ? (
            <Icon.arrow
              className={`${n >= 3 ? 'h-4 w-4' : 'h-5 w-5'} shrink-0 ${tone === 'dark' ? 'text-white/50' : 'text-faint'}`}
            />
          ) : null}
          <figure className="m-0 shrink-0">
            <CityPhoto
              src={img.file}
              alt={img.alt}
              sizes={s.sizes}
              className={`${s.box} rounded-2xl object-cover ring-1 ${
                tone === 'dark' ? 'bg-white/5 ring-white/15' : 'bg-line/60 ring-line'
              }`}
            />
            {size === 'lg' ? (
              <figcaption
                // Three or four in a row on a phone: a name wider than its photo pushes the last
                // one off the screen, and the names are in the heading above — so from sm up.
                className={`mt-1.5 text-label font-medium uppercase ${caption} ${n >= 3 ? 'hidden sm:block' : ''}`}
              >
                {cityTitle(key)}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ))}
    </div>
  );
}
