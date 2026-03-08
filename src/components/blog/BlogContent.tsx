import Link from 'next/link';

interface BlogContentProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with internal link replacement.
 * - Stock tickers (e.g., AAPL, TSLA) are linked to /companies/[ticker]
 * - Market slugs in [[slug]] format are linked to /markets/[slug]
 */
export function BlogContent({ content, className }: BlogContentProps) {
  const processedContent = processContent(content);

  return (
    <div
      className={`prose prose-gray max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

/**
 * Process markdown content and convert to HTML with internal links
 */
function processContent(content: string): string {
  let html = markdownToHtml(content);

  // Replace stock ticker mentions with links
  // Pattern: standalone uppercase letters 2-5 chars (not already in a link)
  // Skip if inside an HTML tag or already linked
  html = html.replace(
    /(?<![<\/a-zA-Z"])(?<!=")(?<!\/)(?<![>\w])\b([A-Z]{2,5})\b(?![^<]*>)(?!<\/a)/g,
    (match, ticker) => {
      // Common false positives to skip
      const skipWords = new Set([
        'CEO',
        'CFO',
        'CTO',
        'COO',
        'IPO',
        'ETF',
        'SEC',
        'API',
        'USD',
        'EUR',
        'GDP',
        'FAQ',
        'PDF',
        'USA',
        'FBI',
        'CIA',
        'NASA',
        'HTML',
        'CSS',
        'JSON',
        'HTTP',
        'HTTPS',
        'AWS',
        'GCP',
        'VPN',
        'IoT',
      ]);
      if (skipWords.has(ticker)) return match;

      // Known tickers to link (this could be expanded or fetched from a list)
      const knownTickers = new Set([
        'AAPL',
        'MSFT',
        'GOOGL',
        'GOOG',
        'AMZN',
        'META',
        'TSLA',
        'NVDA',
        'AMD',
        'INTC',
        'NFLX',
        'DIS',
        'PYPL',
        'SQ',
        'SHOP',
        'UBER',
        'LYFT',
        'ABNB',
        'COIN',
        'HOOD',
        'SNAP',
        'PINS',
        'TWTR',
        'SPOT',
        'ZM',
        'DOCU',
        'CRM',
        'ORCL',
        'IBM',
        'HPE',
        'DELL',
        'BA',
        'LMT',
        'RTX',
        'NOC',
        'GD',
        'GE',
        'HON',
        'MMM',
        'CAT',
        'DE',
        'UNH',
        'JNJ',
        'PFE',
        'MRNA',
        'ABBV',
        'LLY',
        'MRK',
        'BMY',
        'GILD',
        'BIIB',
        'AMGN',
        'V',
        'MA',
        'JPM',
        'BAC',
        'GS',
        'MS',
        'C',
        'WFC',
        'USB',
        'AXP',
        'BLK',
        'SCHW',
        'WMT',
        'TGT',
        'COST',
        'HD',
        'LOW',
        'MCD',
        'SBUX',
        'NKE',
        'LULU',
        'KO',
        'PEP',
        'PG',
        'CL',
        'UL',
        'XOM',
        'CVX',
        'COP',
        'OXY',
        'BP',
        'SHEL',
        'T',
        'VZ',
        'TMUS',
        'CMCSA',
        'CHTR',
      ]);

      if (knownTickers.has(ticker)) {
        return `<a href="/companies/${ticker}" class="text-blue-600 hover:underline font-medium">${ticker}</a>`;
      }

      return match;
    }
  );

  // Replace market slug mentions [[market-slug]] with links
  html = html.replace(/\[\[([a-z0-9-]+)\]\]/g, (_, slug) => {
    return `<a href="/markets/${slug}" class="text-blue-600 hover:underline">view market</a>`;
  });

  return html;
}

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
  );

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc pl-4 my-4">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');

  // Blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>'
  );

  // Code blocks
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4"><code>$2</code></pre>'
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-200" />');

  // Paragraphs (lines not starting with HTML tags)
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<hr')
      ) {
        return trimmed;
      }
      return `<p class="my-4">${trimmed}</p>`;
    })
    .join('\n');

  return html;
}
