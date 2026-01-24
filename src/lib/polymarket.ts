import { POLYMARKET_GAMMA_API, POLYMARKET_CLOB_API, TAG_IDS } from './constants';
import { cache } from './cache';
import { matchCompanyFromQuestion, isEarningsRelated } from './company-matching';
import { slugify } from './utils';
import type { MarketDocument, PricePoint } from './types';

interface GammaMarket {
  id: string;
  question: string;
  description: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  liquidity: string;
  startDate: string;
  endDate: string;
  closed: boolean;
  resolved: boolean;
  resolvedOutcome: string;
  tags: { id: string; label: string }[];
  slug: string;
  conditionId: string;
  clobTokenIds: string;
}

export async function fetchPolymarketStockMarkets(): Promise<MarketDocument[]> {
  const cacheKey = 'polymarket-stocks';
  const cached = cache.get<MarketDocument[]>(cacheKey);
  if (cached) return cached;

  try {
    const [stocksRes, earningsRes] = await Promise.all([
      fetch(`${POLYMARKET_GAMMA_API}/markets?tag_id=${TAG_IDS.STOCKS}&closed=false&limit=50`),
      fetch(`${POLYMARKET_GAMMA_API}/markets?tag_id=${TAG_IDS.EARNINGS}&closed=false&limit=50`),
    ]);

    const stocksData: GammaMarket[] = stocksRes.ok ? await stocksRes.json() : [];
    const earningsData: GammaMarket[] = earningsRes.ok ? await earningsRes.json() : [];

    // Dedupe by id
    const allMarkets = new Map<string, GammaMarket>();
    [...stocksData, ...earningsData].forEach((m) => allMarkets.set(m.id, m));

    const markets = Array.from(allMarkets.values()).map(transformGammaMarket);
    cache.set(cacheKey, markets, 2 * 60 * 1000);
    return markets;
  } catch (error) {
    console.error('Polymarket fetch error:', error);
    return [];
  }
}

function parseClobTokenIds(raw: string): string[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function transformGammaMarket(m: GammaMarket): MarketDocument {
  const company = matchCompanyFromQuestion(m.question);
  const outcomes = parseOutcomes(m.outcomes, m.outcomePrices);
  const tokenIds = parseClobTokenIds(m.clobTokenIds);

  return {
    id: m.id,
    slug: m.slug || slugify(m.question),
    question: m.question,
    description: m.description || '',
    source: 'polymarket',
    sourceId: tokenIds[0] || m.conditionId || m.id,
    sector: company?.sector || 'Technology',
    ticker: company?.ticker || null,
    companyName: company?.name || null,
    outcomes,
    volume: parseFloat(m.volume) || 0,
    liquidity: parseFloat(m.liquidity) || 0,
    startDate: m.startDate,
    endDate: m.endDate || null,
    resolvedAt: m.resolved ? m.endDate : null,
    resolution: m.resolvedOutcome || null,
    status: m.resolved ? 'resolved' : m.closed ? 'closed' : 'active',
    tags: [
      ...(m.tags?.map((t) => t.label) || []),
      ...(isEarningsRelated(m.question) ? ['earnings'] : []),
    ],
    createdAt: m.startDate,
    updatedAt: new Date().toISOString(),
  };
}

function parseOutcomes(outcomes: string, prices: string): { name: string; probability: number }[] {
  try {
    const names: string[] = JSON.parse(outcomes);
    const priceValues: string[] = JSON.parse(prices);
    return names.map((name, i) => ({
      name,
      probability: parseFloat(priceValues[i]) || 0,
    }));
  } catch {
    return [
      { name: 'Yes', probability: 0.5 },
      { name: 'No', probability: 0.5 },
    ];
  }
}

export interface ResolvedMarketInfo {
  id: string;
  slug: string;
  question: string;
  outcome: 'yes' | 'no';
  endDate: string;
  clobTokenId: string;
  ticker: string | null;
  sector: string;
  companyName: string | null;
}

export async function fetchResolvedStockMarkets(): Promise<ResolvedMarketInfo[]> {
  const cacheKey = 'polymarket-resolved-stocks';
  const cached = cache.get<ResolvedMarketInfo[]>(cacheKey);
  if (cached) return cached;

  try {
    const [stocksRes, earningsRes] = await Promise.all([
      fetch(`${POLYMARKET_GAMMA_API}/markets?tag_id=${TAG_IDS.STOCKS}&closed=true&limit=100`),
      fetch(`${POLYMARKET_GAMMA_API}/markets?tag_id=${TAG_IDS.EARNINGS}&closed=true&limit=100`),
    ]);

    const stocksData: GammaMarket[] = stocksRes.ok ? await stocksRes.json() : [];
    const earningsData: GammaMarket[] = earningsRes.ok ? await earningsRes.json() : [];

    // Dedupe by id
    const allMarkets = new Map<string, GammaMarket>();
    [...stocksData, ...earningsData].forEach((m) => allMarkets.set(m.id, m));

    const resolved: ResolvedMarketInfo[] = [];

    for (const m of allMarkets.values()) {
      if (!m.closed) continue;

      // Determine outcome from outcomePrices
      let outcome: 'yes' | 'no' | null = null;
      try {
        const prices: string[] = JSON.parse(m.outcomePrices);
        const outcomes: string[] = JSON.parse(m.outcomes);
        const yesIdx = outcomes.findIndex((o) => o.toLowerCase() === 'yes');
        if (yesIdx >= 0) {
          const yesPrice = parseFloat(prices[yesIdx]);
          outcome = yesPrice >= 0.95 ? 'yes' : yesPrice <= 0.05 ? 'no' : null;
        }
      } catch {
        continue;
      }

      if (!outcome) continue;

      // Get the Yes token ID (first element)
      const tokenIds = parseClobTokenIds(m.clobTokenIds);
      if (tokenIds.length === 0) continue;

      const company = matchCompanyFromQuestion(m.question);

      resolved.push({
        id: m.id,
        slug: m.slug || slugify(m.question),
        question: m.question,
        outcome,
        endDate: m.endDate,
        clobTokenId: tokenIds[0],
        ticker: company?.ticker || null,
        sector: company?.sector || 'Technology',
        companyName: company?.name || null,
      });
    }

    cache.set(cacheKey, resolved, 60 * 60 * 1000); // 1 hour cache
    return resolved;
  } catch (error) {
    console.error('Polymarket resolved fetch error:', error);
    return [];
  }
}

export async function fetchPriceHistory(conditionId: string): Promise<PricePoint[]> {
  try {
    const res = await fetch(
      `${POLYMARKET_CLOB_API}/prices-history?market=${conditionId}&interval=max&fidelity=100`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.history || []).map((p: { t: number; p: number }) => ({
      timestamp: p.t * 1000,
      price: p.p,
    }));
  } catch {
    return [];
  }
}
