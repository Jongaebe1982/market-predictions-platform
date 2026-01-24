'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  height?: number;
}

export function ProbabilityLineChart({
  data,
  showStockPrice = false,
  height = 300,
}: ProbabilityLineChartProps) {
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatProbability = (value: number) => formatPercentage(value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          stroke={CHART_COLORS.axis}
          fontSize={12}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={formatProbability}
          domain={[0, 1]}
          stroke={CHART_COLORS.probability}
          fontSize={12}
        />
        {showStockPrice && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={CHART_COLORS.stockPrice}
            fontSize={12}
            tickFormatter={(v) => `$${v}`}
          />
        )}
        <Tooltip
          labelFormatter={(timestamp) =>
            new Date(timestamp as number).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          }
          formatter={(value, name) => {
            const v = Number(value) || 0;
            if (name === 'probability') return [formatPercentage(v), 'Probability'];
            return [`$${v.toFixed(2)}`, 'Stock Price'];
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="probability"
          stroke={CHART_COLORS.probability}
          strokeWidth={2}
          dot={false}
          name="Probability"
        />
        {showStockPrice && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="stockPrice"
            stroke={CHART_COLORS.stockPrice}
            strokeWidth={2}
            dot={false}
            name="Stock Price"
            strokeDasharray="5 5"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
