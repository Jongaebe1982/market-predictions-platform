import { NextResponse } from 'next/server';
import { computeRealAccuracyMetrics } from '@/lib/accuracy-compute';
import { getAdminDb } from '@/lib/firebase-admin';

// Cache headers for edge caching
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    // First try Firestore cache (fast, ~50ms)
    const db = getAdminDb();
    const doc = await db.collection('accuracy').doc('current').get();

    if (doc.exists) {
      const cached = doc.data();
      // Only use cache if it has data
      if (cached && cached.overall?.totalResolved > 0) {
        return NextResponse.json(cached, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        });
      }
    }
  } catch (error) {
    console.error('Firestore cache read failed:', error);
  }

  // Fallback to live computation
  const metrics = await computeRealAccuracyMetrics();
  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
