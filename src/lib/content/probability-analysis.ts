import type { PricePoint } from '@/lib/types';

export interface ProbabilityMovement {
  direction: 'up' | 'down' | 'stable';
  magnitude: 'significant' | 'moderate' | 'slight';
  changePercent: number; // e.g., 15 for +15%
  periodDays: 7 | 30 | 90;
}

export interface ProbabilityAnalysis {
  current: number; // 0-1
  movement7d: ProbabilityMovement | null;
  movement30d: ProbabilityMovement | null;
  confidence: 'high' | 'moderate' | 'uncertain';
}

/**
 * Analyze probability movement from price history
 */
export function analyzeProbabilityMovement(
  priceHistory: PricePoint[],
  currentProbability: number
): ProbabilityAnalysis {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Get probability at different time horizons
  const prob7dAgo = getProbabilityAtTime(priceHistory, now - 7 * day);
  const prob30dAgo = getProbabilityAtTime(priceHistory, now - 30 * day);

  return {
    current: currentProbability,
    movement7d: prob7dAgo !== null
      ? calculateMovement(prob7dAgo, currentProbability, 7)
      : null,
    movement30d: prob30dAgo !== null
      ? calculateMovement(prob30dAgo, currentProbability, 30)
      : null,
    confidence: getConfidenceLevel(currentProbability),
  };
}

/**
 * Get probability at a specific timestamp from price history
 */
function getProbabilityAtTime(
  priceHistory: PricePoint[],
  targetTimestamp: number
): number | null {
  if (priceHistory.length === 0) return null;

  // Sort by timestamp
  const sorted = [...priceHistory].sort((a, b) => a.timestamp - b.timestamp);

  // If target is before first data point, return null
  if (targetTimestamp < sorted[0].timestamp) return null;

  // Find closest point at or before the target
  let closest = sorted[0];
  for (const point of sorted) {
    if (point.timestamp <= targetTimestamp) {
      closest = point;
    } else {
      break;
    }
  }

  return closest.price;
}

/**
 * Calculate movement between two probability values
 */
function calculateMovement(
  previousProb: number,
  currentProb: number,
  periodDays: 7 | 30 | 90
): ProbabilityMovement {
  const changePercent = Math.round((currentProb - previousProb) * 100);
  const absChange = Math.abs(changePercent);

  let direction: 'up' | 'down' | 'stable';
  if (absChange < 3) {
    direction = 'stable';
  } else if (changePercent > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  let magnitude: 'significant' | 'moderate' | 'slight';
  if (absChange >= 15) {
    magnitude = 'significant';
  } else if (absChange >= 7) {
    magnitude = 'moderate';
  } else {
    magnitude = 'slight';
  }

  return {
    direction,
    magnitude,
    changePercent,
    periodDays,
  };
}

/**
 * Determine confidence level based on probability extremity
 */
function getConfidenceLevel(probability: number): 'high' | 'moderate' | 'uncertain' {
  // Probabilities near 0 or 1 indicate high market confidence
  if (probability >= 0.85 || probability <= 0.15) {
    return 'high';
  }
  // Mid-range probabilities indicate uncertainty
  if (probability >= 0.4 && probability <= 0.6) {
    return 'uncertain';
  }
  return 'moderate';
}

/**
 * Format probability change for display (e.g., "+12%" or "-5%")
 */
export function formatProbabilityChange(changePercent: number): string {
  if (changePercent > 0) {
    return `+${changePercent}%`;
  }
  return `${changePercent}%`;
}
