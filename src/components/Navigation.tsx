'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SearchBar } from './SearchBar';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
  { href: '/accuracy', label: 'Accuracy' },
  { href: '/about', label: 'About' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">
                Market Predictions
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                Pro
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar />
          </div>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-4 overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm font-medium whitespace-nowrap transition-colors',
              pathname === link.href
                ? 'text-blue-600'
                : 'text-gray-600'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
