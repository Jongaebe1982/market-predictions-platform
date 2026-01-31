import { NextRequest, NextResponse } from 'next/server';
import { getCompanyByTicker } from '@/lib/sector-mapping';
import type { CompanyData, CompanyAccuracy } from '@/lib/types';

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

  const { fetchPolymarketStockMarkets } = await import('@/lib/polymarket');
  const { getAdminDb } = await import('@/lib/firebase-admin');

  const db = getAdminDb();

  const [allMarkets, accuracyDoc] = await Promise.all([
    fetchPolymarketStockMarkets(),
    db.collection('company-accuracy').doc(upperTicker).get(),
  ]);

  const activeMarkets = allMarkets.filter((m) => m.ticker === upperTicker && m.status === 'active');
  const accuracyData = accuracyDoc.exists ? (accuracyDoc.data() as CompanyAccuracy) : null;

  const companyData: CompanyData = {
    ticker: upperTicker,
    name: company.name,
    sector: company.sector,
    activeMarkets,
    accuracy: accuracyData,
  };

  return NextResponse.json(companyData);
}
