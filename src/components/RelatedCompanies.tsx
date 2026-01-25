import Link from 'next/link';
import { getCompaniesBySector, getCompanyByTicker, type CompanyMapping } from '@/lib/sector-mapping';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RelatedCompaniesProps {
  currentTicker: string;
  keywords?: string[];
  marketCounts?: Record<string, number>;
  maxItems?: number;
}

function extractKeywords(text: string): string[] {
  // Extract significant words from market questions
  const stopWords = new Set([
    'will', 'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'is', 'for',
    'on', 'with', 'as', 'at', 'by', 'from', 'or', 'an', 'this', 'its', 'it',
    'before', 'after', 'above', 'below', 'up', 'down', 'than', 'more', 'less',
    'market', 'stock', 'price', 'share', 'shares', 'close', 'end', 'q1', 'q2',
    'q3', 'q4', 'earnings', 'beat', 'miss', 'reach', 'hit', 'exceed', 'fall',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function scoreRelatedCompany(
  company: CompanyMapping,
  currentTicker: string,
  keywords: string[],
  marketCounts: Record<string, number>
): number {
  if (company.ticker === currentTicker) return -1;

  let score = 0;

  // Score based on market activity
  const markets = marketCounts[company.ticker] || 0;
  score += markets * 2;

  // Score based on keyword overlap with aliases
  const aliasKeywords = company.aliases.flatMap((alias) =>
    alias.toLowerCase().split(/\s+/)
  );
  const keywordOverlap = keywords.filter((kw) =>
    aliasKeywords.some((alias) => alias.includes(kw) || kw.includes(alias))
  ).length;
  score += keywordOverlap * 3;

  return score;
}

export function RelatedCompanies({
  currentTicker,
  keywords = [],
  marketCounts = {},
  maxItems = 8,
}: RelatedCompaniesProps) {
  const currentCompany = getCompanyByTicker(currentTicker);
  if (!currentCompany) return null;

  // Get companies in the same sector
  const sectorCompanies = getCompaniesBySector(currentCompany.sector);

  // Score and sort related companies
  const scoredCompanies = sectorCompanies
    .map((company) => ({
      company,
      score: scoreRelatedCompany(company, currentTicker, keywords, marketCounts),
    }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems);

  if (scoredCompanies.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Companies</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-3">
          Other {currentCompany.sector} companies with prediction markets
        </p>
        <div className="grid grid-cols-2 gap-2">
          {scoredCompanies.map(({ company }) => {
            const markets = marketCounts[company.ticker] || 0;
            return (
              <Link
                key={company.ticker}
                href={`/companies/${company.ticker}`}
                className="flex items-center justify-between p-2 rounded-md border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {company.ticker}
                  </span>
                  <span className="text-sm text-gray-700 truncate">{company.name}</span>
                </div>
                {markets > 0 && (
                  <Badge variant="muted" className="text-xs ml-1 shrink-0">
                    {markets}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
        <Link
          href="/companies"
          className="text-sm text-blue-600 hover:text-blue-700 mt-3 inline-block"
        >
          View all companies →
        </Link>
      </CardContent>
    </Card>
  );
}

// Simpler version for sidebar use
export function RelatedCompaniesList({
  currentTicker,
  sector,
  maxItems = 5,
}: {
  currentTicker: string;
  sector: string;
  maxItems?: number;
}) {
  const sectorCompanies = getCompaniesBySector(sector).filter(
    (c) => c.ticker !== currentTicker
  );

  if (sectorCompanies.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">More in {sector}</p>
      <div className="space-y-1">
        {sectorCompanies.slice(0, maxItems).map((company) => (
          <Link
            key={company.ticker}
            href={`/companies/${company.ticker}`}
            className="block text-sm text-blue-600 hover:text-blue-700"
          >
            {company.name} ({company.ticker})
          </Link>
        ))}
      </div>
    </div>
  );
}
