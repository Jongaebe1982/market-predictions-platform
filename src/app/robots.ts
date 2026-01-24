import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/api/cron/'],
    },
    sitemap: 'https://market-predictions-platform.vercel.app/sitemap.xml',
  };
}
