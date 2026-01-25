import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'How we measure prediction market accuracy. Learn about Brier scores, time horizons, calibration analysis, and our data collection process.',
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Methodology</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Methodology</h1>
        <p className="text-gray-600">
          How we measure and report prediction market accuracy. This page explains our
          scoring system, time horizons, and data collection process.
        </p>
      </div>

      {/* Page Contents */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What this page contains</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• <a href="#brier-score" className="text-blue-600 hover:underline">Brier Score</a> - Our primary accuracy metric</li>
            <li>• <a href="#time-horizons" className="text-blue-600 hover:underline">Time Horizons</a> - When we measure predictions</li>
            <li>• <a href="#calibration" className="text-blue-600 hover:underline">Calibration</a> - How well probabilities match reality</li>
            <li>• <a href="#data-collection" className="text-blue-600 hover:underline">Data Collection</a> - How we gather market data</li>
            <li>• <a href="#limitations" className="text-blue-600 hover:underline">Limitations</a> - Important caveats to consider</li>
          </ul>
        </CardContent>
      </Card>

      {/* Brier Score */}
      <section id="brier-score" className="mb-8 scroll-mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Brier Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                The <strong>Brier Score</strong> measures the accuracy of probabilistic predictions.
                It&apos;s calculated as the squared difference between the predicted probability and
                the actual outcome.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 my-4 font-mono text-sm">
                <p className="font-semibold text-gray-900 mb-2">Formula:</p>
                <p>Brier Score = (prediction - outcome)²</p>
                <p className="text-gray-500 mt-2">Where outcome = 1 if event occurred, 0 if not</p>
              </div>

              <p><strong>Interpretation:</strong></p>
              <ul className="mt-2">
                <li><strong>0.00</strong> = Perfect prediction (predicted exactly what happened)</li>
                <li><strong>0.25</strong> = Random guessing (50/50 on every prediction)</li>
                <li><strong>1.00</strong> = Always completely wrong</li>
              </ul>

              <p className="mt-4"><strong>Example:</strong></p>
              <div className="bg-blue-50 rounded-lg p-4 my-2">
                <p className="mb-1">Market: &quot;Will AAPL beat Q4 earnings?&quot;</p>
                <p className="mb-1">Prediction 30 days before: 72% Yes</p>
                <p className="mb-1">Actual outcome: Yes (AAPL beat earnings)</p>
                <p className="font-semibold">Brier Score = (0.72 - 1)² = 0.078</p>
                <p className="text-sm text-gray-500 mt-2">This is a good score - the market was confident and correct.</p>
              </div>

              <p className="mt-4">
                We report Brier scores averaged across all resolved markets, broken down by
                source, sector, company, and time horizon.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Time Horizons */}
      <section id="time-horizons" className="mb-8 scroll-mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Time Horizons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                We measure market predictions at multiple time points before resolution.
                This shows how accuracy improves as the event approaches.
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Horizon</th>
                      <th className="text-left py-2 font-medium text-gray-900">Description</th>
                      <th className="text-left py-2 font-medium text-gray-900">Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium">30 days</td>
                      <td className="py-2">1 month before close</td>
                      <td className="py-2">Early forecast quality</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium">14 days</td>
                      <td className="py-2">2 weeks before close</td>
                      <td className="py-2">Medium-term accuracy</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium">7 days</td>
                      <td className="py-2">1 week before close</td>
                      <td className="py-2">Short-term accuracy</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium">1 day</td>
                      <td className="py-2">24 hours before close</td>
                      <td className="py-2">Near-term precision</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">12 hours</td>
                      <td className="py-2">12 hours before close</td>
                      <td className="py-2">Final forecast quality</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4">
                Our headline Brier score uses the <strong>30-day horizon</strong> (or the earliest
                available if the market existed for less than 30 days). This prevents gaming the
                metric by only measuring when the answer is nearly known.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Calibration */}
      <section id="calibration" className="mb-8 scroll-mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Calibration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                <strong>Calibration</strong> measures whether predicted probabilities match observed frequencies.
                A well-calibrated forecaster should have their 70% predictions come true about 70% of the time.
              </p>

              <p className="mt-4"><strong>How we assess calibration:</strong></p>
              <ol className="mt-2">
                <li>Group predictions into probability bins (0-10%, 10-20%, etc.)</li>
                <li>Calculate the actual hit rate for each bin</li>
                <li>Compare predicted vs. actual frequencies</li>
              </ol>

              <p className="mt-4">
                <strong>Good calibration:</strong> If markets predict 80% for a group of events,
                approximately 80% of those events should actually occur.
              </p>

              <p className="mt-4">
                <strong>Poor calibration:</strong> Markets that consistently overpredict (saying 80%
                when events occur 60% of the time) or underpredict (saying 40% when events occur
                60% of the time) are poorly calibrated.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Collection */}
      <section id="data-collection" className="mb-8 scroll-mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Data Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>We collect prediction market data from two primary sources:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">Polymarket</p>
                  <p className="text-sm mt-1">
                    Decentralized prediction market on Polygon. We fetch market data,
                    probabilities, and volume via their public API.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">Kalshi</p>
                  <p className="text-sm mt-1">
                    CFTC-regulated US exchange. We access market data through their
                    public API for stock and company-related contracts.
                  </p>
                </div>
              </div>

              <p className="mt-4"><strong>What we store:</strong></p>
              <ul className="mt-2">
                <li>Market question and description</li>
                <li>Current probabilities for each outcome</li>
                <li>Historical probability snapshots at key horizons</li>
                <li>Volume and liquidity metrics</li>
                <li>Resolution status and outcome</li>
                <li>Company ticker and sector classification</li>
              </ul>

              <p className="mt-4">
                Data is refreshed regularly to capture current market state and historical
                snapshots for accuracy analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Limitations */}
      <section id="limitations" className="mb-8 scroll-mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Limitations & Caveats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>Important considerations when interpreting our accuracy data:</p>

              <ul className="mt-4 space-y-3">
                <li>
                  <strong>Selection bias:</strong> We only track stock and company-related markets.
                  Accuracy for other market types (politics, sports) may differ.
                </li>
                <li>
                  <strong>Sample size:</strong> Some categories have limited resolved markets.
                  Take statistics with small sample sizes (n &lt; 10) with caution.
                </li>
                <li>
                  <strong>Market liquidity:</strong> Low-volume markets may have less accurate
                  prices due to fewer participants correcting mispricing.
                </li>
                <li>
                  <strong>Time periods:</strong> Our data covers recent market history.
                  Long-term accuracy trends require more time to establish.
                </li>
                <li>
                  <strong>Resolution criteria:</strong> How markets define &quot;resolved&quot; can vary.
                  We use the official resolution from each platform.
                </li>
                <li>
                  <strong>Not financial advice:</strong> This data is for informational purposes.
                  Past accuracy does not guarantee future performance.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Links */}
      <div className="flex flex-wrap gap-4 mt-8">
        <Link
          href="/analytics"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View accuracy analytics →
        </Link>
        <Link
          href="/glossary"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Glossary of terms →
        </Link>
      </div>

      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is a Brier Score?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The Brier Score measures the accuracy of probabilistic predictions. It is calculated as (prediction - outcome)². A score of 0 is perfect, 0.25 is random guessing, and 1 is always wrong.',
                },
              },
              {
                '@type': 'Question',
                name: 'What time horizons do you measure?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We measure predictions at 30 days, 14 days, 7 days, 1 day, and 12 hours before market close. Our headline score uses the 30-day horizon.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is calibration in prediction markets?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Calibration measures whether predicted probabilities match observed frequencies. A well-calibrated forecaster has their 70% predictions come true about 70% of the time.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
