'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface VolumeDataPoint {
  label: string;
  volume: number;
}

interface VolumeBarChartProps {
  data: VolumeDataPoint[];
  height?: number;
}

export function VolumeBarChart({ data, height = 250 }: VolumeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" fontSize={12} />
        <YAxis tickFormatter={(v) => formatCurrency(v)} fontSize={12} />
        <Tooltip formatter={(value) => [formatCurrency(Number(value) || 0), 'Volume']} />
        <Bar dataKey="volume" fill={CHART_COLORS.volume} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
