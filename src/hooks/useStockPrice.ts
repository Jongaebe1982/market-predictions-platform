'use client';

import { useQuery } from '@tanstack/react-query';
import type { StockPrice } from '@/lib/types';

async function fetchStockPrice(ticker: string): Promise<StockPrice> {
  const res = await fetch(`/api/stock-price?ticker=${ticker}`);
  if (!res.ok) throw new Error('Failed to fetch stock price');
  return res.json();
}

export function useStockPrice(ticker: string | null | undefined) {
  return useQuery({
    queryKey: ['stockPrice', ticker],
    queryFn: () => fetchStockPrice(ticker!),
    enabled: !!ticker,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
