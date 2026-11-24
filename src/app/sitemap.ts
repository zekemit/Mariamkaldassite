import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

const routes = ['', '/about', '/testimonials', '/faq', '/book', '/privacy'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE.url}${route}`,
    // A fixed content date (not new Date()) keeps the sitemap static; bump SITE.contentUpdated when copy changes.
    lastModified: SITE.contentUpdated,
    changeFrequency: route === '' ? 'monthly' : 'yearly',
    priority: route === '' ? 1 : route === '/book' ? 0.9 : 0.7,
  }));
}
