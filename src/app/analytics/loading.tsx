import { PageHeaderSkeleton, StatsGridSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
