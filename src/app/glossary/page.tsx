import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Glossary',
  description: 'Prediction market terminology explained. Definitions for Brier Score, calibration, hit rate, liquidity, volume, and more.',
};

interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  example?: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Brier Score',
    slug: 'brier-score',
    definition: 'A scoring metric that measures the accuracy of probabilistic predictions. Calculated as (prediction - outcome)². Ranges from 0 (perfect) to 1 (always wrong), with 0.25 representing random guessing.',
    example: 'If a market predicts 70% Yes and the outcome is Yes, the Brier Score is (0.70 - 1)² = 0.09',
  },
  {
    term: 'Calibration',
    slug: 'calibration',
    definition: 'A measure of how well predicted probabilities match actual observed frequencies. A well-calibrated forecaster has their 70% predictions come true about 70% of the time.',
  },
  {
    term: 'Hit Rate',
    slug: 'hit-rate',
    definition: 'The percentage of predictions where the forecasted outcome (>50% probability) matched the actual result. A simple directional accuracy measure.',
    example: 'If 8 out of 10 markets predicted correctly, the hit rate is 80%.',
  },
  {
    term: 'Horizon',
    slug: 'horizon',
    definition: 'The time period before market resolution at which we measure the prediction. Common horizons are 30 days, 14 days, 7 days, 1 day, and 12 hours before close.',
  },
  {
    term: 'Kalshi',
    slug: 'kalshi',
    definition: 'A CFTC-regulated prediction market exchange based in the United States. Allows US residents to legally trade on event outcomes through cleared, regulated contracts.',
  },
  {
    term: 'Liquidity',
    slug: 'liquidity',
    definition: 'The amount of capital available for trading in a market. Higher liquidity means traders can buy or sell larger positions without significantly moving the price.',
    example: 'A market with $100K in liquidity can absorb larger trades than one with $1K.',
  },
  {
    term: 'Outcome Contract',
    slug: 'outcome-contract',
    definition: 'A tradeable contract that pays out a fixed amount (typically $1) if a specific outcome occurs, and nothing if it doesn\'t. The contract price reflects the market\'s probability estimate.',
  },
  {
    term: 'Polymarket',
    slug: 'polymarket',
    definition: 'A decentralized prediction market platform built on the Polygon blockchain. Allows trading on real-world events with outcome shares settling at $0 or $1.',
  },
  {
    term: 'Prediction Market',
    slug: 'prediction-market',
    definition: 'A market where participants trade contracts whose payoff depends on the outcome of future events. Market prices aggregate information and produce probability estimates.',
  },
  {
    term: 'Resolution',
    slug: 'resolution',
    definition: 'The process of determining the official outcome of a market after the event occurs. Upon resolution, winning contracts pay out and losing contracts become worthless.',
  },
  {
    term: 'Volume',
    slug: 'volume',
    definition: 'The total dollar value of contracts traded in a market over its lifetime. Higher volume indicates more trader interest and potentially more accurate prices.',
    example: 'A market with $500K volume has seen half a million dollars worth of trades.',
  },
];

export default function GlossaryPage() {
  const sortedTerms = [...GLOSSARY_TERMS].sort((a, b) => a.term.localeCompare(b.term));

  // Group by first letter
  const groupedTerms = sortedTerms.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});

  const letters = Object.keys(groupedTerms).sort();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Glossary</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Glossary</h1>
        <p className="text-gray-600">
          Common terms used in prediction markets and our accuracy reporting.
        </p>
      </div>

      {/* Quick Navigation */}
      <Card className="mb-8">
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">Jump to:</p>
          <div className="flex flex-wrap gap-2">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-md transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms by Letter */}
      <div className="space-y-8">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="scroll-mt-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              {letter}
            </h2>
            <div className="space-y-6">
              {groupedTerms[letter].map((item) => (
                <div key={item.slug} id={item.slug} className="scroll-mt-20">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {item.term}
                  </h3>
                  <p className="text-sm text-gray-600">{item.definition}</p>
                  {item.example && (
                    <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-md p-2">
                      <span className="font-medium">Example:</span> {item.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-gray-200">
        <Link
          href="/methodology"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Read our methodology →
        </Link>
        <Link
          href="/analytics"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View accuracy analytics →
        </Link>
      </div>

      {/* JSON-LD DefinedTermSet Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            name: 'Prediction Market Glossary',
            description: 'Definitions for common prediction market terms',
            hasDefinedTerm: GLOSSARY_TERMS.map((item) => ({
              '@type': 'DefinedTerm',
              name: item.term,
              description: item.definition,
            })),
          }),
        }}
      />
    </div>
  );
}
