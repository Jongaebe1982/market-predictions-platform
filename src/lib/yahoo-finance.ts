import YahooFinance from 'yahoo-finance2';
import { cache } from './cache';
import { CACHE_TTL } from './constants';
import type { StockPrice } from './types';

// yahoo-finance2 v3.x requires instantiation
const yf = new YahooFinance();

/**
 * Resolve a company name or partial match to a stock ticker symbol.
 * Uses Yahoo Finance search API for semantic matching.
 * e.g. "MicroStrategy" → "MSTR", "American Airlines" → "AAL"
 */
export async function resolveTickerFromName(companyName: string): Promise<string | null> {
  const cacheKey = `ticker-resolve-${companyName.toLowerCase()}`;
  const cached = cache.get<string | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const result = await yf.search(companyName, { quotesCount: 3 });
    const quotes = result.quotes || [];

    // Find the first equity result
    const equity = quotes.find(
      (q) => 'symbol' in q && ('quoteType' in q ? q.quoteType === 'EQUITY' : true)
    );

    const ticker = equity && 'symbol' in equity ? (equity.symbol as string) : null;
    cache.set(cacheKey, ticker, 24 * 60 * 60 * 1000); // Cache 24h
    return ticker;
  } catch (error) {
    console.error(`Yahoo Finance search error for "${companyName}":`, error);
    cache.set(cacheKey, null, 5 * 60 * 1000); // Cache failures for 5min
    return null;
  }
}

export async function fetchStockPrice(ticker: string): Promise<StockPrice | null> {
  const cacheKey = `stock-${ticker}`;
  const cached = cache.get<StockPrice>(cacheKey);
  if (cached) return cached;

  try {
    const quote = await yf.quote(ticker);

    if (!quote || !quote.regularMarketPrice) return null;

    const price = quote.regularMarketPrice;
    const previousClose = quote.regularMarketPreviousClose || price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

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
    console.error(`Yahoo Finance quote error for ${ticker}:`, error);
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
    const interval: '1d' | '1wk' | '1mo' = days <= 5 ? '1d' : '1d';
    const period1 = new Date();
    period1.setDate(period1.getDate() - days);

    const result = await yf.chart(ticker, {
      period1: period1.toISOString().split('T')[0],
      interval,
    });

    if (!result || !result.quotes || result.quotes.length === 0) {
      return [];
    }

    const history = result.quotes
      .filter((q) => q.close != null && q.date != null)
      .map((q) => ({
        timestamp: new Date(q.date!).getTime(),
        price: q.close!,
      }));

    cache.set(cacheKey, history, CACHE_TTL.STOCK_PRICE);
    return history;
  } catch (error) {
    console.error(`Yahoo Finance history error for ${ticker}:`, error);
    return [];
  }
}
