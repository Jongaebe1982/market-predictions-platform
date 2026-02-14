'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { HorizonAccuracy } from '@/lib/types';

interface HorizonLineChartProps {
  data: HorizonAccuracy[];
  height?: number;
}

export function HorizonLineChart({ data, height = 300 }: HorizonLineChartProps) {
  // Reverse so time flows left (further out) to right (closer to event)
  const chartData = [...data].reverse().map((d) => ({
    label: d.label,
    brierScore: d.averageBrierScore,
    hitRate: d.hitRate * 100,
    sampleSize: d.sampleSize,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 20, right: 60, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          fontSize={11}
          tick={{ fontSize: 10 }}
          interval={0}
          angle={0}
          label={{ value: '← Closer to event', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
        />
        <YAxis
          yAxisId="brier"
          domain={[0, 0.26]}
          tickFormatter={(v) => v.toFixed(2)}
          fontSize={11}
          width={45}
          label={{ value: 'Brier Score', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#3b82f6', dx: -5 }}
        />
        <YAxis
          yAxisId="hit"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          fontSize={11}
          width={50}
          label={{ value: 'Hit Rate', angle: 90, position: 'insideRight', fontSize: 10, fill: '#10b981', dx: 5 }}
        />
        <Tooltip
          formatter={(value, name) => {
            const v = Number(value) || 0;
            if (name === 'brierScore') return [v.toFixed(3), 'Brier Score'];
            return [`${v.toFixed(0)}%`, 'Hit Rate'];
          }}
        />
        <ReferenceLine
          yAxisId="brier"
          y={0.25}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{ value: 'Random baseline (0.25)', position: 'insideTopLeft', fontSize: 9, fill: '#ef4444' }}
        />
        <Line
          yAxisId="brier"
          type="monotone"
          dataKey="brierScore"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 5, fill: '#3b82f6' }}
          name="brierScore"
        />
        <Line
          yAxisId="hit"
          type="monotone"
          dataKey="hitRate"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 5, fill: '#10b981' }}
          name="hitRate"
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
