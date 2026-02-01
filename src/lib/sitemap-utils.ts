/**
 * Sitemap generation utilities following Google best practices.
 * - No <changefreq> or <priority> tags (Google ignores these)
 * - Only include <lastmod> when we have meaningful, accurate timestamps
 * - Follow sitemaps.org schema
 */

const BASE_URL = 'https://predictionmarketanalytics.io';

export interface SitemapUrl {
  loc: string;
  lastmod?: string; // ISO 8601 format (YYYY-MM-DD or full datetime)
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

/**
 * Format a date for sitemap lastmod (YYYY-MM-DD format)
 */
export function formatSitemapDate(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().split('T')[0];
}

/**
 * Generate XML for a sitemap with URL entries
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      const lastmodTag = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
      return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${lastmodTag}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate XML for a sitemap index
 */
export function generateSitemapIndexXml(sitemaps: SitemapIndexEntry[]): string {
  const sitemapEntries = sitemaps
    .map((sitemap) => {
      const lastmodTag = sitemap.lastmod ? `\n    <lastmod>${sitemap.lastmod}</lastmod>` : '';
      return `  <sitemap>\n    <loc>${escapeXml(sitemap.loc)}</loc>${lastmodTag}\n  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create XML response with proper headers
 */
export function createXmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

/**
 * Google sitemap limits
 */
export const SITEMAP_LIMITS = {
  MAX_URLS: 50000,
  MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
};

/**
 * Normalize URL to ensure consistent format
 * - Always HTTPS
 * - No trailing slash (except for root)
 */
export function normalizeUrl(path: string): string {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  // Remove trailing slash except for root
  if (url !== BASE_URL && url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}

export { BASE_URL };
