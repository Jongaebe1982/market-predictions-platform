import { NextRequest, NextResponse } from 'next/server';
import { computeRealAccuracyMetrics } from '@/lib/accuracy-compute';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();

    // Compute real accuracy metrics from live API + Firestore
    // This includes both Polymarket and Kalshi data
    const metrics = await computeRealAccuracyMetrics();

    // Store computed metrics in Firestore for caching
    await db.collection('accuracy').doc('current').set(metrics);

    return NextResponse.json({
      success: true,
      totalResolved: metrics.overall.totalResolved,
      totalTracked: metrics.includedMarkets.length,
      averageBrier: metrics.overall.averageBrierScore,
      hitRate: metrics.overall.hitRate,
    });
  } catch (error) {
    console.error('Accuracy compute cron error:', error);
    return NextResponse.json({ error: 'Accuracy computation failed' }, { status: 500 });
  }
}
