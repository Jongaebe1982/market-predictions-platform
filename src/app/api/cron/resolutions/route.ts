import { NextRequest, NextResponse } from 'next/server';
import { calculateBrierScore } from '@/lib/accuracy-utils';

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
      const finalProbability = market.outcomes[0]?.probability || 0.5;
      const brierScore = calculateBrierScore(finalProbability, outcome === 'yes');

      await db.collection('resolutions').add({
        marketId: market.id,
        slug: market.slug,
        question: market.question,
        sector: market.sector,
        ticker: market.ticker,
        source: market.source,
        resolvedAt: market.resolvedAt || new Date().toISOString(),
        resolution: market.resolution,
        finalProbability,
        outcome,
        brierScore,
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
