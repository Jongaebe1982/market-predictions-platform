import { NextResponse } from 'next/server';
import {
  generateSitemapIndexXml,
  createXmlResponse,
  formatSitemapDate,
  BASE_URL,
  SITEMAP_LIMITS,
  type SitemapIndexEntry,
} from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const today = formatSitemapDate(new Date());

    // Check if we need to shard markets sitemap
    const marketShardCount = await getMarketShardCount();

    const sitemaps: SitemapIndexEntry[] = [
      {
        loc: `${BASE_URL}/sitemap-static.xml`,
        // Static content changes rarely, omit lastmod to avoid misleading crawlers
      },
      {
        loc: `${BASE_URL}/sitemap-companies.xml`,
        lastmod: today, // Companies list can change when new tickers are discovered
      },
    ];

    // Add market sitemaps (sharded if needed)
    if (marketShardCount > 1) {
      for (let i = 0; i < marketShardCount; i++) {
        sitemaps.push({
          loc: `${BASE_URL}/sitemap-markets.xml?shard=${i}`,
          lastmod: today,
        });
      }
    } else {
      sitemaps.push({
        loc: `${BASE_URL}/sitemap-markets.xml`,
        lastmod: today,
      });
    }

    const xml = generateSitemapIndexXml(sitemaps);
    return createXmlResponse(xml);
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap index' }, { status: 500 });
  }
}

/**
 * Get the number of shards needed for markets sitemap
 */
async function getMarketShardCount(): Promise<number> {
  try {
    const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] = await Promise.all([
      import('@/lib/polymarket'),
      import('@/lib/kalshi'),
    ]);

    const [polymarkets, kalshiMarkets] = await Promise.all([
      fetchPolymarketStockMarkets(),
      fetchKalshiStockMarkets(),
    ]);

    const totalMarkets = polymarkets.length + kalshiMarkets.length;
    return Math.ceil(totalMarkets / SITEMAP_LIMITS.MAX_URLS);
  } catch (error) {
    console.error('Error counting markets for sharding:', error);
    return 1; // Default to single sitemap on error
  }
}
