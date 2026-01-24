import { cache } from './cache';
import { CACHE_TTL } from './constants';
import type { StockPrice } from './types';

export async function fetchStockPrice(ticker: string): Promise<StockPrice | null> {
  const cacheKey = `stock-${ticker}`;
  const cached = cache.get<StockPrice>(cacheKey);
  if (cached) return cached;

  try {
    // Using Yahoo Finance v8 API
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    const stockPrice: StockPrice = {
      ticker,
      price,
      change,
      changePercent,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, stockPrice, CACHE_TTL.STOCK_PRICE);
    return stockPrice;
  } catch (error) {
    console.error(`Yahoo Finance error for ${ticker}:`, error);
    return null;
  }
}

export async function fetchStockPriceHistory(
  ticker: string,
  days: number = 5
): Promise<{ timestamp: number; price: number }[]> {
  const cacheKey = `stock-history-${ticker}-${days}`;
  const cached = cache.get<{ timestamp: number; price: number }[]>(cacheKey);
  if (cached) return cached;

  try {
    const range = days <= 5 ? '5d' : days <= 30 ? '1mo' : '3mo';
    const interval = days <= 5 ? '30m' : '1d';

    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();

    const result = data.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp || [];
    const closes: number[] = result.indicators?.quote?.[0]?.close || [];

    const history = timestamps
      .map((t, i) => ({
        timestamp: t * 1000,
        price: closes[i],
      }))
      .filter((p) => p.price != null);

    cache.set(cacheKey, history, CACHE_TTL.STOCK_PRICE);
    return history;
  } catch {
    return [];
  }
}
