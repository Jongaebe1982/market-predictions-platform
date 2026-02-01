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
import type { MarketDocument, PricePoint, MarketResolution, MarketContent } from '@/lib/types';
import { fetchStockPriceHistory } from '@/lib/yahoo-finance';
import { getAdminDb } from '@/lib/firebase-admin';
import { MarketExplanation } from '@/components/market/MarketExplanation';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://predictionmarketanalytics.io';

// Build a rich description for structured data (must be 50-5000 chars for Dataset schema)
function buildMarketDescription(market: MarketDocument, resolution?: MarketResolution | null): string {
  const sourceName = market.source === 'polymarket' ? 'Polymarket' : 'Kalshi';
  const isResolved = market.status === 'resolved' || !!resolution;

  if (isResolved) {
    const outcome = resolution?.outcome || market.resolution || 'unknown';
    const brierScore = resolution?.brierScore;
    const parts = [
      market.description || `Prediction market: ${market.question}`,
      `This market has resolved to ${outcome.toUpperCase()}.`,
      brierScore !== undefined ? `Brier Score: ${brierScore.toFixed(3)} (lower is better).` : '',
      `Final trading volume: ${formatCurrency(market.volume)}.`,
      `Source: ${sourceName}.`,
      market.ticker ? `Related to ${market.ticker} stock.` : '',
      market.sector ? `Sector: ${market.sector}.` : '',
      'View historical probability data and market accuracy analysis.',
    ];
    return parts.filter(Boolean).join(' ').trim();
  }

  const yesProb = market.outcomes.find((o) => o.name === 'Yes')?.probability || market.outcomes[0]?.probability || 0;
  const probDisplay = `${Math.round(yesProb * 100)}%`;

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
  // Fetch ALL markets including resolved ones so we don't 404 on resolved markets
  const [{ fetchAllPolymarketMarkets }, { fetchAllKalshiMarkets }] =
    await Promise.all([import('@/lib/polymarket'), import('@/lib/kalshi')]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchAllPolymarketMarkets(),
    fetchAllKalshiMarkets(),
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  return allMarkets.find((m) => m.slug === slug) || null;
}

// Fetch pre-generated market content from Firestore
async function getMarketContent(marketId: string): Promise<MarketContent | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('market-content').doc(marketId).get();
    if (!doc.exists) return null;
    return doc.data() as MarketContent;
  } catch (error) {
    console.error('Error fetching market content:', error);
    return null;
  }
}

