import { NextRequest, NextResponse } from 'next/server';

const BATCH_SIZE = 50;

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fetchAllPolymarketMarkets } = await import('@/lib/polymarket');
    const { fetchAllKalshiMarkets } = await import('@/lib/kalshi');
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const {
      generateMarketContent,
      contentNeedsRegeneration,
    } = await import('@/lib/content/market-explanation');

    // Fetch all active markets from both sources
    const [polymarkets, kalshiMarkets] = await Promise.all([
      fetchAllPolymarketMarkets(),
      fetchAllKalshiMarkets(),
    ]);

    // Filter to active markets and prioritize ones with tickers
    const allMarkets = [...polymarkets, ...kalshiMarkets]
      .filter((m) => m.status === 'active')
      .sort((a, b) => {
        // Prioritize markets with tickers
        if (a.ticker && !b.ticker) return -1;
        if (!a.ticker && b.ticker) return 1;
        // Then by volume
        return b.volume - a.volume;
      });

    const db = getAdminDb();
    const contentCollection = db.collection('market-content');

    // Get existing content docs to check what needs regeneration
    const existingDocs = await contentCollection
      .select('dataHash', 'generatedAt')
      .get();

    const existingContent = new Map<string, { dataHash: string; generatedAt: string }>();
    existingDocs.forEach((doc) => {
      const data = doc.data();
      existingContent.set(doc.id, {
        dataHash: data.dataHash || '',
        generatedAt: data.generatedAt || '',
      });
    });

    // Determine which markets need content generation
    const marketsToGenerate = allMarkets.filter((market) => {
      const existing = existingContent.get(market.id);
      if (!existing) return true;

      // Check if needs regeneration (simple check using data hash approach)
      const { generateDataHash } = require('@/lib/content/market-explanation');
      const currentHash = generateDataHash(market);
      if (existing.dataHash !== currentHash) return true;

      // Check age (max 24 hours)
      const generatedAt = new Date(existing.generatedAt).getTime();
      const ageMs = Date.now() - generatedAt;
      const maxAgeMs = 24 * 60 * 60 * 1000;
      if (ageMs > maxAgeMs) return true;

      return false;
    });

    // Process in batches
    const results = {
      generated: 0,
      skipped: allMarkets.length - marketsToGenerate.length,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < marketsToGenerate.length; i += BATCH_SIZE) {
      const batch = marketsToGenerate.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (market) => {
          try {
            const content = await generateMarketContent({ market });

            // Save to Firestore
            await contentCollection.doc(market.id).set(content);
            results.generated++;
          } catch (error) {
            results.failed++;
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            results.errors.push(`${market.id}: ${errorMsg}`);
            console.error(`Failed to generate content for ${market.id}:`, error);
          }
        })
      );

      // Small delay between batches
      if (i + BATCH_SIZE < marketsToGenerate.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({
      success: true,
      totalMarkets: allMarkets.length,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Content generation cron error:', error);
    return NextResponse.json(
      { error: 'Content generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also support GET for manual triggering (with same auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
