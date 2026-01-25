export interface CompanyMapping {
  ticker: string;
  name: string;
  sector: string;
  aliases: string[];
}

export const COMPANY_MAPPINGS: CompanyMapping[] = [
  { ticker: 'AAPL', name: 'Apple', sector: 'Technology', aliases: ['apple', 'iphone', 'ipad', 'mac'] },
  { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology', aliases: ['microsoft', 'windows', 'azure'] },
  { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology', aliases: ['google', 'alphabet', 'youtube'] },
  { ticker: 'AMZN', name: 'Amazon', sector: 'E-commerce', aliases: ['amazon', 'aws', 'prime'] },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Social Media', aliases: ['meta', 'facebook', 'instagram', 'whatsapp'] },
  { ticker: 'TSLA', name: 'Tesla', sector: 'Automotive', aliases: ['tesla', 'elon musk'] },
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors', aliases: ['nvidia', 'geforce', 'rtx'] },
  { ticker: 'AMD', name: 'AMD', sector: 'Semiconductors', aliases: ['amd', 'radeon', 'ryzen'] },
  { ticker: 'INTC', name: 'Intel', sector: 'Semiconductors', aliases: ['intel'] },
  { ticker: 'NFLX', name: 'Netflix', sector: 'Streaming', aliases: ['netflix'] },
  { ticker: 'DIS', name: 'Disney', sector: 'Streaming', aliases: ['disney', 'disney+', 'hulu'] },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', aliases: ['jpmorgan', 'jp morgan', 'chase'] },
  { ticker: 'GS', name: 'Goldman Sachs', sector: 'Finance', aliases: ['goldman', 'goldman sachs'] },
  { ticker: 'BAC', name: 'Bank of America', sector: 'Finance', aliases: ['bank of america', 'bofa'] },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', aliases: ['johnson', 'j&j'] },
  { ticker: 'PFE', name: 'Pfizer', sector: 'Healthcare', aliases: ['pfizer'] },
  { ticker: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', aliases: ['unitedhealth', 'united health'] },
  { ticker: 'XOM', name: 'ExxonMobil', sector: 'Energy', aliases: ['exxon', 'exxonmobil'] },
  { ticker: 'CVX', name: 'Chevron', sector: 'Energy', aliases: ['chevron'] },
  { ticker: 'WMT', name: 'Walmart', sector: 'Consumer', aliases: ['walmart', 'wal-mart'] },
  { ticker: 'KO', name: 'Coca-Cola', sector: 'Consumer', aliases: ['coca-cola', 'coca cola', 'coke'] },
  { ticker: 'CRM', name: 'Salesforce', sector: 'AI & Cloud', aliases: ['salesforce'] },
  { ticker: 'SNOW', name: 'Snowflake', sector: 'AI & Cloud', aliases: ['snowflake'] },
  { ticker: 'COIN', name: 'Coinbase', sector: 'Crypto', aliases: ['coinbase'] },
  { ticker: 'BA', name: 'Boeing', sector: 'Aerospace', aliases: ['boeing'] },
  { ticker: 'LMT', name: 'Lockheed Martin', sector: 'Aerospace', aliases: ['lockheed', 'lockheed martin'] },
  { ticker: 'RTX', name: 'RTX Corporation', sector: 'Aerospace', aliases: ['raytheon', 'rtx'] },
  { ticker: 'NOC', name: 'Northrop Grumman', sector: 'Aerospace', aliases: ['northrop', 'northrop grumman'] },
  { ticker: 'T', name: 'AT&T', sector: 'Telecom', aliases: ['at&t', 'att'] },
  { ticker: 'VZ', name: 'Verizon', sector: 'Telecom', aliases: ['verizon'] },
  { ticker: 'MSTR', name: 'MicroStrategy', sector: 'Technology', aliases: ['microstrategy', 'micro strategy'] },
  { ticker: 'AAL', name: 'American Airlines', sector: 'Airlines', aliases: ['american airlines'] },
  { ticker: 'DAL', name: 'Delta Air Lines', sector: 'Airlines', aliases: ['delta', 'delta air'] },
  { ticker: 'UAL', name: 'United Airlines', sector: 'Airlines', aliases: ['united airlines'] },
  { ticker: 'LUV', name: 'Southwest Airlines', sector: 'Airlines', aliases: ['southwest', 'southwest airlines'] },
  { ticker: 'PLTR', name: 'Palantir', sector: 'Technology', aliases: ['palantir'] },
  { ticker: 'SQ', name: 'Block', sector: 'Fintech', aliases: ['block', 'square'] },
  { ticker: 'PYPL', name: 'PayPal', sector: 'Fintech', aliases: ['paypal'] },
  { ticker: 'UBER', name: 'Uber', sector: 'Transportation', aliases: ['uber'] },
  { ticker: 'LYFT', name: 'Lyft', sector: 'Transportation', aliases: ['lyft'] },
  { ticker: 'RIVN', name: 'Rivian', sector: 'Automotive', aliases: ['rivian'] },
  { ticker: 'F', name: 'Ford', sector: 'Automotive', aliases: ['ford'] },
  { ticker: 'GM', name: 'General Motors', sector: 'Automotive', aliases: ['general motors', 'gm'] },
  { ticker: 'SPOT', name: 'Spotify', sector: 'Streaming', aliases: ['spotify'] },
  { ticker: 'ROKU', name: 'Roku', sector: 'Streaming', aliases: ['roku'] },
  { ticker: 'V', name: 'Visa', sector: 'Finance', aliases: ['visa'] },
  { ticker: 'MA', name: 'Mastercard', sector: 'Finance', aliases: ['mastercard'] },
  { ticker: 'WFC', name: 'Wells Fargo', sector: 'Finance', aliases: ['wells fargo'] },
  { ticker: 'C', name: 'Citigroup', sector: 'Finance', aliases: ['citigroup', 'citi'] },
  { ticker: 'MS', name: 'Morgan Stanley', sector: 'Finance', aliases: ['morgan stanley'] },
  { ticker: 'MCD', name: 'McDonald\'s', sector: 'Consumer', aliases: ['mcdonald', 'mcdonalds'] },
  { ticker: 'SBUX', name: 'Starbucks', sector: 'Consumer', aliases: ['starbucks'] },
  { ticker: 'NKE', name: 'Nike', sector: 'Consumer', aliases: ['nike'] },
  { ticker: 'PEP', name: 'PepsiCo', sector: 'Consumer', aliases: ['pepsi', 'pepsico'] },
  { ticker: 'ABNB', name: 'Airbnb', sector: 'Travel', aliases: ['airbnb'] },
  { ticker: 'BKNG', name: 'Booking Holdings', sector: 'Travel', aliases: ['booking', 'priceline'] },
];

export function getCompanyByTicker(ticker: string): CompanyMapping | undefined {
  return COMPANY_MAPPINGS.find((c) => c.ticker.toLowerCase() === ticker.toLowerCase());
}

export function getCompaniesBySector(sector: string): CompanyMapping[] {
  return COMPANY_MAPPINGS.filter((c) => c.sector === sector);
}

export function getAllTickers(): string[] {
  return COMPANY_MAPPINGS.map((c) => c.ticker);
}

export function getAllSectors(): string[] {
  const sectors = new Set(COMPANY_MAPPINGS.map((c) => c.sector));
  return Array.from(sectors).sort();
}

export function getRelatedCompanies(
  ticker: string,
  keywords: string[] = [],
  maxItems: number = 8
): CompanyMapping[] {
  const company = getCompanyByTicker(ticker);
  if (!company) return [];

  // Get companies in same sector (excluding current)
  const sectorCompanies = getCompaniesBySector(company.sector).filter(
    (c) => c.ticker !== ticker
  );

  // Score by keyword overlap
  const scored = sectorCompanies.map((c) => {
    let score = 0;
    const aliasWords = c.aliases.flatMap((a) => a.toLowerCase().split(/\s+/));
    keywords.forEach((kw) => {
      if (aliasWords.some((alias) => alias.includes(kw) || kw.includes(alias))) {
        score += 1;
      }
    });
    return { company: c, score };
  });

  // Sort by score descending, then alphabetically
  scored.sort((a, b) => b.score - a.score || a.company.name.localeCompare(b.company.name));

  return scored.slice(0, maxItems).map((s) => s.company);
}

/**
 * Get all companies including dynamically discovered ones from Firestore.
 * This is an async function that combines static mappings with discovered companies.
 */
export async function getAllCompaniesWithDiscovered(): Promise<CompanyMapping[]> {
  const { getAllCompanies } = await import('./company-discovery');
  return getAllCompanies();
}

/**
 * Group companies by sector
 */
export function groupCompaniesBySector(
  companies: CompanyMapping[]
): Record<string, CompanyMapping[]> {
  return companies.reduce<Record<string, CompanyMapping[]>>((acc, company) => {
    if (!acc[company.sector]) {
      acc[company.sector] = [];
    }
    acc[company.sector].push(company);
    return acc;
  }, {});
}
