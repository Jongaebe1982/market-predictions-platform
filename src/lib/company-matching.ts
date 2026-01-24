import { COMPANY_MAPPINGS, type CompanyMapping } from './sector-mapping';

export function matchCompanyFromQuestion(question: string): CompanyMapping | null {
  const lowerQuestion = question.toLowerCase();

  // First try exact ticker match (e.g., "$AAPL" or "AAPL")
  for (const company of COMPANY_MAPPINGS) {
    const tickerPatterns = [
      new RegExp(`\\$${company.ticker}\\b`, 'i'),
      new RegExp(`\\b${company.ticker}\\b`, 'i'),
    ];
    for (const pattern of tickerPatterns) {
      if (pattern.test(question)) {
        return company;
      }
    }
  }

  // Then try company name and aliases
  for (const company of COMPANY_MAPPINGS) {
    const allNames = [company.name.toLowerCase(), ...company.aliases];
    for (const name of allNames) {
      if (lowerQuestion.includes(name)) {
        return company;
      }
    }
  }

  return null;
}

export function extractTicker(question: string): string | null {
  // Check for $TICKER pattern
  const dollarMatch = question.match(/\$([A-Z]{1,5})\b/);
  if (dollarMatch) return dollarMatch[1];

  // Check known company mappings
  const company = matchCompanyFromQuestion(question);
  if (company) return company.ticker;

  // Extract ticker from start of question (common in Polymarket earnings markets)
  // e.g. "AAL Quarterly Earnings..." or "GOOGL stock price..."
  const leadingTicker = question.match(/^([A-Z]{1,5})\b/);
  if (leadingTicker) {
    const candidate = leadingTicker[1];
    // Verify it looks like a ticker (not a common English word)
    const commonWords = new Set(['THE', 'WILL', 'THIS', 'THAT', 'WHAT', 'WHEN', 'WHERE', 'HOW', 'WHO', 'ANY', 'ALL', 'CAN', 'HAS', 'ARE', 'WAS', 'FOR', 'NOT', 'BUT', 'NEW', 'NOW', 'MAY', 'JAN', 'FEB', 'MAR', 'APR', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']);
    if (!commonWords.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function isEarningsRelated(question: string): boolean {
  const earningsKeywords = [
    'earnings',
    'revenue',
    'eps',
    'quarterly',
    'q1',
    'q2',
    'q3',
    'q4',
    'beat',
    'miss',
    'guidance',
    'profit',
    'income',
    'sales',
    'fiscal',
  ];
  const lower = question.toLowerCase();
  return earningsKeywords.some((kw) => lower.includes(kw));
}
