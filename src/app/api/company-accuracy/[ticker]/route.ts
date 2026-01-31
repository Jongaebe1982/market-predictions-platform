import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// Aggressive caching - this data only changes twice daily (when cron runs)
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    const db = getAdminDb();

    // Try per-company document first (fastest, ~30ms)
    const companyDoc = await db.collection('company-accuracy').doc(upperTicker).get();
    if (companyDoc.exists) {
      return NextResponse.json(companyDoc.data(), {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Fall back to main accuracy document
    const mainDoc = await db.collection('accuracy').doc('current').get();
    if (mainDoc.exists) {
      const data = mainDoc.data();
      const companyData = data?.byCompany?.find(
        (c: { ticker: string }) => c.ticker === upperTicker
      );
      if (companyData) {
        return NextResponse.json(companyData, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        });
      }
    }

    return NextResponse.json(null, { status: 404 });
  } catch (error) {
    console.error(`Error fetching accuracy for ${upperTicker}:`, error);
    return NextResponse.json(null, { status: 500 });
  }
}
