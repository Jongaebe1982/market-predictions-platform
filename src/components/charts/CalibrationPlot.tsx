'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { CalibrationPoint } from '@/lib/types';
import { formatPercentage } from '@/lib/utils';

interface CalibrationPlotProps {
  data: CalibrationPoint[];
  height?: number;
}

export function CalibrationPlot({ data, height = 300 }: CalibrationPlotProps) {
  const chartData = data.map((d) => ({
    predicted: d.predictedProbability * 100,
    actual: d.actualFrequency * 100,
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          dataKey="predicted"
          domain={[0, 100]}
          name="Predicted"
          label={{ value: 'Predicted Probability (%)', position: 'bottom', offset: 0, fontSize: 12 }}
          fontSize={12}
        />
        <YAxis
          type="number"
          dataKey="actual"
          domain={[0, 100]}
          name="Actual"
          label={{ value: 'Actual Frequency (%)', angle: -90, position: 'insideLeft', fontSize: 12 }}
          fontSize={12}
        />
        <Tooltip
          content={({ payload }) => {
            if (!payload || payload.length === 0) return null;
            const point = payload[0]?.payload;
            if (!point) return null;
            return (
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-sm">
                <p>Predicted: {formatPercentage(point.predicted / 100)}</p>
                <p>Actual: {formatPercentage(point.actual / 100)}</p>
                <p className="text-gray-500">n = {point.count}</p>
              </div>
            );
          }}
        />
        <ReferenceLine
          segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
          stroke="#9ca3af"
          strokeDasharray="5 5"
          label={{ value: 'Perfect Calibration', position: 'insideTopLeft', fontSize: 11, fill: '#9ca3af' }}
        />
        <Scatter
          name="Calibration"
          data={chartData}
          fill="#3b82f6"
          line={{ stroke: '#3b82f6', strokeWidth: 2 }}
          lineType="fitting"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
