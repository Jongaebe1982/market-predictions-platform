'use client';

import { useQuery } from '@tanstack/react-query';
import type { MarketDocument, PricePoint } from '@/lib/types';

interface MarketDetailResponse {
  market: MarketDocument;
  priceHistory: PricePoint[];
  relatedMarkets: MarketDocument[];
}

async function fetchMarketDetail(slug: string): Promise<MarketDetailResponse> {
  const res = await fetch(`/api/markets/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch market detail');
  return res.json();
}

export function useMarketDetail(slug: string) {
  return useQuery({
    queryKey: ['market', slug],
    queryFn: () => fetchMarketDetail(slug),
    enabled: !!slug,
  });
}
