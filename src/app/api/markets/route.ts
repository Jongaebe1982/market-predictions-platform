import { NextRequest, NextResponse } from 'next/server';
import { MOCK_MARKETS } from '@/lib/mock-data';
import { PAGE_SIZE } from '@/lib/constants';
import type { MarketDocument, PaginatedResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sector = searchParams.get('sector');
  const source = searchParams.get('source');
  const ticker = searchParams.get('ticker');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');
  const earnings = searchParams.get('earnings');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  let markets: MarketDocument[];

  if (useMock) {
    markets = [...MOCK_MARKETS];
  } else {
    // In production, fetch from Polymarket/Kalshi or Firestore
    const { fetchPolymarketStockMarkets } = await import('@/lib/polymarket');
    const { fetchKalshiStockMarkets } = await import('@/lib/kalshi');

    const [polymarkets, kalshiMarkets] = await Promise.all([
      fetchPolymarketStockMarkets(),
      fetchKalshiStockMarkets(),
    ]);
    markets = [...polymarkets, ...kalshiMarkets];
  }

  // Apply filters
  if (sector) markets = markets.filter((m) => m.sector === sector);
  if (source) markets = markets.filter((m) => m.source === source);
  if (ticker) markets = markets.filter((m) => m.ticker === ticker);
  if (status) markets = markets.filter((m) => m.status === status);
  if (earnings === 'true') markets = markets.filter((m) => m.tags.includes('earnings'));
  if (search) {
    const q = search.toLowerCase();
    markets = markets.filter(
      (m) =>
        m.question.toLowerCase().includes(q) ||
        m.companyName?.toLowerCase().includes(q) ||
        m.ticker?.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (sort) {
    case 'volume':
      markets.sort((a, b) => b.volume - a.volume);
      break;
    case 'probability':
      markets.sort((a, b) => (b.outcomes[0]?.probability || 0) - (a.outcomes[0]?.probability || 0));
      break;
    case 'recent':
      markets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case 'ending-soon':
      markets.sort((a, b) => {
        const aEnd = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bEnd = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return aEnd - bEnd;
      });
      break;
    default:
      markets.sort((a, b) => b.volume - a.volume);
  }

  // Paginate
  const total = markets.length;
  const start = (page - 1) * PAGE_SIZE;
  const paginatedMarkets = markets.slice(start, start + PAGE_SIZE);

  const response: PaginatedResponse<MarketDocument> = {
    data: paginatedMarkets,
    total,
    page,
    pageSize: PAGE_SIZE,
    hasMore: start + PAGE_SIZE < total,
  };

  return NextResponse.json(response);
}
