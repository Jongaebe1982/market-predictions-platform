import type { Metadata } from 'next';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { MarketDocument } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Polymarket Source',
  description: 'Accuracy metrics and active markets from Polymarket. Track prediction market performance with Brier scores, hit rates, and historical data.',
};

// Use dynamic rendering to avoid Firestore quota issues during build
export const dynamic = 'force-dynamic';

async function getPolymarketData(): Promise<{
  markets: MarketDocument[];
  accuracy: {
    averageBrierScore: number;
    hitRate: number;
    resolvedCount: number;
  };
}> {
  const [{ fetchPolymarketStockMarkets }, { computeRealAccuracyMetrics }] = await Promise.all([
    import('@/lib/polymarket'),
    import('@/lib/accuracy-compute'),
  ]);

  const [markets, accuracyMetrics] = await Promise.all([
    fetchPolymarketStockMarkets(),
    computeRealAccuracyMetrics(),
  ]);

  const sourceMetrics = accuracyMetrics.bySource.find((s) => s.source === 'polymarket');

  return {
    markets,
    accuracy: sourceMetrics || {
      averageBrierScore: 0,
      hitRate: 0,
      resolvedCount: 0,
    },
  };
}

export default async function PolymarketSourcePage() {
  const { markets, accuracy } = await getPolymarketData();
  const activeMarkets = markets.filter((m) => m.status === 'active');
  const totalVolume = markets.reduce((sum, m) => sum + m.volume, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Polymarket</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="text-purple-700 font-bold text-sm">PM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Polymarket</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Polymarket is a decentralized prediction market platform built on Polygon.
          Markets cover a wide range of topics including stocks, earnings, and corporate events.
          All probabilities and volume data are sourced directly from Polymarket&apos;s public API.
        </p>
      </div>

      {/* Stats */}
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
            <p className="text-sm text-gray-500">Brier Score</p>
            <p className="text-2xl font-bold text-blue-600">
              {accuracy.resolvedCount > 0 ? accuracy.averageBrierScore.toFixed(3) : '—'}
            </p>
            <p className="text-xs text-gray-400">Lower is better</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Hit Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {accuracy.resolvedCount > 0 ? formatPercentage(accuracy.hitRate, 0) : '—'}
            </p>
            <p className="text-xs text-gray-400">{accuracy.resolvedCount} resolved markets</p>
          </CardContent>
        </Card>
      </div>

      {/* About Polymarket */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About Polymarket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              Polymarket operates on the Polygon blockchain, allowing users to trade outcome shares
              that pay out $1 if the predicted event occurs. Market prices directly reflect the
              crowd&apos;s probability estimate for each outcome.
            </p>
            <p className="mt-3">
              <strong>How it works:</strong> Traders buy and sell shares priced between $0.00 and $1.00.
              A share priced at $0.65 implies a 65% probability. When the market resolves, shares
              of the winning outcome pay $1 each, while losing shares become worthless.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Active Markets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Active Markets</CardTitle>
            <Link href="/markets" className="text-sm text-blue-600 hover:text-blue-700">
              View all markets
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activeMarkets.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No active Polymarket markets at this time.</p>
          ) : (
            <div className="space-y-3">
              {activeMarkets
                .sort((a, b) => b.volume - a.volume)
                .slice(0, 10)
                .map((market) => (
                  <Link
                    key={market.id}
                    href={`/markets/${market.slug}`}
                    className="block p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{market.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {market.ticker && <Badge variant="info">{market.ticker}</Badge>}
                          <Badge variant="muted">{market.sector}</Badge>
                          <span className="text-xs text-gray-400">
                            {formatCurrency(market.volume)} vol
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">
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

      {/* Links */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/analytics"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View full accuracy analytics →
        </Link>
        <Link
          href="/methodology"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          How we measure accuracy →
        </Link>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Polymarket',
            description: 'Decentralized prediction market platform on Polygon blockchain',
            url: 'https://polymarket.com',
          }),
        }}
      />
    </div>
  );
}
