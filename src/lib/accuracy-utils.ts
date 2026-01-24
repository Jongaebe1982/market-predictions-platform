import type { MarketResolution, CalibrationPoint, AccuracyMetrics, SectorAccuracy, CompanyAccuracy, HorizonAccuracy, HorizonKey, VolumeAccuracy, SourceAccuracy, IncludedMarket } from './types';

export const HORIZONS: { key: HorizonKey; label: string; hours: number }[] = [
  { key: '30d', label: '1 Month', hours: 30 * 24 },
  { key: '14d', label: '2 Weeks', hours: 14 * 24 },
  { key: '7d', label: '1 Week', hours: 7 * 24 },
  { key: '1d', label: '1 Day', hours: 24 },
  { key: '12h', label: '12 Hours', hours: 12 },
];

const VOLUME_BUCKETS = [
  { bucket: '< $10K', min: 0, max: 10000 },
  { bucket: '$10K - $100K', min: 10000, max: 100000 },
  { bucket: '$100K - $1M', min: 100000, max: 1000000 },
  { bucket: '> $1M', min: 1000000, max: Infinity },
];

/**
 * Get a representative probability for a market resolution.
 * Uses 1-day horizon, falling back to earliest available horizon.
 */
function getRepresentativeProbability(r: MarketResolution): number | null {
  // Prefer 1-day horizon
  if (r.horizons?.['1d']) return r.horizons['1d'].probability;
  // Fall back through horizons in order of preference
  const fallbackOrder: HorizonKey[] = ['12h', '7d', '14d', '30d'];
  for (const key of fallbackOrder) {
    if (r.horizons?.[key]) return r.horizons[key]!.probability;
  }
  return null;
}

/**
 * Calculate Brier Score for a single prediction.
 * Lower is better (0 = perfect, 1 = worst).
 * Formula: (forecast - outcome)^2
 */
export function calculateBrierScore(predictedProbability: number, actualOutcome: boolean): number {
  const outcome = actualOutcome ? 1 : 0;
  return Math.pow(predictedProbability - outcome, 2);
}

/**
 * Calculate average Brier Score across multiple resolutions.
 */
export function calculateAverageBrier(resolutions: MarketResolution[]): number {
  if (resolutions.length === 0) return 0;
  const total = resolutions.reduce((sum, r) => sum + r.brierScore, 0);
  return total / resolutions.length;
}

/**
 * Calculate hit rate: percentage of markets where the most-likely outcome was correct.
 * Uses horizon-based probabilities (1-day preferred) instead of final probability.
 */
export function calculateHitRate(resolutions: MarketResolution[]): number {
  if (resolutions.length === 0) return 0;
  const hits = resolutions.filter((r) => {
    const prob = getRepresentativeProbability(r) ?? r.finalProbability;
    const predictedYes = prob >= 0.5;
    return (predictedYes && r.outcome === 'yes') || (!predictedYes && r.outcome === 'no');
  });
  return hits.length / resolutions.length;
}

/**
 * Generate calibration data points.
 * Groups predictions into buckets (0-10%, 10-20%, etc.)
 * and calculates actual frequency for each bucket.
 * Uses horizon-based probabilities (1-day preferred) instead of final probability.
 */
export function calculateCalibration(resolutions: MarketResolution[]): CalibrationPoint[] {
  const buckets: { predicted: number; outcomes: boolean[] }[] = [];

  for (let i = 0; i < 10; i++) {
    buckets.push({ predicted: (i + 0.5) / 10, outcomes: [] });
  }

  for (const r of resolutions) {
    const prob = getRepresentativeProbability(r) ?? r.finalProbability;
    const bucketIndex = Math.min(Math.floor(prob * 10), 9);
    buckets[bucketIndex].outcomes.push(r.outcome === 'yes');
  }

  return buckets
    .filter((b) => b.outcomes.length > 0)
    .map((b) => ({
      predictedProbability: b.predicted,
      actualFrequency: b.outcomes.filter(Boolean).length / b.outcomes.length,
      count: b.outcomes.length,
    }));
}

/**
 * Compute accuracy metrics at each time horizon.
 * Only includes resolutions that have data for each horizon.
 */
export function computeHorizonAccuracy(resolutions: MarketResolution[]): HorizonAccuracy[] {
  return HORIZONS.map(({ key, label, hours }) => {
    const withHorizon = resolutions.filter((r) => r.horizons?.[key]);

    if (withHorizon.length === 0) {
      return { horizon: key, label, hoursBeforeResolution: hours, sampleSize: 0, averageBrierScore: 0, hitRate: 0 };
    }

    const brierScores = withHorizon.map((r) => r.horizons[key]!.brierScore);
    const avgBrier = brierScores.reduce((s, b) => s + b, 0) / brierScores.length;

    const hits = withHorizon.filter((r) => {
      const prob = r.horizons[key]!.probability;
      const predictedYes = prob >= 0.5;
      return (predictedYes && r.outcome === 'yes') || (!predictedYes && r.outcome === 'no');
    });

    return {
      horizon: key,
      label,
      hoursBeforeResolution: hours,
      sampleSize: withHorizon.length,
      averageBrierScore: avgBrier,
      hitRate: hits.length / withHorizon.length,
    };
  });
}

