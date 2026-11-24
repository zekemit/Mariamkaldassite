import type { NextConfig } from 'next';
import { legacyRedirects } from './config/redirects.mjs';

const isProd = process.env.NODE_ENV === 'production';
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

// Static CSP. A nonce-based CSP would force every page to render dynamically (see the Next.js CSP guide),
// so scripts/styles allow 'unsafe-inline' for Next's own bootstrap code. Everything else is locked down.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // https: because images at /admin can point anywhere (a popup photo, a credential badge); the editor only
  // accepts http(s) and site paths for them, and nothing here can run script.
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  `script-src 'self' 'unsafe-inline' https://assets.calendly.com${plausibleDomain ? ' https://plausible.io' : ''}`,
  'frame-src https://calendly.com',
  `connect-src 'self' https://calendly.com${plausibleDomain ? ' https://plausible.io' : ''}`,
].join('; ');

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // The local-development content store is read at runtime when Upstash is not connected; make sure it ships.
  outputFileTracingIncludes: { '/**': ['./data/site-content.json'] },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [96, 128, 192, 256, 384],
  },
  async redirects() {
    return legacyRedirects;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()',
          },
          ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
        ],
      },
      {
        // The admin portal and its API are never indexed or cached.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        // Keep every *.vercel.app deployment out of search results; the live domain is unaffected.
        source: '/:path*',
        has: [{ type: 'host', value: '(.*\\.)?vercel\\.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
