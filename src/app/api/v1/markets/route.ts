import { NextRequest, NextResponse } from 'next/server';
import { fetchPolymarketStockMarkets } from '@/lib/polymarket';
import { fetchKalshiStockMarkets } from '@/lib/kalshi';
import { extractApiKey, validateApiKey, trackApiKeyUsage } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/markets
 * Returns all active and resolved markets with metadata
 *
 * Headers:
 *   - Authorization: Bearer <api-key>
 *
 * Query params:
 *   - status: 'active' | 'resolved' | 'all' (default: 'all')
 *   - source: 'polymarket' | 'kalshi' | 'all' (default: 'all')
 *   - ticker: filter by company ticker (e.g., 'AAPL')
 *   - limit: number of results (default: 100, max: 500)
 *   - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  // Validate API key
  const key = extractApiKey(request);
  if (!key) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'API key required. Include header: Authorization: Bearer <your-api-key>' },
      { status: 401 }
    );
  }

  const apiKey = await validateApiKey(key);
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or inactive API key' },
      { status: 401 }
    );
  }

  // Track usage (non-blocking)
  trackApiKeyUsage(key).catch(() => {});

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const source = searchParams.get('source') || 'all';
    const ticker = searchParams.get('ticker')?.toUpperCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch markets from both sources
    const [polymarkets, kalshiMarkets] = await Promise.all([
      source === 'kalshi' ? Promise.resolve([]) : fetchPolymarketStockMarkets(),
      source === 'polymarket' ? Promise.resolve([]) : fetchKalshiStockMarkets(),
    ]);

    let allMarkets = [...polymarkets, ...kalshiMarkets];

    // Filter by status
    if (status === 'active') {
      allMarkets = allMarkets.filter((m) => m.status === 'active');
    } else if (status === 'resolved') {
      allMarkets = allMarkets.filter((m) => m.status === 'resolved');
    }

    // Filter by ticker
    if (ticker) {
      allMarkets = allMarkets.filter((m) => m.ticker === ticker);
    }

    // Sort by volume descending
    allMarkets.sort((a, b) => b.volume - a.volume);

    // Paginate
    const total = allMarkets.length;
    const paginatedMarkets = allMarkets.slice(offset, offset + limit);

    // Transform to API response format
    const markets = paginatedMarkets.map((m) => ({
      id: m.id,
      slug: m.slug,
      question: m.question,
      description: m.description,
      source: m.source,
      status: m.status,
      ticker: m.ticker,
      companyName: m.companyName,
      sector: m.sector,
      outcomes: m.outcomes,
      volume: m.volume,
      liquidity: m.liquidity,
      startDate: m.startDate,
      endDate: m.endDate,
      resolvedAt: m.resolvedAt,
      resolution: m.resolution,
    }));

    return NextResponse.json({
      data: markets,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('API v1 markets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
