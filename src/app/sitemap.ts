import type { MetadataRoute } from 'next';
import { COMPANY_MAPPINGS } from '@/lib/sector-mapping';

const BASE_URL = 'https://predictionmarketanalytics.io';

// Fixed dates for static content pages (update these when content actually changes)
const STATIC_CONTENT_DATE = new Date('2025-01-26');
const SITE_LAUNCH_DATE = new Date('2025-01-20');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all markets for dynamic URLs
  const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] =
    await Promise.all([import('@/lib/polymarket'), import('@/lib/kalshi')]);

  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);

  const allMarkets = [...polymarkets, ...kalshiMarkets];

  // Static pages with meaningful lastModified dates
  // - Dynamic data pages: use today's date (data changes frequently)
  // - Static content pages: use fixed date (only update when content changes)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: today, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/markets`, lastModified: today, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/analytics`, lastModified: today, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/companies`, lastModified: today, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/sources/polymarket`, lastModified: today, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/sources/kalshi`, lastModified: today, changeFrequency: 'daily', priority: 0.7 },
    // Static content pages - use fixed dates
    { url: `${BASE_URL}/methodology`, lastModified: STATIC_CONTENT_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/glossary`, lastModified: STATIC_CONTENT_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: SITE_LAUNCH_DATE, changeFrequency: 'monthly', priority: 0.5 },
    // Note: /coming-soon excluded - thin/placeholder page not meant to rank
  ];

  // Company pages - use site launch date (static company list)
  const companyPages: MetadataRoute.Sitemap = COMPANY_MAPPINGS.map((company) => ({
    url: `${BASE_URL}/companies/${company.ticker}`,
    lastModified: SITE_LAUNCH_DATE,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // Market pages - use actual market updatedAt timestamp
  const marketPages: MetadataRoute.Sitemap = allMarkets.map((market) => ({
    url: `${BASE_URL}/markets/${market.slug}`,
    lastModified: market.updatedAt ? new Date(market.updatedAt) : today,
    changeFrequency: 'hourly' as const,
    priority: market.status === 'active' ? 0.7 : 0.5,
  }));

  return [...staticPages, ...companyPages, ...marketPages];
}
