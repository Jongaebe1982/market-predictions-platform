import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fetchPolymarketStockMarkets, fetchPriceHistory } = await import('@/lib/polymarket');
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

    // Store CLOB price history for each market (outside batch for size limits)
    let priceHistoryStored = 0;
    const PRICE_HISTORY_CONCURRENCY = 5;

    for (let i = 0; i < markets.length; i += PRICE_HISTORY_CONCURRENCY) {
      const chunk = markets.slice(i, i + PRICE_HISTORY_CONCURRENCY);
      await Promise.all(
        chunk.map(async (market) => {
          if (!market.sourceId) return;
          try {
            const history = await fetchPriceHistory(market.sourceId);
            if (history.length === 0) return;

            await db.collection('price-history').doc(market.id).set({
              marketId: market.id,
              clobTokenId: market.sourceId,
              history,
              updatedAt: timestamp,
            });
            priceHistoryStored++;
          } catch (err) {
            console.error(`Failed to store price history for ${market.id}:`, err);
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      marketsProcessed: markets.length,
      priceHistoryStored,
      timestamp,
    });
  } catch (error) {
    console.error('Snapshot cron error:', error);
    return NextResponse.json({ error: 'Snapshot failed' }, { status: 500 });
  }
}
