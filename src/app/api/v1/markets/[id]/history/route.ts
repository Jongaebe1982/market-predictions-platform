import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { fetchPriceHistory } from '@/lib/polymarket';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/markets/:id/history
 * Returns probability snapshots over time for a market
 *
 * Query params:
 *   - source: 'clob' | 'snapshots' | 'all' (default: 'all')
 *     - clob: Polymarket CLOB API price history (high fidelity, may be unavailable for old markets)
 *     - snapshots: Our stored hourly snapshots
 *     - all: Merge both sources
 *   - limit: number of data points (default: 500, max: 2000)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 2000);

    const db = getAdminDb();

    // Get market metadata
    const marketDoc = await db.collection('markets').doc(id).get();

    // Collect price history from different sources
    const history: { timestamp: string; probability: number; source: string }[] = [];

    // Try CLOB API (Polymarket only)
    if (source === 'clob' || source === 'all') {
      // Get CLOB token ID from stored market or price-history
      const priceHistoryDoc = await db.collection('price-history').doc(id).get();
      const clobTokenId = priceHistoryDoc.exists
        ? priceHistoryDoc.data()?.clobTokenId
        : marketDoc.exists
          ? marketDoc.data()?.sourceId
          : null;

      if (clobTokenId) {
        const clobHistory = await fetchPriceHistory(clobTokenId);
        for (const point of clobHistory) {
          history.push({
            timestamp: new Date(point.timestamp).toISOString(),
            probability: point.price,
            source: 'clob',
          });
        }
      }

      // Also check stored price-history document
      if (priceHistoryDoc.exists) {
        const storedHistory = priceHistoryDoc.data()?.history || [];
        for (const point of storedHistory) {
          // Avoid duplicates if CLOB returned data
          const exists = history.some(
            (h) => Math.abs(new Date(h.timestamp).getTime() - point.timestamp) < 60000
          );
          if (!exists) {
            history.push({
              timestamp: new Date(point.timestamp).toISOString(),
              probability: point.price,
              source: 'stored',
            });
          }
        }
      }
    }

    // Get snapshots from Firestore
    if (source === 'snapshots' || source === 'all') {
      const snapshots = await db
        .collection('snapshots')
        .where('marketId', '==', id)
        .orderBy('timestamp', 'asc')
        .limit(limit)
        .get();

      for (const doc of snapshots.docs) {
        const data = doc.data();
        const yesOutcome = data.outcomes?.find(
          (o: { name: string }) => o.name.toLowerCase() === 'yes'
        );
        if (yesOutcome) {
          history.push({
            timestamp: data.timestamp,
            probability: yesOutcome.probability,
            source: 'snapshot',
          });
        }
      }
    }

    // Sort by timestamp and dedupe
    history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Dedupe by keeping one point per hour
    const dedupedHistory: typeof history = [];
    let lastHour = '';
    for (const point of history) {
      const hour = point.timestamp.slice(0, 13); // YYYY-MM-DDTHH
      if (hour !== lastHour) {
        dedupedHistory.push(point);
        lastHour = hour;
      }
    }

    // Apply limit
    const limitedHistory = dedupedHistory.slice(-limit);

    return NextResponse.json({
      data: {
        marketId: id,
        dataPoints: limitedHistory.length,
        history: limitedHistory,
      },
      meta: {
        sources: [...new Set(limitedHistory.map((h) => h.source))],
        earliest: limitedHistory[0]?.timestamp || null,
        latest: limitedHistory[limitedHistory.length - 1]?.timestamp || null,
      },
    });
  } catch (error) {
    console.error('API v1 market history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market history', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
