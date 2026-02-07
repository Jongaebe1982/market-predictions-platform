import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { generateApiKey } from '@/lib/api-auth';
import Stripe from 'stripe';

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    console.error('Stripe not configured');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const { registrationToken, email, name } = session.metadata || {};

        if (!registrationToken || !email || !name) {
          console.error('Missing metadata in checkout session:', session.id);
          break;
        }

        // Check if already processed
        const pendingRef = db.collection('pending-registrations').doc(registrationToken);
        const pendingDoc = await pendingRef.get();

        if (!pendingDoc.exists) {
          console.error('Registration not found:', registrationToken);
          break;
        }

        const pending = pendingDoc.data()!;

        if (pending.apiKeyGenerated) {
          console.log('API key already generated for:', email);
          break;
        }

        // Generate API key
        const apiKey = await generateApiKey(email, name, 'standard');

        // Update pending registration
        await pendingRef.update({
          apiKeyGenerated: true,
          apiKeyGeneratedAt: new Date().toISOString(),
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          apiKey: apiKey, // Store for retrieval on success page
        });

        // Store subscription info on the API key document
        await db.collection('api-keys').doc(apiKey).update({
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });

        console.log('API key generated for:', email);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find API key by subscription ID
        const keysSnapshot = await db
          .collection('api-keys')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();

        if (keysSnapshot.empty) {
          console.log('No API key found for subscription:', subscription.id);
          break;
        }

        const keyDoc = keysSnapshot.docs[0];

        // Update status based on subscription status
        if (subscription.status === 'active') {
          await keyDoc.ref.update({ active: true });
        } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
          await keyDoc.ref.update({ active: false });
        }

        console.log('Subscription updated:', subscription.id, subscription.status);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find and deactivate API key
        const keysSnapshot = await db
          .collection('api-keys')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();

        if (!keysSnapshot.empty) {
          await keysSnapshot.docs[0].ref.update({ active: false });
          console.log('API key deactivated for subscription:', subscription.id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
