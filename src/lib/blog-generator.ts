import type { BlogPost, BlogCategory } from './blog-types';
import type { AccuracyMetrics, SourceAccuracy, CompanyAccuracy, HorizonAccuracy } from './types';

interface BlogTemplate {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  generateContent: (metrics: AccuracyMetrics) => string;
  generateStats: (metrics: AccuracyMetrics) => { label: string; value: string }[];
  getRelatedTickers: (metrics: AccuracyMetrics) => string[];
}

/**
 * Format a Brier score for display
 */
function formatBrier(score: number): string {
  return score.toFixed(3);
}

/**
 * Format a percentage for display
 */
function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Get source accuracy data
 */
function getSourceData(metrics: AccuracyMetrics, source: string): SourceAccuracy | null {
  return metrics.bySource.find((s) => s.source.toLowerCase() === source.toLowerCase()) || null;
}

/**
 * Get top companies by accuracy
 */
function getTopCompanies(metrics: AccuracyMetrics, limit = 5): CompanyAccuracy[] {
  return [...metrics.byCompany]
    .filter((c) => c.resolvedCount >= 3)
    .sort((a, b) => a.averageBrierScore - b.averageBrierScore)
    .slice(0, limit);
}

/**
 * Get worst performing markets (highest Brier scores)
 */
function getWorstCompanies(metrics: AccuracyMetrics, limit = 5): CompanyAccuracy[] {
  return [...metrics.byCompany]
    .filter((c) => c.resolvedCount >= 3)
    .sort((a, b) => b.averageBrierScore - a.averageBrierScore)
    .slice(0, limit);
}

