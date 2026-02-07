'use client';

import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: 'No verification token provided. Please use the link from your email.',
  invalid_token: 'This verification link is invalid or has already been used.',
  expired: 'This verification link has expired. Please register again.',
  already_verified: 'This email has already been verified.',
  server_error: 'Something went wrong. Please try again.',
};

export function VerifyClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // This page now only shows errors - successful verification redirects to checkout
  const errorMessage = error ? ERROR_MESSAGES[error] || 'Something went wrong' : null;

  if (!errorMessage) {
    // No error means user landed here directly without going through verification
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600">
          Click the verification link in your email to continue with your purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h2>
      <p className="text-gray-600 mb-4">{errorMessage}</p>
      <a
        href="/developers"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try Again
      </a>
    </div>
  );
}
