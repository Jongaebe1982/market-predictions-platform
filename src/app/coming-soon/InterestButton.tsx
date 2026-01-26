'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface InterestButtonProps {
  initialCount: number;
}

const STORAGE_KEY = 'coming-soon-interest-clicked';

export function InterestButton({ initialCount }: InterestButtonProps) {
  const [hasClicked, setHasClicked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  // Check localStorage on mount to see if user has already clicked
  useEffect(() => {
    const clicked = localStorage.getItem(STORAGE_KEY);
    if (clicked === 'true') {
      setHasClicked(true);
    }
  }, []);

  const handleClick = async () => {
    if (hasClicked || isLoading) return;

    setIsLoading(true);

    // Optimistic update
    setHasClicked(true);
    setCount((prev) => prev + 1);
    localStorage.setItem(STORAGE_KEY, 'true');

    // Fire GA event for interest click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'interest_click', {
        event_category: 'engagement',
        event_label: 'coming_soon_pro_features',
        value: 1,
      });
    }

    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'coming-soon' }),
      });

      if (!res.ok) {
        // Revert on failure
        setHasClicked(false);
        setCount((prev) => prev - 1);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Revert on error
      setHasClicked(false);
      setCount((prev) => prev - 1);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasClicked) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Thanks for your interest!
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="px-6 py-3 text-base"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        "I'm Interested"
      )}
    </Button>
  );
}
