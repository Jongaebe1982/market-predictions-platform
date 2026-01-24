import type { Metadata } from 'next';
import { computeRealAccuracyMetrics } from '@/lib/accuracy-compute';
import { formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AccuracyCharts } from './AccuracyCharts';
import { IncludedMarketsSection } from './IncludedMarketsSection';

export const metadata: Metadata = {
  title: 'Accuracy & Methodology',
  description: 'How accurate are prediction markets at forecasting stock and earnings outcomes? Horizon-based Brier scores, volume analysis, and source comparison.',
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function AccuracyPage() {
  const metrics = await computeRealAccuracyMetrics();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prediction Accuracy</h1>
        <p className="text-gray-600 max-w-3xl">
          How well do prediction markets forecast stock and earnings outcomes? We analyze all resolved
          markets using horizon-based Brier scores — measuring probability at fixed time intervals
          before the event closes, when predictions are genuinely uncertain.
        </p>
      </div>

      {/* Methodology section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Methodology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Which markets are included?</h4>
              <p>
                All resolved stock and earnings markets with a clear Yes/No outcome and available
                price history. This includes earnings beats, stock price targets, revenue milestones,
                and other financial outcomes. See the full list in the &quot;Included Markets&quot; grid below.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Why not use final probability?</h4>
              <p>
                At market close, the probability is typically ~100% (the outcome is already known), which
                gives a misleadingly perfect Brier score of ~0. Instead, we measure accuracy at fixed time
                horizons before the event, when the prediction is genuinely uncertain.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Worked example</h4>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs">
                <p className="mb-1"><span className="text-gray-500">Market:</span> &quot;Will AAPL beat Q4 earnings?&quot;</p>
                <p className="mb-1"><span className="text-gray-500">1 week before:</span> probability = 72%</p>
                <p className="mb-1"><span className="text-gray-500">Outcome:</span> Yes (AAPL beat earnings)</p>
                <p className="mb-1"><span className="text-gray-500">Brier Score:</span> (0.72 - 1)&sup2; = 0.078</p>
                <p className="text-gray-500 mt-2">A Brier score of 0.078 is good. 0 = perfect, 0.25 = random guessing, 1 = always wrong.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Brier Score</h4>
                <p className="text-xs">
                  (forecast - outcome)&sup2;. Ranges from 0 (perfect) to 1 (worst). We report the average
                  at the 1-day horizon as the headline metric.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Hit Rate</h4>
                <p className="text-xs">
                  Percentage of markets where the most likely outcome (&gt;50% probability at 1-day horizon)
                  matched the actual result.
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
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Avg Brier Score (1-day)</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.overall.averageBrierScore.toFixed(3)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Lower is better (0 = perfect)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Hit Rate (1-day)</p>
            <p className="text-3xl font-bold text-green-600">
              {formatPercentage(metrics.overall.hitRate, 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Directional accuracy at 1-day horizon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Markets Analyzed</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.overall.totalResolved}
            </p>
            <p className="text-xs text-gray-400 mt-1">All resolved markets with price history</p>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy by Time Horizon */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Accuracy by Time Horizon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            How accurate are prediction markets at different lead times before the event?
            Probabilities are snapshotted at fixed intervals before the resolution date.
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

      {/* Charts (client component) */}
      <AccuracyCharts metrics={metrics} />

      {/* Accuracy by Volume */}
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

      {/* Accuracy by Source */}
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

      {/* Accuracy by Sector */}
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

      {/* Accuracy by Company */}
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

      {/* Transparency: Included Markets */}
      <IncludedMarketsSection markets={metrics.includedMarkets} />
    </div>
  );
}
