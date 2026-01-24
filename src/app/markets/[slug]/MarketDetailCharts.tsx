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
  ticker: string | null;
}

export function MarketDetailCharts({ priceHistory, ticker }: MarketDetailChartsProps) {
  const chartData = priceHistory.map((p) => ({
    timestamp: p.timestamp,
    probability: p.price,
    stockPrice: ticker ? 150 + Math.random() * 50 : undefined,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Probability Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ProbabilityLineChart
          data={chartData}
          showStockPrice={!!ticker}
          height={350}
        />
      </CardContent>
    </Card>
  );
}
