import { NextResponse } from 'next/server';
import { computeRealAccuracyMetrics } from '@/lib/accuracy-compute';

export async function GET() {
  try {
    const metrics = await computeRealAccuracyMetrics();
    return NextResponse.json(metrics);
  } catch {
    // computeRealAccuracyMetrics already falls back to mock data internally
    const { MOCK_ACCURACY_METRICS } = await import('@/lib/mock-data');
    return NextResponse.json(MOCK_ACCURACY_METRICS);
  }
}
