// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // ✅ Required for static hosting on cPanel
  trailingSlash: true, // ✅ Helps Apache/cPanel routing
  images: {
    unoptimized: true, // ✅ Required for static export
    remotePatterns: [
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'gosarwar.com' }, // ✅ Your cPanel domain for uploaded images
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;