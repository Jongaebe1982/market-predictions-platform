import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rules for all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/api/cron/'],
      },
      // Explicitly allow AI search bots
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/api/', '/api/cron/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/api/cron/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/api/', '/api/cron/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/api/cron/'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/api/', '/api/cron/'],
      },
      {
        userAgent: 'GoogleOther',
        allow: '/',
        disallow: ['/api/', '/api/cron/'],
      },
    ],
    sitemap: 'https://predictionmarketanalytics.io/sitemap_index.xml',
  };
}
