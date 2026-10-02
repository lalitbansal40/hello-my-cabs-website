import Image from 'next/image';
import { PHOTOS } from '@/lib/images';

/**
 * Each car the company runs, drawn — side on, facing right, all in one style.
 *
 * Until now every place a car was chosen showed the same thin outline icon, whatever the
 * car: a hatchback and a sixteen-seat Urbania looked identical. These are drawings, not
 * photographs of our own cars, so they claim nothing about any particular vehicle; when the
 * owner's photographs arrive (lib/images.ts, PHOTOS.fleet) the photograph is shown instead
 * and nothing else changes.
 *
 * Six shapes cover the fleet: hatchback, sedan, MPV, the taller Innova, the Tempo
 * Traveller van and the Urbania. Colours are the brand tokens; `tone="dark"` lightens the
 * body for a dark background.
 */
type Shape = 'hatch' | 'sedan' | 'mpv' | 'mpvTall' | 'van' | 'bus';

const SHAPE_OF: Record<string, Shape> = {
  hatchback: 'hatch',
  dzire: 'sedan',
  sedan: 'sedan',
  ertiga: 'mpv',
  crysta: 'mpvTall',
  innova: 'mpvTall',
  innova_crysta: 'mpvTall',
  tt_12: 'van',
  tt_14: 'van',
  tt_16: 'van',
  tempo_traveller: 'van',
  urbania: 'bus',
};

/**
 * Body outline, window band, pillar x's and the band's top and bottom (so a pillar never
 * pokes through the roof), wheel x's — viewBox 0 0 160 64, ground at 54.
 */
const SHAPES: Record<
  Shape,
  { body: string; glass: string; pillars: number[]; band: [number, number]; wheels: [number, number] }
> = {
  hatch: {
    body: 'M30 46V31q1-10 12-11h48q9 0 15 6l12 6q22 2 26 7l2 7Z',
    glass: 'M38 31q2-7 8-8h43q6 0 10 4l5 4Z',
    pillars: [66],
    band: [23, 31],
    wheels: [48, 122],
  },
  sedan: {
    body: 'M10 46v-9q2-5 12-6l15-1 13-10q4-2 10-2h32q7 0 12 5l11 7q24 2 30 7l2 9Z',
    glass: 'M51 29l9-8h30q5 0 9 4l5 4Z',
    pillars: [76],
    band: [21, 29],
    wheels: [34, 124],
  },
  mpv: {
    body: 'M12 46V28q2-9 12-9h72q8 0 14 6l10 6q22 2 26 7l2 8Z',
    glass: 'M21 30q2-8 9-8h64q6 0 10 4l5 4Z',
    pillars: [48, 76],
    band: [22, 30],
    wheels: [34, 124],
  },
  mpvTall: {
    body: 'M10 46V26q2-11 14-11h74q8 0 15 7l11 9q20 2 24 8l2 7Z',
    glass: 'M19 29q2-10 10-10h66q7 0 12 6l4 4Z',
    pillars: [46, 74],
    band: [19, 29],
    wheels: [34, 126],
  },
  van: {
    body: 'M8 46V19q0-7 8-7h112q8 0 12 8l8 14q2 4 2 12Z',
    glass: 'M14 29V19q0-2 2-2h110q6 0 9 5l4 7Z',
    pillars: [36, 58, 80, 102],
    band: [17, 29],
    wheels: [32, 124],
  },
  bus: {
    body: 'M8 46V21q0-9 10-9h106q14 0 22 16q4 7 4 18Z',
    glass: 'M14 29V20q0-3 3-3h105q10 0 15 9l2 3Z',
    pillars: [38, 62, 86, 110],
    band: [17, 29],
    wheels: [32, 126],
  },
};

export function VehicleArt({
  vehicleKey,
  label,
  className = '',
  tone = 'light',
  photoSizes = '(min-width: 640px) 17rem, 16rem',
}: {
  vehicleKey: string;
  /** The car's name, for the image's alt text; empty when the drawing is only decoration. */
  label: string;
  className?: string;
  tone?: 'light' | 'dark';
  /** next/image `sizes` when a photograph is shown. */
  photoSizes?: string;
}) {
  const photo = PHOTOS.fleet[vehicleKey];
  if (photo) {
    return (
      // aspect-ratio gives `fill` a height to fill wherever the caller set only a width.
      <span className={`relative block aspect-[5/2] overflow-hidden ${className}`}>
        <Image src={photo} alt={label} fill sizes={photoSizes} className="object-cover" />
      </span>
    );
  }

  const s = SHAPES[SHAPE_OF[vehicleKey] ?? 'sedan'];
  const body = tone === 'dark' ? '#f4ede6' : 'var(--color-ink)';
  const glass = tone === 'dark' ? '#3a2f2f' : 'var(--color-surface-alt)';
  const hub = tone === 'dark' ? '#3a2f2f' : 'var(--color-surface-raised)';
  return (
    <svg
      viewBox="0 0 160 64"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={className}
    >
      <ellipse cx="80" cy="56" rx="70" ry="3" fill="currentColor" opacity="0.12" />
      <path d={s.body} fill={body} />
      <path d={s.glass} fill={glass} />
      {s.pillars.map((x) => (
        <rect key={x} x={x - 1.25} y={s.band[0]} width="2.5" height={s.band[1] - s.band[0]} fill={body} />
      ))}
      {/* The brand's red line along the side — the same stroke as the logo's car. */}
      <path d={`M${s.wheels[0] - 16} 39H${s.wheels[1] + 14}`} stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="48" r="8.5" fill={body} />
          <circle cx={x} cy="48" r="5.5" fill="#1a1414" />
          <circle cx={x} cy="48" r="2.5" fill={hub} />
        </g>
      ))}
    </svg>
  );
}
