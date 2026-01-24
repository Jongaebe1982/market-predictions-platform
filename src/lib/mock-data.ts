import type { MarketDocument, MarketResolution, AccuracyMetrics, HorizonKey, HorizonProbability } from './types';
import { calculateBrierScore } from './accuracy-utils';

/**
 * Generate realistic probability snapshots at fixed time horizons before resolution.
 * Models the pattern where markets become more accurate closer to the event,
 * but we stop measuring at 12h before resolution (before the outcome is known).
 */
function generateHorizons(
  resolvedAt: string,
  outcome: 'yes' | 'no',
  finalProb: number,
): Partial<Record<HorizonKey, HorizonProbability>> {
  const resolvedTime = new Date(resolvedAt).getTime();
  const isYes = outcome === 'yes';

  // At each horizon, the probability should be less certain (closer to 0.5)
  // and gradually converge toward the correct direction.
  // We add controlled noise to make it realistic.
  const horizonConfigs: { key: HorizonKey; hoursBack: number; uncertainty: number }[] = [
    { key: '30d', hoursBack: 30 * 24, uncertainty: 0.25 },
    { key: '14d', hoursBack: 14 * 24, uncertainty: 0.18 },
    { key: '7d', hoursBack: 7 * 24, uncertainty: 0.12 },
    { key: '1d', hoursBack: 24, uncertainty: 0.06 },
    { key: '12h', hoursBack: 12, uncertainty: 0.03 },
  ];

  const horizons: Partial<Record<HorizonKey, HorizonProbability>> = {};

  // Use a seeded-style approach based on finalProb for deterministic but varied results
  const seed = Math.abs(finalProb * 1000 + resolvedTime % 1000) / 1000;

  for (const { key, hoursBack, uncertainty } of horizonConfigs) {
    const timestamp = new Date(resolvedTime - hoursBack * 60 * 60 * 1000).toISOString();

    // Base probability: blend between 0.5 (max uncertainty) and the final correct direction
    const correctTarget = isYes ? Math.max(finalProb, 0.65) : Math.min(1 - finalProb, 0.35);
    const blendFactor = 1 - uncertainty * 2; // How much we've converged
    let prob = 0.5 + (correctTarget - 0.5) * blendFactor;

    // Add deterministic noise based on seed
    const noise = ((seed * (hoursBack % 7 + 1)) % 0.1) - 0.05;
    prob = Math.max(0.05, Math.min(0.95, prob + noise * uncertainty * 3));

    // For "no" outcomes where market was initially wrong, make early predictions lean "yes"
    if (!isYes && key === '30d') {
      prob = Math.max(prob, 0.45 + seed * 0.2); // Market often starts wrong
    }

    const brierScore = calculateBrierScore(prob, isYes);

    horizons[key] = { probability: Math.round(prob * 100) / 100, brierScore: Math.round(brierScore * 1000) / 1000, timestamp };
  }

  return horizons;
}

