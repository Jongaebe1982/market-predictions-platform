'use client';

import { useQuery } from '@tanstack/react-query';
import type { MarketDocument, MarketFilters, PaginatedResponse } from '@/lib/types';

async function fetchMarkets(filters: MarketFilters, page: number = 1): Promise<PaginatedResponse<MarketDocument>> {
  const params = new URLSearchParams();
  if (filters.sector) params.set('sector', filters.sector);
  if (filters.source) params.set('source', filters.source);
  if (filters.ticker) params.set('ticker', filters.ticker);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.earnings) params.set('earnings', 'true');
  params.set('page', String(page));

  const res = await fetch(`/api/markets?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch markets');
  return res.json();
}

export function useMarkets(filters: MarketFilters = {}, page: number = 1) {
  return useQuery({
    queryKey: ['markets', filters, page],
    queryFn: () => fetchMarkets(filters, page),
  });
}
