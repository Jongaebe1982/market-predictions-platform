import { NextRequest, NextResponse } from 'next/server';
import type { StockPrice } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'ticker parameter required' }, { status: 400 });
  }

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (useMock) {
    const mockPrice: StockPrice = {
      ticker: ticker.toUpperCase(),
      price: 150 + Math.random() * 100,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      timestamp: Date.now(),
    };
    return NextResponse.json(mockPrice);
  }

  try {
    const { fetchStockPrice } = await import('@/lib/yahoo-finance');
    const price = await fetchStockPrice(ticker.toUpperCase());
    if (!price) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }
    return NextResponse.json(price);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stock price' }, { status: 500 });
  }
}
