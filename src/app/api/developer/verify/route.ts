import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://predictionmarketanalytics.io';

/**
 * GET /api/developer/verify?token=xxx
 * Verify email and redirect to Stripe checkout
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${BASE_URL}/developers/verify?error=missing_token`);
    }

    const db = getAdminDb();
    const pendingRef = db.collection('pending-registrations').doc(token);
    const pendingDoc = await pendingRef.get();

    if (!pendingDoc.exists) {
      return NextResponse.redirect(`${BASE_URL}/developers/verify?error=invalid_token`);
    }

    const pending = pendingDoc.data()!;

    // Check if expired
    if (new Date(pending.expiresAt) < new Date()) {
      return NextResponse.redirect(`${BASE_URL}/developers/verify?error=expired`);
    }

    // Check if already has an API key (already paid)
    if (pending.apiKeyGenerated) {
      return NextResponse.redirect(`${BASE_URL}/developers/verify?error=already_verified`);
    }

    // Mark email as verified
    await pendingRef.update({
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    // Redirect to checkout page with token
    return NextResponse.redirect(`${BASE_URL}/developers/checkout?token=${token}`);
  } catch (error) {
    console.error('Developer verification error:', error);
    return NextResponse.redirect(`${BASE_URL}/developers/verify?error=server_error`);
  }
}
