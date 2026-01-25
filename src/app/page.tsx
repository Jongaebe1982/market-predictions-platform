import Link from 'next/link';
import { SECTOR_COLORS } from '@/lib/constants';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KeyTakeaways } from '@/components/seo/PageSections';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';
import type { MarketDocument } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getMarkets(): Promise<MarketDocument[]> {
  const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] = await Promise.all([
    import('@/lib/polymarket'),
    import('@/lib/kalshi'),
  ]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);
  return [...polymarkets, ...kalshiMarkets];
}

export default async function HomePage() {
  const allMarkets = await getMarkets();

  const activeMarkets = allMarkets.filter((m) => m.status === 'active');
  const totalVolume = allMarkets.reduce((sum, m) => sum + m.volume, 0);
  const earningsMarkets = activeMarkets.filter((m) => m.tags.includes('earnings'));
  const bigMovers = [...activeMarkets]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // Sector breakdown
  const sectorCounts = activeMarkets.reduce<Record<string, number>>((acc, m) => {
    acc[m.sector] = (acc[m.sector] || 0) + 1;
    return acc;
  }, {});

  // Build key takeaways (without accuracy metrics to avoid slow Firestore calls)
  const takeaways = [
    {
      label: 'Active Markets',
      value: activeMarkets.length,
      description: 'open prediction markets',
    },
    {
      label: 'Total Volume',
      value: formatCurrency(totalVolume),
      description: 'traded across all markets',
    },
    {
      label: 'Data Sources',
      value: '2',
      description: 'Polymarket & Kalshi',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Stock & Earnings Prediction Markets
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Track prediction markets from{' '}
          <Link href="/sources/polymarket" className="text-blue-600 hover:underline">Polymarket</Link> and{' '}
          <Link href="/sources/kalshi" className="text-blue-600 hover:underline">Kalshi</Link> covering stocks, earnings, and corporate events.
          See real-time probabilities with{' '}
          <Link href="/methodology" className="text-blue-600 hover:underline">historical accuracy scoring</Link>.
        </p>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways title="Platform Overview" items={takeaways} />

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Active Markets</p>
            <p className="text-2xl font-bold text-gray-900">{activeMarkets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Total Volume</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalVolume)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Earnings Markets</p>
            <p className="text-2xl font-bold text-gray-900">{earningsMarkets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Accuracy Metrics</p>
            <Link
              href="/analytics"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              View →
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              Brier scores & hit rates
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sector Breakdown */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Markets by Sector</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(sectorCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([sector, count]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: SECTOR_COLORS[sector] || '#6b7280' }}
                        />
                        <span className="text-sm text-gray-700">{sector}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Big Movers */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Markets by Volume</CardTitle>
                <Link href="/markets" className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bigMovers.map((market) => (
                  <Link
                    key={market.id}
                    href={`/markets/${market.slug}`}
                    className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {market.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {market.ticker && (
                            <Link href={`/companies/${market.ticker}`}>
                              <Badge variant="info">{market.ticker}</Badge>
                            </Link>
                          )}
                          <Badge variant="muted">{market.sector}</Badge>
                          <span className="text-xs text-gray-400">
                            {formatCurrency(market.volume)} vol
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatPercentage(market.outcomes[0].probability, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Yes</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Earnings Window */}
      {earningsMarkets.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Earnings Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {earningsMarkets.slice(0, 6).map((market) => (
                  <Link
                    key={market.id}
                    href={`/markets/${market.slug}`}
                    className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {market.question}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="default">{market.ticker || 'Earnings'}</Badge>
                      <span className="text-sm font-bold text-blue-600">
                        {formatPercentage(market.outcomes[0].probability, 0)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Explore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/companies"
                className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors text-center"
              >
                <p className="font-medium text-gray-900">All Companies</p>
                <p className="text-xs text-gray-500 mt-1">65+ tracked</p>
              </Link>
              <Link
                href="/analytics"
                className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors text-center"
              >
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-xs text-gray-500 mt-1">Accuracy metrics</p>
              </Link>
              <Link
                href="/methodology"
                className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors text-center"
              >
                <p className="font-medium text-gray-900">Methodology</p>
                <p className="text-xs text-gray-500 mt-1">How we measure</p>
              </Link>
              <Link
                href="/glossary"
                className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors text-center"
              >
                <p className="font-medium text-gray-900">Glossary</p>
                <p className="text-xs text-gray-500 mt-1">Key terms</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JSON-LD Structured Data with SearchAction */}
      <WebSiteJsonLd />
    </div>
  );
}
