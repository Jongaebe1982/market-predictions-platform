import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { generateApiKey } from '@/lib/api-auth';

/**
 * GET /api/developer/verify?token=xxx
 * Verify email and generate API key
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token', message: 'Verification token is required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const pendingRef = db.collection('pending-registrations').doc(token);
    const pendingDoc = await pendingRef.get();

    if (!pendingDoc.exists) {
      return NextResponse.json(
        { error: 'Invalid token', message: 'This verification link is invalid or has expired' },
        { status: 404 }
      );
    }

    const pending = pendingDoc.data()!;

    // Check if already verified
    if (pending.verified) {
      return NextResponse.json(
        { error: 'Already verified', message: 'This email has already been verified' },
        { status: 409 }
      );
    }

    // Check if expired
    if (new Date(pending.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Token expired', message: 'This verification link has expired. Please register again.' },
        { status: 410 }
      );
    }

    // Generate API key
    const apiKey = await generateApiKey(pending.email, pending.name, 'free');

    // Mark as verified
    await pendingRef.update({
      verified: true,
      verifiedAt: new Date().toISOString(),
      apiKeyGenerated: true,
    });

    return NextResponse.json({
      success: true,
      apiKey,
      email: pending.email,
      name: pending.name,
      tier: 'free',
      limits: {
        daily: 100,
      },
      message: 'Save this key securely - it will not be shown again',
    });
  } catch (error) {
    console.error('Developer verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', message: 'Please try again later' },
      { status: 500 }
    );
  }
}
