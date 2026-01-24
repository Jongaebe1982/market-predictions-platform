export const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';
export const POLYMARKET_CLOB_API = 'https://clob.polymarket.com';
export const KALSHI_API = 'https://api.elections.kalshi.com/trade-api/v2';

export const TAG_IDS = {
  STOCKS: '604',
  EARNINGS: '1013',
} as const;

export const SECTORS = [
  'Technology',
  'Finance',
  'Financials',
  'Economics',
  'Healthcare',
  'Energy',
  'Consumer',
  'Automotive',
  'Social Media',
  'Streaming',
  'E-commerce',
  'Semiconductors',
  'AI & Cloud',
  'Crypto',
  'Aerospace',
  'Telecom',
  'Airlines',
  'Fintech',
  'Transportation',
  'Travel',
] as const;

export type Sector = (typeof SECTORS)[number];

export const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Finance: '#10b981',
  Financials: '#059669',
  Economics: '#0d9488',
  Healthcare: '#ef4444',
  Energy: '#f59e0b',
  Consumer: '#8b5cf6',
  Automotive: '#ec4899',
  'Social Media': '#06b6d4',
  Streaming: '#f97316',
  'E-commerce': '#84cc16',
  Semiconductors: '#6366f1',
  'AI & Cloud': '#14b8a6',
  Crypto: '#eab308',
  Aerospace: '#64748b',
  Telecom: '#a855f7',
  Airlines: '#0ea5e9',
  Fintech: '#22c55e',
  Transportation: '#78716c',
  Travel: '#f43f5e',
};

export const CHART_COLORS = {
  probability: '#3b82f6',
  stockPrice: '#10b981',
  volume: '#8b5cf6',
  grid: '#e5e7eb',
  axis: '#6b7280',
} as const;

export const CACHE_TTL = {
  STOCK_PRICE: 5 * 60 * 1000, // 5 minutes
  MARKETS: 2 * 60 * 1000, // 2 minutes
  ACCURACY: 60 * 60 * 1000, // 1 hour
} as const;

export const PAGE_SIZE = 20;
