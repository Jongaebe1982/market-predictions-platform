import { ChartSkeleton, CardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function MarketDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <span className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        <span>/</span>
        <span className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        <span>/</span>
        <span className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Market info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton className="h-7 w-full max-w-lg mb-3" />
            <Skeleton className="h-4 w-full max-w-md mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Probability bars */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </div>
          </div>

          {/* Chart */}
          <ChartSkeleton />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
