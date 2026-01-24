import type { Metadata } from 'next';
import { MOCK_ACCURACY_METRICS } from '@/lib/mock-data';
import { formatPercentage } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AccuracyCharts } from './AccuracyCharts';

export const metadata: Metadata = {
  title: 'Accuracy & Methodology',
  description: 'See how accurate prediction markets are at forecasting stock and earnings outcomes. Brier scores, calibration data, and sector breakdowns.',
};

export const revalidate = 3600; // ISR: revalidate every hour

export default function AccuracyPage() {
  const metrics = MOCK_ACCURACY_METRICS;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accuracy & Methodology</h1>
        <p className="text-gray-600 max-w-2xl">
          How well do prediction markets forecast stock and earnings outcomes? We track every resolved
          market and calculate accuracy metrics using the Brier score.
        </p>
      </div>

      {/* Methodology section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How We Measure Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p className="mb-3">
              <strong>Brier Score</strong> measures the accuracy of probabilistic predictions. It ranges
              from 0 (perfect) to 1 (worst possible). A Brier score of 0.25 is equivalent to random guessing.
            </p>
            <p className="mb-3">
              <strong>Formula:</strong> For each prediction, we calculate (forecast - outcome)&sup2;, where
              outcome is 1 if the event happened and 0 if it didn&apos;t. Lower scores mean better accuracy.
            </p>
            <p className="mb-3">
              <strong>Hit Rate</strong> is the percentage of markets where the most likely outcome (probability
              &gt; 50%) matched the actual result. A higher hit rate means markets are directionally correct
              more often.
            </p>
            <p>
              <strong>Calibration</strong> measures whether predicted probabilities match observed frequencies.
              If markets say &quot;70% likely,&quot; the event should happen about 70% of the time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overall accuracy cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Average Brier Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.overall.averageBrierScore.toFixed(3)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Lower is better (0 = perfect)</p>
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
            <p className="text-sm text-gray-500">Markets Resolved</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.overall.totalResolved}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total tracked resolutions</p>
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
            Measured by snapshotting market probabilities at fixed intervals before resolution,
            stopping at least 12 hours before earnings are released.
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
                            style={{ width: `${(1 - h.averageBrierScore / 0.25) * 100}%` }}
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
            Bar shows relative accuracy (Brier score vs. 0.25 random baseline). Markets become significantly
            more accurate as the event approaches, with the biggest improvement between 1 month and 1 week out.
          </p>
        </CardContent>
      </Card>

      {/* Charts (client component for dynamic import) */}
      <AccuracyCharts metrics={metrics} />

      {/* Sector accuracy table */}
      <Card className="mt-8">
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

      {/* Company accuracy table */}
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
    </div>
  );
}
