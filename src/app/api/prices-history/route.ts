import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const market = searchParams.get('market');

  if (!market) {
    return NextResponse.json({ error: 'market parameter required' }, { status: 400 });
  }

  try {
    const { fetchPriceHistory } = await import('@/lib/polymarket');
    const history = await fetchPriceHistory(market);
    return NextResponse.json(history);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
