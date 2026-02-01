import type { MarketDocument, MarketContent, PricePoint, CompanyAccuracy } from '@/lib/types';
import { analyzeProbabilityMovement } from './probability-analysis';
import {
  detectMarketType,
  generateIntroSentence,
  generateProbabilityText,
  generateInterpretation,
  generateMovementContext,
} from './templates';
import {
  generateCompanyContext,
  getCompanyDataAsync,
  type CompanyContextData,
} from './company-context';
import { createHash } from 'crypto';

export interface GeneratorInput {
  market: MarketDocument;
  priceHistory?: PricePoint[];
  accuracy?: CompanyAccuracy | null;
  activeMarketCount?: number;
}

/**
 * Generate a data hash for cache invalidation
 * Changes when probability shifts significantly or key data changes
 */
export function generateDataHash(market: MarketDocument): string {
  const relevantData = {
    id: market.id,
    probability: Math.round((market.outcomes[0]?.probability || 0) * 100),
    volume: Math.round(market.volume / 1000), // Round to nearest $1k
    status: market.status,
  };
  return createHash('md5').update(JSON.stringify(relevantData)).digest('hex').slice(0, 12);
}

/**
 * Generate market explanation content
 */
export async function generateMarketContent(
  input: GeneratorInput
): Promise<MarketContent> {
  const { market, priceHistory = [], accuracy = null, activeMarketCount = 1 } = input;

  const currentProbability = market.outcomes.find((o) => o.name === 'Yes')?.probability
    || market.outcomes[0]?.probability
    || 0;

  // Analyze probability movement
  const probabilityAnalysis = analyzeProbabilityMovement(priceHistory, currentProbability);

  // Detect market type
  const marketType = detectMarketType(market.question);

  // Get company data
  const company = await getCompanyDataAsync(market.ticker);
  const companyContextData: CompanyContextData = {
    company,
    accuracy,
    activeMarketCount,
  };

  // Generate intro sentence
  const introSentence = generateIntroSentence(
    market.companyName || company?.name || null,
    market.ticker,
    market.question,
    market.endDate,
    marketType
  );

  // Generate company context
  const companyContext = generateCompanyContext(companyContextData, marketType);

  // Generate probability analysis text
  const probabilityText = generateProbabilityText(probabilityAnalysis);

  // Generate interpretation
  const interpretation = generateInterpretation(probabilityAnalysis, marketType);

  // Generate movement context (optional additional text)
  const movementContext = generateMovementContext(
    probabilityAnalysis.movement30d || probabilityAnalysis.movement7d
  );

  // Combine probability analysis with movement context
  const probabilityAnalysisText = movementContext
    ? `${probabilityText} ${movementContext}`
    : probabilityText;

  // Build full content
  const fullContentParts = [introSentence];
  if (companyContext) {
    fullContentParts.push(companyContext);
  }
  fullContentParts.push(probabilityAnalysisText);
  fullContentParts.push(interpretation);

  const fullContent = fullContentParts.join('\n\n');

  // Calculate probability change for snapshot
  const prob30dAgo = probabilityAnalysis.movement30d
    ? currentProbability - (probabilityAnalysis.movement30d.changePercent / 100)
    : null;

  return {
    id: market.id,
    slug: market.slug,
    introSentence,
    companyContext,
    probabilityAnalysis: `${probabilityText}\n\n${interpretation}`,
    fullContent,
    generatedAt: new Date().toISOString(),
    dataHash: generateDataHash(market),
    generationType: 'template',
    inputSnapshot: {
      probability: currentProbability,
      probabilityChange30d: prob30dAgo !== null
        ? Math.round((currentProbability - prob30dAgo) * 100)
        : null,
      volume: market.volume,
      ticker: market.ticker,
      sector: market.sector,
    },
  };
}

/**
 * Check if content needs regeneration based on data hash
 */
export function contentNeedsRegeneration(
  existingContent: MarketContent | null,
  market: MarketDocument,
  maxAgeHours: number = 24
): boolean {
  if (!existingContent) return true;

  // Check if data hash changed
  const currentHash = generateDataHash(market);
  if (existingContent.dataHash !== currentHash) return true;

  // Check age
  const generatedAt = new Date(existingContent.generatedAt).getTime();
  const ageMs = Date.now() - generatedAt;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  if (ageMs > maxAgeMs) return true;

  return false;
}

/**
 * Generate fallback content synchronously (for SSR when no pre-generated content)
 */
export function generateFallbackContent(market: MarketDocument): Partial<MarketContent> {
  const currentProbability = market.outcomes.find((o) => o.name === 'Yes')?.probability
    || market.outcomes[0]?.probability
    || 0;

  const marketType = detectMarketType(market.question);

  const introSentence = generateIntroSentence(
    market.companyName,
    market.ticker,
    market.question,
    market.endDate,
    marketType
  );

  const probabilityAnalysis = analyzeProbabilityMovement([], currentProbability);
  const probabilityText = generateProbabilityText(probabilityAnalysis);
  const interpretation = generateInterpretation(probabilityAnalysis, marketType);

  return {
    introSentence,
    companyContext: null,
    probabilityAnalysis: `${probabilityText}\n\n${interpretation}`,
    fullContent: `${introSentence}\n\n${probabilityText}\n\n${interpretation}`,
  };
}
