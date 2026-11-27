import Script from 'next/script';
import { env } from '@/lib/env';
import { ANALYTICS } from '@/config/analytics';
import { Ga4 } from './Ga4';
import { CallTracker } from './CallTracker';

/**
 * Plausible rather than GA4, for two reasons that both matter here.
 *
 * It is about a kilobyte and sets no cookie, so it needs no consent banner under the DPDP
 * Act — and a consent banner over the hero is a real cost to a page whose whole job is to
 * get somebody into a booking form. GA4's script is heavy enough to show up in the LCP
 * this site spent a phase earning.
 *
 * Renders nothing at all when the domain is unset, which is every environment but
 * production.
 */
export function Analytics() {
  // Code first (src/config/analytics.ts, 27 Nov 2026), the old env value as a fallback.
  const plausible = ANALYTICS.PLAUSIBLE_DOMAIN ?? env.analyticsDomain;
  const ga4 = ANALYTICS.GA4_ID;
  if (!plausible && !ga4) return null;

  return (
    <>
      {plausible ? (
        <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      ) : null}
      {ga4 ? <Ga4 id={ga4} /> : null}
      <CallTracker />
    </>
  );
}
