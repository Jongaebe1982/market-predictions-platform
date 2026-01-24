'use client';

import { useQuery } from '@tanstack/react-query';
import type { CompanyData } from '@/lib/types';

async function fetchCompany(ticker: string): Promise<CompanyData> {
  const res = await fetch(`/api/companies/${ticker}`);
  if (!res.ok) throw new Error('Failed to fetch company');
  return res.json();
}

export function useCompany(ticker: string) {
  return useQuery({
    queryKey: ['company', ticker],
    queryFn: () => fetchCompany(ticker),
    enabled: !!ticker,
  });
}
