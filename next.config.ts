import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // PLACEHOLDER photography, to be swapped for the company's own. It is atmospheric
    // only — no image is ever labelled as a particular city, because a stock photo
    // captioned "Jaipur" that is not Jaipur is a lie on the page.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },

  /**
   * Stamped once, when the site is built — which is the only moment this content can
   * change, since the fares are fetched at build time and every page is prerendered. The
   * sitemap reports it as `lastmod`; it used to report "now", so all 115 URLs claimed to
   * have changed on every single request.
   */
  env: { BUILD_TIME: new Date().toISOString() },

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
