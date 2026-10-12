import { Postcard } from './CharDhamBanner';

/** The Hawa Mahal, Jaipur — the same Wikimedia photograph as the city's (/photo-credits). */
export const RAJASTHAN_PHOTO = '/img/rajasthan-tours.jpg';

/**
 * Rajasthan Tours as a postcard (owner, 12 Oct 2026) — above Char Dham in the home page's
 * bento, and at the top of /rajasthan-tours. The same card as Char Dham's (Postcard), its
 * own words and stamp.
 */
export function RajasthanToursBanner({
  heading = 'h2',
  showButton = true,
  variant = 'tile',
  className = '',
}: {
  heading?: 'h1' | 'h2';
  showButton?: boolean;
  variant?: 'tile' | 'hero';
  className?: string;
}) {
  return (
    <Postcard
      label="Rajasthan Tours"
      eyebrow="From Jaipur and Udaipur"
      title="Rajasthan Tours, by car"
      text="Forts, lakes and the desert — one car and one driver for the whole tour."
      href="/rajasthan-tours"
      buttonLabel="See the tours"
      stamp={['Raj', 'Tours']}
      photo={RAJASTHAN_PHOTO}
      photoAlt="Hawa Mahal, Jaipur"
      heading={heading}
      showButton={showButton}
      variant={variant}
      className={className}
    />
  );
}