const BLOG_TEMPLATES: BlogTemplate[] = [
  // Template 1: Source Comparison
  {
    slug: 'polymarket-vs-kalshi-accuracy-comparison',
    title: 'Polymarket vs Kalshi: Which Prediction Market Is More Accurate?',
    excerpt:
      'A data-driven comparison of prediction market accuracy between Polymarket and Kalshi, analyzing Brier scores, hit rates, and performance across different time horizons.',
    category: 'comparison',
    tags: ['polymarket', 'kalshi', 'accuracy', 'comparison', 'brier-score'],
    generateContent: (metrics) => {
      const polymarket = getSourceData(metrics, 'polymarket');
      const kalshi = getSourceData(metrics, 'kalshi');

      const polyBrier = polymarket ? formatBrier(polymarket.averageBrierScore) : 'N/A';
      const polyHitRate = polymarket ? formatPct(polymarket.hitRate) : 'N/A';
      const polyCount = polymarket?.resolvedCount || 0;

      const kalshiBrier = kalshi ? formatBrier(kalshi.averageBrierScore) : 'N/A';
      const kalshiHitRate = kalshi ? formatPct(kalshi.hitRate) : 'N/A';
      const kalshiCount = kalshi?.resolvedCount || 0;

      const winner =
        polymarket && kalshi
          ? polymarket.averageBrierScore < kalshi.averageBrierScore
            ? 'Polymarket'
            : 'Kalshi'
          : 'Undetermined';

      return `
## Key Findings

Our analysis of ${metrics.overall.totalResolved} resolved prediction markets reveals clear patterns in accuracy between the two major platforms:

- **Polymarket**: ${polyBrier} Brier score, ${polyHitRate} hit rate across ${polyCount} markets
- **Kalshi**: ${kalshiBrier} Brier score, ${kalshiHitRate} hit rate across ${kalshiCount} markets

${winner !== 'Undetermined' ? `**Winner: ${winner}** demonstrates superior accuracy based on Brier scores.` : ''}

## What Is Brier Score?

The Brier score measures the accuracy of probabilistic predictions. It ranges from 0 to 1, where:
- **0** = Perfect prediction
- **0.25** = Random guessing on a binary outcome
- **1** = Completely wrong

A lower Brier score indicates better calibration between predicted probabilities and actual outcomes.

## Hit Rate Explained

Hit rate measures how often the market's favorite outcome (probability > 50%) actually occurred. While intuitive, it doesn't capture the full picture of prediction quality—a market predicting 51% on every outcome would have a mediocre Brier score despite potentially high hit rate.

## Accuracy by Time Horizon

Markets become more accurate as they approach resolution. Here's how each platform performs at different time horizons:

${formatHorizonComparison(polymarket?.byHorizon || [], kalshi?.byHorizon || [])}

## Why the Difference?

Several factors contribute to accuracy differences between platforms:

1. **Market Structure**: Kalshi uses CFTC-regulated contracts while Polymarket operates with crypto-based predictions
2. **Liquidity**: Higher volume markets tend to have better price discovery
3. **Participant Base**: Different trader demographics bring different information sources
4. **Market Types**: Each platform specializes in different event categories

## Conclusion

Both platforms demonstrate strong predictive capabilities, with Brier scores well below the 0.25 random-guessing threshold. For individual predictions, consider checking both platforms and looking for consensus or divergence in their probabilities.

---

*Data updated: ${new Date().toLocaleDateString()}. Analysis based on ${metrics.overall.totalResolved} resolved markets.*
`;
    },
    generateStats: (metrics) => {
      const polymarket = getSourceData(metrics, 'polymarket');
      const kalshi = getSourceData(metrics, 'kalshi');
      return [
        { label: 'Total Markets', value: metrics.overall.totalResolved.toString() },
        { label: 'Polymarket Brier', value: polymarket ? formatBrier(polymarket.averageBrierScore) : 'N/A' },
        { label: 'Kalshi Brier', value: kalshi ? formatBrier(kalshi.averageBrierScore) : 'N/A' },
        { label: 'Overall Hit Rate', value: formatPct(metrics.overall.hitRate) },
      ];
    },
    getRelatedTickers: () => [],
  },

  // Template 2: Earnings Accuracy
  {
    slug: 'prediction-market-earnings-accuracy-2026',
    title: 'How Accurate Are Prediction Markets for Earnings? 2026 Analysis',
    excerpt:
      'Analyzing prediction market performance on earnings-related events. Which companies have the most accurate predictions? Where do markets struggle?',
    category: 'accuracy',
    tags: ['earnings', 'accuracy', 'analysis', 'stocks'],
    generateContent: (metrics) => {
      const topCompanies = getTopCompanies(metrics, 5);
      const totalResolved = metrics.overall.totalResolved;
      const hitRate = formatPct(metrics.overall.hitRate);

      return `
## Overview

We analyzed ${totalResolved} earnings-related prediction markets with an overall ${hitRate} accuracy rate. Here's what the data reveals about prediction market performance for corporate earnings events.

## Best Performing Companies

Markets for these companies showed the highest prediction accuracy:

${topCompanies
  .map(
    (c, i) =>
      `${i + 1}. **${c.companyName}** (${c.ticker}) - ${formatBrier(c.averageBrierScore)} Brier, ${formatPct(c.hitRate)} hit rate (${c.resolvedCount} markets)`
  )
  .join('\n')}

## Accuracy by Sector

${metrics.bySector
  .filter((s) => s.resolvedCount >= 2)
  .sort((a, b) => a.averageBrierScore - b.averageBrierScore)
  .slice(0, 5)
  .map((s) => `- **${s.sector}**: ${formatBrier(s.averageBrierScore)} Brier score (${s.resolvedCount} markets)`)
  .join('\n')}

## Why Earnings Markets?

Earnings prediction markets are particularly interesting because:

1. **Clear Resolution**: Earnings results provide unambiguous outcomes
2. **Information Aggregation**: Markets synthesize analyst estimates, insider sentiment, and macro factors
3. **High Stakes**: Significant trading volume ensures price discovery

## Common Patterns

Markets tend to be most accurate when:
- The company has high analyst coverage
- Recent price action provides directional signals
- Earnings surprise history is consistent

Markets struggle when:
- Companies have volatile earnings history
- Guidance has been inconsistent
- Sector-wide uncertainty exists

## Conclusion

Prediction markets demonstrate strong accuracy for earnings events, outperforming random chance significantly. The best markets to follow are those for large-cap companies with consistent earnings patterns.

---

*Analysis based on ${totalResolved} resolved markets. Data refreshed ${new Date().toLocaleDateString()}.*
`;
    },
    generateStats: (metrics) => {
      const topCompany = getTopCompanies(metrics, 1)[0];
      return [
        { label: 'Markets Analyzed', value: metrics.overall.totalResolved.toString() },
        { label: 'Overall Hit Rate', value: formatPct(metrics.overall.hitRate) },
        { label: 'Avg Brier Score', value: formatBrier(metrics.overall.averageBrierScore) },
        { label: 'Top Performer', value: topCompany?.ticker || 'N/A' },
      ];
    },
    getRelatedTickers: (metrics) => getTopCompanies(metrics, 5).map((c) => c.ticker),
  },

  // Template 3: Top Performing Markets
  {
    slug: 'top-performing-prediction-markets',
    title: 'Top Performing Prediction Markets: Where Accuracy Shines',
    excerpt:
      'Discover which prediction markets consistently demonstrate the highest accuracy. Analysis of companies, sectors, and conditions that produce reliable predictions.',
    category: 'analysis',
    tags: ['top-performers', 'accuracy', 'analysis'],
    generateContent: (metrics) => {
      const topCompanies = getTopCompanies(metrics, 10);
      const bestSectors = [...metrics.bySector]
        .filter((s) => s.resolvedCount >= 2)
        .sort((a, b) => a.averageBrierScore - b.averageBrierScore)
        .slice(0, 5);

      return `
## Standout Performers

Some prediction markets consistently outperform others. Here are the companies and sectors where market predictions prove most reliable.

## Top Companies by Accuracy

${topCompanies
  .map(
    (c, i) =>
      `### ${i + 1}. ${c.companyName} (${c.ticker})
- **Brier Score**: ${formatBrier(c.averageBrierScore)}
- **Hit Rate**: ${formatPct(c.hitRate)}
- **Markets Resolved**: ${c.resolvedCount}
- **Sector**: ${c.sector}`
  )
  .join('\n\n')}

## Best Performing Sectors

${bestSectors
  .map(
    (s, i) =>
      `${i + 1}. **${s.sector}** - ${formatBrier(s.averageBrierScore)} Brier score with ${formatPct(s.hitRate)} hit rate`
  )
  .join('\n')}

## What Makes These Markets Accurate?

Several factors contribute to consistently accurate predictions:

1. **High Liquidity**: More traders means better information aggregation
2. **Clear Criteria**: Unambiguous resolution conditions reduce noise
3. **Frequent Events**: Regular earnings cycles provide learning opportunities
4. **Analyst Coverage**: Professional coverage adds informed traders

## Volume vs Accuracy

${metrics.byVolume
  .map((v) => `- **${v.bucket}**: ${formatBrier(v.averageBrierScore)} Brier score (${v.resolvedCount} markets)`)
  .join('\n')}

Higher volume markets generally show better accuracy due to improved price discovery.

## Implications for Traders

Focus on markets where:
- Historical accuracy is strong
- Trading volume is substantial
- Resolution criteria are clear
- The company/sector has established patterns

---

*Updated ${new Date().toLocaleDateString()}. Based on ${metrics.overall.totalResolved} resolved markets.*
`;
    },
    generateStats: (metrics) => {
      const topCompany = getTopCompanies(metrics, 1)[0];
      const bestSector = [...metrics.bySector]
        .filter((s) => s.resolvedCount >= 2)
        .sort((a, b) => a.averageBrierScore - b.averageBrierScore)[0];
      return [
        { label: 'Top Company', value: topCompany?.ticker || 'N/A' },
        { label: 'Best Sector', value: bestSector?.sector || 'N/A' },
        { label: 'Avg Accuracy', value: formatPct(metrics.overall.hitRate) },
        { label: 'Total Markets', value: metrics.overall.totalResolved.toString() },
      ];
    },
    getRelatedTickers: (metrics) => getTopCompanies(metrics, 5).map((c) => c.ticker),
  },

  // Template 4: Where Markets Got It Wrong
  {
    slug: 'where-prediction-markets-got-it-wrong',
    title: 'Where Prediction Markets Got It Wrong: Lessons from Mispredictions',
    excerpt:
      'Examining cases where prediction markets failed to accurately forecast outcomes. What can we learn from these misses?',
    category: 'insights',
    tags: ['analysis', 'accuracy', 'lessons'],
    generateContent: (metrics) => {
      const worstCompanies = getWorstCompanies(metrics, 5);

      return `
## Learning from Mistakes

Prediction markets aren't perfect. Analyzing where they fail helps us understand their limitations and improve our use of market probabilities.

## Companies with Challenging Predictions

${worstCompanies
  .map(
    (c, i) =>
      `### ${i + 1}. ${c.companyName} (${c.ticker})
- **Brier Score**: ${formatBrier(c.averageBrierScore)}
- **Hit Rate**: ${formatPct(c.hitRate)}
- **Markets Resolved**: ${c.resolvedCount}

Markets for ${c.ticker} showed higher-than-average prediction error, suggesting these outcomes were harder to forecast.`
  )
  .join('\n\n')}

## Common Failure Patterns

Several patterns emerge in markets that underperform:

### 1. Low Liquidity
Markets with minimal trading volume often show poor calibration. Without sufficient price discovery, probabilities don't reflect true information.

### 2. Novel Events
First-time events or unprecedented situations lack historical anchors, making prediction difficult.

### 3. High Volatility Companies
Companies with erratic earnings or unpredictable management tend to generate less accurate predictions.

### 4. Information Asymmetry
When insiders have significantly more information than market participants, predictions suffer.

## Time Horizon Analysis

Predictions further from resolution tend to be less accurate:

${metrics.byHorizon
  .slice(0, 4)
  .map((h) => `- **${h.label}**: ${formatBrier(h.averageBrierScore)} Brier score`)
  .join('\n')}

## Improving Your Use of Market Data

1. **Check volume**: Low-liquidity markets warrant skepticism
2. **Consider context**: Is this an unusual situation?
3. **Look at history**: How have similar markets performed?
4. **Compare sources**: Divergence between platforms may signal uncertainty

## Conclusion

Understanding where prediction markets fail is as valuable as knowing where they succeed. Use this analysis to calibrate your confidence in market probabilities.

---

*Analysis of ${metrics.overall.totalResolved} resolved markets. Data as of ${new Date().toLocaleDateString()}.*
`;
    },
    generateStats: (metrics) => {
      const worstCompany = getWorstCompanies(metrics, 1)[0];
      return [
        { label: 'Markets Analyzed', value: metrics.overall.totalResolved.toString() },
        { label: 'Overall Brier', value: formatBrier(metrics.overall.averageBrierScore) },
        { label: 'Hardest Company', value: worstCompany?.ticker || 'N/A' },
        { label: 'Overall Hit Rate', value: formatPct(metrics.overall.hitRate) },
      ];
    },
    getRelatedTickers: (metrics) => getWorstCompanies(metrics, 5).map((c) => c.ticker),
  },

  // Template 5: Monthly Report
  {
    slug: 'monthly-prediction-market-accuracy-report',
    title: 'Monthly Prediction Market Accuracy Report',
    excerpt:
      'A comprehensive monthly summary of prediction market performance across platforms, sectors, and companies.',
    category: 'analysis',
    tags: ['monthly-report', 'accuracy', 'summary'],
    generateContent: (metrics) => {
      const topCompanies = getTopCompanies(metrics, 3);
      const polymarket = getSourceData(metrics, 'polymarket');
      const kalshi = getSourceData(metrics, 'kalshi');

      return `
## Monthly Summary

This month's analysis covers ${metrics.overall.totalResolved} resolved prediction markets with an overall Brier score of ${formatBrier(metrics.overall.averageBrierScore)} and ${formatPct(metrics.overall.hitRate)} hit rate.

## Platform Performance

| Platform | Brier Score | Hit Rate | Markets |
|----------|-------------|----------|---------|
| Polymarket | ${polymarket ? formatBrier(polymarket.averageBrierScore) : 'N/A'} | ${polymarket ? formatPct(polymarket.hitRate) : 'N/A'} | ${polymarket?.resolvedCount || 0} |
| Kalshi | ${kalshi ? formatBrier(kalshi.averageBrierScore) : 'N/A'} | ${kalshi ? formatPct(kalshi.hitRate) : 'N/A'} | ${kalshi?.resolvedCount || 0} |

## Top Performers This Month

${topCompanies.map((c) => `- **${c.ticker}**: ${formatBrier(c.averageBrierScore)} Brier score`).join('\n')}

## Sector Breakdown

${metrics.bySector
  .filter((s) => s.resolvedCount >= 1)
  .sort((a, b) => b.resolvedCount - a.resolvedCount)
  .slice(0, 5)
  .map((s) => `- **${s.sector}**: ${s.resolvedCount} markets, ${formatPct(s.hitRate)} accuracy`)
  .join('\n')}

## Horizon Accuracy

How accuracy improves as markets approach resolution:

${metrics.byHorizon.map((h) => `- **${h.label}**: ${formatBrier(h.averageBrierScore)} Brier (${h.sampleSize} samples)`).join('\n')}

## Key Takeaways

1. Overall market accuracy remains ${metrics.overall.averageBrierScore < 0.15 ? 'strong' : 'moderate'} with Brier scores well below random chance
2. ${polymarket && kalshi ? (polymarket.averageBrierScore < kalshi.averageBrierScore ? 'Polymarket' : 'Kalshi') + ' leads in accuracy this period' : 'Both platforms performing comparably'}
3. Higher volume markets continue to show better calibration
4. Accuracy improves significantly as resolution approaches

## Looking Ahead

Monitor markets for ${topCompanies.map((c) => c.ticker).join(', ')} which have shown consistent accuracy. Be cautious with low-volume markets and novel event types.

---

*Report generated ${new Date().toLocaleDateString()}. Data reflects all resolved markets in the analysis period.*
`;
    },
    generateStats: (metrics) => {
      return [
        { label: 'Total Markets', value: metrics.overall.totalResolved.toString() },
        { label: 'Avg Brier', value: formatBrier(metrics.overall.averageBrierScore) },
        { label: 'Hit Rate', value: formatPct(metrics.overall.hitRate) },
        { label: 'Companies Tracked', value: metrics.byCompany.length.toString() },
      ];
    },
    getRelatedTickers: (metrics) => getTopCompanies(metrics, 5).map((c) => c.ticker),
  },
];

