import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about prediction markets, how this platform works, and how to interpret market probabilities.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">About Market Predictions</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>What are prediction markets?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                Prediction markets are exchange-traded markets where participants buy and sell
                contracts based on the outcome of future events. The price of a contract
                represents the market&apos;s consensus probability that the event will occur.
              </p>
              <p>
                For example, if a contract &quot;Will Apple beat Q1 earnings?&quot; is trading at
                $0.72, the market believes there&apos;s a 72% chance Apple will exceed analyst
                estimates. These prices aggregate the knowledge of all market participants,
                often producing more accurate forecasts than individual analysts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How does this platform work?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                We aggregate prediction market data from <strong>Polymarket</strong> and{' '}
                <strong>Kalshi</strong>, focusing specifically on markets related to publicly
                traded companies: earnings predictions, stock price targets, and corporate events.
              </p>
              <p>Our platform provides:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Real-time probability data for active markets</li>
                <li>Historical price charts showing how probabilities change over time</li>
                <li>Sector and company-level accuracy metrics</li>
                <li>Calibration analysis to verify market reliability</li>
                <li>Stock price overlays for context</li>
              </ul>
              <p>
                Data is refreshed multiple times daily via automated snapshots that track
                probability changes and detect market resolutions.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to interpret probabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                Market probabilities represent the collective estimate of likelihood, not
                certainty. A market showing 80% &quot;Yes&quot; means participants believe the
                event is likely but not guaranteed.
              </p>
              <p>Key things to keep in mind:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Near 50%:</strong> High uncertainty. The market is roughly evenly split.
                </li>
                <li>
                  <strong>60-70%:</strong> Leaning one direction but significant uncertainty remains.
                </li>
                <li>
                  <strong>80%+:</strong> Strong consensus, but ~20% of the time the other outcome occurs.
                </li>
                <li>
                  <strong>90%+:</strong> Very high confidence, though surprises still happen.
                </li>
              </ul>
              <p>
                Markets with higher volume and liquidity tend to be more reliable, as more
                participants have contributed their knowledge and capital.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>We source data from the following prediction market platforms:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Polymarket</strong> - Decentralized prediction market on Polygon.
                  Known for high liquidity on major events.
                </li>
                <li>
                  <strong>Kalshi</strong> - CFTC-regulated prediction market based in the US.
                  Offers structured event contracts.
                </li>
              </ul>
              <p>
                Stock price data is sourced from Yahoo Finance for real-time price overlays
                and earnings verification.
              </p>
              <p className="text-gray-400 text-xs mt-4">
                This platform is for informational purposes only and does not constitute
                financial advice. Prediction market data should not be used as the sole
                basis for investment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
