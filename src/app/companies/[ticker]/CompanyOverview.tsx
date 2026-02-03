import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatPercentage } from '@/lib/utils';
import type { CompanyAccuracy } from '@/lib/types';
import type { CompanyMapping } from '@/lib/sector-mapping';

interface CompanyOverviewProps {
  company: CompanyMapping;
  activeMarketCount: number;
  resolvedMarketCount: number;
  accuracy: CompanyAccuracy | null;
}

const sectorDescriptions: Record<string, { description: string; context: string }> = {
  Technology: {
    description: 'a major technology company',
    context: 'Technology sector companies are frequently the subject of prediction markets due to their rapid innovation cycles, earnings volatility, and significant market impact.',
  },
  Semiconductors: {
    description: 'a leading semiconductor company',
    context: 'Semiconductor companies attract prediction market interest due to cyclical demand patterns, supply chain dynamics, and their critical role in technology infrastructure.',
  },
  'AI & Cloud': {
    description: 'a major player in AI and cloud computing',
    context: 'AI and cloud companies are at the forefront of technological transformation, making them popular subjects for prediction markets focused on growth and adoption metrics.',
  },
  Finance: {
    description: 'a leading financial services company',
    context: 'Financial sector companies see prediction market activity around interest rate sensitivity, regulatory changes, and quarterly earnings performance.',
  },
  Healthcare: {
    description: 'a major healthcare company',
    context: 'Healthcare companies attract prediction market interest due to drug approvals, clinical trial outcomes, and regulatory decisions.',
  },
  Consumer: {
    description: 'a leading consumer goods company',
    context: 'Consumer companies are tracked in prediction markets for insights into spending trends, brand performance, and seasonal earnings patterns.',
  },
  'E-commerce': {
    description: 'a major e-commerce company',
    context: 'E-commerce companies draw prediction market attention for their growth metrics, competitive dynamics, and seasonal sales performance.',
  },
  'Social Media': {
    description: 'a leading social media company',
    context: 'Social media companies are popular prediction market subjects due to user growth metrics, advertising revenue, and regulatory scrutiny.',
  },
  Streaming: {
    description: 'a major streaming and entertainment company',
    context: 'Streaming companies attract prediction market interest around subscriber growth, content investments, and competitive positioning.',
  },
  Automotive: {
    description: 'a significant player in the automotive industry',
    context: 'Automotive companies see prediction market activity around production numbers, EV adoption, and supply chain developments.',
  },
  Aerospace: {
    description: 'a major aerospace and defense contractor',
    context: 'Aerospace companies attract prediction market interest due to government contracts, production milestones, and defense spending trends.',
  },
  Energy: {
    description: 'a leading energy company',
    context: 'Energy companies are tracked in prediction markets for commodity price exposure, production levels, and transition to renewables.',
  },
  Airlines: {
    description: 'a major airline carrier',
    context: 'Airlines attract prediction market attention for travel demand trends, fuel costs, and operational metrics.',
  },
  Telecom: {
    description: 'a leading telecommunications company',
    context: 'Telecom companies see prediction market activity around subscriber metrics, 5G deployment, and competitive dynamics.',
  },
  Fintech: {
    description: 'a major fintech company',
    context: 'Fintech companies draw prediction market interest for payment volumes, user growth, and regulatory developments.',
  },
  Travel: {
    description: 'a leading travel and hospitality company',
    context: 'Travel companies attract prediction market attention for booking trends, pricing dynamics, and seasonal performance.',
  },
  Transportation: {
    description: 'a significant player in transportation services',
    context: 'Transportation companies see prediction market activity around ridership trends, pricing strategies, and profitability milestones.',
  },
  Crypto: {
    description: 'a major cryptocurrency platform',
    context: 'Crypto companies attract prediction market interest due to trading volumes, regulatory developments, and cryptocurrency price correlations.',
  },
};

