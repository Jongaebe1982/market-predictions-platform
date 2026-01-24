import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <Skeleton className="h-5 w-1/3 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
