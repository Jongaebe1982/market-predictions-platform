import {
  generateSitemapXml,
  createXmlResponse,
  normalizeUrl,
  type SitemapUrl,
} from '@/lib/sitemap-utils';

// Static content - we omit lastmod because these pages don't have
// meaningful content change timestamps. Google prefers no lastmod
// over inaccurate lastmod values.
export async function GET() {
  const staticUrls: SitemapUrl[] = [
    // High-value hub pages
    { loc: normalizeUrl('/') },
    { loc: normalizeUrl('/markets') },
    { loc: normalizeUrl('/companies') },
    { loc: normalizeUrl('/analytics') },
    { loc: normalizeUrl('/blog') },

    // Source pages
    { loc: normalizeUrl('/sources/polymarket') },
    { loc: normalizeUrl('/sources/kalshi') },

    // Informational pages
    { loc: normalizeUrl('/methodology') },
    { loc: normalizeUrl('/glossary') },
    { loc: normalizeUrl('/about') },

    // Note: /coming-soon excluded - thin/placeholder content
  ];

  const xml = generateSitemapXml(staticUrls);
  return createXmlResponse(xml);
}
