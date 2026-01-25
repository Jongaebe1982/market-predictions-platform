import type { Metadata } from 'next';
import Link from 'next/link';
import {
  COMPANY_MAPPINGS,
  type CompanyMapping,
  groupCompaniesBySector,
} from '@/lib/sector-mapping';
import { getAllCompanies, fetchDiscoveredCompanies } from '@/lib/company-discovery';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { MarketDocument } from '@/lib/types';

export const metadata: Metadata = {
  title: 'All Companies',
  description: 'Browse prediction markets for Fortune 500 companies across Technology, Finance, Healthcare, Energy, and more sectors. Coverage expands automatically as companies appear in Polymarket and Kalshi markets.',
};

export const revalidate = 3600; // ISR: revalidate every hour

const BASE_URL = 'https://market-predictions-platform.vercel.app';

async function getMarketCounts(): Promise<Record<string, number>> {
  const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] =
    await Promise.all([import('@/lib/polymarket'), import('@/lib/kalshi')]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);
  const allMarkets: MarketDocument[] = [...polymarkets, ...kalshiMarkets];
  const activeMarkets = allMarkets.filter((m) => m.status === 'active');

  return activeMarkets.reduce<Record<string, number>>((acc, market) => {
    if (market.ticker) {
      acc[market.ticker] = (acc[market.ticker] || 0) + 1;
    }
    return acc;
  }, {});
}

export default async function CompaniesPage() {
  // Fetch all companies (static + discovered) and market counts in parallel
  const [allCompanies, discoveredCompanies, marketCounts] = await Promise.all([
    getAllCompanies(),
    fetchDiscoveredCompanies(),
    getMarketCounts(),
  ]);

  // Track which companies are newly discovered
  const discoveredTickers = new Set(discoveredCompanies.map((c) => c.ticker.toUpperCase()));

  const companiesBySector = groupCompaniesBySector(allCompanies);
  const sectors = Object.keys(companiesBySector).sort();

  const totalCompanies = allCompanies.length;
  const staticCompanyCount = COMPANY_MAPPINGS.length;
  const newlyDiscoveredCount = discoveredCompanies.length;
  const companiesWithMarkets = Object.values(marketCounts).filter((c) => c > 0).length;
  const totalActiveMarkets = Object.values(marketCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Companies</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Companies</h1>
        <p className="text-gray-600 max-w-3xl">
          Browse prediction markets for {totalCompanies} companies across multiple sectors.
          We track stock, earnings, and corporate event predictions from Polymarket and Kalshi.
          We regularly scan the Fortune 500 and pull in prediction market data for any companies
          that appear in active markets. Coverage expands automatically as more companies are
          included in prediction markets.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Companies Tracked</p>
            <p className="text-2xl font-bold text-gray-900">{totalCompanies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">With Active Markets</p>
            <p className="text-2xl font-bold text-blue-600">{companiesWithMarkets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Active Markets</p>
            <p className="text-2xl font-bold text-green-600">{totalActiveMarkets}</p>
          </CardContent>
        </Card>
        {newlyDiscoveredCount > 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Auto-Discovered</p>
              <p className="text-2xl font-bold text-purple-600">{newlyDiscoveredCount}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Companies by Sector */}
      <div className="space-y-8">
        {sectors.map((sector) => (
          <Card key={sector}>
            <CardHeader>
              <CardTitle>{sector}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {companiesBySector[sector]
                  .sort((a, b) => (marketCounts[b.ticker] || 0) - (marketCounts[a.ticker] || 0))
                  .map((company) => {
                    const count = marketCounts[company.ticker] || 0;
                    const isDiscovered = discoveredTickers.has(company.ticker.toUpperCase());
                    return (
                      <Link
                        key={company.ticker}
                        href={`/companies/${company.ticker}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-700 font-bold text-xs">{company.ticker}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{company.name}</p>
                              {isDiscovered && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{company.ticker}</p>
                          </div>
                        </div>
                        {count > 0 && (
                          <Badge variant="info">{count} market{count !== 1 ? 's' : ''}</Badge>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* JSON-LD ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Companies with Prediction Markets',
            description: 'List of companies tracked across Polymarket and Kalshi prediction markets',
            numberOfItems: totalCompanies,
            itemListElement: allCompanies.map((company, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Organization',
                name: company.name,
                tickerSymbol: company.ticker,
                url: `${BASE_URL}/companies/${company.ticker}`,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
