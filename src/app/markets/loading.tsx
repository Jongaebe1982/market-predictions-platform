import { PageHeaderSkeleton, MarketListSkeleton } from '@/components/ui/Skeleton';

export default function MarketsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
      <MarketListSkeleton count={8} />
    </div>
  );
}
