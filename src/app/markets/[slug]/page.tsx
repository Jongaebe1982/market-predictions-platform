import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProFeatureButton } from '@/components/ComingSoonBadge';
import { MarketDetailCharts } from './MarketDetailCharts';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { MarketDatasetJsonLd } from '@/components/seo/JsonLd';
import type { MarketDocument, PricePoint } from '@/lib/types';
import { fetchStockPriceHistory } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://predictionmarketanalytics.io';

// Build a rich description for structured data (must be 50-5000 chars for Dataset schema)
function buildMarketDescription(market: MarketDocument): string {
  const yesProb = market.outcomes.find((o) => o.name === 'Yes')?.probability || market.outcomes[0]?.probability || 0;
  const probDisplay = `${Math.round(yesProb * 100)}%`;
  const sourceName = market.source === 'polymarket' ? 'Polymarket' : 'Kalshi';

  const parts = [
    market.description || `Prediction market: ${market.question}`,
    `Current probability: ${probDisplay} Yes.`,
    `Trading volume: ${formatCurrency(market.volume)}.`,
    `Source: ${sourceName}.`,
    market.ticker ? `Related to ${market.ticker} stock.` : '',
    market.sector ? `Sector: ${market.sector}.` : '',
    'Track real-time probability updates and historical price data.',
  ];

  return parts.filter(Boolean).join(' ').trim();
}

async function getMarketBySlug(slug: string): Promise<MarketDocument | null> {
  const [{ fetchPolymarketStockMarkets }, { fetchKalshiStockMarkets }] =
    await Promise.all([import('@/lib/polymarket'), import('@/lib/kalshi')]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  return allMarkets.find((m) => m.slug === slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);

  if (!market) {
    return { title: 'Market Not Found' };
  }

  const yesProb = market.outcomes.find((o) => o.name === 'Yes')?.probability || market.outcomes[0]?.probability || 0;
  const probDisplay = `${Math.round(yesProb * 100)}%`;
  const volumeDisplay = formatCurrency(market.volume);

  const title = market.question;
  const description = `Current probability: ${probDisplay} Yes. ${volumeDisplay} volume on ${market.source}. ${market.ticker ? `Track ${market.ticker} prediction markets.` : ''} ${market.description?.slice(0, 120) || ''}`.trim();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${BASE_URL}/markets/${market.slug}`,
      siteName: 'Market Predictions',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/markets/${market.slug}`,
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getMarketData(slug: string): Promise<{
  market: MarketDocument;
  priceHistory: PricePoint[];
  stockPriceHistory: { timestamp: number; price: number }[];
  relatedMarkets: MarketDocument[];
} | null> {
  const [{ fetchPolymarketStockMarkets, fetchPriceHistory }, { fetchKalshiStockMarkets }] =
    await Promise.all([import('@/lib/polymarket'), import('@/lib/kalshi')]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketStockMarkets(),
    fetchKalshiStockMarkets(),
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  const market = allMarkets.find((m) => m.slug === slug);
  if (!market) return null;

  const priceHistory = market.source === 'polymarket'
    ? await fetchPriceHistory(market.sourceId)
    : [];

  // Fetch stock price history if market has a ticker
  let stockPriceHistory: { timestamp: number; price: number }[] = [];
  if (market.ticker && priceHistory.length > 0) {
    const startTs = priceHistory[0].timestamp;
    const days = Math.ceil((Date.now() - startTs) / (24 * 60 * 60 * 1000));
    stockPriceHistory = await fetchStockPriceHistory(market.ticker, Math.max(days, 5));
  }

  const relatedMarkets = allMarkets.filter(
    (m) => m.id !== market.id && (m.sector === market.sector || m.ticker === market.ticker)
  ).slice(0, 4);

  return { market, priceHistory, stockPriceHistory, relatedMarkets };
}

export default async function MarketDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await getMarketData(slug);
  if (!data) notFound();

  const { market, priceHistory, stockPriceHistory, relatedMarkets } = data;

  const truncatedQuestion = market.question.length > 50
    ? market.question.slice(0, 47) + '...'
    : market.question;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb with JSON-LD */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Markets', href: '/markets' },
          { label: truncatedQuestion },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market metadata */}
          <section id="probability">
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
                <Link href={`/sources/${market.source}`}>
                  <Badge variant={market.source === 'polymarket' ? 'default' : 'warning'}>
                    {market.source}
                  </Badge>
                </Link>
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
          </section>

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
          <MarketDetailCharts priceHistory={priceHistory} stockPriceHistory={stockPriceHistory} ticker={market.ticker} />

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

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Learn More</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href={`/sources/${market.source}`}
                  className="block text-blue-600 hover:text-blue-700"
                >
                  About {market.source === 'polymarket' ? 'Polymarket' : 'Kalshi'} →
                </Link>
                <Link
                  href="/methodology#brier-score"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  How we measure accuracy →
                </Link>
                <Link
                  href="/glossary#prediction-market"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  What is a prediction market? →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* JSON-LD Dataset Schema */}
      <MarketDatasetJsonLd
        name={market.question}
        description={buildMarketDescription(market)}
        slug={market.slug}
        source={market.source}
        dateCreated={market.startDate?.toString()}
      />
    </div>
  );
}
