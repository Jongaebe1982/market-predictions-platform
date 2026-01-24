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
  const match = question.match(/\$([A-Z]{1,5})\b/);
  if (match) return match[1];

  const company = matchCompanyFromQuestion(question);
  return company?.ticker ?? null;
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
