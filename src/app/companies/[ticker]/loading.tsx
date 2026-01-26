import { PageHeaderSkeleton, StatsGridSkeleton, MarketListSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function CompanyLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <span className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        <span>/</span>
        <span className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <span>/</span>
        <span className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse" />
        <div>
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <StatsGridSkeleton count={3} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <MarketListSkeleton count={4} />
          </div>
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
