import { NextRequest, NextResponse } from 'next/server';
import type { MarketDocument, PricePoint } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { fetchPolymarketStockMarkets, fetchPriceHistory } = await import('@/lib/polymarket');
  const { fetchKalshiStockMarkets } = await import('@/lib/kalshi');

  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];

  const market: MarketDocument | undefined = allMarkets.find((m) => m.slug === slug);
  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  }

  const priceHistory: PricePoint[] = market.source === 'polymarket'
    ? await fetchPriceHistory(market.sourceId)
    : [];

  const relatedMarkets = allMarkets.filter(
    (m) => m.id !== market.id && (m.sector === market.sector || m.ticker === market.ticker)
  ).slice(0, 4);

  return NextResponse.json({ market, priceHistory, relatedMarkets });
}
