'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { IncludedMarket } from '@/lib/types';
import { HORIZONS } from '@/lib/accuracy-utils';

interface IncludedMarketsSectionProps {
  markets: IncludedMarket[];
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
}

type FilterStatus = 'all' | 'resolved' | 'active';

export function IncludedMarketsSection({ markets }: IncludedMarketsSectionProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  if (markets.length === 0) return null;

  const resolvedCount = markets.filter((m) => m.status === 'resolved').length;
  const activeCount = markets.filter((m) => m.status === 'active').length;

  const sorted = [...markets].sort((a, b) => {
    // Resolved first, then active; within each group sort by date
    if (a.status !== b.status) return a.status === 'resolved' ? -1 : 1;
    const aTime = a.resolvedAt ? new Date(a.resolvedAt).getTime() : 0;
    const bTime = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
    return bTime - aTime;
  });

  const filtered = sorted.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.question.toLowerCase().includes(q) ||
        (m.ticker && m.ticker.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>Included Markets ({markets.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-gray-200 text-xs overflow-hidden">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1.5 ${statusFilter === 'all' ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                All ({markets.length})
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-2.5 py-1.5 border-l border-gray-200 ${statusFilter === 'resolved' ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Resolved ({resolvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1.5 border-l border-gray-200 ${statusFilter === 'active' ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Active ({activeCount})
              </button>
            </div>
            <input
              type="text"
              placeholder="Filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          All markets tracked for accuracy analysis. Resolved markets have Brier scores computed
          at each available time horizon before close. Active markets will be scored once resolved.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((m, i) => (
            <div
              key={i}
              className={`border rounded-lg p-3 transition-colors ${
                m.status === 'active'
                  ? 'border-blue-100 bg-blue-50/30 hover:border-blue-200'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2" title={m.question}>
                {m.question}
              </p>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {m.ticker && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {m.ticker}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 capitalize">{m.source}</span>
                </div>
                {m.status === 'resolved' && m.outcome ? (
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      m.outcome === 'yes'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {m.outcome.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatVolume(m.volume)} vol</span>
                {m.status === 'resolved' && m.horizonsAvailable.length > 0 ? (
                  <div className="flex gap-0.5">
                    {HORIZONS.map(({ key }) => (
                      <span
                        key={key}
                        className={`inline-block px-1 py-0.5 rounded text-[10px] ${
                          m.horizonsAvailable.includes(key)
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-50 text-gray-300'
                        }`}
                        title={`${key} horizon ${m.horizonsAvailable.includes(key) ? 'available' : 'unavailable'}`}
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No markets match your filter
          </p>
        )}
      </CardContent>
    </Card>
  );
}
