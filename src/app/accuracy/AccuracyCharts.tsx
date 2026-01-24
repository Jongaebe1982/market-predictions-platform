'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import type { AccuracyMetrics } from '@/lib/types';

const CalibrationPlot = dynamic(
  () => import('@/components/charts/CalibrationPlot').then((mod) => ({ default: mod.CalibrationPlot })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const SectorBarChart = dynamic(
  () => import('@/components/charts/SectorBarChart').then((mod) => ({ default: mod.SectorBarChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface AccuracyChartsProps {
  metrics: AccuracyMetrics;
}

export function AccuracyCharts({ metrics }: AccuracyChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calibration Plot</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 mb-3">
            Points near the diagonal line indicate good calibration.
          </p>
          <CalibrationPlot data={metrics.overall.calibrationData} height={300} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Brier Score by Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 mb-3">
            Lower Brier scores indicate better prediction accuracy.
          </p>
          <SectorBarChart data={metrics.bySector} dataKey="averageBrierScore" height={300} />
        </CardContent>
      </Card>
    </div>
  );
}
