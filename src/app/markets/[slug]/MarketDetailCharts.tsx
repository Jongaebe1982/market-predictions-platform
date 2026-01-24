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
}

export function MarketDetailCharts({ priceHistory }: MarketDetailChartsProps) {
  if (priceHistory.length === 0) return null;

  const chartData = priceHistory.map((p) => ({
    timestamp: p.timestamp,
    probability: p.price,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Probability Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ProbabilityLineChart
          data={chartData}
          showStockPrice={false}
          height={350}
        />
      </CardContent>
    </Card>
  );
}
