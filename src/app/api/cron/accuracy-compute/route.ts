import { NextRequest, NextResponse } from 'next/server';
import { computeAccuracyMetrics } from '@/lib/accuracy-utils';
import type { MarketResolution } from '@/lib/types';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();

    // Fetch all resolutions
    const snapshot = await db.collection('resolutions').orderBy('resolvedAt', 'desc').get();
    const resolutions: MarketResolution[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MarketResolution[];

    // Compute accuracy metrics
    const metrics = computeAccuracyMetrics(resolutions);

    // Store computed metrics
    await db.collection('accuracy').doc('current').set(metrics);

    return NextResponse.json({
      success: true,
      totalResolved: resolutions.length,
      averageBrier: metrics.overall.averageBrierScore,
      hitRate: metrics.overall.hitRate,
    });
  } catch (error) {
    console.error('Accuracy compute cron error:', error);
    return NextResponse.json({ error: 'Accuracy computation failed' }, { status: 500 });
  }
}
