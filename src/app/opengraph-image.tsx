import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';

/**
 * The card that appears when the site is shared.
 *
 * Generated rather than exported from a design file so it cannot fall out of date with the
 * brand — and a link with no card looks abandoned next to one that has it.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Hello My Cab — outstation cabs across India';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Outstation cabs"
        headline="Every road."
        accent="One honest price."
        facts={['One way · round trip · local', 'hellomycabs.com']}
      />
    ),
    size,
  );
}
