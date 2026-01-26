import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { feature } = await request.json();

    if (!feature || typeof feature !== 'string') {
      return NextResponse.json({ error: 'Invalid feature' }, { status: 400 });
    }

    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();

    // Increment the count atomically
    const docRef = db.collection('interest').doc(feature);
    await docRef.set(
      {
        count: FieldValue.increment(1),
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    // Get the updated count
    const doc = await docRef.get();
    const newCount = doc.data()?.count || 1;

    return NextResponse.json({ success: true, count: newCount });
  } catch (error) {
    console.error('Interest tracking error:', error);
    return NextResponse.json({ error: 'Failed to track interest' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const feature = searchParams.get('feature') || 'coming-soon';

    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();

    const doc = await db.collection('interest').doc(feature).get();
    const count = doc.exists ? doc.data()?.count || 0 : 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Interest fetch error:', error);
    return NextResponse.json({ count: 0 });
  }
}