export const MOCK_MARKETS: MarketDocument[] = [
  {
    id: '1', slug: 'apple-q1-2025-earnings-beat', question: 'Will Apple beat Q1 2025 earnings estimates?',
    description: 'Resolves YES if Apple reports EPS above analyst consensus for Q1 FY2025.',
    source: 'polymarket', sourceId: 'pm-1', sector: 'Technology', ticker: 'AAPL', companyName: 'Apple',
    outcomes: [{ name: 'Yes', probability: 0.72 }, { name: 'No', probability: 0.28 }],
    volume: 1250000, liquidity: 320000, startDate: '2024-12-01', endDate: '2025-01-30',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'stocks'],
    createdAt: '2024-12-01T00:00:00Z', updatedAt: '2025-01-20T12:00:00Z',
  },
  {
    id: '2', slug: 'tesla-stock-above-300', question: 'Will Tesla stock close above $300 by end of January 2025?',
    description: 'Resolves YES if TSLA closing price is above $300 on January 31, 2025.',
    source: 'polymarket', sourceId: 'pm-2', sector: 'Automotive', ticker: 'TSLA', companyName: 'Tesla',
    outcomes: [{ name: 'Yes', probability: 0.45 }, { name: 'No', probability: 0.55 }],
    volume: 890000, liquidity: 210000, startDate: '2024-12-15', endDate: '2025-01-31',
    resolvedAt: null, resolution: null, status: 'active', tags: ['stocks', 'price-target'],
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-01-20T15:30:00Z',
  },
  {
    id: '3', slug: 'nvidia-q4-revenue-above-20b', question: 'Will NVIDIA report Q4 revenue above $20B?',
    description: 'Resolves YES if NVIDIA quarterly revenue exceeds $20 billion.',
    source: 'polymarket', sourceId: 'pm-3', sector: 'Semiconductors', ticker: 'NVDA', companyName: 'NVIDIA',
    outcomes: [{ name: 'Yes', probability: 0.88 }, { name: 'No', probability: 0.12 }],
    volume: 2100000, liquidity: 550000, startDate: '2024-11-20', endDate: '2025-02-26',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'revenue'],
    createdAt: '2024-11-20T00:00:00Z', updatedAt: '2025-01-20T09:00:00Z',
  },
  {
    id: '4', slug: 'meta-stock-above-600', question: 'Will Meta stock trade above $600 in Q1 2025?',
    description: 'Resolves YES if META stock price reaches $600 at any point in Q1 2025.',
    source: 'kalshi', sourceId: 'kl-1', sector: 'Social Media', ticker: 'META', companyName: 'Meta Platforms',
    outcomes: [{ name: 'Yes', probability: 0.62 }, { name: 'No', probability: 0.38 }],
    volume: 670000, liquidity: 180000, startDate: '2025-01-01', endDate: '2025-03-31',
    resolvedAt: null, resolution: null, status: 'active', tags: ['stocks', 'price-target'],
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-20T14:00:00Z',
  },
  {
    id: '5', slug: 'microsoft-q2-earnings-beat', question: 'Will Microsoft beat Q2 FY2025 earnings?',
    description: 'Resolves YES if Microsoft reports Q2 EPS above Wall Street consensus.',
    source: 'polymarket', sourceId: 'pm-5', sector: 'Technology', ticker: 'MSFT', companyName: 'Microsoft',
    outcomes: [{ name: 'Yes', probability: 0.78 }, { name: 'No', probability: 0.22 }],
    volume: 950000, liquidity: 280000, startDate: '2024-12-10', endDate: '2025-01-28',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'stocks'],
    createdAt: '2024-12-10T00:00:00Z', updatedAt: '2025-01-20T11:00:00Z',
  },
  {
    id: '6', slug: 'amazon-q4-revenue-above-180b', question: 'Will Amazon Q4 2024 revenue exceed $180B?',
    description: 'Resolves YES if Amazon reports quarterly revenue above $180 billion.',
    source: 'polymarket', sourceId: 'pm-6', sector: 'E-commerce', ticker: 'AMZN', companyName: 'Amazon',
    outcomes: [{ name: 'Yes', probability: 0.55 }, { name: 'No', probability: 0.45 }],
    volume: 780000, liquidity: 195000, startDate: '2024-12-01', endDate: '2025-02-06',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'revenue'],
    createdAt: '2024-12-01T00:00:00Z', updatedAt: '2025-01-19T16:00:00Z',
  },
  {
    id: '7', slug: 'netflix-subscribers-above-290m', question: 'Will Netflix report 290M+ subscribers in Q4?',
    description: 'Resolves YES if Netflix total paid subscribers exceed 290 million.',
    source: 'kalshi', sourceId: 'kl-2', sector: 'Streaming', ticker: 'NFLX', companyName: 'Netflix',
    outcomes: [{ name: 'Yes', probability: 0.41 }, { name: 'No', probability: 0.59 }],
    volume: 430000, liquidity: 110000, startDate: '2024-12-20', endDate: '2025-01-21',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'subscribers'],
    createdAt: '2024-12-20T00:00:00Z', updatedAt: '2025-01-20T10:00:00Z',
  },
  {
    id: '8', slug: 'google-q4-revenue-beat', question: 'Will Alphabet beat Q4 2024 revenue estimates?',
    description: 'Resolves YES if Google parent company reports revenue above consensus.',
    source: 'polymarket', sourceId: 'pm-8', sector: 'Technology', ticker: 'GOOGL', companyName: 'Alphabet',
    outcomes: [{ name: 'Yes', probability: 0.69 }, { name: 'No', probability: 0.31 }],
    volume: 560000, liquidity: 140000, startDate: '2024-12-15', endDate: '2025-02-04',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'revenue'],
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-01-20T13:00:00Z',
  },
  {
    id: '9', slug: 'jpmorgan-q4-eps-above-4', question: 'Will JPMorgan report Q4 EPS above $4.00?',
    description: 'Resolves YES if JPM quarterly EPS exceeds $4.00.',
    source: 'polymarket', sourceId: 'pm-9', sector: 'Finance', ticker: 'JPM', companyName: 'JPMorgan Chase',
    outcomes: [{ name: 'Yes', probability: 0.83 }, { name: 'No', probability: 0.17 }],
    volume: 340000, liquidity: 85000, startDate: '2024-12-20', endDate: '2025-01-14',
    resolvedAt: '2025-01-14T16:00:00Z', resolution: 'Yes', status: 'resolved', tags: ['earnings'],
    createdAt: '2024-12-20T00:00:00Z', updatedAt: '2025-01-14T16:00:00Z',
  },
  {
    id: '10', slug: 'amd-stock-above-150', question: 'Will AMD stock close above $150 by Feb 2025?',
    description: 'Resolves YES if AMD closing price exceeds $150 on any trading day.',
    source: 'kalshi', sourceId: 'kl-3', sector: 'Semiconductors', ticker: 'AMD', companyName: 'AMD',
    outcomes: [{ name: 'Yes', probability: 0.35 }, { name: 'No', probability: 0.65 }],
    volume: 290000, liquidity: 72000, startDate: '2025-01-01', endDate: '2025-02-28',
    resolvedAt: null, resolution: null, status: 'active', tags: ['stocks', 'price-target'],
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-20T08:00:00Z',
  },
  {
    id: '11', slug: 'coinbase-q4-revenue-above-1b', question: 'Will Coinbase Q4 revenue exceed $1B?',
    description: 'Resolves YES if Coinbase reports quarterly revenue above $1 billion.',
    source: 'polymarket', sourceId: 'pm-11', sector: 'Crypto', ticker: 'COIN', companyName: 'Coinbase',
    outcomes: [{ name: 'Yes', probability: 0.58 }, { name: 'No', probability: 0.42 }],
    volume: 520000, liquidity: 130000, startDate: '2024-12-10', endDate: '2025-02-20',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'crypto'],
    createdAt: '2024-12-10T00:00:00Z', updatedAt: '2025-01-20T07:00:00Z',
  },
  {
    id: '12', slug: 'walmart-q4-same-store-sales-growth', question: 'Will Walmart report positive same-store sales growth in Q4?',
    description: 'Resolves YES if Walmart US comparable sales grow year-over-year.',
    source: 'polymarket', sourceId: 'pm-12', sector: 'Consumer', ticker: 'WMT', companyName: 'Walmart',
    outcomes: [{ name: 'Yes', probability: 0.91 }, { name: 'No', probability: 0.09 }],
    volume: 180000, liquidity: 45000, startDate: '2024-12-01', endDate: '2025-02-20',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'retail'],
    createdAt: '2024-12-01T00:00:00Z', updatedAt: '2025-01-19T20:00:00Z',
  },
  {
    id: '13', slug: 'exxon-q4-earnings-beat', question: 'Will ExxonMobil beat Q4 earnings estimates?',
    description: 'Resolves YES if XOM reports EPS above analyst consensus.',
    source: 'kalshi', sourceId: 'kl-4', sector: 'Energy', ticker: 'XOM', companyName: 'ExxonMobil',
    outcomes: [{ name: 'Yes', probability: 0.54 }, { name: 'No', probability: 0.46 }],
    volume: 210000, liquidity: 52000, startDate: '2025-01-05', endDate: '2025-01-31',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'energy'],
    createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-20T06:00:00Z',
  },
  {
    id: '14', slug: 'pfizer-stock-above-30', question: 'Will Pfizer stock trade above $30 in January 2025?',
    description: 'Resolves YES if PFE reaches $30 at any point in January 2025.',
    source: 'polymarket', sourceId: 'pm-14', sector: 'Healthcare', ticker: 'PFE', companyName: 'Pfizer',
    outcomes: [{ name: 'Yes', probability: 0.28 }, { name: 'No', probability: 0.72 }],
    volume: 150000, liquidity: 37000, startDate: '2025-01-01', endDate: '2025-01-31',
    resolvedAt: null, resolution: null, status: 'active', tags: ['stocks', 'price-target'],
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-20T05:00:00Z',
  },
  {
    id: '15', slug: 'boeing-737-max-deliveries-resume', question: 'Will Boeing resume 737 MAX deliveries by Q1 2025?',
    description: 'Resolves YES if Boeing officially resumes 737 MAX deliveries.',
    source: 'polymarket', sourceId: 'pm-15', sector: 'Aerospace', ticker: 'BA', companyName: 'Boeing',
    outcomes: [{ name: 'Yes', probability: 0.63 }, { name: 'No', probability: 0.37 }],
    volume: 410000, liquidity: 102000, startDate: '2024-11-15', endDate: '2025-03-31',
    resolvedAt: null, resolution: null, status: 'active', tags: ['aerospace', 'regulation'],
    createdAt: '2024-11-15T00:00:00Z', updatedAt: '2025-01-20T04:00:00Z',
  },
  {
    id: '16', slug: 'salesforce-q4-revenue-above-10b', question: 'Will Salesforce report Q4 revenue above $10B?',
    description: 'Resolves YES if CRM quarterly revenue exceeds $10 billion.',
    source: 'kalshi', sourceId: 'kl-5', sector: 'AI & Cloud', ticker: 'CRM', companyName: 'Salesforce',
    outcomes: [{ name: 'Yes', probability: 0.74 }, { name: 'No', probability: 0.26 }],
    volume: 320000, liquidity: 80000, startDate: '2024-12-20', endDate: '2025-03-05',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'cloud'],
    createdAt: '2024-12-20T00:00:00Z', updatedAt: '2025-01-20T03:00:00Z',
  },
  {
    id: '17', slug: 'goldman-sachs-q4-eps-beat', question: 'Will Goldman Sachs beat Q4 EPS estimates?',
    description: 'Resolves YES if GS reports EPS above analyst consensus for Q4.',
    source: 'polymarket', sourceId: 'pm-17', sector: 'Finance', ticker: 'GS', companyName: 'Goldman Sachs',
    outcomes: [{ name: 'Yes', probability: 0.67 }, { name: 'No', probability: 0.33 }],
    volume: 280000, liquidity: 70000, startDate: '2024-12-15', endDate: '2025-01-15',
    resolvedAt: '2025-01-15T16:00:00Z', resolution: 'Yes', status: 'resolved', tags: ['earnings', 'finance'],
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-01-15T16:00:00Z',
  },
  {
    id: '18', slug: 'intel-stock-below-20', question: 'Will Intel stock fall below $20 in Q1 2025?',
    description: 'Resolves YES if INTC closing price drops below $20.',
    source: 'polymarket', sourceId: 'pm-18', sector: 'Semiconductors', ticker: 'INTC', companyName: 'Intel',
    outcomes: [{ name: 'Yes', probability: 0.42 }, { name: 'No', probability: 0.58 }],
    volume: 260000, liquidity: 65000, startDate: '2025-01-01', endDate: '2025-03-31',
    resolvedAt: null, resolution: null, status: 'active', tags: ['stocks', 'price-target'],
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-20T02:00:00Z',
  },
  {
    id: '19', slug: 'disney-plus-subscribers-decline', question: 'Will Disney+ report subscriber decline in Q1 FY2025?',
    description: 'Resolves YES if Disney+ total subscribers decrease quarter-over-quarter.',
    source: 'kalshi', sourceId: 'kl-6', sector: 'Streaming', ticker: 'DIS', companyName: 'Disney',
    outcomes: [{ name: 'Yes', probability: 0.22 }, { name: 'No', probability: 0.78 }],
    volume: 190000, liquidity: 47000, startDate: '2025-01-05', endDate: '2025-02-05',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'streaming'],
    createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-20T01:00:00Z',
  },
  {
    id: '20', slug: 'snowflake-q4-revenue-growth', question: 'Will Snowflake report 30%+ YoY revenue growth in Q4?',
    description: 'Resolves YES if SNOW revenue grows 30% or more year-over-year.',
    source: 'polymarket', sourceId: 'pm-20', sector: 'AI & Cloud', ticker: 'SNOW', companyName: 'Snowflake',
    outcomes: [{ name: 'Yes', probability: 0.56 }, { name: 'No', probability: 0.44 }],
    volume: 350000, liquidity: 87000, startDate: '2024-12-10', endDate: '2025-03-05',
    resolvedAt: null, resolution: null, status: 'active', tags: ['earnings', 'cloud', 'growth'],
    createdAt: '2024-12-10T00:00:00Z', updatedAt: '2025-01-19T22:00:00Z',
  },
];

