import { NextResponse } from 'next/server';
import { MOCK_ACCURACY_METRICS } from '@/lib/mock-data';

export async function GET() {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (useMock) {
    return NextResponse.json(MOCK_ACCURACY_METRICS);
  }

  // In production, read from Firestore
  try {
    const { getAccuracyMetrics } = await import('@/lib/firestore-queries');
    const metrics = await getAccuracyMetrics();
    if (!metrics) {
      return NextResponse.json(MOCK_ACCURACY_METRICS);
    }
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json(MOCK_ACCURACY_METRICS);
  }
}
