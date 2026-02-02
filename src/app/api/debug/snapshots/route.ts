import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();

    // Check snapshots collection
    const snapshotsCount = await db.collection('snapshots').count().get();

    // Get date range of snapshots
    const oldestSnapshot = await db.collection('snapshots')
      .orderBy('timestamp', 'asc')
      .limit(1)
      .get();

    const newestSnapshot = await db.collection('snapshots')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    // Check price-history collection
    const priceHistoryCount = await db.collection('price-history').count().get();

    // Sample a few snapshots
    const sampleSnapshots = await db.collection('snapshots')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    return NextResponse.json({
      snapshots: {
        count: snapshotsCount.data().count,
        oldest: oldestSnapshot.empty ? null : oldestSnapshot.docs[0].data().timestamp,
        newest: newestSnapshot.empty ? null : newestSnapshot.docs[0].data().timestamp,
        samples: sampleSnapshots.docs.map(doc => ({
          marketId: doc.data().marketId,
          timestamp: doc.data().timestamp,
          source: doc.data().source,
        })),
      },
      priceHistory: {
        count: priceHistoryCount.data().count,
      },
    });
  } catch (error) {
    console.error('Debug snapshots error:', error);
    return NextResponse.json(
      { error: 'Failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
