import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // PLACEHOLDER photography, to be swapped for the company's own. It is atmospheric
    // only — no image is ever labelled as a particular city, because a stock photo
    // captioned "Jaipur" that is not Jaipur is a lie on the page.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
