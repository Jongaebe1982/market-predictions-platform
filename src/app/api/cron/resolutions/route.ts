import { NextRequest, NextResponse } from 'next/server';
import { fetchResolvedStockMarkets, fetchPriceHistoryWithFallback } from '@/lib/polymarket';
import { calculateBrierScore, HORIZONS } from '@/lib/accuracy-utils';
import type { HorizonKey, HorizonProbability } from '@/lib/types';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();

    const resolvedMarkets = await fetchResolvedStockMarkets();
    let newResolutions = 0;

    for (const market of resolvedMarkets) {
      // Check if resolution already exists
      const existing = await db
        .collection('resolutions')
        .where('marketId', '==', market.id)
        .get();

      if (!existing.empty) continue;

      // Fetch CLOB price history (with fallback to stored snapshots)
      const history = await fetchPriceHistoryWithFallback(market.clobTokenId, market.id);
      if (history.length === 0) continue;

      const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
      const resolutionDate = market.endDate
        ? new Date(market.endDate).getTime()
        : sortedHistory[sortedHistory.length - 1].timestamp;

      const outcomeBoolean = market.outcome === 'yes';

      // Find probability at each horizon
      const horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};
      for (const { key, hours } of HORIZONS) {
        const targetTime = resolutionDate - hours * 60 * 60 * 1000;
        // Find last price point at or before target
        let closest: { timestamp: number; price: number } | null = null;
        for (const point of sortedHistory) {
          if (point.timestamp <= targetTime) closest = point;
          else break;
        }
        if (!closest && sortedHistory[0].timestamp - targetTime <= 24 * 60 * 60 * 1000) {
          closest = sortedHistory[0];
        }
        if (closest) {
          horizons[key] = {
            probability: closest.price,
            brierScore: calculateBrierScore(closest.price, outcomeBoolean),
            timestamp: new Date(targetTime).toISOString(),
          };
        }
      }

      // Use earliest available horizon for Brier score
      const horizonPreference: HorizonKey[] = ['30d', '14d', '7d', '1d', '12h'];
      const finalProbability = sortedHistory[sortedHistory.length - 1].price;
      let brierScore = calculateBrierScore(finalProbability, outcomeBoolean);
      for (const key of horizonPreference) {
        if (horizons[key]) {
          brierScore = horizons[key]!.brierScore;
          break;
        }
      }

      await db.collection('resolutions').add({
        marketId: market.id,
        slug: market.slug,
        question: market.question,
        sector: market.sector,
        ticker: market.ticker,
        source: 'polymarket',
        resolvedAt: market.endDate || new Date(resolutionDate).toISOString(),
        resolution: market.outcome,
        finalProbability,
        outcome: market.outcome,
        brierScore,
        volume: market.volume,
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
