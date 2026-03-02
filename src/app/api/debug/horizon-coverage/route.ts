import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { fetchResolvedStockMarkets, fetchPriceHistoryWithFallback } from '@/lib/polymarket';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();

    // Get snapshot date range
    const oldestSnapshot = await db.collection('snapshots')
      .orderBy('timestamp', 'asc')
      .limit(1)
      .get();

    const newestSnapshot = await db.collection('snapshots')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    const snapshotStart = oldestSnapshot.empty ? null : oldestSnapshot.docs[0].data().timestamp;
    const snapshotEnd = newestSnapshot.empty ? null : newestSnapshot.docs[0].data().timestamp;

    // Get resolved markets
    const resolvedMarkets = await fetchResolvedStockMarkets();

    // Check a sample of recent resolved markets for 30-day coverage
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const results: any[] = [];

    // Sort by endDate descending and take 10 most recent
    const sortedMarkets = resolvedMarkets
      .filter(m => m.endDate)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 10);

    for (const market of sortedMarkets) {
      const resolutionDate = new Date(market.endDate).getTime();
      const thirtyDaysBeforeResolution = resolutionDate - thirtyDaysMs;

      // Get price history with our merged function
      const history = await fetchPriceHistoryWithFallback(market.clobTokenId, market.id);

      // Check snapshot coverage for this market
      const marketSnapshots = await db.collection('snapshots')
        .where('marketId', '==', market.id)
        .orderBy('timestamp', 'asc')
        .get();

      const snapshotTimestamps = marketSnapshots.docs.map(d => new Date(d.data().timestamp).getTime());
      const earliestSnapshot = snapshotTimestamps.length > 0 ? Math.min(...snapshotTimestamps) : null;
      const latestSnapshot = snapshotTimestamps.length > 0 ? Math.max(...snapshotTimestamps) : null;

      // Find earliest data point in merged history
      const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
      const earliestHistoryPoint = sortedHistory.length > 0 ? sortedHistory[0].timestamp : null;

      // Check if we have data from 30 days before
      const has30DayCoverage = earliestHistoryPoint !== null && earliestHistoryPoint <= thirtyDaysBeforeResolution;

      results.push({
        marketId: market.id,
        question: market.question.substring(0, 60) + '...',
        resolutionDate: new Date(resolutionDate).toISOString(),
        thirtyDayTarget: new Date(thirtyDaysBeforeResolution).toISOString(),
        historyPointCount: history.length,
        snapshotCount: marketSnapshots.size,
        earliestHistoryPoint: earliestHistoryPoint ? new Date(earliestHistoryPoint).toISOString() : null,
        earliestSnapshot: earliestSnapshot ? new Date(earliestSnapshot).toISOString() : null,
        has30DayCoverage,
        gapDays: earliestHistoryPoint
          ? Math.round((earliestHistoryPoint - thirtyDaysBeforeResolution) / (24 * 60 * 60 * 1000))
          : null,
      });
    }

    return NextResponse.json({
      snapshotRange: {
        start: snapshotStart,
        end: snapshotEnd,
      },
      totalResolvedMarkets: resolvedMarkets.length,
      sampledMarkets: results,
      summary: {
        marketsWith30DayCoverage: results.filter(r => r.has30DayCoverage).length,
        marketsWithoutCoverage: results.filter(r => !r.has30DayCoverage).length,
      }
    });
  } catch (error) {
    console.error('Horizon coverage debug error:', error);
    return NextResponse.json(
      { error: 'Failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
