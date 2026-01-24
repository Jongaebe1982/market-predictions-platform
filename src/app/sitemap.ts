import type { MetadataRoute } from 'next';
import { MOCK_MARKETS } from '@/lib/mock-data';
import { COMPANY_MAPPINGS } from '@/lib/sector-mapping';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://market-predictions-platform.vercel.app';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/markets`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/accuracy`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const marketPages: MetadataRoute.Sitemap = MOCK_MARKETS.map((market) => ({
    url: `${baseUrl}/markets/${market.slug}`,
    lastModified: new Date(market.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const companyPages: MetadataRoute.Sitemap = COMPANY_MAPPINGS.map((company) => ({
    url: `${baseUrl}/companies/${company.ticker}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...marketPages, ...companyPages];
}
