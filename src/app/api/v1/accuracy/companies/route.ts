import { NextRequest, NextResponse } from 'next/server';
import { fetchCachedAccuracyMetrics } from '@/lib/accuracy-compute';
import { extractApiKey, validateApiKey, trackApiKeyUsage, checkRateLimit, addRateLimitHeaders } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/accuracy/companies
 * Returns accuracy metrics broken down by company
 *
 * Headers:
 *   - Authorization: Bearer <api-key>
 *
 * Query params:
 *   - ticker: filter by specific ticker (e.g., 'AAPL')
 *   - sector: filter by sector (e.g., 'Technology')
 *   - minResolved: minimum number of resolved markets (default: 1)
 *   - sortBy: 'brierScore' | 'hitRate' | 'resolvedCount' | 'ticker' (default: 'resolvedCount')
 *   - order: 'asc' | 'desc' (default: 'desc')
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

  // Check rate limit
  const rateLimit = await checkRateLimit(key, apiKey.tier);
  if (!rateLimit.allowed) {
    return addRateLimitHeaders(
      NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Daily limit of ${rateLimit.limit} requests exceeded. Resets at ${rateLimit.resetAt}`,
        },
        { status: 429 }
      ),
      rateLimit
    );
  }

  // Track usage (non-blocking)
  trackApiKeyUsage(key).catch(() => {});

  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker')?.toUpperCase();
    const sector = searchParams.get('sector');
    const minResolved = parseInt(searchParams.get('minResolved') || '1');
    const sortBy = searchParams.get('sortBy') || 'resolvedCount';
    const order = searchParams.get('order') || 'desc';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    const metrics = await fetchCachedAccuracyMetrics();

    let companies = metrics.byCompany.filter((c) => c.resolvedCount >= minResolved);

    // Filter by ticker
    if (ticker) {
      companies = companies.filter((c) => c.ticker === ticker);
    }

    // Filter by sector
    if (sector) {
      companies = companies.filter((c) => c.sector.toLowerCase() === sector.toLowerCase());
    }

    // Sort
    companies.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'brierScore':
          comparison = a.averageBrierScore - b.averageBrierScore;
          break;
        case 'hitRate':
          comparison = a.hitRate - b.hitRate;
          break;
        case 'ticker':
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case 'resolvedCount':
        default:
          comparison = a.resolvedCount - b.resolvedCount;
          break;
      }
      return order === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const total = companies.length;
    const paginatedCompanies = companies.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedCompanies.map((c) => ({
        ticker: c.ticker,
        companyName: c.companyName,
        sector: c.sector,
        resolvedCount: c.resolvedCount,
        averageBrierScore: c.averageBrierScore,
        hitRate: c.hitRate,
      })),
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        lastUpdated: metrics.lastUpdated,
      },
    });
  } catch (error) {
    console.error('API v1 accuracy companies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company accuracy', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
