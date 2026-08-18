import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import type { IncludedMarket } from '@/lib/types';

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const db = getAdminDb();
    const doc = await db.collection('accuracy').doc('current').get();

    if (doc.exists) {
      const cached = doc.data();
      if (cached?.includedMarkets) {
        return NextResponse.json(
          { markets: cached.includedMarkets as IncludedMarket[] },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          }
        );
      }
    }

    return NextResponse.json(
      { markets: [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching included markets:', error);
    return NextResponse.json({ markets: [] }, { status: 500 });
  }
}
