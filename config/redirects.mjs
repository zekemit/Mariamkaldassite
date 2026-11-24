// Legacy Wix URLs -> new routes. Shared by next.config.ts and the unit tests.
// `permanent: true` emits HTTP 308 (the Next.js permanent redirect), which search engines treat as permanent.
// /testimonials and /faq keep their old URLs on purpose, so they need no redirect.

/** @type {{ source: string, destination: string, permanent: boolean }[]} */
export const legacyRedirects = [
  { source: '/more-about-me', destination: '/about', permanent: true },
  { source: '/services', destination: '/#how-we-work', permanent: true },
  { source: '/service-page/free-sample-coaching-session', destination: '/book', permanent: true },
  { source: '/service-page/myers-briggs-team-facilitation', destination: '/faq#teams', permanent: true },
  { source: '/service-page/:path*', destination: '/', permanent: true },
  { source: '/booking-calendar/:path*', destination: '/book', permanent: true },
  { source: '/events-page', destination: '/', permanent: true },
  { source: '/events-1/:path*', destination: '/', permanent: true },
];
