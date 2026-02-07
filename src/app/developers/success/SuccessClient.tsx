'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ApiKeyResult {
  apiKey?: string;
  email?: string;
  name?: string;
  error?: string;
}

type SuccessState = 'loading' | 'success' | 'pending' | 'error';

export function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [state, setState] = useState<SuccessState>('loading');
  const [result, setResult] = useState<ApiKeyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setState('error');
      setResult({ error: 'Missing session ID' });
      return;
    }

    const fetchApiKey = async () => {
      try {
        const res = await fetch(`/api/developer/success?session_id=${sessionId}`);
        const data = await res.json();

        if (res.ok && data.apiKey) {
          setState('success');
          setResult(data);
        } else if (res.status === 202) {
          // Still processing
          setState('pending');
          // Retry after delay (up to 5 times)
          if (retryCount < 5) {
            setTimeout(() => setRetryCount((c) => c + 1), 2000);
          } else {
            setState('error');
            setResult({ error: 'Payment processing is taking longer than expected. Please check back in a few minutes or contact support.' });
          }
        } else {
          setState('error');
          setResult({ error: data.error || 'Failed to retrieve API key' });
        }
      } catch {
        setState('error');
        setResult({ error: 'Failed to connect to server' });
      }
    };

    fetchApiKey();
  }, [sessionId, retryCount]);

  const copyToClipboard = async () => {
    if (result?.apiKey) {
      await navigator.clipboard.writeText(result.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (state === 'loading' || state === 'pending') {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">
          {state === 'pending' ? 'Processing your payment...' : 'Loading your API key...'}
        </p>
        {state === 'pending' && (
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        )}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something Went Wrong</h2>
        <p className="text-gray-600 mb-4">{result?.error}</p>
        <p className="text-sm text-gray-500">
          If you were charged, please contact{' '}
          <a href="mailto:support@predictionmarketanalytics.io" className="text-blue-600 hover:underline">
            support@predictionmarketanalytics.io
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h2>
      <p className="text-gray-600 mb-6">
        Welcome, {result?.name}! Here&apos;s your API key:
      </p>

      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <code className="text-green-400 font-mono text-sm break-all">
          {result?.apiKey}
        </code>
      </div>

      <button
        onClick={copyToClipboard}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy to Clipboard
          </>
        )}
      </button>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800">Save this key now!</p>
            <p className="text-sm text-yellow-700 mt-1">
              This is the only time your API key will be displayed. Store it securely - we cannot show it again.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p><strong>Plan:</strong> Standard (10,000 requests/day)</p>
        <p className="mt-1"><strong>Email:</strong> {result?.email}</p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">Ready to start? Here&apos;s a quick test:</p>
        <pre className="bg-gray-100 rounded-lg p-3 text-xs text-left overflow-x-auto">
{`curl -H "Authorization: Bearer ${result?.apiKey?.slice(0, 20)}..." \\
  https://predictionmarketanalytics.io/api/v1/markets`}
        </pre>
      </div>
    </div>
  );
}