// Fetch resolution data (Brier score, horizons) for a resolved market
async function getMarketResolution(marketId: string): Promise<MarketResolution | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('resolutions').doc(marketId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
      id: doc.id,
      marketId: data?.marketId || doc.id,
      slug: data?.slug || '',
      question: data?.question || '',
      sector: data?.sector || 'Technology',
      ticker: data?.ticker || null,
      source: data?.source || 'polymarket',
      resolvedAt: data?.resolvedAt || '',
      resolution: data?.resolution || data?.outcome || '',
      finalProbability: data?.finalProbability || 0,
      outcome: data?.outcome || 'no',
      brierScore: data?.brierScore || 0,
      volume: data?.volume || 0,
      horizons: data?.horizons || {},
    } as MarketResolution;
  } catch (error) {
    console.error('Error fetching market resolution:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);

  if (!market) {
    return { title: 'Market Not Found' };
  }

  const isResolved = market.status === 'resolved';
  const volumeDisplay = formatCurrency(market.volume);

  let description: string;
  if (isResolved) {
    const outcome = market.resolution || 'Yes/No';
    description = `Resolved: ${outcome.toUpperCase()}. Final volume: ${volumeDisplay} on ${market.source}. ${market.ticker ? `${market.ticker} prediction market.` : ''} ${market.description?.slice(0, 100) || ''}`.trim();
  } else {
    const yesProb = market.outcomes.find((o) => o.name === 'Yes')?.probability || market.outcomes[0]?.probability || 0;
    const probDisplay = `${Math.round(yesProb * 100)}%`;
    description = `Current probability: ${probDisplay} Yes. ${volumeDisplay} volume on ${market.source}. ${market.ticker ? `Track ${market.ticker} prediction markets.` : ''} ${market.description?.slice(0, 120) || ''}`.trim();
  }

  const title = market.question;

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
  resolution: MarketResolution | null;
  marketContent: MarketContent | null;
} | null> {
  // Fetch ALL markets including resolved ones
  const [{ fetchAllPolymarketMarkets, fetchPriceHistoryWithFallback }, { fetchAllKalshiMarkets }] =
    await Promise.all([import('@/lib/polymarket'), import('@/lib/kalshi')]);
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchAllPolymarketMarkets(),
    fetchAllKalshiMarkets(),
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  const market = allMarkets.find((m) => m.slug === slug);
  if (!market) return null;

  // Fetch resolution data if market is resolved, and pre-generated content
  const [resolution, marketContent] = await Promise.all([
    market.status === 'resolved' ? getMarketResolution(market.id) : Promise.resolve(null),
    getMarketContent(market.id),
  ]);

  // Use fetchPriceHistoryWithFallback to get stored history for resolved markets
  const priceHistory = market.source === 'polymarket'
    ? await fetchPriceHistoryWithFallback(market.sourceId, market.id)
    : [];

  // Fetch stock price history if market has a ticker
  let stockPriceHistory: { timestamp: number; price: number }[] = [];
  if (market.ticker && priceHistory.length > 0) {
    const startTs = priceHistory[0].timestamp;
    const days = Math.ceil((Date.now() - startTs) / (24 * 60 * 60 * 1000));
    stockPriceHistory = await fetchStockPriceHistory(market.ticker, Math.max(days, 5));
  }

  // Only show active markets in related markets
  const relatedMarkets = allMarkets.filter(
    (m) => m.id !== market.id && m.status === 'active' && (m.sector === market.sector || m.ticker === market.ticker)
  ).slice(0, 4);

  return { market, priceHistory, stockPriceHistory, relatedMarkets, resolution, marketContent };
}

export default async function MarketDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await getMarketData(slug);
  if (!data) notFound();

  const { market, priceHistory, stockPriceHistory, relatedMarkets, resolution, marketContent } = data;
  const isResolved = market.status === 'resolved';

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
                <Badge variant={market.status === 'active' ? 'success' : market.status === 'resolved' ? 'info' : 'muted'}>
                  {market.status === 'resolved' ? `Resolved: ${(resolution?.outcome || market.resolution)?.toUpperCase() || 'N/A'}` : market.status}
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

          {/* Outcome bars / Resolution display */}
          {isResolved ? (
            <Card>
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Resolved Outcome */}
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
                      (resolution?.outcome || market.resolution)?.toLowerCase() === 'yes'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      <span className={`text-2xl font-bold ${
                        (resolution?.outcome || market.resolution)?.toLowerCase() === 'yes'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {(resolution?.outcome || market.resolution)?.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Resolved Outcome</p>
                      <p className="text-lg font-semibold text-gray-900">
                        This market resolved to {(resolution?.outcome || market.resolution)?.toUpperCase() || 'N/A'}
                      </p>
                      {market.resolvedAt && (
                        <p className="text-sm text-gray-500">on {formatDate(market.resolvedAt)}</p>
                      )}
                    </div>
                  </div>

                  {/* Brier Score if available */}
                  {resolution?.brierScore !== undefined && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Brier Score</p>
                          <p className="text-xl font-bold text-gray-900">
                            {resolution.brierScore.toFixed(3)}
                          </p>
                          <Link href="/methodology#brier-score" className="text-xs text-blue-600 hover:underline">
                            Lower is better
                          </Link>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Final Probability</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatPercentage(resolution.finalProbability || 0, 1)}
                          </p>
                          <p className="text-xs text-gray-500">before resolution</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Horizon data if available */}
                  {resolution?.horizons && Object.keys(resolution.horizons).length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Probability Over Time</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                        {(['30d', '14d', '7d', '1d', '12h'] as const).map((key) => {
                          const horizon = resolution.horizons?.[key];
                          if (!horizon) return null;
                          return (
                            <div key={key} className="bg-gray-50 rounded p-2 text-center">
                              <p className="text-xs text-gray-500">{key} before</p>
                              <p className="font-semibold">{formatPercentage(horizon.probability, 0)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}

          {/* Market Explanation (SEO content) */}
          <MarketExplanation content={marketContent} market={market} />

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
        description={buildMarketDescription(market, resolution)}
        slug={market.slug}
        source={market.source}
        dateCreated={market.startDate?.toString()}
      />
    </div>
  );
}
