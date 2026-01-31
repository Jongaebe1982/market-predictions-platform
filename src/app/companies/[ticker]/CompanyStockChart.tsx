'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';

const StockPriceChart = dynamic(
  () => import('@/components/charts/StockPriceChart').then((mod) => ({ default: mod.StockPriceChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface CompanyStockChartProps {
  stockPriceHistory: { timestamp: number; price: number }[];
  ticker: string;
  companyName: string;
}

export function CompanyStockChart({ stockPriceHistory, ticker, companyName }: CompanyStockChartProps) {
  if (stockPriceHistory.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Stock Price</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 py-4">Stock price data unavailable for {companyName}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{ticker} Stock Price - Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <StockPriceChart data={stockPriceHistory} ticker={ticker} height={250} />
      </CardContent>
    </Card>
  );
}
