'use client';

import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'sent' | 'error';

export function DeveloperSignupForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitting');
    setError('');

    try {
      const res = await fetch('/api/developer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      setState('sent');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (state === 'sent') {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          We sent a verification link to <strong>{email}</strong>.
          Click the link to get your API key.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            onClick={() => setState('idle')}
            className="text-blue-600 hover:underline"
          >
            try again
          </button>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name or company"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        By signing up, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
      </div>

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {state === 'submitting' ? 'Sending...' : 'Get Free API Key'}
      </button>
    </form>
  );
}
