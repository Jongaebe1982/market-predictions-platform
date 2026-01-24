import { KALSHI_API } from './constants';
import { cache } from './cache';
import { matchCompanyFromQuestion, isEarningsRelated } from './company-matching';
import { slugify } from './utils';
import type { MarketDocument } from './types';

interface KalshiEvent {
  event_ticker: string;
  title: string;
  description: string;
  markets: KalshiMarket[];
  category: string;
}

interface KalshiMarket {
  ticker: string;
  title: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  volume: number;
  open_interest: number;
  status: string;
  close_time: string;
  result: string;
}

export async function fetchKalshiStockMarkets(): Promise<MarketDocument[]> {
  const cacheKey = 'kalshi-stocks';
  const cached = cache.get<MarketDocument[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${KALSHI_API}/events?series_ticker=STOCKS&status=open&limit=50`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.KALSHI_API_KEY
            ? { Authorization: `Bearer ${process.env.KALSHI_API_KEY}` }
            : {}),
        },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const events: KalshiEvent[] = data.events || [];

    const markets: MarketDocument[] = [];
    for (const event of events) {
      for (const market of event.markets || []) {
        markets.push(transformKalshiMarket(event, market));
      }
    }

    cache.set(cacheKey, markets, 2 * 60 * 1000);
    return markets;
  } catch (error) {
    console.error('Kalshi fetch error:', error);
    return [];
  }
}

function transformKalshiMarket(event: KalshiEvent, market: KalshiMarket): MarketDocument {
  const question = market.title || event.title;
  const company = matchCompanyFromQuestion(question);
  const yesProbability = ((market.yes_bid + market.yes_ask) / 2) / 100;

  return {
    id: market.ticker,
    slug: slugify(question),
    question,
    description: event.description || '',
    source: 'kalshi',
    sourceId: market.ticker,
    sector: company?.sector || 'Technology',
    ticker: company?.ticker || null,
    companyName: company?.name || null,
    outcomes: [
      { name: 'Yes', probability: yesProbability },
      { name: 'No', probability: 1 - yesProbability },
    ],
    volume: market.volume || 0,
    liquidity: market.open_interest || 0,
    startDate: new Date().toISOString(),
    endDate: market.close_time,
    resolvedAt: market.result ? market.close_time : null,
    resolution: market.result || null,
    status: market.status === 'closed' ? (market.result ? 'resolved' : 'closed') : 'active',
    tags: [
      ...(isEarningsRelated(question) ? ['earnings'] : []),
      'stocks',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
