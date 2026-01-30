const BASE_URL = 'https://predictionmarketanalytics.io';

// Minimum description length for Dataset schema (Google requires 50-5000 chars)
const MIN_DESCRIPTION_LENGTH = 50;

// Ensures description meets minimum length requirement for structured data
function ensureMinDescriptionLength(description: string, fallbackContext?: string): string {
  if (description.length >= MIN_DESCRIPTION_LENGTH) {
    return description;
  }
  // Pad with additional context to meet minimum length
  const padding = fallbackContext
    ? ` ${fallbackContext}`
    : ' View real-time probability data, historical trends, and market analytics.';
  const padded = description + padding;
  // If still too short, add more generic context
  if (padded.length < MIN_DESCRIPTION_LENGTH) {
    return padded + ' Track prediction market performance and accuracy metrics.';
  }
  return padded;
}

// WebSite JSON-LD for home page
interface WebSiteJsonLdProps {
  name?: string;
  description?: string;
}

export function WebSiteJsonLd({
  name = 'Market Predictions',
  description = 'Stock and earnings prediction market tracker with accuracy scoring',
}: WebSiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/markets?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Organization JSON-LD for company pages
interface OrganizationJsonLdProps {
  name: string;
  ticker: string;
  description?: string;
}

export function OrganizationJsonLd({
  name,
  ticker,
  description,
}: OrganizationJsonLdProps) {
  const baseDescription = description || `Prediction market data for ${name} (${ticker})`;
  const safeDescription = ensureMinDescriptionLength(
    baseDescription,
    `Track prediction markets, accuracy scores, and historical performance data.`
  );
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    tickerSymbol: ticker,
    description: safeDescription,
    url: `${BASE_URL}/companies/${ticker}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Dataset JSON-LD for market pages
interface MarketDatasetJsonLdProps {
  name: string;
  description: string;
  slug: string;
  source: string;
  dateCreated?: string;
  dateModified?: string;
}

export function MarketDatasetJsonLd({
  name,
  description,
  slug,
  source,
  dateCreated,
  dateModified,
}: MarketDatasetJsonLdProps) {
  const sourceName = source === 'polymarket' ? 'Polymarket' : 'Kalshi';
  const safeDescription = ensureMinDescriptionLength(
    description,
    `Track this prediction market on ${sourceName} with real-time probability updates and historical price data.`
  );
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description: safeDescription,
    url: `${BASE_URL}/markets/${slug}`,
    creator: {
      '@type': 'Organization',
      name: source === 'polymarket' ? 'Polymarket' : 'Kalshi',
    },
    distribution: {
      '@type': 'DataDownload',
      contentUrl: `${BASE_URL}/markets/${slug}`,
      encodingFormat: 'text/html',
    },
    ...(dateCreated && { dateCreated }),
    ...(dateModified && { dateModified }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// FAQ JSON-LD for methodology/glossary pages
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  items: FAQItem[];
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ItemList JSON-LD for directory pages
interface ItemListJsonLdProps {
  name: string;
  description: string;
  items: Array<{
    name: string;
    url: string;
    description?: string;
  }>;
}

export function ItemListJsonLd({ name, description, items }: ItemListJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: item.name,
        url: item.url,
        description: item.description,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
