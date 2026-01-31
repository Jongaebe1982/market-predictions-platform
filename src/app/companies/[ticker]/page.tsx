import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompaniesBySector } from '@/lib/sector-mapping';
import { getCompanyByTickerAsync } from '@/lib/company-discovery';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { KeyTakeaways } from '@/components/seo/PageSections';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { CompanyStockChart } from './CompanyStockChart';
import type { MarketDocument } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

// Cache for combined markets to avoid refetching on every company page
let marketsCache: { data: MarketDocument[]; timestamp: number } | null = null;
const MARKETS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

async function getAllMarketsCached(): Promise<MarketDocument[]> {
  const now = Date.now();
  if (marketsCache && now - marketsCache.timestamp < MARKETS_CACHE_TTL) {
    return marketsCache.data;
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
  marketsCache = { data: allMarkets, timestamp: now };
  return allMarkets;
}

async function getCompanyMarkets(ticker: string): Promise<MarketDocument[]> {
  const allMarkets = await getAllMarketsCached();
  const upperTicker = ticker.toUpperCase();
  return allMarkets.filter((m) => m.ticker?.toUpperCase() === upperTicker && m.status === 'active');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const company = await getCompanyByTickerAsync(ticker.toUpperCase());
  if (!company) return { title: 'Company Not Found' };

  // Check if company has any active markets for noindex decision
  const activeMarkets = await getCompanyMarkets(ticker.toUpperCase());
  const hasMarkets = activeMarkets.length > 0;

  return {
    title: `${company.name} (${company.ticker}) Prediction Markets`,
    description: `Track prediction markets for ${company.name} (${company.ticker}). See accuracy scores, active markets, and historical performance in the ${company.sector} sector.`,
    // noindex companies with no active markets
    robots: hasMarkets ? undefined : { index: false, follow: true },
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const company = await getCompanyByTickerAsync(upperTicker);

  if (!company) notFound();

  // Use cached metrics for fast page loads (updated by cron job)
  // Stock price fetched in parallel with short timeout
  const [activeMarkets, accuracyMetrics, stockPriceHistory] = await Promise.all([
    getCompanyMarkets(upperTicker),
    import('@/lib/accuracy-compute').then((m) => m.fetchCachedAccuracyMetrics()),
    import('@/lib/yahoo-finance')
      .then((m) => m.fetchStockPriceHistory(upperTicker, 30))
      .catch(() => []), // Don't block page load if stock fetch fails
  ]);

  const accuracyData = accuracyMetrics.byCompany.find(
    (c) => c.ticker === upperTicker
  );

  // Get related companies in the same sector
  const relatedCompanies = getCompaniesBySector(company.sector)
    .filter((c) => c.ticker !== upperTicker)
    .slice(0, 5);

  // Build key takeaways
  const takeaways = [];
  takeaways.push({
    label: 'Active Markets',
    value: activeMarkets.length,
    description: 'open prediction markets',
  });
  if (accuracyData) {
    takeaways.push({
      label: 'Brier Score',
      value: accuracyData.averageBrierScore.toFixed(3),
      description: 'lower is better',
    });
    takeaways.push({
      label: 'Hit Rate',
      value: formatPercentage(accuracyData.hitRate, 0),
      description: `across ${accuracyData.resolvedCount} resolved markets`,
    });
  }
  takeaways.push({
    label: 'Sector',
    value: company.sector,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs with JSON-LD */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Companies', href: '/companies' },
          { label: company.name },
        ]}
      />

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

      {/* Key Takeaways */}
      <KeyTakeaways items={takeaways} />

      {/* Accuracy Summary */}
      {accuracyData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Brier Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {accuracyData.averageBrierScore.toFixed(3)}
              </p>
              <Link href="/methodology#brier-score" className="text-xs text-blue-600 hover:underline">
                What is this?
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Hit Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(accuracyData.hitRate, 0)}
              </p>
              <Link href="/methodology#calibration" className="text-xs text-blue-600 hover:underline">
                Learn more
              </Link>
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

      {/* Stock Price Chart */}
      <CompanyStockChart
        stockPriceHistory={stockPriceHistory}
        ticker={company.ticker}
        companyName={company.name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Active Markets */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Markets for {company.name}</CardTitle>
                <Link
                  href={`/companies/${company.ticker}/markets`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
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
                            <Link href={`/sources/${market.source}`}>
                              <Badge variant="muted" className="text-xs">{market.source}</Badge>
                            </Link>
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
                  the {company.sector} sector. Our platform aggregates market data from{' '}
                  <Link href="/sources/polymarket" className="text-blue-600 hover:underline">Polymarket</Link> and{' '}
                  <Link href="/sources/kalshi" className="text-blue-600 hover:underline">Kalshi</Link> to
                  provide real-time probability estimates for {company.name}-related events
                  including earnings outcomes, stock price targets, and corporate milestones.
                </p>
                {accuracyData && (
                  <p>
                    Historical accuracy for {company.name} markets shows a{' '}
                    <Link href="/glossary#brier-score" className="text-blue-600 hover:underline">Brier score</Link>{' '}
                    of {accuracyData.averageBrierScore.toFixed(3)} across {accuracyData.resolvedCount} resolved
                    markets, with a hit rate of {formatPercentage(accuracyData.hitRate, 0)}.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Companies */}
          {relatedCompanies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>More in {company.sector}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedCompanies.map((related) => (
                    <Link
                      key={related.ticker}
                      href={`/companies/${related.ticker}`}
                      className="block text-sm text-blue-600 hover:text-blue-700"
                    >
                      {related.name} ({related.ticker})
                    </Link>
                  ))}
                </div>
                <Link
                  href="/companies"
                  className="text-sm text-gray-500 hover:text-gray-700 mt-3 inline-block"
                >
                  View all companies →
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href="/methodology"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  How we measure accuracy →
                </Link>
                <Link
                  href="/analytics"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Full analytics dashboard →
                </Link>
                <Link
                  href="/glossary"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Glossary of terms →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* JSON-LD */}
      <OrganizationJsonLd
        name={company.name}
        ticker={company.ticker}
        description={`Prediction market data and analytics for ${company.name} (${company.ticker}) in the ${company.sector} sector. Track active markets, accuracy scores, historical performance, and real-time probability updates from Polymarket and Kalshi.`}
      />
    </div>
  );
}
