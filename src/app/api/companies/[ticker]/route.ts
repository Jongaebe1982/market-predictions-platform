import { NextRequest, NextResponse } from 'next/server';
import { MOCK_MARKETS, MOCK_ACCURACY_METRICS } from '@/lib/mock-data';
import { getCompanyByTicker } from '@/lib/sector-mapping';
import type { CompanyData } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const company = getCompanyByTicker(upperTicker);

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  let activeMarkets;
  if (useMock) {
    activeMarkets = MOCK_MARKETS.filter((m) => m.ticker === upperTicker && m.status === 'active');
  } else {
    const { fetchPolymarketStockMarkets } = await import('@/lib/polymarket');
    const allMarkets = await fetchPolymarketStockMarkets();
    activeMarkets = allMarkets.filter((m) => m.ticker === upperTicker && m.status === 'active');
  }

  const accuracyData = MOCK_ACCURACY_METRICS.byCompany.find((c) => c.ticker === upperTicker) || null;

  const companyData: CompanyData = {
    ticker: upperTicker,
    name: company.name,
    sector: company.sector,
    activeMarkets,
    accuracy: accuracyData,
  };

  return NextResponse.json(companyData);
}
