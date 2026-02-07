import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * GET /api/developer/success?session_id=xxx
 * Retrieve API key after successful payment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 503 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      );
    }

    const { registrationToken } = session.metadata || {};

    if (!registrationToken) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const pendingRef = db.collection('pending-registrations').doc(registrationToken);
    const pendingDoc = await pendingRef.get();

    if (!pendingDoc.exists) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const pending = pendingDoc.data()!;

    // Check if API key has been generated (by webhook)
    if (!pending.apiKeyGenerated || !pending.apiKey) {
      // Webhook hasn't processed yet, tell client to retry
      return NextResponse.json(
        { status: 'pending', message: 'API key is being generated' },
        { status: 202 }
      );
    }

    // Return the API key (only shown once via this endpoint)
    return NextResponse.json({
      apiKey: pending.apiKey,
      email: pending.email,
      name: pending.name,
      tier: 'standard',
      limits: {
        daily: 10000,
      },
    });
  } catch (error) {
    console.error('Success endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API key' },
      { status: 500 }
    );
  }
}