/**
 * Compute accuracy broken down by volume buckets.
 */
export function computeVolumeAccuracy(resolutions: MarketResolution[]): VolumeAccuracy[] {
  return VOLUME_BUCKETS.map(({ bucket, min, max }) => {
    const inBucket = resolutions.filter((r) => r.volume >= min && r.volume < max);
    if (inBucket.length === 0) {
      return { bucket, minVolume: min, maxVolume: max, resolvedCount: 0, averageBrierScore: 0, hitRate: 0 };
    }
    return {
      bucket,
      minVolume: min,
      maxVolume: max,
      resolvedCount: inBucket.length,
      averageBrierScore: calculateAverageBrier(inBucket),
      hitRate: calculateHitRate(inBucket),
    };
  });
}

/**
 * Compute accuracy broken down by source (polymarket, kalshi).
 */
export function computeSourceAccuracy(resolutions: MarketResolution[]): SourceAccuracy[] {
  const grouped = new Map<string, MarketResolution[]>();
  for (const r of resolutions) {
    const existing = grouped.get(r.source) || [];
    existing.push(r);
    grouped.set(r.source, existing);
  }

  return Array.from(grouped.entries()).map(([source, items]) => ({
    source,
    resolvedCount: items.length,
    averageBrierScore: calculateAverageBrier(items),
    hitRate: calculateHitRate(items),
    byHorizon: computeHorizonAccuracy(items),
  }));
}

/**
 * Build the transparency list of included markets (resolved ones).
 */
function buildIncludedMarkets(resolutions: MarketResolution[]): IncludedMarket[] {
  return resolutions.map((r) => ({
    question: r.question,
    ticker: r.ticker,
    source: r.source,
    status: 'resolved' as const,
    outcome: r.outcome,
    volume: r.volume,
    resolvedAt: r.resolvedAt,
    horizonsAvailable: (Object.keys(r.horizons || {}) as HorizonKey[]),
  }));
}

/**
 * Compute full accuracy metrics from resolutions.
 * Overall Brier score uses the 1-day horizon average (the most fair single measure).
 */
export function computeAccuracyMetrics(resolutions: MarketResolution[]): AccuracyMetrics {
  const bySector = computeSectorAccuracy(resolutions);
  const byCompany = computeCompanyAccuracy(resolutions);
  const byHorizon = computeHorizonAccuracy(resolutions);
  const byVolume = computeVolumeAccuracy(resolutions);
  const bySource = computeSourceAccuracy(resolutions);
  const includedMarkets = buildIncludedMarkets(resolutions);

  // Use 1-day horizon Brier as the overall representative score
  const oneDayHorizon = byHorizon.find((h) => h.horizon === '1d');
  const overallBrier = oneDayHorizon && oneDayHorizon.sampleSize > 0
    ? oneDayHorizon.averageBrierScore
    : calculateAverageBrier(resolutions);

  return {
    overall: {
      totalResolved: resolutions.length,
      averageBrierScore: overallBrier,
      hitRate: calculateHitRate(resolutions),
      calibrationData: calculateCalibration(resolutions),
    },
    byHorizon,
    bySector,
    byCompany,
    byVolume,
    bySource,
    includedMarkets,
    lastUpdated: new Date().toISOString(),
  };
}

function computeSectorAccuracy(resolutions: MarketResolution[]): SectorAccuracy[] {
  const grouped = new Map<string, MarketResolution[]>();

  for (const r of resolutions) {
    const existing = grouped.get(r.sector) || [];
    existing.push(r);
    grouped.set(r.sector, existing);
  }

  return Array.from(grouped.entries()).map(([sector, items]) => ({
    sector,
    resolvedCount: items.length,
    averageBrierScore: calculateAverageBrier(items),
    hitRate: calculateHitRate(items),
  }));
}

function computeCompanyAccuracy(resolutions: MarketResolution[]): CompanyAccuracy[] {
  const grouped = new Map<string, { resolutions: MarketResolution[]; name: string; sector: string }>();

  for (const r of resolutions) {
    if (!r.ticker) continue;
    const existing = grouped.get(r.ticker) || { resolutions: [], name: '', sector: r.sector };
    existing.resolutions.push(r);
    if (!existing.name && r.ticker) existing.name = r.ticker;
    grouped.set(r.ticker, existing);
  }

  return Array.from(grouped.entries()).map(([ticker, data]) => ({
    ticker,
    companyName: data.name,
    sector: data.sector,
    resolvedCount: data.resolutions.length,
    averageBrierScore: calculateAverageBrier(data.resolutions),
    hitRate: calculateHitRate(data.resolutions),
  }));
}
