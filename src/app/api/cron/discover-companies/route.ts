import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fetchPolymarketStockMarkets } = await import('@/lib/polymarket');
    const { fetchKalshiStockMarkets } = await import('@/lib/kalshi');
    const {
      isStaticCompany,
      saveDiscoveredCompany,
      fetchDiscoveredCompanies,
      inferSector,
      generateAliases,
    } = await import('@/lib/company-discovery');
    const { resolveTickerFromName } = await import('@/lib/yahoo-finance');

    // Fetch all markets from both sources
    const [polymarkets, kalshiMarkets] = await Promise.all([
      fetchPolymarketStockMarkets(),
      fetchKalshiStockMarkets(),
    ]);

    const allMarkets = [...polymarkets, ...kalshiMarkets];

    // Get already discovered companies to avoid re-processing
    const alreadyDiscovered = await fetchDiscoveredCompanies();
    const discoveredTickers = new Set(
      alreadyDiscovered.map((c) => c.ticker.toUpperCase())
    );

    // Find markets with tickers that aren't in static mappings or already discovered
    const newTickers = new Map<
      string,
      { ticker: string; question: string; source: 'polymarket' | 'kalshi' }
    >();

    for (const market of allMarkets) {
      if (!market.ticker) continue;

      const ticker = market.ticker.toUpperCase();

      // Skip if already known (static or discovered)
      if (isStaticCompany(ticker)) continue;
      if (discoveredTickers.has(ticker)) continue;

      // Skip if we've already seen this ticker in this run
      if (newTickers.has(ticker)) continue;

      newTickers.set(ticker, {
        ticker,
        question: market.question,
        source: market.source as 'polymarket' | 'kalshi',
      });
    }

    // Process new tickers - use Yahoo Finance to get company info
    const discovered: string[] = [];
    const failed: string[] = [];

    // Process in batches to avoid rate limiting
    const tickerEntries = Array.from(newTickers.values());
    const BATCH_SIZE = 5;

    for (let i = 0; i < tickerEntries.length; i += BATCH_SIZE) {
      const batch = tickerEntries.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async ({ ticker, question, source }) => {
          try {
            // Use Yahoo Finance to get company info
            const { default: YahooFinance } = await import('yahoo-finance2');
            const yf = new YahooFinance();

            const quote = await yf.quote(ticker);

            if (!quote || !quote.shortName) {
              // If Yahoo Finance doesn't have the ticker, skip
              console.log(`Skipping ${ticker} - no Yahoo Finance data`);
              failed.push(ticker);
              return;
            }

            const companyName = quote.shortName || quote.longName || ticker;
            const sector = inferSector(companyName, ticker);
            const aliases = generateAliases(companyName, ticker);

            const saved = await saveDiscoveredCompany({
              ticker: ticker.toUpperCase(),
              name: companyName,
              sector,
              aliases,
              discoveredFrom: source,
              marketQuestion: question,
            });

            if (saved) {
              discovered.push(`${companyName} (${ticker})`);
            }
          } catch (error) {
            console.error(`Failed to process ticker ${ticker}:`, error);
            failed.push(ticker);
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < tickerEntries.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return NextResponse.json({
      success: true,
      marketsScanned: allMarkets.length,
      newTickersFound: newTickers.size,
      companiesDiscovered: discovered.length,
      discovered,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Company discovery cron error:', error);
    return NextResponse.json({ error: 'Discovery failed' }, { status: 500 });
  }
}

// Also support GET for manual triggering (with same auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
