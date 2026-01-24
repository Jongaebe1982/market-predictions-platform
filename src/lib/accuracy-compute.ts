import { fetchResolvedStockMarkets, fetchPolymarketStockMarkets, fetchPriceHistory } from './polymarket';
import { HORIZONS, calculateBrierScore, computeAccuracyMetrics } from './accuracy-utils';
import type { AccuracyMetrics, MarketResolution, IncludedMarket, HorizonKey, HorizonProbability, PricePoint } from './types';
import { cache } from './cache';

const CONCURRENCY_LIMIT = 5;

const EMPTY_METRICS: AccuracyMetrics = {
  overall: { totalResolved: 0, averageBrierScore: 0, hitRate: 0, calibrationData: [] },
  byHorizon: [],
  bySector: [],
  byCompany: [],
  byVolume: [],
  bySource: [],
  includedMarkets: [],
  lastUpdated: new Date().toISOString(),
};

/**
 * Find the probability at a given target timestamp from sorted price history.
 * Returns the closest data point before (or at) the target time.
 */
function findProbabilityAtTime(
  history: PricePoint[],
  targetTimestamp: number
): number | null {
  if (history.length === 0) return null;

  // Find the last point at or before the target timestamp
  let closest: PricePoint | null = null;
  for (const point of history) {
    if (point.timestamp <= targetTimestamp) {
      closest = point;
    } else {
      break; // history is sorted, no need to continue
    }
  }

  // If no point before target, use the first point if it's within 24h after target
  if (!closest) {
    const first = history[0];
    if (first.timestamp - targetTimestamp <= 24 * 60 * 60 * 1000) {
      return first.price;
    }
    return null;
  }

  return closest.price;
}

/**
 * Process a batch of items with concurrency limit.
 */
async function processWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Compute real accuracy metrics from resolved Polymarket markets.
 * Fetches CLOB price history for each resolved market, finds probability
 * at each time horizon, and computes Brier scores.
 * Returns empty metrics if no resolved markets have usable CLOB history.
 */
export async function computeRealAccuracyMetrics(): Promise<AccuracyMetrics> {
  const cacheKey = 'real-accuracy-metrics';
  const cached = cache.get<AccuracyMetrics>(cacheKey);
  if (cached) return cached;

  try {
    const [resolvedMarkets, activeMarkets] = await Promise.all([
      fetchResolvedStockMarkets(),
      fetchPolymarketStockMarkets(),
    ]);

    // Build active market entries for the included markets grid
    const activeIncluded: IncludedMarket[] = activeMarkets.map((m) => ({
      question: m.question,
      ticker: m.ticker,
      source: m.source,
      status: 'active' as const,
      outcome: null,
      volume: m.volume,
      resolvedAt: null,
      horizonsAvailable: [],
    }));

    if (resolvedMarkets.length === 0) {
      return {
        ...EMPTY_METRICS,
        includedMarkets: activeIncluded,
        lastUpdated: new Date().toISOString(),
      };
    }

    const resolutions = await processWithConcurrency(
      resolvedMarkets,
      CONCURRENCY_LIMIT,
      async (market): Promise<MarketResolution | null> => {
        try {
          // Fetch CLOB price history for this market's Yes token
          const history = await fetchPriceHistory(market.clobTokenId);

          if (history.length === 0) return null;

          // Sort history by timestamp
          const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);

          // Determine resolution date
          const resolutionDate = market.endDate
            ? new Date(market.endDate).getTime()
            : sortedHistory[sortedHistory.length - 1].timestamp;

          // Find probability at each horizon
          const horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};
          const outcomeBoolean = market.outcome === 'yes';

          for (const { key, hours } of HORIZONS) {
            const targetTime = resolutionDate - hours * 60 * 60 * 1000;
            const probability = findProbabilityAtTime(sortedHistory, targetTime);

            if (probability !== null) {
              horizons[key] = {
                probability,
                brierScore: calculateBrierScore(probability, outcomeBoolean),
                timestamp: new Date(targetTime).toISOString(),
              };
            }
          }

          // Use final probability (last data point) - stored but NOT used for overall Brier
          const finalProbability = sortedHistory[sortedHistory.length - 1].price;

          // Compute brierScore as average of available horizon Brier scores
          // (not from final probability, which is ~1.0 at close and meaningless)
          const horizonBriers = Object.values(horizons).map((h) => h.brierScore);
          const brierScore = horizonBriers.length > 0
            ? horizonBriers.reduce((s, b) => s + b, 0) / horizonBriers.length
            : calculateBrierScore(finalProbability, outcomeBoolean);

          return {
            id: market.id,
            marketId: market.id,
            slug: market.slug,
            question: market.question,
            sector: market.sector,
            ticker: market.ticker,
            source: 'polymarket',
            resolvedAt: market.endDate || new Date(resolutionDate).toISOString(),
            resolution: market.outcome,
            finalProbability,
            outcome: market.outcome,
            brierScore,
            volume: market.volume,
            horizons,
          };
        } catch {
          return null;
        }
      }
    );

    // Filter out nulls (markets with no usable CLOB history)
    const validResolutions = resolutions.filter(
      (r): r is MarketResolution => r !== null
    );

    if (validResolutions.length === 0) {
      return {
        ...EMPTY_METRICS,
        includedMarkets: activeIncluded,
        lastUpdated: new Date().toISOString(),
      };
    }

    const metrics = computeAccuracyMetrics(validResolutions);

    // Merge active markets into the included markets list
    metrics.includedMarkets = [...metrics.includedMarkets, ...activeIncluded];

    // Cache for 1 hour
    cache.set(cacheKey, metrics, 60 * 60 * 1000);
    return metrics;
  } catch (error) {
    console.error('Error computing real accuracy metrics:', error);
    return EMPTY_METRICS;
  }
}
