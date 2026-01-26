import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyByTicker } from '@/lib/sector-mapping';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { MarketDocument } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const company = getCompanyByTicker(ticker.toUpperCase());
  if (!company) return { title: 'Company Not Found' };

  return {
    title: `${company.name} (${company.ticker}) - All Markets`,
    description: `All active and resolved prediction markets for ${company.name} (${company.ticker}). Track historical predictions and outcomes from Polymarket and Kalshi.`,
  };
}

async function getAllCompanyMarkets(ticker: string): Promise<MarketDocument[]> {
  const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] = await Promise.all([
    import('@/lib/polymarket'),
    import('@/lib/kalshi'),
  ]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  const upperTicker = ticker.toUpperCase();
  return allMarkets.filter((m) => m.ticker?.toUpperCase() === upperTicker);
}

export default async function CompanyMarketsPage({ params }: PageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const company = getCompanyByTicker(upperTicker);

  if (!company) notFound();

  const allMarkets = await getAllCompanyMarkets(upperTicker);
  const activeMarkets = allMarkets.filter((m) => m.status === 'active');
  const resolvedMarkets = allMarkets.filter((m) => m.status === 'resolved');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link href="/companies" className="hover:text-gray-700">Companies</Link>
        <span>/</span>
        <Link href={`/companies/${company.ticker}`} className="hover:text-gray-700">{company.ticker}</Link>
        <span>/</span>
        <span className="text-gray-900">Markets</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <span className="text-blue-700 font-bold text-sm">{company.ticker}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All {company.name} Markets</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">{company.ticker}</Badge>
            <Badge variant="muted">{company.sector}</Badge>
            <span className="text-sm text-gray-500">{allMarkets.length} total markets</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Total Markets</p>
            <p className="text-2xl font-bold text-gray-900">{allMarkets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeMarkets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-gray-600">{resolvedMarkets.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Markets */}
      {activeMarkets.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeMarkets.map((market) => (
                <Link
                  key={market.id}
                  href={`/markets/${market.slug}`}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{market.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="muted" className="text-xs">{market.source}</Badge>
                        <span className="text-xs text-gray-400">
                          {formatCurrency(market.volume)} vol
                        </span>
                        {market.endDate && (
                          <span className="text-xs text-gray-400">
                            Ends {formatDate(market.endDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {formatPercentage(market.outcomes[0]?.probability || 0, 0)}
                      </p>
                      <p className="text-xs text-gray-500">Yes</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolved Markets */}
      {resolvedMarkets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resolved Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedMarkets.map((market) => (
                <Link
                  key={market.id}
                  href={`/markets/${market.slug}`}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors opacity-75"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700">{market.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="muted" className="text-xs">{market.source}</Badge>
                        <span className="text-xs text-gray-400">
                          {formatCurrency(market.volume)} vol
                        </span>
                        <Badge variant="muted" className="text-xs">Resolved</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-500">
                        {formatPercentage(market.outcomes[0]?.probability || 0, 0)}
                      </p>
                      <p className="text-xs text-gray-400">Final</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allMarkets.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-gray-500 py-8 text-center">
              No markets found for {company.name}. Check back later for new predictions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
