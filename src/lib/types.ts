export interface MarketDocument {
  id: string;
  slug: string;
  question: string;
  description: string;
  source: 'polymarket' | 'kalshi';
  sourceId: string;
  sector: string;
  ticker: string | null;
  companyName: string | null;
  outcomes: MarketOutcome[];
  volume: number;
  liquidity: number;
  startDate: string;
  endDate: string | null;
  resolvedAt: string | null;
  resolution: string | null;
  status: 'active' | 'resolved' | 'closed';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketOutcome {
  name: string;
  probability: number;
  priceHistory?: PricePoint[];
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface MarketSnapshot {
  marketId: string;
  slug: string;
  timestamp: string;
  outcomes: { name: string; probability: number }[];
  volume: number;
  source: string;
}

export interface MarketResolution {
  id: string;
  marketId: string;
  slug: string;
  question: string;
  sector: string;
  ticker: string | null;
  source: string;
  resolvedAt: string;
  resolution: string;
  finalProbability: number;
  outcome: 'yes' | 'no';
  brierScore: number;
}

export interface AccuracyMetrics {
  overall: {
    totalResolved: number;
    averageBrierScore: number;
    hitRate: number;
    calibrationData: CalibrationPoint[];
  };
  bySector: SectorAccuracy[];
  byCompany: CompanyAccuracy[];
  lastUpdated: string;
}

export interface CalibrationPoint {
  predictedProbability: number;
  actualFrequency: number;
  count: number;
}

export interface SectorAccuracy {
  sector: string;
  resolvedCount: number;
  averageBrierScore: number;
  hitRate: number;
}

export interface CompanyAccuracy {
  ticker: string;
  companyName: string;
  sector: string;
  resolvedCount: number;
  averageBrierScore: number;
  hitRate: number;
}

export interface StockPrice {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface CompanyData {
  ticker: string;
  name: string;
  sector: string;
  activeMarkets: MarketDocument[];
  accuracy: CompanyAccuracy | null;
}

export interface AnalyticsEvent {
  type: 'pageview' | 'click' | 'session';
  page?: string;
  element?: string;
  metadata?: Record<string, string>;
  timestamp: number;
  sessionId: string;
}

export interface MarketFilters {
  sector?: string;
  source?: string;
  ticker?: string;
  status?: string;
  search?: string;
  sort?: 'volume' | 'probability' | 'recent' | 'ending-soon';
  earnings?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
