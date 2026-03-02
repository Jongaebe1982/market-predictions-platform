import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { fetchResolvedStockMarkets } from '@/lib/polymarket';

export async function GET(request: NextRequest) {
  // No auth required for debug endpoint

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

    // Check a sample of recent resolved markets for 14-day coverage (our longest horizon)
    const results: any[] = [];

    // Sort by endDate descending and take 10 most recent
    const sortedMarkets = resolvedMarkets
      .filter(m => m.endDate)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 10);

    for (const market of sortedMarkets) {
      const resolutionDate = new Date(market.endDate).getTime();
      const fourteenDaysBeforeResolution = resolutionDate - (14 * 24 * 60 * 60 * 1000);

      // Get snapshot coverage for this market (now the only source of truth)
      const marketSnapshots = await db.collection('snapshots')
        .where('marketId', '==', market.id)
        .orderBy('timestamp', 'asc')
        .get();

      const snapshotTimestamps = marketSnapshots.docs.map(d => new Date(d.data().timestamp).getTime());
      const earliestSnapshot = snapshotTimestamps.length > 0 ? Math.min(...snapshotTimestamps) : null;
      const latestSnapshot = snapshotTimestamps.length > 0 ? Math.max(...snapshotTimestamps) : null;

      // Check if we have data from 14 days before (our longest horizon now)
      const has14DayCoverage = earliestSnapshot !== null && earliestSnapshot <= fourteenDaysBeforeResolution;

      results.push({
        marketId: market.id,
        question: market.question.substring(0, 60) + '...',
        resolutionDate: new Date(resolutionDate).toISOString(),
        fourteenDayTarget: new Date(fourteenDaysBeforeResolution).toISOString(),
        snapshotCount: marketSnapshots.size,
        earliestSnapshot: earliestSnapshot ? new Date(earliestSnapshot).toISOString() : null,
        latestSnapshot: latestSnapshot ? new Date(latestSnapshot).toISOString() : null,
        has14DayCoverage,
        gapDays: earliestSnapshot
          ? Math.round((earliestSnapshot - fourteenDaysBeforeResolution) / (24 * 60 * 60 * 1000))
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
        marketsWith14DayCoverage: results.filter(r => r.has14DayCoverage).length,
        marketsWithoutCoverage: results.filter(r => !r.has14DayCoverage).length,
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
