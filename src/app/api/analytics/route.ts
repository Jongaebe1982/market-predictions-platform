import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    try {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const db = getAdminDb();
      await db.collection('analytics').add({
        ...event,
        serverTimestamp: new Date().toISOString(),
      });
    } catch {
      // Silently fail if Firebase not configured
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Don't fail on analytics
  }
}
