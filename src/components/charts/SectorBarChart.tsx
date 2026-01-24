'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SECTOR_COLORS } from '@/lib/constants';
import type { SectorAccuracy } from '@/lib/types';

interface SectorBarChartProps {
  data: SectorAccuracy[];
  dataKey?: 'averageBrierScore' | 'hitRate';
  height?: number;
}

export function SectorBarChart({ data, dataKey = 'averageBrierScore', height = 300 }: SectorBarChartProps) {
  const sortedData = [...data].sort((a, b) => {
    if (dataKey === 'averageBrierScore') return a.averageBrierScore - b.averageBrierScore;
    return b.hitRate - a.hitRate;
  });

  const formatValue = (value: number) => {
    if (dataKey === 'hitRate') return `${(value * 100).toFixed(0)}%`;
    return value.toFixed(3);
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="sector"
          angle={-45}
          textAnchor="end"
          fontSize={11}
          interval={0}
          height={80}
        />
        <YAxis
          tickFormatter={formatValue}
          fontSize={12}
          domain={dataKey === 'hitRate' ? [0, 1] : undefined}
        />
        <Tooltip
          formatter={(value) => [formatValue(Number(value) || 0), dataKey === 'averageBrierScore' ? 'Brier Score' : 'Hit Rate']}
          labelFormatter={(label) => `${label}`}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {sortedData.map((entry) => (
            <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector] || '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
