import {
  generateSitemapXml,
  createXmlResponse,
  normalizeUrl,
  type SitemapUrl,
} from '@/lib/sitemap-utils';
import { COMPANY_MAPPINGS } from '@/lib/sector-mapping';

/**
 * Companies sitemap - includes all company detail pages.
 *
 * lastmod is omitted because:
 * - Company page content depends on live market data and accuracy stats
 * - We don't have reliable SSR access to accuracy update timestamps
 * - Omitting lastmod is better than providing misleading values
 *
 * Future enhancement: Add lastmod once we have reliable timestamps
 * for when company accuracy/markets data actually changed.
 */
export async function GET() {
  // Get all companies from static mappings
  // Note: This doesn't include dynamically discovered companies that only
  // exist in Firestore. Those pages work but won't be in sitemap until
  // we can reliably access Firestore during sitemap generation.
  const companyUrls: SitemapUrl[] = COMPANY_MAPPINGS.map((company) => ({
    loc: normalizeUrl(`/companies/${company.ticker}`),
    // lastmod omitted - no reliable content change timestamp
  }));

  const xml = generateSitemapXml(companyUrls);
  return createXmlResponse(xml);
}
