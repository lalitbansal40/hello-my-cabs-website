import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // No remote patterns on purpose: every photograph on this site is a file in
    // `public/img`. The hero is what LCP is measured on, and a second host in front of it
    // is a second DNS lookup, a second handshake, and somebody else's outage.
    // 40 for the hero texture, which is shown at 22% opacity; 75 for everything that is
    // actually looked at. Next only serves the qualities listed here.
    qualities: [40, 75],
    // AVIF first — the same picture in about half the bytes of WebP for photographs; WebP for
    // the browsers that cannot (8 Oct 2026, PageSpeed "Improve image delivery").
    formats: ['image/avif', 'image/webp'],
    // A resized image is cached for 30 days, not the default few hours: the source files only
    // change with a deploy, and a new file is a new URL (PageSpeed "cache lifetimes").
    minimumCacheTTL: 2592000,
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
     * render-blocking stylesheet it names. Inlined, the first response carries everything
     * the first paint needs: 0.8 s.
     *
     * The cost is size. Next copies the inlined CSS (91 kB, 3 Oct 2026) into each page's
     * HTML, RSC payload and prefetch segments — with every page built ahead the deploy was
     * 260 MB against Amplify's 220 MB limit, and turning this off (as on 3 Oct) cost 0.8 s
     * on every phone. So only the busiest routes, the variants, the cities and the cars are
     * built ahead ([slug]/page.tsx, allLandingSlugs); the rest render on their first visit
     * and are kept for a day. Watch the size the build log prints (amplify.yml).
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
        // The site's own pictures and icons (8 Oct 2026, PageSpeed "Use efficient cache
        // lifetimes"). Not immutable: these names do not change when the file does, so a day
        // fresh and a week of serving the old one while the new one is fetched.
        source: '/:file(logo.png|icon.svg|apple-icon.png|favicon.ico|manifest.webmanifest)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/img/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
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
