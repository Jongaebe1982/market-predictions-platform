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
  { ticker: 'T', name: 'AT&T', sector: 'Telecom', aliases: ['at&t', 'att'] },
  { ticker: 'VZ', name: 'Verizon', sector: 'Telecom', aliases: ['verizon'] },
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
