import { NextRequest, NextResponse } from 'next/server';

// Temporary debug endpoint - remove after testing
export async function GET() {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();
    await db.collection('analytics').add({
      type: 'debug-test',
      timestamp: Date.now(),
      serverTimestamp: new Date().toISOString(),
    });
    return NextResponse.json({ status: 'success', message: 'Firebase write succeeded' });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    });
  }
}

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
