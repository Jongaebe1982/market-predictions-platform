import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  // Only allow in development or with secret
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snapshot = await db.collection('resolutions').get();

    let totalResolutions = 0;
    let withHorizons = 0;
    let emptyHorizons = 0;
    const horizonCounts: Record<string, number> = {
      '30d': 0,
      '14d': 0,
      '7d': 0,
      '1d': 0,
      '12h': 0,
    };
    const sourceBreakdown: Record<string, { total: number; withHorizons: number }> = {};
    const sampleResolutions: Array<{
      id: string;
      question: string;
      source: string;
      horizonKeys: string[];
    }> = [];

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      totalResolutions++;

      const source = data.source || 'unknown';
      if (!sourceBreakdown[source]) {
        sourceBreakdown[source] = { total: 0, withHorizons: 0 };
      }
      sourceBreakdown[source].total++;

      const horizons = data.horizons || {};
      const horizonKeys = Object.keys(horizons);

      if (horizonKeys.length > 0) {
        withHorizons++;
        sourceBreakdown[source].withHorizons++;
        horizonKeys.forEach((key) => {
          if (horizonCounts[key] !== undefined) {
            horizonCounts[key]++;
          }
        });
      } else {
        emptyHorizons++;
      }

      // Sample first 10 resolutions
      if (index < 10) {
        sampleResolutions.push({
          id: doc.id,
          question: data.question?.slice(0, 60) + '...',
          source: data.source,
          horizonKeys,
        });
      }
    });

    return NextResponse.json({
      summary: {
        totalResolutions,
        withHorizons,
        emptyHorizons,
        percentWithHorizons: totalResolutions > 0
          ? Math.round((withHorizons / totalResolutions) * 100) + '%'
          : '0%',
      },
      horizonCounts,
      sourceBreakdown,
      sampleResolutions,
    });
  } catch (error) {
    console.error('Debug resolutions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resolutions', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
