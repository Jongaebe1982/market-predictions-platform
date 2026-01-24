'use client';

import { useCallback } from 'react';
import { trackClick } from '@/lib/analytics';

export function useAnalytics() {
  const track = useCallback((element: string, metadata?: Record<string, string>) => {
    trackClick(element, metadata);
  }, []);

  return { trackClick: track };
}
