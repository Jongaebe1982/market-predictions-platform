'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (debouncedQuery.trim()) {
        router.push(`/markets?search=${encodeURIComponent(debouncedQuery.trim())}`);
        setQuery('');
      }
    },
    [debouncedQuery, router]
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search markets..."
        className="w-40 sm:w-56 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
      />
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </form>
  );
}
