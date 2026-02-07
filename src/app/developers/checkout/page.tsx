import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Complete Your Purchase - Developer API',
  description: 'Complete your API subscription purchase',
};

function LoadingSpinner() {
  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardContent className="py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <CheckoutClient />
          </Suspense>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <Link href="/developers" className="text-sm text-gray-500 hover:text-gray-700">
          Back to Developer Portal
        </Link>
      </div>
    </div>
  );
}
