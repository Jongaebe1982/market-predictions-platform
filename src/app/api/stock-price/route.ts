import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'ticker parameter required' }, { status: 400 });
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
