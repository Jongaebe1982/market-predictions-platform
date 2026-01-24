'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';

const ProbabilityLineChart = dynamic(
  () => import('@/components/charts/ProbabilityLineChart').then((mod) => ({ default: mod.ProbabilityLineChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface MarketDetailChartsProps {
  priceHistory: { timestamp: number; price: number }[];
  stockPriceHistory: { timestamp: number; price: number }[];
  ticker?: string | null;
}

/**
 * Merge probability data with stock price data using nearest-neighbor interpolation.
 * For each probability data point, find the closest stock price by timestamp.
 */
function mergeChartData(
  priceHistory: { timestamp: number; price: number }[],
  stockPriceHistory: { timestamp: number; price: number }[]
): { timestamp: number; probability: number; stockPrice?: number }[] {
  if (stockPriceHistory.length === 0) {
    return priceHistory.map((p) => ({
      timestamp: p.timestamp,
      probability: p.price,
    }));
  }

  // Sort stock prices by timestamp for binary search
  const sortedStock = [...stockPriceHistory].sort((a, b) => a.timestamp - b.timestamp);

  return priceHistory.map((p) => {
    // Find nearest stock price by timestamp (nearest-neighbor)
    let closestIdx = 0;
    let closestDiff = Math.abs(sortedStock[0].timestamp - p.timestamp);

    for (let i = 1; i < sortedStock.length; i++) {
      const diff = Math.abs(sortedStock[i].timestamp - p.timestamp);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIdx = i;
      } else {
        // Since sorted, if diff starts increasing we can stop
        break;
      }
    }

    // Only include stock price if within 24 hours of probability point
    const maxDiff = 24 * 60 * 60 * 1000; // 24 hours in ms
    const stockPrice = closestDiff <= maxDiff ? sortedStock[closestIdx].price : undefined;

    return {
      timestamp: p.timestamp,
      probability: p.price,
      stockPrice,
    };
  });
}

export function MarketDetailCharts({ priceHistory, stockPriceHistory, ticker }: MarketDetailChartsProps) {
  if (priceHistory.length === 0) return null;

  const hasStockData = stockPriceHistory.length > 0;
  const chartData = mergeChartData(priceHistory, stockPriceHistory);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Probability Over Time
          {hasStockData && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              with stock price overlay
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProbabilityLineChart
          data={chartData}
          showStockPrice={hasStockData}
          stockTicker={ticker || undefined}
          height={350}
        />
      </CardContent>
    </Card>
  );
}
