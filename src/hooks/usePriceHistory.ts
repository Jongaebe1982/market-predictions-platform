'use client';

import { useQuery } from '@tanstack/react-query';
import type { PricePoint } from '@/lib/types';

async function fetchPriceHistory(conditionId: string): Promise<PricePoint[]> {
  const res = await fetch(`/api/prices-history?market=${conditionId}`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
}

export function usePriceHistory(conditionId: string | undefined) {
  return useQuery({
    queryKey: ['priceHistory', conditionId],
    queryFn: () => fetchPriceHistory(conditionId!),
    enabled: !!conditionId,
  });
}
