import { fetchResolvedStockMarkets, fetchPolymarketStockMarkets, fetchPriceHistory } from './polymarket';
import { HORIZONS, calculateBrierScore, computeAccuracyMetrics } from './accuracy-utils';
import type { AccuracyMetrics, MarketResolution, IncludedMarket, HorizonKey, HorizonProbability, PricePoint } from './types';
import { cache } from './cache';
import { getAdminDb } from './firebase-admin';

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
 * Fetch stored resolutions from Firestore.
 * These are resolutions previously computed and stored by the cron job.
 */
async function fetchFirestoreResolutions(): Promise<MarketResolution[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('resolutions').get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        marketId: data.marketId || doc.id,
        slug: data.slug || '',
        question: data.question || '',
        sector: data.sector || 'Technology',
        ticker: data.ticker || null,
        source: data.source || 'polymarket',
        resolvedAt: data.resolvedAt || '',
        resolution: data.resolution || data.outcome || '',
        finalProbability: data.finalProbability || 0,
        outcome: data.outcome || 'no',
        brierScore: data.brierScore || 0,
        volume: data.volume || 0,
        horizons: data.horizons || {},
      } as MarketResolution;
    });
  } catch (error) {
    console.error('Error fetching Firestore resolutions:', error);
    return [];
  }
}

/**
 * Compute real accuracy metrics from resolved Polymarket markets.
 * Combines data from Firestore (stored by cron) with live API data.
 * Deduplicates by marketId so the same resolution isn't counted twice.
 * Returns empty metrics if no resolved markets have usable data.
 */
export async function computeRealAccuracyMetrics(): Promise<AccuracyMetrics> {
  const cacheKey = 'real-accuracy-metrics';
  const cached = cache.get<AccuracyMetrics>(cacheKey);
  if (cached) return cached;

  try {
    const [resolvedMarkets, activeMarkets, firestoreResolutions] = await Promise.all([
      fetchResolvedStockMarkets(),
      fetchPolymarketStockMarkets(),
      fetchFirestoreResolutions(),
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

    // Process live API resolved markets
    const liveResolutions = await processWithConcurrency(
      resolvedMarkets,
      CONCURRENCY_LIMIT,
      async (market): Promise<MarketResolution | null> => {
        try {
          const history = await fetchPriceHistory(market.clobTokenId);
          if (history.length === 0) return null;

          const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
          const resolutionDate = market.endDate
            ? new Date(market.endDate).getTime()
            : sortedHistory[sortedHistory.length - 1].timestamp;

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

          const finalProbability = sortedHistory[sortedHistory.length - 1].price;
          const horizonPreference: HorizonKey[] = ['30d', '14d', '7d', '1d', '12h'];
          let brierScore = calculateBrierScore(finalProbability, outcomeBoolean);
          for (const key of horizonPreference) {
            if (horizons[key]) {
              brierScore = horizons[key]!.brierScore;
              break;
            }
          }

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

    const validLiveResolutions = liveResolutions.filter(
      (r): r is MarketResolution => r !== null
    );

    // Merge Firestore + live resolutions, deduplicating by marketId
    // Live data takes priority over Firestore (more up-to-date)
    const resolutionMap = new Map<string, MarketResolution>();
    for (const r of firestoreResolutions) {
      resolutionMap.set(r.marketId, r);
    }
    for (const r of validLiveResolutions) {
      resolutionMap.set(r.marketId, r);
    }

    const allResolutions = Array.from(resolutionMap.values());

    if (allResolutions.length === 0) {
      return {
        ...EMPTY_METRICS,
        includedMarkets: activeIncluded,
        lastUpdated: new Date().toISOString(),
      };
    }

    const metrics = computeAccuracyMetrics(allResolutions);

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
