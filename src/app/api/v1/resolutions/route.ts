import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/resolutions
 * Returns historical market resolutions with outcomes and accuracy metrics
 *
 * Query params:
 *   - source: 'polymarket' | 'kalshi' | 'all' (default: 'all')
 *   - ticker: filter by company ticker (e.g., 'AAPL')
 *   - sector: filter by sector (e.g., 'Technology')
 *   - outcome: 'yes' | 'no' | 'all' (default: 'all')
 *   - since: ISO date string, only return resolutions after this date
 *   - until: ISO date string, only return resolutions before this date
 *   - limit: number of results (default: 100, max: 500)
 *   - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const ticker = searchParams.get('ticker')?.toUpperCase();
    const sector = searchParams.get('sector');
    const outcome = searchParams.get('outcome') || 'all';
    const since = searchParams.get('since');
    const until = searchParams.get('until');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getAdminDb();

    // Build query
    let query: FirebaseFirestore.Query = db.collection('resolutions');

    if (source !== 'all') {
      query = query.where('source', '==', source);
    }

    if (ticker) {
      query = query.where('ticker', '==', ticker);
    }

    if (outcome !== 'all') {
      query = query.where('outcome', '==', outcome);
    }

    // Fetch all matching documents (Firestore limitations on complex queries)
    const snapshot = await query.get();

    let resolutions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        marketId: data.marketId,
        slug: data.slug,
        question: data.question,
        source: data.source,
        ticker: data.ticker,
        sector: data.sector,
        outcome: data.outcome,
        finalProbability: data.finalProbability,
        brierScore: data.brierScore,
        volume: data.volume,
        resolvedAt: data.resolvedAt,
        horizons: data.horizons || {},
      };
    });

    // Apply additional filters (done in memory due to Firestore query limitations)
    if (sector) {
      resolutions = resolutions.filter(
        (r) => r.sector?.toLowerCase() === sector.toLowerCase()
      );
    }

    if (since) {
      const sinceDate = new Date(since);
      resolutions = resolutions.filter(
        (r) => new Date(r.resolvedAt) >= sinceDate
      );
    }

    if (until) {
      const untilDate = new Date(until);
      resolutions = resolutions.filter(
        (r) => new Date(r.resolvedAt) <= untilDate
      );
    }

    // Sort by resolution date descending
    resolutions.sort(
      (a, b) => new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime()
    );

    // Paginate
    const total = resolutions.length;
    const paginatedResolutions = resolutions.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedResolutions,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('API v1 resolutions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resolutions', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
