import { NextRequest, NextResponse } from 'next/server';
import { fetchResolvedStockMarkets } from '@/lib/polymarket';
import { fetchResolvedKalshiMarkets } from '@/lib/kalshi';
import { calculateBrierScore, HORIZONS } from '@/lib/accuracy-utils';
import type { HorizonKey, HorizonProbability, PricePoint } from '@/lib/types';

// Fetch price history from Firestore snapshots (for Kalshi markets)
async function fetchSnapshotHistory(
  db: FirebaseFirestore.Firestore,
  marketId: string
): Promise<PricePoint[]> {
  const snapshots = await db
    .collection('snapshots')
    .where('marketId', '==', marketId)
    .orderBy('timestamp', 'asc')
    .get();

  if (snapshots.empty) return [];

  return snapshots.docs.map((doc) => {
    const data = doc.data();
    const yesOutcome = data.outcomes?.find(
      (o: { name: string }) => o.name.toLowerCase() === 'yes'
    );
    return {
      timestamp: new Date(data.timestamp).getTime(),
      price: yesOutcome?.probability ?? 0.5,
    };
  });
}

// Calculate horizons from price history
function calculateHorizons(
  sortedHistory: PricePoint[],
  resolutionDate: number,
  outcomeBoolean: boolean
): Partial<Record<HorizonKey, HorizonProbability>> {
  const horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};

  for (const { key, hours } of HORIZONS) {
    const targetTime = resolutionDate - hours * 60 * 60 * 1000;
    // Find last price point at or before target
    let closest: { timestamp: number; price: number } | null = null;
    for (const point of sortedHistory) {
      if (point.timestamp <= targetTime) closest = point;
      else break;
    }
    // Allow first snapshot if within 24 hours of target
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

  return horizons;
}

// Get best Brier score from available horizons
function getBestBrierScore(
  horizons: Partial<Record<HorizonKey, HorizonProbability>>,
  fallbackProbability: number,
  outcomeBoolean: boolean
): number {
  const horizonPreference: HorizonKey[] = ['14d', '10d', '7d', '2d', '1d', '12h'];
  for (const key of horizonPreference) {
    if (horizons[key]) {
      return horizons[key]!.brierScore;
    }
  }
  return calculateBrierScore(fallbackProbability, outcomeBoolean);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();

    // Fetch resolved markets from both sources in parallel
    const [polymarketResolved, kalshiResolved] = await Promise.all([
      fetchResolvedStockMarkets(),
      fetchResolvedKalshiMarkets(),
    ]);

    let newPolymarketResolutions = 0;
    let newKalshiResolutions = 0;

    // Process Polymarket resolutions
    for (const market of polymarketResolved) {
      // Check if resolution already exists
      const existing = await db
        .collection('resolutions')
        .where('marketId', '==', market.id)
        .get();

      if (!existing.empty) continue;

      // Use stored snapshots for price history (more reliable than API)
      const history = await fetchSnapshotHistory(db, market.id);

      const resolutionDate = market.endDate
        ? new Date(market.endDate).getTime()
        : Date.now();

      const outcomeBoolean = market.outcome === 'yes';

      let horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};
      let finalProbability: number;
      let brierScore: number;

      if (history.length > 0) {
        // Use price history to calculate horizons and Brier score
        const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
        horizons = calculateHorizons(sortedHistory, resolutionDate, outcomeBoolean);
        finalProbability = sortedHistory[sortedHistory.length - 1].price;
        brierScore = getBestBrierScore(horizons, finalProbability, outcomeBoolean);
      } else {
        // No price history available - use outcome to infer final probability
        // When market resolved to "yes", final probability was ~1.0; for "no", ~0.0
        finalProbability = outcomeBoolean ? 1.0 : 0.0;
        brierScore = calculateBrierScore(finalProbability, outcomeBoolean);
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

      newPolymarketResolutions++;
    }

    // Process Kalshi resolutions
    for (const market of kalshiResolved) {
      // Check if resolution already exists
      const existing = await db
        .collection('resolutions')
        .where('marketId', '==', market.id)
        .get();

      if (!existing.empty) continue;

      // Kalshi doesn't have a public price history API, so use stored snapshots
      const history = await fetchSnapshotHistory(db, market.id);

      const resolutionDate = new Date(market.endDate).getTime();
      const outcomeBoolean = market.outcome === 'yes';

      let horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};
      let finalProbability = market.lastPrice;
      let brierScore: number;

      if (history.length > 0) {
        const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
        horizons = calculateHorizons(sortedHistory, resolutionDate, outcomeBoolean);
        finalProbability = sortedHistory[sortedHistory.length - 1].price;
        brierScore = getBestBrierScore(horizons, finalProbability, outcomeBoolean);
      } else {
        // No snapshot history, use last price from API
        brierScore = calculateBrierScore(finalProbability, outcomeBoolean);
      }

      await db.collection('resolutions').add({
        marketId: market.id,
        slug: market.slug,
        question: market.question,
        sector: market.sector,
        ticker: market.ticker,
        source: 'kalshi',
        resolvedAt: market.endDate,
        resolution: market.outcome,
        finalProbability,
        outcome: market.outcome,
        brierScore,
        volume: market.volume,
        horizons,
      });

      newKalshiResolutions++;
    }

    return NextResponse.json({
      success: true,
      newPolymarketResolutions,
      newKalshiResolutions,
      totalNewResolutions: newPolymarketResolutions + newKalshiResolutions,
      totalPolymarketResolved: polymarketResolved.length,
      totalKalshiResolved: kalshiResolved.length,
    });
  } catch (error) {
    console.error('Resolutions cron error:', error);
    return NextResponse.json({
      error: 'Resolution detection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

// Vercel crons use GET requests
export async function GET(request: NextRequest) {
  return POST(request);
}
