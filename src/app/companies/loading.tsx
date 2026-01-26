import { PageHeaderSkeleton, StatsGridSkeleton, CompanyGridSkeleton } from '@/components/ui/Skeleton';

export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={4} />
      <div className="mt-8 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <CompanyGridSkeleton count={6} />
          </div>
        ))}
      </div>
    </div>
  );
}
