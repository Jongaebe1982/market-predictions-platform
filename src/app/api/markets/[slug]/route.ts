import { NextRequest, NextResponse } from 'next/server';
import { MOCK_MARKETS } from '@/lib/mock-data';
import { generateMockPriceHistory } from '@/lib/mock-data';
import type { MarketDocument, PricePoint } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  let market: MarketDocument | null = null;
  let priceHistory: PricePoint[] = [];
  let relatedMarkets: MarketDocument[] = [];

  if (useMock) {
    market = MOCK_MARKETS.find((m) => m.slug === slug) || null;
    if (market) {
      priceHistory = generateMockPriceHistory(30, market.outcomes[0]?.probability || 0.5);
      relatedMarkets = MOCK_MARKETS.filter(
        (m) => m.id !== market!.id && (m.sector === market!.sector || m.ticker === market!.ticker)
      ).slice(0, 4);
    }
  } else {
    const { fetchPolymarketStockMarkets } = await import('@/lib/polymarket');
    const { fetchPriceHistory } = await import('@/lib/polymarket');
    const allMarkets = await fetchPolymarketStockMarkets();
    market = allMarkets.find((m) => m.slug === slug) || null;

    if (market) {
      priceHistory = await fetchPriceHistory(market.sourceId);
      relatedMarkets = allMarkets.filter(
        (m) => m.id !== market!.id && (m.sector === market!.sector || m.ticker === market!.ticker)
      ).slice(0, 4);
    }
  }

  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  }

  return NextResponse.json({ market, priceHistory, relatedMarkets });
}
