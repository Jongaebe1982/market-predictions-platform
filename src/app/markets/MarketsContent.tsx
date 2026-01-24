'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMarkets } from '@/hooks/useMarkets';
import { SECTORS } from '@/lib/constants';
import { formatCurrency, formatPercentage, formatRelativeDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import type { MarketFilters } from '@/lib/types';

const TABS = [
  { id: 'all', label: 'All Markets' },
  { id: 'movers-up', label: 'Big Movers ↑' },
  { id: 'movers-down', label: 'Big Movers ↓' },
];

const SOURCE_OPTIONS = [
  { value: 'polymarket', label: 'Polymarket' },
  { value: 'kalshi', label: 'Kalshi' },
];

const SORT_OPTIONS = [
  { value: 'volume', label: 'Volume' },
  { value: 'probability', label: 'Probability' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'ending-soon', label: 'Ending Soon' },
];

export function MarketsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('all');
  const [sector, setSector] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('volume');
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const filters: MarketFilters = useMemo(
    () => ({
      sector: sector || undefined,
      source: source || undefined,
      search: search || undefined,
      sort: sort as MarketFilters['sort'],
      status: 'active',
    }),
    [sector, source, search, sort]
  );

  const { data, isLoading, error } = useMarkets(filters, page);

  const displayedMarkets = useMemo(() => {
    if (!data?.data) return [];
    if (activeTab === 'movers-up') {
      return [...data.data]
        .filter((m) => m.outcomes[0]?.probability > 0.6)
        .sort((a, b) => b.outcomes[0].probability - a.outcomes[0].probability);
    }
    if (activeTab === 'movers-down') {
      return [...data.data]
        .filter((m) => m.outcomes[0]?.probability < 0.4)
        .sort((a, b) => a.outcomes[0].probability - b.outcomes[0].probability);
    }
    return data.data;
  }, [data, activeTab]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Markets</h1>
        <p className="text-gray-600">Browse and filter stock and earnings prediction markets.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-40">
          <Select
            options={SECTORS.map((s) => ({ value: s, label: s }))}
            placeholder="All Sectors"
            value={sector}
            onChange={(e) => { setSector(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-36">
          <Select
            options={SOURCE_OPTIONS}
            placeholder="All Sources"
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-36">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search markets..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} defaultTab="all" onChange={setActiveTab} className="mb-6" />

      {/* Market List */}
      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent>
            <p className="text-red-600">Failed to load markets. Please try again.</p>
          </CardContent>
        </Card>
      ) : displayedMarkets.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center py-8">No markets found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3">
            {displayedMarkets.map((market) => (
              <Link key={market.id} href={`/markets/${market.slug}`}>
                <Card className="hover:border-blue-200 hover:shadow-md transition-all">
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{market.question}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {market.ticker && <Badge variant="info">{market.ticker}</Badge>}
                          <Badge variant="muted">{market.sector}</Badge>
                          <Badge variant={market.source === 'polymarket' ? 'default' : 'warning'}>
                            {market.source}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {formatCurrency(market.volume)} vol
                          </span>
                          <span className="text-xs text-gray-400">
                            Updated {formatRelativeDate(market.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-blue-600">
                          {formatPercentage(market.outcomes[0]?.probability || 0, 0)}
                        </div>
                        <div className="text-xs text-gray-500">{market.outcomes[0]?.name}</div>
                      </div>
                    </div>
                    {/* Probability bar */}
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(market.outcomes[0]?.probability || 0) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data && data.total > data.pageSize && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {Math.ceil(data.total / data.pageSize)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!data.hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
