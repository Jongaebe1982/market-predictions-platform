import { getAllBlogSlugs } from '@/lib/blog';
import {
  generateSitemapXml,
  createXmlResponse,
  normalizeUrl,
  formatSitemapDate,
  type SitemapUrl,
} from '@/lib/sitemap-utils';

export async function GET() {
  try {
    const blogPosts = await getAllBlogSlugs();

    const urls: SitemapUrl[] = [
      // Blog listing page
      { loc: normalizeUrl('/blog') },
      // Individual blog posts
      ...blogPosts.map((post) => ({
        loc: normalizeUrl(`/blog/${post.slug}`),
        lastmod: formatSitemapDate(post.updatedAt),
      })),
    ];

    const xml = generateSitemapXml(urls);
    return createXmlResponse(xml);
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    // Return empty sitemap on error
    const xml = generateSitemapXml([{ loc: normalizeUrl('/blog') }]);
    return createXmlResponse(xml);
  }
}
