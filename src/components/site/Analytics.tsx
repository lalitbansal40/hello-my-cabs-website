import Script from 'next/script';
import { env } from '@/lib/env';

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
  if (!env.analyticsDomain) return null;

  return (
    <Script
      defer
      data-domain={env.analyticsDomain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
