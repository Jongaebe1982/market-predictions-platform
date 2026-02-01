import type { CompanyAccuracy } from '@/lib/types';
import type { CompanyMapping } from '@/lib/sector-mapping';
import { getCompanyByTicker } from '@/lib/sector-mapping';
import type { MarketType } from './templates';

export interface CompanyContextData {
  company: CompanyMapping | null;
  accuracy: CompanyAccuracy | null;
  activeMarketCount: number;
}

/**
 * Build company context paragraph
 */
export function generateCompanyContext(
  data: CompanyContextData,
  marketType: MarketType
): string | null {
  if (!data.company) return null;

  const parts: string[] = [];

  // Company introduction
  const intro = generateCompanyIntro(data.company);
  if (intro) parts.push(intro);

  // Market activity context
  if (data.activeMarketCount > 1) {
    parts.push(
      `There are currently ${data.activeMarketCount} active prediction markets tracking ${data.company.name}.`
    );
  }

  // Accuracy context if available
  if (data.accuracy && data.accuracy.resolvedCount >= 3) {
    const accuracyText = generateAccuracyContext(data.accuracy, data.company.name);
    if (accuracyText) parts.push(accuracyText);
  }

  if (parts.length === 0) return null;
  return parts.join(' ');
}

/**
 * Generate company introduction based on sector
 */
function generateCompanyIntro(company: CompanyMapping): string {
  const sectorDescriptions: Record<string, string> = {
    Technology: 'a major technology company',
    Semiconductors: 'a leading semiconductor company',
    'AI & Cloud': 'a major player in AI and cloud computing',
    Finance: 'a leading financial services company',
    Healthcare: 'a major healthcare company',
    Consumer: 'a leading consumer goods company',
    'E-commerce': 'a major e-commerce company',
    'Social Media': 'a leading social media company',
    Streaming: 'a major streaming and entertainment company',
    Automotive: 'a significant player in the automotive industry',
    Aerospace: 'a major aerospace and defense contractor',
    Energy: 'a leading energy company',
    Airlines: 'a major airline carrier',
    Telecom: 'a leading telecommunications company',
    Fintech: 'a major fintech company',
    Travel: 'a leading travel and hospitality company',
    Transportation: 'a significant player in transportation services',
    Crypto: 'a major cryptocurrency platform',
  };

  const sectorDesc = sectorDescriptions[company.sector] || 'a notable public company';

  return `${company.name} (${company.ticker}) is ${sectorDesc} in the ${company.sector} sector.`;
}

/**
 * Generate accuracy context
 */
function generateAccuracyContext(accuracy: CompanyAccuracy, companyName: string): string {
  const hitRatePercent = Math.round(accuracy.hitRate * 100);

  // Interpret the accuracy data
  if (accuracy.resolvedCount < 5) {
    return `Based on ${accuracy.resolvedCount} resolved prediction markets, traders have shown a ${hitRatePercent}% accuracy rate for ${companyName}-related predictions.`;
  }

  let qualityDesc: string;
  if (hitRatePercent >= 75) {
    qualityDesc = 'strong track record';
  } else if (hitRatePercent >= 60) {
    qualityDesc = 'reasonable accuracy';
  } else {
    qualityDesc = 'mixed results';
  }

  return `Historical data from ${accuracy.resolvedCount} resolved markets shows ${qualityDesc} (${hitRatePercent}% hit rate) for ${companyName} predictions on this platform.`;
}

/**
 * Get company data from ticker (sync - uses static mappings only)
 */
export function getCompanyData(ticker: string | null): CompanyMapping | null {
  if (!ticker) return null;
  return getCompanyByTicker(ticker) || null;
}

/**
 * Get company data including discovered companies (async)
 */
export async function getCompanyDataAsync(
  ticker: string | null
): Promise<CompanyMapping | null> {
  if (!ticker) return null;

  // First try static mappings
  const staticCompany = getCompanyByTicker(ticker);
  if (staticCompany) return staticCompany;

  // Try discovered companies
  try {
    const { getCompanyByTickerAsync } = await import('@/lib/company-discovery');
    return (await getCompanyByTickerAsync(ticker)) || null;
  } catch {
    return null;
  }
}
