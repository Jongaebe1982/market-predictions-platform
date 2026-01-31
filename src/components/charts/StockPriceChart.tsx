'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';

interface StockPriceDataPoint {
  timestamp: number;
  price: number;
}

interface StockPriceChartProps {
  data: StockPriceDataPoint[];
  ticker: string;
  height?: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label, ticker }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const date = new Date(label as number).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const priceEntry = payload.find((p: any) => p.dataKey === 'price');

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-1">{date}</p>
      {priceEntry && priceEntry.value != null && (
        <p className="font-semibold text-gray-900">
          {ticker}: ${Number(priceEntry.value).toFixed(2)}
        </p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function StockPriceChart({
  data,
  ticker,
  height = 250,
}: StockPriceChartProps) {
  if (data.length === 0) return null;

  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Compute price domain with padding
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 1;
  const domainMin = Math.floor(minPrice - padding);
  const domainMax = Math.ceil(maxPrice + padding);

  // Calculate price change
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-gray-900">${lastPrice.toFixed(2)}</span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
        </span>
        <span className="text-xs text-gray-500">30 days</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke={CHART_COLORS.axis}
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            domain={[domainMin, domainMax]}
            stroke={CHART_COLORS.axis}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip ticker={ticker} />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            fill={isPositive ? '#10b981' : '#ef4444'}
            fillOpacity={0.1}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
