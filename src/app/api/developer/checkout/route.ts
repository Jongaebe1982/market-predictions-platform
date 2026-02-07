import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://predictionmarketanalytics.io';

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * POST /api/developer/checkout
 * Create a Stripe checkout session for API subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
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

    const priceId = process.env.STRIPE_STANDARD_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: 'Pricing not configured' },
        { status: 503 }
      );
    }

    const db = getAdminDb();
    const pendingRef = db.collection('pending-registrations').doc(token);
    const pendingDoc = await pendingRef.get();

    if (!pendingDoc.exists) {
      return NextResponse.json(
        { error: 'Invalid registration token' },
        { status: 404 }
      );
    }

    const pending = pendingDoc.data()!;

    if (!pending.verified) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 400 }
      );
    }

    if (pending.apiKeyGenerated) {
      return NextResponse.json(
        { error: 'API key already generated' },
        { status: 409 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: pending.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        registrationToken: token,
        email: pending.email,
        name: pending.name,
      },
      success_url: `${BASE_URL}/developers/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/developers/checkout?token=${token}&canceled=true`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