function getAccuracyInterpretation(accuracy: CompanyAccuracy): string {
  const hitRatePercent = Math.round(accuracy.hitRate * 100);
  const brierScore = accuracy.averageBrierScore;

  if (accuracy.resolvedCount < 3) {
    return `With only ${accuracy.resolvedCount} resolved market${accuracy.resolvedCount === 1 ? '' : 's'}, there isn't enough data yet to draw strong conclusions about prediction accuracy.`;
  }

  let accuracyQuality: string;
  let brierQuality: string;

  if (hitRatePercent >= 80) {
    accuracyQuality = 'excellent directional accuracy';
  } else if (hitRatePercent >= 70) {
    accuracyQuality = 'strong directional accuracy';
  } else if (hitRatePercent >= 60) {
    accuracyQuality = 'moderate directional accuracy';
  } else {
    accuracyQuality = 'mixed directional accuracy';
  }

  if (brierScore <= 0.1) {
    brierQuality = 'exceptional calibration';
  } else if (brierScore <= 0.15) {
    brierQuality = 'good calibration';
  } else if (brierScore <= 0.2) {
    brierQuality = 'reasonable calibration';
  } else {
    brierQuality = 'room for improvement in calibration';
  }

  return `Across ${accuracy.resolvedCount} resolved markets, predictions have shown ${accuracyQuality} (${hitRatePercent}% hit rate) with ${brierQuality} (Brier score: ${brierScore.toFixed(3)}).`;
}

export function CompanyOverview({
  company,
  activeMarketCount,
  resolvedMarketCount,
  accuracy,
}: CompanyOverviewProps) {
  const sectorInfo = sectorDescriptions[company.sector] || {
    description: 'a notable public company',
    context: 'This company is tracked across prediction markets for various corporate events and milestones.',
  };

  const totalMarkets = activeMarketCount + resolvedMarketCount;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>About {company.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
          {/* Company Introduction */}
          <p>
            <strong>{company.name}</strong> ({company.ticker}) is {sectorInfo.description} operating
            in the {company.sector} sector. {sectorInfo.context}
          </p>

          {/* Market Activity Summary */}
          <div className="not-prose bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mb-3">Prediction Market Activity</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{activeMarketCount}</p>
                <p className="text-xs text-gray-500">Active Markets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{resolvedMarketCount}</p>
                <p className="text-xs text-gray-500">Resolved Markets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalMarkets}</p>
                <p className="text-xs text-gray-500">Total Tracked</p>
              </div>
            </div>
          </div>

          {/* Accuracy Analysis */}
          {accuracy && accuracy.resolvedCount > 0 && (
            <>
              <h4 className="font-semibold text-gray-900 mt-4">Prediction Accuracy</h4>
              <p>{getAccuracyInterpretation(accuracy)}</p>
              <p className="text-sm text-gray-500">
                The <Link href="/methodology#brier-score" className="text-blue-600 hover:underline">Brier score</Link> measures
                how close predictions were to actual outcomes (lower is better, 0 is perfect).
                The <Link href="/methodology#calibration" className="text-blue-600 hover:underline">hit rate</Link> shows
                how often the market's favored outcome actually occurred.
              </p>
            </>
          )}

          {/* What to Watch */}
          {activeMarketCount > 0 && (
            <>
              <h4 className="font-semibold text-gray-900 mt-4">What Traders Are Watching</h4>
              <p>
                With {activeMarketCount} active prediction market{activeMarketCount === 1 ? '' : 's'}, traders
                are currently making forecasts about {company.name}'s upcoming events. These markets aggregate
                the collective wisdom of participants who have financial incentives to be accurate, often providing
                insights that complement traditional analyst forecasts.
              </p>
            </>
          )}

          {activeMarketCount === 0 && resolvedMarketCount > 0 && (
            <>
              <h4 className="font-semibold text-gray-900 mt-4">Historical Coverage</h4>
              <p>
                While there are no active prediction markets for {company.name} at this time,
                our platform has tracked {resolvedMarketCount} resolved market{resolvedMarketCount === 1 ? '' : 's'} historically.
                New markets may open around earnings announcements, product launches, or other significant corporate events.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
