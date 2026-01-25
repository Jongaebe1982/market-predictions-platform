import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCachedAccuracyMetrics } from '@/lib/accuracy-compute';
import { formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AccuracyCharts } from './AccuracyCharts';
import { IncludedMarketsSection } from './IncludedMarketsSection';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PageContents, KeyTakeaways, DataFreshness } from '@/components/seo/PageSections';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Prediction market analytics: horizon-based Brier scores, volume analysis, and source comparison for stock and earnings outcomes.',
};

// Use dynamic rendering to avoid Firestore quota issues during build
export const dynamic = 'force-dynamic';

export default async function AccuracyPage() {
  // Use fast cached metrics from Firestore (pre-computed by cron job)
  const metrics = await fetchCachedAccuracyMetrics();

  // Build key takeaways with actual numbers
  const takeaways = [
    {
      label: 'Average Brier Score',
      value: metrics.overall.averageBrierScore.toFixed(3),
      description: 'at 1-month horizon (lower is better)',
    },
    {
      label: 'Hit Rate',
      value: formatPercentage(metrics.overall.hitRate, 0),
      description: 'directional accuracy',
    },
    {
      label: 'Markets Scored',
      value: metrics.overall.totalResolved,
      description: 'resolved with price history',
    },
    {
      label: 'Markets Tracked',
      value: metrics.includedMarkets.length,
      description: 'active + resolved total',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Analytics' },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prediction Market Analytics</h1>
        <p className="text-gray-600 max-w-3xl">
          We observe and store resolved prediction market data to track accuracy over time.
          Below you&apos;ll find Brier scores, hit rates, and calibration metrics across different
          time horizons, sources, and sectors.
        </p>
        <DataFreshness refreshInterval="hourly" />
      </div>

      {/* Page Contents */}
      <PageContents
        items={[
          { label: 'Key Takeaways', anchor: 'key-takeaways' },
          { label: 'Methodology Overview', anchor: 'methodology' },
          { label: 'Accuracy by Time Horizon', anchor: 'time-horizons' },
          { label: 'Accuracy by Volume', anchor: 'volume' },
          { label: 'Accuracy by Source', anchor: 'source' },
          { label: 'Accuracy by Sector', anchor: 'sector' },
          { label: 'Accuracy by Company', anchor: 'company' },
          { label: 'All Tracked Markets', anchor: 'markets' },
        ]}
      />

      {/* Key Takeaways */}
      <section id="key-takeaways" className="scroll-mt-20">
        <KeyTakeaways items={takeaways} />
      </section>

      {/* Methodology section */}
      <section id="methodology" className="scroll-mt-20">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Methodology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">How we measure</h4>
              <p>
                For each resolved market, we take the market&apos;s probability at <strong>1 month,
                2 weeks, 1 week, 24 hours, and 12 hours before close</strong> (or the earliest
                available snapshot if the market existed for less than 30 days) and compare it to
                the actual outcome. This gives a meaningful accuracy measure — not the trivial
                ~100% probability at market close when the answer is already known.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">What we store</h4>
              <p>
                For all open markets we observe and store probabilities at each time horizon.
                For each market we record the company or index name, sector, volume traded, and
                actual outcome — so we can report this data back to users.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Worked example</h4>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs">
                <p className="mb-1"><span className="text-gray-500">Market:</span> &quot;Will AAPL beat Q4 earnings?&quot;</p>
                <p className="mb-1"><span className="text-gray-500">1 month before close:</span> probability = 72%</p>
                <p className="mb-1"><span className="text-gray-500">Actual outcome:</span> Yes (AAPL beat earnings)</p>
                <p className="mb-1"><span className="text-gray-500">Brier Score:</span> (0.72 - 1)&sup2; = 0.078</p>
                <p className="text-gray-500 mt-2">0 = perfect, 0.25 = random guessing, 1 = always wrong.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Brier Score</h4>
                <p className="text-xs">
                  (prediction - outcome)&sup2;. Measures how far the 1-month prediction was from what
                  actually happened. Lower is better.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Hit Rate</h4>
                <p className="text-xs">
                  Percentage of markets where the 1-month prediction (&gt;50%) matched the actual outcome.
                  Directional accuracy.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Calibration</h4>
                <p className="text-xs">
                  Whether predicted probabilities match observed frequencies. If markets say &quot;70% likely,&quot;
                  the event should happen ~70% of the time.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/methodology" className="text-sm text-blue-600 hover:text-blue-700">
                Read full methodology →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      </section>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Avg Brier Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.overall.averageBrierScore.toFixed(3)}
            </p>
            <p className="text-xs text-gray-400 mt-1">At 1-month horizon (lower = better)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Hit Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {formatPercentage(metrics.overall.hitRate, 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Directional accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Markets Scored</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.overall.totalResolved}
            </p>
            <p className="text-xs text-gray-400 mt-1">Resolved with price history</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Markets Tracked</p>
            <p className="text-3xl font-bold text-blue-600">
              {metrics.includedMarkets.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Active + resolved total</p>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy by Time Horizon */}
      <section id="time-horizons" className="scroll-mt-20">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Accuracy by Time Horizon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            How prediction accuracy changes at different lead times. The headline Brier score above uses
            the earliest available horizon (1 month preferred). This table shows all horizons for comparison.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Time Before Event</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Sample Size</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Brier Score</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Hit Rate</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byHorizon.map((h) => (
                  <tr key={h.horizon} className="border-b border-gray-100">
                    <td className="py-3 px-2 font-medium text-gray-900">{h.label}</td>
                    <td className="py-3 px-2 text-right text-gray-600">n={h.sampleSize}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={h.averageBrierScore < 0.15 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                        {h.averageBrierScore.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={h.hitRate >= 0.75 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                        {formatPercentage(h.hitRate, 0)}
                      </span>
                    </td>
                    <td className="py-3 px-2 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.max(0, (1 - h.averageBrierScore / 0.25) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Bar shows relative accuracy (Brier score vs. 0.25 random baseline). Markets become more
            accurate as the event approaches.
          </p>
        </CardContent>
      </Card>
      </section>

      {/* Charts (client component) */}
      <AccuracyCharts metrics={metrics} />

      {/* Accuracy by Volume */}
      <section id="volume" className="scroll-mt-20">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Accuracy by Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Do higher-volume markets produce more accurate predictions? Volume indicates market
            liquidity and participant interest.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Volume Bucket</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Markets</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Brier Score</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Hit Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byVolume
                  .filter((v) => v.resolvedCount > 0)
                  .map((v) => (
                    <tr key={v.bucket} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-2 font-medium text-gray-900">{v.bucket}</td>
                      <td className="py-2.5 px-2 text-right text-gray-600">{v.resolvedCount}</td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={v.averageBrierScore < 0.15 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                          {v.averageBrierScore.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={v.hitRate >= 0.75 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                          {formatPercentage(v.hitRate, 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                {metrics.byVolume.every((v) => v.resolvedCount === 0) && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">
                      No volume data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </section>

      {/* Accuracy by Source */}
      <section id="source" className="scroll-mt-20">
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accuracy by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Comparing prediction accuracy across different platforms. Horizon breakdowns show
            how each source performs at different lead times.
          </p>
          {metrics.bySource.length > 0 ? (
            <div className="space-y-6">
              {metrics.bySource.map((s) => (
                <div key={s.source} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 capitalize">{s.source}</h4>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{s.resolvedCount} markets</span>
                      <span>Brier: {s.averageBrierScore.toFixed(3)}</span>
                      <span>Hit: {formatPercentage(s.hitRate, 0)}</span>
                    </div>
                  </div>
                  {s.byHorizon.filter((h) => h.sampleSize > 0).length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 px-2 font-medium text-gray-400">Horizon</th>
                            <th className="text-right py-2 px-2 font-medium text-gray-400">n</th>
                            <th className="text-right py-2 px-2 font-medium text-gray-400">Brier</th>
                            <th className="text-right py-2 px-2 font-medium text-gray-400">Hit Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.byHorizon
                            .filter((h) => h.sampleSize > 0)
                            .map((h) => (
                              <tr key={h.horizon} className="border-b border-gray-50">
                                <td className="py-1.5 px-2 text-gray-700">{h.label}</td>
                                <td className="py-1.5 px-2 text-right text-gray-500">{h.sampleSize}</td>
                                <td className="py-1.5 px-2 text-right text-gray-700">{h.averageBrierScore.toFixed(3)}</td>
                                <td className="py-1.5 px-2 text-right text-gray-700">{formatPercentage(h.hitRate, 0)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No source data available yet</p>
          )}
        </CardContent>
      </Card>
      </section>

      {/* Accuracy by Sector */}
      <section id="sector" className="scroll-mt-20">
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accuracy by Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Sector</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Resolved</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Brier Score</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Hit Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.bySector
                  .sort((a, b) => a.averageBrierScore - b.averageBrierScore)
                  .map((sector) => (
                    <tr key={sector.sector} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-2 font-medium text-gray-900">{sector.sector}</td>
                      <td className="py-2.5 px-2 text-right text-gray-600">{sector.resolvedCount}</td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={sector.averageBrierScore < 0.15 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                          {sector.averageBrierScore.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={sector.hitRate >= 0.75 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                          {formatPercentage(sector.hitRate, 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </section>

      {/* Accuracy by Company */}
      <section id="company" className="scroll-mt-20">
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accuracy by Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Company</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Sector</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Resolved</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Brier Score</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Hit Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byCompany
                  .sort((a, b) => a.averageBrierScore - b.averageBrierScore)
                  .map((company) => (
                    <tr key={company.ticker} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-2">
                        <a href={`/companies/${company.ticker}`} className="font-medium text-blue-600 hover:text-blue-700">
                          {company.ticker}
                        </a>
                      </td>
                      <td className="py-2.5 px-2 text-gray-600">{company.sector}</td>
                      <td className="py-2.5 px-2 text-right text-gray-600">{company.resolvedCount}</td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={company.averageBrierScore < 0.1 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                          {company.averageBrierScore.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={company.hitRate >= 0.75 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                          {formatPercentage(company.hitRate, 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </section>

      {/* Transparency: Included Markets */}
      <section id="markets" className="scroll-mt-20">
        <IncludedMarketsSection markets={metrics.includedMarkets} />
      </section>

      {/* Links to related resources */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/methodology"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Full methodology guide →
        </Link>
        <Link
          href="/glossary"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Glossary of terms →
        </Link>
        <Link
          href="/sources/polymarket"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Polymarket data →
        </Link>
        <Link
          href="/sources/kalshi"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Kalshi data →
        </Link>
      </div>
    </div>
  );
}
