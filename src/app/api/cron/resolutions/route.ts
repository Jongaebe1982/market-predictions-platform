import { NextRequest, NextResponse } from 'next/server';
import { calculateBrierScore, HORIZONS } from '@/lib/accuracy-utils';
import type { HorizonKey, HorizonProbability, MarketSnapshot } from '@/lib/types';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fetchPolymarketStockMarkets } = await import('@/lib/polymarket');
    const { getAdminDb } = await import('@/lib/firebase-admin');

    const markets = await fetchPolymarketStockMarkets();
    const db = getAdminDb();

    const resolvedMarkets = markets.filter((m) => m.status === 'resolved' && m.resolution);
    let newResolutions = 0;

    for (const market of resolvedMarkets) {
      // Check if resolution already exists
      const existing = await db
        .collection('resolutions')
        .where('marketId', '==', market.id)
        .get();

      if (!existing.empty) continue;

      const outcome = market.resolution?.toLowerCase() === 'yes' ? 'yes' : 'no';
      const isYes = outcome === 'yes';
      const resolvedAt = market.resolvedAt || new Date().toISOString();
      const resolvedTime = new Date(resolvedAt).getTime();

      // Look up snapshots for this market to find probabilities at each horizon
      const snapshotsQuery = await db
        .collection('snapshots')
        .where('marketId', '==', market.id)
        .orderBy('timestamp', 'asc')
        .get();

      const snapshots: MarketSnapshot[] = snapshotsQuery.docs.map((d) => d.data() as MarketSnapshot);

      // Find probability at each time horizon
      const horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};

      for (const { key, hours } of HORIZONS) {
        const targetTime = resolvedTime - hours * 60 * 60 * 1000;

        // Find the snapshot closest to (but before) the target time
        const candidateSnapshots = snapshots.filter(
          (s) => new Date(s.timestamp).getTime() <= targetTime
        );

        if (candidateSnapshots.length === 0) continue;

        // Use the most recent snapshot before the target time
        const closest = candidateSnapshots[candidateSnapshots.length - 1];
        const probability = closest.outcomes[0]?.probability || 0.5;
        const brierScore = calculateBrierScore(probability, isYes);

        horizons[key] = {
          probability,
          brierScore,
          timestamp: closest.timestamp,
        };
      }

      // Use 12h horizon probability as "final" (or 1d if 12h not available)
      const finalProbability =
        horizons['12h']?.probability ??
        horizons['1d']?.probability ??
        market.outcomes[0]?.probability ??
        0.5;
      const brierScore = calculateBrierScore(finalProbability, isYes);

      await db.collection('resolutions').add({
        marketId: market.id,
        slug: market.slug,
        question: market.question,
        sector: market.sector,
        ticker: market.ticker,
        source: market.source,
        resolvedAt,
        resolution: market.resolution,
        finalProbability,
        outcome,
        brierScore,
        horizons,
      });

      newResolutions++;
    }

    return NextResponse.json({
      success: true,
      newResolutions,
      totalResolved: resolvedMarkets.length,
    });
  } catch (error) {
    console.error('Resolutions cron error:', error);
    return NextResponse.json({ error: 'Resolution detection failed' }, { status: 500 });
  }
}