const RAW_RESOLUTIONS: Omit<MarketResolution, 'horizons'>[] = [
  { id: 'r1', marketId: '9', slug: 'jpmorgan-q4-eps-above-4', question: 'Will JPMorgan report Q4 EPS above $4.00?', sector: 'Finance', ticker: 'JPM', source: 'polymarket', resolvedAt: '2025-01-14T16:00:00Z', resolution: 'Yes', finalProbability: 0.83, outcome: 'yes', brierScore: 0.029 },
  { id: 'r2', marketId: '17', slug: 'goldman-sachs-q4-eps-beat', question: 'Will Goldman Sachs beat Q4 EPS estimates?', sector: 'Finance', ticker: 'GS', source: 'polymarket', resolvedAt: '2025-01-15T16:00:00Z', resolution: 'Yes', finalProbability: 0.67, outcome: 'yes', brierScore: 0.109 },
  { id: 'r3', marketId: 'h1', slug: 'apple-q4-2024-earnings-beat', question: 'Will Apple beat Q4 2024 earnings estimates?', sector: 'Technology', ticker: 'AAPL', source: 'polymarket', resolvedAt: '2024-11-01T16:00:00Z', resolution: 'Yes', finalProbability: 0.75, outcome: 'yes', brierScore: 0.063 },
  { id: 'r4', marketId: 'h2', slug: 'tesla-stock-above-250-nov', question: 'Will Tesla stock close above $250 in November?', sector: 'Automotive', ticker: 'TSLA', source: 'polymarket', resolvedAt: '2024-11-30T21:00:00Z', resolution: 'Yes', finalProbability: 0.52, outcome: 'yes', brierScore: 0.230 },
  { id: 'r5', marketId: 'h3', slug: 'nvidia-q3-revenue-above-18b', question: 'Will NVIDIA report Q3 revenue above $18B?', sector: 'Semiconductors', ticker: 'NVDA', source: 'polymarket', resolvedAt: '2024-11-20T21:00:00Z', resolution: 'Yes', finalProbability: 0.92, outcome: 'yes', brierScore: 0.006 },
  { id: 'r6', marketId: 'h4', slug: 'meta-q3-earnings-beat', question: 'Will Meta beat Q3 2024 earnings?', sector: 'Social Media', ticker: 'META', source: 'kalshi', resolvedAt: '2024-10-30T16:00:00Z', resolution: 'Yes', finalProbability: 0.81, outcome: 'yes', brierScore: 0.036 },
  { id: 'r7', marketId: 'h5', slug: 'amazon-q3-revenue-above-155b', question: 'Will Amazon Q3 revenue exceed $155B?', sector: 'E-commerce', ticker: 'AMZN', source: 'polymarket', resolvedAt: '2024-10-31T16:00:00Z', resolution: 'Yes', finalProbability: 0.71, outcome: 'yes', brierScore: 0.084 },
  { id: 'r8', marketId: 'h6', slug: 'netflix-q3-subscribers-above-280m', question: 'Will Netflix report 280M+ subscribers in Q3?', sector: 'Streaming', ticker: 'NFLX', source: 'kalshi', resolvedAt: '2024-10-17T16:00:00Z', resolution: 'Yes', finalProbability: 0.65, outcome: 'yes', brierScore: 0.123 },
  { id: 'r9', marketId: 'h7', slug: 'google-q3-ad-revenue-growth', question: 'Will Google ad revenue grow 10%+ in Q3?', sector: 'Technology', ticker: 'GOOGL', source: 'polymarket', resolvedAt: '2024-10-29T16:00:00Z', resolution: 'Yes', finalProbability: 0.68, outcome: 'yes', brierScore: 0.102 },
  { id: 'r10', marketId: 'h8', slug: 'microsoft-q1-fy25-beat', question: 'Will Microsoft beat Q1 FY2025 estimates?', sector: 'Technology', ticker: 'MSFT', source: 'polymarket', resolvedAt: '2024-10-30T16:00:00Z', resolution: 'Yes', finalProbability: 0.79, outcome: 'yes', brierScore: 0.044 },
  { id: 'r11', marketId: 'h9', slug: 'intel-q3-loss', question: 'Will Intel report a net loss in Q3?', sector: 'Semiconductors', ticker: 'INTC', source: 'polymarket', resolvedAt: '2024-10-31T16:00:00Z', resolution: 'Yes', finalProbability: 0.61, outcome: 'yes', brierScore: 0.152 },
  { id: 'r12', marketId: 'h10', slug: 'coinbase-q3-revenue-above-1b', question: 'Will Coinbase Q3 revenue exceed $1B?', sector: 'Crypto', ticker: 'COIN', source: 'polymarket', resolvedAt: '2024-11-01T16:00:00Z', resolution: 'No', finalProbability: 0.45, outcome: 'no', brierScore: 0.203 },
  { id: 'r13', marketId: 'h11', slug: 'disney-q4-fy24-profit', question: 'Will Disney streaming be profitable in Q4 FY2024?', sector: 'Streaming', ticker: 'DIS', source: 'kalshi', resolvedAt: '2024-11-14T16:00:00Z', resolution: 'Yes', finalProbability: 0.58, outcome: 'yes', brierScore: 0.176 },
  { id: 'r14', marketId: 'h12', slug: 'exxon-q3-earnings-beat', question: 'Will ExxonMobil beat Q3 earnings?', sector: 'Energy', ticker: 'XOM', source: 'kalshi', resolvedAt: '2024-11-01T16:00:00Z', resolution: 'No', finalProbability: 0.62, outcome: 'no', brierScore: 0.384 },
  { id: 'r15', marketId: 'h13', slug: 'amd-q3-revenue-above-6b', question: 'Will AMD report Q3 revenue above $6B?', sector: 'Semiconductors', ticker: 'AMD', source: 'polymarket', resolvedAt: '2024-10-29T16:00:00Z', resolution: 'Yes', finalProbability: 0.73, outcome: 'yes', brierScore: 0.073 },
  { id: 'r16', marketId: 'h14', slug: 'walmart-q3-comp-sales-growth', question: 'Will Walmart report positive comp sales in Q3?', sector: 'Consumer', ticker: 'WMT', source: 'polymarket', resolvedAt: '2024-11-19T16:00:00Z', resolution: 'Yes', finalProbability: 0.88, outcome: 'yes', brierScore: 0.014 },
  { id: 'r17', marketId: 'h15', slug: 'pfizer-stock-above-28-oct', question: 'Will Pfizer stock trade above $28 in October?', sector: 'Healthcare', ticker: 'PFE', source: 'polymarket', resolvedAt: '2024-10-31T21:00:00Z', resolution: 'Yes', finalProbability: 0.55, outcome: 'yes', brierScore: 0.203 },
  { id: 'r18', marketId: 'h16', slug: 'boeing-q3-deliveries-above-100', question: 'Will Boeing deliver 100+ planes in Q3?', sector: 'Aerospace', ticker: 'BA', source: 'polymarket', resolvedAt: '2024-10-23T16:00:00Z', resolution: 'No', finalProbability: 0.38, outcome: 'no', brierScore: 0.144 },
  { id: 'r19', marketId: 'h17', slug: 'salesforce-q3-fy25-beat', question: 'Will Salesforce beat Q3 FY2025 estimates?', sector: 'AI & Cloud', ticker: 'CRM', source: 'kalshi', resolvedAt: '2024-12-03T16:00:00Z', resolution: 'Yes', finalProbability: 0.72, outcome: 'yes', brierScore: 0.078 },
  { id: 'r20', marketId: 'h18', slug: 'bank-of-america-q3-eps-beat', question: 'Will Bank of America beat Q3 EPS estimates?', sector: 'Finance', ticker: 'BAC', source: 'polymarket', resolvedAt: '2024-10-15T16:00:00Z', resolution: 'Yes', finalProbability: 0.7, outcome: 'yes', brierScore: 0.09 },
  // Additional historical resolutions
  { id: 'r21', marketId: 'h19', slug: 'snowflake-q3-revenue-growth', question: 'Will Snowflake report 25%+ revenue growth in Q3?', sector: 'AI & Cloud', ticker: 'SNOW', source: 'polymarket', resolvedAt: '2024-11-20T21:00:00Z', resolution: 'Yes', finalProbability: 0.64, outcome: 'yes', brierScore: 0.130 },
  { id: 'r22', marketId: 'h20', slug: 'verizon-q3-subscriber-growth', question: 'Will Verizon report wireless subscriber growth in Q3?', sector: 'Telecom', ticker: 'VZ', source: 'polymarket', resolvedAt: '2024-10-22T16:00:00Z', resolution: 'Yes', finalProbability: 0.59, outcome: 'yes', brierScore: 0.168 },
  { id: 'r23', marketId: 'h21', slug: 'jpmorgan-q3-eps-above-4', question: 'Will JPMorgan report Q3 EPS above $4.00?', sector: 'Finance', ticker: 'JPM', source: 'polymarket', resolvedAt: '2024-10-11T16:00:00Z', resolution: 'Yes', finalProbability: 0.76, outcome: 'yes', brierScore: 0.058 },
  { id: 'r24', marketId: 'h22', slug: 'tesla-q3-deliveries-above-450k', question: 'Will Tesla deliver 450K+ vehicles in Q3?', sector: 'Automotive', ticker: 'TSLA', source: 'polymarket', resolvedAt: '2024-10-02T16:00:00Z', resolution: 'Yes', finalProbability: 0.66, outcome: 'yes', brierScore: 0.116 },
  { id: 'r25', marketId: 'h23', slug: 'coca-cola-q3-organic-growth', question: 'Will Coca-Cola report positive organic revenue growth in Q3?', sector: 'Consumer', ticker: 'KO', source: 'kalshi', resolvedAt: '2024-10-23T16:00:00Z', resolution: 'Yes', finalProbability: 0.85, outcome: 'yes', brierScore: 0.023 },
  // Some "No" outcomes
  { id: 'r26', marketId: 'h24', slug: 'netflix-stock-above-800-oct', question: 'Will Netflix stock trade above $800 in October?', sector: 'Streaming', ticker: 'NFLX', source: 'polymarket', resolvedAt: '2024-10-31T21:00:00Z', resolution: 'No', finalProbability: 0.32, outcome: 'no', brierScore: 0.102 },
  { id: 'r27', marketId: 'h25', slug: 'apple-iphone-16-sales-above-90m', question: 'Will iPhone 16 sell 90M+ units in first quarter?', sector: 'Technology', ticker: 'AAPL', source: 'polymarket', resolvedAt: '2024-12-31T21:00:00Z', resolution: 'No', finalProbability: 0.41, outcome: 'no', brierScore: 0.168 },
  { id: 'r28', marketId: 'h26', slug: 'chevron-q3-earnings-beat', question: 'Will Chevron beat Q3 earnings estimates?', sector: 'Energy', ticker: 'CVX', source: 'kalshi', resolvedAt: '2024-11-01T16:00:00Z', resolution: 'No', finalProbability: 0.57, outcome: 'no', brierScore: 0.325 },
  { id: 'r29', marketId: 'h27', slug: 'unitedhealth-q3-eps-beat', question: 'Will UnitedHealth beat Q3 EPS estimates?', sector: 'Healthcare', ticker: 'UNH', source: 'polymarket', resolvedAt: '2024-10-15T16:00:00Z', resolution: 'Yes', finalProbability: 0.77, outcome: 'yes', brierScore: 0.053 },
  { id: 'r30', marketId: 'h28', slug: 'att-q3-subscriber-growth', question: 'Will AT&T report net subscriber adds in Q3?', sector: 'Telecom', ticker: 'T', source: 'polymarket', resolvedAt: '2024-10-23T16:00:00Z', resolution: 'Yes', finalProbability: 0.62, outcome: 'yes', brierScore: 0.144 },
  // More resolutions to reach 50
  { id: 'r31', marketId: 'h29', slug: 'nvidia-stock-above-500-oct', question: 'Will NVIDIA stock trade above $500 in October?', sector: 'Semiconductors', ticker: 'NVDA', source: 'polymarket', resolvedAt: '2024-10-31T21:00:00Z', resolution: 'No', finalProbability: 0.48, outcome: 'no', brierScore: 0.230 },
  { id: 'r32', marketId: 'h30', slug: 'meta-stock-above-550-oct', question: 'Will Meta stock close above $550 in October?', sector: 'Social Media', ticker: 'META', source: 'kalshi', resolvedAt: '2024-10-31T21:00:00Z', resolution: 'Yes', finalProbability: 0.55, outcome: 'yes', brierScore: 0.203 },
  { id: 'r33', marketId: 'h31', slug: 'amazon-q3-aws-growth-above-15', question: 'Will AWS revenue grow 15%+ in Q3?', sector: 'E-commerce', ticker: 'AMZN', source: 'polymarket', resolvedAt: '2024-10-31T16:00:00Z', resolution: 'Yes', finalProbability: 0.69, outcome: 'yes', brierScore: 0.096 },
  { id: 'r34', marketId: 'h32', slug: 'microsoft-azure-growth-above-25', question: 'Will Azure revenue grow 25%+ in Q1 FY2025?', sector: 'Technology', ticker: 'MSFT', source: 'polymarket', resolvedAt: '2024-10-30T16:00:00Z', resolution: 'No', finalProbability: 0.58, outcome: 'no', brierScore: 0.336 },
  { id: 'r35', marketId: 'h33', slug: 'google-q3-cloud-profit', question: 'Will Google Cloud be profitable in Q3?', sector: 'Technology', ticker: 'GOOGL', source: 'polymarket', resolvedAt: '2024-10-29T16:00:00Z', resolution: 'Yes', finalProbability: 0.82, outcome: 'yes', brierScore: 0.032 },
  { id: 'r36', marketId: 'h34', slug: 'intel-layoffs-above-10000', question: 'Will Intel announce 10,000+ layoffs in Q4?', sector: 'Semiconductors', ticker: 'INTC', source: 'polymarket', resolvedAt: '2024-12-31T21:00:00Z', resolution: 'Yes', finalProbability: 0.71, outcome: 'yes', brierScore: 0.084 },
  { id: 'r37', marketId: 'h35', slug: 'boeing-stock-above-200-dec', question: 'Will Boeing stock close above $200 in December?', sector: 'Aerospace', ticker: 'BA', source: 'polymarket', resolvedAt: '2024-12-31T21:00:00Z', resolution: 'No', finalProbability: 0.35, outcome: 'no', brierScore: 0.123 },
  { id: 'r38', marketId: 'h36', slug: 'coinbase-q3-user-growth', question: 'Will Coinbase report monthly transacting user growth in Q3?', sector: 'Crypto', ticker: 'COIN', source: 'polymarket', resolvedAt: '2024-11-01T16:00:00Z', resolution: 'Yes', finalProbability: 0.52, outcome: 'yes', brierScore: 0.230 },
  { id: 'r39', marketId: 'h37', slug: 'disney-q4-fy24-revenue-above-22b', question: 'Will Disney report Q4 FY2024 revenue above $22B?', sector: 'Streaming', ticker: 'DIS', source: 'kalshi', resolvedAt: '2024-11-14T16:00:00Z', resolution: 'Yes', finalProbability: 0.74, outcome: 'yes', brierScore: 0.068 },
  { id: 'r40', marketId: 'h38', slug: 'exxon-q3-buyback-above-5b', question: 'Will ExxonMobil announce $5B+ in buybacks for Q3?', sector: 'Energy', ticker: 'XOM', source: 'polymarket', resolvedAt: '2024-11-01T16:00:00Z', resolution: 'Yes', finalProbability: 0.6, outcome: 'yes', brierScore: 0.160 },
  { id: 'r41', marketId: 'h39', slug: 'amd-ai-revenue-above-2b', question: 'Will AMD AI chip revenue exceed $2B in Q3?', sector: 'Semiconductors', ticker: 'AMD', source: 'polymarket', resolvedAt: '2024-10-29T16:00:00Z', resolution: 'No', finalProbability: 0.55, outcome: 'no', brierScore: 0.303 },
  { id: 'r42', marketId: 'h40', slug: 'walmart-stock-above-80-nov', question: 'Will Walmart stock close above $80 in November?', sector: 'Consumer', ticker: 'WMT', source: 'polymarket', resolvedAt: '2024-11-30T21:00:00Z', resolution: 'Yes', finalProbability: 0.82, outcome: 'yes', brierScore: 0.032 },
  { id: 'r43', marketId: 'h41', slug: 'pfizer-q3-revenue-decline', question: 'Will Pfizer report revenue decline in Q3?', sector: 'Healthcare', ticker: 'PFE', source: 'polymarket', resolvedAt: '2024-10-29T16:00:00Z', resolution: 'Yes', finalProbability: 0.68, outcome: 'yes', brierScore: 0.102 },
  { id: 'r44', marketId: 'h42', slug: 'tesla-q3-margin-above-10', question: 'Will Tesla auto gross margin exceed 10% in Q3?', sector: 'Automotive', ticker: 'TSLA', source: 'polymarket', resolvedAt: '2024-10-23T16:00:00Z', resolution: 'Yes', finalProbability: 0.74, outcome: 'yes', brierScore: 0.068 },
  { id: 'r45', marketId: 'h43', slug: 'goldman-q3-trading-revenue-beat', question: 'Will Goldman Sachs beat trading revenue estimates in Q3?', sector: 'Finance', ticker: 'GS', source: 'polymarket', resolvedAt: '2024-10-15T16:00:00Z', resolution: 'Yes', finalProbability: 0.63, outcome: 'yes', brierScore: 0.137 },
  { id: 'r46', marketId: 'h44', slug: 'apple-services-revenue-above-25b', question: 'Will Apple Services revenue exceed $25B in Q4 FY2024?', sector: 'Technology', ticker: 'AAPL', source: 'polymarket', resolvedAt: '2024-11-01T16:00:00Z', resolution: 'Yes', finalProbability: 0.78, outcome: 'yes', brierScore: 0.048 },
  { id: 'r47', marketId: 'h45', slug: 'amazon-stock-above-200-dec', question: 'Will Amazon stock trade above $200 in December?', sector: 'E-commerce', ticker: 'AMZN', source: 'polymarket', resolvedAt: '2024-12-31T21:00:00Z', resolution: 'Yes', finalProbability: 0.72, outcome: 'yes', brierScore: 0.078 },
  { id: 'r48', marketId: 'h46', slug: 'microsoft-stock-above-420-nov', question: 'Will Microsoft stock close above $420 in November?', sector: 'Technology', ticker: 'MSFT', source: 'polymarket', resolvedAt: '2024-11-30T21:00:00Z', resolution: 'Yes', finalProbability: 0.65, outcome: 'yes', brierScore: 0.123 },
  { id: 'r49', marketId: 'h47', slug: 'nvidia-q3-guidance-above-20b', question: 'Will NVIDIA guide Q4 revenue above $20B?', sector: 'Semiconductors', ticker: 'NVDA', source: 'polymarket', resolvedAt: '2024-11-20T21:00:00Z', resolution: 'Yes', finalProbability: 0.87, outcome: 'yes', brierScore: 0.017 },
  { id: 'r50', marketId: 'h48', slug: 'meta-reality-labs-loss-above-4b', question: 'Will Meta Reality Labs lose $4B+ in Q3?', sector: 'Social Media', ticker: 'META', source: 'polymarket', resolvedAt: '2024-10-30T16:00:00Z', resolution: 'Yes', finalProbability: 0.81, outcome: 'yes', brierScore: 0.036 },
];

