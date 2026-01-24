import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MOCK_MARKETS, generateMockPriceHistory } from '@/lib/mock-data';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProFeatureButton } from '@/components/ComingSoonBadge';
import { MarketDetailCharts } from './MarketDetailCharts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MarketDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // In production, fetch from API/Firestore. Using mock data for now.
  const market = MOCK_MARKETS.find((m) => m.slug === slug);
  if (!market) notFound();

  const priceHistory = generateMockPriceHistory(30, market.outcomes[0]?.probability || 0.5);
  const relatedMarkets = MOCK_MARKETS.filter(
    (m) => m.id !== market.id && (m.sector === market.sector || m.ticker === market.ticker)
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/markets" className="hover:text-gray-700">Markets</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{market.question}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market metadata */}
          <Card>
            <CardContent>
              <h1 className="text-xl font-bold text-gray-900 mb-3">{market.question}</h1>
              <p className="text-gray-600 text-sm mb-4">{market.description}</p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {market.ticker && (
                  <Link href={`/companies/${market.ticker}`}>
                    <Badge variant="info">{market.ticker}</Badge>
                  </Link>
                )}
                <Badge variant="muted">{market.sector}</Badge>
                <Badge variant={market.source === 'polymarket' ? 'default' : 'warning'}>
                  {market.source}
                </Badge>
                <Badge variant={market.status === 'active' ? 'success' : 'muted'}>
                  {market.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Volume</p>
                  <p className="font-semibold">{formatCurrency(market.volume)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Liquidity</p>
                  <p className="font-semibold">{formatCurrency(market.liquidity)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-semibold">{formatDate(market.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-semibold">{market.endDate ? formatDate(market.endDate) : 'TBD'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outcome bars */}
          <Card>
            <CardHeader>
              <CardTitle>Current Probabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {market.outcomes.map((outcome) => (
                  <div key={outcome.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{outcome.name}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatPercentage(outcome.probability, 1)}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          outcome.name === 'Yes' ? 'bg-blue-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${outcome.probability * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Probability chart (client component) */}
          <MarketDetailCharts
            priceHistory={priceHistory}
            ticker={market.ticker}
          />

          {/* Pro teaser buttons */}
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <ProFeatureButton>Save Market</ProFeatureButton>
                <ProFeatureButton>Set Alert</ProFeatureButton>
                <ProFeatureButton>Download CSV</ProFeatureButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related markets */}
          <Card>
            <CardHeader>
              <CardTitle>Related Markets</CardTitle>
            </CardHeader>
            <CardContent>
              {relatedMarkets.length === 0 ? (
                <p className="text-sm text-gray-500">No related markets found.</p>
              ) : (
                <div className="space-y-3">
                  {relatedMarkets.map((rm) => (
                    <Link
                      key={rm.id}
                      href={`/markets/${rm.slug}`}
                      className="block p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {rm.question}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="muted" className="text-xs">{rm.ticker || rm.sector}</Badge>
                        <span className="text-sm font-bold text-blue-600">
                          {formatPercentage(rm.outcomes[0]?.probability || 0, 0)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company link */}
          {market.ticker && (
            <Card>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">Company</p>
                <Link
                  href={`/companies/${market.ticker}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {market.companyName || market.ticker} markets
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: market.question,
            description: market.description,
            url: `https://market-predictions-platform.vercel.app/markets/${market.slug}`,
          }),
        }}
      />
    </div>
  );
}

export function generateStaticParams() {
  return MOCK_MARKETS.map((m) => ({ slug: m.slug }));
}
