import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MarketsContent } from './MarketsContent';
import { CardSkeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Markets',
  description: 'Browse and filter stock and earnings prediction markets from Polymarket and Kalshi.',
};

function MarketsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Markets</h1>
        <p className="text-gray-600">Browse and filter stock and earnings prediction markets.</p>
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function MarketsPage() {
  return (
    <Suspense fallback={<MarketsLoading />}>
      <MarketsContent />
    </Suspense>
  );
}
