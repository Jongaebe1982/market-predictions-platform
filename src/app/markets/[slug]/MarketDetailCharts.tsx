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
 * Merge probability data with stock price data using linear interpolation.
 * For each probability timestamp, interpolate the stock price between
 * the two nearest stock data points. This produces a smooth continuous
 * stock price line that covers the full probability history range.
 */
function mergeChartData(
  priceHistory: { timestamp: number; price: number }[],
  stockPriceHistory: { timestamp: number; price: number }[]
): { timestamp: number; probability: number; stockPrice: number | null }[] {
  if (stockPriceHistory.length === 0) {
    return priceHistory.map((p) => ({
      timestamp: p.timestamp,
      probability: p.price,
      stockPrice: null,
    }));
  }

  const sortedStock = [...stockPriceHistory].sort((a, b) => a.timestamp - b.timestamp);
  const stockStart = sortedStock[0].timestamp;
  const stockEnd = sortedStock[sortedStock.length - 1].timestamp;

  return priceHistory.map((p) => {
    const t = p.timestamp;
    let stockPrice: number | null = null;

    if (t <= stockStart) {
      // Before stock data range: use first stock price
      stockPrice = sortedStock[0].price;
    } else if (t >= stockEnd) {
      // After stock data range: use last stock price
      stockPrice = sortedStock[sortedStock.length - 1].price;
    } else {
      // Within range: linearly interpolate between surrounding points
      for (let i = 1; i < sortedStock.length; i++) {
        if (sortedStock[i].timestamp >= t) {
          const prev = sortedStock[i - 1];
          const next = sortedStock[i];
          const ratio = (t - prev.timestamp) / (next.timestamp - prev.timestamp);
          stockPrice = prev.price + ratio * (next.price - prev.price);
          break;
        }
      }
    }

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
