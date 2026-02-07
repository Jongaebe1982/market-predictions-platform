'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type CheckoutState = 'loading' | 'ready' | 'redirecting' | 'error' | 'canceled';

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const canceled = searchParams.get('canceled');

  const [state, setState] = useState<CheckoutState>(canceled ? 'canceled' : 'loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setError('Missing registration token. Please start the signup process again.');
      return;
    }

    if (canceled) {
      setState('canceled');
      return;
    }

    // Brief delay to show the page before redirecting
    setState('ready');
  }, [token, canceled]);

  const handleCheckout = async () => {
    setState('redirecting');
    setError('');

    try {
      const res = await fetch('/api/developer/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (state === 'loading') {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Preparing checkout...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Checkout Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <a
          href="/developers"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Over
        </a>
      </div>
    );
  }

  if (state === 'canceled') {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Canceled</h2>
        <p className="text-gray-600 mb-4">No worries! You can try again when you&apos;re ready.</p>
        <button
          onClick={handleCheckout}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (state === 'redirecting') {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Redirecting to payment...</p>
      </div>
    );
  }

  // Ready state
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Verified!</h2>
      <p className="text-gray-600 mb-6">
        Complete your purchase to get your API key.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Standard API Plan</span>
          <span className="font-semibold text-gray-900">$49.99/mo</span>
        </div>
        <ul className="text-sm text-gray-500 text-left space-y-1">
          <li>• 10,000 requests/day</li>
          <li>• All endpoints included</li>
          <li>• Cancel anytime</li>
        </ul>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue to Payment
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Secure payment powered by Stripe
      </p>
    </div>
  );
}
