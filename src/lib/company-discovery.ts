import type { CompanyMapping } from './sector-mapping';
import { COMPANY_MAPPINGS } from './sector-mapping';

export interface DiscoveredCompany {
  ticker: string;
  name: string;
  sector: string;
  aliases: string[];
  discoveredAt: string;
  discoveredFrom: 'polymarket' | 'kalshi' | 'fortune500';
  marketQuestion?: string; // The market question that led to discovery
  verified: boolean; // Whether manually verified
}

// In-memory cache for discovered companies
let discoveredCompaniesCache: DiscoveredCompany[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a ticker exists in the static COMPANY_MAPPINGS
 */
export function isStaticCompany(ticker: string): boolean {
  return COMPANY_MAPPINGS.some(
    (c) => c.ticker.toLowerCase() === ticker.toLowerCase()
  );
}

/**
 * Get a static company by ticker
 */
export function getStaticCompany(ticker: string): CompanyMapping | undefined {
  return COMPANY_MAPPINGS.find(
    (c) => c.ticker.toLowerCase() === ticker.toLowerCase()
  );
}

/**
 * Fetch all discovered companies from Firestore
 */
export async function fetchDiscoveredCompanies(): Promise<DiscoveredCompany[]> {
  // Return cached if valid
  if (discoveredCompaniesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return discoveredCompaniesCache;
  }

  try {
    const { getAdminDb } = await import('./firebase-admin');
    const db = getAdminDb();

    const snapshot = await db
      .collection('discovered-companies')
      .orderBy('discoveredAt', 'desc')
      .get();

    const companies: DiscoveredCompany[] = snapshot.docs.map((doc) => ({
      ...(doc.data() as DiscoveredCompany),
      ticker: doc.id,
    }));

    discoveredCompaniesCache = companies;
    cacheTimestamp = Date.now();

    return companies;
  } catch (error) {
    console.error('Failed to fetch discovered companies:', error);
    return [];
  }
}

/**
 * Check if a company already exists (static or discovered)
 */
export async function companyExists(ticker: string): Promise<boolean> {
  if (isStaticCompany(ticker)) return true;

  const discovered = await fetchDiscoveredCompanies();
  return discovered.some(
    (c) => c.ticker.toLowerCase() === ticker.toLowerCase()
  );
}

/**
 * Get a company by ticker (checks both static and discovered)
 */
export async function getCompanyByTickerAsync(ticker: string): Promise<CompanyMapping | undefined> {
  // First check static mappings
  const staticCompany = getStaticCompany(ticker);
  if (staticCompany) return staticCompany;

  // Then check discovered companies
  const discovered = await fetchDiscoveredCompanies();
  const discoveredCompany = discovered.find(
    (c) => c.ticker.toLowerCase() === ticker.toLowerCase()
  );

  if (discoveredCompany) {
    return {
      ticker: discoveredCompany.ticker,
      name: discoveredCompany.name,
      sector: discoveredCompany.sector,
      aliases: discoveredCompany.aliases,
    };
  }

  return undefined;
}

/**
 * Save a newly discovered company to Firestore
 */
export async function saveDiscoveredCompany(
  company: Omit<DiscoveredCompany, 'discoveredAt' | 'verified'>
): Promise<boolean> {
  try {
    // Skip if already exists
    if (await companyExists(company.ticker)) {
      return false;
    }

    const { getAdminDb } = await import('./firebase-admin');
    const db = getAdminDb();

    const companyData: DiscoveredCompany = {
      ...company,
      discoveredAt: new Date().toISOString(),
      verified: false,
    };

    await db
      .collection('discovered-companies')
      .doc(company.ticker.toUpperCase())
      .set(companyData);

    // Invalidate cache
    discoveredCompaniesCache = null;

    console.log(`Discovered new company: ${company.name} (${company.ticker})`);
    return true;
  } catch (error) {
    console.error(`Failed to save discovered company ${company.ticker}:`, error);
    return false;
  }
}

/**
 * Get all companies (static + discovered) as CompanyMapping format
 */
export async function getAllCompanies(): Promise<CompanyMapping[]> {
  const discovered = await fetchDiscoveredCompanies();

  // Convert discovered companies to CompanyMapping format
  const discoveredAsMappings: CompanyMapping[] = discovered.map((c) => ({
    ticker: c.ticker,
    name: c.name,
    sector: c.sector,
    aliases: c.aliases,
  }));

  // Combine static and discovered, avoiding duplicates
  const allCompanies = [...COMPANY_MAPPINGS];
  const staticTickers = new Set(COMPANY_MAPPINGS.map((c) => c.ticker.toUpperCase()));

  for (const company of discoveredAsMappings) {
    if (!staticTickers.has(company.ticker.toUpperCase())) {
      allCompanies.push(company);
    }
  }

  return allCompanies;
}

/**
 * Infer sector from company name using common patterns
 */
export function inferSector(companyName: string, ticker: string): string {
  const name = companyName.toLowerCase();

  // Technology companies
  if (
    name.includes('tech') ||
    name.includes('software') ||
    name.includes('systems') ||
    name.includes('digital') ||
    name.includes('data') ||
    name.includes('cloud')
  ) {
    return 'Technology';
  }

  // Finance
  if (
    name.includes('bank') ||
    name.includes('financial') ||
    name.includes('capital') ||
    name.includes('investment') ||
    name.includes('insurance')
  ) {
    return 'Finance';
  }

  // Healthcare
  if (
    name.includes('health') ||
    name.includes('medical') ||
    name.includes('pharma') ||
    name.includes('biotech') ||
    name.includes('therapeutics')
  ) {
    return 'Healthcare';
  }

  // Energy
  if (
    name.includes('energy') ||
    name.includes('oil') ||
    name.includes('gas') ||
    name.includes('petroleum') ||
    name.includes('solar') ||
    name.includes('power')
  ) {
    return 'Energy';
  }

  // Consumer
  if (
    name.includes('retail') ||
    name.includes('consumer') ||
    name.includes('food') ||
    name.includes('beverage') ||
    name.includes('restaurant')
  ) {
    return 'Consumer';
  }

  // Automotive
  if (
    name.includes('motor') ||
    name.includes('auto') ||
    name.includes('vehicle') ||
    name.includes('car')
  ) {
    return 'Automotive';
  }

  // Airlines
  if (name.includes('airline') || name.includes('airways') || name.includes('air ')) {
    return 'Airlines';
  }

  // Semiconductors
  if (name.includes('semiconductor') || name.includes('chip')) {
    return 'Semiconductors';
  }

  // Default to Technology for unknown
  return 'Technology';
}

/**
 * Generate aliases from company name
 */
export function generateAliases(companyName: string, ticker: string): string[] {
  const aliases: string[] = [];
  const lowerName = companyName.toLowerCase();

  // Add lowercase name
  aliases.push(lowerName);

  // Add name without common suffixes
  const suffixes = [
    ' inc',
    ' inc.',
    ' corp',
    ' corp.',
    ' corporation',
    ' company',
    ' co',
    ' co.',
    ' ltd',
    ' ltd.',
    ' llc',
    ' plc',
    ' holdings',
    ' group',
  ];

  for (const suffix of suffixes) {
    if (lowerName.endsWith(suffix)) {
      aliases.push(lowerName.slice(0, -suffix.length).trim());
    }
  }

  // Add first word if multi-word
  const words = lowerName.split(' ');
  if (words.length > 1 && words[0].length >= 3) {
    aliases.push(words[0]);
  }

  return [...new Set(aliases)]; // Remove duplicates
}

/**
 * Clear the discovered companies cache
 */
export function clearDiscoveredCompaniesCache(): void {
  discoveredCompaniesCache = null;
  cacheTimestamp = 0;
}
