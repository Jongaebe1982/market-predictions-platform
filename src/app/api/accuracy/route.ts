import { NextResponse } from 'next/server';
import { computeRealAccuracyMetrics } from '@/lib/accuracy-compute';

export async function GET() {
  const metrics = await computeRealAccuracyMetrics();
  return NextResponse.json(metrics);
}
