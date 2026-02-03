import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompaniesBySector } from '@/lib/sector-mapping';
import { getCompanyOrFallback } from '@/lib/company-discovery';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { CompanyStockChart } from './CompanyStockChart';
import { CompanyAccuracyStats } from './CompanyAccuracyStats';
import { CompanyOverview } from './CompanyOverview';
import type { MarketDocument, CompanyAccuracy } from '@/lib/types';

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

async function getCompanyMarkets(ticker: string): Promise<{ active: MarketDocument[]; resolved: MarketDocument[] }> {
  const allMarkets = await getAllMarketsCached();
  const upperTicker = ticker.toUpperCase();
  const companyMarkets = allMarkets.filter((m) => m.ticker?.toUpperCase() === upperTicker);
  return {
    active: companyMarkets.filter((m) => m.status === 'active'),
    resolved: companyMarkets.filter((m) => m.status === 'resolved'),
  };
}

async function getCompanyAccuracy(ticker: string): Promise<CompanyAccuracy | null> {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();
    const doc = await db.collection('company-accuracy').doc(ticker.toUpperCase()).get();
    if (!doc.exists) return null;
    return doc.data() as CompanyAccuracy;
  } catch (error) {
    console.error('Error fetching company accuracy:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const company = await getCompanyOrFallback(ticker.toUpperCase());
  if (!company) return { title: 'Company Not Found' };

  return {
    title: `${company.name} (${company.ticker}) Prediction Markets`,
    description: `Track prediction markets for ${company.name} (${company.ticker}). See accuracy scores, active markets, and historical performance in the ${company.sector} sector.`,
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const company = await getCompanyOrFallback(upperTicker);

  if (!company) notFound();

  // Fetch data in parallel - all fast operations
  const [markets, stockPriceHistory, accuracy] = await Promise.all([
    getCompanyMarkets(upperTicker),
    import('@/lib/yahoo-finance')
      .then((m) => m.fetchStockPriceHistory(upperTicker, 30))
      .catch(() => []), // Don't block page load if stock fetch fails
    getCompanyAccuracy(upperTicker),
  ]);

  const { active: activeMarkets, resolved: resolvedMarkets } = markets;

  // Get related companies in the same sector
  const relatedCompanies = getCompaniesBySector(company.sector)
    .filter((c) => c.ticker !== upperTicker)
    .slice(0, 5);

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

      {/* Company Overview with rich SEO content */}
      <CompanyOverview
        company={company}
        activeMarketCount={activeMarkets.length}
        resolvedMarketCount={resolvedMarkets.length}
        accuracy={accuracy}
      />

      {/* Accuracy Summary - client-side for real-time updates */}
      <CompanyAccuracyStats ticker={upperTicker} />

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

          {/* SEO Copy Block - Additional Context */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding {company.ticker} Prediction Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                <p>
                  {company.name} ({company.ticker}) is tracked across multiple prediction markets in
                  the {company.sector} sector. Our platform aggregates market data from{' '}
                  <Link href="/sources/polymarket" className="text-blue-600 hover:underline">Polymarket</Link> and{' '}
                  <Link href="/sources/kalshi" className="text-blue-600 hover:underline">Kalshi</Link> to
                  provide real-time probability estimates for {company.name}-related events
                  including earnings outcomes, stock price targets, and corporate milestones.
                </p>

                <h4 className="font-semibold text-gray-900">How Prediction Markets Work</h4>
                <p>
                  Prediction markets allow traders to buy and sell contracts based on the outcome of future events.
                  For {company.ticker}, these markets typically focus on quarterly earnings (will the company beat
                  analyst estimates?), stock price targets (will shares reach a certain price by a specific date?),
                  and corporate events (product launches, leadership changes, acquisitions).
                </p>

                <h4 className="font-semibold text-gray-900">Why Track {company.ticker} Markets?</h4>
                <p>
                  Prediction markets aggregate information from participants with financial incentives to be accurate.
                  Research has shown that these markets often outperform traditional forecasting methods, including
                  analyst consensus estimates. By tracking {company.name} prediction markets, investors and analysts
                  can gain additional perspective on market sentiment and probability-weighted expectations.
                </p>

                <div className="not-prose mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Data sourced from Polymarket and Kalshi. Probabilities reflect market consensus, not investment advice.
                    See our <Link href="/methodology" className="text-blue-600 hover:underline">methodology</Link> for
                    how we calculate accuracy metrics.
                  </p>
                </div>
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
