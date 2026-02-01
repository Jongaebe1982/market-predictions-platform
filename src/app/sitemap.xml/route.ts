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

/**
 * /sitemap.xml - Serves sitemap index for backwards compatibility.
 *
 * This is the same content as /sitemap_index.xml but served at the
 * legacy URL that crawlers may have cached.
 *
 * robots.txt points to /sitemap_index.xml as the canonical location.
 */
export async function GET() {
  try {
    const today = formatSitemapDate(new Date());

    // Check if we need to shard markets sitemap
    const marketShardCount = await getMarketShardCount();

    const sitemaps: SitemapIndexEntry[] = [
      {
        loc: `${BASE_URL}/sitemap-static.xml`,
        // Static content changes rarely, omit lastmod
      },
      {
        loc: `${BASE_URL}/sitemap-companies.xml`,
        lastmod: today,
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
    console.error('Error generating sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
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
