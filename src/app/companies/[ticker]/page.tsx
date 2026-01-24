import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyByTicker } from '@/lib/sector-mapping';
import { MOCK_MARKETS, MOCK_ACCURACY_METRICS } from '@/lib/mock-data';
import { formatCurrency, formatPercentage } from '@/lib/utils';
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
    title: `${company.name} (${company.ticker}) Prediction Markets`,
    description: `Track prediction markets for ${company.name} (${company.ticker}). See accuracy scores, active markets, and historical performance in the ${company.sector} sector.`,
  };
}

async function getCompanyMarkets(ticker: string): Promise<MarketDocument[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return MOCK_MARKETS.filter((m) => m.ticker === ticker && m.status === 'active');
  }
  const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] = await Promise.all([
    import('@/lib/polymarket'),
    import('@/lib/kalshi'),
  ]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  const companyMarkets = allMarkets.filter((m) => m.ticker === ticker && m.status === 'active');
  return companyMarkets.length > 0
    ? companyMarkets
    : MOCK_MARKETS.filter((m) => m.ticker === ticker && m.status === 'active');
}

export default async function CompanyPage({ params }: PageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const company = getCompanyByTicker(upperTicker);

  if (!company) notFound();

  const activeMarkets = await getCompanyMarkets(upperTicker);
  const accuracyData = MOCK_ACCURACY_METRICS.byCompany.find(
    (c) => c.ticker === upperTicker
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/markets" className="hover:text-gray-700">Markets</Link>
        <span>/</span>
        <span className="text-gray-900">{company.name}</span>
      </nav>

      {/* Company Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <span className="text-blue-700 font-bold text-sm">{company.ticker}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">{company.ticker}</Badge>
            <Badge variant="muted">{company.sector}</Badge>
          </div>
        </div>
      </div>

      {/* Accuracy Summary */}
      {accuracyData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Brier Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {accuracyData.averageBrierScore.toFixed(3)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Hit Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(accuracyData.hitRate, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Markets Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{accuracyData.resolvedCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Markets */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Markets for {company.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeMarkets.length === 0 ? (
            <p className="text-gray-500 py-4">No active markets for {company.name} at this time.</p>
          ) : (
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
                        <span className="text-xs text-gray-400">
                          {formatCurrency(market.volume)} vol
                        </span>
                        <Badge variant="muted" className="text-xs">{market.source}</Badge>
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
          )}
        </CardContent>
      </Card>

      {/* SEO Copy Block */}
      <Card>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              {company.name} ({company.ticker}) is tracked across multiple prediction markets in
              the {company.sector} sector. Our platform aggregates market data from Polymarket and
              Kalshi to provide real-time probability estimates for {company.name}-related events
              including earnings outcomes, stock price targets, and corporate milestones.
            </p>
            {accuracyData && (
              <p>
                Historical accuracy for {company.name} markets shows a Brier score
                of {accuracyData.averageBrierScore.toFixed(3)} across {accuracyData.resolvedCount} resolved
                markets, with a hit rate of {formatPercentage(accuracyData.hitRate, 0)}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: company.name,
            tickerSymbol: company.ticker,
            description: `Prediction market data for ${company.name} (${company.ticker})`,
          }),
        }}
      />
    </div>
  );
}

