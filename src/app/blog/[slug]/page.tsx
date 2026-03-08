import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBlogPost, getRelatedPosts } from '@/lib/blog';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogStats } from '@/components/blog/BlogStats';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ArticleJsonLd } from '@/components/seo/JsonLd';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const description = post.excerpt.slice(0, 160);

  return {
    title: `${post.title} | Market Predictions Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.slug, post.tags, post.category, 3);

  const categoryColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
    comparison: 'default',
    accuracy: 'success',
    analysis: 'info',
    insights: 'warning',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={categoryColors[post.category] || 'default'}>
                {post.category}
              </Badge>
              <span className="text-sm text-gray-500">
                Published {formatDate(post.publishedAt)}
              </span>
              {post.updatedAt !== post.publishedAt && (
                <span className="text-sm text-gray-400">
                  (Updated {formatDate(post.updatedAt)})
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-lg text-gray-600">{post.excerpt}</p>
          </header>

          {/* Featured stats */}
          {post.featuredStats.length > 0 && (
            <BlogStats stats={post.featuredStats} className="mb-8" />
          )}

          {/* Content */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <BlogContent content={post.content} />
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related tickers */}
          {post.relatedTickers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Companies Mentioned
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.relatedTickers.map((ticker) => (
                  <Link key={ticker} href={`/companies/${ticker}`}>
                    <Badge variant="info" className="cursor-pointer hover:opacity-80">
                      {ticker}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to all posts
            </Link>
            <Link
              href="/analytics"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View analytics dashboard →
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related posts */}
          <RelatedPosts posts={relatedPosts} />

          {/* Quick links */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore More</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/analytics"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Analytics Dashboard →
                </Link>
                <Link
                  href="/markets"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Browse Markets →
                </Link>
                <Link
                  href="/methodology"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Our Methodology →
                </Link>
                <Link
                  href="/sources/polymarket"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Polymarket Data →
                </Link>
                <Link
                  href="/sources/kalshi"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Kalshi Data →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* JSON-LD */}
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        tags={post.tags}
      />
    </div>
  );
}
