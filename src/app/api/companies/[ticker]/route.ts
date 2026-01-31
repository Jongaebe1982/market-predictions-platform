import { NextRequest, NextResponse } from 'next/server';
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

  const [{ fetchPolymarketStockMarkets }, { fetchCachedAccuracyMetrics }] = await Promise.all([
    import('@/lib/polymarket'),
    import('@/lib/accuracy-compute'),
  ]);

  const [allMarkets, accuracyMetrics] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchCachedAccuracyMetrics(),
  ]);

  const activeMarkets = allMarkets.filter((m) => m.ticker === upperTicker && m.status === 'active');
  const accuracyData = accuracyMetrics.byCompany.find((c) => c.ticker === upperTicker) || null;

  const companyData: CompanyData = {
    ticker: upperTicker,
    name: company.name,
    sector: company.sector,
    activeMarkets,
    accuracy: accuracyData,
  };

  return NextResponse.json(companyData);
}
