/**
 * Sitemap validation tests
 *
 * Run with: npx tsx src/__tests__/sitemap.test.ts
 */

import { strict as assert } from 'assert';
import {
  generateSitemapXml,
  generateSitemapIndexXml,
  formatSitemapDate,
  normalizeUrl,
  SITEMAP_LIMITS,
  type SitemapUrl,
  type SitemapIndexEntry,
} from '../lib/sitemap-utils';

console.log('Running sitemap tests...\n');

// Test: formatSitemapDate
{
  console.log('Test: formatSitemapDate');

  // Valid date
  const result1 = formatSitemapDate(new Date('2025-01-26T12:00:00Z'));
  assert.equal(result1, '2025-01-26', 'Should format date as YYYY-MM-DD');

  // String date
  const result2 = formatSitemapDate('2025-01-26T12:00:00Z');
  assert.equal(result2, '2025-01-26', 'Should handle string dates');

  // Undefined
  const result3 = formatSitemapDate(undefined);
  assert.equal(result3, undefined, 'Should return undefined for undefined input');

  // Invalid date
  const result4 = formatSitemapDate('not-a-date');
  assert.equal(result4, undefined, 'Should return undefined for invalid dates');

  console.log('  ✓ All formatSitemapDate tests passed\n');
}

// Test: normalizeUrl
{
  console.log('Test: normalizeUrl');

  // Path without leading slash
  const result1 = normalizeUrl('/markets');
  assert.equal(result1, 'https://predictionmarketanalytics.io/markets', 'Should add base URL');

  // Remove trailing slash
  const result2 = normalizeUrl('/companies/');
  assert.equal(
    result2,
    'https://predictionmarketanalytics.io/companies',
    'Should remove trailing slash'
  );

  // Root URL keeps as-is
  const result3 = normalizeUrl('/');
  assert.equal(
    result3,
    'https://predictionmarketanalytics.io',
    'Root URL should not have trailing slash'
  );

  console.log('  ✓ All normalizeUrl tests passed\n');
}

// Test: generateSitemapXml - no changefreq or priority
{
  console.log('Test: generateSitemapXml - no changefreq or priority');

  const urls: SitemapUrl[] = [
    { loc: 'https://example.com/page1', lastmod: '2025-01-26' },
    { loc: 'https://example.com/page2' },
  ];

  const xml = generateSitemapXml(urls);

  // Should contain urlset
  assert.ok(xml.includes('<urlset'), 'Should contain urlset element');
  assert.ok(
    xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'),
    'Should have correct namespace'
  );

  // Should contain URLs
  assert.ok(xml.includes('<loc>https://example.com/page1</loc>'), 'Should contain first URL');
  assert.ok(xml.includes('<loc>https://example.com/page2</loc>'), 'Should contain second URL');

  // Should contain lastmod only for first URL
  assert.ok(xml.includes('<lastmod>2025-01-26</lastmod>'), 'Should contain lastmod for first URL');

  // Should NOT contain changefreq or priority
  assert.ok(!xml.includes('<changefreq>'), 'Should NOT contain changefreq');
  assert.ok(!xml.includes('<priority>'), 'Should NOT contain priority');

  console.log('  ✓ No changefreq or priority in output\n');
}

// Test: generateSitemapXml - XML validity
{
  console.log('Test: generateSitemapXml - XML validity');

  const urls: SitemapUrl[] = [
    { loc: 'https://example.com/page1', lastmod: '2025-01-26' },
  ];

  const xml = generateSitemapXml(urls);

  // Check XML declaration
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Should have XML declaration');

  // Check proper closing tags
  assert.ok(xml.includes('</urlset>'), 'Should close urlset');
  assert.ok(xml.includes('</url>'), 'Should close url');
  assert.ok(xml.includes('</loc>'), 'Should close loc');

  console.log('  ✓ XML structure is valid\n');
}

// Test: generateSitemapXml - XML escaping
{
  console.log('Test: generateSitemapXml - XML escaping');

  const urls: SitemapUrl[] = [
    { loc: 'https://example.com/search?q=test&page=1' },
  ];

  const xml = generateSitemapXml(urls);

  // Should escape ampersand
  assert.ok(xml.includes('&amp;'), 'Should escape ampersand');
  assert.ok(!xml.includes('?q=test&page'), 'Should not contain unescaped ampersand');

  console.log('  ✓ XML escaping works correctly\n');
}

// Test: generateSitemapIndexXml
{
  console.log('Test: generateSitemapIndexXml');

  const sitemaps: SitemapIndexEntry[] = [
    { loc: 'https://example.com/sitemap-static.xml' },
    { loc: 'https://example.com/sitemap-markets.xml', lastmod: '2025-01-26' },
  ];

  const xml = generateSitemapIndexXml(sitemaps);

  // Should contain sitemapindex
  assert.ok(xml.includes('<sitemapindex'), 'Should contain sitemapindex element');
  assert.ok(
    xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'),
    'Should have correct namespace'
  );

  // Should contain sitemap elements
  assert.ok(xml.includes('<sitemap>'), 'Should contain sitemap elements');
  assert.ok(xml.includes('</sitemap>'), 'Should close sitemap elements');

  // Should NOT contain changefreq or priority
  assert.ok(!xml.includes('<changefreq>'), 'Should NOT contain changefreq');
  assert.ok(!xml.includes('<priority>'), 'Should NOT contain priority');

  console.log('  ✓ Sitemap index structure is valid\n');
}

// Test: SITEMAP_LIMITS
{
  console.log('Test: SITEMAP_LIMITS');

  assert.equal(SITEMAP_LIMITS.MAX_URLS, 50000, 'Max URLs should be 50000');
  assert.equal(SITEMAP_LIMITS.MAX_SIZE_BYTES, 50 * 1024 * 1024, 'Max size should be 50MB');

  console.log('  ✓ Sitemap limits are correct\n');
}

// Test: Sharding calculation
{
  console.log('Test: Sharding calculation');

  // Less than limit - no sharding
  const count1 = 1000;
  const shards1 = Math.ceil(count1 / SITEMAP_LIMITS.MAX_URLS);
  assert.equal(shards1, 1, '1000 URLs should need 1 shard');

  // Exactly at limit
  const count2 = 50000;
  const shards2 = Math.ceil(count2 / SITEMAP_LIMITS.MAX_URLS);
  assert.equal(shards2, 1, '50000 URLs should need 1 shard');

  // Over limit
  const count3 = 50001;
  const shards3 = Math.ceil(count3 / SITEMAP_LIMITS.MAX_URLS);
  assert.equal(shards3, 2, '50001 URLs should need 2 shards');

  // Large number
  const count4 = 150000;
  const shards4 = Math.ceil(count4 / SITEMAP_LIMITS.MAX_URLS);
  assert.equal(shards4, 3, '150000 URLs should need 3 shards');

  console.log('  ✓ Sharding calculation is correct\n');
}

console.log('✅ All sitemap tests passed!');
