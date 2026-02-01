import { NextResponse } from 'next/server';
import {
  generateSitemapXml,
  createXmlResponse,
  normalizeUrl,
  formatSitemapDate,
  SITEMAP_LIMITS,
  type SitemapUrl,
} from '@/lib/sitemap-utils';
import type { MarketDocument } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

/**
 * Markets sitemap - includes all market detail pages.
 *
 * Uses market.updatedAt for lastmod - this represents when the market
 * data (probability, volume, status) was last updated, which is a
 * meaningful content change signal.
 *
 * Implements automatic sharding if URL count exceeds 50,000.
 */
export async function GET(request: Request) {
  try {
    // Check for shard parameter (e.g., ?shard=1)
    const url = new URL(request.url);
    const shardParam = url.searchParams.get('shard');
    const shardIndex = shardParam ? parseInt(shardParam, 10) : null;

    // Fetch all markets
    const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] = await Promise.all([
      import('@/lib/polymarket'),
      import('@/lib/kalshi'),
    ]);

    const [polymarkets, kalshiMarkets] = await Promise.all([
      fetchPolymarketStockMarkets(),
      fetchKalshiStockMarkets(),
    ]);

    const allMarkets = [...polymarkets, ...kalshiMarkets];

    // Filter to only include valid markets (active or resolved with valid slugs)
    const validMarkets = allMarkets.filter(
      (market) =>
        market.slug &&
        market.slug.length > 0 &&
        (market.status === 'active' || market.status === 'resolved')
    );

    // Sort by updatedAt descending for consistent ordering
    validMarkets.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    // Check if we need sharding
    const totalMarkets = validMarkets.length;
    const shardCount = Math.ceil(totalMarkets / SITEMAP_LIMITS.MAX_URLS);

    // If sharding is needed and no shard specified, return info
    if (shardCount > 1 && shardIndex === null) {
      // This shouldn't happen in normal use - the sitemap index should
      // reference the sharded URLs directly. Return first shard as fallback.
      return generateShardResponse(validMarkets, 0);
    }

    // If specific shard requested, return that shard
    if (shardIndex !== null && shardCount > 1) {
      if (shardIndex < 0 || shardIndex >= shardCount) {
        return NextResponse.json({ error: 'Invalid shard index' }, { status: 400 });
      }
      return generateShardResponse(validMarkets, shardIndex);
    }

    // No sharding needed - return all markets
    const marketUrls: SitemapUrl[] = validMarkets.map((market) => ({
      loc: normalizeUrl(`/markets/${market.slug}`),
      lastmod: formatSitemapDate(market.updatedAt),
    }));

    const xml = generateSitemapXml(marketUrls);
    return createXmlResponse(xml);
  } catch (error) {
    console.error('Error generating markets sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate markets sitemap' }, { status: 500 });
  }
}

function generateShardResponse(markets: MarketDocument[], shardIndex: number): Response {
  const start = shardIndex * SITEMAP_LIMITS.MAX_URLS;
  const end = start + SITEMAP_LIMITS.MAX_URLS;
  const shardMarkets = markets.slice(start, end);

  const marketUrls: SitemapUrl[] = shardMarkets.map((market) => ({
    loc: normalizeUrl(`/markets/${market.slug}`),
    lastmod: formatSitemapDate(market.updatedAt),
  }));

  const xml = generateSitemapXml(marketUrls);
  return createXmlResponse(xml);
}