export const MOCK_RESOLUTIONS: MarketResolution[] = RAW_RESOLUTIONS.map((r) => ({
  ...r,
  horizons: generateHorizons(r.resolvedAt, r.outcome, r.finalProbability),
}));

export const MOCK_ACCURACY_METRICS: AccuracyMetrics = {
  overall: {
    totalResolved: 50,
    averageBrierScore: 0.122,
    hitRate: 0.78,
    calibrationData: [
      { predictedProbability: 0.15, actualFrequency: 0.20, count: 2 },
      { predictedProbability: 0.25, actualFrequency: 0.17, count: 3 },
      { predictedProbability: 0.35, actualFrequency: 0.40, count: 5 },
      { predictedProbability: 0.45, actualFrequency: 0.43, count: 4 },
      { predictedProbability: 0.55, actualFrequency: 0.57, count: 7 },
      { predictedProbability: 0.65, actualFrequency: 0.69, count: 9 },
      { predictedProbability: 0.75, actualFrequency: 0.73, count: 10 },
      { predictedProbability: 0.85, actualFrequency: 0.88, count: 7 },
      { predictedProbability: 0.95, actualFrequency: 0.92, count: 3 },
    ],
  },
  byHorizon: [
    { horizon: '30d', label: '1 Month', hoursBeforeResolution: 720, sampleSize: 42, averageBrierScore: 0.198, hitRate: 0.64 },
    { horizon: '14d', label: '2 Weeks', hoursBeforeResolution: 336, sampleSize: 46, averageBrierScore: 0.167, hitRate: 0.70 },
    { horizon: '7d', label: '1 Week', hoursBeforeResolution: 168, sampleSize: 48, averageBrierScore: 0.142, hitRate: 0.75 },
    { horizon: '1d', label: '1 Day', hoursBeforeResolution: 24, sampleSize: 50, averageBrierScore: 0.118, hitRate: 0.80 },
    { horizon: '12h', label: '12 Hours', hoursBeforeResolution: 12, sampleSize: 50, averageBrierScore: 0.105, hitRate: 0.82 },
  ],
  bySector: [
    { sector: 'Technology', resolvedCount: 12, averageBrierScore: 0.098, hitRate: 0.83 },
    { sector: 'Semiconductors', resolvedCount: 8, averageBrierScore: 0.131, hitRate: 0.75 },
    { sector: 'Finance', resolvedCount: 6, averageBrierScore: 0.094, hitRate: 0.83 },
    { sector: 'Streaming', resolvedCount: 5, averageBrierScore: 0.134, hitRate: 0.80 },
    { sector: 'E-commerce', resolvedCount: 4, averageBrierScore: 0.086, hitRate: 0.75 },
    { sector: 'Social Media', resolvedCount: 3, averageBrierScore: 0.092, hitRate: 1.0 },
    { sector: 'Automotive', resolvedCount: 3, averageBrierScore: 0.138, hitRate: 1.0 },
    { sector: 'Consumer', resolvedCount: 3, averageBrierScore: 0.023, hitRate: 1.0 },
    { sector: 'Energy', resolvedCount: 3, averageBrierScore: 0.290, hitRate: 0.33 },
    { sector: 'Healthcare', resolvedCount: 3, averageBrierScore: 0.119, hitRate: 1.0 },
    { sector: 'Crypto', resolvedCount: 2, averageBrierScore: 0.217, hitRate: 0.50 },
    { sector: 'Aerospace', resolvedCount: 2, averageBrierScore: 0.134, hitRate: 0.50 },
    { sector: 'AI & Cloud', resolvedCount: 2, averageBrierScore: 0.104, hitRate: 1.0 },
    { sector: 'Telecom', resolvedCount: 2, averageBrierScore: 0.156, hitRate: 1.0 },
  ],
  byCompany: [
    { ticker: 'AAPL', companyName: 'Apple', sector: 'Technology', resolvedCount: 3, averageBrierScore: 0.093, hitRate: 0.67 },
    { ticker: 'MSFT', companyName: 'Microsoft', sector: 'Technology', resolvedCount: 3, averageBrierScore: 0.168, hitRate: 0.67 },
    { ticker: 'GOOGL', companyName: 'Alphabet', sector: 'Technology', resolvedCount: 3, averageBrierScore: 0.077, hitRate: 1.0 },
    { ticker: 'NVDA', companyName: 'NVIDIA', sector: 'Semiconductors', resolvedCount: 3, averageBrierScore: 0.036, hitRate: 1.0 },
    { ticker: 'META', companyName: 'Meta Platforms', sector: 'Social Media', resolvedCount: 3, averageBrierScore: 0.092, hitRate: 1.0 },
    { ticker: 'TSLA', companyName: 'Tesla', sector: 'Automotive', resolvedCount: 3, averageBrierScore: 0.138, hitRate: 1.0 },
    { ticker: 'AMZN', companyName: 'Amazon', sector: 'E-commerce', resolvedCount: 3, averageBrierScore: 0.086, hitRate: 1.0 },
    { ticker: 'JPM', companyName: 'JPMorgan Chase', sector: 'Finance', resolvedCount: 2, averageBrierScore: 0.044, hitRate: 1.0 },
    { ticker: 'AMD', companyName: 'AMD', sector: 'Semiconductors', resolvedCount: 2, averageBrierScore: 0.188, hitRate: 0.50 },
    { ticker: 'NFLX', companyName: 'Netflix', sector: 'Streaming', resolvedCount: 2, averageBrierScore: 0.113, hitRate: 0.50 },
    { ticker: 'GS', companyName: 'Goldman Sachs', sector: 'Finance', resolvedCount: 2, averageBrierScore: 0.123, hitRate: 1.0 },
    { ticker: 'DIS', companyName: 'Disney', sector: 'Streaming', resolvedCount: 2, averageBrierScore: 0.122, hitRate: 1.0 },
    { ticker: 'XOM', companyName: 'ExxonMobil', sector: 'Energy', resolvedCount: 2, averageBrierScore: 0.272, hitRate: 0.50 },
    { ticker: 'INTC', companyName: 'Intel', sector: 'Semiconductors', resolvedCount: 2, averageBrierScore: 0.118, hitRate: 1.0 },
    { ticker: 'COIN', companyName: 'Coinbase', sector: 'Crypto', resolvedCount: 2, averageBrierScore: 0.217, hitRate: 0.50 },
    { ticker: 'WMT', companyName: 'Walmart', sector: 'Consumer', resolvedCount: 2, averageBrierScore: 0.023, hitRate: 1.0 },
    { ticker: 'PFE', companyName: 'Pfizer', sector: 'Healthcare', resolvedCount: 2, averageBrierScore: 0.153, hitRate: 1.0 },
    { ticker: 'BA', companyName: 'Boeing', sector: 'Aerospace', resolvedCount: 2, averageBrierScore: 0.134, hitRate: 0.50 },
    { ticker: 'CRM', companyName: 'Salesforce', sector: 'AI & Cloud', resolvedCount: 1, averageBrierScore: 0.078, hitRate: 1.0 },
    { ticker: 'SNOW', companyName: 'Snowflake', sector: 'AI & Cloud', resolvedCount: 1, averageBrierScore: 0.130, hitRate: 1.0 },
  ],
  lastUpdated: '2025-01-20T00:00:00Z',
};

export function generateMockPriceHistory(days: number = 30, startPrice: number = 0.5): { timestamp: number; price: number }[] {
  const points: { timestamp: number; price: number }[] = [];
  const now = Date.now();
  let price = startPrice;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    price = Math.max(0.01, Math.min(0.99, price + (Math.random() - 0.48) * 0.05));
    points.push({ timestamp, price: Math.round(price * 100) / 100 });
  }

  return points;
}
