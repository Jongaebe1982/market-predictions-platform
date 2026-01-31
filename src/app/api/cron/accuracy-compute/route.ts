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

    // Store individual company accuracy for fast per-company lookups
    // This enables sub-100ms reads on company pages
    const batch = db.batch();
    const companyAccuracyCollection = db.collection('company-accuracy');

    for (const company of metrics.byCompany) {
      const docRef = companyAccuracyCollection.doc(company.ticker);
      batch.set(docRef, {
        ...company,
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      totalResolved: metrics.overall.totalResolved,
      totalTracked: metrics.includedMarkets.length,
      averageBrier: metrics.overall.averageBrierScore,
      hitRate: metrics.overall.hitRate,
      companiesStored: metrics.byCompany.length,
    });
  } catch (error) {
    console.error('Accuracy compute cron error:', error);
    return NextResponse.json({ error: 'Accuracy computation failed' }, { status: 500 });
  }
}
