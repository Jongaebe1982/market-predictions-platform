import type { MarketResolution, CalibrationPoint, AccuracyMetrics, SectorAccuracy, CompanyAccuracy } from './types';

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
 */
export function calculateHitRate(resolutions: MarketResolution[]): number {
  if (resolutions.length === 0) return 0;
  const hits = resolutions.filter((r) => {
    const predictedYes = r.finalProbability >= 0.5;
    return (predictedYes && r.outcome === 'yes') || (!predictedYes && r.outcome === 'no');
  });
  return hits.length / resolutions.length;
}

/**
 * Generate calibration data points.
 * Groups predictions into buckets (0-10%, 10-20%, etc.)
 * and calculates actual frequency for each bucket.
 */
export function calculateCalibration(resolutions: MarketResolution[]): CalibrationPoint[] {
  const buckets: { predicted: number; outcomes: boolean[] }[] = [];

  for (let i = 0; i < 10; i++) {
    buckets.push({ predicted: (i + 0.5) / 10, outcomes: [] });
  }

  for (const r of resolutions) {
    const bucketIndex = Math.min(Math.floor(r.finalProbability * 10), 9);
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
 * Compute full accuracy metrics from resolutions.
 */
export function computeAccuracyMetrics(resolutions: MarketResolution[]): AccuracyMetrics {
  const bySector = computeSectorAccuracy(resolutions);
  const byCompany = computeCompanyAccuracy(resolutions);

  return {
    overall: {
      totalResolved: resolutions.length,
      averageBrierScore: calculateAverageBrier(resolutions),
      hitRate: calculateHitRate(resolutions),
      calibrationData: calculateCalibration(resolutions),
    },
    bySector,
    byCompany,
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
