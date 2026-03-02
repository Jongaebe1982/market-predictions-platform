import { fetchResolvedStockMarkets, fetchPolymarketStockMarkets, fetchPriceHistoryWithFallback } from './polymarket';
import { fetchKalshiStockMarkets, fetchResolvedKalshiMarkets } from './kalshi';
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
 * Fast fetch of pre-computed accuracy metrics from Firestore.
 * These are computed by the cron job and stored in the 'accuracy/current' document.
 * Falls back to empty metrics if not available.
 */
export async function fetchCachedAccuracyMetrics(): Promise<AccuracyMetrics> {
  const cacheKey = 'cached-accuracy-metrics';
  const cached = cache.get<AccuracyMetrics>(cacheKey);
  if (cached) return cached;

  try {
    const db = getAdminDb();
    const doc = await db.collection('accuracy').doc('current').get();

    if (!doc.exists) {
      console.log('No cached accuracy metrics found in Firestore');
      return EMPTY_METRICS;
    }

    const metrics = doc.data() as AccuracyMetrics;

    // Cache for 5 minutes locally
    cache.set(cacheKey, metrics, 5 * 60 * 1000);
    return metrics;
  } catch (error) {
    console.error('Error fetching cached accuracy metrics:', error);
    return EMPTY_METRICS;
  }
}

/**
 * Get accuracy metrics with fallback: tries cached first, then computes live if cache is empty.
 * This ensures data is shown even if the cron job hasn't populated the cache yet.
 * Uses a 10-second timeout on live computation to prevent slow page loads.
 */
export async function getAccuracyMetricsWithFallback(): Promise<AccuracyMetrics> {
  // First try cached (fast)
  const cached = await fetchCachedAccuracyMetrics();

  // If cache has data, use it
  if (cached.overall.totalResolved > 0 || cached.byCompany.length > 0) {
    return cached;
  }

  // Cache is empty - try live computation with timeout
  try {
    const timeoutPromise = new Promise<AccuracyMetrics>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000);
    });

    const liveMetrics = await Promise.race([
      computeRealAccuracyMetrics(),
      timeoutPromise,
    ]);

    return liveMetrics;
  } catch (error) {
    // Timeout or error - return empty metrics rather than blocking
    console.error('Live accuracy computation failed or timed out:', error);
    return EMPTY_METRICS;
  }
}

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
 * Fetch snapshot history for a market from Firestore.
 * Used for Kalshi markets which don't have a price history API.
 */
async function fetchSnapshotHistory(marketId: string): Promise<PricePoint[]> {
  try {
    const db = getAdminDb();
    const snapshots = await db
      .collection('snapshots')
      .where('marketId', '==', marketId)
      .orderBy('timestamp', 'asc')
      .get();

    if (snapshots.empty) return [];

    return snapshots.docs.map((doc) => {
      const data = doc.data();
      const yesOutcome = data.outcomes?.find(
        (o: { name: string }) => o.name.toLowerCase() === 'yes'
      );
      return {
        timestamp: new Date(data.timestamp).getTime(),
        price: yesOutcome?.probability ?? 0.5,
      };
    });
  } catch {
    return [];
  }
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
    const [
      polymarketResolved,
      kalshiResolved,
      polymarketActive,
      kalshiActive,
      firestoreResolutions,
    ] = await Promise.all([
      fetchResolvedStockMarkets(),
      fetchResolvedKalshiMarkets(),
      fetchPolymarketStockMarkets(),
      fetchKalshiStockMarkets(),
      fetchFirestoreResolutions(),
    ]);

    // Build active market entries for the included markets grid (both sources)
    const allActiveMarkets = [...polymarketActive, ...kalshiActive];
    const activeIncluded: IncludedMarket[] = allActiveMarkets.map((m) => ({
      question: m.question,
      ticker: m.ticker,
      source: m.source,
      status: 'active' as const,
      outcome: null,
      volume: m.volume,
      resolvedAt: null,
      horizonsAvailable: [],
    }));

    // Process Polymarket resolved markets (with CLOB price history, fallback to outcome-based)
    const polymarketLiveResolutions = await processWithConcurrency(
      polymarketResolved,
      CONCURRENCY_LIMIT,
      async (market): Promise<MarketResolution | null> => {
        try {
          const history = await fetchPriceHistoryWithFallback(market.clobTokenId, market.id);
          const outcomeBoolean = market.outcome === 'yes';

          let horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};
          let finalProbability: number;
          let brierScore: number;
          let resolutionDate: number;

          if (history.length > 0) {
            // Use price history to calculate horizons and Brier score
            const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
            resolutionDate = market.endDate
              ? new Date(market.endDate).getTime()
              : sortedHistory[sortedHistory.length - 1].timestamp;

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

            finalProbability = sortedHistory[sortedHistory.length - 1].price;
            const horizonPreference: HorizonKey[] = ['14d', '10d', '7d', '2d', '1d', '12h'];
            brierScore = calculateBrierScore(finalProbability, outcomeBoolean);
            for (const key of horizonPreference) {
              if (horizons[key]) {
                brierScore = horizons[key]!.brierScore;
                break;
              }
            }
          } else {
            // No price history available - use outcome to infer final probability
            resolutionDate = market.endDate
              ? new Date(market.endDate).getTime()
              : Date.now();
            finalProbability = outcomeBoolean ? 1.0 : 0.0;
            brierScore = calculateBrierScore(finalProbability, outcomeBoolean);
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

    // Process Kalshi resolved markets (using snapshots for horizon data)
    const kalshiLiveResolutions = await processWithConcurrency(
      kalshiResolved,
      CONCURRENCY_LIMIT,
      async (market): Promise<MarketResolution> => {
        const outcomeBoolean = market.outcome === 'yes';
        const history = await fetchSnapshotHistory(market.id);

        let horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};
        let brierScore = calculateBrierScore(market.lastPrice, outcomeBoolean);

        if (history.length > 0) {
          const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
          const resolutionDate = market.endDate
            ? new Date(market.endDate).getTime()
            : Date.now();

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

          // Use earliest available horizon for representative Brier score
          const horizonPreference: HorizonKey[] = ['14d', '10d', '7d', '2d', '1d', '12h'];
          for (const key of horizonPreference) {
            if (horizons[key]) {
              brierScore = horizons[key]!.brierScore;
              break;
            }
          }
        }

        return {
          id: market.id,
          marketId: market.id,
          slug: market.slug,
          question: market.question,
          sector: market.sector,
          ticker: market.ticker,
          source: 'kalshi',
          resolvedAt: market.endDate,
          resolution: market.outcome,
          finalProbability: market.lastPrice,
          outcome: market.outcome,
          brierScore,
          volume: market.volume,
          horizons,
        };
      }
    );

    const validPolymarketResolutions = polymarketLiveResolutions.filter(
      (r): r is MarketResolution => r !== null
    );

    // Merge Firestore + live resolutions from both sources, deduplicating by marketId
    // Live data takes priority over Firestore (more up-to-date)
    const resolutionMap = new Map<string, MarketResolution>();
    for (const r of firestoreResolutions) {
      resolutionMap.set(r.marketId, r);
    }
    for (const r of validPolymarketResolutions) {
      resolutionMap.set(r.marketId, r);
    }
    for (const r of kalshiLiveResolutions) {
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