/**
 * Format horizon comparison table
 */
function formatHorizonComparison(polyHorizons: HorizonAccuracy[], kalshiHorizons: HorizonAccuracy[]): string {
  if (polyHorizons.length === 0 && kalshiHorizons.length === 0) {
    return '*Horizon data not available*';
  }

  const horizonLabels = ['14 days', '10 days', '7 days', '2 days', '1 day', '12 hours'];
  const polyMap = new Map(polyHorizons.map((h) => [h.label, h]));
  const kalshiMap = new Map(kalshiHorizons.map((h) => [h.label, h]));

  let table = '| Horizon | Polymarket | Kalshi |\n';
  table += '|---------|------------|--------|\n';

  for (const label of horizonLabels) {
    const poly = polyMap.get(label);
    const kalshi = kalshiMap.get(label);
    table += `| ${label} | ${poly ? formatBrier(poly.averageBrierScore) : 'N/A'} | ${kalshi ? formatBrier(kalshi.averageBrierScore) : 'N/A'} |\n`;
  }

  return table;
}

/**
 * Generate all blog posts from templates using live accuracy data
 */
export function generateBlogPosts(metrics: AccuracyMetrics): Omit<BlogPost, 'id'>[] {
  const now = new Date().toISOString();

  return BLOG_TEMPLATES.map((template) => ({
    slug: template.slug,
    title: template.title,
    excerpt: template.excerpt,
    content: template.generateContent(metrics),
    publishedAt: now,
    updatedAt: now,
    tags: template.tags,
    category: template.category,
    featuredStats: template.generateStats(metrics),
    relatedTickers: template.getRelatedTickers(metrics),
    relatedMarketSlugs: [],
    status: 'published' as const,
  }));
}

/**
 * Get all available blog templates
 */
export function getBlogTemplates(): BlogTemplate[] {
  return BLOG_TEMPLATES;
}
