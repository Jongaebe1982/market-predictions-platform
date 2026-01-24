import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fetchPolymarketStockMarkets } = await import('@/lib/polymarket');
    const { getAdminDb } = await import('@/lib/firebase-admin');

    const markets = await fetchPolymarketStockMarkets();
    const db = getAdminDb();
    const batch = db.batch();
    const timestamp = new Date().toISOString();

    for (const market of markets) {
      // Update market document
      const marketRef = db.collection('markets').doc(market.id);
      batch.set(marketRef, { ...market, updatedAt: timestamp }, { merge: true });

      // Create snapshot
      const snapshotRef = db.collection('snapshots').doc();
      batch.set(snapshotRef, {
        marketId: market.id,
        slug: market.slug,
        timestamp,
        outcomes: market.outcomes.map((o) => ({ name: o.name, probability: o.probability })),
        volume: market.volume,
        source: market.source,
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      marketsProcessed: markets.length,
      timestamp,
    });
  } catch (error) {
    console.error('Snapshot cron error:', error);
    return NextResponse.json({ error: 'Snapshot failed' }, { status: 500 });
  }
}
