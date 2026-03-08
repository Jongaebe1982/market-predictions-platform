import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BlogCard } from '@/components/blog/BlogCard';
import { Badge } from '@/components/ui/Badge';
import { ItemListJsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export const metadata: Metadata = {
  title: 'Prediction Market Insights & Analysis | Market Predictions Blog',
  description:
    'Explore in-depth analysis of prediction market accuracy, Polymarket vs Kalshi comparisons, earnings prediction performance, and market insights backed by real data.',
  openGraph: {
    title: 'Prediction Market Insights & Analysis',
    description:
      'Explore in-depth analysis of prediction market accuracy, comparisons, and data-driven insights.',
    type: 'website',
  },
};

const POSTS_PER_PAGE = 9;

const categories = [
  { id: 'all', label: 'All Posts' },
  { id: 'comparison', label: 'Comparisons' },
  { id: 'accuracy', label: 'Accuracy' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'insights', label: 'Insights' },
];

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const { posts, total, hasMore } = await getBlogPosts(page, POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Prediction Market Insights & Analysis
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Data-driven analysis of prediction market performance. Compare Polymarket vs Kalshi
          accuracy, explore earnings prediction trends, and discover which markets get it right.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={cat.id === 'all' ? 'default' : 'muted'}
            className="cursor-pointer hover:opacity-80"
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
          <p className="text-gray-600">
            Check back soon for insights and analysis on prediction market performance.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4">
            {page > 1 && (
              <Link
                href={`/blog?page=${page - 1}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil(total / POSTS_PER_PAGE)}
            </span>
            {hasMore && (
              <Link
                href={`/blog?page=${page + 1}`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
              </Link>
            )}
          </div>
        </>
      )}

      {/* Sidebar content for SEO */}
      <div className="mt-16 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          About Our Prediction Market Analysis
        </h2>
        <div className="prose prose-gray max-w-none">
          <p>
            Our blog provides data-driven insights into prediction market performance. We analyze
            accuracy metrics from major platforms including{' '}
            <Link href="/sources/polymarket" className="text-blue-600 hover:underline">
              Polymarket
            </Link>{' '}
            and{' '}
            <Link href="/sources/kalshi" className="text-blue-600 hover:underline">
              Kalshi
            </Link>
            , track earnings prediction outcomes, and identify trends in market calibration.
          </p>
          <p>
            Explore our{' '}
            <Link href="/analytics" className="text-blue-600 hover:underline">
              analytics dashboard
            </Link>{' '}
            for real-time accuracy metrics, or visit our{' '}
            <Link href="/methodology" className="text-blue-600 hover:underline">
              methodology page
            </Link>{' '}
            to learn how we calculate Brier scores and hit rates.
          </p>
        </div>
      </div>

      {/* JSON-LD */}
      {posts.length > 0 && (
        <ItemListJsonLd
          name="Prediction Market Blog"
          description="Analysis and insights on prediction market accuracy and performance"
          items={posts.map((post) => ({
            name: post.title,
            url: `https://predictionmarketanalytics.io/blog/${post.slug}`,
            description: post.excerpt,
          }))}
        />
      )}
    </div>
  );
}
