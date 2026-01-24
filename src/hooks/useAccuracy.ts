'use client';

import { useQuery } from '@tanstack/react-query';
import type { AccuracyMetrics } from '@/lib/types';

async function fetchAccuracy(): Promise<AccuracyMetrics> {
  const res = await fetch('/api/accuracy');
  if (!res.ok) throw new Error('Failed to fetch accuracy');
  return res.json();
}

export function useAccuracy() {
  return useQuery({
    queryKey: ['accuracy'],
    queryFn: fetchAccuracy,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
