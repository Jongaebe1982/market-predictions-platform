import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { fetchPolymarketStockMarkets, fetchAllPolymarketMarkets } from '@/lib/polymarket';
import { fetchKalshiStockMarkets } from '@/lib/kalshi';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/markets/:id
 * Returns a single market with full details including resolution data if available
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Try to find in active markets first
    const [polymarkets, kalshiMarkets] = await Promise.all([
      fetchPolymarketStockMarkets(),
      fetchKalshiStockMarkets(),
    ]);

    let market = [...polymarkets, ...kalshiMarkets].find((m) => m.id === id);

    // If not found in active, try all Polymarket markets (includes resolved)
    if (!market) {
      const allPolymarkets = await fetchAllPolymarketMarkets();
      market = allPolymarkets.find((m) => m.id === id);
    }

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found', id },
        { status: 404 }
      );
    }

    // Fetch resolution data from Firestore if available
    const db = getAdminDb();
    const resolutionQuery = await db
      .collection('resolutions')
      .where('marketId', '==', id)
      .limit(1)
      .get();

    let resolution = null;
    if (!resolutionQuery.empty) {
      const resData = resolutionQuery.docs[0].data();
      resolution = {
        outcome: resData.outcome,
        finalProbability: resData.finalProbability,
        brierScore: resData.brierScore,
        resolvedAt: resData.resolvedAt,
        horizons: resData.horizons || {},
      };
    }

    return NextResponse.json({
      data: {
        id: market.id,
        slug: market.slug,
        question: market.question,
        description: market.description,
        source: market.source,
        status: market.status,
        ticker: market.ticker,
        companyName: market.companyName,
        sector: market.sector,
        outcomes: market.outcomes,
        volume: market.volume,
        liquidity: market.liquidity,
        startDate: market.startDate,
        endDate: market.endDate,
        resolvedAt: market.resolvedAt,
        resolution: resolution,
        tags: market.tags,
      },
    });
  } catch (error) {
    console.error('API v1 market detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
