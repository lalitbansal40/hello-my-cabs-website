import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // No remote patterns on purpose: every photograph on this site is a file in
    // `public/img`. The hero is what LCP is measured on, and a second host in front of it
    // is a second DNS lookup, a second handshake, and somebody else's outage.
    // 40 for the hero texture, which is shown at 22% opacity; 75 for everything that is
    // actually looked at. Next only serves the qualities listed here.
    qualities: [40, 75],
  },

  /**
   * Stamped once, when the site is built — which is the only moment this content can
   * change, since the fares are fetched at build time and every page is prerendered. The
   * sitemap reports it as `lastmod`; it used to report "now", so all 115 URLs claimed to
   * have changed on every single request.
   */
  env: { BUILD_TIME: new Date().toISOString() },

  experimental: {
    /**
     * The stylesheet BESIDE the HTML, not inside it — off since 3 Oct 2026.
     *
     * It was on: one round trip instead of two took a phone's first paint from 1.6 s to
     * 0.8 s. But the CSS grew from 12 kB to 91 kB, and Next puts the inlined copy into the
     * HTML, the RSC payload and every prefetch segment of every page — ~120 MB across the
     * build. Amplify refuses a deploy over 220 MB, and every deploy from 2 Oct failed on it
     * (271 MB, then 260 MB). Off, the build is 89 MB.
     *
     * Measured with it off (audit:speed, mid-range phone, slow 4G): LCP 1.64–1.96 s, over
     * this site's 1.5 s budget but inside Google's 2.5 s "good". To have both back: make the
     * CSS smaller, then turn this on again and check the deploy size in the build log.
     */
    inlineCss: false,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Two years, subdomains included, and preload-eligible. Without it the first
          // request of a session can still be made over http and answered by anyone on
          // the network in between.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Send the page, not the query string, to anything we link out to.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // The funnel and the account pages already carry a noindex meta tag. This says the
        // same thing in a header, which is what a crawler fetching a non-HTML response or
        // stopping before it parses the head will see.
        // /driver is the drivers' road survey, opened from a signed link — never a search result.
        source: '/:path(booking|bookings|login|driver)/:rest*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/:path(bookings|login)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
