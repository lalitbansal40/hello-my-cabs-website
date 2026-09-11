import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // PLACEHOLDER photography, to be swapped for the company's own. It is atmospheric
    // only — no image is ever labelled as a particular city, because a stock photo
    // captioned "Jaipur" that is not Jaipur is a lie on the page.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
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
     * The stylesheet inside the HTML rather than beside it.
     *
     * Measured on a mid-range phone over slow 4G, every landing page had its largest text
     * painted at 1.6 s — and that figure was two round trips: one for the HTML, one for the
     * render-blocking stylesheet it names, at about half a second each. The page was fast;
     * the second round trip was the whole budget. Inlined, the first response carries
     * everything the first paint needs.
     *
     * The cost is 12 kB of CSS in every HTML response instead of once in the cache. For a
     * site whose visitors mostly arrive on one landing page from a search result, that is
     * the right way round.
     */
    inlineCss: true,
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
        source: '/:path(booking|bookings|login)/:rest*',
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
