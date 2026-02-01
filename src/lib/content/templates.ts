import type { ProbabilityAnalysis, ProbabilityMovement } from './probability-analysis';
import { formatProbabilityChange } from './probability-analysis';

export type MarketType = 'earnings' | 'stock-price' | 'generic';

/**
 * Detect the type of market from the question
 */
export function detectMarketType(question: string): MarketType {
  const lower = question.toLowerCase();

  // Earnings-related keywords
  if (
    lower.includes('earnings') ||
    lower.includes('revenue') ||
    lower.includes('eps') ||
    lower.includes('quarterly') ||
    lower.includes('beat') ||
    lower.includes('miss') ||
    lower.includes('guidance') ||
    lower.includes('profit')
  ) {
    return 'earnings';
  }

  // Stock price keywords
  if (
    lower.includes('stock price') ||
    lower.includes('share price') ||
    lower.includes('close above') ||
    lower.includes('close below') ||
    lower.includes('reach $') ||
    lower.includes('hit $') ||
    lower.includes('fall below') ||
    lower.includes('trading')
  ) {
    return 'stock-price';
  }

  return 'generic';
}

/**
 * Parse end date from market question or description
 */
export function parseEndDateFromQuestion(question: string, endDate: string | null): string | null {
  if (endDate) {
    try {
      const date = new Date(endDate);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      // Fall through to question parsing
    }
  }

  // Try to extract date from question
  const patterns = [
    // "before December 31, 2025"
    /before\s+(\w+\s+\d{1,2},?\s+\d{4})/i,
    // "by March 2025"
    /by\s+(\w+\s+\d{4})/i,
    // "in Q1 2025"
    /in\s+(Q[1-4]\s+\d{4})/i,
    // "end of 2025"
    /end\s+of\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate intro sentence based on market type
 */
export function generateIntroSentence(
  companyName: string | null,
  ticker: string | null,
  question: string,
  endDate: string | null,
  marketType: MarketType
): string {
  const entity = companyName || ticker || 'this event';
  const dateStr = parseEndDateFromQuestion(question, endDate);
  const dateClause = dateStr ? ` before ${dateStr}` : '';

  switch (marketType) {
    case 'earnings':
      return generateEarningsIntro(entity, question, dateClause);
    case 'stock-price':
      return generateStockPriceIntro(entity, question, dateClause);
    default:
      return generateGenericIntro(entity, question, dateClause);
  }
}

function generateEarningsIntro(entity: string, question: string, dateClause: string): string {
  const lower = question.toLowerCase();

  if (lower.includes('beat')) {
    return `This market asks whether ${entity} will beat earnings expectations${dateClause}.`;
  }
  if (lower.includes('miss')) {
    return `This market asks whether ${entity} will miss earnings expectations${dateClause}.`;
  }
  if (lower.includes('revenue')) {
    return `This market asks whether ${entity} will meet or exceed revenue targets${dateClause}.`;
  }
  return `This market tracks ${entity}'s quarterly earnings performance${dateClause}.`;
}

function generateStockPriceIntro(entity: string, question: string, dateClause: string): string {
  // Extract price target from question
  const priceMatch = question.match(/\$([0-9,]+(?:\.\d{2})?)/);
  const priceTarget = priceMatch ? priceMatch[0] : null;

  const lower = question.toLowerCase();

  if (lower.includes('close above') || lower.includes('reach')) {
    return priceTarget
      ? `This market asks whether ${entity} stock will close above ${priceTarget}${dateClause}.`
      : `This market asks whether ${entity} stock will reach a specific price target${dateClause}.`;
  }
  if (lower.includes('fall below') || lower.includes('close below')) {
    return priceTarget
      ? `This market asks whether ${entity} stock will fall below ${priceTarget}${dateClause}.`
      : `This market asks whether ${entity} stock will decline below a price threshold${dateClause}.`;
  }
  return `This market tracks ${entity}'s stock price movement${dateClause}.`;
}

function generateGenericIntro(entity: string, question: string, dateClause: string): string {
  // Try to extract the action from the question
  const lower = question.toLowerCase();

  // Look for common verbs/patterns
  if (lower.includes('will')) {
    // Extract "will X" clause
    const willMatch = question.match(/will\s+([^?]+)/i);
    if (willMatch) {
      const action = willMatch[1].trim().replace(/\?$/, '');
      // Shorten if too long
      const shortAction = action.length > 100 ? action.slice(0, 97) + '...' : action;
      return `This market asks whether ${entity} will ${shortAction}${dateClause}.`;
    }
  }

  return `This market assesses the probability of a specific outcome related to ${entity}${dateClause}.`;
}

/**
 * Generate probability analysis text
 */
export function generateProbabilityText(analysis: ProbabilityAnalysis): string {
  const probPercent = Math.round(analysis.current * 100);
  const movement = analysis.movement30d || analysis.movement7d;

  // Build the first sentence about current probability
  let text = `As of today, the market implies a roughly ${probPercent}% probability of this outcome.`;

  // Add movement context if available
  if (movement && movement.direction !== 'stable') {
    const period = movement.periodDays === 7 ? 'week' : 'month';
    const changeStr = formatProbabilityChange(movement.changePercent);
    text += ` This probability has moved ${movement.direction} ${changeStr} over the past ${period}.`;
  } else if (movement) {
    const period = movement.periodDays === 7 ? 'week' : 'month';
    text += ` The probability has remained relatively stable over the past ${period}.`;
  }

  return text;
}

/**
 * Generate interpretation based on confidence level
 */
export function generateInterpretation(analysis: ProbabilityAnalysis, marketType: MarketType): string {
  const probPercent = Math.round(analysis.current * 100);

  if (analysis.confidence === 'high') {
    if (analysis.current >= 0.85) {
      return `With the market pricing this at ${probPercent}%, traders consider this outcome highly likely. However, prediction markets can shift quickly if new information emerges.`;
    }
    return `At just ${probPercent}%, the market considers this outcome unlikely. Unexpected developments could still change the calculus.`;
  }

  if (analysis.confidence === 'uncertain') {
    return `With odds near 50/50, the market sees genuine uncertainty here. This represents an opportunity where new information could swing sentiment decisively in either direction.`;
  }

  // Moderate confidence
  if (analysis.current > 0.5) {
    return `The market leans toward this outcome happening, but significant uncertainty remains. Investors should watch for catalysts that could confirm or challenge this expectation.`;
  }
  return `The market leans against this outcome, but it's far from ruled out. A positive surprise could shift sentiment quickly.`;
}

/**
 * Add movement context template
 */
export function generateMovementContext(movement: ProbabilityMovement | null): string {
  if (!movement) return '';

  const period = movement.periodDays === 7 ? '7 days' : '30 days';

  if (movement.direction === 'stable') {
    return `The market consensus has held steady over the past ${period}, suggesting traders see no major new developments.`;
  }

  const magnitude = movement.magnitude === 'significant'
    ? 'substantial'
    : movement.magnitude === 'moderate'
      ? 'notable'
      : 'minor';

  const direction = movement.direction === 'up'
    ? 'increased confidence'
    : 'growing skepticism';

  return `The ${magnitude} ${formatProbabilityChange(movement.changePercent)} shift over ${period} reflects ${direction} among traders.`;
}
