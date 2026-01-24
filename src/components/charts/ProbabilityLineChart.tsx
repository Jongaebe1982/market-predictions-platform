'use client';

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';
import { formatPercentage } from '@/lib/utils';

interface ChartDataPoint {
  timestamp: number;
  probability: number;
  stockPrice?: number;
}

interface ProbabilityLineChartProps {
  data: ChartDataPoint[];
  showStockPrice?: boolean;
  stockTicker?: string;
  height?: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label, stockTicker }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const date = new Date(label as number).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const probabilityEntry = payload.find((p: any) => p.dataKey === 'probability');
  const stockEntry = payload.find((p: any) => p.dataKey === 'stockPrice');

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-1">{date}</p>
      {probabilityEntry && (
        <p className="font-semibold text-gray-900">
          Probability: {formatPercentage(probabilityEntry.value, 1)}
        </p>
      )}
      {stockEntry && stockEntry.value != null && (
        <p className="font-semibold" style={{ color: CHART_COLORS.probability }}>
          {stockTicker ? `${stockTicker} Stock` : 'Stock'}: ${Number(stockEntry.value).toFixed(2)}
        </p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function ProbabilityLineChart({
  data,
  showStockPrice = false,
  stockTicker,
  height = 300,
}: ProbabilityLineChartProps) {
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatProbability = (value: number) => formatPercentage(value, 0);

  // Compute stock price domain with padding
  const stockPrices = showStockPrice
    ? data.map((d) => d.stockPrice).filter((v): v is number => v != null)
    : [];
  const stockMin = stockPrices.length > 0 ? Math.floor(Math.min(...stockPrices) - 1) : 0;
  const stockMax = stockPrices.length > 0 ? Math.ceil(Math.max(...stockPrices) + 1) : 100;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: showStockPrice ? 50 : 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          stroke={CHART_COLORS.axis}
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={formatProbability}
          domain={[0, 1]}
          stroke={CHART_COLORS.axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        {showStockPrice && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={CHART_COLORS.stockPrice}
            fontSize={12}
            tickFormatter={(v) => `$${v}`}
            domain={[stockMin, stockMax]}
            tickLine={false}
            axisLine={false}
          />
        )}
        <Tooltip content={<CustomTooltip stockTicker={stockTicker} />} />
        <Area
          yAxisId="left"
          type="stepAfter"
          dataKey="probability"
          stroke={CHART_COLORS.probability}
          strokeWidth={2}
          fill={CHART_COLORS.probability}
          fillOpacity={0.08}
          dot={false}
          name="Probability"
          isAnimationActive={false}
        />
        {showStockPrice && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="stockPrice"
            stroke="#374151"
            strokeWidth={1.5}
            dot={false}
            name="Stock Price"
            connectNulls
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
