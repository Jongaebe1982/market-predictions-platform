import type { Metadata } from 'next';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { MarketDocument } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Kalshi Source',
  description: 'Accuracy metrics and active markets from Kalshi. Track CFTC-regulated prediction market performance with Brier scores, hit rates, and historical data.',
};

export const revalidate = 3600; // ISR: revalidate every hour

async function getKalshiData(): Promise<{
  markets: MarketDocument[];
  accuracy: {
    averageBrierScore: number;
    hitRate: number;
    resolvedCount: number;
  };
}> {
  const [{ fetchKalshiStockMarkets }, { computeRealAccuracyMetrics }] = await Promise.all([
    import('@/lib/kalshi'),
    import('@/lib/accuracy-compute'),
  ]);

  const [markets, accuracyMetrics] = await Promise.all([
    fetchKalshiStockMarkets(),
    computeRealAccuracyMetrics(),
  ]);

  const sourceMetrics = accuracyMetrics.bySource.find((s) => s.source === 'kalshi');

  return {
    markets,
    accuracy: sourceMetrics || {
      averageBrierScore: 0,
      hitRate: 0,
      resolvedCount: 0,
    },
  };
}

export default async function KalshiSourcePage() {
  const { markets, accuracy } = await getKalshiData();
  const activeMarkets = markets.filter((m) => m.status === 'active');
  const totalVolume = markets.reduce((sum, m) => sum + m.volume, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Kalshi</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <span className="text-orange-700 font-bold text-sm">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kalshi</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Kalshi is a CFTC-regulated prediction market exchange based in the United States.
          Markets cover economic indicators, company events, and other measurable outcomes.
          All data is sourced directly from Kalshi&apos;s public API.
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

      {/* About Kalshi */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About Kalshi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              Kalshi is the first federally regulated exchange for trading on event outcomes
              in the United States. Regulated by the CFTC (Commodity Futures Trading Commission),
              Kalshi allows US residents to legally trade on prediction markets.
            </p>
            <p className="mt-3">
              <strong>How it works:</strong> Contracts trade between $0.01 and $0.99, representing
              the market&apos;s probability estimate. Winning contracts pay out $1.00, while losing
              contracts expire worthless. All trades are cleared through regulated infrastructure.
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
            <p className="text-gray-500 py-4 text-center">No active Kalshi markets at this time.</p>
          ) : (
            <div className="space-y-3">
              {activeMarkets
                .sort((a, b) => b.volume - a.volume)
                .slice(0, 10)
                .map((market) => (
                  <Link
                    key={market.id}
                    href={`/markets/${market.slug}`}
                    className="block p-3 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/20 transition-colors"
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
                        <p className="text-lg font-bold text-orange-600">
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
            name: 'Kalshi',
            description: 'CFTC-regulated prediction market exchange',
            url: 'https://kalshi.com',
          }),
        }}
      />
    </div>
  );
}
