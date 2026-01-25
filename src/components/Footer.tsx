import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">MP</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">Market Predictions</span>
            </div>
            <p className="text-sm text-gray-500">
              Track stock and earnings prediction markets with accuracy scoring.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-3">Browse</h4>
            <ul className="space-y-2">
              <li><Link href="/markets" className="text-sm text-gray-500 hover:text-gray-700">All Markets</Link></li>
              <li><Link href="/companies" className="text-sm text-gray-500 hover:text-gray-700">All Companies</Link></li>
              <li><Link href="/analytics" className="text-sm text-gray-500 hover:text-gray-700">Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-3">Data Sources</h4>
            <ul className="space-y-2">
              <li><Link href="/sources/polymarket" className="text-sm text-gray-500 hover:text-gray-700">Polymarket</Link></li>
              <li><Link href="/sources/kalshi" className="text-sm text-gray-500 hover:text-gray-700">Kalshi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/methodology" className="text-sm text-gray-500 hover:text-gray-700">Methodology</Link></li>
              <li><Link href="/glossary" className="text-sm text-gray-500 hover:text-gray-700">Glossary</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-700">About</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Data sourced from Polymarket and Kalshi. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
