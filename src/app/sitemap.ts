import type { MetadataRoute } from 'next';
import { COMPANY_MAPPINGS } from '@/lib/sector-mapping';

const BASE_URL = 'https://predictionmarketanalytics.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all markets for dynamic URLs
  const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] =
    await Promise.all([import('@/lib/polymarket'), import('@/lib/kalshi')]);

  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);

  const allMarkets = [...polymarkets, ...kalshiMarkets];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/markets`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/analytics`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/companies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/glossary`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/sources/polymarket`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/sources/kalshi`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/coming-soon`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Company pages
  const companyPages: MetadataRoute.Sitemap = COMPANY_MAPPINGS.map((company) => ({
    url: `${BASE_URL}/companies/${company.ticker}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // Market pages - hourly refresh, high priority for active markets
  const marketPages: MetadataRoute.Sitemap = allMarkets.map((market) => ({
    url: `${BASE_URL}/markets/${market.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: market.status === 'active' ? 0.7 : 0.5,
  }));

  return [...staticPages, ...companyPages, ...marketPages];
}
