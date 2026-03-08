import { NextResponse } from 'next/server';
import { getAccuracyMetricsWithFallback } from '@/lib/accuracy-compute';
import { generateBlogPosts } from '@/lib/blog-generator';
import { saveBlogPost } from '@/lib/blog';

/**
 * Admin endpoint to seed initial blog posts.
 * This is a one-time operation to populate the blog with initial content.
 *
 * POST /api/admin/seed-blog
 *
 * For development/testing, set NODE_ENV=development to skip auth.
 * In production, requires CRON_SECRET header.
 */
export async function POST(request: Request) {
  try {
    // In production, require cron secret
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;

      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Starting blog seeding...');

    // Fetch latest accuracy metrics
    const metrics = await getAccuracyMetricsWithFallback();

    if (metrics.overall.totalResolved === 0) {
      return NextResponse.json({
        success: false,
        message: 'No accuracy data available. Run accuracy computation first.',
      });
    }

    // Generate blog posts from templates
    const posts = generateBlogPosts(metrics);

    console.log(`Generated ${posts.length} blog posts`);

    // Save each post
    const results = await Promise.all(
      posts.map(async (post) => {
        try {
          const id = await saveBlogPost(post);
          console.log(`Saved post: ${post.slug} (${id})`);
          return { slug: post.slug, id, status: 'success' };
        } catch (error) {
          console.error(`Error saving post ${post.slug}:`, error);
          return { slug: post.slug, status: 'error', error: String(error) };
        }
      })
    );

    const successCount = results.filter((r) => r.status === 'success').length;

    return NextResponse.json({
      success: true,
      message: `Seeded ${successCount} blog posts`,
      results,
    });
  } catch (error) {
    console.error('Blog seeding failed:', error);
    return NextResponse.json(
      { error: 'Blog seeding failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/seed-blog',
    method: 'POST',
    description: 'Seeds initial blog posts from accuracy data',
    note: 'In development, no auth required. In production, requires ADMIN_SECRET bearer token.',
  });
}
