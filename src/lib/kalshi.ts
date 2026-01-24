import { KALSHI_API } from './constants';
import { cache } from './cache';
import { extractTicker, isEarningsRelated } from './company-matching';
import { slugify } from './utils';
import type { MarketDocument } from './types';

// Relevant series for financial/stock markets
const FINANCIAL_SERIES = [
  // Index markets
  'KXINXAB', 'INXAB', 'KXINXZ',
  'KXNASDAQ100U', 'KXNASDAQ100POS', 'NASDAQ100Y',
  // Fed/rates
  'KXFED',
  // Treasury/bonds
  'KXTNOTE',
  // Commodities
  'WTI', 'KXWTIW',
  // GDP/Economics
  'GDP', 'GDPUSMAX',
  // Inflation
  'ACPI',
  // Mortgage
  'KXFRM',
  // Crypto
  'KXBTCATH', 'KXETHMAXM',
  // Company-specific
  'KXMICROS',
];

interface KalshiMarketResponse {
  ticker: string;
  title: string;
  subtitle: string;
  event_ticker: string;
  status: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  volume_24h: number;
  open_interest: number;
  liquidity: number;
  close_time: string;
  open_time: string;
  created_time: string;
  result: string;
  market_type: string;
  notional_value: number;
}

async function fetchSeriesMarkets(seriesTicker: string): Promise<KalshiMarketResponse[]> {
  try {
    const res = await fetch(
      `${KALSHI_API}/markets?series_ticker=${seriesTicker}&status=open&limit=100`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.markets || [];
  } catch {
    return [];
  }
}

function getSectorFromSeries(seriesTicker: string): string {
  if (seriesTicker.includes('INX') || seriesTicker.includes('NASDAQ') || seriesTicker.includes('100')) return 'Financials';
  if (seriesTicker.includes('FED') || seriesTicker.includes('FRM') || seriesTicker.includes('TNOTE')) return 'Finance';
  if (seriesTicker.includes('GDP') || seriesTicker.includes('CPI') || seriesTicker.includes('ACPI')) return 'Economics';
  if (seriesTicker.includes('WTI')) return 'Energy';
  if (seriesTicker.includes('BTC') || seriesTicker.includes('ETH') || seriesTicker.includes('XRP')) return 'Crypto';
  if (seriesTicker.includes('MICROS')) return 'Technology';
  return 'Financials';
}

function getTickerFromSeries(seriesTicker: string): string | null {
  if (seriesTicker.includes('INX') || seriesTicker === 'INXAB') return 'SPY';
  if (seriesTicker.includes('NASDAQ') || seriesTicker.includes('100')) return 'QQQ';
  if (seriesTicker.includes('WTI')) return 'USO';
  if (seriesTicker.includes('BTC')) return 'BTC-USD';
  if (seriesTicker.includes('ETH')) return 'ETH-USD';
  if (seriesTicker.includes('MICROS')) return 'MSTR';
  return null;
}

function transformKalshiMarket(m: KalshiMarketResponse): MarketDocument {
  const question = m.title;
  const seriesPrefix = m.event_ticker.split('-')[0];
  const sector = getSectorFromSeries(seriesPrefix);
  const seriesTicker = getTickerFromSeries(seriesPrefix);
  const ticker = extractTicker(question) || seriesTicker;

  // Use last_price if available, otherwise mid of bid/ask
  const yesProbability = m.last_price > 0
    ? m.last_price / 100
    : (m.yes_bid + m.yes_ask) > 0
      ? ((m.yes_bid + m.yes_ask) / 2) / 100
      : 0.5;

  return {
    id: m.ticker,
    slug: slugify(question),
    question,
    description: m.subtitle || '',
    source: 'kalshi',
    sourceId: m.ticker,
    sector,
    ticker,
    companyName: null,
    outcomes: [
      { name: 'Yes', probability: Math.min(Math.max(yesProbability, 0), 1) },
      { name: 'No', probability: Math.min(Math.max(1 - yesProbability, 0), 1) },
    ],
    volume: m.volume || 0,
    liquidity: m.liquidity || m.open_interest || 0,
    startDate: m.open_time || m.created_time,
    endDate: m.close_time,
    resolvedAt: m.result ? m.close_time : null,
    resolution: m.result || null,
    status: m.result ? 'resolved' : m.status === 'closed' ? 'closed' : 'active',
    tags: [
      ...(isEarningsRelated(question) ? ['earnings'] : []),
      sector.toLowerCase(),
    ],
    createdAt: m.created_time || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchKalshiStockMarkets(): Promise<MarketDocument[]> {
  const cacheKey = 'kalshi-financial-markets';
  const cached = cache.get<MarketDocument[]>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch markets from all relevant series in parallel
    const allRawMarkets = await Promise.all(
      FINANCIAL_SERIES.map(fetchSeriesMarkets)
    );

    // Flatten and dedupe by ticker
    const seen = new Set<string>();
    const markets: MarketDocument[] = [];

    for (const batch of allRawMarkets) {
      for (const raw of batch) {
        if (seen.has(raw.ticker)) continue;
        seen.add(raw.ticker);

        // Only include markets with some activity or liquidity
        if (raw.volume > 0 || raw.open_interest > 0 || raw.liquidity > 0) {
          markets.push(transformKalshiMarket(raw));
        }
      }
    }

    // Sort by volume descending
    markets.sort((a, b) => b.volume - a.volume);

    cache.set(cacheKey, markets, 2 * 60 * 1000); // 2 min cache
    return markets;
  } catch (error) {
    console.error('Kalshi fetch error:', error);
    return [];
  }
}
